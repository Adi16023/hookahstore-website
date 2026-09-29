<?php
/**
 * Tier Pricing (v4.2)
 *
 *  - User meta   `wam_tier`            gold | silver | bronze (default bronze)
 *  - Product &   `_wam_price_gold`     tier prices (decimal strings, empty = not set)
 *    variation   `_wam_price_silver`
 *    meta        `_wam_price_bronze`
 *  - Product meta `show_in_wholesale`  "1" / "0" — the existing ACF field key.
 *    (Its WPGraphQL name is `showInWholesale`; the stored meta key is
 *    `show_in_wholesale`.) If the ACF field is registered, ACF keeps owning
 *    the checkbox and this plugin does not render a duplicate.
 *
 * The Next.js frontend reads these through the authenticated WooCommerce REST
 * API (meta_data). Prices are never shown publicly: the WP REST exposure below
 * returns values only to users who can edit products.
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

// define() (not `const`) because this file is require_once'd inside wam_load_includes().
defined( 'WAM_TIERS' )           || define( 'WAM_TIERS', [ 'gold', 'silver', 'bronze' ] );
defined( 'WAM_DEFAULT_TIER' )    || define( 'WAM_DEFAULT_TIER', 'bronze' );
defined( 'WAM_TIER_META' )       || define( 'WAM_TIER_META', 'wam_tier' );
defined( 'WAM_VISIBILITY_META' ) || define( 'WAM_VISIBILITY_META', 'show_in_wholesale' );

/**
 * Human labels for tiers.
 *
 * @return array<string,string>
 */
function wam_tier_labels(): array {
	return [
		'gold'   => __( 'Gold', 'wholesale-admin-manager' ),
		'silver' => __( 'Silver', 'wholesale-admin-manager' ),
		'bronze' => __( 'Bronze', 'wholesale-admin-manager' ),
	];
}

/** Sanitize a tier value; anything unknown becomes the default tier. */
function wam_sanitize_tier( $value ): string {
	$value = sanitize_key( (string) $value );
	return in_array( $value, WAM_TIERS, true ) ? $value : WAM_DEFAULT_TIER;
}

/** Tier for a user (falls back to the default tier). */
function wam_get_user_tier( int $user_id ): string {
	return wam_sanitize_tier( get_user_meta( $user_id, WAM_TIER_META, true ) ?: WAM_DEFAULT_TIER );
}

/** Meta key for a tier price. */
function wam_price_key( string $tier ): string {
	return '_wam_price_' . $tier;
}

/**
 * Sanitize a price: '' stays '' (not set), otherwise a non-negative decimal
 * string in WooCommerce format.
 */
function wam_sanitize_price( $value ): string {
	$value = trim( (string) $value );
	if ( '' === $value ) {
		return '';
	}
	$decimal = function_exists( 'wc_format_decimal' ) ? wc_format_decimal( $value ) : (string) (float) $value;
	return ( is_numeric( $decimal ) && (float) $decimal >= 0 ) ? (string) $decimal : '';
}

/** Save (or clear) one tier price on a product / variation. */
function wam_update_price_meta( int $post_id, string $tier, $raw ): void {
	$price = wam_sanitize_price( $raw );
	if ( '' === $price ) {
		delete_post_meta( $post_id, wam_price_key( $tier ) );
	} else {
		update_post_meta( $post_id, wam_price_key( $tier ), $price );
	}
}

/** True when ACF already provides the "show in wholesale" field. */
function wam_acf_owns_visibility_field(): bool {
	return function_exists( 'acf_get_field' ) && (bool) acf_get_field( WAM_VISIBILITY_META );
}

// ---------------------------------------------------------------------------
// register_meta — sanitization, auth and (restricted) REST exposure
// ---------------------------------------------------------------------------

add_action( 'init', 'wam_register_tier_meta' );

function wam_register_tier_meta(): void {
	$can_manage = static fn(): bool => current_user_can( 'manage_woocommerce' );

	// Values only for privileged users; everyone else gets null (no public prices).
	$private_rest = [
		'schema'           => [ 'type' => 'string' ],
		'prepare_callback' => static fn( $value ) => current_user_can( 'edit_products' ) ? $value : null,
	];

	register_meta( 'user', WAM_TIER_META, [
		'type'              => 'string',
		'single'            => true,
		'default'           => WAM_DEFAULT_TIER,
		'sanitize_callback' => 'wam_sanitize_tier',
		'auth_callback'     => $can_manage,
		'show_in_rest'      => [
			'schema'           => [ 'type' => 'string', 'enum' => WAM_TIERS ],
			'prepare_callback' => static fn( $value ) => current_user_can( 'list_users' ) ? $value : null,
		],
	] );

	foreach ( [ 'product', 'product_variation' ] as $post_type ) {
		foreach ( WAM_TIERS as $tier ) {
			register_post_meta( $post_type, wam_price_key( $tier ), [
				'type'              => 'string',
				'single'            => true,
				'sanitize_callback' => 'wam_sanitize_price',
				'auth_callback'     => $can_manage,
				'show_in_rest'      => $private_rest,
			] );
		}
	}

	// Only register the visibility flag when ACF isn't already managing it.
	if ( ! wam_acf_owns_visibility_field() ) {
		register_post_meta( 'product', WAM_VISIBILITY_META, [
			'type'              => 'string',
			'single'            => true,
			'sanitize_callback' => static fn( $v ): string => '1' === (string) $v ? '1' : '0',
			'auth_callback'     => $can_manage,
			'show_in_rest'      => true, // visibility is not sensitive
		] );
	}
}

// ---------------------------------------------------------------------------
// Product edit screen — "Wholesale Pricing" meta box
// ---------------------------------------------------------------------------

add_action( 'add_meta_boxes_product', 'wam_add_pricing_meta_box' );

function wam_add_pricing_meta_box(): void {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	add_meta_box(
		'wam_wholesale_pricing',
		__( 'Wholesale Pricing', 'wholesale-admin-manager' ),
		'wam_render_pricing_meta_box',
		'product',
		'side',
		'high'
	);
}

function wam_render_pricing_meta_box( WP_Post $post ): void {
	wp_nonce_field( 'wam_save_pricing', 'wam_pricing_nonce' );
	$product     = function_exists( 'wc_get_product' ) ? wc_get_product( $post->ID ) : null;
	$is_variable = $product && $product->is_type( 'variable' );
	?>
	<p style="margin-top:0;color:#646970;">
		<?php
		echo $is_variable
			? esc_html__( 'Default tier prices. Each variation can override these under Product data → Variations.', 'wholesale-admin-manager' )
			: esc_html__( 'Price shown to approved wholesalers of each tier. Leave empty for "Price on request".', 'wholesale-admin-manager' );
		?>
	</p>
	<?php foreach ( wam_tier_labels() as $tier => $label ) : ?>
		<p>
			<label for="wam_price_<?php echo esc_attr( $tier ); ?>"><strong><?php echo esc_html( $label ); ?></strong> (<?php echo esc_html( function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol() : '₹' ); ?>)</label><br />
			<input
				type="text"
				inputmode="decimal"
				id="wam_price_<?php echo esc_attr( $tier ); ?>"
				name="wam_price[<?php echo esc_attr( $tier ); ?>]"
				value="<?php echo esc_attr( (string) get_post_meta( $post->ID, wam_price_key( $tier ), true ) ); ?>"
				class="widefat"
				placeholder="<?php esc_attr_e( 'Not set', 'wholesale-admin-manager' ); ?>"
			/>
		</p>
	<?php endforeach; ?>

	<hr />
	<?php if ( wam_acf_owns_visibility_field() ) : ?>
		<p style="color:#646970;">
			<?php esc_html_e( '"Show in wholesale" is managed by the ACF field on this screen.', 'wholesale-admin-manager' ); ?>
		</p>
	<?php else : ?>
		<input type="hidden" name="wam_visibility_present" value="1" />
		<label>
			<input
				type="checkbox"
				name="wam_show_in_wholesale"
				value="1"
				<?php checked( '1', (string) get_post_meta( $post->ID, WAM_VISIBILITY_META, true ) ); ?>
			/>
			<?php esc_html_e( 'Show in wholesale', 'wholesale-admin-manager' ); ?>
		</label>
		<p style="color:#646970;margin-bottom:0;">
			<?php esc_html_e( 'Only ticked products appear on wholesale.thehookahstore.in.', 'wholesale-admin-manager' ); ?>
		</p>
	<?php endif; ?>
	<?php
}

// Priority 20: after ACF (10), so an explicit choice in this box wins.
add_action( 'save_post_product', 'wam_save_pricing_meta_box', 20 );

function wam_save_pricing_meta_box( int $post_id ): void {
	if ( ! isset( $_POST['wam_pricing_nonce'] ) ) {
		return;
	}
	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wam_pricing_nonce'] ) ), 'wam_save_pricing' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_woocommerce' ) || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$prices = isset( $_POST['wam_price'] ) && is_array( $_POST['wam_price'] )
		? wp_unslash( $_POST['wam_price'] ) // sanitized per value in wam_update_price_meta()
		: [];

	foreach ( WAM_TIERS as $tier ) {
		wam_update_price_meta( $post_id, $tier, $prices[ $tier ] ?? '' );
	}

	if ( isset( $_POST['wam_visibility_present'] ) && ! wam_acf_owns_visibility_field() ) {
		update_post_meta( $post_id, WAM_VISIBILITY_META, isset( $_POST['wam_show_in_wholesale'] ) ? '1' : '0' );
	}
}

// ---------------------------------------------------------------------------
// Variations — 3 tier price fields per variation
// ---------------------------------------------------------------------------

add_action( 'woocommerce_variation_options_pricing', 'wam_render_variation_prices', 10, 3 );

/**
 * @param int     $loop           Variation index.
 * @param array   $variation_data Variation data (unused).
 * @param WP_Post $variation      Variation post.
 */
function wam_render_variation_prices( $loop, $variation_data, $variation ): void {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$loop   = absint( $loop );
	$labels = wam_tier_labels();
	$i      = 0;
	foreach ( WAM_TIERS as $tier ) {
		$class = ( 0 === $i % 2 ) ? 'form-row form-row-first' : 'form-row form-row-last';
		woocommerce_wp_text_input( [
			'id'            => "wam_variation_price_{$tier}_{$loop}",
			'name'          => "wam_variation_price[{$tier}][{$loop}]",
			'value'         => (string) get_post_meta( $variation->ID, wam_price_key( $tier ), true ),
			/* translators: %s: tier name (Gold / Silver / Bronze) */
			'label'         => sprintf( __( 'Wholesale %s price', 'wholesale-admin-manager' ), $labels[ $tier ] ) . ' (' . get_woocommerce_currency_symbol() . ')',
			'placeholder'   => __( 'Uses product default', 'wholesale-admin-manager' ),
			'data_type'     => 'price',
			'wrapper_class' => $class,
		] );
		$i++;
	}
}

add_action( 'woocommerce_save_product_variation', 'wam_save_variation_prices', 10, 2 );

/**
 * WooCommerce verifies its own nonce ('save-variations' / product meta nonce)
 * before firing this hook; we add the capability check.
 *
 * @param int $variation_id Variation ID.
 * @param int $i            Variation index in the submitted form.
 */
function wam_save_variation_prices( $variation_id, $i ): void {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	if ( ! isset( $_POST['wam_variation_price'] ) || ! is_array( $_POST['wam_variation_price'] ) ) {
		return;
	}
	$submitted = wp_unslash( $_POST['wam_variation_price'] ); // sanitized in wam_update_price_meta()
	foreach ( WAM_TIERS as $tier ) {
		if ( isset( $submitted[ $tier ] ) && is_array( $submitted[ $tier ] ) && array_key_exists( $i, $submitted[ $tier ] ) ) {
			wam_update_price_meta( (int) $variation_id, $tier, $submitted[ $tier ][ $i ] );
		}
	}
}

// ---------------------------------------------------------------------------
// User profile — tier dropdown (admins / shop managers only)
// ---------------------------------------------------------------------------

add_action( 'show_user_profile', 'wam_render_profile_tier' );
add_action( 'edit_user_profile', 'wam_render_profile_tier' );

function wam_render_profile_tier( WP_User $user ): void {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$current = wam_get_user_tier( (int) $user->ID );
	?>
	<h2 id="wam-tier"><?php esc_html_e( 'Wholesale', 'wholesale-admin-manager' ); ?></h2>
	<table class="form-table" role="presentation">
		<tr>
			<th><label for="wam_tier"><?php esc_html_e( 'Pricing tier', 'wholesale-admin-manager' ); ?></label></th>
			<td>
				<?php wam_render_tier_select( 'wam_tier', $current, 'wam_tier' ); ?>
				<p class="description"><?php esc_html_e( 'Which wholesale price list this customer sees. They see the new tier on their next price load.', 'wholesale-admin-manager' ); ?></p>
			</td>
		</tr>
	</table>
	<?php
}

add_action( 'personal_options_update', 'wam_save_profile_tier' );
add_action( 'edit_user_profile_update', 'wam_save_profile_tier' );

/**
 * Core verifies the 'update-user_{id}' nonce before these hooks fire.
 */
function wam_save_profile_tier( int $user_id ): void {
	if ( ! current_user_can( 'manage_woocommerce' ) || ! current_user_can( 'edit_user', $user_id ) ) {
		return;
	}
	if ( ! isset( $_POST['wam_tier'] ) ) {
		return;
	}
	update_user_meta( $user_id, WAM_TIER_META, wam_sanitize_tier( wp_unslash( $_POST['wam_tier'] ) ) );
}

/**
 * Shared tier <select> (profile + approve forms).
 */
function wam_render_tier_select( string $name, string $selected = WAM_DEFAULT_TIER, string $id = '' ): void {
	?>
	<select name="<?php echo esc_attr( $name ); ?>" <?php echo $id ? 'id="' . esc_attr( $id ) . '"' : ''; ?> aria-label="<?php esc_attr_e( 'Pricing tier', 'wholesale-admin-manager' ); ?>">
		<?php foreach ( wam_tier_labels() as $tier => $label ) : ?>
			<option value="<?php echo esc_attr( $tier ); ?>" <?php selected( $selected, $tier ); ?>><?php echo esc_html( $label ); ?></option>
		<?php endforeach; ?>
	</select>
	<?php
}
