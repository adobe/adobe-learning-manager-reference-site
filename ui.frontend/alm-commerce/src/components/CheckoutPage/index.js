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

import { Button } from "@adobe/react-spectrum";
import dropin from "braintree-web-drop-in";
import React, { useEffect, useRef, useState } from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import { useCheckoutPage } from "../../hooks/CheckoutPage/useCheckoutPage";
import { formatPrice } from "../../utils/price";
import AddressBook from "../AddressBook/addressBook";
import ProductList from "../CartPage/productList";
import CommerceLoader from "../Common/Loader";
import styles from "./CheckoutPage.module.css";

const BRAINTREE = "braintree";

export default function CheckoutPage() {
  const {
    cartItems,
    hasItems,
    shouldShowLoadingIndicator: cartLoading,
    prices = {},
  } = useCartPage();

  const [canPlaceOrder, setCanPlaceOrder] = useState(false);
  const [braintreeInstance, setBraintreeInstance] = useState(undefined);
  const {
    paymentModes,
    createOrder,
    shouldShowLoadingIndicator,
    tokenData,
  } = useCheckoutPage();

  const paymentMethods = paymentModes?.cart?.available_payment_methods || [];

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("checkmo");

  const brainTreeDropIn = "braintree-drop-in-div";

  const braintreeContainer = useRef(null);

  const executeScroll = () => braintreeContainer.current.scrollIntoView();
  useEffect(() => {
    if (selectedPaymentMode === BRAINTREE) {
      executeScroll();
    }
  }, [selectedPaymentMode]);

  useEffect(() => {
    const initializeBraintree = () => {
      if (!tokenData) {
        return;
      }
      dropin.create(
        {
          authorization: tokenData.createBraintreeClientToken,
          container: `#${brainTreeDropIn}`,
        },
        function (error, instance) {
          if (error) {
            console.error(error);
          } else {
            setBraintreeInstance(instance);
          }
        }
      );
    };
    if (braintreeInstance) {
      braintreeInstance.teardown().then(() => {
        initializeBraintree();
      });
    } else {
      initializeBraintree();
    }
  }, [tokenData]);

  const placeOrder = () => {
    createOrder({
      paymentMode: selectedPaymentMode,
      braintreeInstance: braintreeInstance,
    });
  };

  if (cartLoading) {
    return <CommerceLoader size="L" />;
  }
  if (!hasItems) {
    return (
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        No Items in your cart!
      </h1>
    );
  }
  console.log(paymentModes);

  return (
    <>
      <AddressBook setCanPlaceOrder={setCanPlaceOrder} />

      <ProductList cartItems={cartItems} canDeleteProduct={false} />
      <hr />
      <div className={styles.totalPrice}>
        <h2>Total</h2>
        <span>{formatPrice(prices["grand_total"])}</span>
      </div>

      <h2 className={styles.paymentHeading}>Payment Method</h2>
      {paymentMethods.map((paymentMethod) => {
        const paymentMode = paymentMethod.code;
        return (
          <div className={styles.paymentContainer} key={paymentMode}>
            <div key={paymentMode} className={styles.paymentModeContainer}>
              <input
                id={paymentMode}
                type="radio"
                defaultChecked={selectedPaymentMode === paymentMode}
                name="paymentMethod"
                value={selectedPaymentMode}
                onChange={() => setSelectedPaymentMode(paymentMode)}
              />
              <label htmlFor={paymentMode}>{paymentMethod.title}</label>
            </div>
          </div>
        );
      })}
      <div
        ref={braintreeContainer}
        id={brainTreeDropIn}
        style={{ marginTop: "-10px" }}
        className={selectedPaymentMode === BRAINTREE ? "" : styles.hidden}
      />

      <div className={styles.buttonContainer}>
        <Button
          variant="cta"
          type="button"
          onPress={placeOrder}
          isDisabled={shouldShowLoadingIndicator || !canPlaceOrder}
        >
          {shouldShowLoadingIndicator ? (
            <CommerceLoader size="S" />
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </>
  );
}
