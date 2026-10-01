<?php
/**
 * Action Handlers: Approve & Reject Wholesale Users
 *
 * These handlers listen on admin_post_ hooks registered in the main plugin file.
 * Both actions are protected with nonces and capability checks.
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Build the redirect URL back to the Applications page, with an optional
 * admin-notice query argument.
 *
 * @param string $status  'approved' | 'rejected' | 'error'
 * @param int    $user_id The affected user ID (used for display / debugging).
 * @return string
 */
function wam_redirect_url( string $status, int $user_id = 0 ): string {
	return add_query_arg(
		[
			'page'    => 'wholesale-applications',
			'wam_msg' => $status,
			'uid'     => $user_id,
		],
		admin_url( 'admin.php' )
	);
}

// ---------------------------------------------------------------------------
// Config helpers (v4.3): webhook secret + frontend URL come from wp-config.php
// ---------------------------------------------------------------------------

/**
 * Shared webhook secret. REQUIRED — define in wp-config.php:
 *   define( 'WAM_WEBHOOK_SECRET', '…same value as WHOLESALE_WEBHOOK_SECRET in Cloudflare…' );
 * There is no fallback: without it, webhooks are not sent and an admin notice is shown.
 */
function wam_webhook_secret(): string {
	return ( defined( 'WAM_WEBHOOK_SECRET' ) && is_string( WAM_WEBHOOK_SECRET ) ) ? trim( WAM_WEBHOOK_SECRET ) : '';
}

/**
 * Base URL of the Next.js frontend that receives the webhooks.
 * Override in wp-config.php (e.g. for staging):
 *   define( 'WAM_FRONTEND_URL', 'https://staging.thehookahstore.in' );
 */
function wam_frontend_url(): string {
	$url = defined( 'WAM_FRONTEND_URL' ) ? (string) WAM_FRONTEND_URL : 'https://thehookahstore.in';
	return untrailingslashit( esc_url_raw( $url, [ 'https', 'http' ] ) );
}

/** Keep only http/https URLs (applicant-supplied links/documents). */
function wam_safe_url( string $url ): string {
	$url = trim( $url );
	return '' === $url ? '' : esc_url_raw( $url, [ 'http', 'https' ] );
}

add_action( 'admin_notices', function (): void {
	if ( '' !== wam_webhook_secret() || ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p><strong>'
		. esc_html__( 'Wholesale Admin Manager:', 'wholesale-admin-manager' )
		. '</strong> '
		. esc_html__( 'WAM_WEBHOOK_SECRET is not defined in wp-config.php, so approval / rejection emails will NOT be sent. Add define( \'WAM_WEBHOOK_SECRET\', \'…\' ); using the same value as WHOLESALE_WEBHOOK_SECRET in Cloudflare.', 'wholesale-admin-manager' )
		. '</p></div>';
} );

/**
 * POST a webhook to the frontend. Returns true on HTTP 2xx.
 */
function wam_post_webhook( string $path, array $payload ): bool {
	$secret = wam_webhook_secret();
	if ( '' === $secret ) {
		error_log( '[WAM] Webhook ' . $path . ' NOT sent: WAM_WEBHOOK_SECRET is not defined in wp-config.php' );
		return false;
	}

	$response = wp_remote_post(
		wam_frontend_url() . $path,
		[
			'timeout'     => 10,
			'redirection' => 0,
			'headers'     => [
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $secret,
			],
			'body'        => wp_json_encode( $payload ),
		]
	);

	if ( is_wp_error( $response ) ) {
		error_log( '[WAM] Webhook ' . $path . ' FAILED (network error) for user ' . ( $payload['userId'] ?? '?' ) . ': ' . $response->get_error_message() );
		return false;
	}
	$status_code = (int) wp_remote_retrieve_response_code( $response );
	if ( $status_code >= 200 && $status_code < 300 ) {
		error_log( '[WAM] Webhook ' . $path . ' OK (HTTP ' . $status_code . ') for user ' . ( $payload['userId'] ?? '?' ) );
		return true;
	}
	error_log( '[WAM] Webhook ' . $path . ' returned HTTP ' . $status_code . ' for user ' . ( $payload['userId'] ?? '?' ) );
	return false;
}

// ---------------------------------------------------------------------------
// Webhook helper
// ---------------------------------------------------------------------------

/**
 * Notify the Next.js application that a wholesale account has been approved.
 *
 * Sends a POST request to /api/wholesale/approved so Next.js can dispatch
 * the approval confirmation email via Resend.
 *
 * Requires WAM_WEBHOOK_SECRET in wp-config.php (must match WHOLESALE_WEBHOOK_SECRET
 * in Cloudflare). The endpoint base URL is WAM_FRONTEND_URL.
 *
 * @param int    $user_id       WordPress user ID.
 * @param string $user_email    User's email address.
 * @param string $display_name  User's display name.
 */
function wam_send_approval_webhook( int $user_id, string $user_email, string $display_name ): void {
	wam_post_webhook( '/api/wholesale/approved', [
		'userId' => $user_id,
		'email'  => $user_email,
		'name'   => $display_name,
	] );
}

// ---------------------------------------------------------------------------
// Approve handler
// ---------------------------------------------------------------------------

/**
 * Handle the "Approve" form submission.
 *
 * Changes the user role from wholesale_pending → wholesale_customer.
 * Hooked to: admin_post_approve_wholesale_user
 */
function wam_handle_approve_user(): void {

	// 1. Sanitize the user ID, then verify the nonce that is tied to that ID.
	$user_id = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
	check_admin_referer( 'approve_wholesale_user_' . $user_id, 'wam_nonce' );

	// 2. Capability check.
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die(
			esc_html__( 'You do not have permission to perform this action.', 'wholesale-admin-manager' ),
			esc_html__( 'Forbidden', 'wholesale-admin-manager' ),
			[ 'response' => 403 ]
		);
	}

	// 3. Validate the user ID.
	if ( ! $user_id ) {
		wp_safe_redirect( wam_redirect_url( 'error', 0 ) );
		exit;
	}

	// 4. Fetch the user and validate role.
	$user = get_userdata( $user_id );

	if ( ! $user || ! in_array( 'wholesale_pending', (array) $user->roles, true ) ) {
		wp_safe_redirect( wam_redirect_url( 'error', $user_id ) );
		exit;
	}

	// 5. Promote the user and set their pricing tier (default bronze).
	$user->set_role( 'wholesale_customer' );
	$tier = isset( $_POST['wam_tier'] ) ? wam_sanitize_tier( wp_unslash( $_POST['wam_tier'] ) ) : WAM_DEFAULT_TIER;
	update_user_meta( $user_id, WAM_TIER_META, $tier );
	update_user_meta( $user_id, 'account_type', 'wholesale' );
	update_user_meta( $user_id, 'approval_status', 'approved' );

	// 6. Notify Next.js to send the approval email.
	wam_send_approval_webhook( $user_id, $user->user_email, $user->display_name );

	// 7. Record the approval date in user meta.
	update_user_meta( $user_id, 'wholesale_approved_date', current_time( 'mysql' ) );
	update_user_meta( $user_id, 'wholesale_approved_by',   get_current_user_id() );

	// 8. Future hook: allow extensions (email notifications, etc.) to run.
	do_action( 'wam_after_approve_user', $user_id );

	wp_safe_redirect( wam_redirect_url( 'approved', $user_id ) );
	exit;
}

// ---------------------------------------------------------------------------
// Reject handler
// ---------------------------------------------------------------------------

/**
 * Handle the "Reject" form submission.
 *
 * Converts the user role from wholesale_pending → customer (default WC role).
 * Hooked to: admin_post_reject_wholesale_user
 */
function wam_handle_reject_user(): void {

	// 1. Sanitize the user ID, then verify the nonce that is tied to that ID.
	$user_id = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
	check_admin_referer( 'reject_wholesale_user_' . $user_id, 'wam_nonce' );

	// 2. Capability check.
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die(
			esc_html__( 'You do not have permission to perform this action.', 'wholesale-admin-manager' ),
			esc_html__( 'Forbidden', 'wholesale-admin-manager' ),
			[ 'response' => 403 ]
		);
	}

	// 3. Validate the user ID.
	if ( ! $user_id ) {
		wp_safe_redirect( wam_redirect_url( 'error', 0 ) );
		exit;
	}

	// 4. Fetch user and validate role.
	$user = get_userdata( $user_id );

	if ( ! $user || ! in_array( 'wholesale_pending', (array) $user->roles, true ) ) {
		wp_safe_redirect( wam_redirect_url( 'error', $user_id ) );
		exit;
	}

	// 5. Downgrade to standard customer.
	$user->set_role( 'customer' );

	// 6. Notify Next.js to send the rejection email.
	wam_post_webhook( '/api/wholesale/rejected', [
		'userId' => $user_id,
		'email'  => $user->user_email,
		'name'   => $user->display_name,
	] );

	// 7. Record rejection metadata.
	update_user_meta( $user_id, 'wholesale_rejected_date', current_time( 'mysql' ) );
	update_user_meta( $user_id, 'wholesale_rejected_by',   get_current_user_id() );

	// 8. Future hook: allow extensions (email notifications, etc.) to run.
	do_action( 'wam_after_reject_user', $user_id );

	wp_safe_redirect( wam_redirect_url( 'rejected', $user_id ) );
	exit;
}
