import { PrimeConfig } from "../externalLib";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  mountingPoints: {
    navContainer: ".navigation__body",
    catalogContainer: ".catalog__body",
    loOverviewContainer: ".looverview__body",
    boardsContainer: ".boards__body",
    boardContainer: ".board__body",
  },

  parentContainers: {
    navParent: ".navigation__parent",
  },
};

// TODO: These will come from prime
const baseUrl = "";
const basePath = "";

export const primeConfig: PrimeConfig = {
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
  accessToken: "7049d116e33afaa4a9dcb5ef085ff76f",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  },
};
