import { useEffect, useMemo, useState } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";

import { getPreferredLocalizedMetadata } from "../../utils/getPreferredLocalizedMetadata";
import { QueryParams } from "../../utils/restAdapter";
//import { cardColors } from "../../common/Theme";

//const DEFAULT_LOCALE = "en-US";
const DEFAULT_INCLUDE_LO_OVERVIEW = "enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";
  //"enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";

export interface Skill {
  name: string,
  levelName: string,
  level: string,
  credits: number, 
  maxCredits: number,
  type: string, 
  badgeName: string,
  badgeUrl: string,
  badgeState: string
}

export const useTrainingPage = (
  trainingId: string,
  instanceId: string,
  params: QueryParams = {}
) => {
  const { locale } = useConfigContext();
 
  const [currentState, setCurrentState] = useState( {trainingInstance: {} as PrimeLearningObjectInstance,isLoading:true});
  // const [trainingInstance, setTrainingInstance] = useState({} as PrimeLearningObjectInstance);
  // const [isLoading, setIsLoading] = useState(true);
  const {trainingInstance, isLoading} = currentState;
  const training = trainingInstance.learningObject;
  // const {
  //   rating = {},
  //   enrollment = {},
  // } = training;

  useEffect(() => {
    const getTrainingInstance = async () => {
      try {
        let queryParam: QueryParams = {};
        queryParam["include"] = params.include || DEFAULT_INCLUDE_LO_OVERVIEW;
        queryParam["useCache"] = true;
        queryParam["filter.ignoreEnhancedLP"] = false;
        const response = await APIServiceInstance.getTraining(trainingId, queryParam);
        //ToDO : handle
        if (response) {
          const trainingInstances = response.instances.filter(instance => instance.id == instanceId);
          const trainingInstance = trainingInstances.length ? trainingInstances[0] : {} as PrimeLearningObjectInstance;
          // setTrainingInstance(trainingInstance);
          // setIsLoading(false);
          setCurrentState({trainingInstance, isLoading: false });
        }
      } catch (e) {
        console.log("Error while loading training " + e);
        setCurrentState({trainingInstance: {} as PrimeLearningObjectInstance, isLoading: false });
      }
    };
    getTrainingInstance();
  }, [trainingId,instanceId,params.include]);

  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      if(!training) {
        return {} as PrimeLocalizationMetadata;
      }
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training,locale]);

  // const { cardIconUrl, color }: { [key: string]: string } = useMemo(() => {
  //   //TO-DO pick from attributes or fall back to one default set of colors
  //   const themeColors = cardColors["prime-pebbles"];
  //   const colorCode = parseInt(training.id.split(":")[1], 10) % 12;

  //   return {
  //     //TODO: updated the url to akamai from config
  //     cardIconUrl: `https://cpcontentsdev.adobe.com/public/images/default_card_icons/${colorCode}.svg`,
  //     color: themeColors[colorCode],
  //   };
  //   //calculate the cardIcon and color
  // }, [training.id]);


  const skills: Skill[] = useMemo(() => {
      if(!training) {
        return [];
      }
      const trainingSkills = training.skills.map(skill => {
      const skillLevel = skill.skillLevel;
      const badge = skillLevel.badge;
      return { 
                name: skillLevel.skill.name,
                levelName: skillLevel.name,
                level: skillLevel.level,
                credits: skill.credits, 
                maxCredits: skillLevel.maxCredits,
                type: skill.type, 
                badgeName: badge.name,
                badgeUrl: badge.imageUrl,
                badgeState: badge.state
              }
    });


    return trainingSkills;
    //calculate the cardIcon and color
  }, [training]);



 

  return {
    name,
    description,
    overview,
    richTextOverview,
    // cardIconUrl,
    // color,
    //rating,
    skills,
    //enrollment,
    training,
    trainingInstance,
    isLoading
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