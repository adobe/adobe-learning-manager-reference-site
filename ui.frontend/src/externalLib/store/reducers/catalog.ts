import { AEMLearnLearningObject } from "../../models";

import { AnyAction, Reducer, combineReducers } from "redux";
import {
  LOAD_TRAININGS,
  UPDATE_LEARNERSTATE_FILTERS,
  UPDATE_LOFORMAT_FILTERS,
  UPDATE_LOTYPES_FILTERS,
  UPDATE_SKILLNAME_FILTERS,
} from "../actions/catalog/actionTypes";

export const DEFUALT_FILTERS_VALUE = {
  loTypes: "course,learningProgram,certification,jobAid",
};
export interface CatalogFilterState {
  skillName: string;
  tagName: string;
  loTypes: string;
  learnerState: string;
  loFormat: string;
  duration: string;
}

export interface CatalogState {
  items: AEMLearnLearningObject[] | null;
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
  //   cursor: string | null;
  //   paginating: boolean;
}

const items: Reducer<AEMLearnLearningObject[] | null, AnyAction> = (
  state: AEMLearnLearningObject[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_TRAININGS:
      return action.payload;
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
    default:
      return state || "";
  }
};

const tagName: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
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
    default:
      return state || "";
  }
};

const duration: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
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
});

const catalog: Reducer<CatalogState, AnyAction> = combineReducers({
  items,
  sort,
  filterState,
});

export default catalog;
