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
import Star from "@spectrum-icons/workflow/Star";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectSkill,
  PrimeLocalizationMetadata,
  PrimeResource,
} from "../models/PrimeModels";
import {
  AUTO_ENROLL,
  COURSE,
  ELEARNING,
  ENGLISH_LOCALE,
  LEARNING_PROGRAM,
  TRAINING_INSTANCE_ID_STR,
} from "./constants";
import { getALMConfig, getALMObject } from "./global";
import { checkIfCompletionDeadlineNotPassed } from "./instance";
import { GetTileColor, GetTileImageFromId } from "./themes";
import { getPreferredLocalizedMetadata } from "./translationService";
import { RestAdapter } from "./restAdapter";
import { JsonApiParse } from "./jsonAPIAdapter";
import { ratingFormatter } from "../components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { getActiveInstances } from "./catalog";

interface CardIconDetials {
  cardIconUrl: string;
  color: string;
  bannerUrl: string;
  cardBgStyle: CardBgStyle;
  listThumbnailBgStyle: CardBgStyle;
}

const useCardIcon = (training: PrimeLearningObject, backgroundSize?: string) => {
  const { account } = useAccount();
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
    const cardIconUrl = account.enableCardIcons ? GetTileImageFromId(training.id) : "";
    const color = GetTileColor(training.id);
    return {
      cardIconUrl,
      color: color,
      bannerUrl: training?.bannerUrl,
      cardBgStyle: getCardBackgroundStyle(training, cardIconUrl, color, false),
      listThumbnailBgStyle: getCardBackgroundStyle(
        training,
        cardIconUrl,
        color,
        true,
        backgroundSize
      ),
    };
  }, [training?.id, account]);

  return {
    ...cardIconDetials,
  };
};

const getCardBackgroundStyle = (
  training: PrimeLearningObject,
  cardIconUrl: string,
  color: string,
  isListView?: boolean,
  backgroundSize?: string
): CardBgStyle => {
  if (!training) {
    return {};
  }
  const url = cardIconUrl || "";
  return training.imageUrl
    ? {
        backgroundImage: `url("${training.imageUrl}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: `${color}`,
      }
    : {
        backgroundColor: `${color}`,
        backgroundImage: `url(${url})`,
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${isListView ? backgroundSize || "80px" : "120px"}`,
      };
};
const formattedSkill = (skill: PrimeLearningObjectSkill) => {
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
};
const useTrainingSkills = (training: PrimeLearningObject): Skill[] => {
  return useMemo(() => {
    const collectSkills = (lo: PrimeLearningObject): Skill[] => {
      // Collect skills from the current learning object
      let skills =
        lo?.skills?.filter(skill => skill.learningObjectId === lo.id).map(formattedSkill) || [];

      // If no skills are found, recursively collect skills from subLOs
      if (skills.length === 0 && lo?.subLOs?.length > 0) {
        lo.subLOs.forEach(subLO => {
          skills = skills.concat(collectSkills(subLO));
        });
      }

      return skills;
    };

    return collectSkills(training);
  }, [training]);
};

const useBadge = (trainingInstance: PrimeLearningObjectInstance): InstanceBadge => {
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
};

const getLocale = (
  trainingInstance: PrimeLearningObjectInstance,
  locale: Set<string>,
  currentLocale: string
) => {
  if (trainingInstance && trainingInstance.loResources) {
    trainingInstance.loResources.forEach(loResource => {
      //Get locale for only self paced resources
      loResource?.resourceType === ELEARNING &&
        loResource.resources?.forEach(resource => {
          const resourceLocale = resource?.locale;
          if (resourceLocale !== currentLocale) {
            locale.add(resourceLocale);
          }
        });
    });
  }
};

const getEnrollment = (
  training: PrimeLearningObject,
  trainingInstance: PrimeLearningObjectInstance
) => {
  return training.loType === COURSE && trainingInstance
    ? trainingInstance.enrollment
    : training.enrollment;
};

const filterTrainingInstance = (training: PrimeLearningObject, instanceId: string = "") => {
  // If there is only one active instance, navigate to that instance only
  const activeInstances = getActiveInstances(training);
  if (activeInstances.length === 1) {
    return activeInstances[0];
  }

  const primaryEnrollment = training.enrollment;

  let instances = training.instances;
  const isValidEnrollment = checkIfEntityIsValid(primaryEnrollment);
  if (primaryEnrollment && isValidEnrollment) {
    instances = [...instances, primaryEnrollment.loInstance];
  }

  const trainingInstances = instances.filter(instance => {
    if (!instance) {
      return [];
    }

    if (instanceId) {
      return instance.id === instanceId;
    } else if (primaryEnrollment && isValidEnrollment && primaryEnrollment.loInstance) {
      return instance.id === primaryEnrollment.loInstance.id;
    }
    return instance.isDefault; //&& instance.state == "Active";
  });

  return trainingInstances.length ? trainingInstances[0] : ({} as PrimeLearningObjectInstance);
};
const filterLoReourcesBasedOnResourceType = (
  trainingInstance: PrimeLearningObjectInstance,
  loResourceType: string
): PrimeLearningObjectResource[] => {
  return (
    trainingInstance?.loResources?.filter(
      (loResource: PrimeLearningObjectResource) => loResource.loResourceType === loResourceType
    ) || []
  );
};

const useCanShowRating = (training: PrimeLearningObject) => {
  const { account } = useAccount();
  return (
    (training.loType === LEARNING_PROGRAM || training.loType === COURSE) && account?.showRating
  );
};

const filteredResource = (resources: PrimeResource[], locale: string) => {
  if (!resources || resources.length === 0) {
    return {} as PrimeResource;
  }
  return resources.filter(item => item.locale === locale)[0] || resources[0];
};

const useResource = (
  loResource: PrimeLearningObjectResource,
  locale: string = ENGLISH_LOCALE
): PrimeResource => {
  return useMemo(() => {
    return filteredResource(loResource?.resources, locale);
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
  if (instances.length === 1) {
    return true;
  }
  let count = 0;
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    if (
      (instance.state === "Active" && checkIfCompletionDeadlineNotPassed(instance)) ||
      instance.enrollment
    ) {
      count++;
    }
    if (count > 1) {
      return false;
    }
  }
  return count === 0 ? false : true;
};

const getEnrolledInstancesCount = (training: PrimeLearningObject) => {
  if (training.loType !== COURSE) {
    return training.enrollment ? 1 : 0;
  }
  const instances = training.instances;
  let count = 0;
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    if (instance.enrollment) {
      count++;
    }
  }
  return count;
};

const isEnrolledInAutoInstance = (training: PrimeLearningObject) => {
  return training.enrollment?.enrollmentSource === AUTO_ENROLL;
};

const isEnrolledInstanceAutoInstance = (training: PrimeLearningObject) => {
  return training?.enrollment?.loInstance?.isAET;
};

const getBreadcrumbPath = () => {
  let breadcrumbPathString = getALMObject().storage.getItem("breadcrumbPath") || "";

  return breadcrumbPathString
    ? JSON.parse(breadcrumbPathString)
    : { parentPath: [], currentPath: "" };
};

const pushToBreadcrumbPath = (path: string, currentTraining: string) => {
  let breadcrumbPath = getBreadcrumbPath();
  breadcrumbPath.parentPath.push(path);
  breadcrumbPath.currentPath = currentTraining;

  getALMObject().storage.setItem("breadcrumbPath", JSON.stringify(breadcrumbPath));
};

const popFromBreadcrumbPath = (loId: string) => {
  const breadcrumbPath = getBreadcrumbPath();

  while (breadcrumbPath.parentPath.length > 0) {
    let item = breadcrumbPath.parentPath.pop();
    breadcrumbPath.currentPath = item;
    if (item.startsWith(loId)) {
      getALMObject().storage.setItem("breadcrumbPath", JSON.stringify(breadcrumbPath));
      return;
    }
  }
};

const clearBreadcrumbPathDetails = () => {
  getALMObject().storage.removeItem("breadcrumbPath");
};

const getTrainingUrl = (url: string) => {
  if (url.includes(`/${TRAINING_INSTANCE_ID_STR}`)) {
    url = url.substring(0, url.indexOf(`/${TRAINING_INSTANCE_ID_STR}`));
  }
  return url;
};

const getLocalizedData = (
  localizedMetadata: PrimeLocalizationMetadata[],
  locale = ENGLISH_LOCALE
) => {
  if (localizedMetadata.length === 0) {
    return {
      description: "",
      name: "",
      overview: "",
      locale: "unknown",
      richTextOverview: "",
    };
  }

  let ret: PrimeLocalizationMetadata = localizedMetadata[0];
  localizedMetadata.forEach(lm => {
    if (lm.locale == locale) {
      ret = lm;
    }
  });

  return ret;
};

export function setHttp(link: string): string {
  if (link.search(/^http[s]?:\/\//) === -1) {
    link = "http://" + link;
  }
  return link;
}

const getDuration = (learningObjectResources: PrimeLearningObjectResource[], locale: string) => {
  let duration = 0;
  learningObjectResources?.forEach(learningObjectResource => {
    const resource = filteredResource(learningObjectResource?.resources, locale);
    const resDuration = resource?.authorDesiredDuration || resource?.desiredDuration || 0;
    duration += resDuration;
  });
  return duration;
};

const getCoursesInsideFlexLP = (
  training: PrimeLearningObject,
  isFlexible: boolean
): PrimeLearningObject[] => {
  if (!training.subLOs) {
    return [];
  }

  return training.subLOs.reduce((result: PrimeLearningObject[], subLO: PrimeLearningObject) => {
    if (subLO.loType === COURSE && isFlexible) {
      result.push(subLO);
    } else if (subLO.loType === LEARNING_PROGRAM && subLO.instances[0].isFlexible) {
      result.push(...subLO.subLOs);
    }
    return result;
  }, []);
};

const hasFlexibleChildLP = (training: PrimeLearningObject): boolean => {
  if (!training.subLOs) {
    return false;
  }
  for (const subLO of training.subLOs) {
    // checking first instance
    if (subLO.loType === LEARNING_PROGRAM && subLO.instances[0].isFlexible) {
      return true;
    }
  }
  return false;
};

const getCourseInstanceMapping = (courseInstanceMapping: any, loId: string) => {
  return Object.keys(courseInstanceMapping).length > 0 && courseInstanceMapping[loId];
};

const checkIfEntityIsValid = (item: any) => {
  return item && !item.id.includes("-1");
};
const isValidSubLoForFlexLpToLaunch = (subLo: PrimeLearningObject) => {
  const enrollment = subLo.enrollment;
  return (
    enrollment && checkIfEntityIsValid(enrollment) && checkIfEntityIsValid(enrollment.loInstance)
  );
};

const getConflictingSessions = async (trainingId: string, instanceId: string) => {
  const url = `${getALMConfig().primeApiURL}learningObjects/${trainingId}/instances/${instanceId}/conflictingSessions`;
  const response = await RestAdapter.get({ url });
  return JsonApiParse(response).sessionConflictList;
};

const useRatingsTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  formatMessage: (message: any, messageParams: any) => string,
  training: PrimeLearningObject
) => {
  const { ratingsContainer, starContainer, rating: styleRating } = styles;
  const rating = training.rating;
  return useMemo(() => {
    if (!rating || rating.ratingsCount === 0) {
      return null;
    }
    const { ratingsCount, averageRating: avgRating } = rating;
    const ratingCountLabel = ratingFormatter(ratingsCount);
    let messageId = "text.starRatingForUsers";
    let messageParams: any = { avgRating, ratingsCount: ratingCountLabel };
    if (ratingsCount === 1) {
      messageId = "text.starRatingForUser";
      messageParams = { avgRating };
    }

    const ratingLabel = formatMessage({ id: messageId }, messageParams);

    return (
      <div className={`${ratingsContainer} ${starContainer}`} title={ratingLabel}>
        {<Star />}
        <span className={`${styleRating}`}>{avgRating}/5</span> ({ratingCountLabel})
      </div>
    );
  }, [formatMessage, styleRating, ratingsContainer, starContainer, rating]);
};
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
  isEnrolledInstanceAutoInstance,
  getBreadcrumbPath,
  pushToBreadcrumbPath,
  popFromBreadcrumbPath,
  clearBreadcrumbPathDetails,
  getTrainingUrl,
  getLocalizedData,
  getDuration,
  getCoursesInsideFlexLP,
  hasFlexibleChildLP,
  getCourseInstanceMapping,
  getConflictingSessions,
  useRatingsTemplate,
  isValidSubLoForFlexLpToLaunch,
  checkIfEntityIsValid,
};
