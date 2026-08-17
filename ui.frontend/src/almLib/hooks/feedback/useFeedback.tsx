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
import { PrimeLearningObjectInstanceEnrollment } from '../../models';
import { getALMConfig } from '../../utils/global';
import { QueryParams, RestAdapter } from '../../utils/restAdapter';
import { Widget } from '../../utils/widgets/common';
import { JsonApiParse } from '../../utils/jsonAPIAdapter';
import { useState } from 'react';
import { getUserId } from '../../utils/widgets/utils';

export const useFeedback = (widget?: Widget) => {
  const COURSE_L1_FEEDBACK_CHANNEL = 'course::l1FeedbackPrompt';
  const baseApiUrl = getALMConfig().primeApiURL;

  const [feedbackTrainingId, setFeedbackTrainingId] = useState('');
  const [trainingInstanceId, setTrainingInstanceId] = useState('');
  const [playerLaunchTimeStamp, setPlayerLaunchTimeStamp] = useState(0);
  const [shouldLaunchFeedback, setShouldLaunchFeedback] = useState(false);
  const [notificationId, setNotificationId] = useState('');

  const handleL1FeedbackLaunch = (
    trainingId: string,
    trainingInstanceId: string,
    playerLaunchTimeStamp: number,
    notificationId?: string
  ) => {
    setFeedbackTrainingId(trainingId);
    setTrainingInstanceId(trainingInstanceId);
    setPlayerLaunchTimeStamp(playerLaunchTimeStamp);
    setNotificationId(notificationId ? notificationId : '');
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
    params['include'] =
      'subLOs.enrollment.loInstance.l1FeedbackInfo,enrollment.loInstance.l1FeedbackInfo,instances.enrollment.loInstance.l1FeedbackInfo';
    const notificationParams: QueryParams = {};
    notificationParams['userSelectedChannels'] = COURSE_L1_FEEDBACK_CHANNEL;

    const response = await RestAdapter.get({
      url: `${baseApiUrl}/learningObjects/${trainingId}`,
      params: params,
    }).catch(e => {
      if (e.status == 400) {
        closeFeedbackPopUp();
      }
    });
    if (!response) return undefined;
    const parsedResponse = JsonApiParse(response);
    return parsedResponse?.learningObject;
  };

  const submitL1Feedback = async (
    enrollment: PrimeLearningObjectInstanceEnrollment | undefined,
    feedbackBody: any
  ) => {
    const requestBody: any = {};
    requestBody['data'] = feedbackBody;
    const headers = {
      'content-type': 'application/vnd.api+json;charset=UTF-8',
    };
    try {
      const response = await RestAdapter.post({
        url: `${baseApiUrl}/enrollments/${enrollment?.id}/l1Feedback`,
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: headers,
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const closeFeedbackWrapper = () => {
    console.log('closeFeedbackWrapper inside hook');
    setShouldLaunchFeedback(false);
    setFeedbackTrainingId('');
    setTrainingInstanceId('');
    setPlayerLaunchTimeStamp(0);
    setNotificationId('');
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
