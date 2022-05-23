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

    (function (document, window, $) {
    "use strict";

    const HEADER_SHOW_MENU_SEL = ".alm-header-cont .alm-header-menu";
    const HEADER_PROFILE_PIC_SEL = ".alm-header-profile";
    const HEADER_PROFILE_OPTIONS_SEL = ".alm-header-profile,.alm-header-down";
    const VERT_NAV_CLOSE_BUTTON_SEL = ".vert-nav-close-button";
    const VERT_NAV_PROFILE_NAME_SEL = ".vert-nav-profile-name";
    const HEADER_PROFILE_ARROW_DOWN_SEL = ".alm-header-down";

    const VERT_NAV_CONTAINER_SEL = ".alm-header-vertical-nav";
    const VERT_NAV_PROFILE_PIC_SEL = ".vert-nav-profile-image";
    const HEADER_PROFILE_OPTIONS_CONT_SEL = ".alm-header-profile-options";

    const HOME_NAVIGATE_SEL = ".alm-home-navigate";
    const LEARNING_NAVIGATE_SEL = ".alm-learning-navigate";
    const COMMUNITY_NAVIGATE_SEL = ".alm-community-navigate";
    const SUPPORT_NAVIGATE_SEL = ".alm-support-navigate";
    const LOGOUT_NAVIGATE_SEL = ".alm-logout-navigate";
    const LOGIN_NAVIGATE_SEL = ".alm-login-navigate";
    const REGISTER_NAVIGATE_SEL = ".alm-register-navigate";
    const NAV_NAVIGATE_HIGHLIGHT_SEL = ".nav-highlight";
    const NAV_NAVIGATE_HIGHLIGHT_REL = "nav-highlight";
    const HEADER_CART_SEL = ".alm-header-cart";

    const HEADER_LOG_IN_REL = ".alm-log-in";
    const HEADER_LOG_OUT_REL = ".alm-log-out";
    const HEADER_REGISTER_REL = ".alm-register";
    const HEADER_PROFILE_TEXT_REL = ".alm-profile__text";
    const HEADER_NOTIFICATION_REL = ".alm-header-icons .notification__container";

    const DEFAULT_USER_AVATAR =
        "/content/dam/learning/site/default_user_avatar.svg";

    const COMMERCE_USAGE_TYPE = "aem-commerce";
    const ALM_USAGE_TYPE = "aem-sites";

    const STORAGE_CART_ID_KEY = "CART_ID";
    const GRAPHQL_CART_QUERY = `{
        cart(cart_id: "{cart_id}") {
          total_quantity
        }
      }`;

    async function updateCart() {
        if (typeof window !== 'undefined' && window.localStorage 
        && window.ALM.storage.getItem(STORAGE_CART_ID_KEY)
        && window.ALM.getCommerceToken())
        {
            try {
                const cartID = window.ALM.storage.getItem(STORAGE_CART_ID_KEY);
                const commerceToken = window.ALM.getCommerceToken();
                const graphqlCartQuery = GRAPHQL_CART_QUERY.replace("{cart_id}", cartID);
                const graphqlProxyURL = window.ALM.ALMConfig.graphqlProxyPath + "?query=" + encodeURIComponent(graphqlCartQuery);
                const response = await fetch(graphqlProxyURL, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${commerceToken}`,
                    }
                });
                if (response && response.ok)
                {
                    let responseJson = await response.json();
                    if (responseJson.errors)
                    {
                        console.error(JSON.stringify(responseJson.errors));
                    }
                    else if (responseJson.data && responseJson.data.cart && responseJson.data.cart.total_quantity)
                    {
                        window.ALM.updateCart(responseJson.data.cart.total_quantity);
                    }
                }
            } catch (e) {
                console.error("Exception in getting cart details");
            }
        }
    }

    function updateUserProfileImage(imageURL) {
        $(HEADER_PROFILE_PIC_SEL).attr("src", imageURL);
        $(VERT_NAV_PROFILE_PIC_SEL).attr("src", imageURL);
    }

    function isAuthor() {
        return window.ALM.ALMConfig.authorMode == true;
    }

    function highlightNavigationButtons() {
        const ALM_CONFIG = window.ALM.getALMConfig();
        const CURRENT_PATH_NAME = window.location.pathname;
        const ALM_LINKS_MAP = new Map()
        .set(ALM_CONFIG.homePath, [
            HOME_NAVIGATE_SEL + "+" + NAV_NAVIGATE_HIGHLIGHT_SEL,
            "size__XS",
            VERT_NAV_CONTAINER_SEL + " " + HOME_NAVIGATE_SEL,
        ])
        .set(ALM_CONFIG.learningPath, [
            LEARNING_NAVIGATE_SEL + "+" + NAV_NAVIGATE_HIGHLIGHT_SEL,
            "size__S",
            VERT_NAV_CONTAINER_SEL + " " +  LEARNING_NAVIGATE_SEL,
        ])
        .set(ALM_CONFIG.communityPath, [
            COMMUNITY_NAVIGATE_SEL + "+" + NAV_NAVIGATE_HIGHLIGHT_SEL,
            "size__M",
            VERT_NAV_CONTAINER_SEL + " " + COMMUNITY_NAVIGATE_SEL,
        ])
        .set(ALM_CONFIG.supportPath, [
            SUPPORT_NAVIGATE_SEL + "+" + NAV_NAVIGATE_HIGHLIGHT_SEL,
            "size__S",
            VERT_NAV_CONTAINER_SEL + " " + SUPPORT_NAVIGATE_SEL,
        ]);

        const CURRENT_NAV_OBJ = ALM_LINKS_MAP.get(CURRENT_PATH_NAME);
        if (CURRENT_NAV_OBJ) {
        $(CURRENT_NAV_OBJ[0]).show();
        $(CURRENT_NAV_OBJ[0]).addClass(CURRENT_NAV_OBJ[1]);
        $(CURRENT_NAV_OBJ[2]).addClass(NAV_NAVIGATE_HIGHLIGHT_REL);
        }
    }

    function renderLoginButtons() {
        if (isAuthor()) {
            // in author mode, don't show Login/Logout/Register option. User will always be logged in.
            hideLoginOption();
            hideRegisterOption();
            hideLogoutOption();
            if (!window.ALM.isPrimeUserLoggedIn()) {
                hideProfileOption();
                hideAllOptions();
            }
        } 
        else {
            if (window.ALM.isPrimeUserLoggedIn()) {
                hideLoginOption();
                hideRegisterOption();
            } 
            else {
                hideLogoutOption();
                hideProfileOption();
                $(HEADER_NOTIFICATION_REL).hide();
                if (ALM_USAGE_TYPE === window.ALM.ALMConfig.usageType) {
                    hideAllOptions();
                    hideLoginOption();
                    hideRegisterOption();
                }
                else {
                    let registerURL = window.ALM.ALMConfig.almRegisterUrl || "";
                    if (!registerURL.trim()) {
                        hideRegisterOption();
                    }
                }
            }
        }
    }

    function hideAllOptions() {
        $(HEADER_PROFILE_OPTIONS_CONT_SEL).remove();
        $(HEADER_PROFILE_ARROW_DOWN_SEL).remove();
    }

    function hideProfileOption() {
        $(HEADER_PROFILE_TEXT_REL).remove();
    }

    function hideLogoutOption() {
        $(HEADER_LOG_OUT_REL).remove();
        $(LOGOUT_NAVIGATE_SEL).prev().remove();
        $(LOGOUT_NAVIGATE_SEL).remove();
    }

    function hideRegisterOption() {
        $(HEADER_REGISTER_REL).remove();
        $(REGISTER_NAVIGATE_SEL).prev().remove();
        $(REGISTER_NAVIGATE_SEL).remove();
    }

    function hideLoginOption() {
        $(HEADER_LOG_IN_REL).remove();
        $(LOGIN_NAVIGATE_SEL).prev().remove();
        $(LOGIN_NAVIGATE_SEL).remove();
    }

    function fetchProfileDetails() {
        window.ALM.getALMUser().then(function (user) {
        try {
            const userAttrs = JSON.parse(user).data.attributes;
            updateUserProfileImage(userAttrs.avatarUrl);
            $(VERT_NAV_PROFILE_NAME_SEL).text(userAttrs.name);
        } catch (e) {
            console.error("Unable to fetch user avatar.");
        }
        });
    }

    function renderCommerceSpecificUI() {
        if (COMMERCE_USAGE_TYPE === window.ALM.ALMConfig.usageType) {
            if (window.ALM.isPrimeUserLoggedIn()) {
                $(HEADER_CART_SEL).show();
                updateCart();
            } else {
                $(HEADER_CART_SEL).hide();
            }
        }
    }

    $(document).ready(function () {
        renderLoginButtons();
        highlightNavigationButtons();
        renderCommerceSpecificUI();

        $(HEADER_LOG_IN_REL).on("click", () => window.ALM.handleLogIn());
        $(LOGIN_NAVIGATE_SEL).on("click", () => window.ALM.handleLogIn());
        $(HEADER_LOG_OUT_REL).on("click", () => window.ALM.handleLogOut());
        $(LOGOUT_NAVIGATE_SEL).on("click", () => window.ALM.handleLogOut());
        $(HEADER_REGISTER_REL).on("click", () => window.ALM.handleRegister());
        $(REGISTER_NAVIGATE_SEL).on("click", () => window.ALM.handleRegister());
        $(HEADER_PROFILE_TEXT_REL).on("click", () => window.ALM.navigateToProfilePage());
        $(COMMUNITY_NAVIGATE_SEL).on("click", () => window.ALM.navigateToCommunityPage());
        $(HOME_NAVIGATE_SEL).on("click", () => window.ALM.navigateToHomePage());
        $(LEARNING_NAVIGATE_SEL).on("click", () => window.ALM.navigateToLearningPage());
        $(SUPPORT_NAVIGATE_SEL).on("click", () => window.ALM.navigateToSupportPage());
        $(HEADER_CART_SEL).on("click", () => window.ALM.navigateToCommerceCartPage());

        $(VERT_NAV_CLOSE_BUTTON_SEL + "," + HEADER_SHOW_MENU_SEL).on("click", () => {
                $(VERT_NAV_CONTAINER_SEL).toggleClass("open");
            }
        );
        $(HEADER_PROFILE_OPTIONS_SEL).on("click", () => {
            $(HEADER_PROFILE_OPTIONS_CONT_SEL).toggle();
        });

        if (window.ALM.isPrimeUserLoggedIn()) {
            fetchProfileDetails();
        } else {
            updateUserProfileImage(DEFAULT_USER_AVATAR);
        }
    });

    window.ALM = window.ALM || {};
    window.ALM.updateUserProfileImage = updateUserProfileImage;
    
    })(document, window, jQuery);
