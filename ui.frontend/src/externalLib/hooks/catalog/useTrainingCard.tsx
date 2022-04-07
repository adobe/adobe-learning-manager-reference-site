import { useCallback, useMemo } from "react";
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
import { getALMConfig, getALMObject } from "../../utils/global";
import { useCardBackgroundStyle, useCardIcon } from "../../utils/hooks";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams } from "../../utils/restAdapter";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";

export const useTrainingCard = (training: PrimeLearningObject) => {
  const { locale } = getALMConfig();

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

  const {
    name,
    description,
    overview,
    richTextOverview,
  } = useMemo((): PrimeLocalizationMetadata => {
    return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
  }, [training.localizedMetadata, locale]);

  const { cardIconUrl = "", color = "", bannerUrl = "" } = useCardIcon(
    training
  );

  skillNames =
    skillNames!?.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
        skillNames
      : skills?.map((item) => item.skillLevel?.skill?.name);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);

  const cardClickHandler = useCallback(async () => {
    if (!training) return;
    let alm = getALMObject();
    if (!alm.isPrimeUserLoggedIn()) {
      alm.navigateToTrainingOverviewPage(training.id);
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
        }
        //if user logged in, then enroll if not already enrolled.
        //need to enroll silently here and then do the following
        if (isJobaidContentTypeUrl(training)) {
          window.open(getJobaidUrl(training), "_blank");
        } else {
          LaunchPlayer({ trainingId: training.id });
        }
      } catch (error) {
        //TODO : handle error
      }
      return;
    }
    //TODO: if user Loggedin --

    if (training.enrollment) {
      alm.navigateToTrainingOverviewPage(
        training.id,
        training.enrollment.loInstance.id
      );
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
    skillNames,
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
    enrollment,
    cardClickHandler,
    training,
    bannerUrl,
  };
  //date create, published, duration
};
