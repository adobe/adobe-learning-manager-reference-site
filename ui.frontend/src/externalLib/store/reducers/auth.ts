import { AnyAction, Reducer } from "redux";

const accessToken: Reducer<String, AnyAction> = (
  state: String | undefined,
  action: AnyAction
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
