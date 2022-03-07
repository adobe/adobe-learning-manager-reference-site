//import { PrimeConfig } from "../contextProviders";
export interface PrimeConfig {
  almBaseURL: string;
  primeApiURL: string;
  accessToken: string;
  //pagePaths: {
  baseUrl: string;
  instancePath: string;
  catalogPath: string;
  trainingOverviewPath: string;
  communityPath: string;
  //};
  locale: string;
  cdnBaseUrl: string;
  mountingPoints: {
    [key: string]: string;
  };
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

// export const getALMConfig = (): PrimeConfig => {
//   return getALMAttribute("config");
// };

export function getALMConfig(): PrimeConfig {
  const alm = getALMObject();
  return alm.getALMConfig();
  //return getALMObject().getALMConfig();
}

// function redirectToTrainingOverview(
//   trainingId: string,
//   trainingInstanceId: string
// ) {
//   let { pagePaths } = getALMConfig();
//   getWindowObject().location = `${pagePaths.trainingOverviewPath}?trainingId=${trainingId}&trainingInstanceId=${trainingInstanceId}`;
// }

// function redirectToInstancePage(trainingId: string) {
//   let { pagePaths } = getALMConfig();
//   getWindowObject().location = `${pagePaths.instancePath}?trainingId=${trainingId}`;
// }

// function initGLobalALMObject() {
//   getWindowObject().ALM = {
//     config: {},
//     catalogAttributes: {},
//     redirectToTrainingOverview,
//     redirectToInstancePage,
//   };
// }

export interface ALM {
  getALMConfig: Function;
  navigateToTrainingOverviewPage: Function;
  navigateToInstancePage: Function;
  isPrimeUserLoggedIn: Function;
  getAccessToken: Function;
  setALMAttribute: Function;
  getALMAttribute: Function;
}
