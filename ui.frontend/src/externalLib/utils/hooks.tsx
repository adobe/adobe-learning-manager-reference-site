import { useMemo } from "react";
import { cardColors } from "../common/Theme";
import { useConfigContext } from "../contextProviders/configContextProvider";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
} from "../models/PrimeModels";
import { Skill, InstanceBadge } from "../models/common";
import { getPreferredLocalizedMetadata } from "./translationService";

const useCardIcon = (training: PrimeLearningObject) => {
  const { cdnBaseUrl } = useConfigContext();
  const cardIconDetials: { [key: string]: string } = useMemo(() => {
    if (!training) {
      return {
        cardIconUrl: "",
        color: "",
        bannerUrl: "",
      };
    }
    //TO-DO pick from attributes or fall back to one default set of colors
    const themeColors = cardColors["prime-default"];
    const colorCode = training? parseInt(training.id?.split(":")[1], 10) % 12 : 0;

    return {
      //TODO: updated the url to akamai from config
      cardIconUrl: `${cdnBaseUrl}/public/images/default_card_icons/${colorCode}.svg`,
      color: themeColors[colorCode],
      bannerUrl: training?.bannerUrl,
    };
  }, [cdnBaseUrl, training]);

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
    if (!training) {
      return {};
    }
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
  }, [cardIconUrl, color, training]);
};

const useSkills = (training: PrimeLearningObject): Skill[] => {
  return useMemo(() => {
    const trainingSkills = training?.skills.map((skill) => {
      const skillLevel = skill.skillLevel;
      const badge = skillLevel.badge;
      return {
        name: skillLevel.skill.name,
        levelName: skillLevel.name,
        level: skillLevel.level,
        credits: skill.credits,
        maxCredits: skillLevel.maxCredits,
        type: skill.type,
        badgeName: badge?.name,
        badgeUrl: badge?.imageUrl,
        badgeState: badge?.state,
      };
    });
    return trainingSkills;
  }, [training]);
};

const useBadge = (
  trainingInstance: PrimeLearningObjectInstance
): InstanceBadge => {
  return useMemo(() => {
    return {
      badgeName: trainingInstance?.badge?.name,
      badgeState: trainingInstance?.badge?.state,
      badgeUrl: trainingInstance?.badge?.imageUrl,
    };
  }, [trainingInstance]);
};


const useLocalizedMetaData = (training: PrimeLearningObject, locale: string) => {
  return useMemo((): PrimeLocalizationMetadata => {
    if (!training) {
      return {} as PrimeLocalizationMetadata;
    }
    return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
  }, [training, locale]);
  
}

const filterTrainingInstance = (training: PrimeLearningObject, instanceId: string = "") => {
    const enrollment = training.enrollment;
    instanceId = enrollment?.loInstance.id || instanceId; 
    const trainingInstances = training.instances.filter(
      (instance) => {
        if(instanceId) {
          return instance.id === instanceId;
        } else {
          return instance.isDefault && instance.state == "Active";
        }
      }
    );
    return trainingInstances.length
      ? trainingInstances[0]
      : ({} as PrimeLearningObjectInstance);
}


export { useCardIcon, useCardBackgroundStyle, useSkills, useBadge, useLocalizedMetaData, filterTrainingInstance };
