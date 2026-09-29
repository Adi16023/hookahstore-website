'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface WcTerm { id: number; name: string; count: number; }

export default function TermsClient({ kind, initialTerms }: { kind: 'categories' | 'tags'; initialTerms: WcTerm[] }) {
    const router = useRouter();
    const [terms, setTerms] = useState(initialTerms);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const singular = kind === 'categories' ? 'category' : 'tag';

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/${kind}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? `Failed to create ${singular}.`); setBusy(false); return; }
            setTerms(prev => [...prev, data.term]);
            setNewName('');
        } catch {
            setError('Network error.');
        }
        setBusy(false);
    }

    async function handleRename(id: number) {
        if (!editingName.trim()) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/${kind}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? `Failed to rename ${singular}.`); setBusy(false); return; }
            setTerms(prev => prev.map(t => (t.id === id ? { ...t, name: editingName.trim() } : t)));
            setEditingId(null);
        } catch {
            setError('Network error.');
        }
        setBusy(false);
    }

    async function handleDelete(id: number) {
        if (!confirm(`Delete this ${singular}? This cannot be undone.`)) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/${kind}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? `Failed to delete ${singular}.`); setBusy(false); return; }
            setTerms(prev => prev.filter(t => t.id !== id));
            router.refresh();
        } catch {
            setError('Network error.');
        }
        setBusy(false);
    }

    return (
        <div>
            <form className="admin-toolbar" onSubmit={handleCreate}>
                <input
                    className="admin-input"
                    placeholder={`New ${singular} name…`}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <button type="submit" className="admin-btn admin-btn-accent" disabled={busy}>Add {singular}</button>
            </form>
            {error && <div className="admin-error">{error}</div>}

            <div className="admin-table-wrap">
                {terms.length === 0 ? (
                    <div className="admin-empty">No {kind} yet.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Products</th><th></th></tr>
                        </thead>
                        <tbody>
                            {terms.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        {editingId === t.id ? (
                                            <input
                                                className="admin-input"
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : t.name}
                                    </td>
                                    <td>{t.count}</td>
                                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        {editingId === t.id ? (
                                            <>
                                                <button className="admin-btn admin-btn-secondary" onClick={() => handleRename(t.id)} disabled={busy}>Save</button>
                                                <button className="admin-btn admin-btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="admin-btn admin-btn-secondary" onClick={() => { setEditingId(t.id); setEditingName(t.name); }}>Rename</button>
                                                <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(t.id)} disabled={busy}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
