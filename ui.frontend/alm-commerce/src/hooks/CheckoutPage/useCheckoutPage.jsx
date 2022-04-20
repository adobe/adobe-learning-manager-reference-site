import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import storageInstance from "../../utils/storage";
import {
  GET_PAYMENTS_MODE,
  PROCESS_ORDER,
  SET_BILLING_ADDRESS,
  SET_PAYMENT_MODE,
} from "./checkout.gql";

export const useCheckoutPage = (props) => {
  let navigate = useNavigate();
  const [cartId] = useState(() => storageInstance.getItem("CART_ID"));

  const [isLoggedIn] = useState(() => {
    const token = storageInstance.getItem("TOKEN");
    return Boolean(token);
  });
  const [
    fetchPaymentModes,
    { data: paymentModes, error: getPaymentError },
  ] = useLazyQuery(GET_PAYMENTS_MODE, {
    variables: {
      cardId: cartId,
    },
  });

  const [setPaymentMode] = useMutation(SET_PAYMENT_MODE);
  const [processOrder, { data: orderData, error: orderError }] = useMutation(
    PROCESS_ORDER
  );

  const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS);

  useEffect(() => {
    const getPaymentModes = async () => {
      try {
        await fetchPaymentModes();
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }
      }
    };
    if (isLoggedIn && cartId) {
      getPaymentModes();
    }
  }, [cartId, fetchPaymentModes, isLoggedIn]);


  const createOrder = useCallback(async ({ paymentMode } = {}) => {
    try {
      await setBillingAddress({
        variables: {
          cardId: cartId,
        },
      });

      await setPaymentMode({
        variables: {
          cardId: cartId,
          code: paymentMode,
        },
      });

      await processOrder({
        variables: {
          cardId: cartId,
        },
      });
    } catch (e) {
      console.log(e);
      //TODO : handle error
    }
  }, [cartId, processOrder, setBillingAddress, setPaymentMode]);

  const error = useMemo(() => {
    return {
      getPaymentError: getPaymentError?.message,
      orderError: orderError?.message
    };
  }, [getPaymentError?.message, orderError?.message]);

  return {
    paymentModes,
    isLoggedIn,
    error,
    orderData,
    createOrder,
  };
};
