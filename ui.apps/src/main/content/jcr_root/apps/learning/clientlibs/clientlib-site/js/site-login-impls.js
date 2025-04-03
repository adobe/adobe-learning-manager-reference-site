(function (window) {

    const ACCESS_TOKEN_COOKIE_NAME = "alm_cp_token";
    const COMMERCE_TOKEN_COOKIE_NAME = "alm_commerce_token";
    const CP_OAUTH_STATE = "cpState";
    const ES_REGISTER_STATE = "esRegisterState";
    const CP_ACCESS_TOKEN_URL = "/cpoauth.cpAccessToken.html";
    const PROXY_ALM_LOGIN_URL = "/cpoauth.almLogin.html";
    const PROXY_ALM_COMMERCE_LOGIN_URL = "/cpoauth.almCommerceLogin.html";
    const PROXY_ALM_LOGOUT_URL = "/cpoauth.almLogout.html";
    const WCM_AUTHOR_MODE = "author";
    const WCM_NON_AUTHOR_MODE = "non-author";
    const CP_ADMIN_RT_LEARNER_RT_TOKEN_URL = "/cpoauth.adminRefreshToken.html";

    const ALM_AUTHENTICATION_ERROR_ID = "alm-authentication-validator";

    class AlmLogin {
        constructor() {
        }

         getCpOauthUrl () {
            const { almBaseURL, clientId, accountId } = window.ALM.ALMConfig;
            return `${almBaseURL}/oauth/o/authorize?account=${accountId}&client_id=${clientId}&redirect_uri=${window.location.href}&state=${CP_OAUTH_STATE}&scope=learner:read,learner:write&response_type=CODE&client_identifier=aemsite&logoutAfterAuthorize=true`;
          };

        makeAjaxRequest(url, method, data) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                url: url,
                type: method,
                async: false,
                data: data,
                success: function (response, textStatus, xhr) {
                    resolve({ response, status: xhr.status });
                },
                error: reject,
                });
            });
        }

        async cleanUpUserData() {
            if (window.ALM.isProxyEnabled()) {
                try {
                    const response = await this.makeAjaxRequest(PROXY_ALM_LOGOUT_URL, "POST", {});
                    console.log(response);
                } catch (error) {
                    console.error("Error in logging out.");
                }
            }  
            document.cookie = ACCESS_TOKEN_COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = COMMERCE_TOKEN_COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            ["user", "CART_ID", "PRIME_CATALOG_FILTER", "COMMERCE_FILTERS"].forEach(param => window.ALM.storage.removeItem(param));
        }

        showPopup(errorMsg, variant, header) {
            let dialogElem = $("#" + ALM_AUTHENTICATION_ERROR_ID);
            let dialogModal;
            let bodyClasses = $("body").attr("class").split(/\s+/);
            let isCoralLightClassPresent = bodyClasses.includes("coral--light");
            if (!isCoralLightClassPresent) {
              $("body").addClass("coral--light");
            }
        
            if(dialogElem.is(":visible"))
            {
              return;
            }
        
            dialogModal = new Coral.Dialog().set({
              id: ALM_AUTHENTICATION_ERROR_ID,
              variant: variant,
              closable: "on",
              header: {
                innerHTML: header
              },
              content: {
                innerHTML: errorMsg
              },
              footer: {
                innerHTML: '<button is="coral-button" variant="default" coral-close>OK</button>'
              }
            });
        
            dialogModal.on('coral-overlay:close', function (event) {
              if (!isCoralLightClassPresent) {
                $("body").removeClass("coral--light");
              }
              $("#" + ALM_AUTHENTICATION_ERROR_ID).remove();
            });
        
            document.body.appendChild(dialogModal);
            dialogModal.show();
        }

          // fetch access_token from AEM
        async fetchAccessToken(data) {

            const ACCESS_TOKEN_URL = Granite.HTTP.externalize(CP_ACCESS_TOKEN_URL);

            try {
                const response = await this.makeAjaxRequest(ACCESS_TOKEN_URL, "POST", data);

                if(response && response.status==200) {
                    window.ALM.isALMLoggedIn = true;
                    const currentUrl = new URL(window.location.href);
                    ["PRIME_BASE", "code", "state"].forEach(param => currentUrl.searchParams.delete(param));
                    window.ALM.getALMUser();
                    if (window.ALM.isSignOutPage()) {
                        window.ALM.navigateToHomePage();
                    } else {
                    document.location.href = currentUrl.href;
                    }
                } else {
                    this.showPopup("Failed to authenticate.", "error", "Error");
                }
                } catch (error) {
                    this.showPopup("Failed to authenticate.", "error", "Error");
                }
        }

        async checkALMLoginImpl() {

            const REDIRECT_URL = Granite.HTTP.externalize(CP_ADMIN_RT_LEARNER_RT_TOKEN_URL);
            const requestData = {
                  _charset_: "UTF-8",
            };
            const currentUrl = new URL(window.location.href);
            const pathName = currentUrl.pathname;
            requestData["pagePath"] = pathName;
            requestData["currentUrl"] = currentUrl.href;
            try {
                 const response = await this.makeAjaxRequest(REDIRECT_URL, "POST", requestData);
                 let jsonRes = JSON.parse(response.response) ;
                 if (response && response.status==200 && jsonRes.isALMLoginImplementation === true) {
                      document.location.href = this.getCpOauthUrl()  ;
                 }
                 await this.setAccessToken();
                 window.ALM.isALMLoggedIn = true;
                 window.ALM.getALMUser();
            } catch (error) {
                 console.error("Failed to authenticate.");
                 console.error(error);
            }
        }

        getAccessToken() {
            if (window.ALM.isProxyEnabled()) {
                return window.ALM.almAccessToken;
            } else {
                let cookieValues = document.cookie.match(
                `(^|[^;]+)\\s*${ACCESS_TOKEN_COOKIE_NAME}\\s*=\\s*([^;]+)`
                );
                return cookieValues ? cookieValues.pop() : "";
            }
        }

        isLoggedIn() {
            if (window.ALM.isProxyEnabled()) {
                return window.ALM.isAlmLoggedIn;
            }
            else {
                return !!this.getAccessToken();
            }
        }

        async setAccessToken () {
            if (window.ALM.isProxyEnabled()) {
                try {
                    const resp = await this.makeAjaxRequest(PROXY_ALM_LOGIN_URL, "POST", {});
                    if (resp && resp.response && resp.status === 200) {
                        window.ALM.almAccessToken = resp.response.access_token;
                    } 
                } catch (error) {
                        console.error("Error in checking logged in");
                        window.ALM.almAccessToken = "";
                }
            }
        }

        async handlePrimeLogIn() {
            const isLoggedIn = this.isLoggedIn();
            const data = {
              _charset_: "UTF-8",
              mode: WCM_AUTHOR_MODE,
            };

            if (!isLoggedIn) {
              const currentUrl = new URL(window.location.href);
              const pathName = currentUrl.pathname;
              data["pagePath"] = pathName;

              const oauthState = currentUrl.searchParams.get("state");
              const code = currentUrl.searchParams.get("code");

              if (window.ALM.isAuthor()) {
                await this.fetchAccessToken(data);
              } else if (window.ALM.ALMConfig["useAdminRefreshToken"] === "true" && code === null) {
                  await this.checkALMLoginImpl();
              } else if (CP_OAUTH_STATE == oauthState && code) {
    
                  data["mode"] = WCM_NON_AUTHOR_MODE;
                  data["code"] = code;
                  await this.fetchAccessToken(data);
              } else {
                  document.location.href = this.getCpOauthUrl();
              }
            }
          };

        handlePageLoad() {
            throw new Error('Implement pageload method');
        }

        async handleLogIn() {
            await this.cleanUpUserData();
        }

        async handleLogOut() {
            await this.cleanUpUserData();
        }

        handleRegister() {
            throw new Error('Implement register method');
        }
    }

    class AlmPrimeLogin extends AlmLogin {
        constructor() {
            super();
        }

        isLoggedIn() {
            return super.isLoggedIn();
        }

        async handlePageLoad() {
            let isLoggedIn;
            if (window.ALM.isProxyEnabled()) {
                try {
                    const resp = await this.makeAjaxRequest(PROXY_ALM_LOGIN_URL, "POST", {});
                    if (resp && resp.response && resp.status === 200)  {
                        isLoggedIn = true;
                        window.ALM.almAccessToken = resp.response.access_token;
                    }
                } catch (error) {
                    console.error("Error in checking logged in");
                    isLoggedIn = false;
                    window.ALM.almAccessToken = "";
                }
            } else {
                isLoggedIn = this.isLoggedIn();
            }
            window.ALM.isAlmLoggedIn = isLoggedIn;

            if (!isLoggedIn) {
                await super.cleanUpUserData();
            }

            // If sign-out or sign-in Page do nothing
            if (window.ALM.isSignOutPage() || window.ALM.isCommerceSignInPage() || window.ALM.isEmailRedirectPage()) {
                return;
            }

            await super.handlePrimeLogIn();
        }

        async handleLogIn() {
            await super.handlePrimeLogIn();
        }

        async handleLogOut() {
            await super.handleLogOut();
            window.ALM.navigateToSignOutPage();
        }

        handleRegister() {
            return;
        }

        getAccessToken() {
            return super.getAccessToken();
        }
    }

    class AlmEsLogin extends AlmLogin {
        constructor() {
            super();
        }

        isLoggedIn() {
            return super.isLoggedIn();
        }

        async handlePageLoad() {
            let isLoggedIn;
            if (window.ALM.isProxyEnabled()) {
                try {
                    const resp = await this.makeAjaxRequest(PROXY_ALM_LOGIN_URL, "POST", {});
                    if (resp && resp.response && resp.status === 200)  {
                        isLoggedIn = true;
                        window.ALM.almAccessToken = resp.response.access_token;
                    }
                } catch (error) {
                    console.error("Error in checking logged in");
                    isLoggedIn = false;
                    window.ALM.almAccessToken = "";
                }
            } else {
                isLoggedIn = this.isLoggedIn();
            }
            window.ALM.isAlmLoggedIn = isLoggedIn;

            if (!isLoggedIn) {
                await super.cleanUpUserData();
            }

            // If sign-out or sign-in Page do nothing
            if (window.ALM.isSignOutPage() || window.ALM.isCommerceSignInPage() || window.ALM.isEmailRedirectPage()) {
                return;
            }

            const currentUrl = new URL(window.location.href);
            const state = currentUrl.searchParams.get("state");
            const code = currentUrl.searchParams.get("code");
            const pathName = currentUrl.pathname;
        
            // For author mode, behavior same as AEM+ALM
        
            if (window.ALM.isAuthor()) {
              await super.handlePrimeLogIn();
            } else {
              if (ES_REGISTER_STATE == state && code) {
                // Handle User registration
                const data = {
                  _charset_: "UTF-8",
                  mode: WCM_NON_AUTHOR_MODE,
                  code: code,
                  pagePath: pathName,
                };
                await this.fetchAccessToken(data);
              } else if (window.ALM.isCommunityPage() || window.ALM.isBoardDetailsPage() || window.ALM.isBoardsPage() || window.ALM.isProfilePage() || (CP_OAUTH_STATE == state && code)) {
                // Auto-login like Prime Usage only if user navigates to Community, Boards, Profile pages.
                // For rest pages, show non-logged in behavior
                await super.handlePrimeLogIn();
              } else if (!isLoggedIn) {
                if (window.ALM.isLearningPage()) {
                  window.ALM.navigateToExplorePage();
                }
              }
            }
        }

        async handleLogIn() {
            await super.handlePrimeLogIn();
        }

        async handleLogOut() {
            await super.handleLogOut();
            window.ALM.navigateToHomePage();
        }

        handleRegister() {
            const { almBaseURL, clientId, almRegisterUrl } = window.ALM.ALMConfig;
            document.location.href = `${almBaseURL}/oauth/o/authorize?client_id=${clientId}&redirect_uri=${window.location.href}&state=${ES_REGISTER_STATE}&scope=learner:read,learner:write&response_type=CODE&client_identifier=aemsite&logoutAfterAuthorize=true&loginUrl=${encodeURIComponent(almRegisterUrl)}`;
        }

        getAccessToken() {
            return super.getAccessToken();
        }
    }

    class AlmCommerceLogin extends AlmLogin {
        constructor() {
            super();
        }

        getCommerceToken() {
            if (window.ALM.isProxyEnabled()) {
                return window.ALM.almCommerceToken;
            } else {
                let cookieValues = document.cookie.match(
                    `(^|[^;]+)\\s*${COMMERCE_TOKEN_COOKIE_NAME}\\s*=\\s*([^;]+)`
                );
                return cookieValues ? cookieValues.pop() : "";
            }
        }

        isLoggedIn() {
            return super.isLoggedIn();
        }

        isCommerceLoggedIn() {
            if (window.ALM.isProxyEnabled()) {
                return window.ALM.isCommerceLoggedIn;
            } else {
                return this.getCommerceToken() === "" ? false : true;
            }

        }

        async handlePageLoad() {
            let isALMLoggedIn;
            if (window.ALM.isProxyEnabled()) {
                try {
                    const resp = await this.makeAjaxRequest(PROXY_ALM_LOGIN_URL, "POST", {});
                    if (resp && resp.response && resp.status === 200)  {
                        isALMLoggedIn = true;
                        window.ALM.almAccessToken = resp.response.access_token;
                    }
                } catch (error) {
                    console.error("Error in checking logged in");
                    isALMLoggedIn = false;
                    window.ALM.almAccessToken = "";
                }
            } else {
                isALMLoggedIn = this.isLoggedIn();
            }
            window.ALM.isAlmLoggedIn = isALMLoggedIn;

            let isCommerceLoggedIn;
            if (window.ALM.isProxyEnabled()) {
                try {
                    const resp = await super.makeAjaxRequest(PROXY_ALM_COMMERCE_LOGIN_URL, "POST", {});
                    if (resp && resp.response && resp.status === 200)  {
                        isCommerceLoggedIn = true;
                        window.ALM.almCommerceToken = resp.response.access_token;
                    }
                } catch (error) {
                    console.error("Error in checking logged in");
                    isCommerceLoggedIn = false;
                    window.ALM.almCommerceToken = "";
                }
            } else {
                isCommerceLoggedIn = this.isCommerceLoggedIn();
            }
            window.ALM.isCommerceLoggedIn = isCommerceLoggedIn;

            if (!isALMLoggedIn || (!window.ALM.isAuthor() && !isCommerceLoggedIn)) {
                await super.cleanUpUserData();
            }

            // If sign-out or sign-in Page do nothing
            if (window.ALM.isSignOutPage() || window.ALM.isCommerceSignInPage() || window.ALM.isEmailRedirectPage()) {
                return;
            }

            if (window.ALM.isAuthor()) {
               await super.handlePrimeLogIn();
            }
            else if (!isALMLoggedIn) {
                if (window.ALM.isLearningPage()) {
                  window.ALM.navigateToExplorePage();
                } else if (window.ALM.isCommunityPage() || window.ALM.isBoardDetailsPage() || window.ALM.isBoardsPage() || window.ALM.isProfilePage()) {
                  window.ALM.navigateToCommerceSignInPage();
                }
            }
        }

        async handleLogIn() {
            await super.handleLogIn();
            window.ALM.navigateToCommerceSignInPage();
        }

        async handleLogOut() {
            await super.handleLogOut();
            window.ALM.navigateToHomePage();
        }

        handleRegister() {
            window.ALM.navigateToCommerceSignInPage();
            return;
        }

        getAccessToken() {
            return super.getAccessToken();
        }

    }
    window.ALM = window.ALM || {};
    window.ALM.loginImpls = window.ALM.loginImpls || {"AlmPrimeLogin": new AlmPrimeLogin(), "AlmEsLogin": new AlmEsLogin(), "AlmCommerceLogin": new AlmCommerceLogin()};
})(window);
