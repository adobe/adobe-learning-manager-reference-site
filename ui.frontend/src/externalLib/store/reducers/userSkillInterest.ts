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
import { AnyAction, combineReducers, Reducer } from "redux";
import {
  GET_USER_SKILL_INTEREST,
  PAGINATE_USER_SKILL_INTEREST,
  DELETE_USER_SKILL_INTEREST,
} from "../actions/user/actionTypes";
import { PrimeUserSkillInterest } from "../../models/PrimeModels";

export interface UserSkillInterestState {
  items: PrimeUserSkillInterest[];
  next: string;
}

const items: Reducer<PrimeUserSkillInterest[], AnyAction> = (
  state: PrimeUserSkillInterest[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_USER_SKILL_INTEREST:
      return action?.payload.items;
    case DELETE_USER_SKILL_INTEREST:
      return state?.filter(
        (item: PrimeUserSkillInterest) =>
          item.skill.id !== action.payload.skillId
      );
    case PAGINATE_USER_SKILL_INTEREST:
      return action.payload.items
        ? [...state!, ...action.payload.items]
        : state;
    default:
      return state || {};
  }
};

const next: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_USER_SKILL_INTEREST:
    case PAGINATE_USER_SKILL_INTEREST:
      return action?.payload.next;
    default:
      return state || null;
  }
};

const userSkillInterest: Reducer<UserSkillInterestState, AnyAction> =
  combineReducers({
    items,
    next,
  });

export default userSkillInterest;
