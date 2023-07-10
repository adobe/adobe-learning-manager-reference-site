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
import { useAccount } from "../hooks/account/useAccount";
import { CardBgStyle, InstanceBadge, Skill } from "../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLocalizationMetadata,
  PrimeResource,
} from "../models/PrimeModels";
import { COURSE, LEARNING_PROGRAM, TRAINING_INSTANCE_ID_STR } from "./constants";
import { getALMConfig, getALMObject } from "./global";
import { checkIfCompletionDeadlineNotPassed } from "./instance";
import { themesMap } from "./themes";
import { getPreferredLocalizedMetadata } from "./translationService";

interface CardIconDetials {
  cardIconUrl: string;
  color: string;
  bannerUrl: string;
  cardBgStyle: CardBgStyle;
  listThumbnailBgStyle: CardBgStyle;
}

const useCardIcon = (training: PrimeLearningObject) => {
  const cardIconDetials: CardIconDetials = useMemo(() => {
    if (!training) {
      return {
        cardIconUrl: "",
        color: "",
        bannerUrl: "",
        cardBgStyle: {} as CardBgStyle,
        listThumbnailBgStyle: {} as CardBgStyle,
      };
    }

    const theme = getALMConfig().themeData;
    const themeColors = theme
      ? themesMap[theme.name]
      : themesMap["Prime Default"];
    const colorCode = training
      ? parseInt(training.id?.split(":")[1], 10) % 12
      : 0;

    const cardIconUrl = `https://cpcontents.adobe.com/public/images/default_card_icons/${colorCode}.svg`;
    const color = themeColors[colorCode];
    return {
      cardIconUrl: cardIconUrl,
      color: color,
      bannerUrl: training?.bannerUrl,
      cardBgStyle: getCardBackgroundStyle(training, cardIconUrl, color, false),
      listThumbnailBgStyle: getCardBackgroundStyle(
        training,
        cardIconUrl,
        color,
        true
      ),
    };
  }, [training]);

  return {
    ...cardIconDetials,
  };
};

const getCardBackgroundStyle = (
  training: PrimeLearningObject,
  cardIconUrl: string,
  color: string,
  isListView?: boolean
): CardBgStyle => {
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
        backgroundSize: isListView ? "40px" : "80px",
      };
};

const useTrainingSkills = (training: PrimeLearningObject): Skill[] => {
  return useMemo(() => {
    const trainingSkills = training?.skills?.map((skill) => {
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

const getLocale = (
  trainingInstance: PrimeLearningObjectInstance,
  locale: Set<string>,
  currentLocale: string
) => {
  if (trainingInstance && trainingInstance.loResources) {
    trainingInstance.loResources.forEach((loResource) => {
      loResource.resources?.forEach((resource) => {
        if (resource?.locale !== currentLocale) {
          locale.add(resource?.locale);
        }
      });
    });
  }
};

const getEnrollment = (
  training: PrimeLearningObject,
  trainingInstance: PrimeLearningObjectInstance
) => {

  return ((training.loType === COURSE && trainingInstance) ? trainingInstance.enrollment : training.enrollment);
};

const filterTrainingInstance = (
  training: PrimeLearningObject,
  instanceId: string = ""
) => {
  const primaryEnrollment = training.enrollment;

  let instances = training.instances;
  if (primaryEnrollment) {
    instances = [...instances, primaryEnrollment.loInstance];
  }

  const trainingInstances = instances.filter((instance) => {
    if (instanceId) {
      return instance.id === instanceId;
    } else if (primaryEnrollment) {
      return instance.id === primaryEnrollment.loInstance.id;
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

const useCanShowRating = (training: PrimeLearningObject) => {
  const { account } = useAccount();
  return (
    (training.loType === LEARNING_PROGRAM || training.loType === COURSE) &&
    account?.showRating
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

const getLoId = (loDetails: string) => {
  return loDetails.split("::")[0];
};

const getLoName = (loDetails: string) => {
  return loDetails.split("::")[1];
};

const hasSingleActiveInstance = (learningObject: PrimeLearningObject) => {
  const instances = learningObject.instances;
  if(instances.length === 1){
    return true;
  }
  let count = 0;
  for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      if ((instance.state === "Active" && checkIfCompletionDeadlineNotPassed(instance)) || instance.enrollment ) {
          count++;
      }
      if (count > 1) {
          return false;
      }
  }
  return count === 0 ? false : true;
}

const getEnrolledInstancesCount = (training: PrimeLearningObject) => {

  const instances = training.instances;
  let count = 0;
  for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      if (instance.enrollment) {
          count++;
      }
  }
  return count;

}

const isEnrolledInAutoInstance = (training: PrimeLearningObject) => {
  return training.enrollment?.enrollmentSource === "AUTO_ENROLL" && 
  (training.instances!.findIndex((item) => item.id === training.enrollment.loInstance.id) === -1 ? true:false);
}

const getParentPathStack=() => {
  let parentPathString = getALMObject().storage.getItem("parentPath") || "";
  if (!parentPathString) {
    return [];
  }
  return JSON.parse(parentPathString);
}

const pushToParentPathStack = (path: string) => {

  let parentPathStack = getParentPathStack();
  parentPathStack.push(path);
  getALMObject().storage.setItem("parentPath", JSON.stringify(parentPathStack));
  
}

const popFromParentPathStack = (loId: string) => {

  let parentPathStack = getParentPathStack();

  while (parentPathStack.length > 0) {
    let item = parentPathStack.pop();
    if (item.startsWith(loId)) {
      getALMObject().storage.setItem("parentPath", JSON.stringify(parentPathStack));
      return;
    }
  }
}

const clearParentLoDetails = () => {
  getALMObject().storage.removeItem("parentPath");
}

const getTrainingUrl = (url : string) => {

  if(url.includes(`/${TRAINING_INSTANCE_ID_STR}`)){
    url = url.substring(0,url.indexOf(`/${TRAINING_INSTANCE_ID_STR}`));
  }
  return url;
}

export {
  useCardIcon,
  useTrainingSkills,
  useBadge,
  useLocalizedMetaData,
  filterTrainingInstance,
  filterLoReourcesBasedOnResourceType,
  useResource,
  filteredResource,
  getLocale,
  useCanShowRating,
  getLoName,
  getLoId,
  hasSingleActiveInstance,
  getEnrolledInstancesCount,
  getEnrollment,
  isEnrolledInAutoInstance,
  getParentPathStack,
  pushToParentPathStack,
  popFromParentPathStack,
  clearParentLoDetails,
  getTrainingUrl
};
