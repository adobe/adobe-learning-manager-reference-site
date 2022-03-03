import { AnyAction, combineReducers, Reducer } from "redux";
import {
    SET_UPLOAD_NAME,
    SET_UPLOAD_PROGRESS,
    RESET_UPLOAD
} from "../actions/fileUpload/actionTypes";
import { 
    PrimeFileUpload
} from "../../models/PrimeModels";

export interface FileUpload {
	fileName: string;
	uploadProgress: number;
}

const fileName: Reducer<string, AnyAction> = (
    state: string | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_UPLOAD_NAME:
            return action.value;
        case RESET_UPLOAD:
        // case REMOVE_CONTENT:
            return null;
        default:
            return state || null;
    }
};
const uploadProgress: Reducer<number, AnyAction> = (
    state: number | undefined,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_UPLOAD_PROGRESS:
            return action.value;
        case RESET_UPLOAD:
        // case ActionTypes.REMOVE_CONTENT:
            return null;
        default:
            return state || null;
    }
};

const fileUpload: Reducer<PrimeFileUpload, AnyAction> = combineReducers({
    fileName,
    uploadProgress,
});

export default fileUpload;