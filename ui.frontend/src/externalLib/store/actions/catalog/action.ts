import { AnyAction } from "redux";
import { AEMLearnLearningObject } from "../../../models/AEMLearnModels";
import {
  LOAD_TRAININGS,
  UPDATE_LEARNERSTATE_FILTERS,
  UPDATE_LOFORMAT_FILTERS,
  UPDATE_LOTYPES_FILTERS,
  UPDATE_SKILLNAME_FILTERS,
} from "./actionTypes";

export const loadTrainings = (
  payload: AEMLearnLearningObject[]
): AnyAction => ({
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

export const updateLoFormatFilter = (payload: string): AnyAction => ({
  type: UPDATE_LOFORMAT_FILTERS,
  payload,
});
