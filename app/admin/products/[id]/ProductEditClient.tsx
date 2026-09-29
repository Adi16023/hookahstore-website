'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface WcCategory { id: number; name: string; }
export interface WcMeta { key: string; value: unknown; }
export interface FullProduct {
    id: number;
    name: string;
    description: string;
    sku: string;
    status: string;
    regular_price: string;
    sale_price: string;
    stock_status: string;
    stock_quantity: number | null;
    manage_stock: boolean;
    images: { src: string }[];
    categories: { id: number; name: string }[];
    tags: { id: number; name: string }[];
    meta_data: WcMeta[];
}

function metaValue(meta: WcMeta[], key: string): string {
    const entry = meta.find(m => m.key === key);
    return entry ? String(entry.value ?? '') : '';
}

export default function ProductEditClient({ product, categories }: { product: FullProduct; categories: WcCategory[] }) {
    const router = useRouter();
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description ?? '');
    const [sku, setSku] = useState(product.sku ?? '');
    const [status, setStatus] = useState(product.status);
    const [regularPrice, setRegularPrice] = useState(product.regular_price ?? '');
    const [salePrice, setSalePrice] = useState(product.sale_price ?? '');
    const [stockStatus, setStockStatus] = useState(product.stock_status ?? 'instock');
    const [stockQuantity, setStockQuantity] = useState(product.stock_quantity != null ? String(product.stock_quantity) : '');
    const [categoryIds, setCategoryIds] = useState<number[]>(product.categories?.map(c => c.id) ?? []);
    const [images, setImages] = useState<string[]>(product.images?.map(i => i.src) ?? []);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [wholesalePrice, setWholesalePrice] = useState(metaValue(product.meta_data, 'wholesale_price'));
    const [showInWholesale, setShowInWholesale] = useState(metaValue(product.meta_data, 'showInWholesale') === '1');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    function toggleCategory(id: number) {
        setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    }

    function addImage() {
        if (!newImageUrl.trim()) return;
        setImages(prev => [...prev, newImageUrl.trim()]);
        setNewImageUrl('');
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    sku,
                    status,
                    regular_price: regularPrice,
                    sale_price: salePrice,
                    stock_status: stockStatus,
                    stock_quantity: stockQuantity ? Number(stockQuantity) : null,
                    manage_stock: stockQuantity !== '',
                    categories: categoryIds.map(id => ({ id })),
                    images: images.map(src => ({ src })),
                    meta_data: [
                        { key: 'wholesale_price', value: wholesalePrice },
                        { key: 'showInWholesale', value: showInWholesale ? '1' : '' },
                    ],
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to save product.');
                setSaving(false);
                return;
            }
            setSaved(true);
            setSaving(false);
            router.refresh();
        } catch {
            setError('Network error while saving.');
            setSaving(false);
        }
    }

    return (
        <div>
            <a href="/admin/products" className="admin-back-link">← Back to products</a>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <h1 className="admin-h1" style={{ marginBottom: 0 }}>{product.name}</h1>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {saved && <span style={{ color: '#027A48', fontSize: 13 }}>Saved</span>}
                    {error && <span className="admin-error" style={{ padding: 0 }}>{error}</span>}
                    <button className="admin-btn admin-btn-accent" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="admin-card">
                    <div className="admin-form-grid">
                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Name</label>
                            <input className="admin-input" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea className="admin-input" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                        <div className="admin-field">
                            <label>SKU</label>
                            <input className="admin-input" value={sku} onChange={e => setSku(e.target.value)} />
                        </div>
                        <div className="admin-field">
                            <label>Status</label>
                            <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="publish">Published</option>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending review</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Pricing & Stock</h3>
                    <div className="admin-form-grid">
                        <div className="admin-field">
                            <label>Regular price (₹)</label>
                            <input className="admin-input" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} />
                        </div>
                        <div className="admin-field">
                            <label>Sale price (₹)</label>
                            <input className="admin-input" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
                        </div>
                        <div className="admin-field">
                            <label>Stock status</label>
                            <select className="admin-select" value={stockStatus} onChange={e => setStockStatus(e.target.value)}>
                                <option value="instock">In stock</option>
                                <option value="outofstock">Out of stock</option>
                                <option value="onbackorder">On backorder</option>
                            </select>
                        </div>
                        <div className="admin-field">
                            <label>Stock quantity</label>
                            <input className="admin-input" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="Leave blank if not tracked" />
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>Wholesale</h3>
                    <p className="admin-sub" style={{ marginBottom: 14 }}>Custom fields — stored as WooCommerce product meta, not native pricing.</p>
                    <div className="admin-form-grid">
                        <div className="admin-field">
                            <label>Wholesale price (₹)</label>
                            <input className="admin-input" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} placeholder="Shown to wholesale_customer role" />
                        </div>
                        <div className="admin-field" style={{ justifyContent: 'center' }}>
                            <label>Visibility</label>
                            <div className="admin-toggle-row">
                                <input type="checkbox" checked={showInWholesale} onChange={e => setShowInWholesale(e.target.checked)} />
                                <span style={{ fontSize: 13.5 }}>Show in wholesale catalog</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Categories</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {categories.map(c => (
                            <label key={c.id} style={{
                                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '5px 10px',
                                borderRadius: 999, border: '1px solid #e0e0e6',
                                background: categoryIds.includes(c.id) ? '#111116' : '#fff',
                                color: categoryIds.includes(c.id) ? '#fff' : '#111116', cursor: 'pointer',
                            }}>
                                <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} style={{ display: 'none' }} />
                                {c.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Images</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                        {images.map((src, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e5ea' }} />
                                <button
                                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                    style={{
                                        position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                                        background: '#c22', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer',
                                    }}
                                >×</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input className="admin-input" placeholder="Image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} style={{ flex: 1 }} />
                        <button className="admin-btn admin-btn-secondary" onClick={addImage}>Add image</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
