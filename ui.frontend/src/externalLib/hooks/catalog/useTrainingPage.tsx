import { useEffect, useMemo, useState } from "react";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObjectInstance } from "../../models/PrimeModels";
import { useCardIcon, useCardBackgroundStyle, useSkills, useBadge, useLocalizedMetaData, filterTrainingInstance } from "../../utils/hooks";
import { QueryParams } from "../../utils/restAdapter";

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";
//"enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";

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
       
        if (response) {
          // const enrollment = response.enrollment;
          // if(enrollment) {
          //   instanceId = enrollment.loInstance.id;
          // }
          // const trainingInstances = response.instances.filter(
          //   (instance) => instance.id === instanceId
          // );
          // const trainingInstance = trainingInstances.length
          //   ? trainingInstances[0]
          //   : ({} as PrimeLearningObjectInstance);
          const trainingInstance = filterTrainingInstance(response, instanceId);
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
  } = useLocalizedMetaData(training,locale);

  const { cardIconUrl, color, bannerUrl } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);
  const skills =  useSkills(training);
  const instanceBadge = useBadge(trainingInstance);

  return {
    name,
    description,
    overview,
    richTextOverview,
    cardIconUrl,
    color,
    bannerUrl,
    cardBgStyle,
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
