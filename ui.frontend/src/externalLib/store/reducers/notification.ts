import { AnyAction, Reducer , combineReducers} from "redux";
import { PrimeUserNotification } from "../../models";

import {
    LOAD_NOTIFICATIONS,
    PAGINATE_NOTIFICATIONS
  } from "../actions/notification/actionTypes";

  export interface NotificationState {
    notifications: PrimeUserNotification[] | null;
    next: string;
  }

const notifications: Reducer<PrimeUserNotification[] | null, AnyAction> = (
  state: PrimeUserNotification[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS: {
      return action?.payload.notifications;
    }
    case PAGINATE_NOTIFICATIONS: {
      return [...state!, ...action.payload?.notifications];
    }
    default:
      return state || [];
  }
};

const next: Reducer<string, AnyAction> = (
    state: string | undefined,
    action: AnyAction
  ) => {
    switch (action.type) {
      case LOAD_NOTIFICATIONS:
      case PAGINATE_NOTIFICATIONS:
        return action.payload?.next;
      default:
        return state || "";
    }
  };


const notification: Reducer<NotificationState, AnyAction> = combineReducers({
    notifications,
    next,
  });
  
export  {notification};