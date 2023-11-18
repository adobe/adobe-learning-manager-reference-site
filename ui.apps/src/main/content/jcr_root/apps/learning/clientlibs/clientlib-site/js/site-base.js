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

  const CONFIG_META_TAG_NAME = "cp-config";
  const COMMERCE_CART_COUNTER_REL = ".alm-header-cart-counter";

  const isAuthor = () => window.ALM.ALMConfig.authorMode == true;

  const setALMConfig = () => {
    const cpConfigElmt = document.querySelector(
      'meta[name="' + CONFIG_META_TAG_NAME + '"]'
    );
    if (cpConfigElmt) {
      window.ALM.ALMConfig = JSON.parse(cpConfigElmt.content);
      const primeBaseURL = window.ALM.ALMConfig["almBaseURL"];
      
      let primeApiURL = "";

      primeApiURL = `${primeBaseURL}/primeapi/v2/`;

      window.ALM.ALMConfig["primeApiURL"] = primeApiURL;
    }
    window.ALM.ALMConfig["frontendResourcesPath"] = "/etc.clientlibs/learning/clientlibs/clientlib-alm/resources";
  };

  const init = () => {
    setALMConfig();
  };

  const getALMConfig = () => {
    return window.ALM.ALMConfig;
  };

  const navigateToTrainingOverviewPage = (
    trainingId,
    trainingInstanceId = "",
    queryParams = ""
  ) => {
    let { trainingOverviewPath } = getALMConfig();

    trainingOverviewPath = getUrl(trainingOverviewPath, {
      trainingId: trainingId,
    });
    trainingOverviewPath = trainingInstanceId
      ? getUrl(trainingOverviewPath, { trainingInstanceId: trainingInstanceId })
      : trainingOverviewPath;
    window.location = queryParams
      ? trainingOverviewPath + "?" + queryParams
      : trainingOverviewPath;
  };

  const navigateToInstancePage = (trainingId) => {
    let { instancePath } = getALMConfig();
    window.location = getUrl(instancePath, { trainingId: trainingId });
  };

  const navigateToBoardDetailsPage = (boardId) => {
    let { communityBoardDetailsPath } = getALMConfig();
    window.location = getUrl(communityBoardDetailsPath, { boardId: boardId });
  };

  const navigateToCatalogPage = (catalogIds) => {
    let { catalogPath } = getALMConfig();
    let catalogUrl = catalogPath + "?catalogs=" + catalogIds;
    window.location = catalogUrl;
  };

  const navigateToCatalogPageForStates = (learnerStates) => {
    let { catalogPath } = getALMConfig();
    let catalogUrl = catalogPath + "?learnerState=" + learnerStates;
    window.location = catalogUrl;
  };

  const navigateToCatalogPageFromCategory = (
    catalogNames,
    skillNames,
    tagNames
  ) => {
    let { catalogPath } = getALMConfig();
    let catalogUrl = catalogPath;

    catalogUrl += "?";
    if (catalogNames)
      catalogUrl += "catalogs=" + encodeURIComponent(catalogNames) + "&";
    if (skillNames)
      catalogUrl += "skillName=" + encodeURIComponent(skillNames) + "&";
    if (tagNames) catalogUrl += "tagName=" + encodeURIComponent(tagNames) + "&";

    catalogUrl = catalogUrl.slice(0, -1);

    window.location = catalogUrl;
  };

  const navigateToExplorePage = () => {
    let { catalogPath } = getALMConfig();
    window.location = catalogPath;
  };

  const navigateToBoardsPage = (skillNames) => {
    let { communityBoardsPath } = getALMConfig();
    let boardsUrl = communityBoardsPath;
    if (skillNames) boardsUrl += "?skill=" + skillNames;
    window.location = boardsUrl;
  };

  const navigateToHomePage = () => {
    let { homePath } = getALMConfig();
    window.location = homePath;
  };

  const navigateToLearningPage = () => {
    let { learningPath } = getALMConfig();
    window.location = learningPath;
  };

  const navigateToCommunityPage = () => {
    let { communityPath } = getALMConfig();
    window.location = communityPath;
  };

  const navigateToSupportPage = () => {
    let { supportPath } = getALMConfig();
    window.location = supportPath;
  };

  const navigateToCommerceSignInPage = () => {
    let { commerceSignInPath } = getALMConfig();
    window.location =
      commerceSignInPath +
      "?redirectPath=" +
      encodeURIComponent(window.location.href);
  };

  const navigateToCommerceCartPage = () => {
    let { commerceCartPath } = getALMConfig();
    window.location = commerceCartPath + "/cart";
  };

  const navigateToProfilePage = () => {
    let { profilePath } = getALMConfig();
    window.location = profilePath;
  };

  const navigateToSignOutPage = () => {
    let { signOutPath } = getALMConfig();
    window.location = signOutPath;
  };

  const getUrl = (urlStr, params) => {
    for (const param in params) {
      urlStr = `${urlStr}/${param}/${params[param]}`;
    }
    return urlStr;
  };

  const updateCart = (counter) => {
    if (counter > 0) {
      let counterElem = $(COMMERCE_CART_COUNTER_REL);
      counterElem.show();
      counterElem.text(counter);
    } else {
      $(COMMERCE_CART_COUNTER_REL).hide();
    }
  };

  const isProxyEnabled = () => {
    const {storeTokenInCookie} = getALMConfig();
    return storeTokenInCookie === "true";
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

  const isBoardsPage = () =>
    window.location.pathname.includes(window.ALM.getALMConfig().communityBoardsPath);

  const isBoardDetailsPage = () =>
    window.location.pathname.includes(window.ALM.getALMConfig().communityBoardDetailsPath);

  const isProfilePage = () =>
    window.location.pathname.includes(window.ALM.getALMConfig().profilePath);

  const isExtensionAllowed = (extension) => {
    return Boolean(extension);
  };
  init();

  window.ALM.getALMConfig = getALMConfig;
  window.ALM.navigateToTrainingOverviewPage = navigateToTrainingOverviewPage;
  window.ALM.navigateToInstancePage = navigateToInstancePage;
  window.ALM.navigateToCatalogPage = navigateToCatalogPage;
  window.ALM.navigateToExplorePage = navigateToExplorePage;
  window.ALM.navigateToBoardDetailsPage = navigateToBoardDetailsPage;
  window.ALM.navigateToBoardsPage = navigateToBoardsPage;
  window.ALM.navigateToHomePage = navigateToHomePage;
  window.ALM.navigateToLearningPage = navigateToLearningPage;
  window.ALM.navigateToCommunityPage = navigateToCommunityPage;
  window.ALM.navigateToSupportPage = navigateToSupportPage;
  window.ALM.navigateToCommerceSignInPage = navigateToCommerceSignInPage;
  window.ALM.navigateToCommerceCartPage = navigateToCommerceCartPage;
  window.ALM.navigateToProfilePage = navigateToProfilePage;
  window.ALM.navigateToSignOutPage = navigateToSignOutPage;
  window.ALM.navigateToCatalogPageFromCategory =
    navigateToCatalogPageFromCategory;
  window.ALM.navigateToCatalogPageForStates = navigateToCatalogPageForStates;
  window.ALM.updateCart = updateCart;
  window.ALM.isProxyEnabled = isProxyEnabled;
  window.ALM.isAuthor = isAuthor;
  window.ALM.isSignOutPage = isSignOutPage;
  window.ALM.isCommerceSignInPage = isCommerceSignInPage;
  window.ALM.isEmailRedirectPage = isEmailRedirectPage;
  window.ALM.isLearningPage = isLearningPage;
  window.ALM.isCommunityPage = isCommunityPage;
  window.ALM.isBoardDetailsPage = isBoardDetailsPage;
  window.ALM.isBoardsPage = isBoardsPage;
  window.ALM.isProfilePage = isProfilePage;
  window.ALM.isExtensionAllowed = isExtensionAllowed;
  
})(window, document, Granite, jQuery);
