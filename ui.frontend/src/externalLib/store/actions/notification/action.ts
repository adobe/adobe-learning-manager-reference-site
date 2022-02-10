import { AnyAction } from "redux";
import { PrimeUserNotification } from "../../../models/PrimeModels";
import {
  LOAD_NOTIFICATIONS,
  PAGINATE_NOTIFICATIONS,
} from "./actionTypes";

export const loadNotifications = (payload: any): AnyAction => ({
  type: LOAD_NOTIFICATIONS,
  payload,
});

export const paginateNotifications = (payload: {
    notifications: PrimeUserNotification[];
    next: string;
  }): AnyAction => ({
    type: PAGINATE_NOTIFICATIONS,
    payload,
  });
  