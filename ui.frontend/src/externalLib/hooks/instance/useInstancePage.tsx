import { useCallback, useEffect, useMemo, useState } from "react";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";
import {
  getALMConfig,
  getALMObject,
  getWindowObject,
} from "../../utils/global";
import { useCardBackgroundStyle, useCardIcon } from "../../utils/hooks";
import { checkIfEnrollmentDeadlineNotPassed } from "../../utils/instance";
import { QueryParams } from "../../utils/restAdapter";
import { getPreferredLocalizedMetadata } from "../../utils/translationService";

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";

export const useInstancePage = (
  trainingId: string,
  params: QueryParams = {}
) => {
  const { locale } = getALMConfig();

  const [currentState, setCurrentState] = useState({
    training: {} as PrimeLearningObject,
    isLoading: true,
  });
  const { isLoading, training } = currentState;
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
          setCurrentState({ training: response, isLoading: false });
        }
      } catch (e) {
        console.log("Error while loading training " + e);
        setCurrentState({
          training: {} as PrimeLearningObject,
          isLoading: false,
        });
      }
    };
    getTrainingInstance();
  }, [params.include, trainingId]);

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

  const activeInstances: PrimeLearningObjectInstance[] = useMemo(() => {
    const instances = training.instances;
    return instances?.length
      ? instances?.filter(
          (instance) =>
            instance.state === "Active" &&
            checkIfEnrollmentDeadlineNotPassed(instance)
        )
      : [];
  }, [training.instances]);

  const { cardIconUrl, color, bannerUrl } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);

  const selectInstanceHandler = useCallback(
    (instanceId: string) => {
      getALMObject().navigateToTrainingOverviewPage(training.id, instanceId);
      // getWindowObject().alm.redirectToTrainingOverview(training.id, instanceId);
    },
    [training.id]
  );

  return {
    isLoading,
    training,
    cardIconUrl,
    color,
    bannerUrl,
    name,
    description,
    overview,
    richTextOverview,
    cardBgStyle,
    activeInstances,
    selectInstanceHandler,
  };
};
