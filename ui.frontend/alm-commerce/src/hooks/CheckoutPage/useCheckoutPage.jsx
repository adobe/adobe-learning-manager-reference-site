import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import storageInstance from "../../utils/storage";
import { postMethod } from "../../utils/global"
import {
  GET_PAYMENTS_MODE,
  PROCESS_ORDER,
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


  const navigateToOrdersSuccessPage = useCallback(() => {
    navigate({
      pathname: "../orders",
      search: createSearchParams({
        orderId: "000000030"
      }).toString()
    });
  }, [navigate])

  const createOrder = useCallback(async ({ paymentMode } = {}) => {
    try {
      postMethod("/ecommerce/purchaseInitiated");
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
      // move it to Order success page
      //const response = await postMethod("/ecommerce/purchaseCompleted");

    } catch (e) {
      console.log(e);
      //TODO : handle error
    }
  }, [cartId, processOrder, setPaymentMode]);

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
    navigateToOrdersSuccessPage
  };
};
