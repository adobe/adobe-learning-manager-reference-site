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
import { ProgressBar } from "@adobe/react-spectrum";
import Asterisk from "@spectrum-icons/workflow/Asterisk";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import Visibility from "@spectrum-icons/workflow/Visibility";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeResource,
} from "../../../models/PrimeModels";
import {
  ACTIVITY,
  APPROVED,
  CHANGE,
  CHECKLIST,
  CLASSROOM,
  COMPLETED,
  CONNECTOR,
  ELEARNING,
  ENGLISH_LOCALE,
  FAILED,
  MOBILE_SCREEN_WIDTH,
  PASSED,
  PENDING,
  PENDING_APPROVAL,
  PENDING_SUBMISSION,
  PLAYER_CLOSE,
  PREVIEW,
  PREWORK,
  REJECTED,
  RETIRED,
  VIRTUAL_CLASSROOM,
} from "../../../utils/constants";
import { convertSecondsToHourAndMinsText, GetFormattedDate } from "../../../utils/dateTime";
import { getALMObject } from "../../../utils/global";
import { getEnrolledInstancesCount, getEnrollment, useResource } from "../../../utils/hooks";
import {
  checkIfLinkedInLearningCourse,
  getALMConfig,
  launchContentUrlInNewWindow,
} from "../../../utils/global";
import {
  ACTIVITY_SVG,
  AUDIO_SVG,
  CAPTIVATE_SVG,
  CLASSROOM_SVG,
  DOC_SVG,
  PDF_SVG,
  PPT_SVG,
  PRESENTER_SVG,
  QUIZ_SVG,
  SCORM_SVG,
  HTML_SVG,
  SOCIAL_CANCEL_SVG,
  CALENDAR_SVG,
  CLOCK_SVG,
  INSTRUCTOR_SVG,
  LINK_SVG,
  VENUE_SVG,
  MOVIE_CAMERA_SVG,
  SEATS_SVG,
  TRANSCRIPT_SVG,
  VIDEO_SVG,
  VIRTUAL_CLASSROOM_SVG,
  XLS_SVG,
  ERROR_ICON_SVG,
} from "../../../utils/inline_svg";
import {
  arePrerequisitesEnforcedAndCompleted,
  checkIsEnrolled,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  formatMap,
  GetTranslationReplaced,
} from "../../../utils/translationService";
import { cancelUploadFile, getUploadInfo, uploadFile } from "../../../utils/uploadUtils";
import styles from "./PrimeModuleItem.module.css";
import Refresh from "@spectrum-icons/workflow/Refresh";
import { ALMTooltip } from "../../Common/ALMTooltip";
import { useAccount } from "../../../hooks";
import {
  displayPendingRequirements,
  extractTrainingIdNum,
  shouldResetAttempt,
} from "../../../utils/lo-utils";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { useUserContext } from "../../../contextProviders/userContextProvider";
interface ActionMap {
  Classroom: string;
}
const moduleIconMap = {
  Classroom: CLASSROOM_SVG(),
  [VIRTUAL_CLASSROOM]: VIRTUAL_CLASSROOM_SVG(),
  Elearning: SCORM_SVG(),
  Activity: ACTIVITY_SVG(),
  VIDEO: VIDEO_SVG(),
  PPT: PPT_SVG(),
  DOC: DOC_SVG(),
  PDF: PDF_SVG(),
  XLS: XLS_SVG(),
  AUDIO: AUDIO_SVG(),
  CP: CAPTIVATE_SVG(),
  PR: PRESENTER_SVG(),
  QUIZ: QUIZ_SVG(),
  HTML: HTML_SVG(),
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const PrimeModuleItem: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResource: PrimeLearningObjectResource;
  isContent?: boolean;
  isPreviewEnabled: boolean;
  canPlay?: boolean;
  updateFileSubmissionUrl: Function;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  isParentLOEnrolled: boolean;
  isRootLOEnrolled?: boolean;
  isRootLoPreviewEnabled: boolean;
  isParentFlexLP: boolean;
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  lastPlayingLoResourceId: String;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  updatePlayerLoState: Function;
  childLpId?: string;
  isRootLoCompleted: boolean;
  setEnrollViaModuleClick: Function;
}> = props => {
  const {
    training,
    trainingInstance,
    launchPlayerHandler,
    loResource,
    isPreviewEnabled,
    canPlay,
    updateFileSubmissionUrl,
    isPartOfLP = false,
    isPartOfCertification = false,
    isParentLOEnrolled = false,
    isRootLOEnrolled = false,
    isRootLoPreviewEnabled = false,
    isParentFlexLP = false,
    parentHasEnforcedPrerequisites,
    parentHasSubLoOrderEnforced,
    lastPlayingLoResourceId,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    updatePlayerLoState,
    childLpId = "",
    isRootLoCompleted,
    setEnrollViaModuleClick,
  } = props;
  const { formatMessage, locale } = useIntl();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const { account } = useAccount();
  const [showDialog, setShowDialog] = useState(false);

  const isPartOfParentLO = isPartOfLP || isPartOfCertification;

  const showPreWorkLabel = loResource.loResourceType === PREWORK && isPartOfParentLO;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const isEnforcedPrerequisiteIncomplete = !arePrerequisitesEnforcedAndCompleted(training);
  const hasPendingPrerequisites =
    isEnforcedPrerequisiteIncomplete || parentHasEnforcedPrerequisites;

  const isModuleLocked = !canPlay;

  useEffect(() => {
    if (!showDialog) {
      return;
    }
    displayPendingRequirements(
      hasPendingPrerequisites,
      parentHasEnforcedPrerequisites,
      parentHasSubLoOrderEnforced,
      isPartOfLP,
      isPartOfCertification,
      almAlert
    );
  }, [almAlert, showDialog]);

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    setIsMobileScreen(window.innerWidth <= MOBILE_SCREEN_WIDTH);
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= MOBILE_SCREEN_WIDTH);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    contentLocale
  );
  const enrollment = getEnrollment(training, trainingInstance);
  const isEnrolled = checkIsEnrolled(enrollment);

  const resource = useResource(loResource, locale);

  const multipleAttempt = loResource?.multipleAttempt;
  const maxAttemptCount = multipleAttempt?.maxAttemptCount;
  const infiniteAttempts = multipleAttempt?.infiniteAttempts;
  const stopAttemptOnCompletion = multipleAttempt?.stopAttemptOnSuccessfulComplete;
  const attemptDuration = multipleAttempt?.attemptDuration || 0;
  const timeBetweenAttempts = multipleAttempt?.timeBetweenAttempts || 0;
  const learnerAttemptInfo = loResource?.learnerAttemptInfo;

  // Reattempt By default is true
  let isResetRequired = true;

  const isRootLoUnenrolled =
    (isPartOfParentLO && !isRootLOEnrolled) || (!isPartOfParentLO && !isEnrolled);

  const isModulePreviewAble = isPreviewEnabled && isRootLoUnenrolled && loResource.previewEnabled;

  const isClassroomOrVC =
    loResource.resourceType === CLASSROOM || loResource.resourceType === VIRTUAL_CLASSROOM;

  const isModuleNotClickable: boolean = !isEnrolled && isParentFlexLP;

  const isVC = loResource.resourceType === VIRTUAL_CLASSROOM;

  const isElearning = loResource.resourceType === ELEARNING;

  const hasSessionDetails = resource.dateStart && resource.completionDeadline ? true : false;

  const [attemptsDone, setAttemptsDone] = useState(
    loResource.learnerAttemptInfo?.attemptsFinishedCount as number
  );

  const filteredResourceGrades = enrollment?.loResourceGrades?.filter(
    loResourceGrade => loResourceGrade.id.search(loResource.id) !== -1
  );

  const loResourceGrade =
    filteredResourceGrades?.length > 0
      ? filteredResourceGrades[0]
      : ({} as PrimeLearningObjectResourceGrade);

  useEffect(() => {
    if (attemptsDone === undefined) {
      setAttemptsDone(0);
    }
  }, [attemptsDone]);
  function showReattemptButton() {
    if (isPrimeUserLoggedIn) {
      return (
        <button
          onClick={reattemptHandler}
          className={
            moduleLockedBetweenAttempt() ? styles.reattemptButtonDisabled : styles.reattemptButton
          }
          tabIndex={0}
        >
          <span className={styles.refresh}>
            <Refresh />
          </span>
          <span className={styles.reattempt}>{GetTranslation("alm.mqa.reattempt", true)}</span>
        </button>
      );
    }
  }
  function timeComparison() {
    const lastAttemptDate = new Date(loResource.learnerAttemptInfo?.lastAttemptEndTime);
    const currentTimeStamp = new Date();
    lastAttemptDate.setTime(lastAttemptDate.getTime() + timeBetweenAttempts * 60000);
    if (lastAttemptDate < currentTimeStamp) {
      setTimeBetweenAttemptEnabled(false);
      setAttemptsDone(loResource.learnerAttemptInfo?.attemptsFinishedCount as number);
    } else {
      setTimeBetweenAttemptEnabled(true);
    }
  }

  useEffect(() => {
    if (loResource.multipleAttemptEnabled) {
      if (loResource.learnerAttemptInfo?.attemptsFinishedCount && timeBetweenAttempts) {
        timeComparison();
      } else {
        setTimeBetweenAttemptEnabled(false);
      }
    }
  }, [loResource]);

  const getDurationText = () => {
    const duration = resource.authorDesiredDuration || resource.desiredDuration || 0;
    if (loResource.resourceType === ACTIVITY && duration === 0) {
      return ``;
    }
    return convertSecondsToHourAndMinsText(duration);
  };

  const moduleIcon = moduleIconMap[resource.contentType as keyof ActionMap] || SCORM_SVG();

  const showSessionTranscript = (): boolean => {
    if (loResource.sessionRecordingInfo?.length > 0) {
      for (let i = 0; i < loResource.sessionRecordingInfo.length; i++) {
        if (loResource.sessionRecordingInfo[i].transcriptUrl) {
          return true;
        }
      }
    }
    return false;
  };

  const sessionsTemplate = getSessionsTemplate(
    styles,
    resource,
    loResource,
    isClassroomOrVC,
    hasSessionDetails,
    getDurationText,
    isVC,
    isEnrolled,
    formatMessage,
    locale,
    showSessionTranscript,
    isPartOfParentLO,
    isParentLOEnrolled,
    isParentFlexLP,
    name,
    enrollment,
    isEnforcedPrerequisiteIncomplete,
    isModuleLocked,
    almConfirmationAlert
  );

  let descriptionTextHTML = getDescriptionTemplate(
    styles,
    description,
    overview,
    isClassroomOrVC,
    isElearning,
    hasSessionDetails,
    formatMessage,
    name
  );

  const loResourceMandatory = (): boolean => {
    if (loResource && loResource.mandatory) {
      return true;
    }
    return false;
  };

  const updatePlayerState = () => {
    if (!isPartOfParentLO) {
      return;
    }

    // Update root training player state -> sending last playing child lp and course
    updatePlayerLoState({
      body: {
        lastPlayingChildLp: extractTrainingIdNum(childLpId),
        lastPlayingCourse: extractTrainingIdNum(training.id),
      },
    });
  };

  const enrollOnModuleClick = () => {
    const isMultienrolled = getEnrolledInstancesCount(training) > 1;

    setEnrollViaModuleClick({
      id: training.id,
      moduleId: loResource.id,
      instanceId: trainingInstance.id,
      isMultienrolled: isMultienrolled,
    });
    updatePlayerState();
  };

  const itemClickHandler = (event: any, reattemptButtonClicked = false) => {
    if (isPartOfParentLO && !isParentLOEnrolled && !isModulePreviewAble) {
      return;
    }
    if (isEnrolled && (!canPlay || hasPendingPrerequisites)) {
      // either parent training or current training has pending prerequisites
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
      return;
    }

    if (isModulePreviewAble && !isPrimeUserLoggedIn) {
      storeActionInNonLoggedMode(PREVIEW);
      launchPlayerHandler();
      return;
    }

    // Case when no attempt is left
    // if (multipleAttempt && attemptsLeft <= 0 && !infiniteAttempts) {
    //   return;
    // }
    //Commenting above code as we are not exactly sure of what needs to be done

    // Case when module is completed
    if (moduleStopOnSuccessfulComplete() && reattemptButtonClicked) {
      return;
    }
    if ((isEnrolled && !isClassroomOrVC) || (isModulePreviewAble && isPrimeUserLoggedIn)) {
      if (
        checkIfLinkedInLearningCourse(training) &&
        getALMConfig().handleLinkedInContentExternally
      ) {
        return launchContentUrlInNewWindow(training, loResource);
      }
      const isMultienrolled = getEnrolledInstancesCount(training) > 1;
      const isResetReattemptRequired = reattemptButtonClicked
        ? isResetRequired
        : shouldResetAttempt(training, loResource, enrollment);

      updatePlayerState();

      launchPlayerHandler({
        id: training.id,
        moduleId: loResource.id,
        trainingInstanceId: trainingInstance.id,
        isMultienrolled: isMultienrolled,
        isResetRequired: isResetReattemptRequired,
      });
    }
  };
  const keyDownHandler = (event: any) => {
    if (event.key === "Enter") {
      itemClickHandler(event);
    }
  };

  const capitalizeFirstChar = (value: string) => {
    return value.toLowerCase().charAt(0).toUpperCase() + value.toLowerCase().slice(1);
  };

  const isParentEnrollmentValid = (isPartOfParentLO && isParentLOEnrolled) || !isPartOfParentLO;

  const formatLabel =
    loResource.resourceType && formatMap[loResource.resourceType]
      ? GetTranslation(
          `${
            loResource.resourceSubType !== CHECKLIST
              ? formatMap[loResource.resourceType]
              : formatMap[capitalizeFirstChar(loResource.resourceSubType)]
          }`,
          true
        )
      : "";

  const gradeHasPassed = (): boolean => {
    if (!enrollment) {
      return false;
    }

    if (loResourceGrade.hasPassed) {
      return true;
    }

    return false;
  };

  const state = store.getState();
  const [isUploading, setIsUploading] = useState(false);
  const [submissionState, setSubmissionState] = useState(loResource.submissionState);
  const [submissionUrl, setSubmissionUrl] = useState(loResource.submissionUrl);
  const [fileUploadProgress, setFileUploadProgress] = useState(state.fileUpload.uploadProgress);

  const inputRef = useRef<null | HTMLInputElement>(null);
  const startFileUpload = (event: any) => {
    event?.stopPropagation();
    (inputRef?.current as HTMLInputElement)?.click();
  };

  const updateFileUpdateProgress = () => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  useEffect(() => {
    setSubmissionState(loResource.submissionState);
    setSubmissionUrl(loResource.submissionUrl);
  }, [loResource.submissionState, loResource.submissionUrl]);

  const inputElementId = loResource.id + "-uploadFileSubmission";

  const fileSelected = async (event: any) => {
    event.stopPropagation();
    const inputElement = document.getElementById(inputElementId) as HTMLInputElement;
    setFileUploadProgress(0);
    setIsUploading(true);
    const progressCheck = setInterval(() => {
      updateFileUpdateProgress();
    }, 500);
    await getUploadInfo();
    const fileUrl = await uploadFile(
      inputElement!.files!.item(0)!.name,
      inputElement!.files!.item(0)!
    );
    let blFileUrl =
      (await updateFileSubmissionUrl(fileUrl, training.id, trainingInstance.id, loResource.id)) ||
      "";
    if (blFileUrl.length > 0) {
      setSubmissionState("PENDING_APPROVAL");
      setSubmissionUrl(blFileUrl);
    }
    clearInterval(progressCheck);
    setIsUploading(false);
  };

  const cancelClickHandler = (event: any) => {
    event.stopPropagation();
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsUploading(false);
  };

  const getSubmissionFileName = (url: string) => {
    let fileUrl = url;
    let fileNameToReturn = "";
    if (fileUrl) {
      let dummyUrl = new URL(fileUrl);
      fileUrl = `${dummyUrl.origin}${dummyUrl.pathname}`;
      // Extract filename from the URL
      let fileNameWithExtension = decodeURI(fileUrl).substring(fileUrl.lastIndexOf("/") + 1);
      if (fileNameWithExtension.length <= 15) {
        return fileNameWithExtension;
      }
      let lastDotIndex = fileNameWithExtension.lastIndexOf(".");
      let fileName = fileNameWithExtension.substring(0, lastDotIndex);
      let extension = fileNameWithExtension.substring(lastDotIndex - 1);
      // Trim filename to 15 characters
      let trimmedFilename = fileName.substring(0, 15);
      // Concatenate trimmed filename and extension
      fileNameToReturn = trimmedFilename + "..." + extension;
    }
    return fileNameToReturn;
  };

  const showFileSubmission = () => {
    return isEnrolled && loResource.submissionEnabled && canPlay;
  };

  const checklistStatusCheck = (status: string) => {
    return (
      loResource.checklistEvaluationStatus &&
      loResource.checklistEvaluationStatus.toLowerCase() === status
    );
  };

  const showChecklistFailInfo = () => {
    return isRootLOEnrolled && loResource.isChecklistMandatory && checklistStatusCheck(FAILED);
  };

  const showChecklistStatus = () => {
    if (!loResource.checklistEvaluationStatus) {
      return;
    }

    if (loResource.checklistEvaluationStatus === PENDING) {
      return (
        <>
          {getSeparatorDot()}
          {formatMessage({
            id: "alm.overview.checklistReviewPending",
            defaultMessage: "Reviewer evaluation is pending",
          })}
        </>
      );
    }
    return (
      <>
        {getSeparatorDot()}
        <span
          className={checklistStatusCheck(PASSED) ? styles.passStatus : styles.failStatus}
          data-automationid={`${name}-checklist-status`}
        >
          {capitalizeFirstChar(loResource.checklistEvaluationStatus.toLowerCase())}
        </span>
      </>
    );
  };

  const getFileUploadSection = (hasSession: Boolean, state: String) => {
    const allowFileUpdate = true;
    let fileNotAccessibleHtml = <></>;
    if (loResource.isExpiredSubmission) {
      fileNotAccessibleHtml = (
        <>
          {getSeparatorDot()}
          <span data-automationid={`${name}-submission-notAccessible`}>
            {formatMessage({
              id: "alm.overview.document.not.accessible.note",
              defaultMessage: "Last submission not accessible",
            })}
          </span>
          {account.expireSubmissionDuration && account.expireSubmissionDuration > 0 ? (
            <span className={styles.fileNotAccessibleIcon}>
              <ALMTooltip
                message={formatMessage(
                  {
                    id: "alm.overview.document.not.accessible.disclaimer",
                    defaultMessage: `Document is not accessible after ${account.expireSubmissionDuration} days from last submission date`,
                  },
                  {
                    days: account.expireSubmissionDuration,
                  }
                )}
              ></ALMTooltip>
            </span>
          ) : (
            ""
          )}
        </>
      );
    }
    switch (state) {
      case REJECTED:
        return (
          <>
            <span className={styles.fileSubmissionContainer}>
              <span
                className={styles.fileRejected}
                data-automationid={`${name}-submission-rejected`}
              >
                {formatMessage({
                  id: "alm.overview.rejected.label",
                  defaultMessage: "Submission Rejected",
                })}
                {" : "}
              </span>

              {fileNotAccessibleHtml}
            </span>
            {getUploadedFileSection(hasSession, allowFileUpdate)}
          </>
        );

      case PENDING_APPROVAL:
        return (
          <>
            <span className={styles.fileSubmissionContainer}>
              <span
                className={styles.fileAwaitingApproval}
                data-automationid={`${name}-submission-awaiting-approval`}
              >
                {formatMessage({
                  id: "alm.overview.submissionAwaitingApproval.label",
                  defaultMessage: "Submission Awaiting Approval",
                })}
                {" : "}
              </span>

              {fileNotAccessibleHtml}
            </span>
            {getUploadedFileSection(hasSession, allowFileUpdate)}
          </>
        );
      case APPROVED:
        return (
          <>
            <span className={styles.fileSubmissionContainer}>
              <span
                className={styles.fileApproved}
                data-automationid={`${name}-submission-approved`}
              >
                {formatMessage({
                  id: "alm.overview.approved.label",
                  defaultMessage: "Submission Approved",
                })}
                {submissionUrl ? " : " : ""}
              </span>

              {fileNotAccessibleHtml}
            </span>
            {getUploadedFileSection(hasSession, !allowFileUpdate)}
          </>
        );
      case PENDING_SUBMISSION:
      default:
        return (
          <>
            <span
              className={`${styles.fileSubmissionContainer} ${styles.fileAwaitingApproval}`}
              data-automationid={`${name}-file-submission`}
            >
              {formatMessage({
                id: "alm.overview.submissionPending.label",
                defaultMessage: "Submission Pending",
              })}
            </span>
            {getUploadFileSection(hasSession)}
          </>
        );
    }
  };

  const showUpload = (hasSession: Boolean) => {
    if (hasSession) {
      return new Date(resource.dateStart) < new Date();
    }
    return true;
  };
  const getUploadFileSection = (hasSession: Boolean, state?: String) => {
    return (
      showUpload(hasSession) && (
        <span>
          <button
            onClick={startFileUpload}
            className={`${styles.uploadButton} ${styles.link}`}
            data-automationid={`${name}-upload-button`}
          >
            (
            {state === CHANGE
              ? formatMessage({
                  id: "alm.module.change",
                  defaultMessage: "Change",
                })
              : formatMessage({
                  id: "alm.overview.module.uploadFile",
                  defaultMessage: "Upload File",
                })}
            )
          </button>
          <input
            type="file"
            id={inputElementId}
            className={styles.uploadFileSubmission}
            onChange={(event: any) => fileSelected(event)}
            onClick={(event: any) => stopClickPropagation(event)}
            ref={inputRef}
            data-automationid={`${name}-upload-file-input`}
          />
        </span>
      )
    );
  };

  const getUploadedFileSection = (hasSession: Boolean, changeAllowed: Boolean) => {
    return (
      <>
        <a
          className={styles.submissionLink}
          href={submissionUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event: any) => stopClickPropagation(event)}
          data-automationid={`${name}-submission-url`}
        >
          {getSubmissionFileName(submissionUrl)}
        </a>
        {changeAllowed && getUploadFileSection(hasSession, CHANGE)}
      </>
    );
  };

  const stopClickPropagation = (event: any) => {
    event?.stopPropagation();
  };

  const isLastPlayedModule =
    enrollment &&
    (loResource.id === lastPlayingLoResourceId ||
      loResource?.id.split("_")[2] === lastPlayingLoResourceId?.split("_")[2]) &&
    ((!isPartOfParentLO && enrollment.state !== COMPLETED) ||
      (isPartOfParentLO && !isRootLoCompleted));

  function calculateAttemptsLeft() {
    if (infiniteAttempts) {
      return 0;
    }
    const attemptEndCriteria = multipleAttempt?.attemptEndCriteria;
    const maxAttempts = maxAttemptCount || 0;
    const attemptsFinished = learnerAttemptInfo?.attemptsFinishedCount || 0;
    const currentAttemptNum = learnerAttemptInfo?.currentAttemptNumber || 0;
    const remainingCount = maxAttempts - (currentAttemptNum || attemptsFinished);

    if (remainingCount >= 0) {
      return remainingCount;
    }
    if (attemptEndCriteria === PLAYER_CLOSE && currentAttemptNum) {
      return 1;
    }
    if (
      learnerAttemptInfo &&
      !learnerAttemptInfo.currentAttemptStartTime &&
      !learnerAttemptInfo.currentAttemptEndTime
    ) {
      isResetRequired = false;
      return 1;
    }
    return 0;
  }

  const attemptsLeft = calculateAttemptsLeft();

  const moduleStopOnSuccessfulComplete = () => {
    if (stopAttemptOnCompletion && loResourceGrade?.hasPassed) {
      return true;
    }
    return false;
  };

  const resourceClickHandler = async (event: any) => {
    const isCourse = !(isPartOfLP || isPartOfCertification);
    const isNotEnrolled = isCourse ? !isEnrolled : !isParentFlexLP && !isRootLOEnrolled;

    if (isNotEnrolled) {
      if (isRootLoPreviewEnabled && !isModulePreviewAble) {
        almAlert(
          true,
          GetTranslation("alm.overview.error.module.no.preview", true),
          AlertType.error
        );
        return;
      }

      // if training is not enrolled and module is locked, it means subLOs order is enforced
      if (!isModuleLocked) {
        if (trainingInstance.state === RETIRED) {
          return;
        }
        if (!training.hasPreview) {
          enrollOnModuleClick();
          return;
        }
      }
    }
    if (
      !(
        loResource.multipleAttemptEnabled &&
        loResource.learnerAttemptInfo &&
        moduleLockedBetweenAttempt()
      )
    ) {
      itemClickHandler(event);
    } else {
      almAlert(true, GetTranslation("alm.mqa.module.locked.message"), AlertType.error);
    }
  };

  if (loResource.learnerAttemptInfo) {
    if (attemptsDone < loResource.learnerAttemptInfo.attemptsFinishedCount && !gradeHasPassed()) {
      if (timeBetweenAttempts) {
        setTimeBetweenAttemptEnabled(true);
      }
    }
  }

  const moduleLockedBetweenAttempt = () => {
    if (timeBetweenAttempts === 0 || !timeBetweenAttempts) {
      return false;
    }
    const lastAttemptEndTime =
      new Date(
        loResource.learnerAttemptInfo?.currentAttemptEndTime ||
          loResource.learnerAttemptInfo?.lastAttemptEndTime ||
          0
      ).getTime() || 0;

    const attemptStartTime = lastAttemptEndTime + timeBetweenAttempts * 60 * 1000;

    const now = new Date().getTime();

    return now < attemptStartTime;
  };

  const reattemptHandler = (event: any) => {
    event.stopPropagation();
    if (moduleLockedBetweenAttempt()) {
      almAlert(true, GetTranslation("alm.mqa.module.locked.message"), AlertType.error);
    } else {
      itemClickHandler(event, true);
    }
  };

  const getSeparatorDot = () => {
    return <span className={styles.metadata_separator} />;
  };

  const getRefreshIcon = () => {
    return (
      <span className={styles.completedRefresh} data-automationid={`${name}-mqa-refresh-icon`}>
        <Refresh />
      </span>
    );
  };

  const getAttemptText = () => {
    return (
      <span className={styles.attemptsDuration} data-automationid={`${name}-mqa-attempt`}>
        {GetTranslation("alm.mqa.attempt", true)}
      </span>
    );
  };

  const getAttemptDuration = () => {
    if (attemptDuration === 0) {
      return;
    }
    return (
      <>
        {getSeparatorDot()}
        <span
          className={styles.attemptsDuration}
          data-automationid={`${name}-mqa-attempt-duration`}
        >
          {isMobileScreen ? `| ` : ``}
          {GetTranslationReplaced("alm.mqa.attemptDuration", attemptDuration.toString(), true)}
        </span>
      </>
    );
  };

  const attemptDescription = () => {
    if (!loResource.multipleAttemptEnabled || !resource.hasQuiz) {
      return;
    }

    if (gradeHasPassed() && stopAttemptOnCompletion) {
      return (
        <>
          {getSeparatorDot()}
          <span className={styles.attemptDescriptionContainer}>
            {getRefreshIcon()}
            <span
              className={styles.initialAttempts}
              data-automationid={`${name}-mqa-moduleCompleted`}
            >
              {GetTranslation("alm.mqa.moduleCompletes", true)}
            </span>
            {getAttemptDuration()}
          </span>
        </>
      );
    }
    if (infiniteAttempts) {
      if (!loResource.learnerAttemptInfo || !loResourceGrade.dateStarted) {
        return (
          <>
            {getSeparatorDot()}
            <span className={styles.attemptDescriptionContainer}>
              {getAttemptText()}
              <span
                className={styles.initialAttempts}
                data-automationid={`${name}-mqa-infiniteAttempt`}
              >
                {GetTranslation("alm.mqa.infiniteAttempt")}
              </span>
              {getAttemptDuration()}
            </span>
          </>
        );
      } else {
        return (
          <>
            {getSeparatorDot()}
            <span className={styles.attemptDescriptionContainer}>
              {showReattemptButton()}
              {getAttemptDuration()}
            </span>
          </>
        );
      }
    } else if (loResource.learnerAttemptInfo) {
      return (
        <>
          {getSeparatorDot()}
          <span className={styles.attemptDescriptionContainer}>
            {attemptsLeft <= 0 ? (
              <>
                {getRefreshIcon()}
                <span className={styles.noAttemptLeft}>
                  {GetTranslation("alm.mqa.noAttemptLeft", true)}
                </span>
                {getAttemptDuration()}
              </>
            ) : (
              <span className={styles.attemptDescriptionContainer}>
                <button
                  onClick={reattemptHandler}
                  className={
                    moduleLockedBetweenAttempt()
                      ? styles.reattemptButtonDisabled
                      : styles.reattemptButton
                  }
                  disabled={attemptsLeft === 0}
                  tabIndex={0}
                >
                  <span className={styles.refresh}>
                    <Refresh />
                  </span>
                  <span className={styles.reattempt}>
                    {GetTranslation("alm.mqa.reattempt", true)}
                  </span>
                </button>
                <span className={styles.attemptsLeft}>
                  {GetTranslationReplaced(
                    "alm.mqa.attemptsLeft",
                    attemptsLeft > 0 ? attemptsLeft.toString() : "1",
                    true
                  )}
                </span>
                {getAttemptDuration()}
              </span>
            )}
          </span>
        </>
      );
    }
    return (
      <>
        {getSeparatorDot()}
        <span className={styles.attemptDescriptionContainer}>
          {getAttemptText()}
          <span
            className={styles.initialAttempts}
            data-automationid={`${name}-mqa-maxAttemptCount`}
          >
            {maxAttemptCount}
          </span>
          {getAttemptDuration()}
        </span>
      </>
    );
  };

  return (
    <>
      <li
        className={`${styles.container} ${
          loResourceMandatory() ? styles.mandatoryModuleContainer : ``
        }`}
        data-automationid={`${name}-module-container`}
      >
        <div
          className={`${styles.headerContainer} ${isModuleNotClickable ? "" : styles.cursor}`}
          tabIndex={0}
          data-test={loResource.id}
          onClick={resourceClickHandler}
          onKeyDown={keyDownHandler}
          role="button"
          data-automationid={`${name}-module-header`}
        >
          <div className={styles.icon} aria-hidden="true" data-automationid={`${name}-module-icon`}>
            {loResourceMandatory() ? (
              <span className={styles.mandatoryModule}>
                <Asterisk />
              </span>
            ) : (
              ""
            )}
            {moduleIcon}

            {gradeHasPassed() && isParentEnrollmentValid ? (
              <span className={styles.modulePassed}>
                <CheckmarkCircle aria-hidden="true" />
              </span>
            ) : isModuleLocked ? (
              <span className={styles.moduleLocked}>
                <LockClosed aria-hidden="true" />
              </span>
            ) : (
              ""
            )}
          </div>
          <div className={styles.headerWrapper}>
            <div className={styles.titleContainer}>
              <span
                className={styles.title}
                data-automationid={`${name}-module-title`}
                title={name}
              >
                <span aria-label={resource.contentType}></span>
                {name} {showPreWorkLabel ? GetTranslation("alm.module.prework", true) : ""}
              </span>
              {isLastPlayedModule ? (
                <span className={styles.lastVisitedMssg}>
                  {formatMessage({ id: "alm.module.lastVisited" })}
                </span>
              ) : (
                ""
              )}
              {isModulePreviewAble && (
                <span
                  className={`${styles.previewable} ${styles.link}`}
                  data-automationid={`${name}-preview`}
                >
                  {formatMessage({
                    id: "alm.module.session.preview",
                    defaultMessage: "Preview",
                  })}
                  <Visibility aria-hidden="true" />
                </span>
              )}
            </div>
            <div className={styles.resourceAndDuration}>
              <div>
                <span className={styles.resourceType} data-automationid={`${name}-resource-type`}>
                  <span className={styles.moduleFormat} title={formatLabel}>
                    {formatLabel}
                  </span>
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
                  {isParentEnrollmentValid && (
                    <>
                      {!isUploading && showFileSubmission() && (
                        <>
                          {getSeparatorDot()}
                          {getFileUploadSection(isClassroomOrVC, submissionState)}
                        </>
                      )}
                      {attemptDescription()}
                    </>
                  )}
                  {canPlay && isRootLOEnrolled && (
                    <span
                      className={styles.checklistStatus}
                      data-automationid={`${name}-checklist-status`}
                    >
                      {showChecklistStatus()}
                    </span>
                  )}
                </span>
                {showChecklistFailInfo() && (
                  <span
                    className={styles.checklistFailInfo}
                    data-automationid={`${name}-checklist-fail-info`}
                  >
                    {GetTranslation("alm.overview.checklistFailInfo", true)}
                  </span>
                )}
              </div>
              <span data-automationid={`${name}-duration`}>{getDurationText()}</span>
            </div>
          </div>
        </div>
        <div
          className={`${descriptionTextHTML || sessionsTemplate ? styles.wrapperContainer : ""}`}
          data-automationid={`${name}-details-container`}
        >
          {descriptionTextHTML}
          {sessionsTemplate}
        </div>
      </li>
    </>
  );
};

const getDescriptionTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  description: string,
  overview: string,
  isClassroomOrVC: boolean,
  isElearning: boolean,
  hasSessionDetails: boolean,
  formatMessage: Function,
  moduleName: string
) => {
  if (isElearning) {
    return "";
  }
  if (isClassroomOrVC && !hasSessionDetails) {
    return (
      <div className={`${styles.noSessionDetails} ${styles.moduleDescription}`}>
        {ERROR_ICON_SVG()}
        {formatMessage({
          id: "alm.module.session.detail",
          defaultMessage: "No session details have been updated",
        })}
      </div>
    );
  }

  return description ? (
    <div
      className={styles.moduleDescription}
      title={description}
      data-automationid={`${moduleName}-description`}
    >
      {description}
    </div>
  ) : (
    overview && <div className={styles.moduleDescription}>{description || overview}</div>
  );
};

const getSessionsTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  resource: PrimeResource,
  loResource: PrimeLearningObjectResource,
  isClassroomOrVC: boolean,
  hasSessionDetails: boolean,
  getDurationText: Function,
  isVC: boolean = false,
  isEnrolled: boolean,
  formatMessage: Function,
  locale: string,
  showSessionTranscript: Function,
  isPartOfParentLO: boolean,
  isParentLOEnrolled: boolean,
  isParentFlexLP: boolean,
  moduleName: string,
  enrollment: PrimeLearningObjectInstanceEnrollment,
  isEnforcedPrerequisiteIncomplete: boolean,
  isModuleLocked: boolean,
  almConfirmationAlert: Function
) => {
  if (!isClassroomOrVC || (isClassroomOrVC && !hasSessionDetails)) {
    return "";
  }
  const instructorNames = resource.instructorNames?.length
    ? resource.instructorNames.join(", ")
    : formatMessage({ id: "alm.notAvailable" }, { defaultMessage: "Not Available" });

  const getSessionMetaDataIcon = (iconSvg: JSX.Element, automationid: string) => {
    return (
      <div className={styles.spectrumIcon} data-automationid={automationid}>
        {iconSvg}
      </div>
    );
  };

  const showVcLink = (resource: PrimeResource) => {
    if ((isPartOfParentLO && !isParentLOEnrolled) || (!isPartOfParentLO && isModuleLocked)) {
      return false;
    }

    return enrollment ? true : false;
  };

  const canStartVcModule = () => {
    const start = new Date(resource.dateStart!);
    const now = new Date();
    const diff = (start as never) - (now as never);
    if (diff > FIFTEEN_MINUTES) {
      return false;
    }
    return true;
  };

  const handleVcUrlClick = () => {
    const isSessionPassed = new Date() > new Date(resource.completionDeadline);
    if (isConnectorTypeModule && isSessionPassed) {
      almConfirmationAlert(
        formatMessage({ id: "text.information", defaultMessage: "Information" }),
        GetTranslation("alm.vc.url.sessionCompleted", true),
        formatMessage({
          id: "alm.community.ok.label",
          defaultMessage: "Ok",
        })
      );
      return;
    }

    if (!resource.location) {
      return;
    }

    window.open(resource.location, "_blank", "noreferrer");
  };

  const metadataClass = `${styles.metadata} ${styles.metadataLineSeparator}`;

  const timeInfo = getTimeInfo(resource, formatMessage, locale);
  const showSeatLimit = Boolean(resource.seatLimit);
  const isConnectorTypeModule = loResource.vcHostingSystem === CONNECTOR;
  const linkDisabled = isConnectorTypeModule && !canStartVcModule();
  return (
    <div className={styles.metaDataContainer}>
      <div className={metadataClass} data-automationid={`${moduleName}-date`}>
        {getSessionMetaDataIcon(CALENDAR_SVG(), `${moduleName}-dateAndTime-icon`)}
        <div className={styles.details}>
          <span className={styles.detailsHeader} data-automationid={`${moduleName}-date-header`}>
            {GetTranslation("alm.overview.session.date.header")}
          </span>
          <span className={styles.sessionDate} data-automationid={`${moduleName}-dateAndTime`}>
            <span>{timeInfo.dateText}</span>
            <span>{timeInfo.timeText}</span>
          </span>
        </div>
      </div>
      <div className={metadataClass} data-automationid={`${moduleName}-duration`}>
        {getSessionMetaDataIcon(CLOCK_SVG(), `${moduleName}-duration-icon`)}
        <div className={styles.details}>
          <span
            className={styles.detailsHeader}
            data-automationid={`${moduleName}-duration-header`}
          >
            {GetTranslation("alm.overview.total.duration")}
          </span>
          <span data-automationid={`${moduleName}-duration`}>{getDurationText()}</span>
        </div>
      </div>
      {showSeatLimit && (
        <div className={metadataClass} data-automationid={`${moduleName}-seat-limit`}>
          {getSessionMetaDataIcon(SEATS_SVG(), `${moduleName}-seatLimit-icon`)}
          <div className={styles.details}>
            <span
              className={styles.detailsHeader}
              data-automationid={`${moduleName}-seatLimit-header`}
            >
              {GetTranslation("alm.overview.session.seat.limit.header")}
            </span>
            <span data-automationid={`${moduleName}-seatLimit`}>{resource.seatLimit}</span>
          </div>
        </div>
      )}
      {!showSeatLimit && isClassroomOrVC && (
        <div className={metadataClass} data-automationid={`${moduleName}-seat-limit`}>
          {getSessionMetaDataIcon(SEATS_SVG(), `${moduleName}-seatLimit-icon`)}
          <div className={styles.details}>
            <span
              className={styles.detailsHeader}
              data-automationid={`${moduleName}-seatLimit-header`}
            >
              {GetTranslation("alm.overview.session.seat.limit.header")}
            </span>
            <span data-automationid={`${moduleName}-seatLimit`}>
              {GetTranslation("alm.overview.no.seat.limit", true)}
            </span>
          </div>
        </div>
      )}
      <div className={metadataClass} data-automationid={`${moduleName}-instructor`}>
        {getSessionMetaDataIcon(INSTRUCTOR_SVG(), `${moduleName}-instructor-icon`)}
        <div className={styles.details}>
          <span
            className={styles.detailsHeader}
            data-automationid={`${moduleName}-instructor-header`}
          >
            {GetTranslation("alm.overview.session.instructor.header")}
          </span>
          <span data-automationid={`${moduleName}-instructor`}>{instructorNames}</span>
        </div>
      </div>
      {isVC && (isEnrolled || isParentFlexLP) && (
        <>
          {loResource.sessionRecordingInfo?.length > 0 && (
            <>
              <div className={metadataClass} data-automationid={`${moduleName}-recordings`}>
                {getSessionMetaDataIcon(MOVIE_CAMERA_SVG(), `${moduleName}-recordings-icon`)}
                <div className={styles.details}>
                  <span
                    className={styles.detailsHeader}
                    data-automationid={`${moduleName}-recordings-header`}
                  >
                    {GetTranslation("alm.overview.vc.sessionRecordingInfo")}
                  </span>
                  {loResource.sessionRecordingInfo.map(sessionRecordingInfo => {
                    return (
                      <React.Fragment key={sessionRecordingInfo.name}>
                        <span>
                          <a
                            className={styles.link}
                            href={sessionRecordingInfo.url}
                            target="_blank"
                            rel="noreferrer"
                            data-automationid={`${moduleName}-recording-link`}
                          >
                            {sessionRecordingInfo.name}
                          </a>
                        </span>

                        <span
                          className={styles.sessionPasscode}
                          data-automationid={`${moduleName}-recording-passcode`}
                        >
                          {formatMessage({
                            id: "alm.overview.vc.sessionRecordingPasscode",
                            defaultMessage: "Passcode",
                          })}
                          : {sessionRecordingInfo.passcode}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              {showSessionTranscript() && (
                <div className={metadataClass} data-automationid={`${moduleName}-transcript`}>
                  {getSessionMetaDataIcon(TRANSCRIPT_SVG(), `${moduleName}-transcript-icon`)}
                  <div className={styles.details}>
                    <span
                      className={styles.detailsHeader}
                      data-automationid={`${moduleName}-transcript-header`}
                    >
                      {GetTranslation("alm.overview.session.transcript.header")}
                    </span>
                    {loResource.sessionRecordingInfo.map(
                      sessionRecordingInfo =>
                        sessionRecordingInfo.transcriptUrl && (
                          <span key={sessionRecordingInfo.name}>
                            <a
                              className={styles.link}
                              href={sessionRecordingInfo.transcriptUrl}
                              download
                              target={
                                getALMConfig().handleLinkedInContentExternally ? "" : "_blank"
                              }
                              rel="noreferrer"
                              data-automationid={`${moduleName}-transcript-link`}
                            >
                              {GetTranslationReplaced(
                                `alm.overview.vc.sessionRecordingInfoTranscriptsName`,
                                `${sessionRecordingInfo.name}`
                              )}
                              {/* {sessionRecordingInfo.name}_transcript */}
                            </a>
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {showVcLink(resource) && (
            <div className={styles.metadata} data-automationid={`${moduleName}-vc-link-container`}>
              {getSessionMetaDataIcon(LINK_SVG(), `${moduleName}-url-icon`)}
              <div className={styles.details}>
                <span
                  className={styles.detailsHeader}
                  data-automationid={`${moduleName}-url-header`}
                >
                  {GetTranslation("alm.overview.session.vc.link.header", true)}
                </span>
                {isEnforcedPrerequisiteIncomplete ? (
                  GetTranslation("alm.overview.vc.prereq.url.disabled", true)
                ) : (
                  <button
                    className={`${styles.vcUrlButton} ${linkDisabled ? styles.linkDisabled : styles.link}`}
                    onClick={handleVcUrlClick}
                    data-automationid={`${moduleName}-url`}
                  >
                    {linkDisabled
                      ? GetTranslation("alm.adobeConnect.url.disabled", true)
                      : GetTranslation("alm.overview.vc.url", true)}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {resource.room && (
        <div className={styles.metadata} data-automationid={`${moduleName}-room-details`}>
          {getSessionMetaDataIcon(VENUE_SVG(), `${moduleName}-location-icon`)}
          <div className={styles.details}>
            <span
              className={styles.detailsHeader}
              data-automationid={`${moduleName}-location-header`}
            >
              {GetTranslation("alm.overview.session.location.header")}
            </span>
            <span className={styles.roomName} data-automationid={`${moduleName}-roomName`}>
              {resource.room.roomName}
            </span>
            <span
              className={styles.roomInfo}
              title={resource.room.roomInfo}
              data-automationid={`${moduleName}-roomInfo`}
            >
              {resource.room.roomInfo}
            </span>
            <span className={styles.city} data-automationid={`${moduleName}-city`}>
              {resource.room.city}
            </span>
            {resource.room.url && (
              <span className={styles.roomUrl}>
                <a
                  className={styles.link}
                  href={resource.room.url}
                  target="_blank"
                  data-automationid={`${moduleName}-roomUrl`}
                >
                  {formatMessage({
                    id: "alm.overview.locationDetails",
                    defaultMessage: "Location Details",
                  })}
                </a>
              </span>
            )}
          </div>
        </div>
      )}
      {!resource.room && (
        <div className={styles.metadata} data-automationid={`${moduleName}-room-details`}>
          {getSessionMetaDataIcon(VENUE_SVG(), `${moduleName}-location-icon`)}
          <div className={styles.details}>
            <span
              className={styles.detailsHeader}
              data-automationid={`${moduleName}-location-header`}
            >
              {GetTranslation("alm.overview.session.location.header")}
            </span>
            {isVC &&
              (resource.roomLocation
                ? resource.roomLocation
                : formatMessage({ id: "alm.notAvailable" }, { defaultMessage: "Not Available" }))}
            {!isVC &&
              (resource.location
                ? resource.location
                : formatMessage({ id: "alm.notAvailable" }, { defaultMessage: "Not Available" }))}
          </div>
        </div>
      )}
    </div>
  );
};

const getTimeInfo = (
  resource: PrimeResource,
  formatMessage: Function,
  locale: string
): { dateText: string; timeText: string } => {
  const { dateStart, completionDeadline } = resource;
  let startDateObj = new Date(dateStart);
  let completionDateObj = new Date(completionDeadline);
  let dateText = "",
    timeText = "";
  if (startDateObj.toLocaleDateString() === completionDateObj.toLocaleDateString()) {
    dateText = GetFormattedDate(dateStart, locale);
  } else {
    let startDate = GetFormattedDate(dateStart, locale);
    let endDate = GetFormattedDate(completionDeadline, locale);
    dateText = formatMessage({ id: "alm.overview.vc.date" }, { 0: startDate, 1: endDate });
  }
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  timeText = `(${startDateObj.toLocaleTimeString(
    locale,
    options
  )} - ${completionDateObj.toLocaleTimeString(locale, options)})`;
  return { dateText, timeText };
};

export default PrimeModuleItem;
