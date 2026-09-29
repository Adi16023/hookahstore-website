<?php
/**
 * Plugin Name:       Wholesale Admin Manager
 * Plugin URI:        https://github.com/your-repo/wholesale-admin-manager
 * Description:       Manage wholesale account applications from the WordPress admin. Review, approve, and reject wholesale applications submitted via the headless Next.js frontend. Gold / Silver / Bronze tier pricing per product and variation.
 * Version:           4.3
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            Your Agency
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wholesale-admin-manager
 * Domain Path:       /languages
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

define( 'WAM_VERSION',     '4.3' );
define( 'WAM_PLUGIN_FILE', __FILE__ );
define( 'WAM_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'WAM_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

// ---------------------------------------------------------------------------
// Autoload includes
// ---------------------------------------------------------------------------

/**
 * Load all required include files.
 */
function wam_load_includes(): void {
	$files = [
		'includes/tier-pricing.php',   // v4.2 — tiers, tier prices, wholesale visibility
		'includes/wholesale-orders.php', // v4.2 — enquiry orders from the wholesale cart
		'includes/actions.php',
		'includes/admin-menu.php',
		'includes/applications-page.php',
		'includes/approved-customers-page.php',
	];

	foreach ( $files as $file ) {
		$path = WAM_PLUGIN_DIR . $file;
		if ( file_exists( $path ) ) {
			require_once $path;
		}
	}
}
wam_load_includes();

// ---------------------------------------------------------------------------
// Admin menu
// ---------------------------------------------------------------------------

add_action( 'admin_menu', 'wam_register_admin_menu' );

// ---------------------------------------------------------------------------
// Enqueue admin styles
// ---------------------------------------------------------------------------

/**
 * Enqueue plugin admin stylesheet only on plugin pages.
 */
add_action( 'admin_enqueue_scripts', function ( string $hook ): void {
	$allowed_hooks = [
		'toplevel_page_wholesale-applications',
		'wholesale_page_wholesale-customers',
	];

	if ( in_array( $hook, $allowed_hooks, true ) ) {
		wp_enqueue_style(
			'wholesale-admin-manager',
			WAM_PLUGIN_URL . 'assets/admin.css',
			[],
			WAM_VERSION
		);
	}
} );

// ---------------------------------------------------------------------------
// admin_post_ action handlers
// ---------------------------------------------------------------------------

add_action( 'admin_post_approve_wholesale_user', 'wam_handle_approve_user' );
add_action( 'admin_post_reject_wholesale_user',  'wam_handle_reject_user' );

// ---------------------------------------------------------------------------
// Role registration
// ---------------------------------------------------------------------------

/**
 * Register custom wholesale roles.
 *
 * Runs on plugin activation AND on every `init` (idempotent — WordPress
 * ignores add_role() calls when the role already exists). This ensures the
 * roles exist even if the plugin was previously activated on an older version
 * that did not register them.
 *
 * IMPORTANT: WooCommerce REST API (PUT /wc/v3/customers/{id}) validates
 * that the requested role exists in WordPress before applying it. If the role
 * is not registered, WooCommerce returns a 400 error and the role update
 * silently fails. Registering roles here is the root-cause fix.
 */
function wam_register_roles(): void {
	// wholesale_pending — submitted application, awaiting admin review.
	if ( ! get_role( 'wholesale_pending' ) ) {
		add_role(
			'wholesale_pending',
			__( 'Wholesale Pending', 'wholesale-admin-manager' ),
			[ 'read' => true ] // minimal capability set
		);
	}

	// wholesale_customer — approved wholesale account.
	if ( ! get_role( 'wholesale_customer' ) ) {
		add_role(
			'wholesale_customer',
			__( 'Wholesale Customer', 'wholesale-admin-manager' ),
			[ 'read' => true ] // WooCommerce adds wc_* capabilities separately
		);
	}
}

// Register on every page load (safe no-op when roles already exist).
add_action( 'init', 'wam_register_roles' );

// ---------------------------------------------------------------------------
// Activation hook
// ---------------------------------------------------------------------------

register_activation_hook( __FILE__, function (): void {
	// Register roles immediately on activation so WooCommerce REST API
	// can assign them as soon as the plugin is active.
	wam_register_roles();
	flush_rewrite_rules();
} );

// ---------------------------------------------------------------------------
// Deactivation hook
// ---------------------------------------------------------------------------

register_deactivation_hook( __FILE__, function (): void {
	// NOTE: We intentionally do NOT remove roles on deactivation.
	// Removing 'wholesale_pending' or 'wholesale_customer' roles while users
	// still hold those roles would corrupt their user records in WordPress.
	// Roles should only be removed after migrating all affected users.
	flush_rewrite_rules();
} );
