import { AnyAction, combineReducers, Reducer } from "redux";
import {
  GET_USER_SKILL_INTEREST,
  PAGINATE_USER_SKILL_INTEREST,
  DELETE_USER_SKILL_INTEREST,
} from "../actions/user/actionTypes";
import { PrimeUserSkillInterest } from "../../models/PrimeModels";

export interface UserSkillInterestState {
  items: PrimeUserSkillInterest[];
  next: string;
}

const items: Reducer<PrimeUserSkillInterest[], AnyAction> = (
  state: PrimeUserSkillInterest[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_USER_SKILL_INTEREST:
      return action?.payload.items;
    case DELETE_USER_SKILL_INTEREST:
      return state?.filter(
        (item: PrimeUserSkillInterest) =>
          item.skill.id !== action.payload.skillId
      );
    case PAGINATE_USER_SKILL_INTEREST:
      return action.payload.items
        ? [...state!, ...action.payload.items]
        : state;
    default:
      return state || {};
  }
};

const next: Reducer<string, AnyAction> = (
  state: string | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_USER_SKILL_INTEREST:
    case PAGINATE_USER_SKILL_INTEREST:
      return action?.payload.next;
    default:
      return state || null;
  }
};

const userSkillInterest: Reducer<UserSkillInterestState, AnyAction> =
  combineReducers({
    items,
    next,
  });

export default userSkillInterest;
