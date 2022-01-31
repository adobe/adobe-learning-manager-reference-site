import { AEMLearnLearningObject } from "../../models";

import { AnyAction, Reducer, combineReducers } from "redux";

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
    case "FETCH_TRAININGS":
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
    case "UPDATE_SKILLNAME_FILTERS":
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
    case "UPDATE_LOTYPES_FILTERS":
      return action.payload || "course,learningProgram,certification,jobAid";
    default:
      return state || "course,learningProgram,certification,jobAid";
  }
};

const learnerState: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case "UPDATE_LEARNERSTATE_FILTERS":
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
