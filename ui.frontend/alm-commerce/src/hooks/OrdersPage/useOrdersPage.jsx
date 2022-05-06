import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { CREATE_CART } from "../SignIn/signIn.gql";
import storageInstance from "../../utils/storage";
import { postMethod, getCommerceToken } from "../../utils/global";
import { useNavigate } from "react-router-dom";
import { SIGN_IN_PATH, PURCHASE_COMPLETED_PATH } from "../../utils/constants";


import {
    GET_ORDERS,
} from "./ordersPage.gql";
const CART_ID = "CART_ID";

export const useOrdersPage = (props) => {
    let navigate = useNavigate();
    const { orderId } = props

    const [fetchOrderDetails, { data: orderDetailsData, error: fetchOrderDetailsError }] = useLazyQuery(
        GET_ORDERS
    );
    const [fetchCartId] = useLazyQuery(CREATE_CART);

    useEffect(() => {
        if (!getCommerceToken()) {
            navigate(SIGN_IN_PATH);
        }
    }, [navigate])

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                await fetchOrderDetails({ variables: { orderId } });
                const cartResponse = await fetchCartId();
                storageInstance.setItem(
                    CART_ID,
                    cartResponse?.data?.customerCart.id,
                    10800
                );
                await postMethod(PURCHASE_COMPLETED_PATH);
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.error(error);
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
