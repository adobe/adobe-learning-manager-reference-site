import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { CREATE_CART } from "../SignIn/signIn.gql";
import storageInstance from "../../utils/storage";
import { postMethod } from "../../utils/global"
import {
    GET_ORDERS,
} from "./ordersPage.gql";
const CART_ID = "CART_ID";

export const useOrdersPage = (props) => {
    const [fetchOrderDetails, { data: orderDetailsData, error: fetchOrderDetailsError }] = useLazyQuery(
        GET_ORDERS
    );
    const [fetchCartId] = useLazyQuery(CREATE_CART);

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                await fetchOrderDetails({ variables: { orderId: props.orderId } });
                const cartResponse = await fetchCartId();
                storageInstance.setItem(
                    CART_ID,
                    cartResponse?.data?.customerCart.id,
                    10800
                    );
                await postMethod("/ecommerce/purchaseCompleted");
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.error(error);
                }
            }
        };
        //const response = await postMethod("/ecommerce/purchaseCompleted");
        if (props.orderId) {
            getOrderDetails();
        }
    }, [props.orderId, fetchOrderDetails, fetchCartId]);

    const orderedSKUS = useMemo(() => {
        if (orderDetailsData?.customer?.orders?.items?.length) {
            const order = orderDetailsData?.customer?.orders?.items[0];

            return order?.items.map((item) => item["product_sku"])
        }
    }, [orderDetailsData])


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
