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
const baseUrl = "";
const basePath = "";

export const primeConfig: PrimeConfig = {
<<<<<<< HEAD
  baseApiUrl: "https://captivateprimeqe.adobe.com/primeapi/v2/",
  accessToken: "1e797812a2fa07a1f1a5d6328736628a",
=======
  baseApiUrl: "https://captivateprimestage1.adobe.com/primeapi/v2/",
  accessToken: "507ba6cc33c9e2473827bf359c4f2cf2",
  cdnBaseUrl: "https://cpcontentsdev.adobe.com",
>>>>>>> c9b749b5b8b9c357e06465054ae4ed51207fd0ec
  locale: "en-US",
  pagePaths: {
    baseUrl,
    instance: `${basePath}/instance.html`,
    catalog: `${basePath}/catalog.html`,
    loOverview: `${basePath}/loOverview.html`,
    community: `${basePath}/community.html`,
  },
};
