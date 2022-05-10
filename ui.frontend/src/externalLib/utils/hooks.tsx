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
import { useMemo } from "react";
import { cardColors } from "../common/Theme";
import { CardBgStyle, InstanceBadge, Skill } from "../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLocalizationMetadata,
  PrimeResource,
} from "../models/PrimeModels";
import { getPreferredLocalizedMetadata } from "./translationService";

const useCardIcon = (training: PrimeLearningObject) => {
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
    const colorCode = training
      ? parseInt(training.id?.split(":")[1], 10) % 12
      : 0;

    return {
      //TODO: updated the url to akamai from config
      cardIconUrl: `https://cpcontents.adobe.com/public/images/default_card_icons/${colorCode}.svg`,
      color: themeColors[colorCode],
      bannerUrl: training?.bannerUrl,
    };
  }, [training]);

  return {
    ...cardIconDetials,
  };
};

const useCardBackgroundStyle = (
  training: PrimeLearningObject,
  cardIconUrl: string,
  color: string
): CardBgStyle => {
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

const useLocalizedMetaData = (
  training: PrimeLearningObject,
  locale: string
) => {
  return useMemo((): PrimeLocalizationMetadata => {
    if (!training) {
      return {} as PrimeLocalizationMetadata;
    }
    return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
  }, [training, locale]);
};

const filterTrainingInstance = (
  training: PrimeLearningObject,
  instanceId: string = ""
) => {
  const enrollment = training.enrollment;
  instanceId = enrollment?.loInstance.id || instanceId;

  let instances = training.instances;
  if (enrollment) {
    instances = [...instances, enrollment.loInstance];
  }

  const trainingInstances = instances.filter((instance) => {
    if (instanceId) {
      return instance.id === instanceId;
    } else {
      return instance.isDefault; //&& instance.state == "Active";
    }
  });
  return trainingInstances.length
    ? trainingInstances[0]
    : ({} as PrimeLearningObjectInstance);
};
const filterLoReourcesBasedOnResourceType = (
  trainingInstance: PrimeLearningObjectInstance,
  loResourceType: string
): PrimeLearningObjectResource[] => {
  return trainingInstance?.loResources?.filter(
    (loResource: PrimeLearningObjectResource) =>
      loResource.loResourceType === loResourceType
  );
};

const filteredResource = (
  loResource: PrimeLearningObjectResource,
  locale: string
) => {
  return (
    loResource.resources.filter((item) => item.locale === locale)[0] ||
    loResource.resources[0]
  );
};

const useResource = (
  loResource: PrimeLearningObjectResource,
  locale: string = "en-US"
): PrimeResource => {
  return useMemo(() => {
    return filteredResource(loResource, locale);
  }, [loResource, locale]);
};

export {
  useCardIcon,
  useCardBackgroundStyle,
  useSkills,
  useBadge,
  useLocalizedMetaData,
  filterTrainingInstance,
  filterLoReourcesBasedOnResourceType,
  useResource,
  filteredResource,
};
