<?php
/**
 * Applications Page
 *
 * Renders the WordPress admin table listing all users with role
 * `wholesale_pending`. Table shows 5 columns only: Name, Email,
 * Business Name, Documents, Actions.
 *
 * Full application details (address, phone, GST, website, date,
 * documents) are revealed via a JS modal when the "View" button
 * is clicked. Approve / Reject are available in both the table
 * row and inside the modal.
 *
 * Approval logic lives in includes/actions.php — unchanged.
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

// ---------------------------------------------------------------------------
// Admin-notice renderer
// ---------------------------------------------------------------------------

/**
 * Display an inline admin notice based on the `wam_msg` query arg.
 */
function wam_maybe_show_notice(): void {
	if ( empty( $_GET['wam_msg'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}

	$msg  = sanitize_text_field( wp_unslash( $_GET['wam_msg'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
	$type = 'updated';
	$text = '';

	switch ( $msg ) {
		case 'approved':
			$text = __( 'Application approved. The user has been granted wholesale access.', 'wholesale-admin-manager' );
			break;
		case 'rejected':
			$text = __( 'Application rejected. The user has been converted to a standard customer.', 'wholesale-admin-manager' );
			$type = 'notice-warning';
			break;
		case 'error':
			$text = __( 'An error occurred. The user may not exist or may not be a pending wholesale applicant.', 'wholesale-admin-manager' );
			$type = 'notice-error';
			break;
	}

	if ( $text ) {
		printf(
			'<div class="notice %s is-dismissible"><p>%s</p></div>',
			esc_attr( $type ),
			esc_html( $text )
		);
	}
}

// ---------------------------------------------------------------------------
// Main page render callback
// ---------------------------------------------------------------------------

/**
 * Render the Wholesale Applications admin page.
 */
function wam_render_applications_page(): void {

	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'wholesale-admin-manager' ) );
	}

	// ------------------------------------------------------------------
	// Read GET parameters (read-only — no nonce needed).
	// ------------------------------------------------------------------
	$search_email = isset( $_GET['s'] )    ? sanitize_email( wp_unslash( $_GET['s'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$current_page = isset( $_GET['paged'] ) ? max( 1, absint( $_GET['paged'] ) )         : 1;
	$per_page     = 20;

	// ------------------------------------------------------------------
	// WP_User_Query
	// ------------------------------------------------------------------
	$query_args = [
		'role'    => 'wholesale_pending',
		'number'  => $per_page,
		'offset'  => ( $current_page - 1 ) * $per_page,
		'orderby' => 'registered',
		'order'   => 'DESC',
	];

	if ( $search_email ) {
		$query_args['search']         = '*' . $search_email . '*';
		$query_args['search_columns'] = [ 'user_email' ];
	}

	// Total count for pagination.
	$count_args                = $query_args;
	$count_args['number']      = -1;
	$count_args['offset']      = 0;
	$count_args['count_total'] = true;
	$count_query               = new WP_User_Query( $count_args );
	$total_users               = (int) $count_query->get_total();
	$total_pages               = (int) ceil( $total_users / $per_page );

	$user_query = new WP_User_Query( $query_args );
	$users      = $user_query->get_results();

	// ------------------------------------------------------------------
	// Render
	// ------------------------------------------------------------------
	?>
	<div class="wrap">

		<h1 class="wp-heading-inline">
			<?php esc_html_e( 'Wholesale Applications', 'wholesale-admin-manager' ); ?>
		</h1>
		<span style="display:inline-block;background:#2271b1;color:#fff;border-radius:10px;font-size:11px;font-weight:600;padding:2px 8px;margin-left:8px;vertical-align:middle;">
			<?php echo esc_html( $total_users ); ?>
		</span>

		<?php wam_maybe_show_notice(); ?>

		<!-- ============================================================
		     SEARCH FORM
		     ============================================================ -->
		<div style="margin:16px 0;">
			<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?>" style="display:flex;gap:8px;align-items:center;">
				<input type="hidden" name="page" value="wholesale-applications" />
				<input
					type="email"
					name="s"
					id="wam-search-email"
					placeholder="<?php esc_attr_e( 'Search by email…', 'wholesale-admin-manager' ); ?>"
					value="<?php echo esc_attr( $search_email ); ?>"
					style="min-width:260px;"
					class="regular-text"
				/>
				<?php submit_button( __( 'Search', 'wholesale-admin-manager' ), 'secondary', 'submit', false ); ?>
				<?php if ( $search_email ) : ?>
					<a
						href="<?php echo esc_url( admin_url( 'admin.php?page=wholesale-applications' ) ); ?>"
						class="button"
					><?php esc_html_e( 'Reset', 'wholesale-admin-manager' ); ?></a>
				<?php endif; ?>
			</form>
		</div>

		<!-- ============================================================
		     APPLICATIONS TABLE  (5 columns)
		     ============================================================ -->
		<table class="wp-list-table widefat fixed striped" style="margin-top:0;">
			<thead>
				<tr>
					<th scope="col" style="width:18%;"><?php esc_html_e( 'Name',          'wholesale-admin-manager' ); ?></th>
					<th scope="col" style="width:22%;"><?php esc_html_e( 'Email',         'wholesale-admin-manager' ); ?></th>
					<th scope="col" style="width:22%;"><?php esc_html_e( 'Business Name', 'wholesale-admin-manager' ); ?></th>
					<th scope="col" style="width:16%;"><?php esc_html_e( 'Documents',     'wholesale-admin-manager' ); ?></th>
					<th scope="col" style="width:22%;"><?php esc_html_e( 'Actions',       'wholesale-admin-manager' ); ?></th>
				</tr>
			</thead>
			<tbody>
			<?php if ( empty( $users ) ) : ?>
				<tr>
					<td colspan="5" style="text-align:center;padding:24px;color:#777;">
						<?php esc_html_e( 'No pending wholesale applications found.', 'wholesale-admin-manager' ); ?>
					</td>
				</tr>
			<?php else : ?>
				<?php foreach ( $users as $user ) :
					$user_id = (int) $user->ID;
					$meta    = array_map(
						fn( $v ) => $v[0] ?? '',
						get_user_meta( $user_id )
					);
					$m = fn( string $key ): string => isset( $meta[ $key ] ) ? (string) $meta[ $key ] : '';

					$business_name    = $m( 'business_name' );
					$business_address = $m( 'business_address' );
					$business_phone   = $m( 'business_phone' );
					$gst_number       = $m( 'gst_number' );
					// Applicant-supplied URLs: only http/https survive (blocks javascript:, data: …).
					$business_website = wam_safe_url( $m( 'business_website' ) );
					$gst_cert_url     = wam_safe_url( $m( 'gst_certificate_url' ) );
					$license_url      = wam_safe_url( $m( 'business_license_url' ) );
					$identity_url     = wam_safe_url( $m( 'identity_document_url' ) );

					$doc_count = (int) (bool) $gst_cert_url + (int) (bool) $license_url + (int) (bool) $identity_url;

					$submitted_date = $user->user_registered
						? wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $user->user_registered ) )
						: '—';

					// Build a JSON data blob for the modal — all values escaped for JS output.
					$modal_data = wp_json_encode( [
						'id'               => $user_id,
						'name'             => $user->display_name,
						'email'            => $user->user_email,
						'editUrl'          => get_edit_user_link( $user_id ),
						'business_name'    => $business_name,
						'business_address' => $business_address,
						'business_phone'   => $business_phone,
						'gst_number'       => $gst_number,
						'business_website' => $business_website,
						'gst_cert_url'     => $gst_cert_url,
						'license_url'      => $license_url,
						'identity_url'     => $identity_url,
						'submitted_date'   => $submitted_date,
						// Nonces are tied to this user ID — a nonce can't be replayed for another applicant.
						'approveNonce'     => wp_create_nonce( 'approve_wholesale_user_' . $user_id ),
						'rejectNonce'      => wp_create_nonce( 'reject_wholesale_user_' . $user_id ),
					] );
				?>
				<tr>
					<!-- Name -->
					<td>
						<a href="<?php echo esc_url( get_edit_user_link( $user_id ) ); ?>" style="font-weight:600;">
							<?php echo esc_html( $user->display_name ); ?>
						</a>
					</td>

					<!-- Email -->
					<td>
						<a href="mailto:<?php echo esc_attr( $user->user_email ); ?>">
							<?php echo esc_html( $user->user_email ); ?>
						</a>
					</td>

					<!-- Business Name -->
					<td><?php echo esc_html( $business_name ?: '—' ); ?></td>

					<!-- Documents summary -->
					<td>
						<?php if ( $doc_count > 0 ) : ?>
							<span style="color:#2271b1;font-weight:600;">
								<?php
								printf(
									/* translators: %d: number of documents */
									esc_html( _n( '%d file', '%d files', $doc_count, 'wholesale-admin-manager' ) ),
									(int) $doc_count
								);
								?>
							</span>
						<?php else : ?>
							<span style="color:#999;"><?php esc_html_e( 'None', 'wholesale-admin-manager' ); ?></span>
						<?php endif; ?>
					</td>

					<!-- Actions -->
					<td>
						<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">

							<!-- View button — opens modal -->
							<button
								type="button"
								class="button"
								onclick="wamOpenModal(<?php echo esc_attr( $modal_data ); ?>)"
								style="min-width:52px;"
							>
								<?php esc_html_e( 'View', 'wholesale-admin-manager' ); ?>
							</button>

							<!-- Approve form -->
							<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
								<input type="hidden" name="action"  value="approve_wholesale_user" />
								<input type="hidden" name="user_id" value="<?php echo esc_attr( $user_id ); ?>" />
								<?php wp_nonce_field( 'approve_wholesale_user_' . $user_id, 'wam_nonce' ); ?>
								<?php wam_render_tier_select( 'wam_tier', WAM_DEFAULT_TIER ); ?>
								<button
									type="submit"
									class="button button-primary"
									onclick="return confirm('<?php echo esc_js( __( 'Approve this wholesale application?', 'wholesale-admin-manager' ) ); ?>')"
									style="min-width:64px;"
								>
									<?php esc_html_e( 'Approve', 'wholesale-admin-manager' ); ?>
								</button>
							</form>

							<!-- Reject form -->
							<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
								<input type="hidden" name="action"  value="reject_wholesale_user" />
								<input type="hidden" name="user_id" value="<?php echo esc_attr( $user_id ); ?>" />
								<?php wp_nonce_field( 'reject_wholesale_user_' . $user_id, 'wam_nonce' ); ?>
								<button
									type="submit"
									class="button"
									onclick="return confirm('<?php echo esc_js( __( 'Reject this application? The user will become a standard customer.', 'wholesale-admin-manager' ) ); ?>')"
									style="color:#b32d2e;border-color:#b32d2e;min-width:56px;"
								>
									<?php esc_html_e( 'Reject', 'wholesale-admin-manager' ); ?>
								</button>
							</form>

						</div>
					</td>
				</tr>
				<?php endforeach; ?>
			<?php endif; ?>
			</tbody>
			<tfoot>
				<tr>
					<th><?php esc_html_e( 'Name',          'wholesale-admin-manager' ); ?></th>
					<th><?php esc_html_e( 'Email',         'wholesale-admin-manager' ); ?></th>
					<th><?php esc_html_e( 'Business Name', 'wholesale-admin-manager' ); ?></th>
					<th><?php esc_html_e( 'Documents',     'wholesale-admin-manager' ); ?></th>
					<th><?php esc_html_e( 'Actions',       'wholesale-admin-manager' ); ?></th>
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
							/* translators: %d: total number of applications */
							esc_html( _n( '%d application', '%d applications', $total_users, 'wholesale-admin-manager' ) ),
							esc_html( number_format_i18n( $total_users ) )
						);
						?>
					</span>
					<span class="pagination-links">
						<?php
						$base_url = add_query_arg(
							[ 'page' => 'wholesale-applications', 's' => $search_email ],
							admin_url( 'admin.php' )
						);
						if ( $current_page > 1 ) {
							printf( '<a class="first-page button" href="%s" title="%s">«</a>', esc_url( add_query_arg( 'paged', 1, $base_url ) ), esc_attr__( 'First page', 'wholesale-admin-manager' ) );
							printf( '<a class="prev-page button"  href="%s" title="%s">‹</a>', esc_url( add_query_arg( 'paged', max( 1, $current_page - 1 ), $base_url ) ), esc_attr__( 'Previous page', 'wholesale-admin-manager' ) );
						}
						printf( '<span class="paging-input">%d / %d</span>', esc_html( $current_page ), esc_html( $total_pages ) );
						if ( $current_page < $total_pages ) {
							printf( '<a class="next-page button" href="%s" title="%s">›</a>', esc_url( add_query_arg( 'paged', min( $total_pages, $current_page + 1 ), $base_url ) ), esc_attr__( 'Next page', 'wholesale-admin-manager' ) );
							printf( '<a class="last-page button" href="%s" title="%s">»</a>', esc_url( add_query_arg( 'paged', $total_pages, $base_url ) ), esc_attr__( 'Last page', 'wholesale-admin-manager' ) );
						}
						?>
					</span>
				</div>
			</div>
		<?php endif; ?>

	</div><!-- .wrap -->

	<!-- ================================================================
	     DETAIL MODAL (hidden by default, populated by JS)
	     ================================================================ -->
	<div id="wam-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100000;overflow-y:auto;padding:40px 20px;">
		<div id="wam-modal-box" style="background:#fff;border-radius:4px;max-width:640px;margin:0 auto;padding:0;box-shadow:0 8px 40px rgba(0,0,0,.25);position:relative;">

			<!-- Modal header -->
			<div style="background:#f6f7f7;border-bottom:1px solid #dcdcde;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:4px 4px 0 0;">
				<h2 style="margin:0;font-size:16px;font-weight:600;color:#1d2327;">
					<?php esc_html_e( 'Application Details', 'wholesale-admin-manager' ); ?>
				</h2>
				<button
					type="button"
					onclick="wamCloseModal()"
					style="background:none;border:none;cursor:pointer;font-size:22px;color:#666;line-height:1;padding:0 4px;"
					aria-label="<?php esc_attr_e( 'Close', 'wholesale-admin-manager' ); ?>"
				>×</button>
			</div>

			<!-- Modal body -->
			<div style="padding:20px 24px;">

				<!-- Applicant Info -->
				<table class="widefat" style="margin-bottom:20px;border:1px solid #dcdcde;">
					<tbody>
						<tr>
							<th style="width:36%;background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Name',             'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><span id="wam-m-name"></span></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Email',            'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><a id="wam-m-email-link" href="#"></a></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Business Name',    'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><span id="wam-m-business-name"></span></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Business Address', 'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><span id="wam-m-address"></span></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Phone',            'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><span id="wam-m-phone"></span></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'GST Number',       'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><code id="wam-m-gst"></code></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Website',          'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><a id="wam-m-website" href="#" target="_blank" rel="noopener noreferrer"></a></td>
						</tr>
						<tr>
							<th style="background:#f6f7f7;font-weight:600;padding:8px 12px;"><?php esc_html_e( 'Submitted',        'wholesale-admin-manager' ); ?></th>
							<td style="padding:8px 12px;"><span id="wam-m-date"></span></td>
						</tr>
					</tbody>
				</table>

				<!-- Documents -->
				<div style="margin-bottom:20px;">
					<h3 style="font-size:13px;font-weight:600;color:#1d2327;margin:0 0 8px;text-transform:uppercase;letter-spacing:.04em;">
						<?php esc_html_e( 'Documents', 'wholesale-admin-manager' ); ?>
					</h3>
					<div id="wam-m-docs" style="display:flex;flex-direction:column;gap:6px;"></div>
				</div>

			</div><!-- /.padding -->

			<!-- Modal footer — actions -->
			<div style="background:#f6f7f7;border-top:1px solid #dcdcde;padding:14px 24px;display:flex;gap:8px;justify-content:flex-end;border-radius:0 0 4px 4px;">

				<!-- Close -->
				<button type="button" class="button" onclick="wamCloseModal()">
					<?php esc_html_e( 'Close', 'wholesale-admin-manager' ); ?>
				</button>

				<!-- Reject form (inside modal) -->
				<form id="wam-modal-reject-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
					<input type="hidden" name="action"   value="reject_wholesale_user" />
					<input type="hidden" name="user_id"  id="wam-modal-reject-uid" value="" />
					<input type="hidden" name="wam_nonce" id="wam-modal-reject-nonce" value="" />
					<button
						type="submit"
						class="button"
						onclick="return confirm('<?php echo esc_js( __( 'Reject this application? The user will become a standard customer.', 'wholesale-admin-manager' ) ); ?>')"
						style="color:#b32d2e;border-color:#b32d2e;"
					>
						<?php esc_html_e( 'Reject', 'wholesale-admin-manager' ); ?>
					</button>
				</form>

				<!-- Approve form (inside modal) -->
				<form id="wam-modal-approve-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
					<input type="hidden" name="action"   value="approve_wholesale_user" />
					<input type="hidden" name="user_id"  id="wam-modal-approve-uid" value="" />
					<input type="hidden" name="wam_nonce" id="wam-modal-approve-nonce" value="" />
					<label for="wam-modal-approve-tier" style="margin-right:4px;"><?php esc_html_e( 'Tier', 'wholesale-admin-manager' ); ?></label>
					<?php wam_render_tier_select( 'wam_tier', WAM_DEFAULT_TIER, 'wam-modal-approve-tier' ); ?>
					<button
						type="submit"
						class="button button-primary"
						onclick="return confirm('<?php echo esc_js( __( 'Approve this wholesale application?', 'wholesale-admin-manager' ) ); ?>')"
					>
						<?php esc_html_e( 'Approve', 'wholesale-admin-manager' ); ?>
					</button>
				</form>

			</div>
		</div>
	</div><!-- #wam-modal-overlay -->

	<!-- ================================================================
	     MODAL JAVASCRIPT
	     ================================================================ -->
	<script>
	/**
	 * wamOpenModal( data )
	 *
	 * Populates and shows the application detail modal.
	 * `data` is a JSON object emitted inline by PHP (already escaped).
	 */
	function wamOpenModal( data ) {
		var or = '';

		// Helper: only allow http(s) links (defence in depth — PHP already filters).
		function safeUrl( u ) {
			return ( typeof u === 'string' && /^https?:\/\//i.test( u ) ) ? u : '';
		}

		// Helper: set text content safely.
		function setText( id, val ) {
			var el = document.getElementById( id );
			if ( el ) el.textContent = val || '—';
		}

		// Applicant fields.
		setText( 'wam-m-name',          data.name );
		setText( 'wam-m-business-name', data.business_name );
		setText( 'wam-m-address',       data.business_address );
		setText( 'wam-m-phone',         data.business_phone );
		setText( 'wam-m-gst',           data.gst_number );
		setText( 'wam-m-date',          data.submitted_date );

		// Email link.
		var emailLink = document.getElementById( 'wam-m-email-link' );
		if ( emailLink ) {
			emailLink.textContent = data.email || '—';
			emailLink.href = data.email ? 'mailto:' + data.email : '#';
		}

		// Website link.
		var websiteEl = document.getElementById( 'wam-m-website' );
		if ( websiteEl ) {
			if ( safeUrl( data.business_website ) ) {
				websiteEl.textContent = data.business_website;
				websiteEl.href        = safeUrl( data.business_website );
				websiteEl.style.display = '';
			} else {
				websiteEl.textContent   = '—';
				websiteEl.href          = '#';
				websiteEl.style.display = '';
			}
		}

		// Documents section.
		var docsEl = document.getElementById( 'wam-m-docs' );
		if ( docsEl ) {
			docsEl.innerHTML = '';
			var docs = [
				{ label: '📄 GST Certificate',  url: safeUrl( data.gst_cert_url ) },
				{ label: '📄 Business License', url: safeUrl( data.license_url )  },
				{ label: '🪪 Identity Document', url: safeUrl( data.identity_url ) },
			];
			var hasDoc = false;
			docs.forEach( function( doc ) {
				if ( ! doc.url ) return;
				hasDoc = true;
				var a  = document.createElement( 'a' );
				a.href   = doc.url;
				a.target = '_blank';
				a.rel    = 'noopener noreferrer';
				a.textContent = doc.label;
				a.style.cssText = 'display:inline-block;padding:4px 10px;background:#f0f6fc;border:1px solid #b3d1f5;border-radius:3px;color:#2271b1;text-decoration:none;font-size:13px;';
				docsEl.appendChild( a );
			} );
			if ( ! hasDoc ) {
				var span = document.createElement( 'span' );
				span.textContent  = 'No documents uploaded.';
				span.style.color  = '#999';
				span.style.fontSize = '13px';
				docsEl.appendChild( span );
			}
		}

		// Wire nonces into the modal forms.
		document.getElementById( 'wam-modal-approve-uid' ).value   = data.id;
		document.getElementById( 'wam-modal-approve-nonce' ).value = data.approveNonce;
		document.getElementById( 'wam-modal-reject-uid' ).value    = data.id;
		document.getElementById( 'wam-modal-reject-nonce' ).value  = data.rejectNonce;

		// Show the overlay.
		document.getElementById( 'wam-modal-overlay' ).style.display = 'block';
		document.body.style.overflow = 'hidden';
	}

	function wamCloseModal() {
		document.getElementById( 'wam-modal-overlay' ).style.display = 'none';
		document.body.style.overflow = '';
	}

	// Close on overlay click (outside the modal box).
	document.getElementById( 'wam-modal-overlay' ).addEventListener( 'click', function( e ) {
		if ( e.target === this ) wamCloseModal();
	} );

	// Close on Escape key.
	document.addEventListener( 'keydown', function( e ) {
		if ( e.key === 'Escape' ) wamCloseModal();
	} );
	</script>
	<?php
}
