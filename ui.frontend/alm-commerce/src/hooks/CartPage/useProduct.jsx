/**
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
    [cartId, removeItem]
  );

  return {
    error,
    removeItemFromCart,
    loading,
  };
};
