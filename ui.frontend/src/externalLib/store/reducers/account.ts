import { AnyAction, Reducer } from "redux";
import { PrimeAccount } from "../../models";
import { LOAD_ACCOUNT_AND_USER } from "../actions";

const account: Reducer<PrimeAccount, AnyAction> = (
  state: PrimeAccount | undefined,
  action: any
) => {
  switch (action.type) {
    case LOAD_ACCOUNT_AND_USER: {
      return action?.payload.account;
    }
    default:
      return state || {};
  }
};

export { account };
