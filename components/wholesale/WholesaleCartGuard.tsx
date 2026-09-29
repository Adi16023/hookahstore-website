'use client';

/**
 * WholesaleCartGuard
 *
 * Reads role from the shared AuthProvider — no network request here.
 * Clears the wholesale cart unless the user is an approved wholesale_customer.
 */

import { useEffect } from 'react';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';

export default function WholesaleCartGuard() {
    const { clearCart } = useCart();
    const { role } = useAuth();

    useEffect(() => {
        // Once the role is resolved (not still loading), enforce the guard
        if (role === 'loading') return;
        if (role !== 'wholesale_customer') {
            clearCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    return null;
}
