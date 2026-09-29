export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '../../../../lib/auth/index';

const WC_URL = process.env.WOOCOMMERCE_URL ?? '';
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY ?? '';
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? '';

function wcAuthHeader() {
    return 'Basic ' + btoa(`${CK}:${CS}`);
}

async function getSession() {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

/* ── GET /api/account/addresses ── */
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${WC_URL}/wp-json/wc/v3/customers/${session.sub}`, {
        headers: { Authorization: wcAuthHeader() },
    });

    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 502 });

    const customer = await res.json() as {
        billing: Record<string, string>;
        shipping: Record<string, string>;
    };

    return NextResponse.json({ billing: customer.billing, shipping: customer.shipping });
}

/* ── PUT /api/account/addresses ── */
export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as { billing?: Record<string, string>; shipping?: Record<string, string> };

    const res = await fetch(`${WC_URL}/wp-json/wc/v3/customers/${session.sub}`, {
        method: 'PUT',
        headers: { Authorization: wcAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json({ error: 'Failed to update address', detail: err }, { status: 502 });
    }

    const updated = await res.json() as {
        billing: Record<string, string>;
        shipping: Record<string, string>;
    };

    return NextResponse.json({ billing: updated.billing, shipping: updated.shipping });
}
