window.ALM = window.ALM || {};
window.ALM.ALMConfig = window.ALM.ALMConfig || {};

(function (window, document, Granite, $) {
  "use strict";

  const ACCESS_TOKEN_COOKIE_NAME = "alm-cp-token";
  const CP_OAUTH_URL =
    "{primeUrl}/oauth/o/authorize?account={accountId}&client_id={clientId}&redirect_uri={redirectUri}&state={state}&scope={scope}&response_type={responseType}";
  const CP_OAUTH_SCOPE = "learner:read,learner:write";
  const CP_OAUTH_STATE = "cpState";
  const CP_OAUTH_RESPONSE_TYPE = "CODE";

  const WCM_AUTHOR_MODE = "author";
  const WCM_NON_AUTHOR_MODE = "non-author";

  const CP_ACCESS_TOKEN_URL = "/cpoauth.cpAccessToken.html";

  function handlePageLoad() {
    if (!isPrimeUserLoggedIn()) {
      const currentUrl = new URL(window.location.href);
      const pathName = currentUrl.pathname;
      if (isAuthor()) {
        var data = {
          _charset_: "UTF-8",
          mode: WCM_AUTHOR_MODE,
          pagePath: pathName,
        };
        fetchAccessToken(data);
      }

      var oauthState = currentUrl.searchParams.get("state");
      var code = currentUrl.searchParams.get("code");
      if (CP_OAUTH_STATE == oauthState && code) {
        // learner got here from cp oauth with code and state.
        // make call to backend AEM to fetch access_token. On getting refresh the page.
        var data = {
          _charset_: "UTF-8",
          mode: WCM_NON_AUTHOR_MODE,
          code: code,
          pagePath: pathName,
        };
        fetchAccessToken(data);
        //document.location.reload();
      } else {
        // redirect learner to cp oauth
        const cpOauth = getCpOauthUrl();
        document.location.href = cpOauth;
      }
    }
  }

  function isAuthor() {
    return window.ALM.ALMConfig.authorMode == true;
  }

  function getCpOauthUrl() {
    const primeUrl = window.ALM.ALMConfig.primeUrl;
    const clientId = window.ALM.ALMConfig.clientId;
    const accountId = window.ALM.ALMConfig.accountId;
    return CP_OAUTH_URL.replace("{primeUrl}", primeUrl)
      .replace("{accountId}", accountId)
      .replace("{clientId}", clientId)
      .replace("{redirectUri}", window.location.href)
      .replace("{state}", CP_OAUTH_STATE)
      .replace("{scope}", CP_OAUTH_SCOPE)
      .replace("{responseType}", CP_OAUTH_RESPONSE_TYPE);
  }

  // fetch access_token from AEM
  function fetchAccessToken(data) {
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
        document.location.href = currentUrl.href;
        getALMUser();
      },
      error: () => {
        alert("Failed to authenticate");
      },
    });
  }

  async function getALMUser() {
    let user = window.sessionStorage.getItem("user");
    if (user) {
      return user;
    }
    const primeApiURL = window.ALM.ALMConfig.primeUrl;
    const userUrl = `${primeApiURL}user?include=account`;
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
      if (userResponse) {
        user = await userResponse.json();
        const userStr = JSON.stringify(user);
        window.sessionStorage.setItem("user", userStr);
        return userStr;
      }
    } catch (e) {
      throw e;
    }
  }
  async function updateALMUser() {
    window.sessionStorage.removeItem("user");
    return getALMUser();
  };

  function getAccessToken() {
    let cookieValues = document.cookie.match(
      `(^|[^;]+)\\s*${ACCESS_TOKEN_COOKIE_NAME}\\s*=\\s*([^;]+)`
    );
    return cookieValues ? cookieValues.pop() : "";
  }

  function isPrimeUserLoggedIn() {
    let cookieValue = getAccessToken();
    return cookieValue == "" ? false : true;
  }

  handlePageLoad();

  window.ALM.isPrimeUserLoggedIn = isPrimeUserLoggedIn;
  window.ALM.getAccessToken = getAccessToken;
  window.ALM.getALMUser = getALMUser;
  window.ALM.updateALMUser = updateALMUser;
})(window, document, Granite, jQuery);
