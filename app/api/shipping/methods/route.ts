export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { wcGetCached } from '../../../../lib/woocommerce';




interface WcZone {
    id: number;
    name: string;
    order: number;
}

interface WcZoneMethod {
    instance_id: number;
    title: string;
    method_id: string;
    method_title: string;
    method_description?: string;
    enabled: boolean;
    settings?: {
        cost?: { value: string };
        title?: { value: string };
    };
}

export interface ShippingOption {
    id: string;
    label: string;
    description: string;
    price: number;       // in paise → we display as ₹
    zoneName: string;
}

export async function POST() {

    try {
        // Fetch all zones — cached for 30 minutes (shipping zones rarely change).
        const zones = (await wcGetCached('shipping/zones', 1800)) as WcZone[];

        const results: ShippingOption[] = [];

        await Promise.all(
            zones
                .filter(z => z.id !== 0) // skip "Rest of the world" catch-all
                .map(async (zone) => {
                    // Zone methods also cached for 30 minutes.
                    const methods = (await wcGetCached(`shipping/zones/${zone.id}/methods`, 1800)) as WcZoneMethod[];
                    methods
                        .filter(m => m.enabled)
                        .forEach(m => {
                            const rawCost = m.settings?.cost?.value ?? '0';
                            const numericCost = parseFloat(rawCost) || 0;
                            results.push({
                                id: `${zone.id}-${m.instance_id}`,
                                label: m.settings?.title?.value || m.title || m.method_title,
                                description: zone.name,
                                price: numericCost,
                                zoneName: zone.name,
                            });
                        });
                })
        );

        // Sort by price ascending
        results.sort((a, b) => a.price - b.price);

        return NextResponse.json({ methods: results });
    } catch (err) {
        console.error('[/api/shipping/methods]', err);
        return NextResponse.json({ methods: [], error: 'Failed to fetch shipping methods' }, { status: 500 });
    }
}
