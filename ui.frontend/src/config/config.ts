import { PrimeConfig } from "../externalLib";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  mountingPoints: {
    navContainer: ".navigation__container",
    catalogContainer: ".catalog__container",
    trainingOverviewPage: ".training__page__container",
    boardsContainer: ".boards__container",
    boardContainer: ".board__container",
    notificationContainer: '.notification__container',
    instanceContainer: '.instance__container'

  },

  parentContainers: {
    navParent: ".navigation__parent",
  },
};

// TODO: These will come from prime
const baseUrl = "http://localhost:4502/content/aem-learn-components/language-masters/en/non-log";
const basePath = "";

export const primeConfig: PrimeConfig = {
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
  accessToken: "c24f9994ed159a25416ad5e96f0541f8",
  cdnBaseUrl: "https://cpcontentsdev.adobe.com",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${baseUrl}/instance.html`,
    catalog: `${baseUrl}/catalog.html`,
    trainingOverview: `${baseUrl}/trainingOverview.html`,
    community: `${baseUrl}/community.html`,
  },
};
