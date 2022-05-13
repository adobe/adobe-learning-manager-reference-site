/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import CommerceLoader from "../Common/Loader";
import styles from "./cartPage.module.css";
import OrderSummary from "./orderSummary";
import ProductList from "./productList";

const CartPage = (props) => {
  const {
    cartItems,
    hasItems,
    shouldShowLoadingIndicator,
    prices = {},
    proceedToCheckout,
    refreshCartHandler,
  } = useCartPage();

  const totalPrice = prices["grand_total"] || {};

  if (shouldShowLoadingIndicator) {
    return <CommerceLoader size="L"></CommerceLoader>;
  }
  return (
    <div className={styles.pageContainer}>
      <h1>Shopping Cart</h1>
      <div className={styles.cartPageContainer}>
        <div className={styles.productList}>
          <ProductList
            cartItems={cartItems}
            refreshCartHandler={refreshCartHandler}
          />
        </div>
        {hasItems && (
          <div className={styles.orderSummary}>
            <OrderSummary
              buttonLabel={"Proceed to Checkout"}
              clickHandler={proceedToCheckout}
              totalPrice={totalPrice}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

/**
 * 
 // console.log(GET_CART_DETAILS);

  const talonProps = useCartPage();

  //   if (loading) return "Loading...";
  //   if (error) return `Error! ${error.message}`;
  //   const talonProps = useCartPage({
  //     operations: getCartDetailsQuery,
  //   });

  const {
    cartItems,
    hasItems,
    isCartUpdating,
    fetchCartDetails,
    onAddToWishlistSuccess,
    setIsCartUpdating,
    shouldShowLoadingIndicator,
    wishlistSuccessProps,
  } = talonProps;

  const classes = useStyle(defaultClasses, props.classes);
  const [, { addToast }] = useToasts();

  useEffect(() => {
    if (wishlistSuccessProps) {
      addToast({ ...wishlistSuccessProps, icon: CheckIcon });
    }
  }, [addToast, wishlistSuccessProps]);

  if (shouldShowLoadingIndicator) {
    return fullPageLoadingIndicator;
  }

  const productListing = hasItems ? (
    <ProductListing
      onAddToWishlistSuccess={onAddToWishlistSuccess}
      setIsCartUpdating={setIsCartUpdating}
      fetchCartDetails={fetchCartDetails}
    />
  ) : (
    <h3>
      <FormattedMessage
        id={"cartPage.emptyCart"}
        defaultMessage={"There are no items in your cart."}
      />
    </h3>
  );

  const priceAdjustments = hasItems ? (
    <PriceAdjustments setIsCartUpdating={setIsCartUpdating} />
  ) : null;

  const priceSummary = hasItems ? (
    <PriceSummary isUpdating={isCartUpdating} />
  ) : null;

  return (
    <div className={classes.root}>
      <div className={classes.heading_container}>
        <h1 className={classes.heading}>
          <FormattedMessage id={"cartPage.heading"} defaultMessage={"Cart"} />
        </h1>
        <div className={classes.stockStatusMessageContainer}>
          <StockStatusMessage cartItems={cartItems} />
        </div>
      </div>
      <div className={classes.body}>
        <div className={classes.items_container}>{productListing}</div>
        <div className={classes.price_adjustments_container}>
          {priceAdjustments}
        </div>
        <div className={classes.summary_container}>
          <div className={classes.summary_contents}>{priceSummary}</div>
        </div>
      </div>
    </div>
  );
 */
