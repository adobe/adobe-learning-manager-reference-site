import { PrimeReplyCreationAttributes } from "../../models/PrimeModels";
import { AnyAction, combineReducers, Reducer } from "redux";
import {
    UPDATE_REPLY_TEXT,
    LOAD_REPLIES,
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
        case UPDATE_REPLY_TEXT:
            return action.text || "";
        case LOAD_REPLIES:
            return "";
        default:
            return state ? state : "";
    }
};
const reply: Reducer<
    PrimeReplyCreationAttributes,
    AnyAction
> = combineReducers({
    state,
    text,
});

export default reply;