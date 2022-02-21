import { PrimeConfig } from "../externalLib";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  mountingPoints: {
    navContainer: ".navigation__container",
    catalogContainer: ".catalog__container",
    trainingOverviewPage: ".training__page__container",
    boardsContainer: ".boards__container",
    boardContainer: ".board__container",
    notificationContainer: '.notification__container'

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
  accessToken: "1e797812a2fa07a1f1a5d6328736628a",
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  }
}