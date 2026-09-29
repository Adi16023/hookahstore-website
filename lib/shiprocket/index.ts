const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

// NOTE: no `cache: 'no-store'` on fetch — Cloudflare Workers (compat date
// 2024-09-23) reject the `cache` option. Route handlers using this module are
// force-dynamic, so nothing is cached anyway.

// Module-level token cache — valid for 10 days, refresh after 9
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

    const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket auth failed: ${err}`);
    }

    const data = await res.json() as { token: string };
    if (!data.token) throw new Error('Shiprocket auth response missing token');

    cachedToken = data.token;
    // Cache for 9 days (token valid 10 days)
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

    return cachedToken;
}

export interface ShiprocketCourierOption {
    id: string;
    label: string;
    description: string;
    price: number;
    courierCompanyId: number;
}

export async function getShiprocketRates(
    deliveryPostcode: string,
    weight: number,
): Promise<ShiprocketCourierOption[]> {
    const token = await getToken();
    const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE ?? '600078';

    const params = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        weight: String(weight),
        cod: '0',
    });

    const res = await fetch(`${SHIPROCKET_BASE}/courier/serviceability/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket serviceability failed: ${err}`);
    }

    const data = await res.json() as {
        data?: {
            available_courier_companies?: Array<{
                courier_company_id: number;
                courier_name: string;
                rate: number;
                estimated_delivery_days: string | number;
            }>;
        };
    };

    const couriers = data?.data?.available_courier_companies ?? [];

    return couriers.map(c => ({
        id: String(c.courier_company_id),
        label: c.courier_name,
        description: `Est. ${c.estimated_delivery_days} day(s)`,
        price: c.rate,
        courierCompanyId: c.courier_company_id,
    }));
}

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: string;
}

export interface ShiprocketOrderPayload {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_address_2: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: ShiprocketOrderItem[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

export interface TrackingActivity {
    date: string;
    status: string;
    activity: string;
    location: string;
}

export interface ShiprocketTrackingResult {
    found: boolean;
    currentStatus: string;
    courierName: string;
    awbCode: string;
    origin: string;
    destination: string;
    edd: string | null;
    activities: TrackingActivity[];
}

export async function getShiprocketTracking(orderNumber: string): Promise<ShiprocketTrackingResult> {
    const token = await getToken();
    const orderId = `WC-${orderNumber}`;

    // Step 1: Find the Shiprocket order by our custom order_id
    const searchRes = await fetch(
        `${SHIPROCKET_BASE}/orders?search=${encodeURIComponent(orderId)}&per_page=1&page=1`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!searchRes.ok) throw new Error('Could not search orders');

    const searchData = await searchRes.json() as {
        data?: Array<{
            id: number;
            channel_order_id: string;
            shipments?: Array<{ id: number; awb: string; courier?: { name: string } }> | null;
        }>;
    };

    const orders = searchData?.data ?? [];
    const order = orders.find(o => o.channel_order_id === orderId);

    if (!order) return { found: false, currentStatus: '', courierName: '', awbCode: '', origin: '', destination: '', edd: null, activities: [] };

    const shipment = order.shipments?.[0];
    if (!shipment?.id) return { found: true, currentStatus: 'Order placed — awaiting shipment', courierName: '', awbCode: '', origin: '', destination: '', edd: null, activities: [] };

    // Step 2: Get live tracking for the shipment
    const trackRes = await fetch(
        `${SHIPROCKET_BASE}/courier/track/shipment/${shipment.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!trackRes.ok) throw new Error('Could not fetch tracking data');

    const trackData = await trackRes.json() as {
        tracking_data?: {
            shipment_track?: Array<{
                current_status: string;
                courier_company_id: number;
                awb_code: string;
                origin: string;
                destination: string;
                edd: string | null;
                shipment_track_activities?: TrackingActivity[];
            }>;
            track_activities?: TrackingActivity[];
        };
    };

    const track = trackData?.tracking_data?.shipment_track?.[0];
    if (!track) return { found: true, currentStatus: 'Shipment created', courierName: shipment.courier?.name ?? '', awbCode: shipment.awb ?? '', origin: '', destination: '', edd: null, activities: [] };

    return {
        found: true,
        currentStatus: track.current_status ?? 'In Transit',
        courierName: shipment.courier?.name ?? '',
        awbCode: track.awb_code ?? shipment.awb ?? '',
        origin: track.origin ?? '',
        destination: track.destination ?? '',
        edd: track.edd ?? null,
        activities: track.shipment_track_activities ?? [],
    };
}

export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
    const token = await getToken();

    const res = await fetch(`${SHIPROCKET_BASE}/orders/create/adhoc`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket order creation failed: ${err}`);
    }

    return res.json();
}
