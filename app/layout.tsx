export const runtime = 'edge';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { AuthProvider } from '../components/providers/AuthProvider';


// Validate required env vars on every cold start.
// In production this throws and prevents the server from starting with missing secrets.


const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    // Exposed as a CSS variable so inline styles / Tailwind classes can use it:
    // var(--font-montserrat)  ·  .font-montserrat
    variable: '--font-montserrat',
});

const SITE_URL = 'https://thehookahstore.in';
const SITE_TITLE = 'The Hookah Store — Premium Hookahs, Shisha & Accessories in India';
const SITE_DESCRIPTION = 'Shop authentic hookahs, shisha flavours, coconut charcoal and accessories from Al Fakher, Afzal, Mya and more. Secure UPI & card payments, delivery across India. Wholesale available for lounges and retailers. 21+ only.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: '%s | The Hookah Store',
    },
    description: SITE_DESCRIPTION,
    applicationName: 'The Hookah Store',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: SITE_URL,
        siteName: 'The Hookah Store',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
    },
    // <meta name="build-version"> — lets us confirm which commit is live
    other: {
        'build-version': process.env.BUILD_VERSION || 'local',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={montserrat.variable} suppressHydrationWarning>
            <head>
                {/* 1. Blocking script — sets data-dark BEFORE any paint. Dark is the default. */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    try {
                        var saved = localStorage.getItem('hookah-theme');
                        // Dark by default — only skip if user explicitly chose light
                        if (saved !== 'light') {
                            document.documentElement.setAttribute('data-dark', 'true');
                        }
                    } catch(e) {
                        // localStorage unavailable — fall back to dark
                        document.documentElement.setAttribute('data-dark', 'true');
                    }
                ` }} />
                {/* 2. Critical flash-prevention CSS only (above-the-fold chrome, applied before
                       the stylesheet loads). Everything else — colour tokens, blog, brand logos —
                       lives once in styles/globals.css. */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    html[data-dark="true"]  .hookah-header-bg { background-color: #0a0a0a !important; }
                    html:not([data-dark="true"]) .hookah-header-bg { background-color: #ffffff !important; }
                    html[data-dark="true"]  .logo-light { display: none !important; }
                    html[data-dark="true"]  .logo-dark  { display: block !important; }
                    html:not([data-dark="true"]) .logo-light { display: block !important; }
                    html:not([data-dark="true"]) .logo-dark  { display: none !important; }
                    html[data-dark="true"]  .hookah-nav-text { color: #ffffff !important; }
                    html:not([data-dark="true"]) .hookah-nav-text { color: #101114 !important; }
                    html[data-dark="true"]  .hookah-nav-border { border-top: 1px solid #5D5D5D !important; border-bottom: 1px solid #5D5D5D !important; }
                    html:not([data-dark="true"]) .hookah-nav-border { border-top: 1px solid #d7d8db !important; border-bottom: 1px solid #d7d8db !important; }
                    html[data-dark="true"]  body { background-color: #000000 !important; color: #f0f0f0 !important; }
                    html:not([data-dark="true"]) body { background-color: #f5f4f0 !important; color: #111111 !important; }
                    html[data-dark="true"]  .hookah-page-bg { background: radial-gradient(100% 100% at 50% 50%, #1A1A1A 0%, #0A0A0A 60%, #000000 100%) !important; }
                    html:not([data-dark="true"]) .hookah-page-bg { background: #f5f4f0 !important; }
                ` }} />
            </head>
            <body className={montserrat.className}>
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
