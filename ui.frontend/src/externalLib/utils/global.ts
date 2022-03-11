import { JsonApiParse } from "../utils/jsonAPIAdapter";
export interface PrimeConfig {
  almBaseURL: string;
  primeApiURL: string;
  accessToken: string;
  baseUrl: string;
  instancePath: string;
  catalogPath: string;
  trainingOverviewPath: string;
  communityPath: string;
  communityBoardsPath: string;
  communityBoardPath: string
  locale: string;
  cdnBaseUrl: string;
  mountingPoints: {
    [key: string]: string;
  };
}

export interface ALM {
  getALMConfig: Function;
  navigateToTrainingOverviewPage: Function;
  navigateToInstancePage: Function;
  navigateToBoardPage: Function;
  isPrimeUserLoggedIn: Function;
  getALMUser: Function;
  getAccessToken: Function;
  setALMAttribute: Function;
  getALMAttribute: Function;
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

export const getPathParams = (pagePath: string, pathParams: string[] = []) => {
  let paramsMap: {
    [key: string]: string;
  } = {};
  const location = getWindowObject().location;
  let params: string[] = location.href.split(pagePath)[1].split("/");
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

export const getALMUser = async () => {
  return JsonApiParse(await getALMObject().getALMUser());
};
