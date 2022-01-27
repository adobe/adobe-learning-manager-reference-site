import { LOAD_USER,LOAD_ACCOUNT_AND_USER } from "./actionTypes";

export const loadUser = (payload: string) => {
  return {
    type: LOAD_USER,
    payload,
  };
};

export const initAccountUser = (payload: string) => {
  return {
    type: LOAD_ACCOUNT_AND_USER,
    payload,
  };
};
