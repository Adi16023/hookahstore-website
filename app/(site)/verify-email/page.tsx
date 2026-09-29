'use client';
export const runtime = 'edge';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { Suspense } from 'react';

function VerifyEmailContent() {
    const { dark } = useTheme();
    const params = useSearchParams();
    const status = params.get('status'); // success | expired | invalid | error

    const pageBg = dark ? '#121212' : '#ffffff';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#f6f5f8';

    type StatusConfig = {
        icon: string;
        iconColor: string;
        title: string;
        message: string;
    };

    const config: Record<string, StatusConfig> = {
        success: {
            icon: '✓',
            iconColor: '#2e7d32',
            title: 'Email Verified',
            message: 'Your email address has been verified successfully. You\'re all set!',
        },
        expired: {
            icon: '⏱',
            iconColor: '#D32F2F',
            title: 'Link Expired',
            message: 'This verification link has expired. Please contact support or log in and request a new one from your account settings.',
        },
        invalid: {
            icon: '✕',
            iconColor: '#D32F2F',
            title: 'Invalid Link',
            message: 'This verification link is invalid. Please make sure you copied the full link from your email.',
        },
        error: {
            icon: '!',
            iconColor: '#D32F2F',
            title: 'Something Went Wrong',
            message: 'We couldn\'t verify your email right now. Please try again later.',
        },
    };

    const current = config[status ?? ''] ?? {
        icon: '✉',
        iconColor: '#D32F2F',
        title: 'Verify Your Email',
        message: 'Check your inbox for the verification link we sent when you created your account.',
    };

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', transition: 'background-color 200ms' }}>
            <div style={{ backgroundColor: cardBg, borderRadius: '12px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', transition: 'background-color 200ms' }}>

                {/* Icon */}
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: current.iconColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                    <span style={{ fontSize: '28px', color: current.iconColor, fontWeight: 700 }}>
                        {current.icon}
                    </span>
                </div>

                {/* Title */}
                <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '22px', lineHeight: '32px', color: textPrim, margin: '0 0 12px 0', transition: 'color 200ms' }}>
                    {current.title}
                </h1>

                {/* Message */}
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '15px', lineHeight: '24px', color: textMuted, margin: '0 0 32px 0', transition: 'color 200ms' }}>
                    {current.message}
                </p>

                {/* CTA */}
                <Link
                    href="/"
                    style={{ display: 'inline-block', backgroundColor: '#D32F2F', color: '#ffffff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', padding: '12px 32px', borderRadius: '98px' }}
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailContent />
        </Suspense>
    );
}
