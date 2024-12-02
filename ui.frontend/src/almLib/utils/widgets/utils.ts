import { GetPrimeObj } from "./windowWrapper";
import {
  EmptyPromise,
  Attributes,
  Widget,
  WidgetType,
  WIDGET_REF_TO_TYPE,
  AOI_VIEW_TYPE_INDIVIDUAL,
  AOI_STRIP,
  ExternalConfig,
  IThemeData,
  CARD_WIDTH,
  DEFAULT_MAX_CARDS,
} from "./common";
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../models/PrimeModels";

import {
  GetAllCatalogGroupFilterLink,
  GetCatalogPageLink,
  GetMyLearningPageLink,
  GetSkillsPageLink,
  SendLinkEvent,
} from "./base/EventHandlingBase";
import { IsFlexibleWidth, getWidgetConfig, getWindowObject } from "../global";
import { RestAdapter } from "../restAdapter";
import { GetTranslation, GetTranslationReplaced } from "../translationService";
import { getALMObject, getALMUser } from "../global";
import { CPENEW, MODE, VIEW } from "../constants";
export const COURSE = "course";
export const LEARNING_PROGRAM = "learningProgram";
export const CERTIFICATION = "certification";
export const SELF_ENROLL = "Self Enroll";
const MYINTEREST_RECO_WIDGET_REF = "com.adobe.captivateprime.lostrip.myinterest";
export const MAX_AOI_STRIP_COUNT = 5;
export const BASE_AOI_STRIP_COUNT = 2;

export const WIDGET_REF_MAP = {
  "com.adobe.captivateprime.calendar": "com.adobe.captivateprime.calendar",
  "com.adobe.captivateprime.compliance": "com.adobe.captivateprime.compliance",
  "com.adobe.captivateprime.leaderboard": "com.adobe.captivateprime.leaderboard",
  "com.adobe.captivateprime.social": "com.adobe.captivateprime.social",
};

export const WIDGET_REF_MAP_NAME = {
  CALENDAR: "com.adobe.captivateprime.calendar",
  COMPLAINCE: "com.adobe.captivateprime.compliance",
  LEADERBOARD: "com.adobe.captivateprime.leaderboard",
  SOCIAL: "com.adobe.captivateprime.social",
  MYLEARNING: "com.adobe.captivateprime.lostrip.mylearning",
  BROWSE_CATALOG: "com.adobe.captivateprime.lostrip.browsecatalog",
};

export function interpolateTemplateAndMap(
  template: string,
  params: Record<string, string | number | boolean>
): any {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${template}\`;`)(...vals);
}
export {};
export function interpolateTemplate(
  template: string,
  keys: string[] | IterableIterator<string> | Set<string>,
  values: string[] | IterableIterator<string> | Set<string>
): any {
  return new Function(...keys, `return \`${template}\`;`)(...values);
}

const TEMPLATE_PATTERN = /\$\{(.*?)\}/g;
export function getTemplateVariables(templateString: string): string[] {
  return [...(<any>templateString).matchAll(TEMPLATE_PATTERN)].map(el => {
    return el[1];
  });
}

export function AreSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  return a.size === b.size && [...a].every(value => b.has(value));
}

export function ensureSlashAtEnd(str: string): string {
  if (str.substr(-1) != "/") {
    str = str + "/";
  }
  return str;
}

export function randomIdGenerator(): string {
  return (Date.now() + Math.random()).toString(36).replace(".", "");
}

/* bit is from 0 -- so isBitSet(2,1) ==> true */
export function isBitSet(num: number, bit: number): boolean {
  return (num >> bit) % 2 != 0;
}
export function forceNumberIfDefined(num: number | string | undefined): number | undefined {
  if (num !== undefined) {
    const retval = parseInt(<string>num, 10); //this will convert string or number or even decimal to int
    if (!isNaN(retval)) {
      return retval;
    }
  }
  return undefined;
}
export function fixWidgetAttributes(attr?: Attributes): void {
  if (attr) {
    const widgetConfig = getWidgetConfig();
    if (attr.disableLinks === undefined) {
      attr.disableLinks = widgetConfig?.disableLinks;
    }
    if (attr.disableSocialWidgetLink === undefined) {
      attr.disableSocialWidgetLink = widgetConfig?.disableSocialWidgetLink;
    }
    if (attr.disableLeaderBoardWidgetLink === undefined) {
      attr.disableLeaderBoardWidgetLink = widgetConfig?.disableLeaderBoardWidgetLink;
    }
    if (attr.enableAnnouncementRecoUGWLink === undefined) {
      attr.enableAnnouncementRecoUGWLink = widgetConfig?.enableAnnouncementRecoUGWLink;
    }
  }
}
export function addHtmlStrAttributeIfNotEmpty(
  attribute: string,
  valToCheck: string | boolean | number,
  addAttributeAlone?: boolean
): string {
  return valToCheck ? attribute + "='" + valToCheck + "'" : addAttributeAlone ? attribute : "";
}

export function getEpochMillis(): number {
  return Date.now();
}
const MILLIS_IN_HOUR = 60 * 60 * 1000; // milliseconds in an hour
export function getRoundedHourMillis(): number {
  return Math.ceil(Date.now() / MILLIS_IN_HOUR) * MILLIS_IN_HOUR;
}

export function ShuffleArray<T>(arr: T[], seed: number): T[] {
  let currentIndex = arr.length,
    temporaryValue,
    randomIndex;
  seed = seed || 1;
  const random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
  return arr;
}

export function SpliceArrayIntoChunks<T>(arr: T[], chunk: number): T[][] {
  const retval: T[][] = [];
  for (let ii = 0, jj = arr.length; ii < jj; ii += chunk) {
    const temparray = arr.slice(ii, ii + chunk);
    if (temparray.length > 0) {
      retval.push(temparray);
    }
  }
  return retval;
}

export function JoinArrayChunks<T>(arr: T[][]): T[] {
  const retval: T[] = [];
  for (let ii = 0; ii < arr.length; ++ii) {
    retval.push(...arr[ii]);
  }
  return retval;
}

export function GetFormattedDate(dateStr: string, getUserLocale: string) {
  const date = new Date(dateStr);
  const dateTimeFormat = new Intl.DateTimeFormat(getUserLocale, { month: "short", day: "2-digit" });
  let month, day;
  dateTimeFormat.formatToParts(date).forEach(elem => {
    if (elem.type === "month") {
      month = elem.value;
    } else if (elem.type === "day") {
      day = elem.value;
    }
  });
  //chinese needs space in between the characters
  if (getUserLocale == "zh-CN") {
    return `${month} 月 ${day} 日`;
  } else if (getUserLocale == "ja-JP") {
    return `${month}月${day}日`;
  }
  return `${day} ${month}`;
}

export function GetFormattedDateForCompliance(dateStr: string, getUserLocale: string) {
  const date = new Date(dateStr);
  const dateTimeFormat = new Intl.DateTimeFormat(getUserLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let month, day, year;
  dateTimeFormat.formatToParts(date).forEach(elem => {
    if (elem.type === "month") {
      month = elem.value;
    } else if (elem.type === "day") {
      day = elem.value;
    } else if (elem.type === "year") {
      year = elem.value;
    }
  });

  //chinese needs space in between the characters
  if (getUserLocale == "zh-CN") {
    return `${month} 月 ${day} 日 ${year}`;
  } else if (getUserLocale == "ja-JP") {
    return `${month}月${day}日 ${year}`;
  }
  return `${day} ${month} ${year}`;
}

export function GetFormattedSessionTimeForCalendar(
  sDate: string,
  eDate: string,
  getUserLocale: string
) {
  const locale = getUserLocale;

  if (locale === "zh-CN") {
    const startDate = new Date(sDate);
    const startDateTimeFormat = startDate.toLocaleTimeString(locale ? locale : [], {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const endDate = new Date(eDate);
    const endDateTimeFormat = endDate.toLocaleTimeString(locale ? locale : [], {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    return `${startDateTimeFormat} - ${endDateTimeFormat}`;
  }

  const startDate = new Date(sDate);
  const startDateTimeFormat = startDate.toLocaleTimeString(locale ? locale : [], {
    hour: "numeric",
    minute: "numeric",
  });

  const endDate = new Date(eDate);
  const endDateTimeFormat = endDate.toLocaleTimeString(locale ? locale : [], {
    hour: "numeric",
    minute: "numeric",
  });

  if (locale === "ja-JP" || locale === "ko-KR") {
    return `${startDateTimeFormat} ~ ${endDateTimeFormat}`;
  } else if (locale === "de-DE") {
    return `${startDateTimeFormat}-${endDateTimeFormat} Uhr`;
  } else if (locale === "fr-FR") {
    return (startDateTimeFormat + " - " + endDateTimeFormat).replace(/\b(?::00|:)\b/gi, "h");
  } else if (locale === "nl-NL") {
    return (startDateTimeFormat + " - " + endDateTimeFormat).replace(/\b(?::)\b/gi, ".");
  } else if (locale === "pt-BR") {
    let time = (startDateTimeFormat + " às " + endDateTimeFormat).replace(/\b(?::00|:)\b/gi, "h");
    time = startDate.getHours() >= 12 ? "Das " + time : "Da " + time;
    return time;
  } else if (locale === "nb-NO") {
    return `${startDateTimeFormat} til ${endDateTimeFormat}`;
  }
  return `${startDateTimeFormat} - ${endDateTimeFormat}`;
}

function getPerfNow() {
  return window.performance.now();
}
export function ShallowClone<T>(arr: Array<T>): Array<T> {
  return arr.slice(0);
}
export function TransformToUpperCase(str: string, getUserLocale: string): string {
  return str.toLocaleUpperCase(getUserLocale ? getUserLocale : "");
}

export async function SleepPromise(sleepMs: number): Promise<unknown> {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(undefined);
    }, sleepMs);
  });
}

export function sliceArrayIntoChunks(arr: any[], chunkSize: number): any[][] {
  const retval: any[][] = [];
  for (let ii = 0; ii < arr.length; ii += chunkSize) {
    const arrChunk = arr.slice(ii, ii + chunkSize);
    if (arrChunk.length > 0) {
      retval.push(arrChunk);
    }
  }
  return retval;
}

export function GetJsonParsedIfNeeded<T>(jsonOrjsonStr: T | string): T {
  if (typeof jsonOrjsonStr === "string") {
    return JSON.parse(jsonOrjsonStr);
  }
  return jsonOrjsonStr;
}

export function AddToArrIfDefined<T>(arr: T[], el: any, transformFunc?: (anyEl: any) => T) {
  if (el !== undefined) {
    if (transformFunc) {
      arr.push(transformFunc(el));
    } else {
      arr.push(el);
    }
  }
}

export function IsAnyUrl(url: string | undefined): boolean {
  return url ? url.includes("://") : false;
}

export function GetWinLocation(wnd: Window): string | null {
  try {
    return wnd.location.href;
  } catch (ex) {
    console.log(ex);
  }
  return null;
}

export function GetQueryParam(urlStr: string | null, queryParam: string): string | null {
  try {
    if (urlStr) {
      const url: URL = new URL(urlStr);
      return url.searchParams.get(queryParam);
    }
  } catch (ex) {
    console.log(ex);
  }
  return null;
}

export function URLDecodeString(encodedStr: string | null): string | null {
  if (encodedStr) {
    return decodeURIComponent(encodedStr);
  }
  return null;
}

/////Empty Promise///////////////
export function GetEmptyPromise(): EmptyPromise<unknown> {
  let resolveFunc: (val?: unknown) => void;
  let rejectFunc: (val?: unknown) => void;
  const retval: EmptyPromise<unknown> = <any>new Promise((resolve, reject) => {
    resolveFunc = resolve;
    rejectFunc = reject;
  });
  retval.resolve = (val?: any) => {
    resolveFunc(val);
    return retval;
  };
  retval.reject = (val?: any) => {
    rejectFunc(val);
    return retval;
  };
  return retval;
}
/////Empty Promise///////////////

/////////////DOM Utils////////////////////
export interface IPulseEventsImplementer {
  onPulseEvent(pulseEvent: PulseEventEnum): void;
}

//can be made better
export const enum PulseEventEnum {
  ON_START = 1,
  ON_TIMER = 2,
  ON_END = 4,
  ON_LONG_TIMER = 8,
}

export function LoadScript(
  parentEl: HTMLElement,
  scriptSrc: string,
  async: boolean
): EmptyPromise<unknown> {
  const scriptToInclude = document.createElement("script");
  scriptToInclude.src = scriptSrc;
  const loadedPromise = GetEmptyPromise();
  scriptToInclude.onload = function () {
    loadedPromise.resolve();
  };
  scriptToInclude.onerror = function () {
    loadedPromise.reject();
  };
  scriptToInclude.async = async;
  parentEl.append(scriptToInclude);
  return loadedPromise;
}
/////////////DOM Utils////////////////////

////Storage Utils///
const ENABLE_BASIC_OFFLINE = false;
const CACHE_PURGE_TIME_MS = 15 * 60 * 1000;
const PRIME_STORAGE_KEY = "_prime";
const PRIME_STORAGE_DATA_KEY = "_prime_data";
function getDataFromStorageObj(
  sessionUid: string,
  createIfNotExist: boolean
): Record<string, any> | null {
  try {
    const storageKey = localStorage.getItem(PRIME_STORAGE_KEY);
    let storageKeyObj = undefined;
    if (storageKey) {
      storageKeyObj = JSON.parse(storageKey);
    }
    const currentEpoch = getEpochMillis();
    if (
      storageKeyObj &&
      sessionUid === storageKeyObj["uid"] &&
      currentEpoch - storageKeyObj["tstamp"] < CACHE_PURGE_TIME_MS
    ) {
      const storageData = localStorage.getItem(PRIME_STORAGE_DATA_KEY);
      if (storageData) {
        return JSON.parse(storageData);
      }
    }

    {
      if (createIfNotExist) {
        const storageKeyObj: Record<string, string | number> = {};
        storageKeyObj["uid"] = sessionUid;
        storageKeyObj["tstamp"] = getEpochMillis();
        localStorage.setItem(PRIME_STORAGE_KEY, JSON.stringify(storageKeyObj));
        return {};
      } else {
        console.log("deleting cache", sessionUid, storageKeyObj, currentEpoch);
        localStorage.removeItem(PRIME_STORAGE_KEY);
        localStorage.removeItem(PRIME_STORAGE_DATA_KEY);
      }
    }
    console.log("cache not found");
  } catch (ex) {
    console.log("cache threw not found", ex);
  }
  return null;
}
export function getCachedData(sessionUid: string | undefined, key: string): string | null {
  if (ENABLE_BASIC_OFFLINE && sessionUid != undefined) {
    const storageDataObj = getDataFromStorageObj(sessionUid, false);
    if (storageDataObj) {
      return storageDataObj[key];
    }
  }
  return null;
}
export function setCachedData(sessionUid: string | undefined, key: string, val: any): void {
  try {
    if (ENABLE_BASIC_OFFLINE && sessionUid != undefined) {
      let storageDataObj = getDataFromStorageObj(sessionUid, true);
      storageDataObj = storageDataObj || {};
      storageDataObj[key] = val;
      localStorage.setItem(PRIME_STORAGE_DATA_KEY, JSON.stringify(storageDataObj));
    }
  } catch (ex) {
    console.log("storeCache------ failed");
  }
}
////Storage Utils///

function isMobile() {
  let isMobile = false;
  try {
    isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
  } catch (ex) {
    console.log(ex);
  }
  return isMobile;
}
export function CalculateIfTablet(): boolean {
  let isTab = false;
  try {
    isTab = window.matchMedia("only screen and (min-width: 768px) and (max-width: 1024px)").matches;
  } catch (ex) {
    console.log(ex);
  }
  return isTab;
}
export function CalcualteIfMobile(): void {
  GetPrimeObj().commonConfig.isMobile = isMobile();
}

export function GetTrimmedValues(elements: string) {
  const trimmedValues: string[] = [];
  elements.split(",").forEach(element => {
    trimmedValues.push(element.trim());
  });
  return trimmedValues.toString();
}

export async function setNativeExtensionToken(configObj: any) {
  if (configObj?.auth?.csrfToken && configObj?.auth?.nativeExtensionToken) {
    getWindowObject().nativeExtensionToken = configObj.auth.nativeExtensionToken;
  }
}

export function isExtensionAllowed(
  lo: PrimeLearningObject,
  loInstance: PrimeLearningObjectInstance
): boolean {
  if (
    (lo.loType === COURSE && lo.enrollmentType !== SELF_ENROLL) ||
    (lo.loType === CERTIFICATION && loInstance?.validity) ||
    (lo.loType === LEARNING_PROGRAM && lo.enrollmentType !== SELF_ENROLL)
  ) {
    return false;
  }

  return true;
}

export function getMaxCards(widgetRef: string): number {
  if (
    widgetRef === WIDGET_REF_MAP["com.adobe.captivateprime.calendar"] ||
    widgetRef === WIDGET_REF_MAP["com.adobe.captivateprime.compliance"]
  ) {
    if (GetPrimeObj().commonConfig.isMobile && IsFlexibleWidth()) return 1;
    return 2;
  }

  if (
    widgetRef === WIDGET_REF_MAP["com.adobe.captivateprime.leaderboard"] ||
    widgetRef === WIDGET_REF_MAP["com.adobe.captivateprime.social"]
  ) {
    return 1;
  }

  return -1;
}

export function getMinCards(widgetRef: string): number {
  return 1;
}

export interface IPrimeStripHeading {
  name: string;
  link?: string;
  needPaddedHeading?: boolean;
  automationid: string;
  headingClass?: string;
  seeAllLink?: string;
  headerAriaLabel?: string;
  showAOIExploreLinks?: boolean;
}
export function getHeading(
  widget: Widget,
  account: PrimeAccount,
  query?: string,
  extraDetails?: any
): IPrimeStripHeading {
  const orgName = account.name || "";
  let name = "";
  let link: string | undefined;
  let seeAllLink: string | undefined;
  let needPaddedHeading = false;
  let automationid = "";
  let headingClass: string | undefined = "";
  let headerAriaLabel: string | undefined = "";
  let showAOIExploreLinks: boolean = false;
  switch (widget.widgetRef) {
    case WidgetType.ADMIN_RECO:
      name = GetTranslationReplaced("adminReco", orgName);
      automationid = "primelxp-adminreco";
      link = GetAllCatalogGroupFilterLink();
      if (widget.attributes!.enableAnnouncementRecoUGWLink && account?.filterPanelSetting!.groups) {
        seeAllLink = GetAllCatalogGroupFilterLink();
      }
      break;
    case WidgetType.MYLEARNING:
      name = GetTranslation("myLearning", true);
      link = `${GetMyLearningPageLink()}?myLearning=true&selectedSortOption=dueDate`;
      automationid = "primelxp-mylearning";
      break;
    case WidgetType.BOOKMARKS:
      name = GetTranslation("myBookmarks", true);
      link = `${GetMyLearningPageLink()}?myLearning=true&selectedSortOption=dueDate`;
      automationid = "primelxp-myBookmarks";
      break;
    // case WidgetType.SEARCH:
    //   name = query
    //     ? this.numberOfResults
    //       ? GetTranslationsReplaced('numSearchResultMessage', {
    //         num: this.numberOfResults,
    //         query: query,
    //       })
    //       : GetTranslation('noSearchResultsMessage')
    //     : GetTranslation('text.catalog', true);
    //   automationid = 'primelxp-search';
    //   break;
    case WidgetType.TRENDING_RECO:
      name = GetTranslation("trending");
      link = `${GetCatalogPageLink()}?selectedSortOption=-date`;
      automationid = "primelxp-trending";
      break;
    case WidgetType.DISCOVERY_RECO:
      name = GetTranslation("text.trending.in.your.network");
      link = `${GetCatalogPageLink()}?selectedSortOption=-date`;
      automationid = `primelxp-discovery-strip-${name}`;
      break;
    case WidgetType.AOI_RECO:
      name = GetTranslation("yourInterest");
      const stripNum = widget.attributes?.stripNum;
      if (
        widget.attributes?.view == AOI_VIEW_TYPE_INDIVIDUAL &&
        extraDetails &&
        extraDetails.skillName
      ) {
        name += " - " + extraDetails.skillName;
      }
      link = `${GetSkillsPageLink()}?${MODE}=${VIEW}`;
      needPaddedHeading = true;
      const forceHideExploreSkills = widget.attributes!.hideExploreSkills === true;
      showAOIExploreLinks = account.exploreSkills && !forceHideExploreSkills;
      if (widget.attributes!.disableLinks) {
        showAOIExploreLinks = false;
      }
      automationid = stripNum ? AOI_STRIP + "-" + stripNum : AOI_STRIP;
      break;
    case WidgetType.CATALOG:
      name = widget.attributes!.heading || "";
      const sortToUse = widget.attributes?.sort || "name";
      if (sortToUse == "progress") {
        link = `${GetCatalogPageLink()}`;
      } else {
        link = `${GetCatalogPageLink()}?selectedSortOption=${sortToUse}`;
      }
      automationid = "primelxp-catalog";
      break;
    case WidgetType.RECOMMENDATIONS_STRIP:
      name = widget.attributes!.heading || "";
      headerAriaLabel = widget.attributes?.headerAriaLabel || "";
      link = widget.attributes!.link;
      if (account.recommendationAccountType === CPENEW && !account.prlCriteria?.enabled) {
        seeAllLink = "";
        widget.attributes?.recommendationConfig.stripType === "SUPER_RELEVANT_STRIP" &&
        !getWidgetConfig()?.isMobile &&
        account?.exploreSkills
          ? (showAOIExploreLinks = true)
          : (showAOIExploreLinks = false);
      } else {
        seeAllLink = link;
        // this.showAOIExploreLinks = false;
      }

      needPaddedHeading = true;
      headingClass = widget.attributes?.headingClass;
      automationid = `primelxp-recommendation-strip-${name}`;
      break;
    case WidgetType.CATALOG_BROWSER:
      name = GetTranslation("catalog.browser.name", true);
      link = GetCatalogPageLink();
      automationid = "primelxp-browsecatalog";
      break;
  }
  // this.widgetName = name;
  return {
    name,
    link,
    seeAllLink,
    needPaddedHeading,
    headingClass,
    automationid,
    headerAriaLabel,
    showAOIExploreLinks,
  };
}

const MIN_LEFT_RIGHT_BOX_PADDING = 5;
const topRowPadding = 30;

export const LEFT_RIGHT_PADDING = 5;
export const DEFAULT_WIDGET_PROP = "widget";
export function getCurrentWindowWidth() {
  let innerWidth = getWindowObject().innerWidth;
  let availableWidth = innerWidth - 2 * MIN_LEFT_RIGHT_BOX_PADDING;
  if (availableWidth < CARD_WIDTH + 2 * MIN_LEFT_RIGHT_BOX_PADDING) {
    const cardsToShowWhenSizeIsTooSmall = DEFAULT_MAX_CARDS;
    availableWidth = cardsToShowWhenSizeIsTooSmall * CARD_WIDTH;
    innerWidth = availableWidth + 2 * MIN_LEFT_RIGHT_BOX_PADDING;
  }
  let maxCardsPossiblePerRow = Math.floor(availableWidth / CARD_WIDTH);

  if (maxCardsPossiblePerRow > DEFAULT_MAX_CARDS) {
    maxCardsPossiblePerRow = DEFAULT_MAX_CARDS;
  }

  let parentContainerWidth = "";
  let isMobile = false;

  if (availableWidth < 600) {
    parentContainerWidth = "100%";
    isMobile = true;
  } else if (availableWidth < 950) {
    parentContainerWidth = `${CARD_WIDTH * 2}px`;
  } else if (availableWidth < 1250) {
    parentContainerWidth = `${CARD_WIDTH * 3}px`;
  } else if (availableWidth < 1550) {
    parentContainerWidth = `${CARD_WIDTH * 4}px`;
  } else if (availableWidth > 1550) {
    parentContainerWidth = `${CARD_WIDTH * 5}px`;
  }

  return {
    parentContainerWidth,
    isMobile,
    maxCardsPossiblePerRow,
    innerWidth,
    availableWidth,
  };
}

export function generateWidgetsForLayout(layoutConfigObj: any, layoutConfig: any) {
  let { parentContainerWidth, maxCardsPossiblePerRow, isMobile } = getCurrentWindowWidth();
  const widgetConfig = getWidgetConfig();
  const isMobileView = isMobile || widgetConfig.isMobile;
  layoutConfigObj.widgets.forEach((widgets: any) => {
    let widgetRow: any = { parentContainerWidth, maxCardsPossiblePerRow, id: randomIdGenerator() };
    widgets.forEach((widget: Widget, index: number) => {
      widget.layoutAttributes = widget.layoutAttributes || {};
      widget.attributes = widget.attributes || {};
      widget.layoutAttributes.parentContainerWidth = parentContainerWidth;
      widget.attributes.disableLinks = widgetConfig.disableLinks || false;
      widget.type = WIDGET_REF_TO_TYPE[widget.widgetRef as keyof typeof WIDGET_REF_TO_TYPE];
      isMobileView
        ? setWidgetAttributesForMobileView(widget)
        : setWidgetAttributes(widget, widgets, maxCardsPossiblePerRow, index);
    });
    widgetRow.widgets = widgets;
    layoutConfig.widgets.push(widgetRow);
  });
  layoutConfig.layoutMode = layoutConfigObj.layoutMode;
}
export function configureWidgetsForLayout(layoutConfig: any, account: PrimeAccount | null) {
  type AccountKeys = keyof PrimeAccount;
  const widgetRefToAccountPropMap: Record<string, AccountKeys> = {
    [WIDGET_REF_MAP_NAME.LEADERBOARD]: "gamificationEnabled",
    [WIDGET_REF_MAP_NAME.SOCIAL]: "enableSocialLearning",
    [WIDGET_REF_MAP_NAME.BROWSE_CATALOG]: "catalogsVisible",
  };

  return layoutConfig.map((widgets: any[]) => {
    return widgets.filter((widget: any) => {
      const accountFeatureFlag = widgetRefToAccountPropMap[widget.widgetRef];
      return accountFeatureFlag ? account?.[accountFeatureFlag] : true;
    });
  });
}
export function updateWidgetsForLayout(layoutConfig: any) {
  let { parentContainerWidth, isMobile, maxCardsPossiblePerRow } = getCurrentWindowWidth();
  const widgetConfig = getWidgetConfig();
  const isMobileView = isMobile || widgetConfig.isMobile;
  layoutConfig.widgets.forEach((config: any) => {
    config.parentContainerWidth = parentContainerWidth;
    config.maxCardsPossiblePerRow = maxCardsPossiblePerRow;
    config.widgets.forEach((widget: any, index: number) => {
      widget.layoutAttributes.parentContainerWidth = parentContainerWidth;
      isMobileView
        ? setWidgetAttributesForMobileView(widget)
        : setWidgetAttributes(widget, config.widgets, maxCardsPossiblePerRow, index);
    });
  });
}
export function setWidgetAttributesForMobileView(widget: Widget): void {
  widget.layoutAttributes = widget.layoutAttributes || {};
  widget.layoutAttributes.cardsToShow = 1;
  widget.layoutAttributes.width = "100%";
  widget.layoutAttributes.isFullRow = true;
  widget.layoutAttributes.widthInNumber = CARD_WIDTH;
  //Other widgets will hundred percent width
  if (
    [
      WIDGET_REF_MAP_NAME.CALENDAR,
      WIDGET_REF_MAP_NAME.COMPLAINCE,
      WIDGET_REF_MAP_NAME.LEADERBOARD,
      WIDGET_REF_MAP_NAME.SOCIAL,
    ].includes(widget.widgetRef)
  ) {
    widget.layoutAttributes.width = `${CARD_WIDTH}px`;
    widget.layoutAttributes.widthInNumber = CARD_WIDTH;
    widget.layoutAttributes.isFullRow = false;
  }
}
export function setWidgetAttributes(
  widget: Widget,
  widgets: Widget[],
  maxCardsPossiblePerRow: number,
  index: number
): void {
  widget.layoutAttributes = widget.layoutAttributes || {};
  const { layoutAttributes, attributes } = widget;
  layoutAttributes.cardsToShow = attributes?.numCards || 1;
  const width = CARD_WIDTH * layoutAttributes.cardsToShow;
  layoutAttributes.width = `${width}px`;
  layoutAttributes.widthInNumber = width;

  const isMyLearningFullRowWidget =
    widget.widgetRef === WIDGET_REF_MAP_NAME.MYLEARNING && widgets.length > 1;
  const isFlexiWidget = [
    WIDGET_REF_MAP_NAME.CALENDAR,
    WIDGET_REF_MAP_NAME.COMPLAINCE,
    WIDGET_REF_MAP_NAME.LEADERBOARD,
    WIDGET_REF_MAP_NAME.SOCIAL,
  ].includes(widget.widgetRef);

  if (isMyLearningFullRowWidget) {
    const numberCount = getMyLearningCardsCount(widget, widgets, maxCardsPossiblePerRow, index);
    layoutAttributes.cardsToShow = numberCount || 1;
    const width = CARD_WIDTH * numberCount;
    layoutAttributes.width = `${width}px`;
    layoutAttributes.widthInNumber = width;
    layoutAttributes.isFullRow = false;
  } else if (!isFlexiWidget) {
    layoutAttributes.cardsToShow = maxCardsPossiblePerRow || 1;
    layoutAttributes.isFullRow = true;
  }

  if (isFlexiWidget) {
    layoutAttributes.isFullRow = false;
  }
}

export function getMyLearningCardsCount(
  widget: Widget,
  widgets: Widget[],
  maxCardsPossiblePerRow: number,
  currentWidgetIndex: number
): number {
  let totalCards = 0;
  const { attributes, layoutAttributes } = widget;
  widgets.forEach((currentWidget: any, index: number) => {
    if (index != currentWidgetIndex) {
      totalCards += currentWidget.attributes?.numCards || 1;
    }
  });
  const { overrideCardsToShow, cardsToShow } = layoutAttributes || {};
  const { numberOfCardsLoaded } = attributes || {};
  if (overrideCardsToShow && cardsToShow! >= numberOfCardsLoaded!) {
    return numberOfCardsLoaded!;
  }
  if (totalCards < maxCardsPossiblePerRow) {
    const numberOfCardsCanLoad = maxCardsPossiblePerRow - totalCards;
    //If list has less data than the available space, then reduce the space for it to show other widgets side by side
    if (numberOfCardsCanLoad > numberOfCardsLoaded!) {
      return numberOfCardsLoaded!;
    }
    return numberOfCardsCanLoad;
  } else if (totalCards == maxCardsPossiblePerRow) {
    return totalCards;
  }

  return 1;
}

export function isPrimeLearningObject(object: PrimeLearningObject): object is PrimeLearningObject {
  if (object && (object as PrimeLearningObject).id) return true;
  return false;
}

export function isSkillInterestViewUpdate(): boolean {
  return !getWidgetConfig()?.hideSkillInterestViewUpdate;
}

export function ApplyWidgetOverrides(widget: Widget, widgetOverride: Attributes | undefined) {
  widget.attributes = widget.attributes || {};
  if (widgetOverride) {
    for (const key in widgetOverride) {
      const widgetAttributes: any = widget.attributes!;
      widgetAttributes[key] = (<any>widgetOverride)[key];
    }
  }
}

export async function ApplyInjectables(
  injectablesUrl: string | undefined,
  currentThemeData: IThemeData
): Promise<IThemeData> {
  currentThemeData = currentThemeData || {};
  const customization = currentThemeData.customization;
  if (customization) {
    try {
      const customizationJson = JSON.parse(currentThemeData.customization);
      currentThemeData = { ...currentThemeData, ...customizationJson };
    } catch (e) {
      console.log(`Error occured while parsing the customization object:: ${e}`);
    }
  }

  if (injectablesUrl && IsAnyUrl(injectablesUrl)) {
    try {
      const response: string = <string>await RestAdapter.get({
        url: injectablesUrl,
      });
      if (response) {
        const parsedInjectables: ExternalConfig = JSON.parse(response);
        if (parsedInjectables) {
          const themeData: IThemeData = parsedInjectables.theme;
          if (themeData) {
            //for now shallow merge is good enough
            return { ...currentThemeData, ...themeData };
            // currentThemeData.tileColors = themeData.tileColors;
            // currentThemeData.globalCssText = themeData.globalCssText;
            // currentThemeData.componentCssText = themeData.componentCssText;
            // currentThemeData.fontNames = themeData.fontNames;
          }
        }
      }
    } catch (ex) {
      console.log("injectablesUrl:", ex);
    }
  }
  return Promise.resolve(currentThemeData);
}

export const handleLinkClick = (event: any, link?: string) => {
  event && event.stopPropagation();
  if (link) {
    SendLinkEvent(link);
  }
};

export const handleKeyDownEvent = (event: any, link?: string) => {
  event && event.stopPropagation();
  if (event.key === "Enter") {
    handleLinkClick(event, link);
  }
};
export async function getUserId() {
  if (!getALMObject().isPrimeUserLoggedIn()) {
    return;
  }
  const userResponse = await getALMUser();
  return userResponse?.user?.id;
}

export function getDonutDimensions(isComplianceLabelEnabled = false) {
  return isComplianceLabelEnabled
    ? {
        svgHeight: 130,
        transformY: 65,
        outerRadius: 48,
        innerRadius: 32,
        fullDonutSvgPath: "M 1 -51 A 52 52 0 1 1 0.999 -51 M 0 -33 A 34 34 0 1 0 1 -33 Z",
      }
    : {
        svgHeight: 225,
        transformY: 112.5,
        outerRadius: 60,
        innerRadius: 42,
        fullDonutSvgPath:
          "M 63 2 C 63 36.2417 35.2417 64 1 64 C -33.2417 64 -61 36.2417 -61 2 C -61 -32.2417 -33.2417 -60 1 -60 C 35.2417 -60 63 -32.2417 63 2 Z M -41.6127 2 C -41.6127 25.5343 -22.5343 44.613 1 44.613 C 24.5343 44.613 43.613 25.5343 43.613 2 C 43.613 -21.5343 24.5343 -40.6127 1 -40.6127 C -22.5343 -40.6127 -41.6127 -21.5343 -41.6127 2 Z",
      };
}

export function downloadFile(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  link.setAttribute("download", "");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
