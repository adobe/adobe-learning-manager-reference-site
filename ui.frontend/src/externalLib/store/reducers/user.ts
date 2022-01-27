import { AnyAction, Reducer } from "redux";
import { AEMLearnUser } from "../../models";
import { LOAD_USER } from "../actions";

const user: Reducer<AEMLearnUser, AnyAction> = (
  state: AEMLearnUser | undefined,
  action: any
) => {
  switch (action.type) {
    case LOAD_USER: {
      return action?.payload;
    }
    default:
      return state || {};
  }
};

export { user };
