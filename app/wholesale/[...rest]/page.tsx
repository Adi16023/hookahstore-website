export const runtime = 'edge';
import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched /wholesale/* URLs (e.g. old /wholesale/catalog/* links).
 * Specific wholesale routes always win over this; anything else renders
 * app/wholesale/not-found.tsx inside the wholesale layout instead of the
 * retail 404.
 */
export default function WholesaleCatchAll() {
    notFound();
}
