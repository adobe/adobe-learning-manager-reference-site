import { useEffect, useState } from "react";
import APIServiceInstance from "../../common/APIService";
import { useConfigContext } from "../../contextProviders/configContextProvider";
import { PrimeLearningObjectInstance } from "../../models/PrimeModels";
import {
  filterTrainingInstance,
  useBadge,
  useCardBackgroundStyle,
  useCardIcon,
  useLocalizedMetaData,
  useSkills,
} from "../../utils/hooks";
import { QueryParams } from "../../utils/restAdapter";

const COURSE = "course";
const LEARING_PROGRAM = "learningProgram";
const CERTIFICATION = "certification";

const INCLUDES_FOR_COURSE =
  "authors,enrollment,instances.loResources.resources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";

const INCLUDES_FOR_LP_CERT =
  "authors,enrollment,subLOs.instances,instances.badge, skills.skillLevel.badge";
// const DEFAULT_INCLUDE_LO_OVERVIEW =
//   "enrollment,subLOs.instances.learningObject.enrollment,instances.loResources.resources,subLOs.instances.loResources.resources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";
//"enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";
//subLOs.instances.learningObject
export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
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
        let loType = trainingId.split(":")[0];
        if (loType === COURSE) {
          queryParam["include"] = params.include || INCLUDES_FOR_COURSE;
        } else if (loType === CERTIFICATION || loType === LEARING_PROGRAM) {
          queryParam["include"] = params.include || INCLUDES_FOR_LP_CERT;
        }
        queryParam["useCache"] = true;
        queryParam["filter.ignoreEnhancedLP"] = false;
        const response = await APIServiceInstance.getTraining(
          trainingId,
          queryParam
        );

        if (response) {
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
  } = useLocalizedMetaData(training, locale);

  const { cardIconUrl, color, bannerUrl } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);
  const skills = useSkills(training);
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
