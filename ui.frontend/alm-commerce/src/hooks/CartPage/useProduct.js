import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SIGN_IN_PATH } from "../../utils/constants";
import { getCartId, getCommerceToken } from "../../utils/global";
import { REMOVE_ITEM_FROM_CART } from "./product.gql";

export const useProduct = (props) => {
  let navigate = useNavigate();
  const [cartId] = useState(() => getCartId());

  const [isLoggedIn] = useState(() => {
    const token = getCommerceToken();
    return Boolean(token);
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(SIGN_IN_PATH);
    }
  }, [isLoggedIn, navigate]);

  const [removeItem, { loading, error }] = useMutation(REMOVE_ITEM_FROM_CART);

  //   const shouldShowLoadingIndicator =
  //     processOrderLoading || setPaymentModeLoading;

  const removeItemFromCart = useCallback(
    async (itemId) => {
      try {
        await removeItem({
          variables: {
            cardId: cartId,
            cart_item_id: itemId,
          },
        });
      } catch (e) {
        console.log(e);
      }
    },
    [cartId]
  );

  return {
    error,
    removeItemFromCart,
    loading,
  };
};
