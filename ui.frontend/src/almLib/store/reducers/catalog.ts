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
import { PrimeLearningObject } from "../../models";

import { AnyAction, Reducer, combineReducers } from "redux";
import {
  LOAD_TRAININGS,
  PAGINATE_TRAININGS,
  RESET_SEARCH_TEXT,
  UPDATE_CATALOGS_FILTERS,
  UPDATE_DURATION_FILTERS,
  UPDATE_FILTERS_ON_LOAD,
  UPDATE_LEARNERSTATE_FILTERS,
  UPDATE_LOFORMAT_FILTERS,
  UPDATE_LOTYPES_FILTERS,
  UPDATE_PRICE_FILTERS,
  UPDATE_SEARCH_TEXT,
  UPDATE_SKILLLEVEL_FILTERS,
  UPDATE_SKILLNAME_FILTERS,
  UPDATE_TAGS_FILTERS,
  UPDATE_CITIES_FILTERS,
  UPDATE_SNIPPET_TYPE,
  UPDATE_SNIPPET_ON_LOAD,
  OPEN_SNIPPET_TYPE_DIALOG,
  CLOSE_SNIPPET_TYPE_DIALOG,
} from "../actions/catalog/actionTypes";

export const DEFUALT_FILTERS_VALUE = {
  loTypes: "course,learningProgram,certification,jobAid",
};

const COURSE_METADATA_SNIPPET =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview";
const NOTES_SNIPPET = "note";
const SKILL_SNIPPET = "skillName,skillDescription";
const BADGES_SNIPPET = "badgeName";
const TAGS_SNIPPET =
  "courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag";
const DISCUSSION_SNIPPET = "discussion";

export interface SearchDropdownFilterItem {
  value: string;
  label: string;
  checked: boolean;
}

export const defaultSearchInDropdownList = [
  {
    value: COURSE_METADATA_SNIPPET,
    label: "alm.text.courseMetadata",
    checked: true,
  },
  {
    value: NOTES_SNIPPET,
    label: "alm.text.notes",
    checked: true,
  },
  {
    value: SKILL_SNIPPET,
    label: "alm.catalog.filter.skills.label",
    checked: true,
  },
  {
    value: BADGES_SNIPPET,
    label: "alm.overview.badge",
    checked: true,
  },
  {
    value: TAGS_SNIPPET,
    label: "alm.catalog.filter.tags.label",
    checked: true,
  },
];

export interface CatalogFilterState {
  skillName: string;
  tagName: string;
  loTypes: string;
  learnerState: string;
  loFormat: string;
  duration: string;
  skillLevel: string;
  catalogs: string;
  price: string;
  cities: string;
}

export interface CatalogState {
  trainings: PrimeLearningObject[] | null;
  filterState: CatalogFilterState;
  sort:
    | "name"
    | "date"
    | "-name"
    | "-date"
    | "effectiveness"
    | "rating"
    | "-rating"
    | "dueDate";
  next: string;
  query: string;
  snippetType: string;
  openSearchInDialog: boolean;
  // paginating: boolean;
}

const trainings: Reducer<PrimeLearningObject[] | null, AnyAction> = (
  state: PrimeLearningObject[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_TRAININGS:
      return action.payload?.trainings || [];
    case PAGINATE_TRAININGS:
      return [...state!, ...action.payload?.trainings];
    default:
      return state || [];
  }
};

const sort: Reducer<
  | "name"
  | "date"
  | "-name"
  | "-date"
  | "effectiveness"
  | "rating"
  | "-rating"
  | "dueDate",
  AnyAction
> = (
  state:
    | "name"
    | "date"
    | "-name"
    | "-date"
    | "effectiveness"
    | "rating"
    | "-rating"
    | "dueDate"
    | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || "-date";
  }
};

const skillName: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_SKILLNAME_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.skillName;
    default:
      return state || "";
  }
};

const tagName: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_TAGS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.tagName;
    default:
      return state || "";
  }
};

const cities: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_CITIES_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.cities;
    default:
      return state || "";
  }
};

const loTypes: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_LOTYPES_FILTERS:
      return action.payload || DEFUALT_FILTERS_VALUE["loTypes"];
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.loTypes;
    default:
      return state || DEFUALT_FILTERS_VALUE["loTypes"];
  }
};

const learnerState: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_LEARNERSTATE_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.learnerState;
    default:
      return state || "";
  }
};

const loFormat: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_LOFORMAT_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.loFormat;
    default:
      return state || "";
  }
};

const duration: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_DURATION_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.duration;
    default:
      return state || "";
  }
};

const price: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_PRICE_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.price;
    default:
      return state || "";
  }
};

const query: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_SEARCH_TEXT:
      return action.payload;
    case RESET_SEARCH_TEXT:
      return action.payload;
    default:
      return state || "";
  }
};

const snippetType: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_SNIPPET_TYPE:
      if (action.payload) {
        return `${action.payload},${DISCUSSION_SNIPPET}`;
      } else {
        return DISCUSSION_SNIPPET;
      }
    case UPDATE_SNIPPET_ON_LOAD:
      return action.payload;
    default:
      return state || "";
  }
};

const openSearchInDialog: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_SNIPPET_TYPE_DIALOG:
      return true;
    case CLOSE_SNIPPET_TYPE_DIALOG:
      return false;
    default:
      return state ? state : false;
  }
};

const next: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_LEARNERSTATE_FILTERS:
    case UPDATE_LOFORMAT_FILTERS:
    case UPDATE_LOTYPES_FILTERS:
    case UPDATE_SKILLNAME_FILTERS:
    case UPDATE_CATALOGS_FILTERS:
    case UPDATE_DURATION_FILTERS:
    case UPDATE_TAGS_FILTERS:
    case UPDATE_CITIES_FILTERS:
    case UPDATE_SKILLLEVEL_FILTERS:
    case UPDATE_SEARCH_TEXT:
    case RESET_SEARCH_TEXT:
      return "";

    case LOAD_TRAININGS:
    case PAGINATE_TRAININGS:
      return action.payload?.next || "";
    default:
      return state || "";
  }
};

const skillLevel: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_SKILLLEVEL_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.skillLevel;
    default:
      return state || "";
  }
};
const catalogs: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_CATALOGS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.catalogs;
    default:
      return state || "";
  }
};

const filterState: Reducer<CatalogFilterState, AnyAction> = combineReducers({
  skillName,
  tagName,
  loTypes,
  learnerState,
  loFormat,
  duration,
  skillLevel,
  catalogs,
  price,
  cities,
});

const catalog: Reducer<CatalogState, AnyAction> = combineReducers({
  trainings,
  sort,
  filterState,
  next,
  query,
  snippetType,
  openSearchInDialog,
});

export default catalog;
