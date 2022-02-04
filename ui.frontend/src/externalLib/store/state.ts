import { PrimeAccount, PrimeUser } from "../models/PrimeModels";
import { CatalogState } from "./reducers/catalog";
export interface Authentication {
  accessToken: string;
}

export interface State {
  accessToken: string;
  user: PrimeUser;
  account: PrimeAccount;
  catalog: CatalogState;
}
