import WholesaleHeaderTopBar from './WholesaleHeaderTopBar';
import WholesaleHeaderNav from './WholesaleHeaderNav';

export default function WholesaleHeader() {
    return (
        <header
            role="banner"
            className="w-full sticky top-0 z-40 hookah-header-bg transition-colors duration-200"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
        >
            <WholesaleHeaderTopBar />
            <WholesaleHeaderNav />
        </header>
    );
}
