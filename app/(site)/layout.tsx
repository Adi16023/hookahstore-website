export const runtime = 'edge';
import { CartProvider } from '../../components/providers/CartProvider';
import SiteBackground from '../../components/layout/SiteBackground';
import TopWarningBar from '../../components/layout/TopWarningBar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AgeGate from '../../components/AgeGate';
import SiteLoader from '../../components/SiteLoader';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            {/* Route-transition progress bar — runs client-side only, no SSR impact */}
            <SiteLoader />
            <SiteBackground />
            <div className="relative z-10 w-full">
                <TopWarningBar />
                <Header />
                <AgeGate>
                    <main id="main-content" className="w-full">{children}</main>
                    <Footer />
                </AgeGate>
            </div>
        </CartProvider>
    );
}
