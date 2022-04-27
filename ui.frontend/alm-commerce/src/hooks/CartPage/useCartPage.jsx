import { useLazyQuery, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { GET_CART_DETAILS } from "./cartPage.gql";
import storageInstance from "../../utils/storage";


export const useCartPage = (props = {}) => {
  const cartId = storageInstance.getItem("CART_ID");

  // const [isCartUpdating, setIsCartUpdating] = useState(false);

  const { loading, error:cartDetailsError, data } = useQuery(GET_CART_DETAILS, 
    { variables: { cartId } ,
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
      errorPolicy: "all",
    });

  const hasItems = !!data?.cart?.total_quantity;
  const shouldShowLoadingIndicator =
    (loading && !hasItems);

  const cartItems = useMemo(() => {
    return data?.cart?.items;
  }, [data]);

  const prices = useMemo(() => {
    return data?.cart?.prices;
  }, [data]);

  const error = useMemo(
    () => {

        return { signInError: cartDetailsError?.message }
    },
    [cartDetailsError]
);
  
  return {
    hasItems,
    shouldShowLoadingIndicator,
    prices,
    cartItems,
    totalQuantity: data?.cart?.total_quantity || 0,
    error
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