import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import storageInstance from "../../utils/storage";
import { CREATE_CART, SIGN_IN } from "./singIn.gql";

const CART_ID = "CART_ID";

export const useAlmSignIn = (props) => {
  let navigate = useNavigate();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggedIn, setIsloggedIn] = useState(() => {
    const token = storageInstance.getItem("TOKEN");
    return Boolean(token);
  });
  const [signIn, { error: signInError }] = useMutation(SIGN_IN, {
    fetchPolicy: "no-cache",
  });
  const [fetchCartId] = useLazyQuery(CREATE_CART);
  useEffect(() => {
    const getCart = async () => {
      const cartResponse = await fetchCartId();
      storageInstance.setItem(
        CART_ID,
        cartResponse?.data?.customerCart.id,
        3600
      );
      navigate(`/cart`);
    };
    if (isLoggedIn && !storageInstance.getItem(CART_ID)) {
      getCart();
    }
  }, [fetchCartId, isLoggedIn, navigate]);

  const handleSubmit = useCallback(
    async ({ email, password }) => {
      setIsSigningIn(true);
      try {
        const signInResponse = await signIn({
          variables: {
            email,
            password,
          },
        });
        const token = signInResponse.data.generateCustomerToken.token;
        storageInstance.setItem("TOKEN", token, 3600);
        setIsloggedIn(true);
        setIsSigningIn(false);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }
        setIsSigningIn(false);
        setIsloggedIn(false);
      }
    },
    [signIn]
  );

  const error = useMemo(() => {
    console.log(signInError);
    return { signInError: signInError?.message };
  }, [signInError]);
  return {
    handleSubmit,
    isLoggedIn,
    isSigningIn,
    error,
  };
};
