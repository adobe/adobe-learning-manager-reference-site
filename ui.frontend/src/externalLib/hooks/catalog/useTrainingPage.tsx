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

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "enrollment.loInstance.loResources.resources,prerequisiteLOs,subLOs.prerequisiteLOs,subLOs.subLOs.prerequisiteLOs,authors,enrollment.loResourceGrades,subLOs.enrollment.loResourceGrades, subLOs.subLOs.enrollment.loResourceGrades, subLOs.subLOs.instances.loResources.resources, subLOs.instances.loResources.resources,instances.loResources.resources,supplementaryLOs.instances.loResources.resources,supplementaryResources,subLOs.enrollment,instances.badge, skills.skillLevel.badge,skills.skillLevel.skill";
export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
  params: QueryParams = {}
) => {
  const { locale } = getALMConfig();
  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isLoading: true,
    errorCode: "",
  });

  //const [error, setError] = useState(null);
  const { trainingInstance, isLoading, errorCode } = currentState;
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
          setCurrentState({
            trainingInstance,
            isLoading: false,
            errorCode: "",
          });
        }
      } catch (error: any) {
        console.log("Error while loading training " + error);
        setCurrentState({
          trainingInstance: {} as PrimeLearningObjectInstance,
          isLoading: false,
          errorCode: error.status,
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
        throw error;
        //TODO : handle error
      }
    },
    [trainingId, trainingInstance.id]
  );

  const unEnrollmentHandler = useCallback(
    async ({ enrollmentId, isSupplementaryLO = false } = {}) => {
      try {
        await APIServiceInstance.unenrollFromTraining(enrollmentId);
        if (!isSupplementaryLO) {
          //just to refresh the training data
          setRefreshTraining((prevState) => !prevState);
        }
      } catch (error) {
        console.log(error);
        //TODO : handle error
      }
    },
    []
  );

  const addToCartHandler = useCallback(async (): Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }> => {
    try {
      return await APIServiceInstance.addProductToCart(trainingInstance.id);
    } catch (error) {
      // throw error;
      return { items: [], totalQuantity: 0, error: error };
    }
  }, [trainingInstance]);

  const jobAidClickHandler = useCallback(
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
      const loId = id || trainingId;
      LaunchPlayer({ trainingId: loId, callBackFn: refreshTraining, moduleId });
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
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
    instanceSummary,
    enrollmentHandler,
    launchPlayerHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    errorCode,
  };
  //date create, published, duration
};
