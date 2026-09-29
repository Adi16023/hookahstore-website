export const runtime = 'edge';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import WholesaleResetPasswordClient from './WholesaleResetPasswordClient';

export const metadata: Metadata = {
    title: 'Reset Password | The Hookah Store Wholesale',
    description: 'Reset your wholesale account password.',
    robots: { index: false, follow: false },
};

/**
 * /wholesale/reset-password
 *   no ?token → request a reset link (POST /api/auth/forgot-password, source: 'wholesale')
 *   ?token=…  → choose a new password  (POST /api/auth/reset-password)
 */
export default function WholesaleResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <WholesaleResetPasswordClient />
        </Suspense>
    );
}
