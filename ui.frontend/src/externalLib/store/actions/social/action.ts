import { AnyAction } from "redux";
import { LOAD_BOARD_DETAILS, LOAD_COMMENTS, LOAD_REPLIES, PAGINATE_REPLIES, PAGINATE_SOCIAL_BOARD_POSTS, SOCIAL_CMT_DELETE_SUCCESS, SOCIAL_POST_DELETE_SUCCESS, SOCIAL_REPLY_DELETE_SUCCESS } from ".";
import { PrimeBoard, PrimePost, PrimeComment, PrimeReply } from "../../../models/PrimeModels";
import {
    LOAD_SOCIAL_BOARD,
    LOAD_SOCIAL_BOARDS,
    PAGINATE_SOCIAL_BOARDS,
    SOCIAL_ADD_BOARD_FAVORITE_SUCCESS,
    SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS,
    SOCIAL_BOARD_DELETE_SUCCESS,
    SET_SELECTED_POST,
    PAGINATE_COMMENTS,
    UPDATE_COMMENT,
    UPDATE_REPLY
} from "./actionTypes";

export const loadBoard = (payload: any): AnyAction => ({
  type: LOAD_SOCIAL_BOARD,
  payload,
});

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

export const deleteBoard = (payload: any): AnyAction => ({
  type: SOCIAL_BOARD_DELETE_SUCCESS,
  payload,
});

export const paginateBoards = (payload: {
  boards: PrimeBoard[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_SOCIAL_BOARDS,
  payload,
});


export const loadPosts = (payload: any): AnyAction => ({
  type: LOAD_BOARD_DETAILS,
  payload,
});

export const paginatePosts = (payload: {
  posts: PrimePost[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_SOCIAL_BOARD_POSTS,
  payload,
});

export const loadPost = (payload: any): AnyAction => ({
  type: SET_SELECTED_POST,
  payload,
});

export const loadComments = (payload: any): AnyAction => ({
  type: LOAD_COMMENTS,
  payload,
});

export const paginateComments = (payload: {
  comments: PrimeComment[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_COMMENTS,
  payload,
});

export const loadReplies = (payload: any): AnyAction => ({
  type: LOAD_REPLIES,
  payload,
});

export const paginateReplies = (payload: {
  replies: PrimeReply[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_REPLIES,
  payload,
});

export const deletePost = (payload: any): AnyAction => ({
  type: SOCIAL_POST_DELETE_SUCCESS,
  payload
});

export const deleteComment = (payload: any): AnyAction => ({
  type: SOCIAL_CMT_DELETE_SUCCESS,
  payload,
});

export const deleteReply = (payload: any): AnyAction => ({
  type: SOCIAL_REPLY_DELETE_SUCCESS,
  payload,
});

export const updateComment = (payload: any): AnyAction => ({
  type: UPDATE_COMMENT,
  payload,
});

export const updateReply = (payload: any): AnyAction => ({
  type: UPDATE_REPLY,
  payload,
});