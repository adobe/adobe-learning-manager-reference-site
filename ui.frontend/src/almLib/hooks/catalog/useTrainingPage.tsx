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
import { useDispatch } from "react-redux";
import { AlertType } from "../../common/Alert/AlertDialog";
import { useAlert } from "../../common/Alert/useAlert";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLoInstanceSummary,
} from "../../models/PrimeModels";
import { getJobaidUrl, isJobaidContentTypeUrl } from "../../utils/catalog";
import { getALMAccount, getALMConfig, getALMUser } from "../../utils/global";
import {
  filterTrainingInstance,
  getLocale,
  useBadge,
  useCardBackgroundStyle,
  useCardIcon,
  useLocalizedMetaData,
  useTrainingSkills,
} from "../../utils/hooks";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { GetTranslation } from "../../utils/translationService";

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "enrollment.loInstance.loResources.resources,prerequisiteLOs,subLOs.prerequisiteLOs,subLOs.subLOs.prerequisiteLOs,authors,enrollment.loResourceGrades,subLOs.enrollment.loResourceGrades, subLOs.subLOs.enrollment.loResourceGrades, subLOs.subLOs.instances.loResources.resources, subLOs.instances.loResources.resources,instances.loResources.resources,supplementaryLOs.instances.loResources.resources,supplementaryResources,subLOs.enrollment,instances.badge, skills.skillLevel.badge,skills.skillLevel.skill";
export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
  params: QueryParams = {}
) => {
  const { locale } = getALMConfig();
  const [almAlert] = useAlert();

  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isPreviewEnabled: false,
    isLoading: true,
    errorCode: "",
  });

  //const [error, setError] = useState(null);
  const {
    trainingInstance,
    isPreviewEnabled,
    isLoading,
    errorCode,
  } = currentState;
  const [instanceSummary, setInstanceSummary] = useState(
    {} as PrimeLoInstanceSummary
  );
  const [refreshTraining, setRefreshTraining] = useState(false);
  const training = trainingInstance.learningObject;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!trainingId) return;
    const getTrainingInstance = async () => {
      try {
        let queryParam: QueryParams = {};
        queryParam["include"] = params.include || DEFAULT_INCLUDE_LO_OVERVIEW;
        queryParam["useCache"] = true;
        queryParam["filter.ignoreEnhancedLP"] = false;
        const account = await getALMAccount();

        const response = await APIServiceInstance.getTraining(
          trainingId,
          queryParam
        );

        if (response) {
          const trainingInstance = filterTrainingInstance(response, instanceId);
          setCurrentState({
            trainingInstance,
            isPreviewEnabled: account.enableModulePreview || false,
            isLoading: false,
            errorCode: "",
          });
        }
      } catch (error: any) {
        console.log("Error while loading training " + error);
        setCurrentState({
          trainingInstance: {} as PrimeLearningObjectInstance,
          isPreviewEnabled: false,
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
    async ({
      id,
      instanceId,
      isSupplementaryLO = false,
    } = {}): Promise<PrimeLearningObjectInstanceEnrollment> => {
      let queryParam: QueryParams = {
        loId: id || trainingId,
        loInstanceId: instanceId || trainingInstance.id,
      };
      const emptyResponse = {} as PrimeLearningObjectInstanceEnrollment;
      try {
        const response = await APIServiceInstance.enrollToTraining(queryParam);
        if (!isSupplementaryLO) {
          //Refresh the training data
          setRefreshTraining((prevState) => !prevState);
        }
        if (response) {
          return response.learningObjectInstanceEnrollment;
        }
        return emptyResponse;
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        return emptyResponse;
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
        almAlert(true, GetTranslation("alm.unenrollment.error"), AlertType.error);
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

  const getContentLocales = async () => {
    const account = await getALMAccount();
    const contentLocales = account.contentLocales;
    return contentLocales;
  };

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

  const alternateLanguages = useMemo(async () => {
    let alternateLanguages = new Set<string>();
    getLocale(trainingInstance, alternateLanguages, locale);
    if (training && training.subLOs) {
      training.subLOs.forEach((subLo) => {
        subLo.instances?.forEach((instance) => {
          getLocale(instance, alternateLanguages, locale);
        });
      });
    }
    if (training && training.subLOs) {
      training.subLOs.forEach((subLo) =>
        subLo.subLOs?.forEach((subLo) => {
          subLo.instances?.forEach((instances) => {
            getLocale(instances, alternateLanguages, locale);
          });
        })
      );
    }
    let alternateLocales: string[] = [];
    var contentLocale = await getContentLocales();

    if (alternateLanguages && alternateLanguages.size) {
      contentLocale?.forEach((contentLocale) => {
        if (alternateLanguages.has(contentLocale.locale)) {
          alternateLocales.push(contentLocale.name);
        }
      });
    }
    return alternateLocales;
  }, [training]);

  const {
    name = "",
    description = "",
    overview = "",
    richTextOverview = "",
  } = useLocalizedMetaData(training, locale);

  const { cardIconUrl, color, bannerUrl } = useCardIcon(training);
  const cardBgStyle = useCardBackgroundStyle(training, cardIconUrl, color);
  const skills = useTrainingSkills(training);
  const instanceBadge = useBadge(trainingInstance);

  const updateFileSubmissionUrl = useCallback(
    async (fileUrl: any, loId: any, loInstanceId: any, loResourceId: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const body = {
        data: {
          id: loResourceId,
          type: "learningObjectResource",
          attributes: {
            submissionUrl: fileUrl,
          },
        },
      };
      const headers = { "content-type": "application/json" };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}/loResources/${loResourceId}`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        const params: QueryParams = {};
        params["include"] = "enrollment.loInstance.loResources.resources";

        let response = await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}`,
          method: "GET",
          headers: headers,
          params: params,
        });

        const parsedResponse = JsonApiParse(response);
        const loInstance = parsedResponse.learningObject.instances?.filter(
          (instance) => {
            return instance.id === loInstanceId;
          }
        );
        const loResource = loInstance[0].loResources?.filter((resource) => {
          return resource.id === loResourceId;
        });
        return loResource[0].submissionUrl;
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch]
  );

  const updateCertificationProofUrl = useCallback(
    async (fileUrl: any, loId: any, loInstanceId: any) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const userResponse = await getALMUser();
      const userId = userResponse?.user?.id;
      const body = {
        data: {
          id: loInstanceId + "_" + userId,
          type: "learningObjectInstanceEnrollment",
          attributes: {
            url: fileUrl,
          },
        },
      };
      const headers = { "content-type": "application/json" };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}/enrollments/${loInstanceId + "_" + userId}`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        const params: QueryParams = {};
        params["include"] = "enrollment.loInstance";

        let response = await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}`,
          method: "GET",
          headers: headers,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        return parsedResponse.learningObject.enrollment.url || "";
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch]
  );

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
    isPreviewEnabled,
    enrollmentHandler,
    launchPlayerHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    errorCode,
    updateFileSubmissionUrl,
    updateCertificationProofUrl,
    alternateLanguages,
  };
  //date create, published, duration
};
