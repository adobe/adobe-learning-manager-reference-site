import { LOAD_USER } from "./actionTypes";

export const loadUser = (payload: string) => {
  return {
    type: LOAD_USER,
    payload,
  };
};
