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
import { useLazyQuery, useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getALMObject,
  getCommerceToken,
  setCartId,
  handlePageLoad,
} from "../../utils/global";
import {
  CREATE_ACCOUNT,
  CREATE_CART,
  REQUEST_PASSWORD_RESET_EMAIL,
  SIGN_IN,
} from "./signIn.gql";
import { ADD_TO_CART, ENROLL, PREVIEW } from "../../utils/constants";

export const useAlmSignIn = (props) => {
  let navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsloggedIn] = useState(() => {
    const token = getCommerceToken();
    return Boolean(token);
  });
  const [signIn, { error: signInError }] = useMutation(SIGN_IN, {
    fetchPolicy: "no-cache",
  });

  const [createAccount, { error: createAccountError }] = useMutation(
    CREATE_ACCOUNT,
    {
      fetchPolicy: "no-cache",
    }
  );

  const [forgotPassword, { error: forgotPasswordError }] = useMutation(
    REQUEST_PASSWORD_RESET_EMAIL,
    {
      fetchPolicy: "no-cache",
    }
  );

  const [fetchCartId] = useLazyQuery(CREATE_CART);
  useEffect(() => {
    const getCart = async () => {
      const cartResponse = await fetchCartId();
      setCartId(cartResponse?.data?.customerCart.id);
      getALMObject().updateCart(
        cartResponse?.data?.customerCart?.total_quantity
      );

      let urlSearchParams = new URLSearchParams(window.location.search);
      const redirectPath = urlSearchParams.get("redirectPath");

      if (redirectPath) {
        const redirectPathURL = new URL(redirectPath);
        const actionInURL = redirectPathURL.searchParams.get("action");
        const validActions = [PREVIEW, ENROLL, ADD_TO_CART];
        if (
          redirectPathURL?.origin === window.location.origin &&
          (!actionInURL || validActions.includes(actionInURL))
        ) {
          urlSearchParams.delete("redirectPath");
          window.history.replaceState(
            null,
            "",
            "?" + urlSearchParams + window.location.hash
          );
          window.location.href = decodeURIComponent(redirectPath);
          return;
        }
        console.info("Stopping Redirection");
      } else if (process.env.NODE_ENV === "production") {
        getALMObject().navigateToExplorePage();
      } else {
        navigate("/cart");
      }
    };
    if (isLoggedIn) {
      getCart();
    }
  }, [fetchCartId, isLoggedIn, navigate]);

  const signInHandler = useCallback(
    async ({ email, password }) => {
      setIsLoading(true);
      try {
        const signInResponse = await signIn({
          variables: {
            email,
            password,
          },
        });
        const token = signInResponse.data.generateCustomerToken.token;
        if (process.env.NODE_ENV !== "production") {
          let date = new Date();
          date.setTime(date.getTime() + 60 * 60 * 1000);
          const expires = "; expires=" + date.toUTCString();
          document.cookie =
            "alm_commerce_token=" + (token || "") + expires + "; path=/";
        }

        if (process.env.NODE_ENV === "production") {
          await fetch(
            `/cpoauth.commerceToken.html?token=${token}&pagePath=${window.location.pathname}`
          );
          await handlePageLoad();
        }
        setIsLoading(false);
        setIsloggedIn(true);
      } catch (exception) {
        setIsLoading(false);
        setIsloggedIn(false);
        // getALMObject().handleLogOut();
      }
    },
    [signIn]
  );

  const createAccountHandler = useCallback(
    async ({ firstname, lastname, email, password, is_subscribed }) => {
      setIsLoading(true);
      try {
        await createAccount({
          variables: {
            firstname,
            lastname,
            email,
            password,
            is_subscribed,
          },
        });
        await signInHandler({ email, password });
      } catch (e) {
        setIsLoading(false);
        setIsloggedIn(false);
      }
    },
    [createAccount, signInHandler]
  );

  const forgotPasswordHandler = useCallback(
    async ({ email }) => {
      setIsLoading(true);
      try {
        await forgotPassword({
          variables: {
            email,
          },
        });
      } catch (e) {
        setIsLoading(false);
        setIsloggedIn(false);
        throw e;
      }
    },
    [forgotPassword]
  );

  const error = useMemo(() => {
    return {
      signInError: signInError?.message,
      createAccountError: createAccountError?.message,
      forgotPasswordError: forgotPasswordError?.message,
    };
  }, [signInError, createAccountError, forgotPasswordError]);
  return {
    signInHandler,
    createAccountHandler,
    forgotPasswordHandler,
    isLoggedIn,
    isLoading,
    error,
  };
};
