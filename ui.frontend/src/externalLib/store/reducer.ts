import { combineReducers } from "redux";
import { accessToken, user, account, catalog, social, fileUpload, notification } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account,
  catalog,
  notification,
  social,
  fileUpload
});
export default reducer;
