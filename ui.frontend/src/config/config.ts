import { PrimeConfig } from "../externalLib";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  mountingPoints: {
    navContainer: ".navigation__body",
    catalogContainer: ".catalog__body",
    loOverviewContainer: ".looverview__body",
    boardsContainer: ".boards__body",
    boardContainer: ".board__body",
    notificationContainer: '.notification__body'
  },

  parentContainers: {
    navParent: ".navigation__parent",
  },
};

// TODO: These will come from prime
const baseUrl = "";
const basePath = ""

export const primeConfig: PrimeConfig = {
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
<<<<<<< HEAD
  accessToken: "9eb9a3e8c3eae53b0ab4715130237796",
=======
  accessToken: "d41b8be2849e5dda6d1e39e60d3f77c5",
>>>>>>> a1ab2dc613d0fb54e62e6589ec5b32c5e410e8bd
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  }
}