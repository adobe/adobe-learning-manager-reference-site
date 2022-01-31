import { combineReducers } from "redux";
import { accessToken, user, account, catalog } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account,
  catalog,
});
export default reducer;
