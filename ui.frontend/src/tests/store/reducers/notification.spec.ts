/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/**
 * Unit tests for notification.ts reducer
 * Tests Redux reducer for notification state management
 */

import { notification, NotificationState } from '@almLib/store/reducers/notification';
import {
  LOAD_ANNOUNCEMENT,
  LOAD_NOTIFICATIONS,
  PAGINATE_NOTIFICATIONS,
  UPDATE_NOTIFICATION,
  UPDATE_UNREAD_COUNT,
} from '@almLib/store/actions/notification/actionTypes';
import { PrimeUserNotification, PrimeAdminAnnouncement } from '@models/PrimeModels';

// Mock GetTranslation
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string, returnRaw: boolean) => {
    return key; // Return the translation key
  }),
}));

describe('notification reducer', () => {
  // ==========================================
  // Initial State
  // ==========================================

  it('should return initial state', () => {
    const state = notification(undefined, { type: '@@INIT' });

    expect(state.notifications).toEqual([]);
    expect(state.next).toBe('');
    expect(state.announcements).toEqual({});
    expect(state.unreadCount).toBe(0);
  });

  // ==========================================
  // Notifications Reducer
  // ==========================================

  describe('notifications reducer', () => {
    it('should load notifications on LOAD_NOTIFICATIONS', () => {
      const notifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Notification 1', read: false } as PrimeUserNotification,
        { id: 'notif:2', message: 'Notification 2', read: true } as PrimeUserNotification,
      ];

      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications, next: 'page2' },
      };
      const state = notification(undefined, action);

      expect(state.notifications).toEqual(notifications);
      expect(state.notifications).toHaveLength(2);
    });

    it('should return empty array if no notifications', () => {
      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications: null },
      };
      const state = notification(undefined, action);

      expect(state.notifications).toEqual([]);
    });

    it('should update existing notifications when isUpdate is true', () => {
      const initialNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Old Message', read: false } as PrimeUserNotification,
        { id: 'notif:2', message: 'Another Message', read: false } as PrimeUserNotification,
      ];

      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications: initialNotifications },
      };
      let state = notification(undefined, loadAction);

      const updatedNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Updated Message', read: true } as PrimeUserNotification,
      ];

      const updateAction = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: updatedNotifications,
          isUpdate: true,
        },
      };
      state = notification(state, updateAction);

      expect(state.notifications).toHaveLength(2);
      expect(state.notifications![0].message).toBe('Updated Message');
      expect(state.notifications![0].read).toBe(true);
      expect(state.notifications![1].message).toBe('Another Message');
    });

    it('should paginate notifications on PAGINATE_NOTIFICATIONS', () => {
      const initialNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Notification 1' } as PrimeUserNotification,
      ];
      const newNotifications: PrimeUserNotification[] = [
        { id: 'notif:2', message: 'Notification 2' } as PrimeUserNotification,
        { id: 'notif:3', message: 'Notification 3' } as PrimeUserNotification,
      ];

      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications: initialNotifications, next: 'page2' },
      };
      let state = notification(undefined, loadAction);

      const paginateAction = {
        type: PAGINATE_NOTIFICATIONS,
        payload: { notifications: newNotifications, next: 'page3' },
      };
      state = notification(state, paginateAction);

      expect(state.notifications).toHaveLength(3);
      expect(state.notifications![0].id).toBe('notif:1');
      expect(state.notifications![1].id).toBe('notif:2');
      expect(state.notifications![2].id).toBe('notif:3');
    });

    it('should handle pagination with null state', () => {
      const newNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Notification 1' } as PrimeUserNotification,
      ];

      const action = {
        type: PAGINATE_NOTIFICATIONS,
        payload: { notifications: newNotifications },
      };
      const state = notification(undefined, action);

      expect(state.notifications).toEqual(newNotifications);
    });

    it('should handle pagination with empty new notifications', () => {
      const initialNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'Notification 1' } as PrimeUserNotification,
      ];

      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications: initialNotifications },
      };
      let state = notification(undefined, loadAction);

      const paginateAction = {
        type: PAGINATE_NOTIFICATIONS,
        payload: { notifications: null },
      };
      state = notification(state, paginateAction);

      expect(state.notifications).toHaveLength(1);
    });

    it('should update notification on UPDATE_NOTIFICATION', () => {
      const notifications: PrimeUserNotification[] = [
        {
          id: 'notif:1',
          message: 'Original Message',
          read: false,
          actionTaken: false,
          channel: 'EMAIL',
          dateCreated: new Date('2024-01-01'),
          modelIds: ['course:1'],
          modelNames: ['Course 1'],
          modelTypes: ['course'],
          role: 'Learner',
          type: 'INFO',
          _transient: {},
          announcement: null,
        } as PrimeUserNotification,
      ];

      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications },
      };
      let state = notification(undefined, loadAction);

      const updateAction = {
        type: UPDATE_NOTIFICATION,
        payload: { id: 'notif:1' },
      };
      state = notification(state, updateAction);

      expect(state.notifications![0].actionTaken).toBe(true);
      expect(state.notifications![0].id).toBe('notif:1');
      // Message is updated by GetTranslation - covered by the reducer logic
    });

    it('should not update other notifications', () => {
      const notifications: PrimeUserNotification[] = [
        {
          id: 'notif:1',
          message: 'Message 1',
          actionTaken: false,
        } as PrimeUserNotification,
        {
          id: 'notif:2',
          message: 'Message 2',
          actionTaken: false,
        } as PrimeUserNotification,
      ];

      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications },
      };
      let state = notification(undefined, loadAction);

      const updateAction = {
        type: UPDATE_NOTIFICATION,
        payload: { id: 'notif:1' },
      };
      state = notification(state, updateAction);

      expect(state.notifications![0].actionTaken).toBe(true);
      expect(state.notifications![1].actionTaken).toBe(false);
    });
  });

  // ==========================================
  // UnreadCount Reducer
  // ==========================================

  describe('unreadCount reducer', () => {
    it('should set unreadCount from payload', () => {
      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [],
          unreadCount: 5,
        },
      };
      const state = notification(undefined, action);

      expect(state.unreadCount).toBe(5);
    });

    it('should calculate unreadCount from notifications if not provided', () => {
      const notifications: PrimeUserNotification[] = [
        { id: 'notif:1', read: false } as PrimeUserNotification,
        { id: 'notif:2', read: false } as PrimeUserNotification,
        { id: 'notif:3', read: true } as PrimeUserNotification,
        { id: 'notif:4', read: false } as PrimeUserNotification,
      ];

      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications },
      };
      const state = notification(undefined, action);

      expect(state.unreadCount).toBe(3);
    });

    it('should return 0 for empty notifications', () => {
      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: { notifications: [] },
      };
      const state = notification(undefined, action);

      expect(state.unreadCount).toBe(0);
    });

    it('should maintain count on unknown actions', () => {
      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [],
          unreadCount: 3,
        },
      };
      let state = notification(undefined, loadAction);

      state = notification(state, { type: 'UNKNOWN_ACTION' });

      expect(state.unreadCount).toBe(3);
    });

    it('should set unreadCount on UPDATE_UNREAD_COUNT without touching notifications', () => {
      const loadAction = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [{ id: 'notif:1', read: false } as PrimeUserNotification],
          unreadCount: 1,
        },
      };
      let state = notification(undefined, loadAction);

      const updateAction = {
        type: UPDATE_UNREAD_COUNT,
        payload: { unreadCount: 7 },
      };
      state = notification(state, updateAction);

      expect(state.unreadCount).toBe(7);
      expect(state.notifications).toHaveLength(1);
    });
  });

  // ==========================================
  // Announcements Reducer
  // ==========================================

  describe('announcements reducer', () => {
    it('should load announcement on LOAD_ANNOUNCEMENT', () => {
      const announcement: PrimeAdminAnnouncement = {
        id: 'announcement:1',
        title: 'Important Announcement',
        description: 'Please read this',
      } as PrimeAdminAnnouncement;

      const action = {
        type: LOAD_ANNOUNCEMENT,
        payload: announcement,
      };
      const state = notification(undefined, action);

      expect(state.announcements).toEqual(announcement);
    });

    it('should handle null announcement payload', () => {
      const action = {
        type: LOAD_ANNOUNCEMENT,
        payload: null,
      };
      const state = notification(undefined, action);

      expect(state.announcements).toEqual({});
    });

    it('should update existing announcement', () => {
      const oldAnnouncement: PrimeAdminAnnouncement = {
        id: 'announcement:1',
        title: 'Old Title',
      } as PrimeAdminAnnouncement;

      const newAnnouncement: PrimeAdminAnnouncement = {
        id: 'announcement:1',
        title: 'New Title',
      } as PrimeAdminAnnouncement;

      let state = notification(undefined, {
        type: LOAD_ANNOUNCEMENT,
        payload: oldAnnouncement,
      });

      state = notification(state, {
        type: LOAD_ANNOUNCEMENT,
        payload: newAnnouncement,
      });

      expect(state.announcements.title).toBe('New Title');
    });

    it('should return current state for unknown action', () => {
      const announcement: PrimeAdminAnnouncement = {
        id: 'announcement:1',
        title: 'Test',
      } as PrimeAdminAnnouncement;

      let state = notification(undefined, {
        type: LOAD_ANNOUNCEMENT,
        payload: announcement,
      });

      state = notification(state, { type: 'UNKNOWN_ACTION' });

      expect(state.announcements).toEqual(announcement);
    });
  });

  // ==========================================
  // Next Reducer
  // ==========================================

  describe('next reducer', () => {
    it('should set next on LOAD_NOTIFICATIONS', () => {
      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [],
          next: 'page2',
        },
      };
      const state = notification(undefined, action);

      expect(state.next).toBe('page2');
    });

    it('should set next on PAGINATE_NOTIFICATIONS', () => {
      const action = {
        type: PAGINATE_NOTIFICATIONS,
        payload: {
          notifications: [],
          next: 'page3',
        },
      };
      const state = notification(undefined, action);

      expect(state.next).toBe('page3');
    });

    it('should default to empty string if no next', () => {
      const action = {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [],
        },
      };
      const state = notification(undefined, action);

      expect(state.next).toBe('');
    });

    it('should maintain next on unknown actions', () => {
      let state = notification(undefined, {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: [],
          next: 'page2',
        },
      });

      state = notification(state, { type: 'UNKNOWN_ACTION' });

      expect(state.next).toBe('page2');
    });
  });

  // ==========================================
  // Integration Tests
  // ==========================================

  describe('integration tests', () => {
    it('should handle complete notification flow', () => {
      // Load initial notifications
      const initialNotifications: PrimeUserNotification[] = [
        { id: 'notif:1', message: 'First', read: false } as PrimeUserNotification,
      ];

      let state = notification(undefined, {
        type: LOAD_NOTIFICATIONS,
        payload: {
          notifications: initialNotifications,
          unreadCount: 1,
          next: 'page2',
        },
      });

      expect(state.notifications).toHaveLength(1);
      expect(state.unreadCount).toBe(1);
      expect(state.next).toBe('page2');

      // Paginate more notifications
      const moreNotifications: PrimeUserNotification[] = [
        { id: 'notif:2', message: 'Second', read: false } as PrimeUserNotification,
      ];

      state = notification(state, {
        type: PAGINATE_NOTIFICATIONS,
        payload: {
          notifications: moreNotifications,
          next: 'page3',
        },
      });

      expect(state.notifications).toHaveLength(2);
      expect(state.next).toBe('page3');

      // Load announcement
      state = notification(state, {
        type: LOAD_ANNOUNCEMENT,
        payload: {
          id: 'announce:1',
          title: 'New Feature',
        } as PrimeAdminAnnouncement,
      });

      expect(state.announcements.title).toBe('New Feature');
      expect(state.notifications).toHaveLength(2); // Should not affect notifications
    });
  });
});
