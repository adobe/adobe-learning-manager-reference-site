import { PrimeConfig } from "../externalLib";

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

export { mountingPoints };

// TODO: These will come from prime
const baseUrl =
  "http://localhost:4502/content/aem-learn-components/language-masters/en/non-log";

const ALMbaseUrl = "https://captivateprimestage1.adobe.com";

export const primeConfig: PrimeConfig = {
  ALMbaseUrl,
  baseApiUrl: `${ALMbaseUrl}/primeapi/v2/`,
  accessToken: "fb2d1fe7cb2cbf4d80e1dc2ccd86b7ea",
  cdnBaseUrl: "https://cpcontentsdev.adobe.com",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${baseUrl}/instance.html`,
    catalog: `${baseUrl}/catalog.html`,
    trainingOverview: `${baseUrl}/trainingOverview.html`,
    community: `${baseUrl}/community.html`,
  },
  mountingPoints,
};
