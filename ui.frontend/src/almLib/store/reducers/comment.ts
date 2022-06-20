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
import { PrimeCommentCreationAttributes } from "../../models/PrimeModels";
import { AnyAction, combineReducers, Reducer } from "redux";
import {
    UPDATE_COMMENT_TEXT,
    LOAD_COMMENTS,
    // SET_CONTENT_TYPE,
    // REMOVE_CONTENT,
} from "../actions/social/actionTypes";

//TODO: use when comments support media
// const contentType: Reducer<
//     "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER",
//     AnyAction
// > = (
//     state: "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER" | undefined,
//     action: AnyAction
// ) => {
//     switch (action.type) {
//         case SET_CONTENT_TYPE:
//             return action.contentType;
//         case REMOVE_CONTENT:
//             return null;
//         default:
//             return state || null;
//     }
// };
// const data: Reducer<string, AnyAction> = (
//     state: string | null | undefined,
//     action: AnyAction
// ) => {
//     switch (action.type) {
//         default:
//             return "";
//     }
// };

// const resource: Reducer<
//     {
//         contentType: "VIDEO" | "URL" | "IMAGE" | "TEXT" | "FILE" | "OTHER";
//         data: string;
//     },
//     AnyAction
// > = combineReducers({ contentType, data });

const state: Reducer<"ACTIVE", AnyAction> = (
    state: "ACTIVE" | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        default:
            return "ACTIVE";
    }
};
const text: Reducer<string, AnyAction> = (
    state: string | null | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case UPDATE_COMMENT_TEXT:
            return action.text || "";
        case LOAD_COMMENTS:
            return "";
        default:
            return state ? state : "";
    }
};
const comment: Reducer<
    PrimeCommentCreationAttributes,
    AnyAction
> = combineReducers({
    state,
    text,
});

export default comment;