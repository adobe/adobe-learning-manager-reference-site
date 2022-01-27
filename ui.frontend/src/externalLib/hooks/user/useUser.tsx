import React, { useCallback } from "react";
import { RestAdapter } from "../../utils/restAdapter";
import { useUserContext } from "../../contextProviders";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";

export const useUser = () => {
  const { user, initAccountUser } = useUserContext();

  const initUser = useCallback(async () => {
    try {
      const params = {
        include: "account"
      };
      const response = await RestAdapter.get({
          url: `https://captivateprimeqe.adobe.com/primeapi/v2/user`,
          params: params,
      });
      const userData = JsonApiParse(response).user;
      const account = userData.account;
      initAccountUser({userData,account});
     } catch (e) {
          console.log("Error while calling user " + e);
    }

    //const data = await result.json();
    //before dispacthing convert it to required format
  
  }, [initAccountUser]);

  return {
    user,
    initUser,
  };
};

