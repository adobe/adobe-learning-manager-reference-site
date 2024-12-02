import { PrimeLearningObject } from "../../models";

import { AnyAction, Reducer, combineReducers } from "redux";
import {
  LOAD_TRAININGS_AUTHOR,
  PAGINATE_TRAININGS_AUTHOR,
  UPDATE_SORT_AUTHOR,
  UPDATE_TRAININGS_AUTHOR,
} from "../actions/author/actionTypes";
export interface authorState {
  trainings: PrimeLearningObject[] | null;
  next: string;
  sort: "name" | "date" | "-name" | "-date" | "effectiveness" | "rating" | "-rating" | "dueDate";
}

const trainings: Reducer<PrimeLearningObject[] | null, AnyAction> = (
  state: PrimeLearningObject[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_TRAININGS_AUTHOR:
      return action.payload?.trainings || [];
    case PAGINATE_TRAININGS_AUTHOR:
      return [...state!, ...action.payload?.trainings];
    case UPDATE_TRAININGS_AUTHOR:
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
    case UPDATE_SORT_AUTHOR:
      return action.payload;
    default:
      return state || "-date";
  }
};

const next: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case LOAD_TRAININGS_AUTHOR:
    case PAGINATE_TRAININGS_AUTHOR:
      return action.payload?.next || "";
    default:
      return state || "";
  }
};

const authorTrainings: Reducer<authorState, AnyAction> = combineReducers({
  trainings,
  next,
  sort,
});

export default authorTrainings;
