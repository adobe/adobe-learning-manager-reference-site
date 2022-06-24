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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeUserNotification } from "../../models";
import {
  loadNotifications,
  paginateNotifications,
} from "../../store/actions/notification/action";
import { State } from "../../store/state";
import { getALMConfig, getALMObject, getALMUser } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
const channels = [
  "jobAid::adminEnrollment",
  "certification::adminEnrollment",
  "certification::autoEnrollment",
  "certification::completed",
  "certification::badgeIssued",
  "certification::completionReminder",
  "certification::expired",
  "certification::recurrenceEnrollment",
  "certification::republished",
  "certification::learnerCertificationApprovalRequestApproved",
  "certification::learnerCertificationApprovalRequestDenied",
  "certification::deadlineMissed",
  "course::adminEnrollment",
  "course::autoEnrollment",
  "course::badgeIssued",
  "course::l1FeedbackPrompt",
  "course::deadlineMissed",
  "course::completed",
  "course::completionReminder",
  "course::sessionReminder",
  "course::republished",
  "course::courseOpenForEnrollment",
  "course::learnerEnrollmentRequestApproved",
  "course::learnerEnrollmentRequestDenied",
  "course::waitListCleared",
  "course::learnerNominationRequest",
  "learningProgram::adminEnrollment",
  "learningProgram::autoEnrollment",
  "learningProgram::badgeIssued",
  "learningProgram::republished",
  "learningProgram::deadlineMissed",
  "learningProgram::completionReminder",
  "learningProgram::completed",
  "learningProgram::l1Feedback",
  "competency::assigned",
  "competency::badgeIssued",
  "competency::achieved",
  "manager::added",
  "admin::added",
  "author::added",
  "integrationAdmin::added",
];
export const useNotifications = () => {
  const { notifications, next } = useSelector(
    (state: State) => state.notification
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useDispatch();
  const config = getALMConfig();
  const getUserId = async () => {
    if (!getALMObject().isPrimeUserLoggedIn()) {
      return;
    }
    const userResponse = await getALMUser();
    return userResponse?.user?.id;
  };

  const pageLimit = 6;

  //console.log(user.id);
  const fetchNotifications = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }
      setIsLoading(true);
      const params: QueryParams = {};
      params["page[limit]"] = pageLimit;
      params["announcementsOnly"] = false;
      params["userSelectedChannels"] = channels;
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/users/${userId}/userNotifications`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const notificationData: any = {};
      notificationData["notifications"] =
        parsedResponse.userNotificationList || [];
      notificationData["next"] = parsedResponse.links?.next || "";
      setUnreadCount(0);
      dispatch(loadNotifications(notificationData));
      setIsLoading(false);
    } catch (e) {
      dispatch(loadNotifications([] as PrimeUserNotification[]));
      console.log("Error while loading notifications " + e);
      setIsLoading(false);
    }
  }, [config.primeApiURL, dispatch]);

  const pollUnreadNotificationCount = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }
      const params: QueryParams = {};
      params["page[limit]"] = pageLimit;
      params["announcementsOnly"] = false;
      params["userSelectedChannels"] = channels;
      params["read"] = false;
      const response = await RestAdapter.get({
        url: `${config.primeApiURL}/users/${userId}/userNotifications`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      let count = 0;
      if (parsedResponse && parsedResponse.userNotificationList)
        count = parsedResponse.userNotificationList.length;

      setUnreadCount(count);
    } catch (e) {
      console.log("Error while loading notifications " + e);
    }
  }, [config.primeApiURL]);

  useEffect(() => {
    pollUnreadNotificationCount();
  }, [pollUnreadNotificationCount]);

  //for pagination
  const loadMoreNotifications = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateNotifications({
        notifications: parsedResponse!.userNotificationList || [],
        next: parsedResponse!.links?.next || "",
      })
    );
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
            method: "PUT",
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(unreadNotificationIds),
          });
        }
      }
    },
    [config.primeApiURL, notifications]
  );

  const redirectOverviewPage = useCallback((notif) => {
    let alm = getALMObject();
    let trainingId = notif.modelIds[0];
    let isJobAid = false;
    if (notif.modelTypes[0] === "learningObject") {
      notif.modelIds!.forEach((item: string) => {
        if (item.toLowerCase().includes("jobaid")) {
          LaunchPlayer({ trainingId: trainingId });
          isJobAid = true;
        }
      });
    }
    if (isJobAid) return;
    alm.navigateToTrainingOverviewPage(trainingId);
    return;
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    loadMoreNotifications,
    markReadNotification,
    redirectOverviewPage,
    pollUnreadNotificationCount,
  };
};
