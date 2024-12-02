import { PrimeLearningObjectInstanceEnrollment } from "../../models";
import { getALMConfig } from "../../utils/global";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { Widget } from "../../utils/widgets/common";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { useState } from "react";
import { getUserId } from "../../utils/widgets/utils";

export const useFeedback = (widget?: Widget) => {
  const COURSE_L1_FEEDBACK_CHANNEL = "course::l1FeedbackPrompt";
  const baseApiUrl = getALMConfig().primeApiURL;

  const [feedbackTrainingId, setFeedbackTrainingId] = useState("");
  const [trainingInstanceId, setTrainingInstanceId] = useState("");
  const [playerLaunchTimeStamp, setPlayerLaunchTimeStamp] = useState(0);
  const [shouldLaunchFeedback, setShouldLaunchFeedback] = useState(false);
  const [notificationId, setNotificationId] = useState("");

  const handleL1FeedbackLaunch = (
    trainingId: string,
    trainingInstanceId: string,
    playerLaunchTimeStamp: number,
    notificationId?: string
  ) => {
    setFeedbackTrainingId(trainingId);
    setTrainingInstanceId(trainingInstanceId);
    setPlayerLaunchTimeStamp(playerLaunchTimeStamp);
    setNotificationId(notificationId ? notificationId : "");
    setShouldLaunchFeedback(true);
  };

  const getNotificationsForUser = async (params: QueryParams) => {
    const config = getALMConfig();
    const userId = await getUserId();
    if (!userId) {
      return;
    }
    return await RestAdapter.get({
      url: `${config.primeApiURL}/users/${userId}/userNotifications`,
      params: params,
    });
  };

  const getFilteredNotificationForFeedback = async (notificationParams: QueryParams) => {
    const notificationResponse = await getNotificationsForUser(notificationParams);
    const parsedNotificationResponse = JsonApiParse(notificationResponse);
    return parsedNotificationResponse.userNotificationList;
  };

  const fetchCurrentLo = async (trainingId: string, closeFeedbackPopUp: Function) => {
    const params: QueryParams = {};
    params["include"] =
      "subLOs.enrollment.loInstance.l1FeedbackInfo,enrollment.loInstance.l1FeedbackInfo,instances.enrollment.loInstance.l1FeedbackInfo";
    const notificationParams: QueryParams = {};
    notificationParams["userSelectedChannels"] = COURSE_L1_FEEDBACK_CHANNEL;

    const response = await RestAdapter.get({
      url: `${baseApiUrl}/learningObjects/${trainingId}`,
      params: params,
    }).catch(e => {
      if (e.status == 400) {
        closeFeedbackPopUp();
      }
    });
    const parsedResponse = JsonApiParse(response);
    return parsedResponse.learningObject;
  };

  const submitL1Feedback = async (
    enrollment: PrimeLearningObjectInstanceEnrollment | undefined,
    feedbackBody: any
  ) => {
    const requestBody: any = {};
    requestBody["data"] = feedbackBody;
    const headers = {
      "content-type": "application/vnd.api+json;charset=UTF-8",
    };
    try {
      const response = await RestAdapter.post({
        url: `${baseApiUrl}/enrollments/${enrollment?.id}/l1Feedback`,
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: headers,
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const closeFeedbackWrapper = () => {
    console.log("closeFeedbackWrapper inside hook")
    setShouldLaunchFeedback(false);
    setFeedbackTrainingId("");
    setTrainingInstanceId("");
    setPlayerLaunchTimeStamp(0);
    setNotificationId("");
  };

  return {
    fetchCurrentLo,
    submitL1Feedback,
    getFilteredNotificationForFeedback,
    feedbackTrainingId,
    trainingInstanceId,
    playerLaunchTimeStamp,
    shouldLaunchFeedback,
    handleL1FeedbackLaunch,
    notificationId,
    closeFeedbackWrapper,
  };
};
