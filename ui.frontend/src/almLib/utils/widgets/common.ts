// import { TemplateResult } from 'lit-html';
import { PrimeAccount, PrimeLearningObject, PrimeUser } from "../../models/PrimeModels";
import { WidgetCEHelperBase } from "./base/WidgetCEHelperBase";
import { GetPrimeObj } from "./windowWrapper";
// import {APIWidgetStore} from './utils/APIStore';
const storeCache: Record<WidgetType, APIWidgetStore> = <any>{};
export const WIDGET_HEIGHT = 350;
export const CARD_HEIGHT = 304;
export const CARD_WIDTH = 308;
export const CARD_WIDTH_EXCLUDING_PADDING = CARD_WIDTH - 20;
export const DOUBLE_CARD_WIDTH = 616;
export const DOUBLE_CARD_WIDTH_EXCLUDING_PADDING = DOUBLE_CARD_WIDTH - 20;
export const CATALOG_CARD_HEIGHT = 100;
export const DEFAULT_MAX_CARDS = 5;

export function APIStoreInit(): void {
  GetPrimeObj()._dummystore = storeCache; //This is just for debugging purposes
}
export function GetStore(storeType: WidgetType): APIWidgetStore {
  let store = storeCache[storeType];
  if (!store) {
    //create it
    store = new APIWidgetStore();
    storeCache[storeType] = store;
  }
  return store;
}

export class APIWidgetStore {
  private cache_lxpv: any = {};

  public put(obj: any): void {
    if (!this.cache_lxpv[obj["type"]]) {
      this.cache_lxpv[obj["type"]] = {};
    }
    this.cache_lxpv[obj["type"]][obj["id"]] = obj;
  }
  public get(type: string, id: string): any {
    if (!this.cache_lxpv[type]) {
      this.cache_lxpv[type] = {};
    }
    return this.cache_lxpv[type][id];
  }
}
export class JsonApiDataRef {
  constructor(
    public type: string,
    public id: string
  ) {}
}
export interface EmptyPromise<T> extends Promise<T> {
  resolve(val?: unknown): void;
  reject(val?: unknown): void;
}

export interface CommonConfig {
  captivateHostName: string;
  customizationUrl: string;
  _contentsHostName: string;
  _contentsParentPath: string;
  primeapiPrefix: string;
  ignoreHigherOrderLOEnrollment: boolean;
  emitPageLinkEvents: string | boolean;
  emitPlayerLaunchEvent: boolean;
  sessionUid?: string;
  isMobile: boolean;
  fixedWidth?: boolean;
  disableLinks?: boolean;
  emitL1FeedbackLaunchEvent?: boolean;
  locale?: string;
  disableLeaderBoardWidgetLink?: boolean;
  disableSocialWidgetLink?: boolean;
  hideSkillInterestViewUpdate?: boolean;
  isLoadedInsideApp?: boolean;
  notAllowedExtensionTypes?: string[];
}

export interface Auth {
  csrfToken?: string;
  accessToken?: string;
  nativeExtensionToken?: string;
}

export interface IThemeData {
  primaryColor: string;
  secondaryColor: string;
  background: string;
  darkMode: string;
  tileColors: string[];
  customization: string;
  globalCssText: string;
  componentCssText: Record<string, string>;
  fontNames: string;
  cardLayout: CustomCardLayout;
  customizationUrl?: string;
}

export interface CustomCardLayout {
  cardLayoutName: string;
  cardPrimaryColor: string;
  cardSecondaryColor: string;
  startedStateTextColor: string;
  continueStateTextColor: string;
  revisitStateTextColor: string;
  startedStateColor: string;
  continueStateColor: string;
  revisitedStateColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  navIconColor: string;
}

export interface CardProperties {
  height: number;
  showActionElement: boolean;
  cardLoadingImage: any;
  cardLayoutName: string;
  cardPrimaryColor: string;
  cardSecondaryColor: string;
  startedStateTextColor: string;
  continueStateTextColor: string;
  revisitStateTextColor: string;
  startedStateColor: string;
  continueStateColor: string;
  revisitedStateColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  navIconColor: string;
  width: number;
}

export interface Attributes {
  size?: string;
  link?: string;
  _providedNumCards?: number;
  numCards?: number;
  layoutConfig?: string;
  layoutMode?: string;
  learningObject?: PrimeLearningObject;
  displayType?: string;
  widgetOverrides?: Record<string, Attributes>;
  sort?: string;
  numRows?: number;
  numStrips?: number;
  hideExploreSkills?: boolean;
  disableLinks?: boolean;
  catalogIds?: number[] | string;
  heading?: string;
  skillName?: string[] | string;
  tagName?: string[] | string;
  loTypes?: string[] | string;
  preferredSortPartitionOrder?: string[] | string;
  learnerState?: string[] | string;
  view?: string;
  stripNum?: number;
  learningObjectId?: string;
  learningObjectInstanceId?: string;
  disableLeaderBoardWidgetLink?: boolean;
  disableSocialWidgetLink?: boolean;
  showL1Feedback?: boolean;
  hideSkillInterestViewUpdate?: boolean;
  enableAnnouncementRecoUGWLink?: boolean;
  recommendationConfig?: any;
  headingClass?: string;
  seeAllLink?: string;
  headerAriaLabel?: string;
  ignoreStrip?: string[] | string;
  isStripHidden?: boolean;
}

export interface Dimensions {
  width?: number;
  height?: number;
}

export interface WidgetLayoutAttributes {
  id?: string;
  width?: string;
  height?: number;
  isFullRow?: boolean;
  // headerEnabled?: boolean;
  flexibleWidth?: boolean;
  canInit?: boolean;
  isRoot?: boolean;
  leftPadding?: number;
  cardsToShow?: number;
  widthInNumber?: number;
  parentContainerWidth?: string;
}

export interface Widget {
  widgetRef: string;
  querySelector?: string;
  attributes?: Attributes;
  layoutAttributes?: WidgetLayoutAttributes;
  type?: WidgetTypeNew;
}

export interface ExternalConfig {
  auth: Auth;
  commonConfig: CommonConfig;
  widgetConfig: Widget;
  theme: IThemeData;
  pageLocale: string;
}

export interface Prime {
  auth: Auth;
  commonConfig: CommonConfig;
  _dummyLocale: any;
  _dummyTranslationsUsed: string;
  _dummyThemes: any;
  _dummyCurrentUserUsed: PrimeUser;
  _dummyCurrentAccountUsed: PrimeAccount;
  _dummyCustomElMap: Record<string, WidgetCEHelperBase>;
  _dummystore: Record<WidgetType, APIWidgetStore>;
  _dummyManifestUsed: Record<string, string>;
  _playerLaunchTimeStamp: number;
  _cardProperties: CardProperties;
}

export enum PrimeEvent {
  FORCE_RELAYOUT = "FORCE_RELAYOUT",
  PLAYER_LAUNCH = "PLAYER_LAUNCH",
  PLAYER_CLOSE = "PLAYER_CLOSE",
  L1_FEEDBACK_LAUNCHED = "L1_FEEDBACK_LAUNCHED",
  L1_FEEDBACK_CLOSED = "L1_FEEDBACK_CLOSED",
  L1_FEEDBACK_DIALOG_LAUNCHED = "L1_FEEDBACK_DIALOG_LAUNCHED",
  L1_FEEDBACK_DIALOG_CLOSED = "L1_FEEDBACK_DIALOG_CLOSED",
  MODAL_DIALOG_LAUNCHED = "MODAL_DIALOG_LAUNCHED",
  MODAL_DIALOG_CLOSED = "MODAL_DIALOG_CLOSED",
  HANDLE_L1_FEEDBACK = "HANDLE_L1_FEEDBACK",
  KEYBOARD_SHORTCUTS = "KEYBOARD_SHORTCUTS",
  LOAD_EXTRA_STRIPS = "LOAD_EXTRA_STRIPS",
  HIDE_EXTRA_STRIPS = "HIDE_EXTRA_STRIPS",
  PRL_DIALOG_LAUNCHED = "PRL_DIALOG_LAUNCHED",
  PRL_DIALOG_CLOSED = "PRL_DIALOG_CLOSED",
  FLYOVER_NOTIFICATIONS_LAUNCHED = "FLYOVER_NOTIFICATIONS_LAUNCHED",
  FLYOVER_NOTIFICATIONS_CLOSED = "FLYOVER_NOTIFICATIONS_CLOSED",
  ADD_WIDGETS = "ADD_WIDGETS",
  CONFIG_LOADED = "CONFIG_LOADED",
  WIDGETS_TO_RENDER = "WIDGETS_TO_RENDER",
  ALM_SKIP_LINKS = "ALM_SKIP_LINKS",
  ALM_USER_PROFILE_UPDATED = "ALM_USER_PROFILE_UPDATED",
  ALM_SHOW_FEEDBACK = "ALM_SHOW_FEEDBACK",
  ALM_RETRY_PAGE_RELOAD = "ALM_RETRY_PAGE_RELOAD",
  ALM_LISTENERS_LOADED = "ALM_LISTENERS_LOADED",
  ALM_ENABLE_NAV_CONTROLS = "ALM_ENABLE_NAV_CONTROLS",
  ALM_DISABLE_NAV_CONTROLS = "ALM_DISABLE_NAV_CONTROLS",
  ALM_SHOW_POST_CONFIRMATION = "ALM_SHOW_POST_CONFIRMATION",
}

export interface IPrimeLayoutEngine {
  doLayout(el: HTMLElement, force: boolean, addLeftPadding: boolean): Dimensions;
  focusFirstFocusableElement(widgetRef: string): void;
  addWidgetAtPosition(widgets: Array<Widget>, refWidget: string, position: string): void;
}
export const enum FlyoverNotficationStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

export const enum ScrollDirectionEnum {
  LEFT = 0,
  TOP,
  RIGHT,
  BOTTOM,
}
export interface PrimeEventTarget extends EventTarget {
  addEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

export interface PrimeWindow extends PrimeEventTarget {
  nativeExtensionToken: any;
  readonly innerHeight: number;
  readonly innerWidth: number;
  location: Location;
  readonly frameElement: Element;
  readonly top: Window;
  readonly screen: Screen;
  videojs(id: any, options?: any, ready?: () => void): any;
  open(
    url?: string | undefined,
    target?: string | undefined,
    features?: string | undefined,
    replace?: boolean | undefined
  ): Window | null;
  onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  setInterval(handler: TimerHandler, timeout?: number, ...args: any[]): number;
  setTimeout(handler: TimerHandler, timeout?: number, ...args: any[]): number;
}

export interface ComplianceData {
  [key: string]: {
    name: string;
    count: number;
    color: string;
    pathData: string;
  };
}

export const ADVANCED = "ADVANCED";
export const GET = "GET";
export const POST = "POST";
export const ALL_DEADLINES = "ALL";
export const OVERDUE = "OVERDUE";
export const UPCOMING = "UPCOMING";
export const ONTRACK = "ONTRACK";
export const AOI_STRIP = "primelxp-aoi";
export const AOI_VIEW_TYPE_INDIVIDUAL = "individual";
export const AOI_VIEW_TYPE_CONSOLIDATED = "consolidated";

export const enum WidgetType {
  NONE = 0,
  COMMON = 1,
  MASTHEAD = 2,
  MYLEARNING = "com.adobe.captivateprime.lostrip.mylearning",
  SOCIAL = "com.adobe.captivateprime.social",
  CALENDAR = "com.adobe.captivateprime.calendar",
  COMPLIANCE = "com.adobe.captivateprime.compliance",
  GAMIFICATION = "com.adobe.captivateprime.leaderboard",
  ADMIN_RECO = "com.adobe.captivateprime.lostrip.adminreco",
  AOI_RECO = "com.adobe.captivateprime.lostrip.myinterest",
  TRENDING_RECO = "com.adobe.captivateprime.lostrip.trending",
  CATALOG_BROWSER = "com.adobe.captivateprime.lostrip.browsecatalog",
  PRIME_SKILLS = "com.adobe.captivateprime.primeskills",
  // LAYOUT = "com.adobe.captivateprime.lostrip.test",
  LEADERBOARD = "com.adobe.captivateprime.leaderboard",
  AOI_RECO_LAYOUT = "com.adobe.captivateprime.lostrip.myinterestLayout",
  FOOTER = "com.adobe.captivateprime.footer",
  EMBED_WIDGET = "com.adobe.captivateprime.embed-widget",
  CATALOG = "com.adobe.captivateprime.lostrip.catalog",
  SEARCH = "com.adobe.captivateprime.lostrip.search",
  BOOKMARKS = "com.adobe.captivateprime.lostrip.mybookmarks",
  L1_FEEDBACK_WRAPPER = "com.adobe.captivateprime.l1FeedbackWrapper",
  PRL_WIZARD = "com.adobe.captivateprime.prlWizard",
  PRL_CHIPS = "com.adobe.captivateprime.prlChips",
  LEVEL_SELECTOR = "com.adobe.captivateprime.lostrip.test",
  RECOMMENDATIONS = "com.adobe.captivateprime.lostrip.test",
  RECOMMENDATIONS_STRIP = "com.adobe.captivateprime.lostrip.reco",
  DISCOVERY_RECO = "com.adobe.captivateprime.lostrip.discovery",
}

export const enum WidgetTypeNew {
  NONE = 0,
  COMMON = 1,
  MASTHEAD,
  MYLEARNING,
  SOCIAL,
  CALENDAR,
  COMPLIANCE,
  GAMIFICATION,
  ADMIN_RECO,
  AOI_RECO,
  TRENDING_RECO,
  CATALOG_BROWSER,
  PRIME_SKILLS,
  LAYOUT,
  AOI_RECO_LAYOUT,
  FOOTER,
  EMBED_WIDGET,
  CATALOG,
  SEARCH,
  BOOKMARKS,
  L1_FEEDBACK_WRAPPER,
  PRL_WIZARD,
  PRL_CHIPS,
  LEVEL_SELECTOR,
  RECOMMENDATIONS,
  RECOMMENDATIONS_STRIP,
  DISCOVERY_RECO,
}
export const WIDGET_REF_TO_TYPE = {
  "com.adobe.captivateprime.calendar": WidgetTypeNew.CALENDAR,
  "com.adobe.captivateprime.compliance": WidgetTypeNew.COMPLIANCE,
  "com.adobe.captivateprime.levelSelector": WidgetTypeNew.LEVEL_SELECTOR,
  "com.adobe.captivateprime.prlChips": WidgetTypeNew.PRL_CHIPS,
  "com.adobe.captivateprime.embed-widget": WidgetTypeNew.EMBED_WIDGET,
  "com.adobe.captivateprime.footer": WidgetTypeNew.FOOTER,
  "com.adobe.captivateprime.l1FeedbackWrapper": WidgetTypeNew.L1_FEEDBACK_WRAPPER,
  "com.adobe.captivateprime.l1Feedback": WidgetTypeNew.L1_FEEDBACK_WRAPPER,
  "com.adobe.captivateprime.layout": WidgetTypeNew.LAYOUT,
  "com.adobe.captivateprime.lostrip.myinterestLayout": WidgetTypeNew.AOI_RECO_LAYOUT,
  "com.adobe.captivateprime.leaderboard": WidgetTypeNew.GAMIFICATION,
  "com.adobe.captivateprime.lostrip.locard": WidgetTypeNew.NONE,
  "com.adobe.captivateprime.lostrip.adminreco1": WidgetTypeNew.ADMIN_RECO,
  "com.adobe.captivateprime.lostrip.mylearning1": WidgetTypeNew.MYLEARNING,
  "com.adobe.captivateprime.lostrip.trending1": WidgetTypeNew.TRENDING_RECO,
  "com.adobe.captivateprime.lostrip.myinterest1": WidgetTypeNew.AOI_RECO,
  "com.adobe.captivateprime.masthead": WidgetTypeNew.MASTHEAD,
  "com.adobe.captivateprime.primeskills": WidgetTypeNew.PRIME_SKILLS,
  "com.adobe.captivateprime.prlPreferenceSecion": WidgetTypeNew.PRL_CHIPS,
  "com.adobe.captivateprime.prlPreference": WidgetTypeNew.PRL_CHIPS,
  "com.adobe.captivateprime.lostrip.browsecatalog": WidgetTypeNew.CATALOG_BROWSER,
  "com.adobe.captivateprime.lostrip.adminreco": WidgetTypeNew.ADMIN_RECO,
  "com.adobe.captivateprime.lostrip.mylearning": WidgetTypeNew.MYLEARNING,
  "com.adobe.captivateprime.lostrip.mybookmarks": WidgetTypeNew.BOOKMARKS,
  "com.adobe.captivateprime.lostrip.trending": WidgetTypeNew.TRENDING_RECO,
  "com.adobe.captivateprime.lostrip.myinterest": WidgetTypeNew.AOI_RECO,
  "com.adobe.captivateprime.lostrip.catalog": WidgetTypeNew.CATALOG,
  "com.adobe.captivateprime.lostrip.search": WidgetTypeNew.SEARCH,
  "com.adobe.captivateprime.lostrip.reco": WidgetTypeNew.RECOMMENDATIONS_STRIP,
  "com.adobe.captivateprime.lostrip.discovery": WidgetTypeNew.DISCOVERY_RECO,
  "com.adobe.captivateprime.prlWizard": WidgetTypeNew.PRL_WIZARD,
  "com.adobe.captivateprime.recommendations": WidgetTypeNew.RECOMMENDATIONS,
  "com.adobe.captivateprime.social": WidgetTypeNew.SOCIAL,
};
