import React from 'react';
import ProductList from "../CheckoutPage";
import { useCheckoutPage } from '../../hooks/CheckoutPage/useCheckout';
import { useCartPage } from "../../hooks/CartPage/useCartPage";


export default function CheckoutPage() {

    const {
        // cartItems,
        hasItems,
        isCartUpdating,
        shouldShowLoadingIndicator, totalQuantity,
        // prices = {}
    } = useCartPage();

    // // const totalPrice = prices["grand_total"]?.value || 0;

    const { error, paymentModes } = useCheckoutPage();
    console.log(paymentModes)
    return (
        <div>
            Checkout page {hasItems ? "Y" : "N"}
            {/* <ProductList cartItems={cartItems} /> */}
            <div>
                {totalQuantity}
            </div>
        </div>
    )
}
