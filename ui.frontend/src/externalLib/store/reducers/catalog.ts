import { AEMLearnLearningObject } from "../../models";

import { AnyAction, Reducer, combineReducers } from "redux";

export interface CatalogFilterState {
  skills: { [key: string]: boolean };
  tags: { [key: string]: boolean };
  types: { [key: string]: boolean };
  statuses: { [key: string]: boolean };
  formats: { [key: string]: boolean };
  duration: { [key: string]: boolean };
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

const skills: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const tags: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const types: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const statuses: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const formats: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const duration: Reducer<{ [key: string]: boolean }, AnyAction> = (
  state: { [key: string]: boolean } | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    default:
      return state || {};
  }
};

const filterState: Reducer<CatalogFilterState, AnyAction> = combineReducers({
  skills,
  tags,
  types,
  statuses,
  formats,
  duration,
});

const catalog: Reducer<CatalogState, AnyAction> = combineReducers({
  items,
  filterState,
  sort,
});

export default catalog;
