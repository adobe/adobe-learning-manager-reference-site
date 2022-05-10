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
