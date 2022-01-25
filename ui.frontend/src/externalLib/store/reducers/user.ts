import { AnyAction, Reducer } from "redux";
import { AEMLearnUser } from "../../models";

const user: Reducer<AEMLearnUser, AnyAction> = (
  state: AEMLearnUser | undefined,
  action: any
) => {
  switch (action.type) {
    case "LOAD_USER": {
      return action?.payload;
    }
    default:
      return state || {};
  }
};

export { user };
