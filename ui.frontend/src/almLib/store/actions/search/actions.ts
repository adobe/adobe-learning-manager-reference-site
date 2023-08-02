import { AnyAction } from "redux";
import {
  CLOSE_AUTOCOMPLETE,
  CLOSE_SEARCH,
  OPEN_SEARCH,
  SET_SEARCH_SUGGESTIONS,
  SET_SEARCH_TERM,
} from "./actionTypes";

export const onOpenSearch = (payload: { e: MouseEvent }): AnyAction => ({
  type: OPEN_SEARCH,
  payload,
});

export const onCloseSearch = (payload: { e: MouseEvent }): AnyAction => ({
  type: CLOSE_SEARCH,
  payload,
});

export const showSuggestionsList = (payload: {
  userSearchHistory: string[] | null;
  popularSearches: string[] | null;
}): AnyAction => ({
  type: SET_SEARCH_SUGGESTIONS,
  payload,
});

export const closeSuggestionsList = (): AnyAction => ({
  type: CLOSE_AUTOCOMPLETE,
  payload: "",
});

export const searchInput = (payload: any): AnyAction => ({
  type: SET_SEARCH_TERM,
  payload,
});
