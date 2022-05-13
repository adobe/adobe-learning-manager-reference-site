/**
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react";
import Product from "./product";
import styles from "./productList.module.css";

export default function ProductList({ cartItems = [], refreshCartHandler }) {
  if (cartItems?.length === 0) {
    return <h2>There are no items in your cart.</h2>;
  }

  const productList = cartItems.map((training) => {
    return (
      <Product
        training={training.product}
        key={training.id}
        itemId={training.id}
        refreshCartHandler={refreshCartHandler}
      />
    );
  });
  return (
    <div>
      <div className={styles.headerSection}>
        <span className={styles.headerLabel}>Item</span>
        <span className={styles.headerLabel}>Price</span>
      </div>
      {productList}
    </div>
  );
}
