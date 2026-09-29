'use client';

import { useTheme } from '../../../../components/providers/ThemeProvider';
import { WholesaleAccountShell, SessionData } from '../WholesaleAccountClient';

function Field({ label, value, muted, border }: { label: string; value: string; muted: string; border: string }) {
    return (
        <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: '16px', marginBottom: '16px' }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: muted, margin: '0 0 4px', transition: 'color 200ms' }}>{label}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: muted, margin: 0, transition: 'color 200ms' }}>{value || '—'}</p>
        </div>
    );
}

export default function WholesaleBusinessClient({ session }: { session: SessionData }) {
    const { dark } = useTheme();
    const textPrim  = dark ? '#ffffff' : '#000000';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#4c4e52';
    const cardBorder = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const divider    = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
    const linkRed    = '#D32F2F';

    return (
        <WholesaleAccountShell session={session}>
            <div style={{ flex: 1, padding: '48px 32px 80px' }}>
                <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '40px', lineHeight: '54px', color: textPrim, margin: '4px 0 24px', transition: 'color 200ms' }}>
                    BUSINESS PROFILE
                </h1>

                <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: textPrim, margin: '0 0 16px', transition: 'color 200ms' }}>
                    Business Information
                </h2>

                <div style={{ border: `1px solid ${cardBorder}`, borderRadius: '8px', padding: '24px', maxWidth: '560px', marginBottom: '24px', transition: 'border-color 200ms' }}>
                    <Field label="Account Holder"  value={`${session.firstName} ${session.lastName}`} muted={textMuted} border={divider} />
                    <Field label="Email Address"   value={session.email}    muted={textMuted} border={divider} />
                    <Field label="Business Name"   value="—"               muted={textMuted} border={divider} />
                    <Field label="GST Number"      value="—"               muted={textMuted} border={divider} />
                    <Field label="Phone Number"    value="—"               muted={textMuted} border={divider} />
                    <div style={{ paddingTop: '4px' }}>
                        <Field label="Business Address" value="—"          muted={textMuted} border="transparent" />
                    </div>
                </div>

                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '13px', color: textMuted, margin: 0 }}>
                    To update your business details, contact us at{' '}
                    <a href="mailto:wholesale@thehookahstore.in" style={{ color: linkRed, textDecoration: 'underline' }}>wholesale@thehookahstore.in</a>
                </p>
            </div>
        </WholesaleAccountShell>
    );
}
