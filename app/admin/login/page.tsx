'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Login failed.');
                setLoading(false);
                return;
            }
            router.push('/admin');
            router.refresh();
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0f0f10', fontFamily: 'inherit',
        }}>
            <form onSubmit={handleSubmit} style={{
                background: '#1a1a1c', border: '1px solid #2e2e30', borderRadius: 10,
                padding: 32, width: 340, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
                <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
                <p style={{ color: '#999', fontSize: 13, margin: 0 }}>The Hookah Store — internal use only</p>
                <input
                    type="password"
                    autoFocus
                    placeholder="Admin password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        background: '#0f0f10', border: '1px solid #333', borderRadius: 6,
                        padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none',
                    }}
                />
                {error && <div style={{ color: '#ff5c5c', fontSize: 13 }}>{error}</div>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: '#CD142C', color: '#fff', border: 'none', borderRadius: 6,
                        padding: '10px 12px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
