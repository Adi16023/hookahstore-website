'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../providers/ThemeProvider';
import LiveSearch from '../search/LiveSearch';

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    /** 'wholesale' → live wholesale search (only wholesale-visible products, no prices) */
    mode?: 'retail' | 'wholesale';
}

export default function MobileSearchOverlay({ isOpen, onClose, mode = 'retail' }: MobileSearchOverlayProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { dark } = useTheme();

    // Lock body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    if (!isOpen) return null;

    const overlayBg = dark ? '#0a0a0a' : '#ffffff';
    const inputBg = dark ? '#1a1a1a' : '#ffffff';
    const inputText = dark ? '#ffffff' : '#101114';
    const inputBorder = dark ? '#3a3a3a' : '#E0E0E0';
    const iconColor = dark ? '#ffffff' : '#101114';

    return (
        <div
            className="fixed inset-0 z-[9999]"
            style={{ backgroundColor: overlayBg, transition: 'background-color 200ms' }}
            role="dialog"
            aria-modal="true"
            aria-label="Search overlay"
        >
            {/* Wholesale: live search dropdown (there is no wholesale /search page) */}
            {mode === 'wholesale' ? (
                <div className="p-4 flex items-start gap-3">
                    <LiveSearch
                        mode="wholesale"
                        placeholder="Search wholesale..."
                        className="flex-1 h-[52px]"
                        inputClassName={`w-full h-full bg-transparent text-[18px] font-montserrat font-normal focus:outline-none rounded-[6px] pl-5 pr-14 ${dark ? 'text-white placeholder:text-white/60 border border-[#3a3a3a]' : 'text-[#101114] placeholder:text-[#101114]/50 border border-[#E0E0E0]'}`}
                    />
                    <button
                        onClick={onClose}
                        aria-label="Close search"
                        className="p-2 mt-2"
                        style={{ color: iconColor }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
            <div className="p-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full h-[52px] text-[18px] font-montserrat font-normal focus:outline-none"
                            style={{
                                backgroundColor: inputBg,
                                color: inputText,
                                border: `1px solid ${inputBorder}`,
                                borderRadius: '6px',
                                paddingLeft: '20px',
                                paddingRight: '56px',
                                transition: 'background-color 200ms, color 200ms, border-color 200ms',
                            }}
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            aria-label="Search"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke={iconColor}
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close search"
                        className="p-2"
                        style={{ color: iconColor }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </form>
            </div>
            )}
        </div>
    );
}
