/**
 * Full-page fixed backdrop.
 * Responds to the html[data-dark] attribute set by ThemeProvider.
 * Dark → radial dark gradient | Light → warm off-white (#f5f4f0)
 * The hookah-page-bg CSS class in globals.css handles the actual switch.
 */
export default function SiteBackground() {
    return (
        <div
            className="hookah-page-bg fixed inset-0 pointer-events-none transition-colors duration-300"
            style={{ zIndex: 0 }}
        />
    );
}
