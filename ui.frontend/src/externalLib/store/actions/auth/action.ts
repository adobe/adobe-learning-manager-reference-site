import { AnyAction } from "redux";
import { AUTHENTICATE_USER } from "./actionTypes";

export const updateAccessToken = (payload: string): AnyAction => ({
  type: AUTHENTICATE_USER,
  payload,
});
