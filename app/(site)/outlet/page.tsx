export const runtime = 'edge';
import type { Metadata } from 'next';

// Placeholder — not linked from any navigation and kept out of search engines
// until there is real clearance stock.
export const metadata: Metadata = {
    title: 'Outlet',
    robots: { index: false, follow: false },
};

export default function OutletPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-40 px-8">
            <h1 className="text-4xl font-montserrat font-bold uppercase tracking-wider text-[#00EBD8]">
                Outlet
            </h1>
            <div className="mt-8 border border-white/10 rounded-lg p-12 text-center">
                <p className="text-xl text-white/60">Clearance items coming soon.</p>
            </div>
        </div>
    );
}
