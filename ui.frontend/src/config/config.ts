//import { PrimeConfig } from "../externalLib";
// eslint-disable-next-line import/no-anonymous-default-export
const mountingPoints = {
  navContainer: ".navigation__container",
  catalogContainer: ".catalog__container",
  trainingOverviewPage: ".training__page__container",
  boardsContainer: ".boards__container",
  boardContainer: ".board__container",
  notificationContainer: ".notification__container",
  instanceContainer: ".instance__container",
};

(window as any).ALM = (window as any).ALM || {};
(window as any).ALM.ALMConfig["mountingPoints"] = mountingPoints;

export { mountingPoints };

// // TODO: These will come from prime
// const baseUrl =
//   "http://localhost:4502/content/aem-learn-components/language-masters/en/non-log";

// const ALMbaseUrl = "https://captivateprimestage1.adobe.com";

// export const primeConfig: PrimeConfig = {
//   ALMbaseUrl,
//   primeApiURL: `${ALMbaseUrl}/primeapi/v2/`,
//   accessToken: "69337f5b675f21d0e1b553e89fafed24",
//   cdnBaseUrl: "https://cpcontentsdev.adobe.com",
//   locale: "en-US",
//   //pagePaths: {
//   baseUrl,
//   instancePath: `${baseUrl}/instance.html`,
//   catalogPath: `${baseUrl}/catalog.html`,
//   trainingOverviewPath: `${baseUrl}/trainingOverview.html`,
//   communityPath: `${baseUrl}/community.html`,
//   // },
//   //mountingPoints,
// };
