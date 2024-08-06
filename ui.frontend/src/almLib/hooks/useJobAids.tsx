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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { PrimeLearningObject } from "../models/PrimeModels";
import { useCallback, useState } from "react";
import { getJobaidUrl, isJobaidContentTypeUrl } from "../utils/catalog";
import { useIntl } from "react-intl";
import { useAlert } from "../common/Alert/useAlert";
import APIServiceInstance from "../common/APIService";
import { GetTranslation } from "../utils/translationService";
import { AlertType } from "../common/Alert/AlertDialog";
import { LaunchPlayer } from "../utils/playback-utils";
import { getWidgetConfig } from "../utils/global";
import { CalculateIfTablet } from "../utils/widgets/utils";

export const useJobAids = (
  training: PrimeLearningObject,
  handleLoEnrollment?: Function,
  updateLearningObject?: Function,
  unEnrollmentHandler?: Function
) => {
  const { formatMessage } = useIntl();
  //on click, if not enrolled show popup alert
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return training.enrollment ? true : false;
  });
  const [showAlert, setShowAlert] = useState(false);
  const [almAlert] = useAlert();
  const handleUnenrollment = async (enrollmentId: string) => {
    if (!enrollmentId) {
      setIsEnrolled(true);
    }
    try {
      await APIServiceInstance.unenrollFromTraining(enrollmentId);
      setIsEnrolled(false);
      if (updateLearningObject) {
        await updateLearningObject(training.id);
      }
    } catch (error) {
      almAlert(true, GetTranslation("alm.unenrollment.error"), AlertType.error);
      setIsEnrolled(true);
    }
  };
  const handleJobAidClick = useCallback((training: PrimeLearningObject) => {
    if (isJobaidContentTypeUrl(training)) {
      window.open(getJobaidUrl(training), "_blank");
    } else {
      const playerDimension = getWidgetConfig().isMobile || CalculateIfTablet() ? "100%" : "70%";
      LaunchPlayer({ trainingId: training.id, playerDimension });
    }
  }, []);
  const unenroll = () => {
    handleUnenrollment(training?.enrollment?.id);
  };

  const handleJobAidEnrollment = (isEnrolling: boolean) => {
    if (isEnrolling) {
      handleLoEnrollment?.({
        id: training.id,
        instanceId: training.instances[0].id,
        isSupplementaryLO: false,
      });
    } else if (training?.enrollment?.id) {
      unEnrollmentHandler?.({
        enrollmentId: training.enrollment.id,
        isSupplementaryLO: true,
      });
    }
    setIsEnrolled(isEnrolling);
  };

  const enrollJobAid = () => handleJobAidEnrollment(true);
  const unenrollJobAid = () => handleJobAidEnrollment(false);
  const enroll = async () => {
    if (!handleLoEnrollment) {
      return;
    }
    try {
      await handleLoEnrollment(training.id, training.instances[0].id);
      setIsEnrolled(true);
    } catch (error) {
      throw new Error();
    }
  };

  const nameClickHandler = () => {
    if (isJobaidContentTypeUrl(training)) {
      handleJobAidClick(training);
      return;
    }

    if (isEnrolled) {
      handleJobAidClick(training);
      return;
    } else {
      // alert("not in your list"); - only for overview page
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      //need to show dialog
    }
  };

  const jobAidAddToListMsg = formatMessage({
    id: "alm.overview.job.aid.add.from.list",
    defaultMessage: "Add to my list",
  });

  const jobAidRemoveToListMsg = formatMessage({
    id: "alm.overview.job.aid.remove.from.list",
    defaultMessage: "Remove from my list",
  });

  return {
    enroll,
    unenroll,
    jobAidAddToListMsg,
    jobAidRemoveToListMsg,
    nameClickHandler,
    enrollJobAid,
    unenrollJobAid,
    isEnrolled,
    showAlert,
    handleJobAidClick,
  };
};
