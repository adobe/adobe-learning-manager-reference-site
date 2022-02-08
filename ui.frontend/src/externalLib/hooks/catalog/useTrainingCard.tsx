import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";

import { getPreferredLocalizedMetadata } from "../../utils/getPreferredLocalizedMetadata";

const DEFAULT_LOCALE = "en-US";
export const colors: { [key: string]: string[] } = {
  "prime-default": [
    "#455d88",
    "#487789",
    "#4d728f",
    "#65747b",
    "#6aa0aa",
    "#7390a5",
    "#787c80",
    "#84767e",
    "#859072",
    "#a2988f",
    "#bdb4b4",
    "#bfa47a",
  ],
  "prime-autumn": [
    "#cc7a7a",
    "#e8c367",
    "#e0a168",
    "#f29b5f",
    "#cca691",
    "#e2b788",
    "#da9084",
    "#dd756b",
    "#d89b8f",
    "#f2ab6a",
    "#e6bfbf",
    "#a58499",
  ],
  "prime-carnival": [
    "#19277c",
    "#2d9bd8",
    "#2ccddd",
    "#6fce98",
    "#e55c5c",
    "#756dbf",
    "#f29e57",
    "#a8548c",
    "#66aa9d",
    "#9c65b8",
    "#57caf2",
    "#f9c94f",
  ],
  "prime-pebbles": [
    "#626b99",
    "#7aabcc",
    "#8fc6cc",
    "#beccb6",
    "#d88a82",
    "#827daf",
    "#ccaf8f",
    "#af82a2",
    "#79b5aa",
    "#af7d7d",
    "#6b99b2",
    "#ddc587",
  ],
  "prime-wintersky": [
    "#6b99b2",
    "#439bba",
    "#7aabcc",
    "#61c1db",
    "#8fc6cc",
    "#bcccaa",
    "#beccb6",
    "#c9c6af",
    "#bfc4b8",
    "#a5beb9",
    "#7fabaf",
    "#649ea7",
  ],
  "prime-accessible": [
    "#075a20",
    "#008099",
    "#0a852f",
    "#9f52cb",
    "#4568f2",
    "#ad5700",
    "#C74E1F",
    "#474747",
    "#d23b00",
    "#737373",
    "#007ab8",
    "#99157a",
  ],
};

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
    const themeColors = colors["prime-pebbles"];
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
  };
  //date create, published, duration
};

/**
 * imageUrl,
    duration,
    enrollmentType,
    state,
    rating,
    authorNames,
    bannerUrl,
    dateCreated,
    datePublished,
    dateUpdated,
 */

/**
     *
{
	id	
	format --> Self Paced,
	skills,
	type --> course etc.
	price,
	rating -- {averageRating: 5, ratingsCount: 1}
	image --- if Not-- cardIcon & color
	state
	tags
	authorNaames:[]
	name,description --> based on locale else en-us
	
	progressbar,

}
     */

//   let data = training.localizedMetadata.find(
//     (item) => item.locale === locale
//   );
//   //TO DO: Need to check with Yogesh on this preferences
//   return (
//     data ||
//     training.localizedMetadata.find(
//       (item) => item.locale === DEFAULT_LOCALE
//     )! ||
//     training.localizedMetadata[0]
