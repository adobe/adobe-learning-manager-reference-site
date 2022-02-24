import { PrimeConfig } from "../externalLib";

// eslint-disable-next-line import/no-anonymous-default-export
const mountingPoints = {
  navContainer: ".navigation__container",
  catalogContainer: ".catalog__container",
  trainingOverviewPage: ".training__page__container",
  boardsContainer: ".boards__container",
  boardContainer: ".board__container",
  notificationContainer: '.notification__container',
  instanceContainer: '.instance__container'
}

export { mountingPoints };

// TODO: These will come from prime
const baseUrl = "http://localhost:4502/content/aem-learn-components/language-masters/en/non-log";

export const primeConfig: PrimeConfig = {
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
  accessToken: "26e3ea930a6d70a280b788731da7ef70",
  cdnBaseUrl: "https://cpcontentsdev.adobe.com",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${baseUrl}/instance.html`,
    catalog: `${baseUrl}/catalog.html`,
    trainingOverview: `${baseUrl}/trainingOverview.html`,
    community: `${baseUrl}/community.html`,
  },
  mountingPoints
};
