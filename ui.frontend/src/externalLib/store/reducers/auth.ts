import { AnyAction, combineReducers, Reducer } from "redux";

const accessToken: Reducer<String, AnyAction> = (
  state: String | undefined,
  action: any
) => {
  switch (action.type) {
    case "AUTHENTICATE_USER": {
      return action?.payload;
    }
    default:
      return state || "";
  }
};

export { accessToken };
