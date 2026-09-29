'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
    dark: boolean;
    toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggleDark: () => { } });

const STORAGE_KEY = 'hookah-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const isDark = document.documentElement.getAttribute('data-dark') === 'true';
        setDark(isDark);
    }, []);

    function toggleDark() {
        setDark((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
            if (next) {
                document.documentElement.setAttribute('data-dark', 'true');
            } else {
                document.documentElement.removeAttribute('data-dark');
            }
            return next;
        });
    }

    return (
        <ThemeContext.Provider value={{ dark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
