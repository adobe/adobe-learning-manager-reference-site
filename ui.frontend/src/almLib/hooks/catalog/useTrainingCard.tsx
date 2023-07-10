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
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { AlertType } from "../../common/Alert/AlertDialog";
import { useAlert } from "../../common/Alert/useAlert";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";
import {
  getActiveInstances,
  getDefaultIntsance,
  getJobaidUrl,
  isJobaid,
  isJobaidContentTypeUrl,
} from "../../utils/catalog";
import { COURSE } from "../../utils/constants";
import { getALMObject } from "../../utils/global";
import { clearParentLoDetails, getEnrolledInstancesCount, hasSingleActiveInstance, isEnrolledInAutoInstance, useCardIcon } from "../../utils/hooks";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams } from "../../utils/restAdapter";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
} from "../../utils/translationService";

export const useTrainingCard = (training: PrimeLearningObject) => {
  const [almAlert] = useAlert();
  const { locale } = useIntl();
  let {
    loFormat: format,
    loType: type,
    id,
    rating,
    imageUrl,
    state,
    tags,
    authorNames,
    enrollment,
    skills,
    skillNames,
  } = training;

  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const { cardIconUrl, color, bannerUrl, cardBgStyle, listThumbnailBgStyle } =
    useCardIcon(training);

  const computedSkillsName = useMemo(() => {
    if (skillNames!?.length > 0) {
      return skillNames?.join(", ");
    }
    let tempSkillNames = new Set();
    skills?.forEach((item) => {
      tempSkillNames.add(item.skillLevel?.skill?.name);
    });
    return Array.from(tempSkillNames).join(", ");
  }, [skillNames, skills]);

  const cardClickHandler = useCallback(async () => {
    if (!training) return;
    let alm = getALMObject();
    clearParentLoDetails();
    if (!alm.isPrimeUserLoggedIn()) {
      //Does ES have instances in response
      const activeInstances = getActiveInstances(training);
      if (!activeInstances || activeInstances?.length === 1) {
        alm.navigateToTrainingOverviewPage(training.id);
      } else {
        alm.navigateToInstancePage(training.id);
      }
      return;
    }

    //if jobAid, need to enroll and open player or new tab
    if (isJobaid(training)) {
      try {
        if (!training.enrollment) {
          let queryParam: QueryParams = {
            loId: training.id,
            loInstanceId: training.instances[0].id,
          };
          await APIServiceInstance.enrollToTraining(queryParam);
          almAlert(true, GetTranslation("alm.jobaid.added"), AlertType.success);
        }
        //if user logged in, then enroll if not already enrolled.
        //need to enroll silently here and then do the following
        if (isJobaidContentTypeUrl(training)) {
          window.open(getJobaidUrl(training), "_blank");
        } else {
          LaunchPlayer({ trainingId: training.id });
        }
      } catch (error) {}
      return;
    }

    if (training.enrollment) {
      const hasMultipleInstances = !hasSingleActiveInstance(training);
      const enrollmentCount = getEnrolledInstancesCount(training);

      // AUTO INSTANCE CASE
      const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);

      if(enrollmentCount !== 1 && hasMultipleInstances && !isAutoInstanceEnrolled && training.loType === COURSE){
        alm.navigateToInstancePage(training.id);
      }
      else {
        alm.navigateToTrainingOverviewPage(
          training.id,
          training.enrollment.loInstance.id
        );
      }
      return;
    }
    const activeInstances = getActiveInstances(training);
    if (activeInstances?.length === 1) {
      alm.navigateToTrainingOverviewPage(training.id, activeInstances[0].id);
      return;
    }
    if (activeInstances?.length === 0) {
      const defaultInstance = getDefaultIntsance(training);
      alm.navigateToTrainingOverviewPage(training.id, defaultInstance[0]?.id);
      return;
    }
    alm.navigateToInstancePage(training.id);
  }, [training]);

  return {
    id,
    format,
    type,
    skillNames: computedSkillsName,
    rating,
    state,
    tags,
    authorNames,
    name,
    description,
    overview,
    richTextOverview,
    imageUrl,
    cardIconUrl,
    color,
    cardBgStyle,
    listThumbnailBgStyle,
    enrollment,
    cardClickHandler,
    training,
    bannerUrl,
  };
  //date create, published, duration
};
