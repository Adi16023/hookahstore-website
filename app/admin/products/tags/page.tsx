export const dynamic = 'force-dynamic';

import { wcGet } from '../../../../lib/woocommerce';
import TermsClient from '../TermsClient';

export default async function TagsPage() {
    let terms: { id: number; name: string; count: number }[] = [];
    let error = '';
    try {
        terms = (await wcGet('products/tags?per_page=100&orderby=name')) as typeof terms;
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load tags.';
    }

    return (
        <div>
            <a href="/admin/products" className="admin-back-link">← Back to products</a>
            <h1 className="admin-h1">Tags</h1>
            <p className="admin-sub">Native WooCommerce product tags (used for brand pages).</p>
            {error ? <div className="admin-error">{error}</div> : (
                <TermsClient kind="tags" initialTerms={terms} />
            )}
        </div>
    );
}
