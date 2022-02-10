import { PrimeAccount, PrimeUser } from "../models/PrimeModels";
import { CatalogState } from "./reducers/catalog";
import { NotificationState } from "./reducers/notification";

export interface Authentication {
  accessToken: string;
}

export interface State {
  accessToken: string;
  user: PrimeUser;
  account: PrimeAccount;
  catalog: CatalogState;
  notification: NotificationState;
}
