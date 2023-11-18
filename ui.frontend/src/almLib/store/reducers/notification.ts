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
import { AnyAction, Reducer , combineReducers} from "redux";
import { PrimeAdminAnnouncement, PrimeUserNotification } from "../../models";

import {
  LOAD_ANNOUNCEMENT,
    LOAD_NOTIFICATIONS,
    PAGINATE_NOTIFICATIONS
  } from "../actions/notification/actionTypes";

  export interface NotificationState {
    notifications: PrimeUserNotification[] | null;
    next: string;
    announcements: PrimeAdminAnnouncement;
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
const announcements: Reducer<PrimeAdminAnnouncement  , AnyAction> = (
  state: PrimeAdminAnnouncement  | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_ANNOUNCEMENT: {
      return action?.payload || {};
    }
    default:
      return state || {};
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
    announcements,
  });
  
export  {notification};