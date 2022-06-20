/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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