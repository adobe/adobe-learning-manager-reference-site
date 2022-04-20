import { useMemo, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_PAYMENTS_MODE } from './checkout.gql';
import { useNavigate } from "react-router-dom";

import storageInstance from "../../utils/storage";



export const useCheckoutPage = (props) => {
    let navigate = useNavigate();

    const [isLoggedIn] = useState(() => {
        const token = storageInstance.getItem("TOKEN");
        return Boolean(token);
    });
    const [fetchPaymentModes, { data: paymentModes, error: getPaymentError }] = useLazyQuery(GET_PAYMENTS_MODE, {
        variables: {
            cardId: storageInstance.getItem("CART_ID")
        }
    });

    useEffect(() => {
        const getPaymentModes = async () => {
            try {
                await fetchPaymentModes();
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            }
        }
        if (isLoggedIn && storageInstance.getItem("CART_ID")) {
            getPaymentModes();
        }
    }, [fetchPaymentModes, isLoggedIn]);



    const error = useMemo(
        () => {
            return { getPaymentError: getPaymentError?.message }
        },
        [getPaymentError]
    );
    return {
        paymentModes,
        isLoggedIn,
        error
    };
};