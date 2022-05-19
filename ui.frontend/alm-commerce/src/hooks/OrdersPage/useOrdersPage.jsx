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
import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PURCHASE_COMPLETED_PATH, SIGN_IN_PATH } from "../../utils/constants";
import { getCommerceToken, postMethod, setCartId } from "../../utils/global";
import { CREATE_CART } from "../SignIn/signIn.gql";
import { getALMObject } from "../../utils/global";
import { GET_ORDERS } from "./ordersPage.gql";

export const useOrdersPage = (props) => {
  let navigate = useNavigate();
  const { orderId } = props;

  const [
    fetchOrderDetails,
    { data: orderDetailsData, error: fetchOrderDetailsError },
  ] = useLazyQuery(GET_ORDERS);
  const [fetchCartId] = useLazyQuery(CREATE_CART);

  useEffect(() => {
    if (!getCommerceToken()) {
      navigate(SIGN_IN_PATH);
    }
  }, [navigate]);

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        await fetchOrderDetails({ variables: { orderId } });
        const cartResponse = await fetchCartId();
        setCartId(cartResponse?.data?.customerCart.id);
        await postMethod(PURCHASE_COMPLETED_PATH);
        getALMObject().updateCart(0);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.error(e);
        }
      }
    };
    if (orderId) {
      getOrderDetails();
    }
  }, [orderId, fetchOrderDetails, fetchCartId]);

  const orderedSKUS = useMemo(() => {
    if (orderDetailsData?.customer?.orders?.items?.length) {
      const order = orderDetailsData?.customer?.orders?.items[0];

      return order?.items.map((item) => item["product_sku"]);
    }
  }, [orderDetailsData]);

  const error = useMemo(() => {
    return {
      fetchOrderDetailsError: fetchOrderDetailsError?.message,
    };
  }, [fetchOrderDetailsError?.message]);

  return {
    error,
    orderedSKUS,
  };
};
