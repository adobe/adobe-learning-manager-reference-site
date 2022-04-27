import React, { useState } from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import { useCheckoutPage } from "../../hooks/CheckoutPage/useCheckoutPage";
import ProductList from "../CartPage/productList";
import AddressBook from "../AddressBook/addressBook";
import { lightTheme, Provider } from '@adobe/react-spectrum';
import styles from "./CheckoutPage.module.css";
import { Button } from '@adobe/react-spectrum';
import { formatPrice } from "../../utils/price";

export default function CheckoutPage() {
  const {
    cartItems,
    hasItems,
    isCartUpdating,
    shouldShowLoadingIndicator,
    totalQuantity,
    prices = {},
  } = useCartPage();

  const totalPrice = prices["grand_total"]?.value || 0;

  const { error, paymentModes, createOrder, orderData, navigateToOrdersSuccessPage } = useCheckoutPage();

  const paymentMethods = paymentModes?.cart?.available_payment_methods || [];
  console.log("Checkout page");

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("checkmo");

  const handlePaymentModeSelection = (paymentMode) => {
    setSelectedPaymentMode(paymentMode);
  };

  const placeOrder = () => {
    createOrder({ paymentMode: selectedPaymentMode });
  };

  if (!hasItems) {
    return <h1>No Items in your cart! </h1>
  }

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>

      <AddressBook />
      <ProductList cartItems={cartItems} />
      <hr />
      <div className={styles.totalPrice}>
        <h2>Grand Total</h2>
        <span>{formatPrice(prices["grand_total"])}</span>
      </div>
      {/* <Button variant="cta" type="button" onPress={placeOrder}>
        Place Order
      </Button> */}
      <h2 className={styles.paymentHeading}>Payment Method</h2>
      {paymentMethods.slice(0, 1).map((paymentMethod) => {
        return (
          <>
            <div className={styles.paymentContainer}>

              <div key={paymentMethod.code} className={styles.paymentModeContainer}>
                <input
                  id={paymentMethod.code}
                  type="radio"
                  defaultChecked={selectedPaymentMode === paymentMethod.code}
                  name="paymentMethod"
                  value={paymentMethod.code}
                  onChange={() => handlePaymentModeSelection(paymentMethod.code)}
                />
                <label htmlFor={paymentMethod.code}>{paymentMethod.title}</label>
              </div>

            </div>
          </>
        );
      })}
      <div className={styles.buttonContainer}>
        <Button variant="cta" type="button" onPress={placeOrder}>
          Place Order
        </Button>
      </div>
    </Provider>
  );
}
