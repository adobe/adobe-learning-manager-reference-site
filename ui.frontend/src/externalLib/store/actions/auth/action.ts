import { AUTHENTICATE_USER } from "./actionTypes";

export const updateAccessToken = (payload: string) => {
  return {
    type: AUTHENTICATE_USER,
    payload,
  };
};
