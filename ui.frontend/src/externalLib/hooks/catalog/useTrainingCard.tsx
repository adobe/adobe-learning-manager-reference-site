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
} from "../../utils/catalog";

import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { useCardBackgroundStyle, useCardIcon } from "../../utils/hooks";

export const useTrainingCard = (training: PrimeLearningObject) => {
  const { locale, pagePaths } = useConfigContext();
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

    console.log("redirecting to Overview Page");
    (window as any).location = pagePaths.trainingOverview;
    //if user Loggedin
    //training.enrollment.loInstance
    //if enrollment is there ---got overview with instance and return

    //if single Active instance --- go to overview
    // else show instance page

    console.log("This is not a JOBAid");

    // if (shouldRedirectToInstanceScreen(training)) {
    //   console.log("redirect to Instance Screen", training.enrollment);
    // } else {
    //   console.log(
    //     "redirect to Overview Screen",
    //     training.enrollment.dateEnrolled
    //   );
    // }
  }, [pagePaths.trainingOverview, training]);

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
