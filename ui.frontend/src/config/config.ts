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
  accessToken: "47f72bcb7b87d93f26369d77b2fadfc9",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  }
}