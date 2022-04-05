import {
  LOAD_USER,
  LOAD_ACCOUNT_AND_USER,
  GET_USER_SKILL_INTEREST,
  PAGINATE_USER_SKILL_INTEREST,
  GET_SKILLS,
  PAGINATE_SKILLS,
  DELETE_USER_SKILL_INTEREST
} from "./actionTypes";

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

export const loadUserSkillInterest = (payload: any) => {
  return {
    type: GET_USER_SKILL_INTEREST,
    payload,
  };
};

export const paginateUserSkillInterest = (payload: any) => {
  return {
    type: PAGINATE_USER_SKILL_INTEREST,
    payload,
  };
};

export const loadSkills = (payload: any) => {
  return {
    type: GET_SKILLS,
    payload,
  };
};

export const paginateSkills = (payload: any) => {
  return {
    type: PAGINATE_SKILLS,
    payload,
  };
};

export const deleteUserSkillInterest = (payload: any) => {
  return {
    type: DELETE_USER_SKILL_INTEREST,
    payload,
  };
};