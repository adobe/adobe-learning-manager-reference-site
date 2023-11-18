/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

window.ALM = window.ALM || {};
window.ALM.ALMConfig = window.ALM.ALMConfig || {};

(async function (window, document, Granite, $) {
  "use strict";

  const PRIME_USAGE_TYPE = "aem-sites";
  const ES_USAGE_TYPE = "aem-es";
  const COMMERCE_USAGE_TYPE = "aem-commerce";
  const DEFAULT_USAGE = "aem-default";

  const CURRENT_USAGE_TYPE = window.ALM.ALMConfig.usageType || DEFAULT_USAGE;

  const loginImpls = window.ALM.loginImpls;
  const usageMap = {
    [PRIME_USAGE_TYPE]: loginImpls["AlmPrimeLogin"],
    [DEFAULT_USAGE]: loginImpls["AlmPrimeLogin"],
    [ES_USAGE_TYPE]: loginImpls["AlmEsLogin"],
    [COMMERCE_USAGE_TYPE]: loginImpls["AlmCommerceLogin"],
  };

  async function handlePageLoad() {
    await usageMap[CURRENT_USAGE_TYPE].handlePageLoad();
  }

  async function getALMUser() {
    if (!isPrimeUserLoggedIn()) {
      window.ALM.storage.removeItem("user");
      return;
    }
    let user = window.ALM.storage.getItem("user");
    if (user) {
      return user;
    }
    const primeApiURL = window.ALM.ALMConfig.primeApiURL;
    const userUrl = `${primeApiURL}/user?include=account&enforcedFields[account]=extensions`;
    const headers = {
      Accept: "application/vnd.api+json",
      Authorization: `oauth ${getAccessToken()}`,
    };
    try {
      const userResponse = await fetch(`${userUrl}`, {
        credentials: "include",
        headers,
        method: "GET",
      });
      if (userResponse && userResponse.status == 200) {
        user = await userResponse.json();
        const userStr = JSON.stringify(user);
        window.ALM.storage.setItem("user", userStr, 900);
        return userStr;
      } else {
        console.error("User call failed!!");
        window.ALM.storage.removeItem("user");
      }
    } catch (e) {
      window.ALM.storage.removeItem("user");
      throw e;
    }
  }

  const getAccountActiveFields = async () => {
    const primeApiURL = window.ALM.getALMConfig().primeApiURL;
    const accountActiveFieldsUrl = primeApiURL + "account/fields";
    const headers = {
      Accept: "application/vnd.api+json",
      Authorization: `oauth ${getAccessToken()}`,
    };
    try {
      const response = await fetch(accountActiveFieldsUrl, {
        credentials: "include",
        headers,
        method: "GET",
      });
      if (response) {
        const activeFields = await response.json();
        console.log(activeFields);
        return activeFields;
      }
    } catch (e) {
      throw e;
    }
  };

  async function updateALMUser() {
    window.ALM.storage.removeItem("user");
    return getALMUser();
  }

  const updateAccountActiveFieldsDetails = async (activeFields, userId) => {
    const baseApiUrl = window.ALM.getALMConfig().primeApiURL;
    const body = {
      data: {
        type: "user",
        id: userId,
        attributes: {
          fields: activeFields,
        },
      },
    };
    const updateAccountActiveFieldsUrl = baseApiUrl + "users/" + `${userId}`;
    try {
      await fetch(updateAccountActiveFieldsUrl, {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Authorization: `oauth ${getAccessToken()}`,
        },
        method: "PATCH",
        body: JSON.stringify(body),
        Accept: "application/vnd.api+json",
      });
      await updateALMUser();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const getAccessToken = () => {
    return usageMap[CURRENT_USAGE_TYPE].getAccessToken();
  };

  const getCommerceToken = () => {
    return usageMap[COMMERCE_USAGE_TYPE].getCommerceToken();
  };

  const isPrimeUserLoggedIn = () => {
    const isLoggedIn = usageMap[CURRENT_USAGE_TYPE].isLoggedIn();
    return isLoggedIn;
  };

  const handleLogIn = async (queryParams) => {
    await usageMap[CURRENT_USAGE_TYPE].handleLogIn();
  };

  const handleLogOut = async () => {
    await usageMap[CURRENT_USAGE_TYPE].handleLogOut();
  };

  const handleRegister = () => {
    usageMap[CURRENT_USAGE_TYPE].handleRegister();
  };

  window.ALM.isPrimeUserLoggedIn = isPrimeUserLoggedIn;
  window.ALM.getAccessToken = getAccessToken;
  window.ALM.getCommerceToken = getCommerceToken;
  window.ALM.getALMUser = getALMUser;
  window.ALM.updateAccountActiveFieldsDetails = updateAccountActiveFieldsDetails;
  window.ALM.updateALMUser = updateALMUser;
  window.ALM.handleLogIn = handleLogIn;
  window.ALM.handleLogOut = handleLogOut;
  window.ALM.handleRegister = handleRegister;
  window.ALM.getAccountActiveFields = getAccountActiveFields;
  window.ALM.handlePageLoad = handlePageLoad;

  await handlePageLoad();
})(window, document, Granite, jQuery);
