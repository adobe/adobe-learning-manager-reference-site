// import outputFileMap from '../.transient/outputFileMap.json';
import { WidgetCEHelperBase } from "./base/WidgetCEHelperBase";
import { Auth, Prime, PrimeWindow } from "./common";

// import { InitFromPrimeTheme } from '../themes';
import {
  getLocale,
  // InitFromPrimeTranslations,
  SetupAccountTerminologies,
} from "../translationService";
import { CalcualteIfMobile, setNativeExtensionToken } from "./utils";
import { PrimeAccount, PrimeUser } from "../../models/PrimeModels";
import { getWidgetConfig } from "../global";

const customElementMap: Record<string, WidgetCEHelperBase> = {};

// let MANIFEST: Record<string, string> = <any>outputFileMap;
// function GetManifestFile(key: string) {
//     return MANIFEST[key];
// }

// export function GetManifestResourcePath(key: string): string | undefined {
//     const val = GetManifestFile(key);
//     if (val) {
//         return GetPrimeObj().commonConfig._contentsParentPath + val;
//     }
//     return undefined;
// }

export function GetPrimeObj(): Prime {
  return prime as Prime;
}

export function GetPrimeWindow(): PrimeWindow {
  return <PrimeWindow>(window as unknown);
}

let _user!: PrimeUser;
let _account!: PrimeAccount;
// export function GetPrimeAccount(): PrimeAccount {
//   return _account;
// }
// export function GetPrimeUser(): PrimeUser {
//   return _user;
// }
export function SetUserAccount(user: PrimeUser, account: PrimeAccount): void {
  _user = user;
  _account = account;
  prime._dummyCurrentUserUsed = user;
  prime._dummyCurrentAccountUsed = account;
}
export function GetPrimeAuth(): Auth {
  return prime.auth;
}

export function GetC(): Auth {
  return prime.auth;
}

export function GetPrimeApiBasePath(): string {
  return prime.commonConfig.primeapiPrefix;
}
export function GetPrimeDisableLinks(): boolean {
  return prime.commonConfig.disableLinks === true;
}

export function GetPrimeDisableLeaderBoardWidgetLink(): boolean {
  return prime.commonConfig.disableLeaderBoardWidgetLink === true;
}

export function GetPrimeDisableSocialWidgetLink(): boolean {
  return prime.commonConfig.disableSocialWidgetLink === true;
}

export function GetHideSkillInterestViewUpdate(): boolean {
  return prime.commonConfig.hideSkillInterestViewUpdate === true;
}

export function GetPrimeHostName(): string {
  return prime.commonConfig.captivateHostName;
}
export function GetPrimeContentsHostName(): string {
  // return prime.commonConfig._contentsHostName;
  return "https://localhost:8080/";
}
// export function GetPrimeEmitEventLinks(): string {
//   return <string>GetPrimeObj().commonConfig.emitPageLinkEvents;
// }
// export function ShouldEmitEventLinks(): boolean {
//   return GetPrimeObj().commonConfig.emitPageLinkEvents !== 'false';
// }
// export function IsFlexibleWidth(): boolean {
//   return getWidgetConfig()?.fixedWidth || false;
// }

export function WinInit(configObj: any): void {
  if (
    !window.Proxy ||
    !("customElements" in window) ||
    !("content" in document.createElement("template"))
  ) {
    throw "Cant Proceed further. Requirements are not met";
  }
  prime.auth = configObj.auth || {};
  prime.commonConfig = configObj.commonConfig || {};
  prime.commonConfig.locale = getLocale(configObj.pageLocale);
  CalcualteIfMobile();
  setNativeExtensionToken(configObj);
}
export function RegisterCustomElement(widgetRef: string, customElement: WidgetCEHelperBase): void {
  customElementMap[widgetRef] = customElement;
}
export function GetCustomElement(widgetRef: string): WidgetCEHelperBase {
  const ceHelper = customElementMap[widgetRef];
  if (!ceHelper) {
    throw "unknown widget type" + widgetRef;
  }
  return ceHelper;
}

export function GetBrightCoveAccountId(): string {
  let brightCoveAccountId = "BRIGHTCOVE_ACCOUNT_ID_PLACEHOLDER";
  if (brightCoveAccountId.startsWith("BRIGHTCOVE_")) {
    brightCoveAccountId = "2890187661001";
  }
  return brightCoveAccountId;
}
export function GetBrightCovePlayerId(): string {
  let brightCovePlayerId = "BRIGHTCOVE_PLAYER_ID_PLACEHOLDER";
  if (brightCovePlayerId.startsWith("BRIGHTCOVE_")) {
    brightCovePlayerId = "YefW6AINQ";
  }
  return brightCovePlayerId;
}
export function GetRootAppCdnPath(): string | null {
  const retval = "UPLOAD_CDN_LOC_PLACEHOLDER";
  if (retval.startsWith("http")) {
    return retval;
  }
  return null; //dev testing
}

//required for skills extrnal iframe
export function InitPrimeFromPrime(_primeToUse: Prime): void {
  (window as any)._prime = _primeToUse;
  prime = _primeToUse;
  _user = prime._dummyCurrentUserUsed;
  _account = prime._dummyCurrentAccountUsed;
  // MANIFEST = _primeToUse._dummyManifestUsed;
  // InitFromPrimeTranslations();
  SetupAccountTerminologies(_account.accountTerminologies);
  // InitFromPrimeTheme();
}
//required for skills extrnal iframe

//Ensure prime object is available early on
let prime: Prime = (window as any)._prime || <Prime>{};
(window as any)._prime = prime;
prime._dummyCustomElMap = customElementMap; //just for debugging
// prime._dummyManifestUsed = MANIFEST;
