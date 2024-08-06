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
import { AnyAction } from "redux";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import {
  LOAD_TRAININGS,
  PAGINATE_TRAININGS,
  UPDATE_LEARNERSTATE_FILTERS,
  UPDATE_LOFORMAT_FILTERS,
  UPDATE_LOTYPES_FILTERS,
  UPDATE_SKILLNAME_FILTERS,
  UPDATE_TAGS_FILTERS,
  UPDATE_CITIES_FILTERS,
  UPDATE_SEARCH_TEXT,
  UPDATE_FILTERS_ON_LOAD,
  RESET_SEARCH_TEXT,
  UPDATE_SKILLLEVEL_FILTERS,
  UPDATE_DURATION_FILTERS,
  UPDATE_CATALOGS_FILTERS,
  UPDATE_PRICE_RANGE_FILTERS,
  UPDATE_PRICE_FILTERS,
  UPDATE_SNIPPET_TYPE,
  UPDATE_SNIPPET_ON_LOAD,
  OPEN_SNIPPET_TYPE_DIALOG,
  CLOSE_SNIPPET_TYPE_DIALOG,
  UPDATE_PRODUCTS_FILTERS,
  UPDATE_ROLES_FILTERS,
  UPDATE_LEVELS_FILTERS,
  UPDATE_ANNOUNCED_GROUPS_FILTERS,
  CLEAR_LEVELS,
  UPDATE_SORT,
  CLEAR_ALL,
  UPDATE_TRAININGS,
  LOAD_USER_SKILLS,
} from "./actionTypes";

export const loadTrainings = (payload: any): AnyAction => ({
  type: LOAD_TRAININGS,
  payload,
});
export const updateTrainings = (payload: any): AnyAction => ({
  type: UPDATE_TRAININGS,
  payload,
});
export const loadUserSkills = (payload: any): AnyAction => ({
  type: LOAD_USER_SKILLS,
  payload,
});
export const updateLoTypesFilter = (payload: string): AnyAction => ({
  type: UPDATE_LOTYPES_FILTERS,
  payload,
});

export const updateLearnerStateFilter = (payload: string): AnyAction => ({
  type: UPDATE_LEARNERSTATE_FILTERS,
  payload,
});

export const updateSkillNameFilter = (payload: { [key: string]: string }): AnyAction => ({
  type: UPDATE_SKILLNAME_FILTERS,
  payload,
});

export const updateSkillLevelFilter = (payload: string): AnyAction => ({
  type: UPDATE_SKILLLEVEL_FILTERS,
  payload,
});

export const updateLoFormatFilter = (payload: string): AnyAction => ({
  type: UPDATE_LOFORMAT_FILTERS,
  payload,
});

export const updateTagsFilter = (payload: string): AnyAction => ({
  type: UPDATE_TAGS_FILTERS,
  payload,
});

export const updateCitiesFilter = (payload: string): AnyAction => ({
  type: UPDATE_CITIES_FILTERS,
  payload,
});

export const updateProductsFilter = (payload: string): AnyAction => ({
  type: UPDATE_PRODUCTS_FILTERS,
  payload,
});

export const updateRolesFilter = (payload: string): AnyAction => ({
  type: UPDATE_ROLES_FILTERS,
  payload,
});

export const updateLevelsFilter = (payload: string): AnyAction => ({
  type: UPDATE_LEVELS_FILTERS,
  payload,
});

export const updateAnnouncedGroupsFilter = (payload: string): AnyAction => ({
  type: UPDATE_ANNOUNCED_GROUPS_FILTERS,
  payload,
});

export const clearLevelsFilter = (): AnyAction => ({
  type: CLEAR_LEVELS,
});

export const updateDurationFilter = (payload: any): AnyAction => ({
  type: UPDATE_DURATION_FILTERS,
  payload,
});

export const updateCatalogsFilter = (payload: any): AnyAction => ({
  type: UPDATE_CATALOGS_FILTERS,
  payload,
});

export const updateSearchText = (payload: string): AnyAction => ({
  type: UPDATE_SEARCH_TEXT,
  payload,
});

export const resetSearchText = (): AnyAction => ({
  type: RESET_SEARCH_TEXT,
  payload: "",
});

export const updateFiltersOnLoad = (payload: any): AnyAction => ({
  type: UPDATE_FILTERS_ON_LOAD,
  payload,
});

export const clearAllFilters = (): AnyAction => ({
  type: CLEAR_ALL,
});

export const paginateTrainings = (payload: {
  trainings: PrimeLearningObject[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_TRAININGS,
  payload,
});

export const updatePriceRangeFilter = (payload: any): AnyAction => ({
  type: UPDATE_PRICE_RANGE_FILTERS,
  payload,
});

export const updatePriceFilter = (payload: string): AnyAction => ({
  type: UPDATE_PRICE_FILTERS,
  payload,
});

export const updateSnippetType = (payload: any): AnyAction => ({
  type: UPDATE_SNIPPET_TYPE,
  payload,
});

export const updateSnippetOnLoad = (payload: any): AnyAction => ({
  type: UPDATE_SNIPPET_ON_LOAD,
  payload,
});

export const onOpenSearchInList = (payload: any): AnyAction => ({
  type: OPEN_SNIPPET_TYPE_DIALOG,
  payload,
});

export const onCloseSearchInList = (): AnyAction => ({
  type: CLOSE_SNIPPET_TYPE_DIALOG,
});

export const updateSortOrder = (payload: any): AnyAction => ({
  type: UPDATE_SORT,
  payload,
});
