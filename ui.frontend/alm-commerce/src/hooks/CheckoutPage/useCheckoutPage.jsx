import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { PURCHASE_INITIATED_PATH, SIGN_IN_PATH } from "../../utils/constants";
import { getCartId, getCommerceToken, postMethod } from "../../utils/global";
import {
  GET_PAYMENTS_MODE,
  PROCESS_ORDER,
  SET_PAYMENT_MODE,
} from "./checkout.gql";

export const useCheckoutPage = (props) => {
  let navigate = useNavigate();
  const [cartId] = useState(() => getCartId());

  const [isLoggedIn] = useState(() => {
    const token = getCommerceToken();
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(SIGN_IN_PATH);
    }
  }, [isLoggedIn, navigate]);

  const [
    setPaymentMode,
    { loading: setPaymentModeLoading, error: setPaymentModeError },
  ] = useMutation(SET_PAYMENT_MODE);
  const [
    processOrder,
    { data: orderData, loading: processOrderLoading, error: orderError },
  ] = useMutation(PROCESS_ORDER);

  const shouldShowLoadingIndicator =
    processOrderLoading || setPaymentModeLoading;

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

  const navigateToOrdersSuccessPage = useCallback(
    (orderId) => {
      if (orderId) {
        navigate({
          pathname: "/orders",
          search: createSearchParams({
            orderId,
          }).toString(),
        });
      }
    },
    [navigate]
  );

  useEffect(() => {
    navigateToOrdersSuccessPage(orderData?.placeOrder?.order?.order_number);
  }, [navigateToOrdersSuccessPage, orderData]);

  const createOrder = useCallback(
    async ({ paymentMode } = {}) => {
      try {
        await postMethod(PURCHASE_INITIATED_PATH);
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
    },
    [cartId, processOrder, setPaymentMode]
  );

  const error = useMemo(() => {
    return {
      getPaymentError: getPaymentError?.message,
      orderError: orderError?.message,
      setPaymentModeError: setPaymentModeError?.message,
    };
  }, [
    getPaymentError?.message,
    orderError?.message,
    setPaymentModeError?.message,
  ]);

  return {
    paymentModes,
    isLoggedIn,
    error,
    orderData,
    createOrder,
    shouldShowLoadingIndicator,
  };
};
