// import { useCallback, useEffect } from "react";
// import { useUserContext } from "../../contextProviders";
// import { getALMConfig } from "../../utils/global";
// import { JsonApiParse } from "../../utils/jsonAPIAdapter";
// import { RestAdapter } from "../../utils/restAdapter";

// export const useUser = () => {
//   const { user, initAccountUser } = useUserContext();
//   const config = getALMConfig();
//   const initUser = useCallback(async () => {
//     try {
//       const params = {
//         include: "account",
//       };
//       const response = await RestAdapter.get({
//         url: `${config.primeApiURL}user`,
//         params: params,
//       });
//       const userData = JsonApiParse(response).user;
//       const account = userData.account;
//       initAccountUser({ userData, account });
//     } catch (e) {
//       console.log("Error while calling user " + e);
//       initAccountUser({ account: { name: "error" }, userData: {} });
//     }

//     //const data = await result.json();
//     //before dispacthing convert it to required format
//   }, [config.primeApiURL, initAccountUser]);
//   useEffect(() => {
//     initUser();
//   }, [initUser]);

//   return {
//     user,
//     initUser,
//   };
// };

export {};
