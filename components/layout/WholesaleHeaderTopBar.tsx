'use client';

import WholesaleHeaderDesktop from './header/WholesaleHeaderDesktop';
import WholesaleHeaderTablet from './header/WholesaleHeaderTablet';
import WholesaleHeaderMobile from './header/WholesaleHeaderMobile';

export default function WholesaleHeaderTopBar() {
    return (
        <div className="w-full">
            <div className="hidden lg:block">
                <WholesaleHeaderDesktop />
            </div>
            <div className="hidden md:block lg:hidden hookah-header-bg transition-colors duration-200">
                <WholesaleHeaderTablet />
            </div>
            <div className="md:hidden hookah-header-bg transition-colors duration-200">
                <WholesaleHeaderMobile />
            </div>
        </div>
    );
}
