<?php
/**
 * Wholesale enquiry orders (v4.2)
 *
 * Orders sent from the wholesale cart ("Send order by email") are created by
 * the Next.js frontend through the WooCommerce REST API with meta
 * `_wam_created_via = wholesale-enquiry`. WC REST always records
 * created_via = "rest-api", so we apply the real value here, and we switch
 * off WooCommerce's own "new order" / "order on-hold" emails for these orders
 * (the frontend already sends the store + customer emails via Resend, and the
 * on-hold template talks about awaiting payment, which doesn't apply).
 *
 * @package WholesaleAdminManager
 */

defined( 'ABSPATH' ) || exit;

defined( 'WAM_ENQUIRY_VIA' ) || define( 'WAM_ENQUIRY_VIA', 'wholesale-enquiry' );

/** True if the order was created from the wholesale cart. */
function wam_is_wholesale_enquiry( $order ): bool {
	return $order instanceof WC_Order && WAM_ENQUIRY_VIA === $order->get_meta( '_wam_created_via' );
}

// After a REST-created order is saved: set created_via + add an order note.
add_action( 'woocommerce_rest_insert_shop_order_object', 'wam_mark_enquiry_order', 10, 3 );

/**
 * @param WC_Order        $order    Inserted order.
 * @param WP_REST_Request $request  Request (unused).
 * @param bool            $creating True when the order is new.
 */
function wam_mark_enquiry_order( $order, $request, $creating ): void {
	if ( ! $creating || ! wam_is_wholesale_enquiry( $order ) ) {
		return;
	}
	$order->set_created_via( WAM_ENQUIRY_VIA );
	$order->save();

	$ref  = (string) $order->get_meta( '_wam_enquiry_ref' );
	$tier = (string) $order->get_meta( '_wam_tier' );
	$order->add_order_note(
		sprintf(
			/* translators: 1: reference, 2: tier */
			__( 'Wholesale enquiry %1$s (tier: %2$s). No online payment — confirm pricing and delivery with the customer, then move to Processing.', 'wholesale-admin-manager' ),
			$ref ?: '—',
			$tier ?: '—'
		)
	);
}

// Suppress WooCommerce's own emails for enquiry orders (Resend handles them).
add_filter( 'woocommerce_email_enabled_new_order', 'wam_disable_wc_email_for_enquiries', 10, 2 );
add_filter( 'woocommerce_email_enabled_customer_on_hold_order', 'wam_disable_wc_email_for_enquiries', 10, 2 );

/**
 * @param bool          $enabled Whether the email is enabled.
 * @param WC_Order|null $order   Order the email is for.
 */
function wam_disable_wc_email_for_enquiries( $enabled, $order = null ) {
	return wam_is_wholesale_enquiry( $order ) ? false : $enabled;
}
