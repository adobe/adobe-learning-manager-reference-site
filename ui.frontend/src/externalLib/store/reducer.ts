import { combineReducers } from "redux";
import { accessToken, user, account, catalog, social, notification } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account,
  catalog,
  notification,
  social
});
export default reducer;
