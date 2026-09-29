'use client';

import { useTheme } from '../providers/ThemeProvider';
import SiteLogo from '../layout/SiteLogo';

function ThemeToggle() {
    const { dark, toggleDark } = useTheme();
    return (
        <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle theme"
            className={`relative inline-flex h-[28px] w-[56px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${dark ? 'bg-[#1a1a1a] border-[#444]' : 'bg-[#C8C8C8] border-[#C8C8C8]'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow transform transition-transform duration-200 mt-[2px] ml-[2px] ${dark ? 'translate-x-[26px]' : 'translate-x-0'
                    }`}
            />
            <span className={`absolute left-[6px] top-1/2 -translate-y-1/2 text-[10px] font-semibold select-none ${dark ? 'text-transparent' : 'text-[#555]'}`}>☀</span>
            <span className={`absolute right-[6px] top-1/2 -translate-y-1/2 text-[10px] font-semibold select-none ${dark ? 'text-white/70' : 'text-transparent'}`}>☾</span>
        </button>
    );
}

export default function BlogHeader() {
    const { dark } = useTheme();

    const bg = dark ? '#1a1a1a' : '#ffffff';
    const border = dark ? '#2e2e2e' : '#ebebed';
    const textColor = dark ? '#ffffff' : '#1b1c1f';
    const iconColor = dark ? '#ffffff' : '#1B1C1F';
    const burgerBg = dark ? '#ffffff' : '#1b1c1f';

    return (
        <header
            className="blog-header"
            style={{
                borderBottom: `1px solid ${border}`,
                height: '81px',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                transition: 'background-color 200ms, border-color 200ms',
            }}
        >
            <div className="h-full max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] flex items-center">

                {/* Mobile/Tablet: hamburger — visible up to xl (1280px) */}
                <button className="xl:hidden mr-3 flex flex-col gap-[5px] flex-shrink-0" aria-label="Open menu">
                    <span className="block w-[20px] h-[2px] transition-colors duration-200" style={{ backgroundColor: burgerBg }} />
                    <span className="block w-[20px] h-[2px] transition-colors duration-200" style={{ backgroundColor: burgerBg }} />
                    <span className="block w-[20px] h-[2px] transition-colors duration-200" style={{ backgroundColor: burgerBg }} />
                </button>

                {/* Logo */}
                <div className="flex-shrink-0 lg:mr-0">
                    <SiteLogo dark={dark} variant="blog" size="md" />
                </div>

                {/* Desktop Nav — xl and above only */}
                <nav className="hidden xl:flex items-center ml-6 flex-1 flex-nowrap overflow-hidden">
                    {[
                        { label: 'Guides', hasChevron: true },
                        { label: 'Reviews', hasChevron: true },
                        { label: 'Shisha Tobacco', hasChevron: false },
                        { label: 'Hookahs', hasChevron: false },
                        { label: 'Hookah Accessories', hasChevron: false },
                        { label: 'Business', hasChevron: false },
                    ].map(({ label, hasChevron }) => (
                        <a
                            key={label}
                            href="#"
                            className="flex items-center gap-1 px-2 font-montserrat font-semibold text-base uppercase tracking-wider transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                            style={{ color: textColor }}
                        >
                            {label}
                            {hasChevron && (
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path
                                        d="M9 8.121L12.709 11.83L13.781 10.775L9 5.994L4.219 10.775L5.291 11.83L9 8.121Z"
                                        fill={iconColor}
                                    />
                                </svg>
                            )}
                        </a>
                    ))}
                </nav>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-4">

                    {/* Search — clean magnifying glass */}
                    <button className="flex items-center justify-center w-[22px] h-[22px]" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Shop button — xl only */}
                    <a
                        href="#"
                        className="hidden xl:flex items-center gap-[10px] bg-[#D32F2F] text-white rounded-full font-montserrat font-semibold text-[14px] uppercase tracking-[1px]"
                        style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px' }}
                    >
                        Shop
                        <svg width="16" height="11" viewBox="0 0 11.451 10.196" fill="none">
                            <path
                                d="M6.562 0.706L10.745 5.098M10.745 5.098L6.562 9.49M10.745 5.098H0.706"
                                stroke="white"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.412"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </header>
    );
}
