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
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import { AlertType } from "../../common/Alert/AlertDialog";
import { useAlert } from "../../common/Alert/useAlert";
import APIServiceInstance from "../../common/APIService";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeLoInstanceSummary,
  PrimeNote,
} from "../../models/PrimeModels";
import { getJobaidUrl, isJobaidContentTypeUrl } from "../../utils/catalog";
import {
  ADMIN_ENROLL,
  CERTIFICATION,
  COURSE,
  DEFAULT_INCLUDE_LO_OVERVIEW,
  ENGLISH_LOCALE,
  GET_REQUEST,
  LEARNING_PROGRAMS,
  PREVIOUS_BREADCRUMB_PATH,
  RECOMMENDATIONS,
  RETIRED,
  SKILLS_INCLUDE,
  WAITING,
} from "../../utils/constants";
import {
  getALMAccount,
  getALMConfig,
  getALMObject,
  getALMUser,
  getPageAttributes,
} from "../../utils/global";
import {
  filterTrainingInstance,
  getLocale,
  useBadge,
  useCardIcon,
  useLocalizedMetaData,
  useTrainingSkills,
} from "../../utils/hooks";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { LaunchPlayer } from "../../utils/playback-utils";
import { IRestAdapterAjaxOptions, QueryParams, RestAdapter } from "../../utils/restAdapter";
import { GetTranslation } from "../../utils/translationService";
import { findPrimaryEnrolledInstance } from "./useTrainingPageHelper";
import { useUserContext } from "../../contextProviders/userContextProvider";
import { fetchCourseInstanceMapping, getTraining } from "../../utils/lo-utils";

import { determineLoType, getErrorMessage } from "../../utils/lo-utils";
import {
  clearBreadcrumbPathDetails,
  getBreadcrumbPath,
  popFromBreadcrumbPath,
  restorePreviousBreadcrumbPath,
} from "../../utils/breadcrumbUtils";
interface RatingResponse {
  awardedPoints: number;
}
export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
  params: QueryParams = {},
  shouldSkipLOCalls: boolean = false
) => {
  const [trainingOverviewAttributes, setTrainingOverviewAttributes] = useState(() =>
    getPageAttributes("trainingOverviewPage", "trainingOverviewAttributes")
  );
  const baseApiUrl = getALMConfig().primeApiURL;
  const headers = { "content-type": "application/json" };
  const updateTrainingOverviewAttributes = getPageAttributes(
    "trainingOverviewPage",
    "trainingOverviewAttributes"
  );
  const { formatMessage, locale } = useIntl();
  const [almAlert] = useAlert();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isPreviewEnabled: false,
    isFlexLPValidationEnabled: false,
    isLoading: true,
    errorCode: "",
    courseInstanceMap: {},
  });
  const {
    trainingInstance,
    isPreviewEnabled,
    isFlexLPValidationEnabled,
    isLoading,
    errorCode,
    courseInstanceMap,
  } = currentState;
  const [instanceSummary, setInstanceSummary] = useState({} as PrimeLoInstanceSummary);
  const [notes, setNotes] = useState([] as PrimeNote[]);
  const [relatedCourses, setRelatedCourses] = useState([] as PrimeLearningObject[]);
  const [relatedLPs, setRelatedLPs] = useState([] as PrimeLearningObject[]);
  const [lastPlayingLoResourceId, setLastPlayingLoResourceId] = useState("");
  const [lastPlayingCourseId, setLastPlayingCourseId] = useState("");
  const [lastPlayingCourseInstanceId, setLastPlayingCourseInstanceId] = useState("");
  const [refreshNotes, setRefreshNotes] = useState(false);
  const [refreshTraining, setRefreshTraining] = useState(false);
  const [enrollViaModuleClick, setEnrollViaModuleClick] = useState([] as any); // storing training id, instance id and module id
  const [isRegisterInterestEnabled, setIsRegisterInterestEnabled] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState<number>(0);
  const [isCourseEnrollable, setIsCourseEnrollable] = useState(false);
  const [isCourseEnrolled, setIsCourseEnrolled] = useState(false);

  const training = trainingInstance.learningObject;
  const [waitlistPosition, setWaitlistPosition] = useState("");
  const [courseInstanceMapping, setCourseInstanceMapping] = useState<{
    [key: string]: any;
  }>({}); // For flex lp instance mapping
  const [selectedLoList, setSelectedLoList] = useState({} as any);
  const dispatch = useDispatch();
  const isCertification =
    training?.loType === CERTIFICATION || trainingId.includes("certification");
  const isCourse = training?.loType === COURSE;

  const setSelectedInstanceInfo = useCallback(
    (
      selectedInstanceId: string,
      courseId: string,
      courseName: string,
      isInstanceUpdated: boolean,
      instanceName: string,
      contentModuleDuration: number,
      isInstanceSwitchAllowed = true
    ) => {
      setCourseInstanceMapping((prevSelectedInstanceInfo: any) => {
        return {
          ...prevSelectedInstanceInfo,
          [courseId]: {
            instanceId: selectedInstanceId,
            name: courseName,
            isInstanceUpdated: isInstanceUpdated,
            instanceName: instanceName,
            courseDuration: contentModuleDuration,
            isInstanceSwitchAllowed: isInstanceSwitchAllowed,
          },
        };
      });
    },
    [courseInstanceMapping]
  );
  const setInstancesForFlexLPOnLoad = useCallback(
    selectedInstancesInfo => {
      setCourseInstanceMapping({ ...selectedInstancesInfo });
    },
    [courseInstanceMapping]
  );

  const [renderTrainingOverviewAttributes, setRenderTrainingOverviewAttributes] = useState(false);

  useEffect(() => {
    if (training && !renderTrainingOverviewAttributes) {
      setTrainingOverviewAttributes(updateTrainingOverviewAttributes);
      setRenderTrainingOverviewAttributes(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [training]);

  useEffect(() => {
    if (!trainingId) return;
    const getTrainingInstance = async () => {
      const loType = determineLoType(trainingId);
      try {
        let queryParam: QueryParams = {};
        queryParam["include"] = params.include || DEFAULT_INCLUDE_LO_OVERVIEW;
        queryParam["useCache"] = true;
        queryParam["filter.ignoreEnhancedLP"] = false;
        const account = await getALMAccount();
        const response = await APIServiceInstance.getTraining(trainingId, queryParam);

        if (response) {
          if (response.enrollmentType === ADMIN_ENROLL && !response.enrollment) {
            const errorMessage = loType && getErrorMessage(loType);
            errorMessage && navigateToCatalogPageHandler(errorMessage);
            return;
          }
          const trainingInstance = filterTrainingInstance(response, instanceId);
          let courseInstanceMap = {};
          if (response.loType !== COURSE && !response.enrollment) {
            fetchCourseInstanceMapping(response, trainingInstance.id, courseInstanceMap);
          }
          setCurrentState({
            trainingInstance,
            isPreviewEnabled: account.enableModulePreview || false,
            isFlexLPValidationEnabled: account.flexLPValidationsEnabled || false,
            isLoading: false,
            errorCode: "",
            courseInstanceMap,
          });
        }
      } catch (error: any) {
        console.log("Error while loading training " + error);
        setCurrentState({
          trainingInstance: {} as PrimeLearningObjectInstance,
          isPreviewEnabled: false,
          isFlexLPValidationEnabled: false,
          isLoading: false,
          errorCode: error.status,
          courseInstanceMap: {},
        });
        const errorMessage = loType && getErrorMessage(loType);
        errorMessage && navigateToCatalogPageHandler(errorMessage);
      }
    };
    if (!shouldSkipLOCalls) {
      getTrainingInstance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (trainingInstance?.id && !shouldSkipLOCalls) {
      getSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingInstance]);

  const getWaitlistPosition = async ({ enrollmentId }: { enrollmentId: string }) => {
    try {
      let response = await RestAdapter.ajax({
        url: `${baseApiUrl}/enrollments/${enrollmentId}/waitlistPosition`,
        method: "GET",
        headers: headers,
      });

      if (response) {
        setWaitlistPosition(response as string);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const navigateToCatalogPageHandler = (errorMessage: string) => {
    almAlert(true, errorMessage, AlertType.error);
    getALMObject().navigateToCatalogPage({ timeOut: 300 });
  };

  const enrollmentHandler = useCallback(
    async ({
      id,
      instanceId,
      isSupplementaryLO = false,
      allowMultiEnrollment = false,
      headers = {},
    } = {}): Promise<PrimeLearningObjectInstanceEnrollment> => {
      let queryParam: QueryParams = {
        loId: id || trainingId,
        loInstanceId: instanceId || trainingInstance.id,
        allowMultiEnrollment: allowMultiEnrollment,
      };
      const emptyResponse = {} as PrimeLearningObjectInstanceEnrollment;
      try {
        const response = await APIServiceInstance.enrollToTraining(queryParam, headers);
        if (!isSupplementaryLO) {
          //Refresh the training data
          setRefreshTraining(prevState => !prevState);
          setRefreshNotes(prevState => !prevState);
        }
        if (response) {
          return response.learningObjectInstanceEnrollment;
        }
        return emptyResponse;
      } catch (error: any) {
        const errorId = JSON.parse(error.responseText).errorId;
        throw new Error(errorId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trainingId, trainingInstance.id]
  );

  const flexLpEnrollHandler = useCallback(
    async ({
      id,
      instanceId,
      isSupplementaryLO = false,
      allowMultiEnrollment = false,
      body = {},
      headers = {},
    } = {}): Promise<PrimeLearningObjectInstanceEnrollment> => {
      let queryParam: QueryParams = {
        loId: id || trainingId,
        loInstanceId: instanceId || trainingInstance.id,
        allowMultiEnrollment: allowMultiEnrollment,
      };
      const emptyResponse = {} as PrimeLearningObjectInstanceEnrollment;
      try {
        const data = await RestAdapter.ajax({
          url: `${getALMConfig().primeApiURL}enrollments`,
          method: "POST",
          params: queryParam,
          body: JSON.stringify(body),
          headers: { ...headers, "content-type": "application/json" },
        });

        const response = JsonApiParse(data);

        if (!isSupplementaryLO) {
          //Refresh the training data
          setRefreshTraining(prevState => !prevState);
          setRefreshNotes(prevState => !prevState);
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
    async ({ enrollmentId, isFlexLp = false, isSupplementaryLO = false } = {}) => {
      try {
        await APIServiceInstance.unenrollFromTraining(enrollmentId);
        if (!isSupplementaryLO) {
          //just to refresh the training data
          setRefreshTraining(prevState => !prevState);
          if (isFlexLp) {
            setCourseInstanceMapping({});
          }
          return true;
        }
      } catch (error) {
        throw new Error();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const updateEnrollmentHandler = useCallback(
    async ({ enrollmentId, instanceEnrollList, isFlexLp = false }) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}enrollments?enrollmentId=${enrollmentId}`,
          method: "PATCH",
          body: JSON.stringify(instanceEnrollList),
          headers: headers,
        });
        setRefreshTraining(prevState => !prevState);
        setRefreshNotes(prevState => !prevState);
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const addToCartHandler = useCallback(async (): Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }> => {
    try {
      return await APIServiceInstance.addProductToCart(trainingInstance.id);
    } catch (error) {
      return { items: [], totalQuantity: 0, error: error };
    }
  }, [trainingInstance]);

  const addToCartNativeHandler = useCallback(async (): Promise<{
    redirectionUrl: string;
    error: any;
  }> => {
    try {
      return await APIServiceInstance.addProductToCartNative(trainingInstance.id);
    } catch (error) {
      return { redirectionUrl: "", error: error };
    }
  }, [trainingInstance]);

  const buyNowNativeHandler = useCallback(async (): Promise<{
    redirectionUrl: string;
    error: any;
  }> => {
    try {
      return await APIServiceInstance.buyNowNative(trainingInstance.id);
    } catch (error) {
      return { redirectionUrl: "", error: error };
    }
  }, [trainingInstance]);

  const getContentLocales = async () => {
    const account = await getALMAccount();
    const contentLocales = account.contentLocales;
    return contentLocales;
  };

  const jobAidClickHandler = useCallback((supplymentaryLo: PrimeLearningObject) => {
    if (isJobaidContentTypeUrl(supplymentaryLo)) {
      window.open(getJobaidUrl(supplymentaryLo), "_blank");
    } else {
      LaunchPlayer({ trainingId: supplymentaryLo.id });
    }
  }, []);

  const getPlayerLoState = async ({
    loId,
    loInstanceId,
    loType,
  }: {
    loId: string;
    loInstanceId: string;
    loType: string;
  }) => {
    try {
      const userId = user.id;
      const response = await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userId}/playerLOState?loId=${loId}&loInstanceId=${loInstanceId}`,
        method: "GET",
      });

      if (typeof response === "string") {
        const parsedResponse = JSON.parse(response);
        if (loType === COURSE) {
          setLastPlayingLoResourceId(parsedResponse.lastPlayingLoResourceId);
        } else if (parsedResponse.lastPlayingCourse) {
          const lastPlayingCourseId = `course:${parsedResponse.lastPlayingCourse}`;
          setLastPlayingCourseId(lastPlayingCourseId);
          const loInstanceId = findPrimaryEnrolledInstance(training, lastPlayingCourseId);
          if (loInstanceId) {
            setLastPlayingCourseInstanceId(loInstanceId);
            getPlayerLoState({
              loId: lastPlayingCourseId,
              loInstanceId: loInstanceId,
              loType: COURSE,
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const updatePlayerLoState = async ({ body }: { body: any }) => {
    try {
      const userId = user.id;
      const loId = trainingId;
      const loInstanceId =
        instanceId || trainingInstance.id || training?.enrollment?.loInstance?.id;

      await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userId}/playerLOState?loId=${loId}&loInstanceId=${loInstanceId}`,
        method: "POST",
        body: JSON.stringify(body),
        headers: { ...headers, "content-type": "application/json" },
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (trainingInstance?.enrollment && (instanceId || trainingInstance.id)) {
      getPlayerLoState({
        loId: trainingId,
        loInstanceId: instanceId || trainingInstance.id,
        loType: training?.loType,
      });

      if (trainingInstance.enrollment.state === WAITING) {
        getWaitlistPosition({ enrollmentId: trainingInstance.enrollment.id });
      }
    } else if (training && training.loType !== COURSE && training.enrollment) {
      // For LP and Certification, we don't get enrollment inside instance, check from public api
      // Checking primary enrollment for LP and Certification
      getPlayerLoState({
        loId: trainingId,
        loInstanceId: training.enrollment.loInstance.id,
        loType: training?.loType,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingInstance]);

  useEffect(() => {
    if (training?.loType === COURSE && trainingInstance?.enrollment && !shouldSkipLOCalls) {
      getNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingId, trainingInstance, refreshNotes]);

  const launchPlayerHandler = useCallback(
    async ({
      id,
      moduleId,
      trainingInstanceId,
      isMultienrolled,
      note_id,
      note_position,
      isResetRequired,
    } = {}) => {
      const refreshTrainingandNotes = () => {
        setRefreshTraining(prevState => !prevState);
        setRefreshNotes(prevState => !prevState);
      };
      const loId = id || trainingId;
      let loInstanceId = trainingInstanceId || instanceId || trainingInstance.id;

      LaunchPlayer({
        trainingId: loId,
        callBackFn: refreshTrainingandNotes,
        moduleId,
        instanceId: loInstanceId,
        isMultienrolled: isMultienrolled,
        note_id: note_id,
        note_position: note_position,
        isResetRequired: isResetRequired,
      });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [trainingId]
  );

  const alternateLanguages = useMemo(async () => {
    let alternateLanguages = new Set<string>();
    const userResponse = await getALMUser();
    const userContentLocale = userResponse?.user.contentLocale;
    const currentLocale = userContentLocale || locale;
    getLocale(trainingInstance, alternateLanguages, "");
    if (training && training.subLOs) {
      training.subLOs.forEach(subLo => {
        subLo.instances?.forEach(instance => {
          getLocale(instance, alternateLanguages, "");
        });
      });
    }
    if (training && training.subLOs) {
      training.subLOs.forEach(subLo =>
        subLo.subLOs?.forEach(subLo => {
          subLo.instances?.forEach(instances => {
            getLocale(instances, alternateLanguages, "");
          });
        })
      );
    }

    let alternateLocales: string[] = [];
    var contentLocale = await getContentLocales();
    // If there's only on language we don't show anything
    if (alternateLanguages.size == 1) {
      return alternateLocales;
    }
    if (alternateLanguages && alternateLanguages.size && alternateLanguages.size > 1) {
      // Remove the current locale from the alternate languages
      alternateLanguages.delete(currentLocale);
      contentLocale?.forEach(contentLocale => {
        if (alternateLanguages.has(contentLocale.locale)) {
          alternateLocales.push(contentLocale.name);
        }
      });
    }
    return alternateLocales;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [training]);

  const {
    name = "",
    description = "",
    overview = "",
    richTextOverview = "",
  } = useLocalizedMetaData(training, contentLocale);

  const { cardIconUrl, color, bannerUrl, cardBgStyle } = useCardIcon(training);

  const skills = useTrainingSkills(training);
  const instanceBadge = useBadge(trainingInstance);

  const updateFileSubmissionUrl = useCallback(
    async (fileUrl: string, loId: string, loInstanceId: string, loResourceId: string) => {
      const body = {
        data: {
          id: loResourceId,
          type: "learningObjectResource",
          attributes: {
            submissionUrl: fileUrl,
          },
        },
      };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}/loResources/${loResourceId}`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        const params: QueryParams = {};
        params["include"] =
          "instances.loResources.resources,enrollment.loInstance.loResources.resources";

        let response = await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}`,
          method: "GET",
          headers: headers,
          params: params,
        });
        setRefreshTraining(prevState => !prevState);
        const parsedResponse = JsonApiParse(response);
        const loInstance = parsedResponse.learningObject.instances?.filter(instance => {
          return instance.id === loInstanceId;
        });
        const loResource = loInstance[0].loResources?.filter(resource => {
          return resource.id === loResourceId;
        });
        return loResource[0].submissionUrl;
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );
  useEffect(() => {
    if (trainingInstance.state === RETIRED) {
      registerInterestHandler(GET_REQUEST);
    }
  }, [trainingInstance.state]);
  const registerInterestHandler = useCallback(
    async (methodReq: IRestAdapterAjaxOptions["method"]) => {
      try {
        const response = await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${trainingId}/interest`,
          method: methodReq,
          headers,
          params: params,
        });
        if (methodReq == GET_REQUEST) {
          const parsedResponse = JsonApiParse(response);
          setIsRegisterInterestEnabled(parsedResponse.loInterest.interested);
        } else {
          setIsRegisterInterestEnabled(prevState => !prevState);
        }
      } catch (e) {
        throw new Error();
      }
    },
    [dispatch]
  );

  const updateRating = useCallback(
    async (rating: number, loInstanceId: string) => {
      const userResponse = await getALMUser();
      const userId = userResponse?.user?.id;
      const body = {
        rating: rating,
      };

      try {
        const response = await RestAdapter.ajax({
          url: `${baseApiUrl}enrollments/${loInstanceId}_${userId}/rate`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        const ratingResponseObject: RatingResponse = JSON.parse(
          response as string
        ) as RatingResponse;
        Object.keys(ratingResponseObject).length != 0 &&
          setAwardedPoints(ratingResponseObject.awardedPoints);
        setRefreshTraining(prevState => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );
  const updateNote = useCallback(
    async (
      note: PrimeNote,
      updatedText: string,
      loId: string,
      loResourceId: PrimeLearningObjectResource
    ) => {
      const body = {
        data: {
          id: note.id,
          type: "note",
          attributes: {
            text: updatedText,
          },
          relationships: {
            loResource: {
              data: {
                type: "learningObjectResource",
                id: note.loResource.id,
              },
            },
          },
        },
      };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}learningObjects/${loId}/resources/${loResourceId.id}/note/${note.id}`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        setRefreshNotes(prevState => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );
  const deleteNote = useCallback(
    async (noteId: string, loId: string, loResourceId: string) => {
      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}learningObjects/${loId}/resources/${loResourceId}/note/${noteId}`,
          method: "DELETE",
          headers: headers,
        });
        setRefreshNotes(prevState => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );
  const downloadNotes = useCallback(
    async (loId: string, loInstanceId: string, loName: string, loInstanceName: string) => {
      const url = `${
        getALMConfig().primeApiURL
      }learningObjects/${loId}/instances/${loInstanceId}/note/download`;

      try {
        const response = (await RestAdapter.get({
          url: url,
          headers: { "content-type": "application/pdf" },
          responseType: "blob",
        })) as Blob;
        const blob = new Blob([response as Blob], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.style.display = "none";
        const fileName = `${loName} - ${loInstanceName}(${GetTranslation("alm.text.notes")}).pdf`;
        link.setAttribute("download", fileName);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const sendNotesOnMail = useCallback(
    async (loId: string, loInstanceId: string) => {
      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}learningObjects/${loId}/instances/${loInstanceId}/note/email`,
          method: "POST",
          headers: headers,
        });

        almAlert(
          true,
          formatMessage({
            id: "alm.text.notesSentMessage",
            defaultMessage: "Notes have been mailed to your email account",
          }),
          AlertType.success
        );
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const getNotes = async () => {
    const response = await getAllNotes();
    if (response) {
      setNotes(response);
    } else {
      setNotes([]);
    }
    try {
    } catch (error) {}
  };
  const getAllNotes = useCallback(async () => {
    try {
      let url = "";
      let loInstanceId = instanceId || training?.enrollment?.loInstance?.id;
      if (loInstanceId) {
        url = `${baseApiUrl}learningObjects/${trainingId}/instances/${loInstanceId}/note`;
      } else {
        url = `${baseApiUrl}learningObjects/${trainingId}/note`;
      }
      let response = await RestAdapter.ajax({
        url: url,
        method: "GET",
        headers: headers,
      });
      const parsedResponse = JsonApiParse(response);
      return parsedResponse.noteList;
    } catch (e) {
      console.log(e);
    }
  }, [dispatch, instanceId, training]);

  useEffect(() => {
    getRelatedLOs();
  }, [trainingId]);

  const getRelatedLOs = async () => {
    const getRelatedCourses = await getRelatedLoList(RECOMMENDATIONS);
    setRelatedCourses(getRelatedCourses || []);
    if (!isCertification) {
      const getRelatedLPs = await getRelatedLoList(LEARNING_PROGRAMS);
      setRelatedLPs(getRelatedLPs || []);
    }
    try {
    } catch (error) {}
  };
  const getRelatedLoList = useCallback(
    async (type: string, limit = 3) => {
      try {
        let url = "";
        const params: QueryParams = {};
        params["limit"] = limit;
        params["type"] = type;
        params["include"] = SKILLS_INCLUDE;
        url = `${baseApiUrl}learningObjects/${trainingId}/relatedLOs`;
        let response = await RestAdapter.ajax({
          url: url,
          method: "GET",
          headers,
          params: params,
        });
        const parsedResponse = JsonApiParse(response);
        return parsedResponse.learningObjectList;
      } catch (e) {
        console.log(e);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [trainingId]
  );
  const updateCertificationProofUrl = useCallback(
    async (fileUrl: string, loId: string, loInstanceId: string, dateCompleted = "") => {
      const userResponse = await getALMUser();
      const userId = userResponse?.user?.id;
      const fileAttributes = {
        url: fileUrl,
        ...(dateCompleted && { dateCompleted: dateCompleted }),
      };

      const body = {
        data: {
          id: loInstanceId + "_" + userId,
          type: "learningObjectInstanceEnrollment",
          attributes: fileAttributes,
        },
      };

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
      } catch (error : any) {
        let errorMessage = GetTranslation("alm.enrollment.error");
        if(error?.responseText){
          const errorInfo = JSON.parse(error.responseText)?.source?.info || "";
          if (errorInfo.includes("Failed to upload file")) {
            errorMessage = GetTranslation("alm.enrollment.error.fileUpload");
          }
        }
        throw new Error(errorMessage);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const updateBookMark = useCallback(
    async (isBookMarked: boolean, loId: string) => {
      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}/learningObjects/${loId}/bookmark`,
          method: isBookMarked ? "POST" : "DELETE",
        });
      } catch (e) {
        console.log(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const updateLearningObject = useCallback(async (loId: string) => {
    try {
      const response = await getTraining(loId);
      return response!;
    } catch (e) {
      throw new Error();
    }
  }, []);

  // Removing current LO data from parent path stack
  useEffect(() => {
    if (trainingInstance?.id) {
      const id = training?.id || trainingId;

      const { currentTrainingId: prevTrainingId } = getBreadcrumbPath(PREVIOUS_BREADCRUMB_PATH);
      if (prevTrainingId && prevTrainingId === id) {
        // Case - when user navigates back from related LO or from a copied (url) training
        // previous trainings breadcrumb should restore
        restorePreviousBreadcrumbPath();
        return;
      }

      // Handle back-button case by popping the breadcrumb path
      popFromBreadcrumbPath(id);

      // Clearing the breadcrumb path details if the current path is not the same as the training id
      // Case - when other training is opened via url copy-paste
      const { currentTrainingId } = getBreadcrumbPath();
      if (currentTrainingId && currentTrainingId !== id) {
        clearBreadcrumbPathDetails(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingInstance]);

  useEffect(() => {
    isCourse && getIfCourseIsEnrollable();
  }, [trainingId, isCourse]);
  const getIfCourseIsEnrollable = useCallback(async () => {
    try {
      const url = `${baseApiUrl}learningObjects/${trainingId}/enrollmentMeta`;
      const response = await RestAdapter.get({
        url: url,
      });
      const parsedResponse = JsonApiParse(response);
      const loEnrollmentMeta = parsedResponse?.loEnrollmentMeta;
      setIsCourseEnrollable(loEnrollmentMeta?.enrollable);
      setIsCourseEnrolled(loEnrollmentMeta?.enrolled);
    } catch (e) {
      console.log(e);
    }
  }, [trainingId]);

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
    isFlexLPValidationEnabled,
    enrollmentHandler,
    launchPlayerHandler,
    updateEnrollmentHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    addToCartNativeHandler,
    buyNowNativeHandler,
    errorCode,
    updateRating,
    updateFileSubmissionUrl,
    updateCertificationProofUrl,
    alternateLanguages,
    updateBookMark,
    trainingOverviewAttributes,
    flexLpEnrollHandler,
    notes,
    relatedCourses,
    relatedLPs,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    lastPlayingCourseId,
    lastPlayingCourseInstanceId,
    waitlistPosition,
    setSelectedInstanceInfo,
    courseInstanceMapping,
    setInstancesForFlexLPOnLoad,
    setSelectedLoList,
    selectedLoList,
    setCourseInstanceMapping,
    updatePlayerLoState,
    enrollViaModuleClick,
    setEnrollViaModuleClick,
    getPlayerLoState,
    registerInterestHandler,
    isRegisterInterestEnabled,
    awardedPoints,
    updateLearningObject,
    isCourseEnrollable,
    isCourseEnrolled,
    courseInstanceMap,
  };
  //date create, published, duration
};
