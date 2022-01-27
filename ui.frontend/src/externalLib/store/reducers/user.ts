import { AnyAction, Reducer } from "redux";
import { AEMLearnUser } from "../../models";
import { LOAD_USER, LOAD_ACCOUNT_AND_USER } from "../actions";

const user: Reducer<AEMLearnUser, AnyAction> = (
  state: AEMLearnUser | undefined,
  action: any
) => {
  switch (action.type) {
    case LOAD_USER: {
      return action?.payload;
    }
    case LOAD_ACCOUNT_AND_USER: {
      return action?.payload.userData;
    }
    default:
      return state || {};
  }
};

export { user };
