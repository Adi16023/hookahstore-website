import HeaderTopBar from './HeaderTopBar';
import HeaderNav from './HeaderNav';

// Server component — no useTheme needed.
// Background is handled entirely by CSS: hookah-header-bg + data-dark on <html>.
// The blocking script in layout.tsx sets data-dark before any paint = zero flash.

export default function Header() {
    return (
        <header
            role="banner"
            className="w-full sticky top-0 z-40 hookah-header-bg transition-colors duration-200"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
        >
            <HeaderTopBar />
            <HeaderNav />
        </header>
    );
}
