//import { PrimeConfig } from "../externalLib";
// eslint-disable-next-line import/no-anonymous-default-export
const mountingPoints = {
  catalogContainer: ".catalog__container",
  trainingOverviewPage: ".training__page__container",
  boardsContainer: ".boards__container",
  boardContainer: ".board__container",
  notificationContainer: ".notification__container",
  instanceContainer: ".instance__container",
  profilePageContainer: ".profile__container",
};

(window as any).ALM = (window as any).ALM || {};
(window as any).ALM.ALMConfig["mountingPoints"] = mountingPoints;

export { mountingPoints };
