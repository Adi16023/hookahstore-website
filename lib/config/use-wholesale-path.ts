'use client';

/**
 * useWholesaleHref()
 *
 * Returns a function that builds wholesale links with wholesalePath():
 *   on wholesale.thehookahstore.in → "/category/hookahs"
 *   everywhere else               → "/wholesale/category/hookahs"
 *
 * The server can't see the host from a client component, so the first render
 * (SSR + hydration) always uses the "/wholesale" form — which also works on
 * the subdomain, because middleware serves /wholesale/* paths directly. After
 * mount it switches to wholesalePath(), avoiding hydration mismatches.
 */

import { useCallback, useEffect, useState } from 'react';
import { wholesalePath } from './index';

export function useWholesaleHref(): (path: string) => string {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    return useCallback(
        (path: string) => (mounted ? wholesalePath(path) : `/wholesale${path}`),
        [mounted],
    );
}
