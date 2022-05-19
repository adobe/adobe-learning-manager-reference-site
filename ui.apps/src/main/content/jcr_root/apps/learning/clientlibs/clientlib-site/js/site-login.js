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

(function (window, document, Granite, $) {
  "use strict";

  const ACCESS_TOKEN_COOKIE_NAME = "alm_cp_token";
  const COMMERCE_TOKEN_COOKIE_NAME = "alm_commerce_token";
  const CP_OAUTH_URL =
    "{almBaseURL}/oauth/o/authorize?account={accountId}&client_id={clientId}&redirect_uri={redirectUri}&state={state}&scope=learner:read,learner:write&response_type=CODE&client_identifier=aemsite&logoutAfterAuthorize=true";
  const ES_REGISTER_URL =
    "{almBaseURL}/oauth/o/authorize?client_id={clientId}&redirect_uri={redirectUri}&state={state}&scope=learner:read,learner:write&response_type=CODE&client_identifier=aemsite&logoutAfterAuthorize=true&loginUrl={loginUrl}";
  const CP_OAUTH_STATE = "cpState";
  const ES_REGISTER_STATE = "esRegisterState";

  const WCM_AUTHOR_MODE = "author";
  const WCM_NON_AUTHOR_MODE = "non-author";

  const CP_ACCESS_TOKEN_URL = "/cpoauth.cpAccessToken.html";

  const PRIME_USAGE_TYPE = "aem-sites";
  const ES_USAGE_TYPE = "aem-es";
  const COMMERCE_USAGE_TYPE = "aem-commerce";

  const CURRENT_USAGE_TYPE = window.ALM.ALMConfig.usageType || PRIME_USAGE_TYPE;

  const cleanUpUserData = () => {
    document.cookie =
      ACCESS_TOKEN_COOKIE_NAME +
      "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      COMMERCE_TOKEN_COOKIE_NAME +
      "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.ALM.storage.removeItem("user");
    window.ALM.storage.removeItem("CART_ID");
    window.ALM.storage.removeItem("PRIME_CATALOG_FILTER");
    window.ALM.storage.removeItem("COMMERCE_FILTERS");
  };

  const handleCommerceLogIn = () => {
    if (isAuthor()) {
      // for Author mode, behavior should be same as AEM+ALM
      handlePrimeLogIn();
    } else if (!isPrimeUserLoggedIn()) {
      if (isLearningPage()) {
        window.ALM.navigateToExplorePage();
      } else if (isCommunityPage()) {
        window.ALM.navigateToCommerceSignInPage();
      }
    }
  };

  const handleESLogIn = () => {
    const currentUrl = new URL(window.location.href);
    const state = currentUrl.searchParams.get("state");
    const code = currentUrl.searchParams.get("code");
    const pathName = currentUrl.pathname;

    // For author mode, behavior same as AEM+ALM

    if (isAuthor()) {
      handlePrimeLogIn();
    } else {
      if (ES_REGISTER_STATE == state && code) {
        // Handle User registration
        const data = {
          _charset_: "UTF-8",
          mode: WCM_NON_AUTHOR_MODE,
          code: code,
          pagePath: pathName,
        };
        fetchAccessToken(data);
      } else if (isCommunityPage() || (CP_OAUTH_STATE == state && code)) {
        // Auto-login like Prime Usage only if user navigates to Community page.
        // For rest pages, show non-logged in behavior
        handlePrimeLogIn();
      } else if (!isPrimeUserLoggedIn()) {
        if (isLearningPage()) {
          window.ALM.navigateToExplorePage();
        }
      }
    }
  };

  const handlePrimeLogIn = () => {
    if (!isPrimeUserLoggedIn()) {
      const currentUrl = new URL(window.location.href);
      const pathName = currentUrl.pathname;
      if (isAuthor()) {
        let data = {
          _charset_: "UTF-8",
          mode: WCM_AUTHOR_MODE,
          pagePath: pathName,
        };
        fetchAccessToken(data);
      } else {
        const oauthState = currentUrl.searchParams.get("state");
        const code = currentUrl.searchParams.get("code");
        if (CP_OAUTH_STATE == oauthState && code) {
          let data = {
            _charset_: "UTF-8",
            mode: WCM_NON_AUTHOR_MODE,
            code: code,
            pagePath: pathName,
          };
          fetchAccessToken(data);
        } else {
          const cpOauth = getCpOauthUrl();
          document.location.href = cpOauth;
        }
      }
    }
  };

  const isSignOutPage = () =>
    window.location.pathname === window.ALM.getALMConfig().signOutPath;

  const isCommunityPage = () =>
    window.location.pathname === window.ALM.getALMConfig().communityPath;

  const isCommerceSignInPage = () =>
    window.location.pathname === window.ALM.getALMConfig().commerceSignInPath;

  const isLearningPage = () =>
    window.location.pathname === window.ALM.getALMConfig().learningPath;

  const isEmailRedirectPage = () =>
    window.location.pathname === window.ALM.getALMConfig().emailRedirectPath;

  const handlePageLoad = () => {
    if (!isPrimeUserLoggedIn() || 
        (!isAuthor() && CURRENT_USAGE_TYPE === COMMERCE_USAGE_TYPE && !isCommerceLoggedIn())) {
      cleanUpUserData();
    }
    // If sign-out or sign-in Page do nothing
    if (isSignOutPage() || isCommerceSignInPage() || isEmailRedirectPage()) {
      return;
    }

    switch (CURRENT_USAGE_TYPE) {
      case PRIME_USAGE_TYPE:
        handlePrimeLogIn();
        break;

      case ES_USAGE_TYPE:
        handleESLogIn();
        break;

      case COMMERCE_USAGE_TYPE:
        handleCommerceLogIn();
        break;

      default:
        break;
    }
  };

  const isAuthor = () => window.ALM.ALMConfig.authorMode == true;

  function getCpOauthUrl() {
    const almBaseURL = window.ALM.ALMConfig.almBaseURL;
    const clientId = window.ALM.ALMConfig.clientId;
    const accountId = window.ALM.ALMConfig.accountId;
    return CP_OAUTH_URL.replace("{almBaseURL}", almBaseURL)
      .replace("{accountId}", accountId)
      .replace("{clientId}", clientId)
      .replace("{redirectUri}", window.location.href)
      .replace("{state}", CP_OAUTH_STATE);
  }

  function getESRegisterUrl() {
    const almBaseURL = window.ALM.ALMConfig.almBaseURL;
    const clientId = window.ALM.ALMConfig.clientId;
    const registerUrl = window.ALM.ALMConfig.almRegisterUrl;
    return ES_REGISTER_URL.replace("{almBaseURL}", almBaseURL)
      .replace("{clientId}", clientId)
      .replace("{redirectUri}", window.location.href)
      .replace("{state}", ES_REGISTER_STATE)
      .replace("{loginUrl}", encodeURIComponent(registerUrl));
  }

  // fetch access_token from AEM
  const fetchAccessToken = (data) => {
    const ACCESS_TOKEN_URL = Granite.HTTP.externalize(CP_ACCESS_TOKEN_URL);

    $.ajax({
      url: ACCESS_TOKEN_URL,
      type: "POST",
      async: false,
      data: data,
      success: () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("PRIME_BASE");
        currentUrl.searchParams.delete("code");
        currentUrl.searchParams.delete("state");
        getALMUser();
        if (isSignOutPage()) {
          window.ALM.navigateToHomePage();
        } else {
          document.location.href = currentUrl.href;
        }
      },
      error: () => {
        alert("Failed to authenticate");
      },
    });
  };

  async function getALMUser() {
    if (!window.ALM.isPrimeUserLoggedIn()) {
      window.ALM.storage.removeItem("user");
      return;
    }
    let user = window.ALM.storage.getItem("user");
    if (user) {
      return user;
    }
    const primeApiURL = window.ALM.ALMConfig.primeApiURL;
    const userUrl = `${primeApiURL}/user?include=account`;
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
        window.ALM.storage.setItem("user", userStr, 1800);
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
    let cookieValues = document.cookie.match(
      `(^|[^;]+)\\s*${ACCESS_TOKEN_COOKIE_NAME}\\s*=\\s*([^;]+)`
    );
    return cookieValues ? cookieValues.pop() : "";
  };

  const getCommerceToken = () => {
    let cookieValues = document.cookie.match(
      `(^|[^;]+)\\s*${COMMERCE_TOKEN_COOKIE_NAME}\\s*=\\s*([^;]+)`
    );
    return cookieValues ? cookieValues.pop() : "";
  };

  const isCommerceLoggedIn = () => (getCommerceToken() === "" ? false : true);

  const isPrimeUserLoggedIn = () => {
    const accessToken = getAccessToken();
    return (accessToken && accessToken !== "");
  };

  const handleLogOut = () => {
    cleanUpUserData();
    switch (CURRENT_USAGE_TYPE) {
      case PRIME_USAGE_TYPE:
        window.ALM.navigateToSignOutPage();
        break;

      case ES_USAGE_TYPE:
      case COMMERCE_USAGE_TYPE:
        window.ALM.navigateToHomePage();
        break;

      default:
        break;
    }
  };

  const handleLogIn = () => {
    switch (CURRENT_USAGE_TYPE) {
      case PRIME_USAGE_TYPE:
      case ES_USAGE_TYPE:
        handlePrimeLogIn();
        break;

      case COMMERCE_USAGE_TYPE:
        window.ALM.navigateToCommerceSignInPage();
        break;

      default:
        break;
    }
  };

  const handleESRegister = () => {
    const registerUrl = getESRegisterUrl();
    document.location.href = registerUrl;
  };

  const handleRegister = () => {
    switch (CURRENT_USAGE_TYPE) {
      case ES_USAGE_TYPE:
        handleESRegister();
        break;

      case COMMERCE_USAGE_TYPE:
        window.ALM.navigateToCommerceSignInPage();
        break;

      default:
        break;
    }
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

  handlePageLoad();
  
})(window, document, Granite, jQuery);
