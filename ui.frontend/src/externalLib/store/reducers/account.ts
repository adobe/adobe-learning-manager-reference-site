import { AnyAction, Reducer } from "redux";
import { AEMLearnAccount } from "../../models";
import { LOAD_ACCOUNT_AND_USER } from "../actions";

const account: Reducer<AEMLearnAccount, AnyAction> = (
  state: AEMLearnAccount | undefined,
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
