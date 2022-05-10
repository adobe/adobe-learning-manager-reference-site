import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PURCHASE_COMPLETED_PATH, SIGN_IN_PATH } from "../../utils/constants";
import { getCommerceToken, postMethod, setCartId } from "../../utils/global";
import { CREATE_CART } from "../SignIn/signIn.gql";
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
