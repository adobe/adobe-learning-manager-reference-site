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
import { GET_SKILLS, PAGINATE_SKILLS } from "../actions/user/actionTypes";
import { PrimeSkill } from "../../models/PrimeModels";

export interface SkillState {
  items: PrimeSkill[];
  next: string;
}

const items: Reducer<PrimeSkill[], AnyAction> = (
  state: PrimeSkill[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_SKILLS:
      return action?.payload.items;
    case PAGINATE_SKILLS:
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
    case GET_SKILLS:
    case PAGINATE_SKILLS:
      return action?.payload.next;
    default:
      return state || null;
  }
};

const skill: Reducer<SkillState, AnyAction> = combineReducers({
  items,
  next,
});

export default skill;
