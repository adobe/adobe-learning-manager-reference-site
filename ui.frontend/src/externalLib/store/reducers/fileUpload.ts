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