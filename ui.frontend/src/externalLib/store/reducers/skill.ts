import { AnyAction, combineReducers, Reducer } from "redux";
import { GET_SKILLS, PAGINATE_SKILLS } from "../actions/user/actionTypes";
import { PrimeSkill } from "../../models/PrimeModels";

export interface SkillState {
  items: PrimeSkill[];
  next: string;
}

const items: Reducer<PrimeSkill[], AnyAction> = (
  state: PrimeSkill[] | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case GET_SKILLS:
      return action?.payload.items;
    case PAGINATE_SKILLS:
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
    case GET_SKILLS:
    case PAGINATE_SKILLS:
      return action?.payload.next;
    default:
      return state || null;
  }
};

const skill: Reducer<SkillState, AnyAction> = combineReducers({
  items,
  next,
});

export default skill;
