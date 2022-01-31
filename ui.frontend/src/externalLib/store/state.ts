import { AEMLearnAccount, AEMLearnUser } from "../models/AEMLearnModels";
import { CatalogState } from "./reducers/catalog";
export interface Authentication {
  accessToken: string;
}

export interface State {
  accessToken: string;
  user: AEMLearnUser;
  account: AEMLearnAccount;
  catalog: CatalogState;
}
