import { AnyAction, Reducer } from "redux";
import { AUTHENTICATE_USER } from "../actions/auth/actionTypes";

const accessToken: Reducer<String, AnyAction> = (
  state: String | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case AUTHENTICATE_USER: {
      return action?.payload;
    }
    default:
      return state || "";
  }
};

export { accessToken };
