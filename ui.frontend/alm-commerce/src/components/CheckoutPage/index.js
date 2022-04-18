import React from 'react';
import { useCartContext } from "../../contextProviders/CartContextProvider";
import ProductList from "../CheckoutPage";

export default function CheckoutPage() {

    const { cartItems,
        hasItems,
        isCartUpdating,
        shouldShowLoadingIndicator, totalQuantity, prices = {} } = useCartContext();
    const totalPrice = prices["grand_total"]?.value || 0;
    return (
        <div>
            <div>hasItems : {hasItems}</div>
            <div>isCartUpdating : {isCartUpdating}</div>
            <div>shouldShowLoadingIndicator : {shouldShowLoadingIndicator}</div>
            <ProductList cartItems={cartItems} />
            <div>
                {totalQuantity} , {totalPrice}
            </div>
        </div>
    )
}
