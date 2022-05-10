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
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SIGN_IN_PATH } from "../../utils/constants";
import { getCartId, getCommerceToken } from "../../utils/global";
import { GET_CART_DETAILS } from "./cartPage.gql";

export const useCartPage = (props = {}) => {
  const cartId = getCartId();
  let navigate = useNavigate();

  // const [isCartUpdating, setIsCartUpdating] = useState(false);

  const { loading, error: cartDetailsError, data } = useQuery(
    GET_CART_DETAILS,
    {
      variables: { cartId },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
      errorPolicy: "all",
    }
  );

  useEffect(() => {
    if (!getCommerceToken()) {
      navigate(SIGN_IN_PATH);
    }
  }, [navigate]);

  const hasItems = !!data?.cart?.total_quantity;
  const shouldShowLoadingIndicator = loading && !hasItems;

  const cartItems = useMemo(() => {
    return data?.cart?.items;
  }, [data]);

  const prices = useMemo(() => {
    return data?.cart?.prices;
  }, [data]);

  const error = useMemo(() => {
    return { signInError: cartDetailsError?.message };
  }, [cartDetailsError]);

  const proceedToCheckout = useCallback(() => {
    navigate(`/checkout`);
  }, [navigate]);

  return {
    hasItems,
    shouldShowLoadingIndicator,
    prices,
    cartItems,
    totalQuantity: data?.cart?.total_quantity || 0,
    error,
    proceedToCheckout,
    // isCartUpdating,
  };
};

// useEffect(() => {
//   if (!called && cartId) {
//     console.log("inside fetchcart in usecart")
//     fetchCartDetails({ variables: { cartId } });
//   }

//   // Let the cart page know it is updating while we're waiting on network data.
//   setIsCartUpdating(loading);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [fetchCartDetails, cartId]);
