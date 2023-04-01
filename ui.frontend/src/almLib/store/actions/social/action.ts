/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { AnyAction } from "redux";
import {
  PrimeBoard,
  PrimePost,
  PrimeComment,
  PrimeReply,
} from "../../../models/PrimeModels";
import {
  LOAD_BOARD_DETAILS,
  LOAD_COMMENTS,
  LOAD_REPLIES,
  PAGINATE_REPLIES,
  PAGINATE_SOCIAL_BOARD_POSTS,
  SOCIAL_CMT_DELETE_SUCCESS,
  SOCIAL_POST_DELETE_SUCCESS,
  SOCIAL_REPLY_DELETE_SUCCESS,
  LOAD_SOCIAL_BOARD,
  LOAD_SOCIAL_BOARDS,
  PAGINATE_SOCIAL_BOARDS,
  SOCIAL_ADD_BOARD_FAVORITE_SUCCESS,
  SOCIAL_REMOVE_BOARD_FAVORITE_SUCCESS,
  SOCIAL_BOARD_DELETE_SUCCESS,
  SET_SELECTED_POST,
  PAGINATE_COMMENTS,
  UPDATE_COMMENT,
  UPDATE_REPLY,
  UPDATE_POST,
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
  items: PrimeBoard[];
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
  items: PrimePost[];
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
  items: PrimeComment[];
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
  items: PrimeReply[];
  next: string;
}): AnyAction => ({
  type: PAGINATE_REPLIES,
  payload,
});

export const deletePost = (payload: any): AnyAction => ({
  type: SOCIAL_POST_DELETE_SUCCESS,
  payload,
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

export const updatePost = (payload: any): AnyAction => ({
  type: UPDATE_POST,
  payload,
});
