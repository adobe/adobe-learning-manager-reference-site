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
import { AlertType } from "../../common/Alert/AlertDialog";
import { useAlert } from "../../common/Alert/useAlert";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObject, PrimeLocalizationMetadata } from "../../models/PrimeModels";
import {
  getActiveInstances,
  getDefaultIntsance,
  getJobaidUrl,
  isJobaid,
  isJobaidContentTypeUrl,
} from "../../utils/catalog";
import {
  ALM_LEARNER_UPDATE_URL,
  COURSE,
  ENGLISH_LOCALE,
  LEARNING_PROGRAM,
} from "../../utils/constants";
import { getALMObject } from "../../utils/global";
import {
  clearBreadcrumbPathDetails,
  getEnrolledInstancesCount,
  hasSingleActiveInstance,
  isEnrolledInAutoInstance,
  useCardIcon,
} from "../../utils/hooks";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams } from "../../utils/restAdapter";
import { getPreferredLocalizedMetadata, GetTranslation } from "../../utils/translationService";
import { SendMessageToParent } from "../../utils/widgets/base/EventHandlingBase";
import { doesLPHaveActiveInstance } from "../../utils/lo-utils";
import { useUserContext } from "../../contextProviders/userContextProvider";

export const useTrainingCard = (training: PrimeLearningObject) => {
  const [almAlert] = useAlert();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
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
      return getPreferredLocalizedMetadata(training.localizedMetadata, contentLocale);
    }, [training.localizedMetadata, contentLocale]);

  const { cardIconUrl, color, bannerUrl, cardBgStyle, listThumbnailBgStyle } =
    useCardIcon(training);

  const computedSkillsName = useMemo(() => {
    if (skillNames!?.length > 0) {
      return skillNames?.join(", ");
    }
    let tempSkillNames = new Set();
    let loSkills = skills;
    if (training.loType === LEARNING_PROGRAM) {
      const lpSkills = skills?.filter(skill => {
        return skill.learningObjectId === training.id;
      });
      const courseSkills = skills?.filter(skill => {
        return skill.learningObjectId !== training.id;
      });
      if (lpSkills?.length > 0) {
        loSkills = lpSkills.concat(courseSkills);
      }
    }
    loSkills?.forEach(item => {
      tempSkillNames.add(item.skillLevel?.skill?.name);
    });
    return Array.from(tempSkillNames).join(", ");
  }, [skillNames, skills]);

  const cardClickHandler = useCallback(async () => {
    if (!training) return;
    let alm = getALMObject();
    clearBreadcrumbPathDetails();
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

    const lpHasNoActiveInstance =
      training.loType === LEARNING_PROGRAM && !doesLPHaveActiveInstance(training);

    if (lpHasNoActiveInstance) {
      alm.navigateToInstancePage(training.id);
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
          almAlert(true, GetTranslation("alm.jobaid.added", true), AlertType.success);
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

      if (
        enrollmentCount !== 1 &&
        hasMultipleInstances &&
        !isAutoInstanceEnrolled &&
        training.loType === COURSE
      ) {
        alm.navigateToInstancePage(training.id);
      } else {
        alm.navigateToTrainingOverviewPage(training.id, training.enrollment.loInstance.id);
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
    SendMessageToParent(
      {
        origin: window.origin,
        instancePageUrl: `instancePage=${training.id}`,
        instancePage: true,
        type: ALM_LEARNER_UPDATE_URL,
      },
      "*"
    );
    alm.navigateToInstancePage(training.id);
  }, [training, almAlert]);

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
