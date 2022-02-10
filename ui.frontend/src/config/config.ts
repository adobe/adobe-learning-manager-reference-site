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
const basePath = ""

export const primeConfig: PrimeConfig = {
  baseApiUrl: "https://captivateprimeqe.adobe.com/primeapi/v2/",
  accessToken: "c95f4b5acec6da2c186d3e2276818c9b",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  }
}