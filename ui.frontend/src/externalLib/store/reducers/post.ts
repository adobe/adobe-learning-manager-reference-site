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
import {
    PrimePostCreationAttributes,
    PrimePostMetaData,
    PrimeSearchResult
} from "../../models/PrimeModels";
import { AnyAction, combineReducers, Reducer } from "redux";
import {
    DISMISS_PANEL,
    SELECT_BOARD,
    SET_BOARD_FROM_DETAILS,
    CLEAR_SELECT_BOARD,
    CLOSE_CREATE_POST,
    NAVIGATE_TO,
    OPEN_BOARDS_SELECTION,
    CLOSE_BOARDS_SELECTION,
    SET_CREATEPOST_SOCIAL_SEARCH_RESULTS,
    PAGINATE_SOCIAL_SEARCH_BOARDS,
    CLEAR_SOCIAL_SEARCH_RESULTS,
    PAGINATION_START_SOCIAL_SEARCH_BOARDS,
    SET_POST_TYPE,
    SET_CONTENT_TYPE,
    REMOVE_CONTENT,
    SET_POST_TEXT,
    UPDATE_CREATEPOST_PREVIEW_DATA
 } from "../actions/social/actionTypes";
 import { CreatePostDetails, SocialSearchResultList } from "../reducers/social"

const boardId: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SELECT_BOARD:
        case SET_BOARD_FROM_DETAILS:
            return action.id;
        case CLEAR_SELECT_BOARD:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state ? state : "";
    }
};

const boardName: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SELECT_BOARD:
        case SET_BOARD_FROM_DETAILS:
            return action.name;
        case CLEAR_SELECT_BOARD:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state ? state : "";
    }
};

const boardSkill: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SELECT_BOARD:
        case SET_BOARD_FROM_DETAILS:
            return action.skill;
        case CLEAR_SELECT_BOARD:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state ? state : "";
    }
};
const isBoardFixed: Reducer<boolean, AnyAction> = (
    state: boolean | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SELECT_BOARD:
            return false;
        case SET_BOARD_FROM_DETAILS:
            return true;
        case CLEAR_SELECT_BOARD:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return false;
        default:
            return state ? state : false;
    }
};
const boardSelectionOpen: Reducer<boolean, AnyAction> = (
    state: boolean | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case OPEN_BOARDS_SELECTION:
            return true;
        case CLOSE_BOARDS_SELECTION:
        case DISMISS_PANEL:
        case CLOSE_CREATE_POST:
            return false;
        default:
            return state || false;
    }
};

const searchBoards: Reducer<PrimeSearchResult[], AnyAction> = (
    state: PrimeSearchResult[] | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CREATEPOST_SOCIAL_SEARCH_RESULTS:
            return action.data;
        case PAGINATE_SOCIAL_SEARCH_BOARDS:
            return [...state!, ...action.data];
        case CLEAR_SOCIAL_SEARCH_RESULTS:
        case DISMISS_PANEL:
        case CLOSE_CREATE_POST:
            return null;
        default:
            return state ? state : null;
    }
};
const searchTerm: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CREATEPOST_SOCIAL_SEARCH_RESULTS:
            return action.term || null;
        case CLEAR_SOCIAL_SEARCH_RESULTS:
        case DISMISS_PANEL:
        case CLOSE_CREATE_POST:
            return "";
        default:
            return state ? state : "";
    }
};
const searchNext: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CREATEPOST_SOCIAL_SEARCH_RESULTS:
        case PAGINATE_SOCIAL_SEARCH_BOARDS:
            return action.next || null;
        case CLEAR_SOCIAL_SEARCH_RESULTS:
        case DISMISS_PANEL:
        case CLOSE_CREATE_POST:
            return "";
        default:
            return state ? state : "";
    }
};
const searchPaginating: Reducer<boolean, AnyAction> = (
    state: boolean | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case PAGINATION_START_SOCIAL_SEARCH_BOARDS:
            return true;
        case PAGINATE_SOCIAL_SEARCH_BOARDS:
        case CLOSE_CREATE_POST:
            return false;
        default:
            return state || false;
    }
};
const socialSearchResults: Reducer<
    SocialSearchResultList,
    AnyAction
> = combineReducers({ searchTerm, searchBoards, searchNext, searchPaginating });

const postingType: Reducer<"DEFAULT" | "QUESTION" | "POLL", AnyAction> = (
    state: "DEFAULT" | "QUESTION" | "POLL" | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_POST_TYPE:
            return action.value;
        case SET_CONTENT_TYPE:
        case CLOSE_CREATE_POST:
            return "DEFAULT";
        default:
            return state || "DEFAULT";
    }
};
const contentType: Reducer<
    "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER",
    AnyAction
> = (
    state: "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER" | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CONTENT_TYPE:
            return action.contentType;
        case REMOVE_CONTENT:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state || null;
    }
};
const data: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CONTENT_TYPE:
            return action.data;
        case REMOVE_CONTENT:
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state ? state : "";
    }
};

const resource: Reducer<
    {
        contentType: "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER";
        data: string;
    },
    AnyAction
> = combineReducers({ contentType, data });

const state: Reducer<"ACTIVE", AnyAction> = (
    state: "ACTIVE" | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        default:
            return state ? state : "ACTIVE";
    }
};
const text: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_POST_TEXT:
            return action.text || "";
        case CLOSE_CREATE_POST:
        case NAVIGATE_TO:
            return null;
        default:
            return state ? state : "";
    }
};
const attributes: Reducer<PrimePostCreationAttributes, AnyAction> = combineReducers({
    postingType,
    resource,
    state,
    text,
});
const previewData: Reducer<PrimePostMetaData, AnyAction> = (
    state: PrimePostMetaData | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case UPDATE_CREATEPOST_PREVIEW_DATA:
            return action.data;
        case CLOSE_CREATE_POST:
            return null;
        default:
            return state || null;
    }
};
const post: Reducer<CreatePostDetails, AnyAction> = combineReducers({
    boardId,
    boardName,
    boardSkill,
    isBoardFixed,
    boardSelectionOpen,
    socialSearchResults,
    attributes,
    previewData,
});

export default post;