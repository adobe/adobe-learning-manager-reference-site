import React from 'react';
import Product from "./product";
import styles from "./productList.module.css"

export default function ProductList({ cartItems = [] }) {

    if (cartItems?.length === 0) {
        return <h2>Ther are no items in your cart.</h2>
    }

    const productList = cartItems.map((training) => {
        return (
            <Product training={training.product} key={training.id} />
        )
    })
    return (
        <div>
            <div className={styles.headerSection}>
                <span class={styles.headerLabel}>Item</span>
                <span class={styles.headerLabel}>Price</span>
            </div>
            {productList}
        </div>
    )
}
