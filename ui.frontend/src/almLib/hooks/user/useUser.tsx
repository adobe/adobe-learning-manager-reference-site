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
