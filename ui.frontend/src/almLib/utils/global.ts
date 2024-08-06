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

import {
  PrimeAccount,
  PrimeExtension,
  PrimeLearningObject,
  PrimeLearningObjectResource,
} from "../models/PrimeModels";
import { RestAdapter } from "./restAdapter";
import { convertToLearnerDesktopParams } from "./urlConv";
import { InitThemeData } from "./themes";
import { SetupAccountTerminologies } from "./translationService";
import { darkTheme, lightTheme } from "@adobe/react-spectrum";
import {
  ALM_LEARNER_UPDATE_URL,
  AUTHOR_ID_STR,
  AUTUMN_THEME,
  CARNIVAL_THEME,
  CART_DATA,
  CPENEW,
  DEFAULT_THEME,
  PEBBLES_THEME,
  TILE_VIEW,
  VIVID_THEME,
  WINTER_SKY_THEME,
} from "./constants";
import { CardProperties, IThemeData, Widget } from "./widgets/common";
import { JsonApiParse } from "./jsonAPIAdapter";
import { ApplyInjectables } from "./widgets/utils";
import { getLoViewRefLink } from "../components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { SendLinkEvent } from "./widgets/base/EventHandlingBase";
const _fontLoading = require("./fontLoading");

export interface PrimeTheme {
  tileColors: Array<string>;
  primaryColor: string;
  secondaryColor: string;
  neutralColors: Array<string>;
  themeOverrides: IThemeData;
  primeThemeColors?: PrimeThemeColors;
  name: string;
  sidebarColor: string;
  sidebarIconColor: string;
  brandColor: string;
  homePageBackgroundColor?: string;
  homePageBackgroundImage?: string;
  fonts?: ExternalFont;
}

export interface ExternalFont {
  fontName: string;
  fontFace: string;
}
export interface PrimeThemeColors {
  backgroundColor: string;
  color: string;
  subtleText: string;
  textAreaBorder: string;
  textAreaBackground: string;
}
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
  csrfToken: string;
  nativeExtensionToken?: string;
  baseUrl: string;
  instancePath: string;
  homePath: string;
  catalogPath: string;
  trainingOverviewPath: string;
  authorPath: string;
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
  themeData: PrimeTheme;
  hideBackButton: boolean;
  hideSearchInput: boolean;
  hideSearchClearButton: boolean;
  handleShareExternally: boolean;
  handleLinkedInContentExternally: boolean;
  useConfigLocale: boolean;
  widgetConfig?: WidgetConfig;
  theme: IThemeData;
  _cardProperties: CardProperties;
  homePageLayoutConfig?: HomePageLayoutConfig;
  customInjections: PrimeInjection;
  defaultCatalogSort?: string;
  learnerDesktopApp?: boolean;
  customLoaderImage?: string;
}

export interface HomePageLayoutConfig {
  layoutMode: "";
  widgets: [];
}

export interface PrimeInjection {
  tileColors: string[];
  homePageBackground: string;
}

export interface WidgetConfig {
  displayType?: string;
  pageSetting: Widget;
  customizationUrl?: string;
  // _contentsHostName: string;
  // _contentsParentPath: string;
  ignoreHigherOrderLOEnrollment?: boolean;
  emitPageLinkEvents?: string | boolean;
  emitPlayerLaunchEvent?: boolean;
  sessionUid?: string;
  isMobile?: boolean;
  fixedWidth?: boolean;
  disableLinks?: boolean;
  emitL1FeedbackLaunchEvent?: boolean;
  locale?: string;
  disableLeaderBoardWidgetLink?: boolean;
  disableSocialWidgetLink?: boolean;
  hideSkillInterestViewUpdate?: boolean;
  isLoadedInsideApp?: boolean;
  notAllowedExtensionTypes?: string[];
  enableAnnouncementRecoUGWLink: boolean;
}

export interface ALM {
  getALMConfig: Function;
  navigateToTrainingOverviewPage: Function;
  navigateToInstancePage: Function;
  navigateToBoardDetailsPage: Function;
  navigateToBoardsPage: Function;
  navigateToBadgesPage: Function;
  navigateToAuthorPage: Function;
  navigateToCatalogPage: Function;
  navigateFromComplianceWidget: Function;
  navigateToHomePage: Function;
  navigateToSocial: Function;
  navigateToMyLearningPage: Function;
  navigateToLeaderboardPage: Function;
  navigateToSkillsPage: Function;
  navigateToContentMarketplace: Function;
  handleLpLeaderBoardSeeAllModal: Function;
  handleInstanceNavigationAfterEnroll: Function;
  getTrainingUrl: Function;
  isPrimeUserLoggedIn: Function;
  getALMUser: Function;
  getAccessToken: Function;
  getCsrfToken: Function;
  getNativeExtensionToken: Function;
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
  isExtensionAllowed: Function;
  getWidgetConfig: Function;
  playerLaunchTimeStamp?: number;
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

export function getCsrfToken(): string {
  return getALMObject().getCsrfToken();
}

export function getNativeExtensionToken(): string {
  return getALMObject().getNativeExtensionToken();
}

export const getTokenForNativeExtensions = () => {
  if (getALMConfig().accessToken) {
    return getALMObject().getAccessToken();
  }
  return getALMObject().getNativeExtensionToken();
};

export const getAuthKey = () => {
  if (getALMConfig().csrfToken) {
    return `csrf_token=${getCsrfToken()}`;
  }
  return `access_token=${getAccessToken()}`;
};

export function getCommerceToken(): string {
  return getALMObject().getCommerceToken();
}
export function getWidgetConfig(): WidgetConfig {
  return getALMConfig().widgetConfig || ({} as WidgetConfig);
}

export function setHomePageLayoutConfig(config: any) {
  getALMConfig().homePageLayoutConfig = config;
}

export const getPathParams = (pagePath: string, pathParams: string[] = []) => {
  let paramsMap: {
    [key: string]: string;
  } = {};

  const currentUrl = getWindowObject().location;
  const pathname =
    currentUrl.pathname.indexOf(pagePath) > -1 ? currentUrl.pathname : currentUrl.hash;
  let params: string[] = pathname.split(pagePath)[1].split("/");
  for (let i = 0; i < pathParams.length; i++) {
    const pathParam = pathParams[i];
    const paramIdx = params.findIndex(element => element === pathParam);
    if (paramIdx !== -1) {
      const paramValueIdx = paramIdx + 1;
      paramsMap[pathParam] = params[paramValueIdx];
    }
  }
  return paramsMap;
};

export function getQueryParamsFromUrl() {
  const location = getWindowObject().location;
  const params: URLSearchParams = new URLSearchParams(decodeURI(location.search));
  return Object.fromEntries(params.entries());
}

export const getALMUser = async (displayType?: string) => {
  const response = await getALMObject().getALMUser(displayType);
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
  return await getALMObject().updateAccountActiveFieldsDetails(accountActiveFields, userId);
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
    (containsSubstr(window.location.pathname, ".html") ? window.location.pathname : "") +
    (existingQueryParams.toString().length !== 0
      ? "?" + encodeURI(existingQueryParams.toString()) + window.location.hash
      : "");
  window.history.replaceState({ path: newurl }, "", newurl);
  window.parent.postMessage(
    {
      data: convertToLearnerDesktopParams(),
      origin: window.origin,
      href: newurl,
      type: ALM_LEARNER_UPDATE_URL,
    },
    "*"
  );
}

export const getALMAccount = async (displayType?: string) => {
  if (getALMObject().isPrimeUserLoggedIn()) {
    const response = await getALMUser(displayType);
    return response?.user?.account || ({} as PrimeAccount);
  }

  const accountDataStr = getALMConfig().accountData;
  const accountData = accountDataStr ? JSON.parse(accountDataStr) : null;
  const account = (accountData?.data?.attributes || {}) as PrimeAccount;
  return account;
};

const getALMAccountInternal = async (displayType?: string) => {
  let url = `${getALMConfig().primeApiURL}/account`;
  if (displayType) {
    url += `?displayType=${displayType}`;
  }
  let data: any = await RestAdapter.ajax({
    url,
    method: "GET",
  });
  data = JsonApiParse(data);
  return data.account as PrimeAccount;
};

export const getComputedDisplayType = async (): Promise<string> => {
  let displayType = "DESKTOP_HOME_PG";

  const widgetConfig = getWidgetConfig();
  //checking for widgets
  if (widgetConfig) {
    //if we get displayType from widgetConfig
    if (widgetConfig.displayType) {
      displayType = widgetConfig.displayType;
    } else {
      const account = await getALMAccountInternal(displayType);
      if (account?.prlCriteria?.enabled) {
        displayType = "DESKTOP_HOME_PRL_PG";
      } else if (account?.recommendationAccountType === CPENEW) {
        displayType = "DESKTOP_HOME_CPENEW_PG";
      }
    }
    widgetConfig.displayType = displayType;
  }

  return displayType;
};

export const init = async () => {
  let account: PrimeAccount | undefined;
  const displayType = await getComputedDisplayType();
  if (!getALMObject().isPrimeUserLoggedIn()) {
    account = await getALMAccount(displayType);
    const accountTerminologies = account?.accountTerminologies;
    SetupAccountTerminologies(accountTerminologies);
  } else {
    const response = await getALMUser(displayType);
    account = response?.user?.account;
    SetupAccountTerminologies(account?.accountTerminologies);
  }
  const themeData = account?.themeData;
  if (account && themeData) {
    const configObj = getALMConfig();
    const themeOverrides = await ApplyInjectables(
      configObj.widgetConfig?.customizationUrl,
      configObj.theme as IThemeData
    );
    InitThemeData(account.themeData, themeOverrides);
  }
};
// Wrapper app does not need init, Solution needs to rechecked
!getWindowObject().initNotNeeded && init();

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
  if (domain.indexOf("localhost") !== -1) {
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

export function getPageAttributes(container: string, pageAttributeName: string) {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints[container];
    let attributes = getConfigurableAttributes(cssSelector) || {};
    setALMAttribute(pageAttributeName, attributes);
    return attributes;
  }
}

export function isScreenBelowDesktop() {
  return window.innerWidth <= 992;
}

//isExtensionAllowed client Apps loading AEM app, needs to provide the extension allowed in method in config
export function isExtensionAllowed(extension: PrimeExtension) {
  return (
    extension &&
    typeof getALMObject().isExtensionAllowed === "function" &&
    getALMObject().isExtensionAllowed(extension)
  );
}

export function getModalBackgroundColor(theme: string) {
  switch (theme) {
    case CARNIVAL_THEME:
    case WINTER_SKY_THEME:
      return "#F5F5F5";
    case VIVID_THEME:
      return "#232323";
  }
  return "#292929";
}

export const darkThemes = [DEFAULT_THEME, PEBBLES_THEME, AUTUMN_THEME, VIVID_THEME];

export function getModalTheme(theme: string) {
  return darkThemes.indexOf(theme) > -1 ? darkTheme : lightTheme;
}

export const isDarkThemeApplied = () => {
  const themeName = getALMConfig().themeData?.name;
  return darkThemes.indexOf(themeName) > -1;
};

export function getModalColorScheme(theme: string) {
  const darkColorSchemes = [DEFAULT_THEME, VIVID_THEME];
  return darkColorSchemes.indexOf(theme) > -1 ? "dark" : "light";
}

export function addHttpsToHref(htmlString: string): string {
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']/gi;

  const modifiedHTML = htmlString.replace(anchorRegex, (match, url) => {
    if (!/^https?:\/\//i.test(url)) {
      return match.replace(url, `https://${url}`);
    } else {
      return match;
    }
  });

  return modifiedHTML;
}

export const launchContentUrlInNewWindow = async (
  training: PrimeLearningObject,
  module: PrimeLearningObjectResource
) => {
  const res: any = await RestAdapter.ajax({
    url:
      getALMConfig().almBaseURL +
      `/primeapi/v2/externalSessionUrl?loId=${training.id}&loResourceId=${module.id}&resourceId=${module.resources?.[0]?.id}`,
    method: "GET",
  });
  const linkedInUrl = res && JSON.parse(res).location;
  if (linkedInUrl) {
    window.open(linkedInUrl, "_blank");
  }
};

export const checkIfLinkedInLearningCourse = (training: PrimeLearningObject) => {
  return training?.authorNames?.some(
    (author: string) => author.toLowerCase() === "linkedin learning"
  );
};

//Consumed Externally by Learner Web App
export function sendEvent(type: string, body = "") {
  if (window.parent[0]) {
    window.parent[0].postMessage(
      {
        type: type,
        body: body,
      },
      "*"
    );
  }
}

export function GetPrimeEmitEventLinks(): string {
  return <string>getWidgetConfig()?.emitPageLinkEvents;
}
export function ShouldEmitEventLinks(): boolean {
  return getWidgetConfig()?.emitPageLinkEvents !== false;
}
export function IsFlexibleWidth(): boolean {
  return getWidgetConfig()?.fixedWidth || false;
}

export function isEmptyJson(json: any) {
  return json && JSON.stringify(json) === "{}";
}

export const setTrainingsLayout = (view: string, setView: (view: string) => void) => {
  setView(view);
  getALMObject().storage.setItem(TILE_VIEW, view);
};

export function getTrimmedText(text: string, lengthToShow: number) {
  if (text !== undefined && text.length > lengthToShow) {
    return text.substring(0, lengthToShow) + "...";
  }
  return text;
}

export function navigateToLo(training: PrimeLearningObject) {
  const loViewRefLink = getLoViewRefLink(training);
  SendLinkEvent(loViewRefLink);
}

function isPresent(value: any) {
  return value > -1;
}

export function containsElement(arr: string[], element: string) {
  return isPresent(arr.indexOf(element));
}

export function containsSubstr(str: string, subStr: string) {
  return isPresent(str.indexOf(subStr));
}

export const needsLearnerDesktopUrlChange = (hash: string) => {
  const staticRoutes = [AUTHOR_ID_STR];
  for (let i = 0; i < staticRoutes.length; i++) {
    if (containsSubstr(hash, `#/${staticRoutes[i]}`)) {
      return false;
    }
  }
  return true;
};

export function setCartData(data: any) {
  const cartData = data.body;
  if (cartData) {
    setItemToStorage(CART_DATA, cartData);
  }
}

export function getSkuId(trainingId: string) {
  return trainingId.replace("_", ":");
}

export function isNotEmptyStr(val: string) {
  return val !== "";
}

export function isEnrolled(training: PrimeLearningObject, loType: string) {
  return training.loType === loType && training.enrollment;
}

export const isStringAnArray = (str: string) => {
  try {
    var obj = JSON.parse(str);
    return Array.isArray(obj);
  } catch (e) {
    return false;
  }
};

export const isEmptyArrString = (val: string) => {
  return val === "[]";
};
