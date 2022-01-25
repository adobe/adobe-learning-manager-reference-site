import { combineReducers } from "redux";
import { accessToken, user } from "./reducers";

const reducer = combineReducers({
  accessToken,
  user,
});
export default reducer;
