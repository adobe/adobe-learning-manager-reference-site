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
import Calendar from "@spectrum-icons/workflow/Calendar";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import Clock from "@spectrum-icons/workflow/Clock";
import Link from "@spectrum-icons/workflow/Link";
import Location from "@spectrum-icons/workflow/Location";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import Seat from "@spectrum-icons/workflow/Seat";
import User from "@spectrum-icons/workflow/User";
import Visibility from "@spectrum-icons/workflow/Visibility";
import MovieCamera from "@spectrum-icons/workflow/MovieCamera";
import RailBottom from "@spectrum-icons/workflow/RailBottom";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeResource,
} from "../../../models/PrimeModels";
import {
  APPROVED,
  CHANGE,
  CLASSROOM,
  ELEARNING,
  PENDING_APPROVAL,
  PENDING_SUBMISSION,
  PREVIEW,
  PREWORK,
  REJECTED,
  VIRTUAL_CLASSROOM,
} from "../../../utils/constants";
import {
  convertSecondsToTimeText,
  GetFormattedDate,
} from "../../../utils/dateTime";
import { getALMObject } from "../../../utils/global";
import {
  getEnrolledInstancesCount,
  getEnrollment,
  useResource,
} from "../../../utils/hooks";
import { checkIfLinkedInLearningCourse, getALMConfig, launchContentUrlInNewWindow } from "../../../utils/global";
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
  SOCIAL_CANCEL_SVG,
  VIDEO_SVG,
  VIRTUAL_CLASSROOM_SVG,
  XLS_SVG,
} from "../../../utils/inline_svg";
import {
  arePrerequisiteEnforcedAndCompleted,
  checkIsEnrolled,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  formatMap,
  GetTranslationReplaced,
} from "../../../utils/translationService";
import {
  cancelUploadFile,
  getUploadInfo,
  uploadFile,
} from "../../../utils/uploadUtils";
import styles from "./PrimeModuleItem.module.css";
import Refresh from "@spectrum-icons/workflow/Refresh";
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
};

const PrimeModuleItem: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResource: PrimeLearningObjectResource;
  isContent?: boolean;
  isPreviewEnabled: boolean;
  canPlay?: boolean;
  updateFileSubmissionUrl: Function;
  isPartOfLP: boolean;
  isParentLOEnrolled: boolean;
  isParentFlexLP: boolean;
  lastPlayingLoResourceId: String;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
}> = (props) => {
  const {
    training,
    trainingInstance,
    launchPlayerHandler,
    loResource,
    isPreviewEnabled,
    canPlay,
    updateFileSubmissionUrl,
    isPartOfLP = false,
    isParentLOEnrolled = false,
    isParentFlexLP = false,
    lastPlayingLoResourceId,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
  } = props;
  const { formatMessage, locale } = useIntl();

  const [almAlert] = useAlert();

  const [showCannotSkipDialog, setShowCannotSkipDialog] = useState(false);

  const showPreWorkLabel = loResource.loResourceType === PREWORK && isPartOfLP;
  const isPreworkModule = loResource.loResourceType === PREWORK;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();

  useEffect(() => {
    if (showCannotSkipDialog) {
      let messages: string = GetTranslation(
        "alm.overview.cannot.skip.ordered.module",
        true
      );
      if (!arePrerequisiteEnforcedAndCompleted(training)) {
        messages = GetTranslation(
          "alm.overview.cannot.skip.prerequisite.module",
          true
        );
      }
      almAlert(true, messages, AlertType.error);
    }
  }, [almAlert, showCannotSkipDialog]);

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    setIsMobileScreen(window.innerWidth <= 414);
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 414);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );
  const enrollment = getEnrollment(training, trainingInstance);
  const isEnrolled = checkIsEnrolled(enrollment);

  const resource = useResource(loResource, locale);

  const multipleAttempt = loResource?.multipleAttempt;
  const maxAttemptCount = multipleAttempt?.maxAttemptCount;
  const infiniteAttempts = multipleAttempt?.infiniteAttempts;
  const stopAttemptOnSuccessfulComplete =
    multipleAttempt?.stopAttemptOnSuccessfulComplete;
  const attemptDuration = multipleAttempt?.attemptDuration || 0;
  const timeBetweenAttempts = multipleAttempt?.timeBetweenAttempts || 0;
  const learnerAttemptInfo = loResource?.learnerAttemptInfo;
  const completionCriteria = multipleAttempt?.attemptEndCriteria;

  // Reattempt By default is true
  let isResetRequired = true;

  const isModulePreviewAble =
    isPreviewEnabled && !isParentLOEnrolled && loResource.previewEnabled;

  const isClassroomOrVC =
    loResource.resourceType === CLASSROOM ||
    loResource.resourceType === VIRTUAL_CLASSROOM;

  const isModuleClickable: boolean = isEnrolled || isModulePreviewAble;

  const isVC = loResource.resourceType === VIRTUAL_CLASSROOM;

  const isElearning = loResource.resourceType === ELEARNING;

  const hasSessionDetails =
    resource.dateStart && resource.completionDeadline ? true : false;

  const [attemptsDone, setAttemptsDone] = useState(
    loResource.learnerAttemptInfo?.attemptsFinishedCount as number
  );

  const filteredResourceGrades = enrollment?.loResourceGrades.filter(
    (loResourceGrade) => loResourceGrade.id.search(loResource.id) !== -1
  );

  const loResourceGrade = filteredResourceGrades?.length
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
            moduleLockedBetweenAttempt()
              ? styles.reattemptButtonDisabled
              : styles.reattemptButton
          }
          tabIndex={0}
        >
          <span className={styles.refresh}>
            <Refresh />
          </span>
          <span className={styles.reattempt}>
            {GetTranslation("alm.mqa.reattempt", true)}
          </span>
        </button>
      );
    }
  }
  function timeComparison() {
    const lastAttemptDate = new Date(
      loResource.learnerAttemptInfo?.lastAttemptEndTime
    );
    const currentDate = new Date();
    lastAttemptDate.setTime(
      lastAttemptDate.getTime() + timeBetweenAttempts * 60000
    );
    if (lastAttemptDate < currentDate) {
      setTimeBetweenAttemptEnabled(false);
      setAttemptsDone(
        loResource.learnerAttemptInfo?.attemptsFinishedCount as number
      );
    } else {
      setTimeBetweenAttemptEnabled(true);
    }
  }

  useEffect(() => {
    if (loResource.multipleAttemptEnabled) {
      if (
        loResource.learnerAttemptInfo?.attemptsFinishedCount &&
        timeBetweenAttempts
      ) {
        timeComparison();
      }
      else{
        setTimeBetweenAttemptEnabled(false);
      }
    }
  }, [loResource]);

  const durationText = convertSecondsToTimeText(
    resource.authorDesiredDuration || resource.desiredDuration || 0
  );

  const moduleIcon =
    moduleIconMap[resource.contentType as keyof ActionMap] || SCORM_SVG();

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
    durationText,
    isVC,
    isEnrolled,
    formatMessage,
    locale,
    showSessionTranscript,
    isParentFlexLP
  );

  let descriptionTextHTML = getDescriptionTemplate(
    styles,
    description,
    overview,
    isClassroomOrVC,
    isElearning,
    hasSessionDetails,
    formatMessage
  );

  const loResourceMandatory = (): boolean => {
    if (loResource && loResource.mandatory) {
      return true;
    }
    return false;
  };

  const itemClickHandler = (event: any, reattemptButtonClicked = false) => {
    if (isPartOfLP && !isParentLOEnrolled && !isModulePreviewAble) {
      return;
    }
    if (isEnrolled && !canPlay) {
      setShowCannotSkipDialog(true);
      setTimeout(() => setShowCannotSkipDialog(false), 3000);
      return;
    }

    if (isModulePreviewAble && !isPrimeUserLoggedIn) {
      storeActionInNonLoggedMode(PREVIEW);
      launchPlayerHandler();
      return;
    }

    // Case when no attempt is left
    if (multipleAttempt && attemptsLeft <= 0 && !infiniteAttempts) {
      return;
    }

    // Case when module is completed
    if (moduleStopOnSuccessfulComplete() && reattemptButtonClicked) {
      return;
    }
    if (
      (isEnrolled && !isClassroomOrVC) ||
      (isModulePreviewAble && isPrimeUserLoggedIn)
    ) {
      if (checkIfLinkedInLearningCourse(training) && getALMConfig().handleLinkedInContentExternally) {
        return launchContentUrlInNewWindow(training, loResource);
      }
      const isMultienrolled = getEnrolledInstancesCount(training) > 1;
      const isResetReattemptRequired =
      reattemptButtonClicked
        ? isResetRequired
        : !loResource.learnerAttemptInfo && !infiniteAttempts;

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

  const formatLabel =
    loResource.resourceType && formatMap[loResource.resourceType]
      ? GetTranslation(`${formatMap[loResource.resourceType]}`, true)
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
  const [submissionState, setSubmissionState] = useState(
    loResource.submissionState
  );
  const [submissionUrl, setSubmissionUrl] = useState(loResource.submissionUrl);
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );

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
    const inputElement = document.getElementById(
      inputElementId
    ) as HTMLInputElement;
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
      (await updateFileSubmissionUrl(
        fileUrl,
        training.id,
        trainingInstance.id,
        loResource.id
      )) || "";
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

  const getSubmissionFileName = (url: any) => {
    const urlWithoutParams = url?.split("?")[0];
    let urlParts = urlWithoutParams?.split("/");
    return urlParts?.length > 0 ? urlParts[urlParts?.length - 1] : "";
  };

  const showFileSubmission = () => {
    return isEnrolled && loResource.submissionEnabled;
  };

  const getFileUploadSection = (hasSession: Boolean, state: String) => {
    const allowFileUpdate = true;
    switch (state) {
      case REJECTED:
        return (
          <span className={styles.fileSubmissionContainer}>
            <span className={styles.fileRejected}>
              {formatMessage({
                id: "alm.overview.rejected.label",
                defaultMessage: "Submission Rejected",
              })}
            </span>
            : {getUploadedFileSection(hasSession, allowFileUpdate)}
          </span>
        );

      case PENDING_APPROVAL:
        return (
          <span className={styles.fileSubmissionContainer}>
            <span className={styles.fileAwaitingApproval}>
              {formatMessage({
                id: "alm.overview.submissionAwaitingApproval.label",
                defaultMessage: "Submission Awaiting Approval",
              })}
            </span>
            : {getUploadedFileSection(hasSession, allowFileUpdate)}
          </span>
        );
      case APPROVED:
        return (
          <span className={styles.fileSubmissionContainer}>
            <span className={styles.fileApproved}>
              {formatMessage({
                id: "alm.overview.approved.label",
                defaultMessage: "Submission Approved",
              })}
            </span>
            : {getUploadedFileSection(hasSession, !allowFileUpdate)}
          </span>
        );
      case PENDING_SUBMISSION:
      default:
        return (
          <span className={styles.fileSubmissionContainer}>
            {formatMessage({
              id: "alm.overview.submissionPending.label",
              defaultMessage: "Submission Pending",
            })}
            : {getUploadFileSection(hasSession)}
          </span>
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
          <button onClick={startFileUpload} className={styles.uploadButton}>
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
          />
        </span>
      )
    );
  };

  const getUploadedFileSection = (
    hasSession: Boolean,
    changeAllowed: Boolean
  ) => {
    return (
      <>
        <a
          className={styles.submissionLink}
          href={submissionUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event: any) => stopClickPropagation(event)}
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
      loResource?.id.split("_")[2] === lastPlayingLoResourceId?.split("_")[2]);

  // For attemptEndCriteria === "NONE" || attemptEndCriteria === "PLAYER_CLOSE"
  let attemptsLeft =
    (maxAttemptCount || 0) -
    (learnerAttemptInfo?.currentAttemptNumber ||
      learnerAttemptInfo?.attemptsFinishedCount ||
      0);

  if (infiniteAttempts) {
    attemptsLeft = 0;
  }

  if (
    !infiniteAttempts &&
    multipleAttempt?.attemptEndCriteria === "COMPLETION"
  ) {
    if (
      loResourceGrade?.hasPassed &&
      loResourceGrade?.progressPercent !== 100
    ) {
      if (loResourceGrade?.duration === 0) {
        attemptsLeft =
          (maxAttemptCount || 0) -
          (learnerAttemptInfo?.attemptsFinishedCount || 0);
      } else {
        attemptsLeft =
          (maxAttemptCount || 0) -
          (learnerAttemptInfo?.currentAttemptNumber || 0);
      }
    } else if (
      loResourceGrade?.hasPassed &&
      loResourceGrade?.progressPercent === 100
    ) {
      attemptsLeft =
        (maxAttemptCount || 0) -
        (learnerAttemptInfo?.currentAttemptNumber ||
          learnerAttemptInfo?.attemptsFinishedCount ||
          0);
    } else if (
      !loResourceGrade?.hasPassed &&
      loResourceGrade?.progressPercent !== 100
    ) {
      if (loResourceGrade?.duration === 0) {
        attemptsLeft =
          (maxAttemptCount || 0) -
          (learnerAttemptInfo?.attemptsFinishedCount || 0);
      } else {
        attemptsLeft =
          (maxAttemptCount || 0) -
          (learnerAttemptInfo?.currentAttemptNumber || 0);
      }
    } else if (
      !loResourceGrade?.hasPassed &&
      loResourceGrade?.progressPercent === 100
    ) {
      attemptsLeft =
        (maxAttemptCount || 0) -
        (learnerAttemptInfo?.currentAttemptNumber ||
          learnerAttemptInfo?.attemptsFinishedCount ||
          0);
    }
  }

  // Reset Modules
  if (
    attemptsLeft < 0 &&
    !learnerAttemptInfo?.currentAttemptStartTime &&
    !learnerAttemptInfo?.currentAttemptEndTime
  ) {
    attemptsLeft = 1;
    isResetRequired = false;
  }

  const moduleStopOnSuccessfulComplete = () => {
    if (stopAttemptOnSuccessfulComplete && loResourceGrade?.hasPassed) {
      return true;
    }
    return false;
  };

  const resourceClickHandler = (event: any) => {
    if (
      !(
        loResource.multipleAttemptEnabled &&
        loResource.learnerAttemptInfo &&
        moduleLockedBetweenAttempt()
      )
    ) {
      itemClickHandler(event);
    } else {
      almAlert(
        true,
        GetTranslation("alm.mqa.module.locked.message"),
        AlertType.error
      );
    }
  };

  if (loResource.learnerAttemptInfo) {
    if (
      attemptsDone < loResource.learnerAttemptInfo.attemptsFinishedCount &&
      !gradeHasPassed()
    ) {
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

    const attemptStartTime =
      lastAttemptEndTime + timeBetweenAttempts * 60 * 1000;

    const now = new Date().getTime();

    return now < attemptStartTime;
  };

  const reattemptHandler = (event: any) => {
    event.stopPropagation();
    if (moduleLockedBetweenAttempt()) {
      almAlert(
        true,
        GetTranslation("alm.mqa.module.locked.message"),
        AlertType.error
      );
    }
    else {
      itemClickHandler(event, true);
    }
  };

  const attemptDescription = () => {
    if (loResource.multipleAttemptEnabled) {
      if (gradeHasPassed() && stopAttemptOnSuccessfulComplete) {
        return (
          <span className={styles.attemptDescriptionContainer}>
            <span className={styles.completedRefresh}>
              <Refresh />
            </span>
            <span className={styles.initialAttempts}>
              {GetTranslation("alm.mqa.moduleCompletes", true)}
            </span>
            {/* {setTimeBetweenAttemptEnabled(true)} */}
            {attemptDuration !== 0 && (
              <span className={styles.attemptsDuration}>
                {isMobileScreen ? `| ` : ``}
                {GetTranslationReplaced(
                  "alm.mqa.attemptDuration",
                  attemptDuration.toString(),
                  true
                )}
              </span>
            )}
          </span>
        );
      }
      if (infiniteAttempts) {
        if (!loResource.learnerAttemptInfo) {
          return (
            <span className={styles.attemptDescriptionContainer}>
              <span className={styles.attemptsDuration}>
                {GetTranslation("alm.mqa.attempt", true)}
              </span>
              <span className={styles.initialAttempts}>No Limit</span>
              {attemptDuration !== 0 && (
                <span className={styles.attemptsDuration}>
                  {isMobileScreen ? `| ` : ``}
                  {GetTranslationReplaced(
                    "alm.mqa.attemptDuration",
                    attemptDuration.toString(),
                    true
                  )}
                </span>
              )}
            </span>
          );
        } else {
          return (
            <span className={styles.attemptDescriptionContainer}>
              {showReattemptButton()}
              {attemptDuration !== 0 && (
                <span className={styles.attemptsDuration}>
                  {isMobileScreen ? `| ` : ``}
                  {GetTranslationReplaced(
                    "alm.mqa.attemptDuration",
                    attemptDuration.toString(),
                    true
                  )}
                </span>
              )}
            </span>
          );
        }
      } else {
        if (loResource.learnerAttemptInfo) {
          return (
            <span className={styles.attemptDescriptionContainer}>
              {attemptsLeft <= 0 ? (
                <>
                  <span className={styles.completedRefresh}>
                    <Refresh />
                  </span>
                  <span className={styles.noAttemptLeft}>
                    {GetTranslation("alm.mqa.noAttemptLeft", true)}
                  </span>
                  {attemptDuration > 0 && (
                    <span className={styles.attemptsDuration}>
                      {isMobileScreen ? `| ` : ``}
                      {GetTranslationReplaced(
                        "alm.mqa.attemptDuration",
                        attemptDuration.toString(),
                        true
                      )}
                    </span>
                  )}
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
                  {attemptDuration !== 0 && (
                    <span className={styles.attemptsDuration}>
                      {isMobileScreen ? `| ` : ``}
                      {GetTranslationReplaced(
                        "alm.mqa.attemptDuration",
                        attemptDuration.toString(),
                        true
                      )}
                    </span>
                  )}
                </span>
              )}
            </span>
          );
        } else {
          return (
            <span className={styles.attemptDescriptionContainer}>
              <span className={styles.attemptsDuration}>
                {GetTranslation("alm.mqa.attempt", true)}
              </span>
              <span className={styles.initialAttempts}>{maxAttemptCount}</span>
              {attemptDuration !== 0 && (
                <span className={styles.attemptsDuration}>
                  {isMobileScreen ? `| ` : ``}
                  {GetTranslationReplaced(
                    "alm.mqa.attemptDuration",
                    attemptDuration.toString(),
                    true
                  )}
                </span>
              )}
            </span>
          );
        }
      }
    }
  };

  return (
    <>
      <li
        className={`${styles.container} ${
          loResourceMandatory() ? styles.mandatoryModuleContainer : ``
        }`}
      >
        <div
          className={`${styles.headerContainer} ${
            isModuleClickable ? styles.cursor : ""
          }`}
          tabIndex={0}
          data-test={loResource.id}
          onClick={resourceClickHandler}
          onKeyDown={keyDownHandler}
          role="button"
        >
          <div className={styles.icon} aria-hidden="true">
            {loResourceMandatory() ? (
              <span className={styles.mandatoryModule}>
                <Asterisk />
              </span>
            ) : (
              ""
            )}
            {moduleIcon}

            {gradeHasPassed() ? (
              <span className={styles.modulePassed}>
                <CheckmarkCircle aria-hidden="true" />
              </span>
            ) : !canPlay && !isPreworkModule ? (
              <span className={styles.moduleLocked}>
                <LockClosed aria-hidden="true" />
              </span>
            ) : (
              ""
            )}
          </div>
          <div className={styles.headerWrapper}>
            <div className={styles.titleContainer}>
              <span className={styles.title}>
                <span aria-label={resource.contentType}></span>
                {name}{" "}
                {showPreWorkLabel
                  ? formatMessage({
                      id: "alm.module.prework",
                    })
                  : ""}
              </span>
              {isLastPlayedModule ? (
                <span className={styles.lastVisitedMssg}>
                  {formatMessage({ id: "alm.module.lastVisited" })}
                </span>
              ) : (
                ""
              )}
              {isModulePreviewAble && (
                <span className={styles.previewable}>
                  {formatMessage({
                    id: "alm.module.session.preview",
                    defaultMessage: "Preview",
                  })}
                  <Visibility aria-hidden="true" />
                </span>
              )}
            </div>
            <div className={styles.resourceAndDuration}>
              <span className={styles.resourceType}>
                {formatLabel}
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
                {!isUploading &&
                  showFileSubmission() &&
                  getFileUploadSection(isClassroomOrVC, submissionState)}
                {((isPartOfLP && isParentLOEnrolled) || !isPartOfLP) &&
                  attemptDescription()}
              </span>
              <span>{durationText}</span>
            </div>
          </div>
        </div>
        <div className={styles.wrapperContainer}>
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
  formatMessage: Function
) => {
  if (isElearning) {
    return "";
  }
  if (isClassroomOrVC && !hasSessionDetails) {
    return (
      <div className={styles.moduleDescription}>
        {formatMessage({
          id: "alm.module.session.detail",
          defaultMessage: "No session details have been updated",
        })}
      </div>
    );
  }
  return description ? (
    <div className={styles.moduleDescription}>{description}</div>
  ) : (
    overview && (
      <div className={styles.moduleDescription}>{description || overview}</div>
    )
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
  durationText: string,
  isVC: boolean = false,
  isEnrolled: boolean,
  formatMessage: Function,
  locale: string,
  showSessionTranscript: Function,
  isParentFlexLP: boolean
) => {
  if (!isClassroomOrVC || (isClassroomOrVC && !hasSessionDetails)) {
    return "";
  }
  const instructorNames = resource.instructorNames?.length
    ? resource.instructorNames.join(", ")
    : formatMessage(
        { id: "alm.module.instructorName.NotAvailable" },
        { defaultMessage: "Not Available" }
      );

  const timeInfo = getTimeInfo(resource, formatMessage, locale);
  const showSeatLimit = Boolean(resource.seatLimit);
  return (
    <div className={styles.metaDataContainer}>
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <Calendar aria-hidden="true" />
        </div>
        <div className={styles.details}>
          <span>{timeInfo.dateText}</span>
          <span>{timeInfo.timeText}</span>
        </div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <Clock aria-hidden="true" />
        </div>
        <div className={styles.details}>
          {formatMessage({ id: "alm.overview.duration" }, { 0: durationText })}
        </div>
      </div>
      {showSeatLimit && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Seat aria-hidden="true" />
          </div>
          <div className={styles.details}>
            {formatMessage(
              { id: "alm.overview.seat.limit" },
              { 0: resource.seatLimit }
            )}
          </div>
        </div>
      )}
      {!showSeatLimit && isClassroomOrVC && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Seat aria-hidden="true" />
          </div>
          <div className={styles.details}>
            {GetTranslation("alm.overview.no.seat.limit", true)}
          </div>
        </div>
      )}
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <User aria-hidden="true" />
        </div>
        <div className={styles.details}>{instructorNames}</div>
      </div>
      {isVC && (isEnrolled || isParentFlexLP) && (
        <>
          {loResource.sessionRecordingInfo?.length > 0 && (
            <>
              <div className={styles.metadata}>
                <div className={styles.spectrumIcon}>
                  <MovieCamera aria-hidden="true" />
                </div>
                <div className={styles.sessionRecordingInfo}>
                  <span>
                    {formatMessage({
                      id: "alm.overview.vc.sessionRecordingInfo",
                      defaultMessage: "Session Recordings",
                    })}
                  </span>
                  {loResource.sessionRecordingInfo.map(
                    (sessionRecordingInfo) => {
                      return (
                        <>
                          <span>
                            <a
                              className={styles.details}
                              href={sessionRecordingInfo.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {sessionRecordingInfo.name}
                            </a>
                          </span>

                          <span>
                            {formatMessage({
                              id: "alm.overview.vc.sessionRecordingPasscode",
                              defaultMessage: "Passcode",
                            })}
                            : {sessionRecordingInfo.passcode}
                          </span>
                        </>
                      );
                    }
                  )}
                </div>
              </div>
              {showSessionTranscript() && (
                <div className={styles.metadata}>
                  <div className={styles.spectrumIcon}>
                    <RailBottom aria-hidden="true" />
                  </div>
                  <div className={styles.sessionRecordingInfo}>
                    <span>
                      {formatMessage({
                        id: "alm.overview.vc.sessionRecordingInfoTranscripts",
                        defaultMessage: "Session Recordings Transcripts",
                      })}
                    </span>
                    {loResource.sessionRecordingInfo.map(
                      (sessionRecordingInfo) =>
                        sessionRecordingInfo.transcriptUrl && (
                          <span>
                            <a
                              href={sessionRecordingInfo.transcriptUrl}
                              download
                              target={
                                getALMConfig().handleLinkedInContentExternally
                                  ? ""
                                  : "_blank"
                              }
                              className={styles.details}
                              rel="noreferrer"
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
          <div className={styles.metadata}>
            <div className={styles.spectrumIcon}>
              <Link aria-hidden="true" />
            </div>
            <a
              className={styles.details}
              href={resource.location}
              target="_blank"
              rel="noreferrer"
            >
              {GetTranslation("alm.overview.vc.url", true)}
            </a>
          </div>
        </>
      )}
      {resource.room && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Location aria-hidden="true" />
          </div>
          <div className={styles.roomDetails}>
            <div className={styles.details}>{resource.room.roomName}</div>
            <div title={resource.room.roomInfo} className={styles.details}>
              {resource.room.roomInfo}
            </div>
            <div className={styles.details}>{resource.room.city}</div>
            {resource.room.url && (
              <div className={styles.details}>
                <a
                  className={styles.roomUrl}
                  href={resource.room.url}
                  target="_blank"
                >
                  {formatMessage({
                    id: "alm.overview.locationDetails",
                    defaultMessage: "Location Details",
                  })}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      {!resource.room && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Location aria-hidden="true" />
          </div>
          <div className={styles.details}>
            {" "}
            {isVC &&
              (resource.roomLocation
                ? resource.roomLocation
                : formatMessage(
                    { id: "alm.module.instructorName.NotAvailable" },
                    { defaultMessage: "Not Available" }
                  ))}
            {!isVC &&
              (resource.location
                ? resource.location
                : formatMessage(
                    { id: "alm.module.instructorName.NotAvailable" },
                    { defaultMessage: "Not Available" }
                  ))}
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
  if (
    startDateObj.toLocaleDateString() === completionDateObj.toLocaleDateString()
  ) {
    dateText = GetFormattedDate(dateStart, locale);
  } else {
    let startDate = GetFormattedDate(dateStart, locale);
    let endDate = GetFormattedDate(completionDeadline, locale);
    dateText = formatMessage(
      { id: "alm.overview.vc.date" },
      { 0: startDate, 1: endDate }
    );
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
