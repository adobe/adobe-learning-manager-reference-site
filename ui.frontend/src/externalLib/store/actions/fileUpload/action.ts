import { AnyAction } from "redux";
import {
    SET_UPLOAD_NAME,
    SET_UPLOAD_PROGRESS,
    RESET_UPLOAD
} from "./actionTypes";

export const setUploadName = (payload: any): AnyAction => ({
  type: SET_UPLOAD_NAME,
  payload,
});

export const setUploadProgress = (payload: any): AnyAction => ({
  type: SET_UPLOAD_PROGRESS,
  payload,
});

export const resetUpload = (payload: any): AnyAction => ({
  type: RESET_UPLOAD,
  payload,
});