import { AnyAction, Reducer } from "redux";
import { PrimeUser } from "../../models";
import { LOAD_USER, LOAD_ACCOUNT_AND_USER } from "../actions";

const user: Reducer<PrimeUser, AnyAction> = (
  state: PrimeUser | undefined,
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
