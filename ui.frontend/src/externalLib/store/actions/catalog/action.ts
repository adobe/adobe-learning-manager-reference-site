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
  UPDATE_SEARCH_TEXT,
  UPDATE_FILTERS_ON_LOAD,
  RESET_SEARCH_TEXT,
  UPDATE_SKILLLEVEL_FILTERS,
  UPDATE_DURATION_FILTERS,
  UPDATE_CATALOGS_FILTERS
} from "./actionTypes";

export const loadTrainings = (payload: any): AnyAction => ({
  type: LOAD_TRAININGS,
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

export const updateSkillNameFilter = (payload: string): AnyAction => ({
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
  payload: ""
});

export const updateFiltersOnLoad = (payload: any): AnyAction => ({
  type: UPDATE_FILTERS_ON_LOAD,
  payload,
});


export const paginateTrainings = (payload: {
  trainings: PrimeLearningObject[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_TRAININGS,
  payload,
});
