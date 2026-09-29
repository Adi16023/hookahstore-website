'use client';

/**
 * useWholesaleSession
 *
 * Reads wholesale role from the shared AuthProvider context — zero network requests.
 * The AuthProvider in root layout calls /api/auth/me exactly once for the whole app.
 */

import { useAuth } from '../../components/providers/AuthProvider';

type WholesaleStatus = {
    loading: boolean;
    role: string;
    isApproved: boolean;
    isPending: boolean;
};

export function useWholesaleSession(): WholesaleStatus {
    const { role } = useAuth();
    return {
        loading: role === 'loading',
        role,
        isApproved: role === 'wholesale_customer',
        isPending: role === 'wholesale_pending',
    };
}
