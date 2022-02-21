import { useMemo } from "react";
import { cardColors } from "../common/Theme";
import { useConfigContext } from "../contextProviders/configContextProvider";
import { PrimeLearningObject } from "../models/PrimeModels";

const useCardIcon = (training: PrimeLearningObject) => {
  const { cdnBaseUrl } = useConfigContext();
  const cardIconDetials: { [key: string]: string } = useMemo(() => {
    //TO-DO pick from attributes or fall back to one default set of colors
    const themeColors = cardColors["prime-default"];
    const colorCode = parseInt(training.id?.split(":")[1], 10) % 12;

    return {
      //TODO: updated the url to akamai from config
      cardIconUrl: `${cdnBaseUrl}/public/images/default_card_icons/${colorCode}.svg`,
      color: themeColors[colorCode],
      bannerUrl: training?.bannerUrl,
    };
  }, [cdnBaseUrl, training?.bannerUrl, training?.id]);

  return {
    ...cardIconDetials,
  };
};

const useCardBackgroundStyle = (
  training: PrimeLearningObject,
  cardIconUrl: string,
  color: string
) => {
  return useMemo(() => {
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
};

export { useCardIcon, useCardBackgroundStyle };
