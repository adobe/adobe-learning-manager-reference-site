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
import { SetupAccountTerminologies } from "./translationService";
const _fontLoading = require("./fontLoading");

export interface PrimeConfig {
  almBaseURL: string;
  primeApiURL: string;
  primeCdnTrainingBaseEndpoint: string;
  esBaseUrl: string;
  accessToken: string;
  baseUrl: string;
  instancePath: string;
  catalogPath: string;
  trainingOverviewPath: string;
  communityPath: string;
  communityBoardsPath: string;
  communityBoardDetailsPath: string;
  commerceBasePath: string;
  locale: string;
  almCdnBaseUrl: string;
  commerceURL: string;
  graphqlProxyPath: string;
  usageType: "aem-sites" | "aem-es" | "aem-commerce";
  accountData: string;
  mountingPoints: {
    [key: string]: string;
  };
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
  updateAccountActiveFieldsDetails: Function;
  handleLogIn: Function;
  storage: any;
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
  const pathname = getWindowObject().location.pathname;
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

export const redirectToLoginAndAbort = (forceRedirect = false) => {
  if (forceRedirect || !getALMObject().isPrimeUserLoggedIn()) {
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
    "?" +
    encodeURI(existingQueryParams.toString()) +
    window.location.hash;
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

const init = async () => {
  if (!getALMObject().isPrimeUserLoggedIn()) {
    const account = await getALMAccount();
    const accountTerminologies = account.accountTerminologies;
    SetupAccountTerminologies(
      accountTerminologies as PrimeAccountTerminology[]
    );
    return;
  }
  const response = await getALMUser();
  const account = response?.user?.account;
  SetupAccountTerminologies(account?.accountTerminologies);
};

init();

export const getItemFromStorage = (key: string) => {
  return getALMObject().storage.getItem(key);
};

export const setItemToStorage = (key: string, data: any, ttl = 10800) => {
  return getALMObject().storage.setItem(key, data, ttl);
};
