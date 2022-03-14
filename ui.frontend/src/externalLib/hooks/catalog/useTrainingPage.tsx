import { useCallback, useEffect, useState } from "react";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLoInstanceSummary,
} from "../../models/PrimeModels";
import { getJobaidUrl, isJobaidContentTypeUrl } from "../../utils/catalog";
import { getALMConfig } from "../../utils/global";
import {
  filterTrainingInstance,
  useBadge,
  useCardBackgroundStyle,
  useCardIcon,
  useLocalizedMetaData,
  useSkills,
} from "../../utils/hooks";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams } from "../../utils/restAdapter";

// const COURSE = "course";
// const LEARING_PROGRAM = "learningProgram";
// const CERTIFICATION = "certification";

// const INCLUDES_FOR_COURSE =
//   "authors,enrollment,supplementaryLOs.instances.loResources.resources,supplementaryResources,instances.loResources.resources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";

// const INCLUDES_FOR_LP_CERT =
//   "authors,enrollment,subLOs.instances,supplementaryLOs.instances.loResources.resources,supplementaryResources,subLOs.enrollment,instances.badge, skills.skillLevel.badge,skills.skillLevel.skill";

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "authors,enrollment,subLOs.enrollment, subLOs.subLOs.enrollment, subLOs.subLOs.instances.loResources.resources, subLOs.instances.loResources.resources,instances.loResources.resources,supplementaryLOs.instances.loResources.resources,supplementaryResources,subLOs.enrollment,instances.badge, skills.skillLevel.badge,skills.skillLevel.skill";
// const DEFAULT_INCLUDE_LO_OVERVIEW =
//   "enrollment,subLOs.instances.learningObject.enrollment,instances.loResources.resources,subLOs.instances.loResources.resources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";
//"enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";
//subLOs.instances.learningObject
export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
  params: QueryParams = {}
) => {
  const { locale } = getALMConfig();
  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isLoading: true,
  });

  //const [error, setError] = useState(null);
  const { trainingInstance, isLoading } = currentState;
  const [instanceSummary, setInstanceSummary] = useState(
    {} as PrimeLoInstanceSummary
  );
  const [refreshTraining, setRefreshTraining] = useState(false);
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
  }, [trainingId, instanceId, params.include, refreshTraining]);

  useEffect(() => {
    const getSummary = async () => {
      const response = await APIServiceInstance.getTrainingInstanceSummary(
        trainingInstance.learningObject.id,
        trainingInstance.id
      );
      if (response) {
        setInstanceSummary(response.loInstanceSummary);
        console.log(response.loInstanceSummary);
      }

      try {
      } catch (error) {}
    };
    if (trainingInstance?.id) {
      getSummary();
    }
  }, [trainingInstance]);

  const enrollmentHandler = useCallback(
    async ({ id, instanceId, isSupplementaryLO = false } = {}) => {
      let queryParam: QueryParams = {
        loId: id || trainingId,
        loInstanceId: instanceId || trainingInstance.id,
      };
      try {
        await APIServiceInstance.enrollToTraining(queryParam);
        if (!isSupplementaryLO) {
          //just to refresh the training data
          setRefreshTraining((prevState) => !prevState);
        }
      } catch (error) {
        //TODO : handle error
      }
    },
    [trainingId, trainingInstance.id]
  );

  const unEnrollmentHandler = useCallback(
    async ({ enrollmentId, isSupplementaryLO = false } = {}) => {
      try {
        debugger;
        await APIServiceInstance.unenrollFromTraining(enrollmentId);
        if (!isSupplementaryLO) {
          //just to refresh the training data
          setRefreshTraining((prevState) => !prevState);
        }
      } catch (error) {
        //TODO : handle error
      }
    },
    []
  );
  const supplementaryLOsJobAidClickHandler = useCallback(
    (supplymentaryLo: PrimeLearningObject) => {
      if (isJobaidContentTypeUrl(supplymentaryLo)) {
        window.open(getJobaidUrl(supplymentaryLo), "_blank");
      } else {
        LaunchPlayer({ trainingId: supplymentaryLo.id });
      }
    },
    []
  );

  const launchPlayerHandler = useCallback(
    async ({ id, moduleId } = {}) => {
      const refreshTraining = () => {
        setRefreshTraining((prevState) => !prevState);
      };
      let test = id || trainingId;
      LaunchPlayer({ trainingId: test, callBackFn: refreshTraining, moduleId });
    },
    [trainingId]
  );

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
    instanceSummary,
    enrollmentHandler,
    launchPlayerHandler,
    unEnrollmentHandler,
    supplementaryLOsJobAidClickHandler,
  };
  //date create, published, duration
};
