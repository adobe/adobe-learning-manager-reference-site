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
import { WAITING } from "../../utils/constants";
import {
  getAccessToken,
  getALMAccount,
  getALMConfig,
  getALMUser,
  getPageAttributes,
} from "../../utils/global";
import {
  filterTrainingInstance,
  getLocale,
  popFromParentPathStack,
  useBadge,
  useCardIcon,
  useLocalizedMetaData,
  useTrainingSkills,
} from "../../utils/hooks";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { LaunchPlayer } from "../../utils/playback-utils";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { GetTranslation } from "../../utils/translationService";

const DEFAULT_INCLUDE_LO_OVERVIEW =
  "instances.enrollment.loResourceGrades,enrollment.loInstance.loResources.resources,prerequisiteLOs,subLOs.prerequisiteLOs,subLOs.subLOs.prerequisiteLOs,authors,subLOs.enrollment.loResourceGrades, subLOs.subLOs.enrollment.loResourceGrades, subLOs.subLOs.instances.loResources.resources, subLOs.instances.loResources.resources,instances.loResources.resources,supplementaryLOs.instances.loResources.resources,supplementaryResources,subLOs.supplementaryResources,subLOs.enrollment,instances.badge,skills.skillLevel.badge,skills.skillLevel.skill,instances.loResources.resources.room,subLOs.enrollment.loInstance.loResources.resources,prerequisiteLOs.enrollment";

export const useTrainingPage = (
  trainingId: string,
  instanceId: string = "",
  params: QueryParams = {},
  shouldSkipLOCalls: boolean = false
) => {
  const [trainingOverviewAttributes, setTrainingOverviewAttributes] = useState(
    () =>
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

  const [currentState, setCurrentState] = useState({
    trainingInstance: {} as PrimeLearningObjectInstance,
    isPreviewEnabled: false,
    isLoading: true,
    errorCode: "",
  });
  const { trainingInstance, isPreviewEnabled, isLoading, errorCode } =
    currentState;
  const [instanceSummary, setInstanceSummary] = useState(
    {} as PrimeLoInstanceSummary
  );
  const [notes, setNotes] = useState([] as PrimeNote[]);
  const [lastPlayingLoResourceId, setLastPlayingLoResourceId] = useState("");
  const [refreshNotes, setRefreshNotes] = useState(false);
  const [refreshTraining, setRefreshTraining] = useState(false);
  const training = trainingInstance.learningObject;
  const [waitlistPosition, setWaitlistPosition] = useState("");
  const dispatch = useDispatch();

  const [
    renderTrainingOverviewAttributes,
    setRenderTrainingOverviewAttributes,
  ] = useState(false);

  useEffect(() => {
    if (training && !renderTrainingOverviewAttributes) {
      setTrainingOverviewAttributes(updateTrainingOverviewAttributes);
      setRenderTrainingOverviewAttributes(true);
    }
  }, [training]);

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
    if (!shouldSkipLOCalls) {
      getTrainingInstance();
    }
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
  }, [trainingInstance]);

  const getWaitlistPosition = async ({
    enrollmentId,
  }: {
    enrollmentId: string;
  }) => {
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

  const enrollmentHandler = useCallback(
    async ({
      id,
      instanceId,
      isSupplementaryLO = false,
      allowMultiEnrollment = false,
    } = {}): Promise<PrimeLearningObjectInstanceEnrollment> => {
      let queryParam: QueryParams = {
        loId: id || trainingId,
        loInstanceId: instanceId || trainingInstance.id,
        allowMultiEnrollment: allowMultiEnrollment,
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
          return true;
        }
      } catch (error) {
        almAlert(
          true,
          GetTranslation("alm.unenrollment.error"),
          AlertType.error
        );
      }
    },
    []
  );

  const updateEnrollmentHandler = useCallback(
    async ({ enrollmentId, instanceEnrollList, isSupplementaryLO = false }) => {
      const baseApiUrl = getALMConfig().primeApiURL;
      const headers = { "content-type": "application/json" };

      try {
        await RestAdapter.ajax({
          url: `${baseApiUrl}enrollments?enrollmentId=${enrollmentId}`,
          method: "PATCH",
          body: JSON.stringify(instanceEnrollList),
          headers: headers,
        });

        setRefreshTraining((prevState) => !prevState);
        setRefreshNotes((prevState) => !prevState);
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
    },
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

  const getPlayerLoState = async ({
    loId,
    loInstanceId,
  }: {
    loId: string;
    loInstanceId: string;
  }) => {
    try {
      const userResponse = await getALMUser();
      const userId = userResponse?.user?.id;
      const response = await RestAdapter.ajax({
        url: `${baseApiUrl}/users/${userId}/playerLOState?loId=${loId}&loInstanceId=${loInstanceId}`,
        method: "GET",
      });

      if (typeof response === "string") {
        const parsedResponse = JSON.parse(response);
        setLastPlayingLoResourceId(parsedResponse.lastPlayingLoResourceId);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (trainingInstance?.enrollment && (instanceId || trainingInstance.id)) {
      getPlayerLoState({
        loId: trainingId,
        loInstanceId: instanceId || trainingInstance.id,
      });

      if (trainingInstance.enrollment.state === WAITING) {
        getWaitlistPosition({ enrollmentId: trainingInstance.enrollment.id });
      }
    }
  }, [trainingInstance]);

  useEffect(() => {
    if (trainingInstance?.enrollment && !shouldSkipLOCalls) {
      getNotes();
    }
  }, [trainingInstance, refreshNotes]);

  const launchPlayerHandler = useCallback(
    async ({
      id,
      moduleId,
      trainingInstanceId,
      isMultienrolled,
      note_id,
      note_position,
    } = {}) => {
      const refreshTrainingandNotes = () => {
        setRefreshTraining((prevState) => !prevState);
        setRefreshNotes((prevState) => !prevState);
      };
      const loId = id || trainingId;
      let loInstanceId =
      trainingInstanceId || instanceId || trainingInstance.id;

      LaunchPlayer({
        trainingId: loId,
        callBackFn: refreshTrainingandNotes,
        moduleId,
        instanceId: loInstanceId,
        isMultienrolled: isMultienrolled,
        note_id: note_id,
        note_position: note_position,
      });
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

  const { cardIconUrl, color, bannerUrl, cardBgStyle } = useCardIcon(training);

  const skills = useTrainingSkills(training);
  const instanceBadge = useBadge(trainingInstance);

  const updateFileSubmissionUrl = useCallback(
    async (
      fileUrl: string,
      loId: string,
      loInstanceId: string,
      loResourceId: string
    ) => {
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
        params["include"] = "instances.loResources.resources";

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
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
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
        await RestAdapter.ajax({
          url: `${baseApiUrl}enrollments/${loInstanceId}_${userId}/rate`,
          method: "PATCH",
          body: JSON.stringify(body),
          headers: headers,
        });
        setRefreshTraining((prevState) => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
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
        setRefreshNotes((prevState) => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
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
        setRefreshNotes((prevState) => !prevState);
      } catch (e) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
    [dispatch]
  );
  const downloadNotes = useCallback(
    async (loId: string, loInstanceId: string) => {
      const url = `${
        getALMConfig().primeApiURL
      }learningObjects/${loId}/instances/${loInstanceId}/note/download`;
      try {
        const headers = {
          Authorization: `oauth ${getAccessToken()}`,
        };

        const response = await fetch(url, { headers });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.style.display = "none";
        link.setAttribute("download", "");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
    [dispatch]
  );

  const sendNotesOnMail = useCallback(
    async (loId: string, loInstanceId: string) => {
      try {
        const response = await RestAdapter.ajax({
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
  }, [dispatch]);
  const updateCertificationProofUrl = useCallback(
    async (fileUrl: string, loId: string, loInstanceId: string) => {
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
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
        console.log(e);
      }
    },
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
    [dispatch]
  );

  // Removing current LO data from parent path stack
  useEffect(() => {
    if (trainingInstance?.id) {
      const id = training?.id || trainingId;
      popFromParentPathStack(id);
    }
  }, [trainingInstance]);

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
    updateEnrollmentHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    errorCode,
    updateRating,
    updateFileSubmissionUrl,
    updateCertificationProofUrl,
    alternateLanguages,
    updateBookMark,
    trainingOverviewAttributes,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    waitlistPosition,
  };
  //date create, published, duration
};
