import { useCallback } from "react";
import { RestAdapter } from "../../utils/restAdapter";
import { useUserContext } from "../../contextProviders";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useDispatch } from "react-redux";

export const useUser = () => {
  const { user, initAccountUser } = useUserContext();
  const dispatch = useDispatch();

  const initUser = useCallback(async () => {
    try {
      const params = {
        include: "account",
      };
      const response = await RestAdapter.get({
        url: `${(window as any).baseUrl}user`,
        params: params,
      });
      const userData = JsonApiParse(response).user;
      const account = userData.account;
      initAccountUser({ userData, account });
      dispatch({
        type: "AUTHENTICATE_USER",
        payload: "ABCD",
      });
    } catch (e) {
      console.log("Error while calling user " + e);
      initAccountUser({ account: { name: "error" }, userData: {} });
    }

    //const data = await result.json();
    //before dispacthing convert it to required format
  }, [dispatch, initAccountUser]);

  return {
    user,
    initUser,
  };
};
