/**
 * app/(site)/loading.tsx
 *
 * Shown by Next.js while ANY async server component inside (site) is resolving.
 * e.g. category pages, product pages, homepage — all ISR pages trigger this
 * on first uncached load.
 *
 * Uses the same spinner style as the root loading.tsx for consistency.
 */
export default function SiteLoading() {
    return (
        <div
            aria-label="Loading"
            style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <>
                <style>{`
                    @keyframes hs-spin {
                        to { transform: rotate(360deg); }
                    }
                    .hs-spinner {
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        border: 3px solid rgba(205, 20, 44, 0.15);
                        border-top-color: #CD142C;
                        animation: hs-spin 700ms linear infinite;
                    }
                `}</style>
                <div className="hs-spinner" aria-hidden="true" />
            </>
        </div>
    );
}
