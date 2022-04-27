import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import {
    GET_ORDERS,
} from "./ordersPage.gql";

export const useOrdersPage = (props) => {
    const [fetchOrderDetails, { data: orderDetails, error: fetchOrderDetailsError }] = useLazyQuery(
        GET_ORDERS
    );

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                await fetchOrderDetails({ variables: { orderId: props.orderId } });
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.error(error);
                }
            }
        };
        if (props.orderId) {
            getOrderDetails();
        }
    }, [props.orderId, fetchOrderDetails]);



    const error = useMemo(() => {
        return {
            fetchOrderDetailsError: fetchOrderDetailsError?.message,
        };
    }, [fetchOrderDetailsError?.message]);

    return {
        error,
        orderDetails,
    };
};
