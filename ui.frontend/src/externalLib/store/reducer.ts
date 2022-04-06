import { combineReducers } from "redux";
import { accessToken, user, account, catalog, social, fileUpload, notification, userSkillInterest, skill } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
  account,
  catalog,
  notification,
  social,
  fileUpload,
  userSkillInterest,
  skill
});
export default reducer;
