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
import {
  DatePicker,
  lightTheme,
  ProgressBar,
  Provider,
  Radio,
  RadioGroup,
} from "@adobe/react-spectrum";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { useTrainingPage } from "../../../hooks/catalog/useTrainingPage";
import {
  CERTIFICATION,
  COMPLETED,
  COURSE,
  ENGLISH_LOCALE,
  ENROLLED,
  FLEX_LP_COURSE_INFO,
  LEARNING_PROGRAM,
  PENDING_APPROVAL,
  REJECTED,
  RETIRED,
  TRAINING_ID_STR,
  TRAINING_INSTANCE_ID_STR,
  HUNDERED_PERCENT,
} from "../../../utils/constants";
import {
  getALMConfig,
  getALMObject,
  getALMUser,
  getItemFromStorage,
  removeItemFromStorage,
  getPathParams,
  getQueryParamsFromUrl,
  getTokenForNativeExtensions,
  sendEvent,
} from "../../../utils/global";
import {
  getCoursesInsideFlexLP,
  getEnrolledInstancesCount,
  getEnrollment,
  hasFlexibleChildLP,
  hasSingleActiveInstance,
  isEnrolledInAutoInstance,
} from "../../../utils/hooks";
import { CLOCK_SVG, FILE_UPLOADED_ICON, SOCIAL_CANCEL_SVG } from "../../../utils/inline_svg";
import { arePrerequisitesEnforcedAndCompleted, checkIsEnrolled } from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import { cancelUploadFile, getUploadInfo, uploadFile } from "../../../utils/uploadUtils";
import { ALMBackButton } from "../../Common/ALMBackButton";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeTrainingPageMetadata } from "../PrimeTrainingPageMetadata";
import { calculateSecondsToTime, modifyTimeDDMMYY } from "../../../utils/dateTime";
import styles from "./PrimeTrainingPage.module.css";
import {
  EXTENSION_LAUNCH_TYPE,
  getExtensionAppUrl,
  getParsedJwt,
  InvocationType,
  openExtensionInNewTab,
  openExtensionInSameTab,
  removeExtraQPFromExtension,
} from "../../../utils/native-extensibility";
import { useAlert } from "../../../common/Alert/useAlert";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { ALMExtensionIframeDialog } from "../../Common/ALMExtensionIframeDialog";
import {
  PrimeExtension,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeSections,
} from "../../../models";
import Info from "@spectrum-icons/workflow/Info";
import Refresh from "@spectrum-icons/workflow/Refresh";
import Asterisk from "@spectrum-icons/workflow/Asterisk";
import CheckmarkCircleOutline from "@spectrum-icons/workflow/CheckmarkCircleOutline";
import { splitStringIntoArray } from "../../../utils/catalog";
import { doesLPHaveActiveInstance, areAllMandatoryCoursesCompleted } from "../../../utils/lo-utils";
import { GamificationModal } from "../../GamificationModal";
import { PrimeEvent } from "../../../utils/widgets/common";
import { GetPrimeObj } from "../../../utils/widgets/windowWrapper";
import { useFeedback } from "../../../hooks/feedback/useFeedback";
import { PrimeFeedbackWrapper } from "../../ALMFeedback";
import { useUserContext } from "../../../contextProviders/userContextProvider";
import { useAccount } from "../../../hooks";
import { getTrainingLink } from "../../../utils/lo-utils";

const PrimeTrainingPage = (props: any) => {
  const config = getALMConfig();
  const trainingOverviewPath = config.trainingOverviewPath;

  const pathParams = getPathParams(trainingOverviewPath, [
    TRAINING_ID_STR,
    TRAINING_INSTANCE_ID_STR,
  ]);
  const trainingId = pathParams[TRAINING_ID_STR];
  const trainingInstanceId = pathParams[TRAINING_INSTANCE_ID_STR]?.split("?")[0];
  const { formatMessage, locale } = useIntl();

  const {
    name,
    description,
    overview,
    richTextOverview,
    color,
    bannerUrl,
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
    instanceSummary,
    enrollmentHandler,
    launchPlayerHandler,
    updateEnrollmentHandler,
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    addToCartNativeHandler,
    buyNowNativeHandler,
    isPreviewEnabled,
    isFlexLPValidationEnabled,
    alternateLanguages,
    updateFileSubmissionUrl,
    updateRating,
    updateBookMark,
    notes,
    relatedCourses,
    relatedLPs,
    updateNote,
    deleteNote,
    trainingOverviewAttributes,
    updateCertificationProofUrl,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    lastPlayingCourseId,
    lastPlayingCourseInstanceId,
    waitlistPosition,
    setSelectedInstanceInfo,
    courseInstanceMapping,
    flexLpEnrollHandler,
    setInstancesForFlexLPOnLoad,
    setSelectedLoList,
    selectedLoList,
    setCourseInstanceMapping,
    updatePlayerLoState,
    enrollViaModuleClick,
    setEnrollViaModuleClick,
    isRegisterInterestEnabled,
    registerInterestHandler,
    awardedPoints,
    updateLearningObject,
    isCourseEnrollable,
    isCourseEnrolled,
    courseInstanceMap,
  } = useTrainingPage(trainingId, trainingInstanceId);

  const {
    feedbackTrainingId,
    playerLaunchTimeStamp,
    shouldLaunchFeedback,
    handleL1FeedbackLaunch,
    notificationId,
    fetchCurrentLo,
    getFilteredNotificationForFeedback,
    submitL1Feedback,
    closeFeedbackWrapper,
  } = useFeedback();

  const user = useUserContext() || {};
  const { account } = useAccount();
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

  const [isInstancePageLoading, setIsInstancePageLoading] = useState(true);
  const [almAlert] = useAlert();
  //extesnion APP
  const [activeExtension, setActiveExtension] = useState<PrimeExtension>();
  const [extensionAppIframeUrl, setExtensionAppIframeUrl] = useState("");

  const loName = name;
  const inputRef = useRef<null | HTMLInputElement>(null);
  const state = store.getState();
  const [isUploading, setIsUploading] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [fileUploadProgress, setFileUploadProgress] = useState(state.fileUpload.uploadProgress);

  const [timeBetweenAttemptEnabled, setTimeBetweenAttemptEnabled] = useState(false);

  const [showAll, setShowAll] = useState(true);
  const [showUnselectedLOs, setShowUnselectedLOs] = useState(false);

  const [certProofFileName, setCertProofFileName] = useState("");
  const [disableCertProofUpload, setDisableCertProofUpload] = useState(true);
  const [certProofUploadDate, setCertProofUploadDate] = useState(null as any);
  const [trainingDuration, setTrainingDuration] = useState("");
  const [showGamificationPointsModal, setShowGamificationPointsModal] = useState(false);
  const supportedFileTypes = ".pdf,.doc,.docx,.png,.jpeg,.jpg,.gif";
  useEffect(() => {
    if (awardedPoints > 0) {
      setShowGamificationPointsModal(true);
    }
  }, [awardedPoints]);
  const closeGamificationModal = () => {
    setShowGamificationPointsModal(false);
  };
  const openGamificationModal = () => {
    return (
      <GamificationModal
        awardedPoints={awardedPoints}
        closeGamificationModal={closeGamificationModal}
      />
    );
  };
  const showExtensionErrorPopup = (message: string) => {
    let messageToDisplay = GetTranslation("native.extension.enrollment.failed.header");
    if (message) {
      messageToDisplay += GetTranslationsReplaced(
        "native.extension.enrollment.failed.custom.message",
        {
          x: message,
        },
        true
      );
    }
    messageToDisplay += GetTranslation("native.extension.enrollment.failed.message");
    messageToDisplay = `<div>${messageToDisplay}</div>`;
    almAlert(true, messageToDisplay, AlertType.error);
  };
  useEffect(() => {
    if (certProofFileName) {
      if (
        training.completionDateSameAsApprovalDate ||
        (!training.completionDateSameAsApprovalDate && certProofUploadDate)
      ) {
        setDisableCertProofUpload(false);
      }
    } else {
      setDisableCertProofUpload(true);
    }
  }, [certProofUploadDate, certProofFileName]);

  useEffect(() => {
    async function handleExtensionApp() {
      if (activeExtension) {
        const userResponse = await getALMUser();
        const userId = userResponse?.user?.id;
        const requestObj: any = {
          userId,
          loId: training?.id,
          loInstanceId: trainingInstance?.id,
          authToken: getTokenForNativeExtensions(),
          locale,
          invokePoint: activeExtension.invocationType,
        };
        const { launchType, invocationType } = activeExtension;
        if (invocationType === InvocationType.LEARNER_ENROLL) {
          requestObj.callbackUrl = getTrainingLink(training?.id, account.id, trainingInstance?.id);
        }

        if (launchType === EXTENSION_LAUNCH_TYPE.IN_APP) {
          const url = getExtensionAppUrl(activeExtension.url, requestObj);
          setExtensionAppIframeUrl(url.href);
        } else if (launchType === EXTENSION_LAUNCH_TYPE.SAME_TAB) {
          openExtensionInSameTab(activeExtension.url, requestObj);
        } else if (launchType === EXTENSION_LAUNCH_TYPE.NEW_TAB) {
          openExtensionInNewTab(activeExtension.url, requestObj);
          setActiveExtension(undefined);
        }
      }
    }
    handleExtensionApp();
  }, [activeExtension, training?.id, trainingInstance?.id]);

  const getExtensionHeaders = (token: string) => {
    return {
      "X-acap-extension-token": token,
    };
  };

  const processEnrollment = async (token: string) => {
    const headers = getExtensionHeaders(token);
    try {
      await enrollmentHandler({
        headers,
        allowMultiEnrollment: training.multienrollmentEnabled,
      });
    } catch (e) {
      showExtensionErrorPopup("");
      // almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  };

  useEffect(() => {
    if (training?.id) {
      //Note This settimeout is added to handle the extension app scenario
      setTimeout(() => {
        const queryParams = getQueryParamsFromUrl();
        if (queryParams?.extToken) {
          sendEvent(PrimeEvent.ALM_REMOVE_EXTENSION_RESPONSE_TOKEN);
          removeExtraQPFromExtension();
          const token = getParsedJwt(queryParams.extToken);
          if (token?.invokePoint === InvocationType.LEARNER_ENROLL) {
            const lpCourseInstancesinfo = getALMObject().storage.getItem(FLEX_LP_COURSE_INFO) || {};
            setInstancesForFlexLPOnLoad(lpCourseInstancesinfo);
            if (token.extResult == 1) {
              const headers = getExtensionHeaders(token);
              if (trainingInstance && trainingInstance.isFlexible) {
                const enroll: any = {};
                Object.keys(lpCourseInstancesinfo)?.forEach(key => {
                  enroll[key] = lpCourseInstancesinfo[key].instanceId;
                });
                flexLpEnrollHandler({ headers, body: { enroll } });
              } else {
                processEnrollment(queryParams.extToken);
              }
              return;
            }
            getALMObject().storage.removeItem(FLEX_LP_COURSE_INFO);
            showExtensionErrorPopup(token?.extError || "");
          }
        }
      }, 0);
    }
  }, [training?.id, trainingInstance]);

  // Navigating to instance page in case of multiple instances
  useEffect(() => {
    if (training) {
      const enrollmentCount = getEnrolledInstancesCount(training);
      const hasMultipleInstances = !hasSingleActiveInstance(training);

      //Auto Instance scenario
      const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);
      const redirectToTrainingPage =
        enrollmentCount === 1 || !hasMultipleInstances || isAutoInstanceEnrolled;
      const urlContainsInstanceId = window.location.href.includes(`/${TRAINING_INSTANCE_ID_STR}`);
      const loType = training.loType;
      const lpHasNoActiveInstance =
        loType === LEARNING_PROGRAM && !doesLPHaveActiveInstance(training);

      // Enrollments not coming under LP's instances, fix later
      // If only one instance is active, navigate to overview page of that instance
      if (
        !urlContainsInstanceId &&
        ((loType !== CERTIFICATION && !redirectToTrainingPage) ||
          (loType === LEARNING_PROGRAM && hasMultipleInstances && !training.enrollment) ||
          lpHasNoActiveInstance)
      ) {
        getALMObject().navigateToInstancePage(training.id);
        return;
      }
      setIsInstancePageLoading(false);
    }
  }, [training?.id]);

  useEffect(() => {
    document.addEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
    // document.addEventListener(PrimeEvent.ALM_SHOW_FEEDBACK, handleEmailFeedbackLaunch);
    // sendEvent(PrimeEvent.ALM_LISTENERS_LOADED);
    try{
      const feedbackData = getItemFromStorage(PrimeEvent.ALM_LO_FEEDBACK_DATA);
      if(!feedbackData){
        return;
      }
      const parsedData = JSON.parse(feedbackData);
      const notificationId = parsedData.notificationId;
      handleEmailFeedbackLaunch(notificationId);
      removeItemFromStorage(PrimeEvent.ALM_LO_FEEDBACK_DATA);
    }
    catch(e){
      console.error("Error in handleEmailFeedbackLaunch", e);
    }
    return () => {
      document.removeEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
      // document.removeEventListener(PrimeEvent.ALM_SHOW_FEEDBACK, handleEmailFeedbackLaunch);
    };
  }, []);

  const handlePlayerClose = async (event: any) => {
    try {
      const playerLaunchedId = event?.detail?.loId;
      if (!playerLaunchedId) {
        return;
      }
      const response = updateLearningObject && (await updateLearningObject(playerLaunchedId));
      if (HUNDERED_PERCENT !== response?.enrollment?.progressPercent) {
        return;
      }
      handleL1FeedbackLaunch(trainingId, trainingInstanceId, GetPrimeObj()._playerLaunchTimeStamp);
    } catch (e) {
      console.error("Error in handlePlayerClose", e);
    }
  };

  const handleEmailFeedbackLaunch = (notificationId: any) => {
    console.log("handle email function inside training page")
    try {
      handleL1FeedbackLaunch(trainingId, trainingInstanceId, 0, notificationId);
    } catch (e) {
      console.error("Error in handleEmailFeedbackLaunch", e);
    }
  };

  const courseIdList = Object.keys(courseInstanceMapping);

  const getDuration = (
    training: PrimeLearningObject,
    trainingInstance: PrimeLearningObjectInstance
  ) => {
    const duration =
      training.loType !== COURSE
        ? getSubLOsDuration(training, trainingInstance.isFlexible)
        : training.duration;

    if (duration === 0) {
      return GetTranslation("alm.notAvailable");
    }
    return calculateSecondsToTime(duration);
  };

  const getSubLOsDuration = (training: PrimeLearningObject, isFlexible: boolean) => {
    let duration = 0;

    training.subLOs?.forEach(subLO => {
      if (subLO.loType === COURSE) {
        if (isFlexible && courseIdList.includes(subLO.id)) {
          duration += courseInstanceMapping[subLO.id].courseDuration;
        } else {
          duration += subLO.duration;
        }
      } else {
        duration += getSubLOsDuration(subLO, subLO.instances[0].isFlexible);
      }
    });
    return duration;
  };

  useEffect(() => {
    if (training && trainingInstance) {
      setTrainingDuration(getDuration(training, trainingInstance));
    }
  }, [training, courseInstanceMapping]);

  function coursesViewHandler(value: string) {
    let showUnselectedLOs = false;
    if (value === "no") {
      showUnselectedLOs = true;
    }
    setShowUnselectedLOs(showUnselectedLOs);
    setSelectedLoList(courseInstanceMapping);
  }

  const areAllInstancesSelected = () => {
    const areAllCoursesSelected = courseIdList.length === coursesInsideFlexLPCount;
    if (areAllCoursesSelected && showAll) {
      clearInstanceSelected();
      setShowAll(false);
    }
    return areAllCoursesSelected;
  };

  function resetCourseList() {
    const unselectedButton = document.getElementById(
      "flexLPShowUnselectedCourses"
    ) as HTMLInputElement;
    if (unselectedButton?.checked) {
      setSelectedLoList(courseInstanceMapping);
    }
  }

  function clearInstanceSelected() {
    setShowUnselectedLOs(false);
  }

  if (isLoading || !training || isInstancePageLoading) {
    return <ALMLoader classes={styles.loader} />;
  }
  const loType = training.loType;
  const sections = training.sections;
  const prerequisiteLOs = training.prerequisiteLOs;
  const prequisiteConstraints = training.prequisiteConstraints;
  const enrollment = getEnrollment(training, trainingInstance);
  const isEnrolled = checkIsEnrolled(enrollment);
  const isFlexible = trainingInstance.isFlexible;
  const isRootLoCompleted = enrollment?.progressPercent === 100 || enrollment?.state === COMPLETED; //For ongoing session, once you complete the training, enrollment state takes around 10 mins to update to COMPLETED. For that case, we will be checking progress percent.
  const hasPreview = training.hasPreview;

  const isFlexLPOrContainsFlexLP = isFlexible || hasFlexibleChildLP(training);

  // FLEX LP list initialisation
  let allCoursesInsideFlexLP: PrimeLearningObject[] = [];
  let retiredCoursesInsideFlexLP: PrimeLearningObject[] = [];

  if (isFlexLPOrContainsFlexLP) {
    allCoursesInsideFlexLP = getCoursesInsideFlexLP(training, isFlexible);
    retiredCoursesInsideFlexLP = allCoursesInsideFlexLP.filter(lo =>
      lo.instances.every((instance: PrimeLearningObjectInstance) => instance.state === RETIRED)
    );
  }

  const coursesInsideFlexLPCount = allCoursesInsideFlexLP.length;

  // Case - Certificate is approved by manager but proof is not uploaded
  const certificateApprovedByManager = enrollment?.state === COMPLETED && !enrollment?.url;

  const startFileUpload = async () => {
    const inputElement = document.getElementById(inputElementId) as HTMLInputElement;
    const file = inputElement!.files!.item(0)!;

    setIsUploading(true);

    setFileUploadProgress(0);
    const progressCheck = setInterval(() => {
      updateFileUpdateProgress();
    }, 100);
    await getUploadInfo();

    const url = await uploadFile(file.name, file);

    clearInterval(progressCheck);

    let dateCompleted = "";

    if (!training.completionDateSameAsApprovalDate) {
      dateCompleted = convertDate();
    }
    try {
      const blFileUrl =
        (await updateCertificationProofUrl(url, training.id, trainingInstance.id, dateCompleted)) ||
        "";
      if (blFileUrl.length > 0) {
        setSubmissionUrl(blFileUrl);
      }
    } catch (errorMessage) {
      almAlert(true, errorMessage as string, AlertType.error);
      setCertProofFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileUpdateProgress = () => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  function convertDate() {
    if (!certProofUploadDate) {
      return "";
    }
    const date = new Date(certProofUploadDate);
    const currentTime = new Date();

    date.setHours(currentTime.getHours());
    date.setMinutes(currentTime.getMinutes());
    date.setSeconds(currentTime.getSeconds());

    const dateString = date.toISOString();
    return dateString;
  }

  const inputElementId = training.id + "-uploadFileSubmission";

  const fileSelected = async (event: any) => {
    const inputElement = document.getElementById(inputElementId) as HTMLInputElement;

    setCertProofFileName(inputElement!.files![0].name);
  };

  const cancelClickHandler = () => {
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsUploading(false);
  };

  const getSubmissionFileName = (url: string) => {
    const urlWithoutParams = url?.split("?")[0];
    const urlParts = urlWithoutParams?.split("/");
    return urlParts?.length > 0 ? urlParts[urlParts?.length - 1] : "";
  };

  const getFileSubmissionSection = () => {
    return (
      <>
        <div className={styles.uploadFileBox} data-automationid={`${name}-file-submission`}>
          <div
            className={styles.uploadContainerHeading}
            data-automationid={`${name}-certificate-upload-header`}
          >
            {formatMessage({
              id: "alm.overview.uploadProof.label",
              defaultMessage: "Upload Proof of Completion",
            })}
          </div>
          <div data-automationid={`${name}-proof-upload-input`}>{getUploadFileSection()}</div>
        </div>
        {getCompletionDateSection()}
        <div className={styles.proofUploadButton}>
          <div className={styles.uploadContainerHeading}></div>
          <button
            onClick={startFileUpload}
            className={`almButton secondary ${styles.uploadButton}`}
            disabled={disableCertProofUpload}
            data-automationid={`${name}-proof-upload-button`}
          >
            {formatMessage({
              id: "alm.community.upload.label",
              defaultMessage: "Upload",
            })}
          </button>
        </div>
      </>
    );
  };

  const getAwaitingApprovalSection = () => {
    return (
      <span
        className={styles.uploadedCertContainer}
        data-automationid={`${name}-awaiting-approval`}
      >
        <span>
          {formatMessage({
            id: "alm.overview.uploadedProof.label",
            defaultMessage: "Uploaded Proof of Completion",
          })}
        </span>
        <span className={styles.uploadedFileDetails}>
          {FILE_UPLOADED_ICON()}
          {getUploadedFileSection()}
          <span className={styles.awaitingApprovalLabel}>
            [{GetTranslation("alm.overview.awaitingApproval.label")}]
          </span>
        </span>
      </span>
    );
  };

  const getFileApprovedSection = () => {
    return (
      <span className={styles.uploadedCertContainer} data-automationid={`${name}-proof-approved`}>
        <span>
          {formatMessage({
            id: "alm.overview.uploadedProof.label",
            defaultMessage: "Uploaded Proof of Completion",
          })}
        </span>
        <span className={styles.approvedFileDetails}>
          <CheckmarkCircleOutline aria-hidden="true" />
          {getUploadedFileSection()}
          <span className={styles.proofApprovedLabel}>
            [{GetTranslation("alm.overview.cert.approved.label")}]
          </span>
        </span>
      </span>
    );
  };

  const getCertUploadSection = (state: string) => {
    switch (state) {
      case ENROLLED:
      case REJECTED:
        return getFileSubmissionSection();
      case PENDING_APPROVAL:
        return getAwaitingApprovalSection();
      case COMPLETED:
        return getFileApprovedSection();
      default:
        return "";
    }
  };

  const getUploadFileSection = () => {
    return (
      <span className={styles.fileUpload} data-automationid={`${name}-certificate-upload-section`}>
        <input
          type="file"
          id={inputElementId}
          className={styles.uploadFileSubmission}
          onChange={(event: any) => fileSelected(event)}
          ref={inputRef}
          data-automationid={`${name}-certUpload-input`}
          disabled={!areAllMandatoryCoursesCompleted(training)}
          accept={supportedFileTypes}
        />
        <label className={styles.fileSubmissionLabel} htmlFor={inputElementId}>
          <span>
            {!certProofFileName
              ? formatMessage({
                  id: "alm.choose.file",
                  defaultMessage: "Choose File",
                })
              : certProofFileName}
          </span>
        </label>
      </span>
    );
  };

  const getUploadedFileSection = () => {
    const url = submissionUrl || enrollment.url;
    return (
      <a className={styles.submissionLink} href={url} target="_blank" rel="noreferrer">
        {getSubmissionFileName(url)}
      </a>
    );
  };

  const iframeCloseHandler = (event: any) => {
    setExtensionAppIframeUrl("");
    setActiveExtension(undefined);
    if (typeof event === "string" && event.length) {
      showExtensionErrorPopup(event);
    }
  };

  const iframeProceedHandler = (token: string) => {
    const headers = getExtensionHeaders(token);
    processEnrollment(token);
    if (trainingInstance && trainingInstance.isFlexible) {
      const lpCourseInstancesinfo = getALMObject().storage.getItem(FLEX_LP_COURSE_INFO) || {};
      setInstancesForFlexLPOnLoad(lpCourseInstancesinfo);
      const enroll: any = {};
      Object.keys(lpCourseInstancesinfo)?.forEach(key => {
        enroll[key] = lpCourseInstancesinfo[key].instanceId;
      });
      flexLpEnrollHandler({ headers, body: { enroll } });
    } else {
      processEnrollment(token);
    }
    setExtensionAppIframeUrl("");
    setActiveExtension(undefined);
    getALMObject().storage.removeItem(FLEX_LP_COURSE_INFO);
  };

  const showCertProof = () => {
    return training.loType && training.isExternal && enrollment;
  };

  const areAllInstancesOfSectionSelected = (section: PrimeSections) => {
    const selectedLoObj = Object.keys(selectedLoList);

    return section.loIds.every(id => {
      const lo = training.subLOs.find(subLO => subLO.id === id);

      if (lo?.loType === COURSE) {
        return !isFlexible || selectedLoObj.includes(lo.id);
      } else {
        return (
          !lo?.instances[0].isFlexible ||
          lo?.subLOs.every(subLO => selectedLoObj.includes(subLO.id))
        );
      }
    });
  };

  const isProofUploaded = () => {
    return enrollment && enrollment.state === REJECTED
      ? false
      : submissionUrl || enrollment.url
        ? true
        : false;
  };

  // Use case : To unlock first child subLO before enrollment in ordered trainings
  const getFirstChildId = () => {
    if (loType === COURSE) {
      // Not valid if root training is course
      return "";
    }
    if (sections) {
      // For LP Sections
      return sections[0].loIds[0];
    }

    // For Certifications
    return training.subLOs ? training.subLOs[0].id : "";
  };

  const hasEnforcedPrerequisites = !arePrerequisitesEnforcedAndCompleted(training) && isEnrolled;
  const hasSubLoOrderEnforced = training.isSubLoOrderEnforced;

  const getCompletionDateSection = () => {
    if (isProofUploaded() || training.completionDateSameAsApprovalDate) {
      return ``;
    }

    const dateCreated = modifyTimeDDMMYY(training.dateCreated, locale);
    const dateCreatedObj = new Date(training.dateCreated);
    const formattedDate = splitStringIntoArray(dateCreatedObj.toISOString(), "T")[0];

    return (
      <div
        className={styles.enterCompletionDate}
        data-automationid={`${name}-cert-completion-date`}
      >
        <div
          className={styles.uploadContainerHeading}
          data-automationid={`${name}-certificate-completion-header`}
        >
          <span className={styles.completionDateInfo}>
            <span
              className={styles.completionDateInfoIcon}
              title={GetTranslationReplaced(
                "alm.overview.upload.completion.date.greater.than",
                dateCreated
              )}
            >
              <Info />
            </span>
            {formatMessage({
              id: "alm.overview.certCompletiondDate",
              defaultMessage: "Enter Completion Date",
            })}
          </span>
          <span className={styles.mandatoryModule}>
            <Asterisk />
          </span>
        </div>
        <DatePicker
          id="inputDateBox"
          value={certProofUploadDate}
          minValue={parseDate(formattedDate) as any}
          maxValue={today(getLocalTimeZone()) as any}
          onChange={setCertProofUploadDate}
          data-automationid={`${name}-cert-completion-date-input`}
        />
      </div>
    );
  };

  const getFileUploadNote = (state: string) => {
    switch (state) {
      case ENROLLED:
      case REJECTED:
        return (
          <>
            <span
              dangerouslySetInnerHTML={{
                __html: GetTranslation("alm.overview.certUploadNote"),
              }}
            />{" "}
            {GetTranslation("alm.overview.certUploadSupportedFormats")}
          </>
        );
      case PENDING_APPROVAL:
      case COMPLETED:
        return (
          <span
            className={styles.certUploadNoteText}
            dangerouslySetInnerHTML={{
              __html: GetTranslation("alm.overview.certUploadNote"),
            }}
          />
        );
      default:
        return "";
    }
  };

  const getSectionHeader = (section: PrimeSections) => {
    const { name } = getPreferredLocalizedMetadata(section.localizedMetadata, contentLocale);

    return (
      <div className={styles.sectionHeader}>
        {name && (
          <h3 className={styles.sectionName} data-automationid={`${name}-section-name`}>
            {name}
          </h3>
        )}
        {!section.mandatory && (
          <span className={styles.sectionOptional} data-automationid={`${name}-section-optional`}>
            {formatMessage({
              id: "alm.overview.section.optional",
              defaultMessage: "Optional",
            })}
          </span>
        )}
        {section.mandatory && section.mandatoryLOCount !== section.loIds?.length && (
          <span className={styles.sectionOptional} data-automationid={`${name}-section-options`}>
            {formatMessage(
              { id: "alm.overview.section.xOutOfy" },
              {
                0: section.mandatoryLOCount,
                1: section.loIds?.length,
              }
            )}
          </span>
        )}
      </div>
    );
  };

  const getFlexLpBox = () => {
    return (
      <section className={styles.coursesViewMenu}>
        <div className={styles.flexLpInfoBox}>
          <span className={styles.info}>
            <Info />
          </span>
          <div className={styles.script}>
            <span
              className={styles.courseViewLabel}
              data-automationid={`${name}-flexLp-courseViewLabel`}
            >
              {GetTranslation("alm.training.flexLp.courseViewLabel", true)}
            </span>
            <div className={styles.radioGroup}>
              <RadioGroup
                defaultValue="yes"
                onChange={coursesViewHandler}
                orientation="horizontal"
                isEmphasized
              >
                <Radio
                  id="flexLPShowAllCourses"
                  value="yes"
                  data-automationid="flexLPShowAllCourses"
                >
                  {GetTranslationsReplaced(
                    "alm.training.flexLp.showAllView",
                    { x: coursesInsideFlexLPCount.toString() },
                    true
                  )}
                </Radio>
                <Radio
                  id="flexLPShowUnselectedCourses"
                  value="no"
                  data-automationid="flexLPShowUnselectedCourses"
                >
                  {GetTranslationsReplaced(
                    "alm.training.flexLp.unselectedView",
                    {
                      x:
                        coursesInsideFlexLPCount -
                        courseIdList.length -
                        retiredCoursesInsideFlexLP.length,
                    },
                    true
                  )}
                </Radio>
              </RadioGroup>
            </div>
          </div>
        </div>

        <button
          className={styles.refreshDiv}
          aria-label={GetTranslation("alm.training.flexlp.refreshArialLabel", true)}
          onClick={resetCourseList}
          title={GetTranslation("alm.training.flexlp.refreshArialLabel", true)}
        >
          <span className={styles.refresh}>
            <Refresh />
          </span>
        </button>
      </section>
    );
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        {showGamificationPointsModal && openGamificationModal()}
        {shouldLaunchFeedback && (
          <PrimeFeedbackWrapper
            trainingId={trainingId}
            trainingInstanceId={trainingInstanceId}
            playerLaunchTimeStamp={playerLaunchTimeStamp}
            fetchCurrentLo={fetchCurrentLo}
            getFilteredNotificationForFeedback={getFilteredNotificationForFeedback}
            submitL1Feedback={submitL1Feedback}
            emailNotificationId={notificationId}
            closeFeedbackWrapper={closeFeedbackWrapper}
          />
        )}
        <div className={styles.backgroundPage}>
          {!getALMConfig().hideBackButton && <ALMBackButton />}
          <PrimeTrainingOverviewHeader
            format={training.loFormat}
            color={color}
            title={name}
            bannerUrl={bannerUrl}
            showProgressBar={isEnrolled}
            enrollment={enrollment}
            training={training}
            trainingInstance={trainingInstance}
            updateBookMark={updateBookMark}
            instanceSummary={instanceSummary}
            isCourseEnrollable={isCourseEnrollable}
            isCourseEnrolled={isCourseEnrolled}
          />

          <div className={styles.pageContainer}>
            <div className={styles.left}>
              {trainingOverviewAttributes.showDescription === "true" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      richTextOverview ||
                      overview ||
                      GetTranslation("alm.no.description.available", true),
                  }}
                  className={`${styles.overview} ql-editor`}
                  data-automationid={`${name}-overview`}
                ></div>
              )}
              {training.loType !== COURSE && (
                <span className={styles.duration}>
                  <span
                    className={styles.durationIcon}
                    data-automationid={`${name}-duration-clockIcon`}
                  >
                    {CLOCK_SVG()}
                  </span>
                  <span className={styles.durationText} data-automationid={`${name}-duration`}>
                    {GetTranslation("alm.overview.total.duration")}
                  </span>
                  : {trainingDuration}
                </span>
              )}
              {showCertProof() && (
                <>
                  {!isProofUploaded() && (
                    <div className={styles.externalCertUploadInfo}>
                      <span
                        className={styles.externalCertUploadMessage}
                        data-automationid={`${name}-external-certificate-message`}
                      >
                        {certificateApprovedByManager
                          ? formatMessage({ id: "alm.overview.manager.approved.externalCert" })
                          : formatMessage({ id: "alm.overview.externalCertInfo" })}
                      </span>
                    </div>
                  )}
                  {isUploading && (
                    <div className={styles.progressArea}>
                      <ProgressBar
                        label={formatMessage({
                          id: "alm.uploading.label",
                          defaultMessage: "Uploading...",
                        })}
                        value={fileUploadProgress}
                      />
                      <button
                        className={styles.primeStatusSvg}
                        title={formatMessage({
                          id: "alm.removeUpload.label",
                          defaultMessage: "Remove upload",
                        })}
                        onClick={cancelClickHandler}
                      >
                        {SOCIAL_CANCEL_SVG()}
                      </button>
                    </div>
                  )}
                  {!isUploading && !certificateApprovedByManager && (
                    <div>
                      <div className={styles.fileSubmissionContainer}>
                        {getCertUploadSection(enrollment.state)}
                      </div>
                      <div className={styles.fileUploadNote}>
                        {getFileUploadNote(enrollment.state)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {prerequisiteLOs ? (
                <h2 className={styles.trainingPrequisiteLabel}>
                  {loType === COURSE
                    ? GetTranslation("alm.training.overviewPrequisite.courses.label", true)
                    : GetTranslation("alm.training.overviewPrequisite.label", true)}
                </h2>
              ) : (
                ""
              )}
              {prerequisiteLOs?.map((prerequisiteLO, index) => {
                const { name, description, overview, richTextOverview } =
                  getPreferredLocalizedMetadata(prerequisiteLO.localizedMetadata, contentLocale);

                let showMandatoryLabel = false;
                const instance = prerequisiteLO.instances[0];
                prequisiteConstraints?.forEach(prequisiteConstraints => {
                  if (prequisiteConstraints.prerequisiteLOId === prerequisiteLO.id) {
                    showMandatoryLabel = prequisiteConstraints.mandatory;
                  }
                });
                return (
                  <section className={styles.trainingOverviewPrequisite} key={name}>
                    <PrimeTrainingItemContainerHeader
                      name={name}
                      description={description}
                      training={prerequisiteLO}
                      trainingInstance={instance}
                      overview={overview}
                      richTextOverview={richTextOverview}
                      launchPlayerHandler={launchPlayerHandler}
                      isPartOfLP={loType === LEARNING_PROGRAM}
                      showMandatoryLabel={showMandatoryLabel}
                      isprerequisiteLO={true}
                      isPreviewEnabled={isPreviewEnabled}
                      isParentLOEnrolled={isEnrolled}
                      isRootLOEnrolled={isEnrolled}
                      parentLoName={loName}
                      key={name}
                      parentHasEnforcedPrerequisites={hasEnforcedPrerequisites}
                      parentHasSubLoOrderEnforced={hasSubLoOrderEnforced}
                      isTrainingLocked={false}
                    />
                    <hr className={styles.prequisiteCourseSeparator} />
                  </section>
                );
              })}

              {isFlexLPOrContainsFlexLP && !areAllInstancesSelected() && getFlexLpBox()}

              {loType === COURSE && (
                <PrimeCourseOverview
                  training={training}
                  launchPlayerHandler={launchPlayerHandler}
                  trainingInstance={trainingInstance}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={isEnrolled}
                  isRootLOEnrolled={isEnrolled}
                  isRootLoPreviewEnabled={hasPreview}
                  showNotes={isEnrolled}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                  parentHasEnforcedPrerequisites={hasEnforcedPrerequisites}
                  parentHasSubLoOrderEnforced={hasSubLoOrderEnforced}
                  isTrainingLocked={false}
                  updatePlayerLoState={updatePlayerLoState}
                  isRootLoCompleted={isRootLoCompleted}
                  setEnrollViaModuleClick={setEnrollViaModuleClick}
                />
              )}
              {loType === CERTIFICATION && (
                <PrimeTrainingOverview
                  trainings={training.subLOs}
                  launchPlayerHandler={launchPlayerHandler}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={Boolean(enrollment)}
                  isRootLOEnrolled={Boolean(enrollment)}
                  isRootLoPreviewEnabled={hasPreview}
                  parentLoName={loName}
                  parentLO={training}
                  isPartOfCertification={true}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                  setSelectedInstanceInfo={setSelectedInstanceInfo}
                  isFlexible={false}
                  flexLPTraining={isFlexLPOrContainsFlexLP}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                  selectedLoList={selectedLoList}
                  showUnselectedLOs={showUnselectedLOs}
                  parentHasEnforcedPrerequisites={hasEnforcedPrerequisites}
                  parentHasSubLoOrderEnforced={hasSubLoOrderEnforced}
                  courseInstanceMapping={{}}
                  updatePlayerLoState={updatePlayerLoState}
                  isRootLoCompleted={isRootLoCompleted}
                  setEnrollViaModuleClick={setEnrollViaModuleClick}
                  firstChildId={getFirstChildId()}
                  courseInstanceMap={courseInstanceMap}
                />
              )}
              {loType === LEARNING_PROGRAM && (
                <>
                  {/* Adding header to separate subLOs and prerequisites inside LP */}
                  {prerequisiteLOs && (
                    <header
                      role="heading"
                      className={styles.subLOsHeader}
                      aria-level={2}
                      data-automationid="coreContent"
                    >
                      {GetTranslation("alm.text.coreContent", true)}
                    </header>
                  )}
                  {sections.map((section, index) => {
                    //Flex LP case - If all LO instances inside section is either selected or completed
                    if (showUnselectedLOs && areAllInstancesOfSectionSelected(section)) {
                      return;
                    }
                    const trainingIds = section.loIds;
                    const subLOs = training.subLOs.filter(
                      subLO => trainingIds.indexOf(subLO.id) !== -1
                    );
                    subLOs.sort(
                      (trainingId1, trainingId2) =>
                        trainingIds.indexOf(trainingId1.id) - trainingIds.indexOf(trainingId2.id)
                    );

                    return (
                      <section className={styles.trainingOverviewContainer} key={index}>
                        {getSectionHeader(section)}
                        <PrimeTrainingOverview
                          trainings={subLOs}
                          launchPlayerHandler={launchPlayerHandler}
                          isPartOfLP={loType === LEARNING_PROGRAM}
                          showMandatoryLabel={
                            section.mandatory && section.mandatoryLOCount === section.loIds?.length
                          }
                          isPreviewEnabled={isPreviewEnabled}
                          isFlexLPValidationEnabled={isFlexLPValidationEnabled}
                          updateFileSubmissionUrl={updateFileSubmissionUrl}
                          isParentLOEnrolled={isEnrolled}
                          isRootLOEnrolled={isEnrolled}
                          isRootLoPreviewEnabled={hasPreview}
                          parentLO={training}
                          parentLoName={loName}
                          setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                          timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                          setSelectedInstanceInfo={setSelectedInstanceInfo}
                          isFlexible={isFlexible}
                          flexLPTraining={isFlexLPOrContainsFlexLP}
                          courseInstanceMapping={courseInstanceMapping}
                          notes={notes}
                          updateNote={updateNote}
                          deleteNote={deleteNote}
                          downloadNotes={downloadNotes}
                          sendNotesOnMail={sendNotesOnMail}
                          lastPlayingLoResourceId={lastPlayingLoResourceId}
                          selectedLoList={selectedLoList}
                          showUnselectedLOs={showUnselectedLOs}
                          parentHasEnforcedPrerequisites={hasEnforcedPrerequisites}
                          updatePlayerLoState={updatePlayerLoState}
                          isRootLoCompleted={isRootLoCompleted}
                          parentHasSubLoOrderEnforced={hasSubLoOrderEnforced}
                          setEnrollViaModuleClick={setEnrollViaModuleClick}
                          firstChildId={getFirstChildId()}
                          courseInstanceMap={courseInstanceMap}
                        />
                      </section>
                    );
                  })}
                </>
              )}
            </div>
            <div className={styles.right}>
              <PrimeTrainingPageMetadata
                skills={skills}
                training={training}
                trainingInstance={trainingInstance}
                badge={instanceBadge}
                instanceSummary={instanceSummary}
                showAuthorInfo={trainingOverviewAttributes.showAuthorInfo}
                showEnrollDeadline={trainingOverviewAttributes.showEnrollDeadline}
                enrollmentHandler={enrollmentHandler}
                launchPlayerHandler={launchPlayerHandler}
                unEnrollmentHandler={unEnrollmentHandler}
                addToCartHandler={addToCartHandler}
                addToCartNativeHandler={addToCartNativeHandler}
                buyNowNativeHandler={buyNowNativeHandler}
                updateEnrollmentHandler={updateEnrollmentHandler}
                jobAidClickHandler={jobAidClickHandler}
                isPreviewEnabled={isPreviewEnabled}
                alternateLanguages={alternateLanguages}
                updateRating={updateRating}
                updateLearningObject={updateLearningObject}
                updateBookMark={updateBookMark}
                waitlistPosition={waitlistPosition}
                setActiveExtension={setActiveExtension}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                courseInstanceMapping={courseInstanceMapping}
                flexLpEnrollHandler={flexLpEnrollHandler}
                isFlexLPOrContainsFlexLP={isFlexLPOrContainsFlexLP}
                areAllInstancesSelected={areAllInstancesSelected}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
                lastPlayingCourseId={lastPlayingCourseId}
                lastPlayingCourseInstanceId={lastPlayingCourseInstanceId}
                relatedCoursesList={relatedCourses}
                relatedLpList={relatedLPs}
                setCourseInstanceMapping={setCourseInstanceMapping}
                enrollViaModuleClick={enrollViaModuleClick}
                setEnrollViaModuleClick={setEnrollViaModuleClick}
                isRegisterInterestEnabled={isRegisterInterestEnabled}
                registerInterestHandler={registerInterestHandler}
                isCourseEnrollable={isCourseEnrollable}
                isCourseEnrolled={isCourseEnrolled}
              />
            </div>
          </div>
        </div>
        {activeExtension && extensionAppIframeUrl?.length ? (
          <ALMExtensionIframeDialog
            href={extensionAppIframeUrl}
            classes="extensionDialog"
            onClose={iframeCloseHandler}
            onProceed={iframeProceedHandler}
            action={InvocationType.LEARNER_ENROLL}
            width={`${activeExtension.width}`}
            height={`${activeExtension.height}`}
            extension={activeExtension}
          ></ALMExtensionIframeDialog>
        ) : (
          ""
        )}
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeTrainingPage;
