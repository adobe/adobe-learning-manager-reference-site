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
import { useCallback, useEffect, useMemo, useState } from "react";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
} from "../../models/PrimeModels";
import { getALMConfig, getALMObject } from "../../utils/global";
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
    errorCode: "",
  });
  const { isLoading, training, errorCode } = currentState;
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
          setCurrentState({
            training: response,
            isLoading: false,
            errorCode: "",
          });
        }
      } catch (error: any) {
        setCurrentState({
          training: {} as PrimeLearningObject,
          isLoading: false,
          errorCode: error.status,
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
    errorCode,
  };
};
