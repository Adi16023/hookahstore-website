export const runtime = 'edge';
/**
 * Wholesale Layout
 * Provides: CartProvider + TopWarningBar + WholesaleHeader + Footer
 *
 * ThemeProvider lives in the root app/layout.tsx and is shared with retail —
 * do NOT add another ThemeProvider here, it would create a separate isolated
 * context and break theme persistence between retail ↔ wholesale.
 *
 * WholesaleCartGuard fires on every wholesale page load and clears the
 * wholesale_cart if the user is not an approved wholesale_customer.
 */
import { CartProvider } from '../../components/providers/CartProvider';
import TopWarningBar from '../../components/layout/TopWarningBar';
import WholesaleHeader from '../../components/layout/WholesaleHeader';
import Footer from '../../components/layout/Footer';
import SiteBackground from '../../components/layout/SiteBackground';
import WholesaleCartGuard from '../../components/wholesale/WholesaleCartGuard';

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider storageKey="wholesale_cart">
            <WholesaleCartGuard />
            <SiteBackground />
            <div className="relative w-full min-h-screen" style={{ zIndex: 1 }}>
                <TopWarningBar />
                <WholesaleHeader />
                <main id="main-content" className="w-full">
                    {children}
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
