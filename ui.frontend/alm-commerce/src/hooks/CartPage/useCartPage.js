import { useLazyQuery, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GET_CART, GET_CART_DETAILS } from "./cartPage.gql";
import storageInstance from "../../utils/storage";


const cartId = storageInstance.getItem("CART_ID");
export const useCartPage = (props = {}) => {

  const [isCartUpdating, setIsCartUpdating] = useState(false);
  // const [wishlistSuccessProps, setWishlistSuccessProps] = useState(null);
  const [fetchCartDetails, { called, data, loading }] = useLazyQuery(
    GET_CART_DETAILS,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      errorPolicy: "all",
    }
  );

  const hasItems = !!data?.cart?.total_quantity;
  const shouldShowLoadingIndicator =
    (called && loading && !hasItems);

  const cartItems = useMemo(() => {
    return data?.cart?.items || [];
  }, [data]);

  const prices = useMemo(() => {
    return data?.cart.prices;
  }, [data]);


  useEffect(() => {
    if (!called && cartId) {
      fetchCartDetails({ variables: { cartId } });
    }

    // Let the cart page know it is updating while we're waiting on network data.
    setIsCartUpdating(loading);
  }, [fetchCartDetails, called, loading]);

  return {
    cartItems,
    hasItems,
    isCartUpdating,
    shouldShowLoadingIndicator,
    prices,
    totalQuantity: data?.cart?.total_quantity || 0
  };
};
