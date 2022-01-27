import { createStore } from "redux";
import { reducer } from "../externalLib";

//import { composeWithDevTools } from "redux-devtools-extension";

const initialState = {};
const store = createStore(
  reducer,
  initialState as never
  //composeWithDevTools(),
);
export default store;
