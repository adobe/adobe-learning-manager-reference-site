window.ALM = window.ALM || {};
window.ALM.ALMConfig = window.ALM.ALMConfig || {};

(function (window, document, Granite, $) {
  "use strict";

  const ACCESS_TOKEN_COOKIE_NAME = "alm-cp-token";
  const CP_OAUTH_URL =
    "{almBaseURL}/oauth/o/authorize?account={accountId}&client_id={clientId}&redirect_uri={redirectUri}&state={state}&scope=learner:read,learner:write&response_type=CODE&client_identifier=aemsite&logoutAfterAuthorize=true";
  const CP_OAUTH_STATE = "cpState";

  const WCM_AUTHOR_MODE = "author";
  const WCM_NON_AUTHOR_MODE = "non-author";

  const CP_ACCESS_TOKEN_URL = "/cpoauth.cpAccessToken.html";

  const PRIME_USAGE_TYPE = "aem-sites";
  const ES_USAGE_TYPE = "aem-es";
  const COMMERCE_USAGE_TYPE = "aem-commerce";

  const CURRENT_USAGE_TYPE = window.ALM.ALMConfig.usageType || PRIME_USAGE_TYPE;

  function handleCommerceLogIn() {
    if (!isPrimeUserLoggedIn()) {
      if (isLearningPage()) window.ALM.navigateToExplorePage();
      else if (isCommunityPage()) window.ALM.navigateToCommerceSignInPage();
    }
  }

  function handlePrimeLogIn() {
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
        var oauthState = currentUrl.searchParams.get("state");
        var code = currentUrl.searchParams.get("code");
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
  }

  function isSignOutPage() {
    return window.location.pathname === window.ALM.getALMConfig().signOutPath;
  }

  function isCommunityPage() {
    return window.location.pathname === window.ALM.getALMConfig().communityPath;
  }

  function isCommerceSignInPage() {
    return (
      window.location.pathname === window.ALM.getALMConfig().commerceSignInPath
    );
  }

  function isLearningPage() {
    return window.location.pathname === window.ALM.getALMConfig().learningPath;
  }

  function handlePageLoad() {
    // If sign-out or sign-in Page do nothing
    if (isSignOutPage() || isCommerceSignInPage) return;

    switch (CURRENT_USAGE_TYPE) {
      case PRIME_USAGE_TYPE:
        handlePrimeLogIn();
        break;

      case ES_USAGE_TYPE:
        // Auto-login only if user navigates to Community page.
        // For rest pages, show non-logged in behavior
        if (isCommunityPage()) handlePrimeLogIn();
        break;

      case COMMERCE_USAGE_TYPE:
        handleCommerceLogIn();
        break;

      default:
        break;
    }
  }

  function isAuthor() {
    return window.ALM.ALMConfig.authorMode == true;
  }

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
        getALMUser();
        if (isSignOutPage) {
          window.ALM.navigateToHomePage();
        } else {
          document.location.href = currentUrl.href;
        }
      },
      error: () => {
        alert("Failed to authenticate");
      },
    });
  }

  async function getALMUser() {
    if (!window.ALM.isPrimeUserLoggedIn()) {
      window.sessionStorage.removeItem("user");
      return;
    }
    let user = window.sessionStorage.getItem("user");
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
        window.sessionStorage.setItem("user", userStr);
        return userStr;
      } else {
        console.error("User call failed!!");
      }
    } catch (e) {
      window.sessionStorage.removeItem("user");
      throw e;
    }
  }
  async function updateALMUser() {
    window.sessionStorage.removeItem("user");
    return getALMUser();
  }

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

  function handleLogOut() {
    document.cookie =
      ACCESS_TOKEN_COOKIE_NAME +
      "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.sessionStorage.removeItem("user");

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
  }

  function handleLogIn() {
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
  }

  function handleRegister() {
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
  }

  handlePageLoad();

  window.ALM.isPrimeUserLoggedIn = isPrimeUserLoggedIn;
  window.ALM.getAccessToken = getAccessToken;
  window.ALM.getALMUser = getALMUser;
  window.ALM.updateALMUser = updateALMUser;
  window.ALM.handleLogIn = handleLogIn;
  window.ALM.handleLogOut = handleLogOut;
  window.ALM.handleRegister = handleRegister;
})(window, document, Granite, jQuery);
