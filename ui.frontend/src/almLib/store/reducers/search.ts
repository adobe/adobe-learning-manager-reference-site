import { AnyAction, combineReducers, Reducer } from "redux";
import {
  CLOSE_AUTOCOMPLETE,
  CLOSE_SEARCH,
  OPEN_SEARCH,
  SET_SEARCH_SUGGESTIONS,
  SET_SEARCH_TERM,
} from "../actions/search/actionTypes";

export interface SearchState {
  searching: boolean;
  autocomplete: boolean;
  userSearchHistory: string[] | null;
  popularSearches: string[] | null;
}

const searching: Reducer<boolean, AnyAction> = (state: boolean | undefined, action: AnyAction) => {
  switch (action.type) {
    case OPEN_SEARCH:
      return true;
    case CLOSE_SEARCH:
      return false;
    default:
      return state ? state : false;
  }
};

const autocomplete: Reducer<boolean, AnyAction> = (
  state: boolean | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case OPEN_SEARCH:
    case SET_SEARCH_SUGGESTIONS:
      return true;
    case CLOSE_AUTOCOMPLETE:
    case CLOSE_SEARCH:
      return false;
    default:
      return state ? state : false;
  }
};

const userSearchHistory: Reducer<string[] | null, AnyAction> = (
  state: string[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SEARCH_SUGGESTIONS:
      if (action.payload.userSearchHistory) {
        return action.payload.userSearchHistory;
      } else {
        return state ? state : [];
      }
    case CLOSE_SEARCH:
      return [];
    default:
      return state ? state : [];
  }
};

const popularSearches: Reducer<string[] | null, AnyAction> = (
  state: string[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case SET_SEARCH_SUGGESTIONS:
      if (action.payload.popularSearches) {
        return action.payload.popularSearches;
      } else {
        return state ? state : [];
      }
    case CLOSE_SEARCH:
      return [];
    default:
      return state ? state : [];
  }
};

const search: Reducer<SearchState, AnyAction> = combineReducers({
  searching,
  autocomplete,
  userSearchHistory,
  popularSearches,
});

export default search;
