'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import './admin.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

const NAV_ITEMS = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/wholesale', label: 'Wholesale' },
    { href: '/admin/customers', label: 'Customers' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    if (pathname === '/admin/login') {
        return <div className={inter.className} style={{ background: '#0f0f10', minHeight: '100vh' }}>{children}</div>;
    }

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    }

    const sidebar = (
        <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
            <div className="admin-sidebar-brand">Hookah Admin</div>
            <nav className="admin-nav">
                {NAV_ITEMS.map(item => (
                    <a key={item.href} href={item.href} className={pathname?.startsWith(item.href) ? 'active' : ''}>
                        {item.label}
                    </a>
                ))}
            </nav>
            <div className="admin-sidebar-footer">
                <button className="admin-logout-btn" onClick={handleLogout}>Log out</button>
            </div>
        </aside>
    );

    return (
        <div className={`admin-shell ${inter.className}`}>
            {sidebar}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="admin-topbar">
                    <span className="admin-topbar-brand">Hookah Admin</span>
                    <button className="admin-menu-btn" onClick={() => setMenuOpen(v => !v)}>
                        {menuOpen ? 'Close' : 'Menu'}
                    </button>
                </div>
                <main className="admin-main">{children}</main>
            </div>
        </div>
    );
}
