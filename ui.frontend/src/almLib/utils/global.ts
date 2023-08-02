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
import { PrimeAccount, PrimeAccountTerminology } from "../models/PrimeModels";
import { JsonApiParse } from "./jsonAPIAdapter";
import { setThemeVariables } from "./themes";
import { SetupAccountTerminologies } from "./translationService";
const _fontLoading = require("./fontLoading");

export interface PrimeThemeData {
  id: string;
  name: string;
  url: string;
  className: string;
  brandColor: string;
  sidebarIconColor: string;
  sidebarColor: string;
  widgetPrimaryColor: string;
}

export interface PrimeConfig {
  almBaseURL: string;
  primeApiURL: string;
  primeCdnTrainingBaseEndpoint: string;
  esBaseUrl: string;
  accessToken: string;
  baseUrl: string;
  instancePath: string;
  homePath: string;
  catalogPath: string;
  trainingOverviewPath: string;
  communityPath: string;
  communityBoardsPath: string;
  communityBoardDetailsPath: string;
  commerceBasePath: string;
  locale: string;
  pageLocale: string;
  almCdnBaseUrl: string;
  commerceURL: string;
  graphqlProxyPath: string;
  usageType: "aem-sites" | "aem-es" | "aem-commerce";
  accountData: string;
  commerceStoreName: string;
  frontendResourcesPath: string;
  mountingPoints: {
    [key: string]: string;
  };
  themeData: PrimeThemeData;
  hideBackButton: boolean;
  hideSearchInput: boolean;
  handleShareExternally: boolean;
  useConfigLocale: boolean;
}

export interface ALM {
  getALMConfig: Function;
  navigateToTrainingOverviewPage: Function;
  navigateToInstancePage: Function;
  navigateToBoardDetailsPage: Function;
  navigateToBoardsPage: Function;
  isPrimeUserLoggedIn: Function;
  getALMUser: Function;
  getAccessToken: Function;
  getCommerceToken: Function;
  setALMAttribute: Function;
  getALMAttribute: Function;
  updateALMUser: Function;
  updateUserProfileImage: Function;
  updateCart: Function;
  getAccountActiveFields: Function;
  handlePageLoad: Function;
  updateAccountActiveFieldsDetails: Function;
  handleLogIn: Function;
  handleLogOut: Function;
  storage: any;
  themeData: PrimeThemeData;
}

export function getWindowObject() {
  return window as any;
}

export function getALMObject(): ALM {
  return getWindowObject().ALM;
}

export const setALMAttribute = (key: string, value: any) => {
  getWindowObject().ALM[key] = value;
};

export const getALMAttribute = (key: string) => {
  return getWindowObject().ALM[key];
};

export function getALMConfig(): PrimeConfig {
  return getALMObject().getALMConfig();
}

export function getAccessToken(): string {
  return getALMObject().getAccessToken();
}

export function getCommerceToken(): string {
  return getALMObject().getCommerceToken();
}

export const getPathParams = (pagePath: string, pathParams: string[] = []) => {
  let paramsMap: {
    [key: string]: string;
  } = {};
  const currentUrl = getWindowObject().location;
  const pathname = currentUrl.pathname.indexOf(pagePath) > -1
      ? currentUrl.pathname
      : currentUrl.hash;
  let params: string[] = pathname.split(pagePath)[1].split("/");
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i];
    const paramIdx = params.findIndex((element) => element === pathParam);
    if (paramIdx !== -1) {
      const paramValueIdx = paramIdx + 1;
      paramsMap[pathParam] = params[paramValueIdx];
    }
  }
  return paramsMap;
};

export function getQueryParamsFromUrl() {
  const location = getWindowObject().location;
  const params: URLSearchParams = new URLSearchParams(
    decodeURI(location.search)
  );
  return Object.fromEntries(params.entries());
}

export const getALMUser = async () => {
  const response = await getALMObject().getALMUser();
  if (response) {
    return JsonApiParse(response);
  }
  return null;
};

export const getAccountActiveFields = async () => {
  return await getALMObject().getAccountActiveFields();
};

export const updateAccountActiveFieldsDetails = async (
  accountActiveFields: any,
  userId: string
) => {
  return await getALMObject().updateAccountActiveFieldsDetails(
    accountActiveFields,
    userId
  );
};

export const updateALMUser = async () => {
  return JsonApiParse(await getALMObject().updateALMUser());
};

export const updateUserProfileImage = async (imageUrl: any) => {
  return JsonApiParse(await getALMObject().updateUserProfileImage(imageUrl));
};

export const getConfigurableAttributes = (cssSelector: string) => {
  return (document.querySelector(cssSelector) as any)?.dataset;
};

export const isUserLoggedIn = () => {
  return getALMObject().isPrimeUserLoggedIn();
};

export const redirectToLoginAndAbort = (forceRedirect = false) => {
  if (forceRedirect || !isUserLoggedIn()) {
    getALMObject().handleLogIn();
    return true;
  }
  return false;
};

export function updateURLParams(params: any) {
  const location = getWindowObject().location;
  const existingQueryParams = new URLSearchParams(decodeURI(location.search));
  for (let key in params) {
    if (params[key]) {
      existingQueryParams.set(key, params[key]);
    } else {
      existingQueryParams.delete(key);
    }
  }
  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    (existingQueryParams.toString().length !== 0
      ? "?" + encodeURI(existingQueryParams.toString()) + window.location.hash
      : "");
  window.history.replaceState({ path: newurl }, "", newurl);
}

export const getALMAccount = async () => {
  if (getALMObject().isPrimeUserLoggedIn()) {
    const response = await getALMUser();
    return response?.user?.account || ({} as PrimeAccount);
  }

  const accountDataStr = getALMConfig().accountData;
  const accountData = accountDataStr ? JSON.parse(accountDataStr) : null;
  const account = (accountData?.data?.attributes || {}) as PrimeAccount;
  return account;
};

export const init = async () => {
  let account: PrimeAccount | undefined;
  if (!getALMObject().isPrimeUserLoggedIn()) {
    account = await getALMAccount();
    const accountTerminologies = account.accountTerminologies;
    SetupAccountTerminologies(accountTerminologies);
  } else {
    const response = await getALMUser();
    account = response?.user?.account;
    SetupAccountTerminologies(account?.accountTerminologies);
  }
  const themeData = account?.themeData;
  if (themeData) {
    const primeThemeData = JSON.parse(themeData) as PrimeThemeData;
    getALMConfig().themeData = primeThemeData;
    setThemeVariables(primeThemeData);
  }
};

init();

export const getItemFromStorage = (key: string) => {
  return getALMObject().storage.getItem(key);
};

export const setItemToStorage = (key: string, data: any, ttl = 10800) => {
  return getALMObject().storage.setItem(key, data, ttl);
};

export const getCommerceStoreName = () => {
  return getALMConfig().commerceStoreName;
};

export const getRegistrationsURLs = (accountConfig: any, almDomain: string) => {
  const registrationProfile: {
    [key: string]: string;
  } = accountConfig?.registrationProfile;
  const queryParams = getQueryParamsFromUrl();
  const epId = queryParams["groupid"];
  const ipId = queryParams["ipId"];
  const accesskey = queryParams["accesskey"];
  let domain = window.location.origin;
  if (domain.indexOf("localhost") != -1) {
    domain = almDomain;
  }
  let signUpURL = "";
  let signInURL = "";
  if (ipId) {
    signUpURL = `${domain}/accountiplogin?ipId=${ipId}&accesskey=${accesskey}`;
    signInURL = signUpURL;
  } else if (epId) {
    signUpURL = `${domain}/eplogin?groupid=${epId}&accesskey=${accesskey}`;
    signInURL = `${domain}/accounteplogin?epId=${epId}&accesskey=${accesskey}`;
  } else {
    signUpURL = registrationProfile.signUpURL;
    signInURL = registrationProfile.signInURL;
  }
  return { signUpURL, signInURL };
};

export const isUrl = (link: string) => {
  let url;
  try {
    url = new URL(link);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export const navigateToLogin = (url: any, loId: string, almDomain: any) => {
  let returnPathUrl = encodeURIComponent(
    almDomain + "/app/learner#/" + loId.split(":")[0] + "/" + loId.split(":")[1]
  );
  (window as any).location.href = url + "&returnPath=" + returnPathUrl;
};

export function getPageAttributes(
  container: string,
  pageAttributeName: string
) {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints[container];
    let attributes = getConfigurableAttributes(cssSelector) || {};
    setALMAttribute(pageAttributeName, attributes);
    return attributes;
  }
}