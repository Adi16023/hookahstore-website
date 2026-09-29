<?php
/**
 * Approved Customers Page
 *
 * Renders a read-only admin table of all users with role `wholesale_customer`.
 * Includes WooCommerce order count per customer.
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

/**
 * Return the number of WooCommerce orders for a given customer ID.
 *
 * Works with both the legacy CPT order storage and the new HPOS (COT)
 * storage introduced in WooCommerce 7.1+.
 *
 * @param int $user_id WordPress user ID.
 * @return int
 */
function wam_get_order_count( int $user_id ): int {
	if ( ! function_exists( 'wc_get_orders' ) ) {
		return 0;
	}

	$orders = wc_get_orders(
		[
			'customer_id' => $user_id,
			'limit'       => -1,
			'return'      => 'ids',
			'status'      => array_keys( wc_get_order_statuses() ),
		]
	);

	return is_array( $orders ) ? count( $orders ) : 0;
}

// ---------------------------------------------------------------------------
// Page render callback
// ---------------------------------------------------------------------------

/**
 * Render the Approved Wholesale Customers admin page.
 *
 * Hooked via add_submenu_page() in admin-menu.php.
 */
function wam_render_approved_customers_page(): void {

	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'wholesale-admin-manager' ) );
	}

	// ------------------------------------------------------------------
	// Pagination parameters.
	// ------------------------------------------------------------------
	$current_page = isset( $_GET['paged'] ) ? max( 1, absint( $_GET['paged'] ) ) : 1; // phpcs:ignore WordPress.Security.NonceVerification
	$per_page     = 20;

	// Total count.
	$count_query = new WP_User_Query(
		[
			'role'        => 'wholesale_customer',
			'count_total' => true,
			'number'      => 1,
		]
	);
	$total_users = (int) $count_query->get_total();
	$total_pages = (int) ceil( $total_users / $per_page );

	// Main query.
	$user_query = new WP_User_Query(
		[
			'role'    => 'wholesale_customer',
			'number'  => $per_page,
			'offset'  => ( $current_page - 1 ) * $per_page,
			'orderby' => 'registered',
			'order'   => 'DESC',
		]
	);
	$users = $user_query->get_results();

	// ------------------------------------------------------------------
	// Render.
	// ------------------------------------------------------------------
	?>
	<div class="wrap wam-wrap">

		<h1 class="wp-heading-inline">
			<?php esc_html_e( 'Approved Wholesale Customers', 'wholesale-admin-manager' ); ?>
		</h1>

		<span class="wam-badge wam-badge-success"><?php echo esc_html( $total_users ); ?></span>

		<table class="wp-list-table widefat fixed striped wam-table wam-customers-table">
			<thead>
				<tr>
					<th scope="col" class="column-name"><?php esc_html_e( 'Name', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-email"><?php esc_html_e( 'Email', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-business"><?php esc_html_e( 'Business Name', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-phone"><?php esc_html_e( 'Phone', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-gst"><?php esc_html_e( 'GST Number', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-tier"><?php esc_html_e( 'Tier', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-orders"><?php esc_html_e( 'Orders', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-approved"><?php esc_html_e( 'Approved On', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" class="column-actions"><?php esc_html_e( 'Actions', 'wholesale-admin-manager' ); ?></th>
				</tr>
			</thead>
			<tbody>
			<?php if ( empty( $users ) ) : ?>
				<tr>
					<td colspan="9" class="wam-empty">
						<?php esc_html_e( 'No approved wholesale customers yet.', 'wholesale-admin-manager' ); ?>
					</td>
				</tr>
			<?php else : ?>
				<?php foreach ( $users as $user ) : ?>
					<?php
					$user_id = (int) $user->ID;
					$meta    = array_map(
						fn( $v ) => $v[0] ?? '',
						get_user_meta( $user_id )
					);
					$m = fn( string $key ): string => isset( $meta[ $key ] ) ? (string) $meta[ $key ] : '';

					$business_name  = $m( 'business_name' );
					$business_phone = $m( 'business_phone' );
					$gst_number     = $m( 'gst_number' );
					$approved_date  = $m( 'wholesale_approved_date' );

					$approved_formatted = $approved_date
						? wp_date( get_option( 'date_format' ), strtotime( $approved_date ) )
						: '—';

					$order_count = wam_get_order_count( $user_id );
					?>
					<tr>
						<!-- Name -->
						<td class="column-name">
							<strong>
								<a href="<?php echo esc_url( get_edit_user_link( $user_id ) ); ?>">
									<?php echo esc_html( $user->display_name ); ?>
								</a>
							</strong>
						</td>

						<!-- Email -->
						<td class="column-email">
							<a href="mailto:<?php echo esc_attr( $user->user_email ); ?>">
								<?php echo esc_html( $user->user_email ); ?>
							</a>
						</td>

						<!-- Business Name -->
						<td class="column-business"><?php echo esc_html( $business_name ?: '—' ); ?></td>

						<!-- Phone -->
						<td class="column-phone"><?php echo esc_html( $business_phone ?: '—' ); ?></td>

						<!-- GST Number -->
						<td class="column-gst">
							<code><?php echo esc_html( $gst_number ?: '—' ); ?></code>
						</td>

						<!-- Tier (edit on the user profile) -->
						<td class="column-tier">
							<?php $tier = wam_get_user_tier( $user_id ); ?>
							<a href="<?php echo esc_url( get_edit_user_link( $user_id ) . '#wam-tier' ); ?>" title="<?php esc_attr_e( 'Change tier', 'wholesale-admin-manager' ); ?>">
								<?php echo esc_html( wam_tier_labels()[ $tier ] ?? $tier ); ?>
							</a>
						</td>

						<!-- Orders Count -->
						<td class="column-orders">
							<?php if ( function_exists( 'wc_get_orders' ) ) : ?>
								<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=shop_order&_customer_user=' . $user_id ) ); ?>">
									<?php echo esc_html( $order_count ); ?>
								</a>
							<?php else : ?>
								<?php echo esc_html( $order_count ); ?>
							<?php endif; ?>
						</td>

						<!-- Approved On -->
						<td class="column-approved">
							<span title="<?php echo esc_attr( $approved_date ); ?>">
								<?php echo esc_html( $approved_formatted ); ?>
							</span>
						</td>

						<!-- Actions -->
						<td class="column-actions">
							<a
								href="<?php echo esc_url( get_edit_user_link( $user_id ) ); ?>"
								class="button button-small"
							><?php esc_html_e( 'Edit Profile', 'wholesale-admin-manager' ); ?></a>
						</td>
					</tr>
				<?php endforeach; ?>
			<?php endif; ?>
			</tbody>
			<tfoot>
				<tr>
					<th scope="col"><?php esc_html_e( 'Name', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Email', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Business Name', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Phone', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'GST Number', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Tier', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Orders', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Approved On', 'wholesale-admin-manager' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Actions', 'wholesale-admin-manager' ); ?></th>
				</tr>
			</tfoot>
		</table>

		<!-- ============================================================
		     PAGINATION
		     ============================================================ -->
		<?php if ( $total_pages > 1 ) : ?>
			<div class="tablenav bottom">
				<div class="tablenav-pages">
					<span class="displaying-num">
						<?php
						printf(
							esc_html( _n( '%d customer', '%d customers', $total_users, 'wholesale-admin-manager' ) ),
							esc_html( number_format_i18n( $total_users ) )
						);
						?>
					</span>
					<span class="pagination-links">
						<?php
						$base_url = add_query_arg(
							[ 'page' => 'wholesale-customers' ],
							admin_url( 'admin.php' )
						);

						if ( $current_page > 1 ) {
							printf(
								'<a class="first-page button" href="%s">«</a>',
								esc_url( add_query_arg( 'paged', 1, $base_url ) )
							);
							printf(
								'<a class="prev-page button" href="%s">‹</a>',
								esc_url( add_query_arg( 'paged', $current_page - 1, $base_url ) )
							);
						}

						printf(
							'<span class="paging-input">%d / %d</span>',
							esc_html( $current_page ),
							esc_html( $total_pages )
						);

						if ( $current_page < $total_pages ) {
							printf(
								'<a class="next-page button" href="%s">›</a>',
								esc_url( add_query_arg( 'paged', $current_page + 1, $base_url ) )
							);
							printf(
								'<a class="last-page button" href="%s">»</a>',
								esc_url( add_query_arg( 'paged', $total_pages, $base_url ) )
							);
						}
						?>
					</span>
				</div>
			</div>
		<?php endif; ?>

	</div><!-- .wrap -->
	<?php
}
