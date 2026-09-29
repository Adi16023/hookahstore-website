export const runtime = 'edge';
/**
 * Blog layout
 *
 * Blog pages use their own dedicated BlogHeader and BlogFooter (rendered
 * inside BlogPageClient / BlogPostPageClient), NOT the main site header.
 *
 * This layout only supplies the radial gradient background layer that shows
 * through the transparent dark-mode page, matching the main site aesthetic.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* Fixed radial gradient — shows through transparent dark-mode pages */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(100% 100% at 50% 50%, #1A1A1A 0%, #0A0A0A 60%, #000000 100%)',
                    zIndex: 0,
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </>
    );
}
