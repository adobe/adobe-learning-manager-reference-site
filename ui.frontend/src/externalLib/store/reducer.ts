import { combineReducers } from "redux";
import { accessToken, user, account } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account
});
export default reducer;
