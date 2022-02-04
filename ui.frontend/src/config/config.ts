import { AEMConfig } from "../externalLib";

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

// TODO: These will come from AEM
const baseUrl = "";
const basePath = ""

export const aemConfig: AEMConfig = {
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  }
}