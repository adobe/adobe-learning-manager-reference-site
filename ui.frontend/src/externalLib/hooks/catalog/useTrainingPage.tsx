import { useEffect, useMemo, useState } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";

import { getPreferredLocalizedMetadata } from "../../utils/translationService";
import { QueryParams } from "../../utils/restAdapter";
import { useCardIcon } from "../../utils/hooks";

//const DEFAULT_LOCALE = "en-US";
const DEFAULT_INCLUDE_LO_OVERVIEW =
  "enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";
//"enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";

export interface Skill {
  name: string;
  levelName: string;
  level: string;
  credits: number;
  maxCredits: number;
  type: string;
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export interface InstanceBadge {
  badgeName: string;
  badgeUrl: string;
  badgeState: string;
}

export const useTrainingPage = (
  trainingId: string,
  instanceId: string,
  params: QueryParams = {}
) => {
  const { locale } = useConfigContext();

  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isLoading: true,
  });
  const { trainingInstance, isLoading } = currentState;
  const training = trainingInstance.learningObject;

  useEffect(() => {
    const getTrainingInstance = async () => {
      try {
        let queryParam: QueryParams = {};
        queryParam["include"] = params.include || DEFAULT_INCLUDE_LO_OVERVIEW;
        queryParam["useCache"] = true;
        queryParam["filter.ignoreEnhancedLP"] = false;
        const response = await APIServiceInstance.getTraining(
          trainingId,
          queryParam
        );
        //ToDO : handle
        if (response) {
          const trainingInstances = response.instances.filter(
            (instance) => instance.id === instanceId
          );
          const trainingInstance = trainingInstances.length
            ? trainingInstances[0]
            : ({} as PrimeLearningObjectInstance);
          setCurrentState({ trainingInstance, isLoading: false });
        }
      } catch (e) {
        console.log("Error while loading training " + e);
        setCurrentState({
          trainingInstance: {} as PrimeLearningObjectInstance,
          isLoading: false,
        });
      }
    };
    getTrainingInstance();
  }, [trainingId, instanceId, params.include]);

  const {
    name = "",
    description = "",
    overview = "",
    richTextOverview = "",
  } = useMemo((): PrimeLocalizationMetadata => {
    if (!training) {
      return {} as PrimeLocalizationMetadata;
    }
    return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
  }, [training, locale]);

  const {
    cardIconUrl = "",
    color = "",
    bannerUrl = "",
  } = useCardIcon(training);

  const skills: Skill[] = useMemo(() => {
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

  const instanceBadge: InstanceBadge = useMemo(() => {
    return {
      badgeName: trainingInstance?.badge?.name,
      badgeState: trainingInstance?.badge?.state,
      badgeUrl: trainingInstance?.badge?.imageUrl,
    };
  }, [trainingInstance]);

  return {
    name,
    description,
    overview,
    richTextOverview,
    cardIconUrl,
    color,
    bannerUrl,
    //rating,
    skills,
    //enrollment,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
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
