/**
 * app/loading.tsx — Root-level loading UI (Next.js App Router).
 *
 * Automatically shown by Next.js when a server component page is fetching data
 * and hasn't yet resolved. Wraps all routes not covered by a nested loading.tsx.
 */
export default function RootLoading() {
    return (
        <div
            aria-label="Loading page"
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                zIndex: 99999,
            }}
        >
            <Spinner />
        </div>
    );
}

function Spinner() {
    return (
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
    );
}
