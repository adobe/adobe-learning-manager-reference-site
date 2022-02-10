import { combineReducers } from "redux";
import { accessToken, user, account, catalog, notification } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account,
  catalog,
  notification
});
export default reducer;
