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

  const { cardIconUrl, color }: { [key: string]: string } = useMemo(() => {
    if (training.imageUrl) return { cardIconUrl: "", color: "" };
    //need to get theme from the account state
    const themeColors = cardColors["prime-pebbles"];
    const colorCode = parseInt(training.id.split(":")[1], 10) % 12;

    return {
      //TODO: updated the url to akamai from config
      cardIconUrl: `https://cpcontentsdev.adobe.com/public/images/default_card_icons/${colorCode}.svg`,
      color: themeColors[colorCode],
    };
    //calculate the cardIcon and color
  }, [training.id, training.imageUrl]);

  const cardBgStyle = useMemo(() => {
    return training.imageUrl
      ? {
          backgroundImage: `url(${training.imageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }
      : {
          background: `${color} url(
            ${cardIconUrl}
        ) center center no-repeat`,
          backgroundSize: "80px",
        };
  }, [cardIconUrl, color, training.imageUrl]);

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
  };
  //date create, published, duration
};
