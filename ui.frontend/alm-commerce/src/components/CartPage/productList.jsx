import React from 'react';
import Product from "./product";

export default function ProductList({ cartItems = [] }) {

    const productList = cartItems.map((training) => {
        return (
            <Product training={training.product} key={training.id} />
        )
    })
    return (
        cartItems.length ? (<div> {productList}</div>) : "No items in cart"
    )
}
