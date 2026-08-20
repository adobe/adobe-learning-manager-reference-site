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
import { AnyAction, Reducer, combineReducers } from 'redux';
import { PrimeAdminAnnouncement, PrimeUserNotification } from '../../models';

import {
  LOAD_ANNOUNCEMENT,
  LOAD_NOTIFICATIONS,
  PAGINATE_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
  UPDATE_UNREAD_COUNT,
} from '../actions/notification/actionTypes';
import { GetTranslation } from '../../utils/translationService';

export interface NotificationState {
  notifications: PrimeUserNotification[] | null;
  next: string;
  announcements: PrimeAdminAnnouncement;
  unreadCount: number;
}

const notifications: Reducer<PrimeUserNotification[] | null, AnyAction> = (
  state: PrimeUserNotification[] | null | undefined,
  action: AnyAction
) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS: {
      // If we're updating existing notifications
      if (state && action.payload.isUpdate) {
        return state.map(notification => {
          const updatedNotification = action.payload.notifications.find(
            (n: PrimeUserNotification) => n.id === notification.id
          );
          return updatedNotification || notification;
        });
      }
      // For initial load or refresh
      return action.payload.notifications || [];
    }
    case PAGINATE_NOTIFICATIONS: {
      if (!state) return action.payload.notifications;
      return [...state, ...(action.payload.notifications || [])];
    }
    case UPDATE_NOTIFICATION: {
      return state!.map(notification =>
        notification.id === action.payload.id
          ? {
              id: notification.id,
              _transient: notification._transient,
              actionTaken: true,
              channel: notification.channel,
              dateCreated: notification.dateCreated,
              message: GetTranslation('text.feedbackForCourse', true),
              modelIds: notification.modelIds,
              modelNames: notification.modelNames,
              modelTypes: notification.modelTypes,
              read: notification.read,
              role: notification.role,
              type: notification.type,
              announcement: notification.announcement,
            }
          : notification
      );
    }
    default:
      return state || [];
  }
};

const unreadCount: Reducer<number, AnyAction> = (state: number | undefined, action: AnyAction) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS: {
      if (action.payload.unreadCount !== undefined) {
        return action.payload.unreadCount;
      }
      // Calculate unread count from notifications if not provided
      const notifications = action.payload.notifications || [];
      return notifications.filter((n: PrimeUserNotification) => !n.read).length;
    }
    case UPDATE_UNREAD_COUNT: {
      return action.payload.unreadCount;
    }
    default:
      return state || 0;
  }
};

const announcements: Reducer<PrimeAdminAnnouncement, AnyAction> = (
  state: PrimeAdminAnnouncement | undefined,
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

const next: Reducer<string, AnyAction> = (state: string | undefined, action: AnyAction) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS:
    case PAGINATE_NOTIFICATIONS:
      return action.payload?.next || '';
    default:
      return state || '';
  }
};

const notification: Reducer<NotificationState, AnyAction> = combineReducers({
  notifications,
  next,
  announcements,
  unreadCount,
});

export { notification };
