import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { useConfigContext, useUserContext } from "../../contextProviders";
import { PrimeUserNotification } from "../../models";
import {
  loadNotifications,
  paginateNotifications,
} from "../../store/actions/notification/action";
import { State } from "../../store/state";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";

export const useNotifications = () => {
  const { notifications, next } = useSelector(
    (state: State) => state.notification
  );
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const dispatch = useDispatch();
  const config = useConfigContext();
  const { user } = useUserContext();
  const pageLimit = 10;
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
  console.log(user.id);
  const fetchNotifications = useCallback(async () => {
    try {
      const params: QueryParams = {};
      params["page[limit]"] = pageLimit;
      params["announcementsOnly"] = false;
      params["userSelectedChannels"] = channels;
      const response = await RestAdapter.get({
        url: `${config.baseApiUrl}/users/10866105/userNotifications`,
        params: params,
      });
      const parsedResponse = JsonApiParse(response);
      const notificationData: any = {};
      notificationData["notifications"] =
        parsedResponse.userNotificationList || [];
      notificationData["next"] = parsedResponse.links?.next || "";
      let count = 0;
      parsedResponse.userNotificationList?.forEach((entry) => {
        if (entry.read === false) {
          count++;
        }
      });
      setUnreadCount(count);
      console.log(notificationData["notifications"]);
      dispatch(loadNotifications(notificationData));
      setIsLoading(false);
    } catch (e) {
      dispatch(loadNotifications([] as PrimeUserNotification[]));
      console.log("Error while loading notifications " + e);
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
      let notificationToRead = data?.length ? data : notifications;

      if (notificationToRead) {
        for (let i = 0; i < notificationToRead.length; i++) {
          let notification = notificationToRead[i];
          if (notification.read === false) {
            let notificationId = notification.id;
            notification.read = true;
            const requestBody: any = getUserNotificationBody(notification);
            await RestAdapter.patch({
              url: `${config.baseApiUrl}/users/10866105/userNotifications/${notificationId}`,
              method: "PATCH",
              headers: {
                "content-type": "application/vnd.api+json;charset=UTF-8",
              },
              body: JSON.stringify(requestBody),
            });
            setUnreadCount(0);
          }
        }
      }
    },
    [dispatch, notifications]
  );

  const getUserNotificationBody = (notification: any) => {
    const userNotification = {} as PrimeUserNotification;
    userNotification.channel = notification.channel;
    userNotification.modelIds = notification.modelIds;
    userNotification.dateCreated = notification.dateCreated;
    userNotification.actionTaken = true;
    userNotification.message = notification.message;
    userNotification.modelNames = notification.modelNames;
    userNotification.modelTypes = notification.modelTypes;
    userNotification.modelIds = notification.modelIds;
    userNotification.read = notification.read;
    userNotification.role = notification.role;

    const notificationData: any = {};
    notificationData["id"] = notification.id;
    notificationData["type"] = "userNotification";
    notificationData["attributes"] = userNotification;
    const requestBody: any = {};
    requestBody["data"] = notificationData;
    return requestBody;
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    loadMoreNotifications,
    markReadNotification,
  };
};
