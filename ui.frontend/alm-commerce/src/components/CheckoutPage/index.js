import React, { useState } from "react";
import { useCartPage } from "../../hooks/CartPage/useCartPage";
import { useCheckoutPage } from "../../hooks/CheckoutPage/useCheckoutPage";
import ProductList from "../CartPage/productList";
import AddressBook from "../AddressBook/addressBook";
import { lightTheme, Provider } from '@adobe/react-spectrum';

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

  const { error, paymentModes, createOrder, orderData } = useCheckoutPage();

  const paymentMethods = paymentModes?.cart?.available_payment_methods || [];
  console.log("Checkout page");

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("checkmo");

  const handlePaymentModeSelection = (paymentMode) => {
    setSelectedPaymentMode(paymentMode);
  };

  const placeOrder = () => {
    createOrder({ paymentMode: selectedPaymentMode });
  };

  console.log("orderData::" + orderData);
  return (
    <Provider theme={lightTheme} colorScheme={"light"}>

      <AddressBook />
      <ProductList cartItems={cartItems} />
      <div>{totalQuantity}</div>

      {paymentMethods.map((paymentMethod) => {
        return (
          <div key={paymentMethod.code}>
            <input
              id={paymentMethod.code}
              type="radio"
              defaultChecked={selectedPaymentMode == paymentMethod.code}
              name="paymentMethod"
              value={paymentMethod.code}
              onChange={() => handlePaymentModeSelection(paymentMethod.code)}
            />
            <label htmlFor={paymentMethod.code}>{paymentMethod.title}</label>
            <br></br>

            <button onClick={placeOrder}>Place Order</button>
          </div>
        );
      })}
    </Provider>
  );
}
