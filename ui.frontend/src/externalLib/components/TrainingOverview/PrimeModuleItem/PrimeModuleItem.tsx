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
import Calendar from "@spectrum-icons/workflow/Calendar";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import Clock from "@spectrum-icons/workflow/Clock";
import Link from "@spectrum-icons/workflow/Link";
import Location from "@spectrum-icons/workflow/Location";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import Seat from "@spectrum-icons/workflow/Seat";
import User from "@spectrum-icons/workflow/User";
import Visibility from "@spectrum-icons/workflow/Visibility";
import React, {useState, useRef, useEffect} from "react";
import store from "../../../../store/APIStore";
import { useIntl } from "react-intl";
import { AlertDialog, AlertType } from "../../../common/Alert/AlertDialog";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeResource,
} from "../../../models/PrimeModels";
import {
  convertSecondsToTimeText,
  GetFormattedDate,
} from "../../../utils/dateTime";
import { getALMConfig, getALMObject } from "../../../utils/global";
import { useResource } from "../../../utils/hooks";
import {
  ACTIVITY_SVG,
  AUDIO_SVG,
  CAPTIVATE_SVG,
  CLASSROOM_SVG,
  DOC_SVG,
  PDF_SVG,
  PPT_SVG,
  PRESENTER_SVG,
  SCORM_SVG,
  VIDEO_SVG,
  VIRTUAL_CLASSROOM_SVG,
  XLS_SVG,
} from "../../../utils/inline_svg";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
} from "../../../utils/translationService";
import { formatMap } from "../../Catalog/PrimeTrainingCard/PrimeTrainingCard";
import { PrimeAlertDialog } from "../../Community/PrimeAlertDialog";
import { ProgressBar } from "@adobe/react-spectrum";
import { getUploadInfo, uploadFile, cancelUploadFile } from "../../../utils/uploadUtils";
import { useTrainingPage } from "../../../hooks";
import {
  SOCIAL_CANCEL_SVG,
} from "../../../utils/inline_svg";
import styles from "./PrimeModuleItem.module.css";

const CLASSROOM = "Classroom";
const VIRTUAL_CLASSROOM = "Virtual Classroom";
const ELEARNING = "Elearning";
const PENDING_APPROVAL = "PENDING_APPROVAL";

interface ActionMap {
  Classroom: string;
}
const moduleIconMap = {
  Classroom: CLASSROOM_SVG(),
  "Virtual Classroom": VIRTUAL_CLASSROOM_SVG(),
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
};

const PrimeModuleItem: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResource: PrimeLearningObjectResource;
  isContent?: boolean;
  isPreviewEnabled: boolean;
  canPlay?: boolean;
}> = (props) => {
  const {
    training,
    trainingInstance,
    launchPlayerHandler,
    loResource,
    isContent,
    isPreviewEnabled,
    canPlay,
  } = props;
  const { formatMessage } = useIntl();

  const [showCannotSkipDialog, setShowCannotSkipDialog] = useState(false);

  const config = getALMConfig();
  const locale = config.locale;

  let localizedMetadata = loResource.localizedMetadata;
  const { name, description, overview } = getPreferredLocalizedMetadata(
    localizedMetadata,
    locale
  );

  const resource = useResource(loResource, locale);
  const enrollment = training.enrollment;
  const isModulePreviewAble =
    isPreviewEnabled &&
    (!enrollment || enrollment?.state === "PENDING_APPROVAL") &&
    loResource.previewEnabled;

  const isClassroomOrVC =
    loResource.resourceType === CLASSROOM ||
    loResource.resourceType === VIRTUAL_CLASSROOM;

  const isModuleClicable: boolean = enrollment
    ? enrollment.state !== "PENDING_APPROVAL"
    : isModulePreviewAble;

  const isVC = loResource.resourceType === VIRTUAL_CLASSROOM;

  const isElearning = loResource.resourceType === ELEARNING;

  const hasSessionDetails =
    resource.dateStart && resource.completionDeadline ? true : false;

  const durationText = convertSecondsToTimeText(
    resource.authorDesiredDuration || resource.desiredDuration
  );

  const moduleIcon =
    moduleIconMap[resource.contentType as keyof ActionMap] || SCORM_SVG();

  const sessionsTemplate = getSessionsTemplate(
    styles,
    resource,
    isClassroomOrVC,
    hasSessionDetails,
    durationText,
    isVC,
    formatMessage
  );

  let descriptionTextHTML = getDescriptionTemplate(
    styles,
    description,
    overview,
    isClassroomOrVC,
    isElearning,
    hasSessionDetails
  );

  const itemClickHandler = (event: any) => {
    if (!canPlay) {
      //show popup
      // alert("Module ios locked");
      setShowCannotSkipDialog(true);
      setTimeout(() => setShowCannotSkipDialog(false), 3000);

      return;
    }
    const enrollment = loResource?.learningObject?.enrollment;
    if (
      (enrollment && !isClassroomOrVC && enrollment.state != PENDING_APPROVAL) ||
      (!enrollment &&
        loResource.previewEnabled &&
        getALMObject().isPrimeUserLoggedIn())
    ) {
      let fileSubmissionComponents = ["uploadButton", "submissionLink", "fileSubmissionContainer", "fileApproved"];
      const matchArray = fileSubmissionComponents.filter((element) => {return event.target.className.includes(element)});
      if ((inputRef.current && inputRef.current.contains(event.target)) || matchArray.length > 0) {
        return;
      } else {
        launchPlayerHandler({ id: training.id, moduleId: loResource.id });
      }
    }
  };
  const keyDownHandler = (event: any) => {
    if (event.key === "Enter") {
      itemClickHandler(event);
    }
  };
  // const formatLabel = useMemo(() => {
  //   return loResource.resourceType && formatMap[loResource.resourceType]
  //     ? GetTranslation(`${formatMap[loResource.resourceType]}`, true)
  //     : "";
  // }, [loResource.resourceType]);
  const formatLabel =
    loResource.resourceType && formatMap[loResource.resourceType]
      ? GetTranslation(`${formatMap[loResource.resourceType]}`, true)
      : "";

  const gradeHasPassed = (): boolean => {
    if (!enrollment || !training.isSubLoOrderEnforced) {
      return false;
    }

    const loResourceGrades = enrollment.loResourceGrades;

    const filteredResourceGrades = loResourceGrades.filter(
      (loResourceGrade) => loResourceGrade.id.search(loResource.id) > -1
    );

    const loResourceGrade = filteredResourceGrades.length
      ? filteredResourceGrades[0]
      : ({} as PrimeLearningObjectResourceGrade);

    var hasPassed = false;

    if (loResourceGrade) {
      if (loResourceGrade && loResourceGrade.hasPassed) {
        hasPassed = true;
      }
    }
    // else {
    //   hasPassed = true;
    // }
    return hasPassed;
  };

  const state = store.getState();
  const [ isUploading, setIsUploading] = useState(false);
  const [ submissionState, setSubmissionState ] = useState(loResource.submissionState);
  const [ submissionUrl, setSubmissionUrl ] = useState(loResource.submissionUrl);
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );
  
  const inputRef = useRef<null | HTMLInputElement>(null);
  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  const updateFileUpdateProgress = () => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  const inputElementId = loResource.id + "-uploadFileSubmission";
  const {updateFileSubmissionUrl} = useTrainingPage(training.id, trainingInstance.id);
  
  const fileSelected = async (event: any) => {
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
    let blFileUrl = await updateFileSubmissionUrl(fileUrl, training.id, trainingInstance.id, loResource.id) || "";
    if(blFileUrl.length > 0) {
      setSubmissionState("PENDING_APPROVAL");
      setSubmissionUrl(blFileUrl);
    }
    clearInterval(progressCheck);
    setIsUploading(false);
  };

  const cancelClickHandler = () => {
    cancelUploadFile(store.getState().fileUpload.fileName);
    setIsUploading(false);
  };

  const getSubmissionFileName = (url: any) => {
    const urlWithoutParams = url?.split("?")[0];
    let urlParts = urlWithoutParams?.split("/");
    return urlParts?.length > 0 ? urlParts[urlParts?.length - 1] : "";
  }

  return (
    <>
      <AlertDialog
        type={AlertType.error}
        message={GetTranslation(
          "alm.overview.cannot.skip.ordered.module",
          true
        )}
        show={showCannotSkipDialog}
        // classes={styles.warningDialog}
      ></AlertDialog>
      <li className={styles.container}>
        <div
          className={`${styles.headerContainer} ${
            isModuleClicable ? styles.cursor : ""
          }`}
          tabIndex={0}
          data-test={loResource.id}
          onClick={itemClickHandler}
          onKeyDown={keyDownHandler}
          role="button"
        >
          <div className={styles.icon} aria-hidden="true">
            {moduleIcon}
            {gradeHasPassed() ? (
              <span className={styles.modulePassed}>
                <CheckmarkCircle aria-hidden="true" />
              </span>
            ) : !canPlay ? (
              <span className={styles.moduleLocked}>
                <LockClosed aria-hidden="true" />
              </span>
            ) : (
              ""
            )}
          </div>
          <div className={styles.headerWrapper}>
            <div className={styles.titleContainer}>
              <span className={styles.title}>{name}</span>
              {isModulePreviewAble && (
                <span className={styles.previewable}>
                  Preview <Visibility aria-hidden="true" />
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
                {!isUploading && loResource?.learningObject?.enrollment && loResource.submissionEnabled && (submissionState === "PENDING_SUBMISSION" || !submissionState) &&
                  <span className={styles.fileSubmissionContainer}>
                    {formatMessage({
                      id: "alm.overview.submissionPending.label",
                      defaultMessage: "Submission Pending",
                    })}:
                    <button
                      onClick={startFileUpload}
                      className={styles.uploadButton}
                    >
                      ({formatMessage({
                        id: "alm.overview.module.uploadFile",
                        defaultMessage: "Upload File",
                      })})
                    </button>
                    <input
                      type="file"
                      id={inputElementId}
                      className={styles.uploadFileSubmission}
                      onChange={(event: any) => fileSelected(event)}
                      ref={inputRef}
                    />
                  </span>
                }
                {!isUploading && loResource?.learningObject?.enrollment && loResource.submissionEnabled && submissionState === "PENDING_APPROVAL" &&
                  <span className={styles.fileSubmissionContainer}>
                    {formatMessage({
                      id: "alm.overview.submissionAwaitingApproval.label",
                      defaultMessage: "Submission Awaiting Approval",
                    })}: <a className={styles.submissionLink} href={submissionUrl} target="_blank" rel="noreferrer">{getSubmissionFileName(submissionUrl)}</a>
                    <button
                      onClick={startFileUpload}
                      className={styles.uploadButton}
                    >
                      ({formatMessage({
                        id: "alm.module.change",
                        defaultMessage: "Change",
                      })})
                    </button>
                    <input
                      type="file"
                      id={inputElementId}
                      className={styles.uploadFileSubmission}
                      onChange={(event: any) => fileSelected(event)}
                      ref={inputRef}
                    />
                  </span>
                }
                {!isUploading && loResource?.learningObject?.enrollment && loResource.submissionEnabled && submissionState === "APPROVED" &&
                  <span className={styles.fileSubmissionContainer}>
                    <span className={styles.fileApproved}>
                      {formatMessage({
                      id: "alm.overview.submissionApproved.label",
                      defaultMessage: "Submission Approved",
                    })}: </span>
                    <a className={styles.submissionLink} href={submissionUrl} target="_blank" rel="noreferrer">{getSubmissionFileName(submissionUrl)}</a>
                  </span>
                }
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
  hasSessionDetails: boolean
) => {
  if (isElearning) {
    return "";
  }
  if (isClassroomOrVC && !hasSessionDetails) {
    return (
      <div className={styles.moduleDescription}>
        No session details have been updated.
      </div>
    );
  }
  return description ? (
    <div className={styles.moduleDescription}>{description}</div>
  ) : (
    overview && (
      <div className={styles.moduleDescription}>
        hi {description || overview}
      </div>
    )
  );
};

const getSessionsTemplate = (
  styles: {
    readonly [key: string]: string;
  },
  resource: PrimeResource,
  isClassroomOrVC: boolean,
  hasSessionDetails: boolean,
  durationText: string,
  isVC: boolean = false,
  formatMessage: Function
) => {
  if (!isClassroomOrVC || (isClassroomOrVC && !hasSessionDetails)) {
    return "";
  }
  const instructorNames = resource.instructorNames?.length
    ? resource.instructorNames.join(", ")
    : "Not Available";

  const timeInfo = getTimeInfo(resource, formatMessage);
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

      {resource.seatLimit && (
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

      {resource.location && !isVC && (
        <div className={styles.metadata}>
          <div className={styles.spectrumIcon}>
            <Location aria-hidden="true" />
          </div>
          <div className={styles.details}>{resource.location}</div>
        </div>
      )}

      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <User aria-hidden="true" />
        </div>
        <div className={styles.details}>{instructorNames}</div>
      </div>
      <div className={styles.metadata}>
        <div className={styles.spectrumIcon}>
          <Clock aria-hidden="true" />
        </div>
        <div className={styles.details}>
          {formatMessage({ id: "alm.overview.duration" }, { 0: durationText })}
        </div>
      </div>

      {isVC && (
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
      )}
    </div>
  );
};

const getTimeInfo = (
  resource: PrimeResource,
  formatMessage: Function
): { dateText: string; timeText: string } => {
  const { dateStart, completionDeadline } = resource;
  const { locale } = getALMConfig();
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
