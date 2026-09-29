<?php
/**
 * Admin Menu Registration
 *
 * Registers the top-level "Wholesale" menu and its sub-pages:
 *  - Applications  (wholesale_pending users)
 *  - Approved Customers (wholesale_customer users)
 *
 * The top-level item and the Applications sub-item both show a red badge
 * with the count of pending applications, matching WordPress core badge style.
 *
 * @package WholesaleAdminManager
 */

defined('ABSPATH') || exit;

/**
 * Return the number of users currently holding the wholesale_pending role.
 *
 * Uses count_users() which is already cached by WordPress on the Users screen.
 * Returns 0 if the role does not exist yet.
 *
 * @return int
 */
function wam_get_pending_count(): int {
	$counts = count_users();
	return isset( $counts['avail_roles']['wholesale_pending'] )
		? (int) $counts['avail_roles']['wholesale_pending']
		: 0;
}

/**
 * Build the badge HTML for a given count.
 * Returns an empty string when count is 0 so no badge is shown.
 *
 * Uses WordPress core .awaiting-mod / .pending-count CSS classes —
 * the same classes WooCommerce and Comments use, so the badge renders
 * identically to native WP notification bubbles with no custom CSS required.
 *
 * @param  int    $count
 * @return string
 */
function wam_pending_badge( int $count ): string {
	if ( $count <= 0 ) {
		return '';
	}
	return sprintf(
		' <span class="awaiting-mod count-%1$d"><span class="pending-count">%1$d</span></span>',
		$count
	);
}

/**
 * Register top-level menu and sub-menus.
 *
 * Hooked to 'admin_menu' in the main plugin file.
 */
function wam_register_admin_menu(): void {

	$pending = wam_get_pending_count();
	$badge   = wam_pending_badge( $pending );

	/*
	 * Top-level menu — points directly to the Applications page.
	 * Badge appears next to "Wholesale" in the sidebar.
	 */
	add_menu_page(
		__( 'Wholesale', 'wholesale-admin-manager' ),             // Page title (no badge)
		__( 'Wholesale', 'wholesale-admin-manager' ) . $badge,    // Menu label (with badge)
		'manage_woocommerce',
		'wholesale-applications',
		'wam_render_applications_page',
		'dashicons-groups',
		56 // Position — after WooCommerce (~55)
	);

	/*
	 * Sub-page 1: Applications — mirrors the top-level entry so the first
	 * item label reads "Applications" instead of the duplicated "Wholesale".
	 * Badge here keeps the count visible when the sub-menu is expanded.
	 */
	add_submenu_page(
		'wholesale-applications',
		__( 'Wholesale Applications', 'wholesale-admin-manager' ),
		__( 'Applications', 'wholesale-admin-manager' ) . $badge,
		'manage_woocommerce',
		'wholesale-applications',
		'wam_render_applications_page'
	);

	/*
	 * Sub-page 2: Approved Customers (no badge — already approved)
	 */
	add_submenu_page(
		'wholesale-applications',
		__( 'Approved Wholesale Customers', 'wholesale-admin-manager' ),
		__( 'Approved Customers', 'wholesale-admin-manager' ),
		'manage_woocommerce',
		'wholesale-customers',
		'wam_render_approved_customers_page'
	);
}