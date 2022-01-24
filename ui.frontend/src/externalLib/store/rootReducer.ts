import { AnyAction, combineReducers, Reducer } from "redux";
import { AEMLearnUser } from "../models/AEMLearnModels";

const accessToken: Reducer<String, AnyAction> = (
  state: String| undefined,
  action: any
) => {
  switch (action.type) {
    case "AUTHENTICATE_USER": {
      return action?.payload;
    }
    default:
      return "";
  }
};

const user: Reducer<AEMLearnUser, AnyAction> = (
  state: AEMLearnUser | undefined,
  action: any
) => {
  switch (action.type) {
    case "LOAD_USER": {
      return action?.payload;
    }
    default:
      return {};
  }
};

const rootReducer = combineReducers({
 accessToken,
 user
});
export default rootReducer;