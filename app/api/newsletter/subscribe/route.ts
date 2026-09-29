export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json() as { email?: string };

        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Newsletter service not configured.' }, { status: 500 });
        }

        const res = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                listIds: [Number(process.env.BREVO_LIST_ID ?? 1)],
                updateEnabled: true,
            }),
        });

        // 204 = already exists (updateEnabled), 201 = created — both are success
        if (res.status === 201 || res.status === 204) {
            return NextResponse.json({ success: true });
        }

        const data = await res.json() as { message?: string };
        return NextResponse.json({ error: data.message ?? 'Subscription failed.' }, { status: 400 });

    } catch {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
