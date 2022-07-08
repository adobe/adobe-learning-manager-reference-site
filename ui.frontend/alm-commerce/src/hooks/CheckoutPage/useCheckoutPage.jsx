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
import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { PURCHASE_INITIATED_PATH, SIGN_IN_PATH } from "../../utils/constants";
import { getCartId, getCommerceToken, postMethod } from "../../utils/global";
import {
  CREATE_TOKEN,
  GET_PAYMENTS_MODE,
  PROCESS_ORDER,
  SET_PAYMENT_MODE,
  SET_PAYMENT_ON_CART,
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
      cartId: cartId,
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
  const [
    fetchToken,
    { data: tokenData, loading: TokenLoading, error: TokenError },
  ] = useMutation(CREATE_TOKEN);

  const [
    setPaymentOnCart,
    {
      data: set_payment_on_cartData,
      loading: set_payment_on_cartLoading,
      error: set_payment_on_cartError,
    },
  ] = useMutation(SET_PAYMENT_ON_CART);

  const shouldShowLoadingIndicator =
    processOrderLoading || setPaymentModeLoading;

  useEffect(() => {
    const getPaymentModes = async () => {
      try {
        await fetchPaymentModes();
        await fetchToken();
        console.log(tokenData);
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

  const processBraintreePayment = async (braintreeInstance) => {
    if (!braintreeInstance) {
      console.log("Braintree instance not found");
      return;
    }
    braintreeInstance.requestPaymentMethod((error, payload) => {
      if (error) {
        console.error(error);
        return;
      }

      const paymentMethodNonce = payload.nonce;

      setPaymentOnCart({
        variables: {
          cartId: cartId,
          nonce: paymentMethodNonce,
        },
      }).then(() => {
        processOrder({
          variables: {
            cartId: cartId,
          },
        });
      });
    });
  };

  const processMoneyOrder = async (paymentMode) => {
    await setPaymentMode({
      variables: {
        cartId: cartId,
        code: paymentMode,
      },
    });
    await processOrder({
      variables: {
        cartId: cartId,
      },
    });
  };
  const createOrder = useCallback(
    async ({ paymentMode, braintreeInstance } = {}) => {
      try {
        await postMethod(PURCHASE_INITIATED_PATH);
        switch (paymentMode) {
          case "braintree":
            await processBraintreePayment(braintreeInstance);
            break;
          default:
            await processMoneyOrder(paymentMode);
        }
      } catch (e) {
        console.log(e);
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
    tokenData,
  };
};
