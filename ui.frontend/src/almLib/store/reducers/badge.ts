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
import { AnyAction, Reducer , combineReducers} from "redux";
import { PrimeUserBadge } from "../../models";
import { LOAD_BADGES, PAGINATE_BADGES } from "../actions/badge/actionTypes";

  export interface BadgeState {
    badges: PrimeUserBadge[] | null;
    next: string;
  }

const badges: Reducer<PrimeUserBadge[] | null, AnyAction> = (
  state: PrimeUserBadge[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_BADGES: {
      return action?.payload.badges;
    }
    case PAGINATE_BADGES: {
      return [...state!, ...action.payload?.badges];
    }
    default:
      return state || [];
  }
};

const next: Reducer<string, AnyAction> = (
    state: string | undefined,
    action: AnyAction
  ) => {
    switch (action.type) {
      case LOAD_BADGES:
      case PAGINATE_BADGES:
        return action.payload?.next;
      default:
        return state || "";
    }
  };


const badge: Reducer<BadgeState, AnyAction> = combineReducers({
    badges,
    next,
  });
  
export  {badge};