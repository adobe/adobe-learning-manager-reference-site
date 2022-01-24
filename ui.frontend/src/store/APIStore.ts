
import { createStore } from "redux";
import rootReducer from "../externalLib/store/rootReducer";

//import { composeWithDevTools } from "redux-devtools-extension";


const initialState = {};
const store = createStore(
    rootReducer,
  initialState as never,
  //composeWithDevTools(),
);
console.log("reducer", rootReducer);
export default store;
