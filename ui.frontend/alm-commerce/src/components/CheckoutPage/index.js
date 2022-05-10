import { Button } from "@adobe/react-spectrum";
import React, { useState } from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import { useCheckoutPage } from "../../hooks/CheckoutPage/useCheckoutPage";
import { formatPrice } from "../../utils/price";
import AddressBook from "../AddressBook/addressBook";
import ProductList from "../CartPage/productList";
import CommerceLoader from "../Common/Loader";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const {
    cartItems,
    hasItems,
    // isCartUpdating,
    shouldShowLoadingIndicator: cartLoading,
    // totalQuantity,
    prices = {},
  } = useCartPage();

  // const totalPrice = prices["grand_total"]?.value || 0;

  const {
    paymentModes,
    createOrder,
    shouldShowLoadingIndicator,
  } = useCheckoutPage();

  const paymentMethods = paymentModes?.cart?.available_payment_methods || [];

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("checkmo");

  const handlePaymentModeSelection = (paymentMode) => {
    setSelectedPaymentMode(paymentMode);
  };

  const placeOrder = () => {
    createOrder({ paymentMode: selectedPaymentMode });
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

  return (
    <>
      <AddressBook />
      <ProductList cartItems={cartItems} />
      <hr />
      <div className={styles.totalPrice}>
        <h2>Grand Total</h2>
        <span>{formatPrice(prices["grand_total"])}</span>
      </div>

      <h2 className={styles.paymentHeading}>Payment Method</h2>
      {paymentMethods.slice(0, 1).map((paymentMethod) => {
        return (
          <>
            <div className={styles.paymentContainer}>
              <div
                key={paymentMethod.code}
                className={styles.paymentModeContainer}
              >
                <input
                  id={paymentMethod.code}
                  type="radio"
                  defaultChecked={selectedPaymentMode === paymentMethod.code}
                  name="paymentMethod"
                  value={paymentMethod.code}
                  onChange={() =>
                    handlePaymentModeSelection(paymentMethod.code)
                  }
                />
                <label htmlFor={paymentMethod.code}>
                  {paymentMethod.title}
                </label>
              </div>
            </div>
          </>
        );
      })}
      <div className={styles.buttonContainer}>
        <Button
          variant="cta"
          type="button"
          onPress={placeOrder}
          isDisabled={shouldShowLoadingIndicator}
        >
          {shouldShowLoadingIndicator ? (
            <CommerceLoader size="S" />
          ) : (
            "Proceed to Checkout"
          )}
        </Button>
      </div>
    </>
  );
}
