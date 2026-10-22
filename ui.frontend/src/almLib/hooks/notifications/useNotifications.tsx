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
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import APIServiceInstance from '../../common/APIService';
import { PrimeUserNotification } from '../../models';
import {
  loadNotifications,
  paginateNotifications,
  loadAnnouncements,
  updateUnreadCount,
} from '../../store/actions/notification/action';
import { State } from '../../store/state';
import { getALMConfig, getALMObject, getALMUser } from '../../utils/global';
import { JsonApiParse } from '../../utils/jsonAPIAdapter';
import { LaunchPlayer } from '../../utils/playback-utils';
import { QueryParams, RestAdapter } from '../../utils/restAdapter';
import { clearBreadcrumbPathDetails } from '../../utils/breadcrumbUtils';
import { MOBILE_IMMERSIVE_NOTIFICATION_CHANNELS } from '../../utils/constants';

// Default channels for non-mobile apps
const defaultChannels = [
  'jobAid::adminEnrollment',
  'certification::adminEnrollment',
  'certification::autoEnrollment',
  'certification::completed',
  'certification::badgeIssued',
  'certification::completionReminder',
  'certification::expired',
  'certification::recurrenceEnrollment',
  'certification::republished',
  'certification::learnerCertificationApprovalRequestApproved',
  'certification::learnerCertificationApprovalRequestDenied',
  'certification::deadlineMissed',
  'course::adminEnrollment',
  'course::autoEnrollment',
  'course::badgeIssued',
  'course::l1FeedbackPrompt',
  'course::deadlineMissed',
  'course::completed',
  'course::completionReminder',
  'course::sessionReminder',
  'course::republished',
  'course::courseOpenForEnrollment',
  'course::learnerEnrollmentRequestApproved',
  'course::learnerEnrollmentRequestDenied',
  'course::waitListCleared',
  'course::learnerNominationRequest',
  'learningProgram::adminEnrollment',
  'learningProgram::autoEnrollment',
  'learningProgram::badgeIssued',
  'learningProgram::republished',
  'learningProgram::deadlineMissed',
  'learningProgram::completionReminder',
  'learningProgram::completed',
  'learningProgram::l1Feedback',
  'competency::assigned',
  'competency::badgeIssued',
  'competency::achieved',
  'manager::added',
  'admin::added',
  'author::added',
  'integrationAdmin::added',
  'social::addedAsModerator',
  'social::postLive',
  'social::postRejected',
  'social::commentedOnPost',
  'social::commentedOnComment',
];

// Get channels based on mobile app configuration
const getChannels = () => {
  const config = getALMConfig();
  return config.learnerMobileApp ? MOBILE_IMMERSIVE_NOTIFICATION_CHANNELS : defaultChannels;
};

export const useNotifications = () => {
  const {
    notifications,
    next,
    announcements,
    unreadCount: storeUnreadCount,
  } = useSelector((state: State) => state.notification);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const config = getALMConfig();
  const getUserId = async () => {
    if (!getALMObject().isPrimeUserLoggedIn()) {
      return;
    }
    const userResponse = await getALMUser();
    return userResponse?.user?.id;
  };

  const pageLimit = 10;

  const fetchNotifications = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }
      setIsLoading(true);
      const params: QueryParams = {};
      params['page[limit]'] = pageLimit;
      params['announcementsOnly'] = false;
      params['userSelectedChannels'] = getChannels();
      params['language'] = (config.locale || 'en-US').replace('-', '_');
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/users/${userId}/userNotifications`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const notifications = parsedResponse.userNotificationList || [];
      const unreadCount = notifications.filter((n: any) => !n.read).length;

      dispatch(
        loadNotifications({
          notifications,
          next: parsedResponse.links?.next || '',
          unreadCount,
        })
      );
    } catch (error) {
      console.error('Error while loading notifications:', error);
      dispatch(loadNotifications({ notifications: [], next: '', unreadCount: 0 }));
    } finally {
      setIsLoading(false);
    }
  }, [config.primeApiURL, config.locale, dispatch]);

  const pollUnreadNotificationCount = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }
      const params: QueryParams = {};
      params['page[limit]'] = pageLimit;
      params['announcementsOnly'] = false;
      params['userSelectedChannels'] = getChannels();
      params['read'] = false;
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/users/${userId}/userNotifications`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const unreadCount = parsedResponse?.userNotificationList?.length || 0;
      dispatch(updateUnreadCount(unreadCount));
    } catch (error) {
      console.error('Error while polling unread notifications:', error);
    }
  }, [config.primeApiURL, dispatch]);

  const loadMoreNotifications = useCallback(async () => {
    if (!next) {
      return;
    }
    try {
      const parsedResponse = await APIServiceInstance.loadMore(next);
      dispatch(
        paginateNotifications({
          notifications: parsedResponse?.userNotificationList || [],
          next: parsedResponse?.links?.next || '',
        })
      );
    } catch (error) {
      console.error('Error while loading more notifications:', error);
    }
  }, [dispatch, next]);

  const markReadNotification = useCallback(
    async (data = []) => {
      const userId = await getUserId();
      let notificationToRead = data?.length ? data : notifications;
      let unreadNotificationIds = [];
      if (notificationToRead) {
        for (let i = 0; i < notificationToRead.length; i++) {
          let notification = notificationToRead[i];
          if (notification.read === false) {
            unreadNotificationIds.push(notification.id);
          }
        }
        if (unreadNotificationIds.length > 0) {
          await RestAdapter.put({
            url: `${config.primeApiURL}/users/${userId}/userNotificationsMarkRead`,
            method: 'PUT',
            headers: {
              'content-type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(unreadNotificationIds),
          });
        }
      }
    },
    [config.primeApiURL, notifications]
  );

  const markReadSingleNotification = useCallback(
    async (notificationId: string) => {
      if (!notificationId) {
        console.error('Invalid notification ID provided');
        return;
      }

      const userId = await getUserId();
      if (!userId) {
        return;
      }

      let notification;
      let originalNotifications;
      let originalUnreadCount;

      try {
        // Store original state for rollback if needed
        originalNotifications = [...(notifications || [])];
        originalUnreadCount = storeUnreadCount;

        // Find the notification to update
        notification = notifications?.find(n => n.id === notificationId);
        if (!notification) {
          throw new Error('Notification not found');
        }

        // Update notifications list and unread count immediately (Optimistic Update)
        const updatedNotifications =
          notifications?.map(n => (n.id === notificationId ? { ...n, read: true } : n)) || [];

        const newUnreadCount = Math.max(0, storeUnreadCount - 1);

        // Dispatch updated notifications to Redux store immediately
        dispatch(
          loadNotifications({
            notifications: updatedNotifications,
            next,
            unreadCount: newUnreadCount,
            isUpdate: true,
          })
        );

        // Make API call to update server
        await RestAdapter.patch({
          url: `${config.primeApiURL}/users/${userId}/userNotifications/${notificationId}`,
          method: 'PATCH',
          headers: {
            'content-type': 'application/vnd.api+json',
            ...(config.csrfToken && { 'x-csrf-token': config.csrfToken }),
          },
          body: JSON.stringify({
            data: {
              type: 'userNotification',
              id: notificationId,
              attributes: {
                channel: notification.channel,
                dateCreated: notification.dateCreated,
                message: notification.message,
                modelIds: notification.modelIds,
                modelNames: notification.modelNames,
                modelTypes: notification.modelTypes,
                role: notification.role,
                type: notification.type,
                read: true,
                actionTaken: true,
              },
            },
          }),
        }).catch(error => {
          console.error('Error in background API call:', error);
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);

        // Revert optimistic updates on error
        if (originalNotifications && originalUnreadCount !== undefined) {
          dispatch(
            loadNotifications({
              notifications: originalNotifications,
              next,
              unreadCount: originalUnreadCount,
              isUpdate: true,
            })
          );
        }
      }
    },
    [config.primeApiURL, config.csrfToken, dispatch, next, notifications, storeUnreadCount]
  );

  const redirectOverviewPage = useCallback(notif => {
    const alm = getALMObject();
    const trainingId = notif.modelIds[0];
    const trainingInstanceId = notif.metadata ? notif.metadata[0].id : '';

    if (
      notif.modelTypes[0] === 'learningObject' &&
      notif.modelIds.some((id: string) => id.toLowerCase().includes('jobaid'))
    ) {
      LaunchPlayer({ trainingId });
      return;
    }

    clearBreadcrumbPathDetails(trainingId);
    alm.navigateToTrainingOverviewPage(trainingId, trainingInstanceId);
  }, []);

  const fetchAnnouncements = async (id: string) => {
    if (!id) {
      console.error('Invalid announcement ID provided');
      return;
    }

    const userId = await getUserId();
    if (!userId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/announcements/${id}`,
      });

      if (!response) {
        throw new Error('Invalid announcement response');
      }

      const parsedResponse = JsonApiParse(response)?.adminAnnouncement;
      if (!parsedResponse) {
        throw new Error('Failed to parse announcement data');
      }

      dispatch(loadAnnouncements(parsedResponse));
    } catch (error) {
      console.error('Error while fetching announcements:', error);
      dispatch(loadAnnouncements(null));
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotification = useCallback(
    async (
      userId: string,
      userNotificationId: string,
      requestBody: PrimeUserNotification,
      retryCount = 0
    ): Promise<any> => {
      if (!userId || !userNotificationId) {
        console.error('Invalid user ID or notification ID provided');
        return;
      }

      try {
        const body = (requestBody as any).data
          ? requestBody
          : {
              data: {
                type: 'userNotification',
                id: userNotificationId,
                attributes: requestBody,
              },
            };

        const response = await RestAdapter.patch({
          url: `${config.primeApiURL}/users/${userId}/userNotifications/${userNotificationId}`,
          method: 'PATCH',
          headers: {
            'content-type': 'application/vnd.api+json',
            ...(config.csrfToken && { 'x-csrf-token': config.csrfToken }),
          },
          body: JSON.stringify(body),
        });

        return response;
      } catch (error) {
        console.error('Error updating notification:', error);
        if (retryCount < 2) {
          console.log(`Retrying update notification (attempt ${retryCount + 1})`);
          return updateNotification(userId, userNotificationId, requestBody, retryCount + 1);
        }
        throw error;
      }
    },
    [config.primeApiURL, config.csrfToken]
  );

  const getUserNotification = useCallback(
    async (userNotificationId: string) => {
      if (!userNotificationId) {
        console.error('Invalid notification ID provided');
        return null;
      }

      try {
        const userId = await getUserId();
        if (!userId) {
          return null;
        }

        const response = await RestAdapter.get({
          url: `${config.primeApiURL}/users/userNotifications/${userNotificationId}`,
          headers: {
            'content-type': 'application/vnd.api+json',
            ...(config.csrfToken && { 'x-csrf-token': config.csrfToken }),
          },
        });

        if (!response) {
          throw new Error('Failed to fetch notification');
        }

        const parsedNotification = JsonApiParse(response);
        if (!parsedNotification?.userNotification) {
          throw new Error('Invalid notification data received');
        }

        return parsedNotification.userNotification;
      } catch (error) {
        console.error('Error while fetching notification:', error);
        return null;
      }
    },
    [config.primeApiURL, config.csrfToken]
  );

  return {
    notifications,
    announcements,
    isLoading,
    unreadCount: storeUnreadCount,
    fetchNotifications,
    loadMoreNotifications,
    markReadNotification,
    markReadSingleNotification,
    redirectOverviewPage,
    pollUnreadNotificationCount,
    fetchAnnouncements,
    updateNotification,
    getUserNotification,
  };
};
