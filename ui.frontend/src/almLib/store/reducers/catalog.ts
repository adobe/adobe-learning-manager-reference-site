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
  UPDATE_PRICE_RANGE_FILTERS,
  UPDATE_SEARCH_TEXT,
  UPDATE_SKILLLEVEL_FILTERS,
  UPDATE_SKILLNAME_FILTERS,
  UPDATE_TAGS_FILTERS,
  UPDATE_CITIES_FILTERS,
  UPDATE_SNIPPET_TYPE,
  UPDATE_SNIPPET_ON_LOAD,
  OPEN_SNIPPET_TYPE_DIALOG,
  CLOSE_SNIPPET_TYPE_DIALOG,
  UPDATE_PRODUCTS_FILTERS,
  UPDATE_ROLES_FILTERS,
  UPDATE_LEVELS_FILTERS,
  UPDATE_SORT,
  UPDATE_ANNOUNCED_GROUPS_FILTERS,
  CLEAR_LEVELS,
  CLEAR_ALL,
  UPDATE_TRAININGS,
  LOAD_USER_SKILLS,
} from "../actions/catalog/actionTypes";

export const DEFUALT_FILTERS_VALUE = {
  loTypes: "course,learningProgram,certification,jobAid",
};

const COURSE_METADATA_SNIPPET =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview";
const NOTES_SNIPPET = "note";
const SKILL_SNIPPET = "skillName,skillDescription";
const BADGES_SNIPPET = "badgeName";
const TAGS_SNIPPET = "courseTag,moduleTag,jobAidTag,lpTag,certificationTag";
const DISCUSSION_SNIPPET = "discussion";

const lo_types = "loTypes";

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
  skillName: { [key: string]: boolean };
  tagName: { [key: string]: boolean };
  loTypes: string;
  learnerState: string;
  loFormat: string;
  duration: string;
  skillLevel: string;
  catalogs: string;
  price: string;
  priceRange: string;
  cities: string;
  products: string;
  roles: string;
  levels: string;
  announcedGroups: string;
}

export interface CatalogState {
  trainings: PrimeLearningObject[] | null;
  filterState: CatalogFilterState;
  sort: "name" | "date" | "-name" | "-date" | "effectiveness" | "rating" | "-rating" | "dueDate";
  next: string;
  query: string;
  snippetType: string;
  openSearchInDialog: boolean;
  userSkills: { [key: string]: boolean };
  autoCorrectMode: boolean;
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
    case UPDATE_TRAININGS:
      return action.payload?.trainings || [];
    default:
      return state || [];
  }
};

const sort: Reducer<
  "name" | "date" | "-name" | "-date" | "effectiveness" | "rating" | "-rating" | "dueDate",
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
    case UPDATE_SORT:
      return action.payload;
    default:
      return state || "-date";
  }
};

const skillName: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_SKILLNAME_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.skillName;
    case CLEAR_ALL:
      return {};
    default:
      return state || {};
  }
};

const userSkills: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_USER_SKILLS:
      return action.payload;
    default:
      return state || {};
  }
};

const tagName: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_TAGS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.tagName;
    case CLEAR_ALL:
      return {};
    default:
      return state || {};
  }
};

const cities: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_CITIES_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.cities;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const products: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_PRODUCTS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.products;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const roles: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_ROLES_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.roles;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const levels: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_LEVELS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.levels;
    case CLEAR_ALL:
    case CLEAR_LEVELS:
      // eslint-disable-next-line no-case-declarations
      return "";
    default:
      return state || "";
  }
};

const announcedGroups: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_ANNOUNCED_GROUPS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.announcedGroups;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const loTypes: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_LOTYPES_FILTERS:
      return action.payload || DEFUALT_FILTERS_VALUE[lo_types];
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.loTypes;
    case CLEAR_ALL:
      return DEFUALT_FILTERS_VALUE[lo_types];
    default:
      return state || DEFUALT_FILTERS_VALUE[lo_types];
  }
};

const learnerState: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_LEARNERSTATE_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.learnerState;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const loFormat: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_LOFORMAT_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.loFormat;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const duration: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_DURATION_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.duration;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const priceRange: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_PRICE_RANGE_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.priceRange;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const price: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_PRICE_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.price;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};

const query: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_SEARCH_TEXT:
      return action.payload.query || "";
    case RESET_SEARCH_TEXT:
      return action.payload;
    default:
      return state || "";
  }
};
const autoCorrectMode: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.autoCorrectMode === "false" ? false : true;
    case UPDATE_SEARCH_TEXT:
      return action.payload.autoCorrectMode ?? true;
    case RESET_SEARCH_TEXT:
      return true;
    default:
      return state ?? true;
  }
};
const snippetType: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
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

const next: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_LEARNERSTATE_FILTERS:
    case UPDATE_LOFORMAT_FILTERS:
    case UPDATE_LOTYPES_FILTERS:
    case UPDATE_SKILLNAME_FILTERS:
    case UPDATE_CATALOGS_FILTERS:
    case UPDATE_DURATION_FILTERS:
    case UPDATE_TAGS_FILTERS:
    case UPDATE_CITIES_FILTERS:
    case UPDATE_PRODUCTS_FILTERS:
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

const skillLevel: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_SKILLLEVEL_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.skillLevel;
    case CLEAR_ALL:
      return "";
    default:
      return state || "";
  }
};
const catalogs: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_CATALOGS_FILTERS:
      return action.payload;
    case UPDATE_FILTERS_ON_LOAD:
      return action.payload.catalogs;
    case CLEAR_ALL:
      return "";
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
  priceRange,
  cities,
  products,
  roles,
  levels,
  announcedGroups,
});

const catalog: Reducer<CatalogState, AnyAction> = combineReducers({
  trainings,
  sort,
  filterState,
  next,
  query,
  snippetType,
  userSkills,
  openSearchInDialog,
  autoCorrectMode,
});

export default catalog;
