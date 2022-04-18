import { useCallback, useMemo, useState, useEffect } from 'react';
import { useApolloClient, useMutation, useLazyQuery } from '@apollo/client';
import { SIGN_IN, CREATE_CART } from './singIn.gql';
import storageInstance from "../../utils/storage";



export const useAlmSignIn = (props) => {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLoggedIn, setIsloggedIn] = useState(() => {
        const token = storageInstance.getItem("TOKEN");
        return Boolean(token);
    });
    const [signIn, { error: signInError }] = useMutation(SIGN_IN, {
        fetchPolicy: 'no-cache'
    });
    const [fetchCartId] = useLazyQuery(CREATE_CART);
    useEffect(() => {
        const getCart = async () => {
            const cartResponse = await fetchCartId();
            storageInstance.setItem("CART_ID", cartResponse?.data?.customerCart.id, 3600);
        }
        if (isLoggedIn && !storageInstance.getItem("CART_ID")) {
            getCart();
        }
    }, [fetchCartId, isLoggedIn]);


    const handleSubmit = useCallback(
        async ({ email, password }) => {
            setIsSigningIn(true);
            try {
                const signInResponse = await signIn({
                    variables: {
                        email,
                        password
                    },
                });
                const token = signInResponse.data.generateCustomerToken.token;
                storageInstance.setItem("TOKEN", token, 3600);
                setIsloggedIn(true);
                setIsSigningIn(false);

            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                setIsSigningIn(false);
                setIsloggedIn(false);
            }
        },
        [signIn]
    );

    const error = useMemo(
        () => {
            console.log(signInError);
            return { signInError: signInError?.message }
        },
        [signInError]
    );
    return {
        handleSubmit,
        isLoggedIn,
        isSigningIn,
        error
    };
};