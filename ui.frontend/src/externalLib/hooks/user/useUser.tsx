import { useCallback, useEffect } from "react";
import { RestAdapter } from "../../utils/restAdapter";
import { useConfigContext, useUserContext } from "../../contextProviders";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";

export const useUser = () => {
  const { user, initAccountUser } = useUserContext();
  const config = useConfigContext();
  const initUser = useCallback(async () => {
    try {
      const params = {
        include: "account",
      };
      const response = await RestAdapter.get({
        url: `${config.baseApiUrl}user`,
        params: params,
      });
      const userData = JsonApiParse(response).user;
      const account = userData.account;
      initAccountUser({ userData, account });
    } catch (e) {
      console.log("Error while calling user " + e);
      initAccountUser({ account: { name: "error" }, userData: {} });
    }

    //const data = await result.json();
    //before dispacthing convert it to required format
  }, [config.baseApiUrl, initAccountUser]);
  useEffect(() => {
    initUser();
  }, [initUser]);

  return {
    user,
    initUser,
  };
};
