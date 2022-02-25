import { useCallback, useMemo } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";
import { cardColors } from "../../common/Theme";

import {
  getJobaidUrl,
  isJobaid,
  isJobaidContentTypeUrl,
  getActiveInstances,
  getDefaultIntsance,
} from "../../utils/catalog";
import { getALMObject } from "../../utils/global";

import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { useCardBackgroundStyle, useCardIcon } from "../../utils/hooks";

export const useTrainingCard = (training: PrimeLearningObject) => {
  const { locale } = useConfigContext();

  const {
    loFormat: format,
    loType: type,
    id,
    skills,
    rating,
    imageUrl,
    state,
    tags,
    authorNames,
    enrollment,
  } = training;

  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const {
    cardIconUrl = "",
    color = "",
    bannerUrl = "",
  } = useCardIcon(training);

  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);

  const cardClickHandler = useCallback(() => {
    if (!training) return;

    //if jobAid, need to enroll and open player or new tab
    if (isJobaid(training)) {
      console.log("This is a JOBAid");
      //if user logged in, then enroll if not already enrolled.
      //training.enrollment
      //need to enroll silently here and then do the following
      if (isJobaidContentTypeUrl(training)) {
        window.open(getJobaidUrl(training), "_blank");
      } else {
        // need to open the player here
        console.log("Open Player here");
      }
      return;
    }
    //TODO: if user Loggedin --
    let alm = getALMObject();
    if (training.enrollment) {
      alm?.redirectToTrainingOverview(
        training.id,
        training.enrollment.loInstance.id
      );
      return;
    }
    const activeInstances = getActiveInstances(training);
    if (activeInstances?.length === 1) {
      alm?.redirectToTrainingOverview(training.id, activeInstances[0].id);
      return;
    }
    if (activeInstances?.length === 0) {
      const defaultInstance = getDefaultIntsance(training);
      alm?.redirectToTrainingOverview(training.id, defaultInstance[0]?.id);
      return;
    }
    alm?.redirectToInstancePage(training.id);
  }, [training]);

  return {
    id,
    format,
    type,
    skills,
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
