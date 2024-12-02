import { AnyAction } from "redux";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import {
  LOAD_TRAININGS_AUTHOR,
  PAGINATE_TRAININGS_AUTHOR,
  UPDATE_SORT_AUTHOR,
  UPDATE_TRAININGS_AUTHOR,
} from "./actionTypes";
export const loadTrainings = (payload: {
  trainings: PrimeLearningObject[];
  next: string;
}): AnyAction => ({
  type: LOAD_TRAININGS_AUTHOR,
  payload,
});
export const updateTrainingsAuthor = (payload: any): AnyAction => ({
  type: UPDATE_TRAININGS_AUTHOR,
  payload,
});
export const paginateTrainings = (payload: {
  trainings: PrimeLearningObject[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_TRAININGS_AUTHOR,
  payload,
});
export const updateSortOrder = (payload: any): AnyAction => ({
  type: UPDATE_SORT_AUTHOR,
  payload,
});
