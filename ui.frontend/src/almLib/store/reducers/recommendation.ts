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
  GET_RECOMMENDATION_LEVELS,
  GET_RECOMMENDATION_PRODUCTS,
  GET_RECOMMENDATION_ROLES,
} from "../actions/user/actionTypes";
import { PrimeData, PrimeUserRecommendationCriteria } from "../../models/PrimeModels";

export interface RecommendationState {
  products: PrimeUserRecommendationCriteria[];
  roles: PrimeUserRecommendationCriteria[];
  levels: PrimeData;
}

const products: Reducer<PrimeUserRecommendationCriteria[], AnyAction> = (
  state: PrimeUserRecommendationCriteria[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_RECOMMENDATION_PRODUCTS:
      return action?.payload.items;
    default:
      return state || {};
  }
};

const roles: Reducer<PrimeUserRecommendationCriteria[], AnyAction> = (
  state: PrimeUserRecommendationCriteria[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_RECOMMENDATION_ROLES:
      return action?.payload.items;
    default:
      return state || {};
  }
};

const levels: Reducer<PrimeData, AnyAction> = (state: PrimeData | undefined, action: AnyAction) => {
  switch (action.type) {
    case GET_RECOMMENDATION_LEVELS:
      return action?.payload.items;
    default:
      return state || {};
  }
};

const recommendation: Reducer<RecommendationState, AnyAction> = combineReducers({
  products,
  roles,
  levels,
});

export default recommendation;
