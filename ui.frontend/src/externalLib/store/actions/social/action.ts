import { AnyAction } from "redux";
import { PrimeBoard } from "../../../models/PrimeModels";
import {
    LOAD_SOCIAL_BOARDS,
    PAGINATE_SOCIAL_BOARDS,
    SOCIAL_ADD_BOARD_FAVORITE_SUCCESS,
    SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS
} from "./actionTypes";

export const loadBoards = (payload: any): AnyAction => ({
  type: LOAD_SOCIAL_BOARDS,
  payload,
});

export const addBoardToFavourites = (payload: any): AnyAction => ({
  type: SOCIAL_ADD_BOARD_FAVORITE_SUCCESS,
  payload,
});

export const removeBoardFromFavourites = (payload: any): AnyAction => ({
  type: SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS,
  payload,
});

export const paginateBoards = (payload: {
  boards: PrimeBoard[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_SOCIAL_BOARDS,
  payload,
});
