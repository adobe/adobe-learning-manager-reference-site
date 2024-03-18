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
import { lightTheme, ProgressBar, Provider } from "@adobe/react-spectrum";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { useTrainingPage } from "../../../hooks/catalog/useTrainingPage";
import {
  CERTIFICATION,
  COMPLETED,
  CONTENT,
  COURSE,
  ENROLLED,
  FLEX_LP_COURSE_INFO,
  LEARNING_PROGRAM,
  PENDING_APPROVAL,
  REJECTED,
  TRAINING_ID_STR,
  TRAINING_INSTANCE_ID_STR,
} from "../../../utils/constants";
import {
  getALMConfig,
  getALMObject,
  getALMUser,
  getPathParams,
  getQueryParamsFromUrl,
} from "../../../utils/global";
import {
  filterLoReourcesBasedOnResourceType,
  findCoursesInsideFlexLP,
  findRetiredCoursesInsideFlexLP,
  getDuration,
  getEnrolledInstancesCount,
  getEnrollment,
  hasSingleActiveInstance,
  isEnrolledInAutoInstance,
} from "../../../utils/hooks";
import { SOCIAL_CANCEL_SVG } from "../../../utils/inline_svg";
import { checkIsEnrolled } from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
import {
  cancelUploadFile,
  getUploadInfo,
  uploadFile,
} from "../../../utils/uploadUtils";
import { ALMBackButton } from "../../Common/ALMBackButton";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import { PrimeTrainingOverview } from "../PrimeTrainingOverview";
import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { PrimeTrainingPageMetadata } from "../PrimeTrainingPageMetadata";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
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
import { useAccount } from "../../../hooks";
import { PrimeExtension, PrimeSections } from "../../../models";
import Info from "@spectrum-icons/workflow/Info";
import Refresh from "@spectrum-icons/workflow/Refresh";
import { RadioGroup, Radio } from "@adobe/react-spectrum";

const PrimeTrainingPage = (props: any) => {
  const config = getALMConfig();
  let trainingOverviewPath = config.trainingOverviewPath;

  let pathParams = getPathParams(trainingOverviewPath, [
    TRAINING_ID_STR,
    TRAINING_INSTANCE_ID_STR,
  ]);
  let trainingId = pathParams[TRAINING_ID_STR];
  let trainingInstanceId = pathParams[TRAINING_INSTANCE_ID_STR]?.split("?")[0];
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
    isPreviewEnabled,
    alternateLanguages,
    updateFileSubmissionUrl,
    updateRating,
    updateBookMark,
    notes,
    updateNote,
    deleteNote,
    trainingOverviewAttributes,
    updateCertificationProofUrl,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    waitlistPosition,
    sendInstanceId,
    selectedInstanceInfo,
    flexLpEnrollHandler,
    setInstancesForFlexLPOnLoad,
    setSelectedLoList,
    selectedLoList
  } = useTrainingPage(trainingId, trainingInstanceId);

  const [isInstancePageLoading, setIsInstancePageLoading] = useState(true);
  const [almAlert] = useAlert();
  //extesnion APP
  const [activeExtension, setActiveExtension] = useState<PrimeExtension>();
  const [extensionAppIframeUrl, setExtensionAppIframeUrl] = useState("");

  useEffect(() => {
    async function handleExtensionApp() {
      if (activeExtension) {
        const userResponse = await getALMUser();
        const userId = userResponse?.user?.id;
        let requestObj: any = {
          userId,
          loId: training?.id,
          loInstanceId: trainingInstance?.id,
          authToken: getALMObject().getAccessToken(),
          locale,
          invokePoint: activeExtension.invocationType,
        };
        const { launchType, invocationType } = activeExtension;
        if (invocationType === InvocationType.LEARNER_ENROLL) {
          requestObj.callbackUrl = encodeURIComponent(window.location.href);
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

  useEffect(() => {
    if (training?.id) {
      //Note This settimeout is added to handle the extension app scenario
      setTimeout(() => {
        const queryParams = getQueryParamsFromUrl();
        if (queryParams?.extToken) {
          removeExtraQPFromExtension();
          const token = getParsedJwt(queryParams.extToken);
          if (token?.invokePoint === InvocationType.LEARNER_ENROLL) {
            const lpCourseInstancesinfo =
              getALMObject().storage.getItem(FLEX_LP_COURSE_INFO) || {};
            setInstancesForFlexLPOnLoad(lpCourseInstancesinfo);
            if (token.extResult == 1) {
              const headers = {
                "X-acap-extension-token": queryParams.extToken,
              };
              if (trainingInstance && trainingInstance.isFlexible) {
                const enroll: any = {};
                Object.keys(lpCourseInstancesinfo)?.forEach((key) => {
                  enroll[key] = lpCourseInstancesinfo[key].instanceId;
                });
                flexLpEnrollHandler({ headers, body: { enroll } });
              } else {
                enrollmentHandler({ headers, allowMultiEnrollment: training.multienrollmentEnabled });
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
        enrollmentCount === 1 ||
        !hasMultipleInstances ||
        isAutoInstanceEnrolled;
      const urlContainsInstanceId = window.location.href.includes(
        `/${TRAINING_INSTANCE_ID_STR}`
      );

      //Enrollments not coming under LP's instances, fix later
      if (
        !urlContainsInstanceId &&
        ((training.loType === COURSE && !redirectToTrainingPage) ||
          (training.loType === LEARNING_PROGRAM &&
            hasMultipleInstances &&
            !training.enrollment))
      ) {
        getALMObject().navigateToInstancePage(training.id);
        return;
      }
      setIsInstancePageLoading(false);
    }
  }, [training?.id]);

  const loName = name;
  const inputRef = useRef<null | HTMLInputElement>(null);
  const state = store.getState();
  const [isUploading, setIsUploading] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );

  const [timeBetweenAttemptEnabled, setTimeBetweenAttemptEnabled] =
    useState(false);

  const [showAll, setShowAll] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState({} as any);
  const [showUnselectedLOs, setShowUnselectedLOs] = useState(false);

  function coursesViewHandler(value: string) {
    if (value === "yes") {
      setSelectedCourses({});
      setShowUnselectedLOs(false);
    } else {
      setSelectedCourses(selectedInstanceInfo);
      setShowUnselectedLOs(true);
    }
    setSelectedLoList(selectedInstanceInfo);
  }

  const areAllInstancesSelectedHandler = () => {
    if (training?.id) {
      const areAllCoursesSelected =
        Object.keys(selectedInstanceInfo)?.length === coursesInsideFlexLPCount;
      if (areAllCoursesSelected && showAll) {
        clearInstanceSelected();
        setShowAll(false);
      }
      return areAllCoursesSelected;
    }
  };

  function setInstanceSelected() {
    let radioButton2 = document.getElementById(
      "RadioButton2"
    ) as HTMLInputElement;
    if (radioButton2?.checked) {
      setSelectedCourses(selectedInstanceInfo);
      setSelectedLoList(selectedInstanceInfo);
    }
  }

  function clearInstanceSelected() {
    setSelectedCourses({});
    setShowUnselectedLOs(false);
  }

  const timeDuration = () => {
    if (training?.id) {
      if (areAllInstancesSelectedHandler()) {
        return training.duration;
      }
      let sum = 0;
      Object.values(selectedInstanceInfo)?.forEach((items: any) => {
        sum += items.courseDuration;
      });
      return sum;
    }
    return 0;
  };

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

  //FLEX LP list initialisation
  const allCoursesInsideFlexLP = findCoursesInsideFlexLP(training, isFlexible);
  const coursesInsideFlexLPCount=allCoursesInsideFlexLP.length;
  const retiredCoursesInsideFlexLP = findRetiredCoursesInsideFlexLP(training, isFlexible);

  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  const updateFileUpdateProgress = () => {
    setFileUploadProgress(store.getState().fileUpload.uploadProgress);
  };

  const inputElementId = training.id + "-uploadFileSubmission";

  const fileSelected = async (event: any) => {
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
      (await updateCertificationProofUrl(
        fileUrl,
        training.id,
        trainingInstance.id
      )) || "";
    if (blFileUrl.length > 0) {
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
  };

  const getCertUploadSection = (state: any) => {
    switch (state) {
      case ENROLLED:
      case REJECTED:
        return (
          <span>
            {formatMessage({
              id: "alm.overview.uploadProof.label",
              defaultMessage: "Upload Proof of Completion",
            })}
            : {getUploadFileSection()}
          </span>
        );
      case PENDING_APPROVAL:
        return (
          <span className={styles.awaitingApproval}>
            {formatMessage({
              id: "alm.overview.uploadedProof.label",
              defaultMessage: "Uploaded Proof of Completion",
            })}
            : {getUploadedFileSection()}
          </span>
        );
      case COMPLETED:
        return (
          <span className={styles.fileApproved}>
            {formatMessage({
              id: "alm.overview.approved.label",
              defaultMessage: "Submission Approved",
            })}
            : {getUploadedFileSection()}
          </span>
        );
      default:
        return "";
    }
  };
  const getUploadFileSection = () => {
    return (
      <span>
        <button onClick={startFileUpload} className={styles.uploadButton}>
          (
          {formatMessage({
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
          ref={inputRef}
        />
      </span>
    );
  };

  const getUploadedFileSection = () => {
    const url = submissionUrl || enrollment.url;
    return (
      <a
        className={styles.submissionLink}
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        {getSubmissionFileName(url)}
      </a>
    );
  };
  const showExtensionErrorPopup = (message: string) => {
    let messageToDisplay = GetTranslation(
      "native.extension.enrollment.failed.header"
    );
    if (message) {
      messageToDisplay += GetTranslationsReplaced(
        "native.extension.enrollment.failed.custom.message",
        {
          x: message,
        },
        true
      );
    }
    messageToDisplay += GetTranslation(
      "native.extension.enrollment.failed.message"
    );
    messageToDisplay = `<div>${messageToDisplay}</div>`;
    almAlert(true, messageToDisplay, AlertType.error);
  };
  const iframeCloseHandler = (event: any) => {
    setExtensionAppIframeUrl("");
    setActiveExtension(undefined);
    if (typeof event === "string" && event.length) {
      showExtensionErrorPopup(event);
    }
  };

  const iframeProceedHandler = (token: string) => {
    const headers = {
      "X-acap-extension-token": token,
    };
    enrollmentHandler({ headers , allowMultiEnrollment: training.multienrollmentEnabled});
    if (trainingInstance && trainingInstance.isFlexible) {
      const lpCourseInstancesinfo =
        getALMObject().storage.getItem(FLEX_LP_COURSE_INFO) || {};
      setInstancesForFlexLPOnLoad(lpCourseInstancesinfo);
      const enroll: any = {};
      Object.keys(lpCourseInstancesinfo)?.forEach((key) => {
        enroll[key] = lpCourseInstancesinfo[key].instanceId;
      });
      flexLpEnrollHandler({ headers, body: { enroll } });
    } else {
      enrollmentHandler({ headers, allowMultiEnrollment: training.multienrollmentEnabled });
    }
    setExtensionAppIframeUrl("");
    setActiveExtension(undefined);
    getALMObject().storage.removeItem(FLEX_LP_COURSE_INFO);
  };

  const showCertProof = () => {
    return training.loType && training.isExternal && enrollment;
  };
  

  const isFullSectionSelected = (section: PrimeSections, index: number)=>{

    if(!showUnselectedLOs){
      return false;
    }

    const courseIdList = Object.keys(selectedLoList);
    let allSelected = false;

    if(courseIdList.length!==0){

      allSelected = section.loIds.every((id)=>{

        if(courseIdList.includes(id)){
          return true;
        }
  
        const subLo = allCoursesInsideFlexLP.find((subLO) =>{
            return subLO.id === id;
        });
  
        if(subLo?.enrollment && subLo.enrollment.state!=COMPLETED && subLo.enrollment.loInstance){
          return true;
        }
  
      });

    }
    return allSelected;
  }


  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
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
            updateBookMark={updateBookMark}
            instanceSummary={instanceSummary}
            isFlexible={isFlexible}
          />

          <div className={styles.pageContainer}>
            <div className={styles.left}>
              {trainingOverviewAttributes.showDescription === "true" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: richTextOverview || overview || description,
                  }}
                  className={`${styles.overview} ql-editor`}
                ></div>
              )}
              <span className={styles.duration}>
                {!isFlexible ? (
                  <>
                    {formatMessage(
                      { id: "alm.overview.total.duration" },
                      { 0: convertSecondsToTimeText(training.duration) }
                    )}
                  </>
                ) : (
                  <>
                    {formatMessage(
                      { id: "alm.overview.total.duration" },
                      { 0: convertSecondsToTimeText(timeDuration()) }
                    )}
                  </>
                )}
              </span>
              {isFlexible &&
                !areAllInstancesSelectedHandler() && (
                  <section className={styles.coursesViewMenu}>
                    <span className={styles.info}>
                      <Info />
                    </span>
                    <span>
                      <div className={styles.script}>
                        {GetTranslation(
                          "alm.training.flexLp.courseViewLable",
                          true
                        )}
                      </div>
                    </span>
                    <div className={styles.radioGroup}>
                      <RadioGroup
                        defaultValue="yes"
                        onChange={coursesViewHandler}
                        orientation="horizontal"
                        isEmphasized
                      >
                        <Radio id="RadioButton1" value="yes">
                          {GetTranslationsReplaced(
                            "alm.training.flexLp.showAllView",
                            { x: coursesInsideFlexLPCount.toString() },
                            true
                          )}
                        </Radio>
                        <Radio id="RadioButton2" value="no">
                          {GetTranslationsReplaced(
                            "alm.training.flexLp.unselectedView",
                            {
                              x:
                              coursesInsideFlexLPCount -
                                Object.keys(selectedInstanceInfo).length- retiredCoursesInsideFlexLP.length,
                            },
                            true
                          )}
                        </Radio>
                      </RadioGroup>
                    </div>
                    <button
                      className={styles.refreshDiv}
                      aria-label={GetTranslation(
                        "alm.training.flexlp.refreshArialLabel",
                        true
                      )}
                      tabIndex={0}
                      onClick={setInstanceSelected}
                      title={GetTranslation(
                        "alm.training.flexlp.refreshArialLabel",
                        true
                      )}
                    >
                      <span className={styles.refresh}>
                        <Refresh />
                      </span>
                    </button>
                  </section>
                )}
              {showCertProof() && (
                <>
                  <div className={styles.externalCertUploadInfo}>
                    <span className={styles.externalCertUploadMessage}>
                      {formatMessage({ id: "alm.overview.externalCertInfo" })}
                    </span>
                  </div>
                  <hr className={styles.uploadUpperSeperator} />
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
                  {!isUploading && (
                    <span className={styles.fileSubmissionContainer}>
                      {getCertUploadSection(enrollment.state)}
                    </span>
                  )}
                  <hr className={styles.uploadLowerSeperator} />
                  <div className={styles.fileUploadNote}>
                    {formatMessage({
                      id: "alm.overview.certUploadNote",
                      defaultMessage:
                        "Note: Only one document can be uploaded as a proof.",
                    })}
                  </div>
                </>
              )}

              {prerequisiteLOs ? (
                <div className={styles.trainingPrequisiteLabel}>
                  {formatMessage({
                    id: "alm.training.overviewPrequisite.label",
                  })}
                </div>
              ) : (
                ""
              )}
              {prerequisiteLOs?.map((prerequisiteLO) => {
                const { name, description, overview, richTextOverview } =
                  getPreferredLocalizedMetadata(
                    prerequisiteLO.localizedMetadata,
                    locale
                  );

                let showMandatoryLabel = false;
                let instance = prerequisiteLO.instances[0];
                prequisiteConstraints?.forEach((prequisiteConstraints) => {
                  if (
                    prequisiteConstraints.prerequisiteLOId === prerequisiteLO.id
                  ) {
                    showMandatoryLabel = prequisiteConstraints.mandatory;
                  }
                });
                return (
                  <section className={styles.trainingOverviewPrequisite}>
                    <PrimeTrainingItemContainerHeader
                      name={name}
                      description={description}
                      training={prerequisiteLO}
                      trainingInstance={instance}
                      overview={overview}
                      richTextOverview={richTextOverview}
                      isPartOfLP={prerequisiteLO.loType === LEARNING_PROGRAM}
                      showMandatoryLabel={showMandatoryLabel}
                      isprerequisiteLO={true}
                      isPreviewEnabled={false}
                      isParentLOEnrolled={isEnrolled}
                      parentLoName={loName}
                      key={name}
                      isFlexible={isFlexible}
                    />
                  </section>
                );
              })}

              {loType === COURSE && (
                <PrimeCourseOverview
                  training={training}
                  launchPlayerHandler={launchPlayerHandler}
                  trainingInstance={trainingInstance}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={isEnrolled}
                  showNotes={isEnrolled}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                />
              )}
              {loType === CERTIFICATION && (
                <PrimeTrainingOverview
                  trainings={training.subLOs}
                  launchPlayerHandler={launchPlayerHandler}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={isEnrolled}
                  parentLoName={loName}
                  isPartOfLP={loType === CERTIFICATION}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                  sendInstanceId={sendInstanceId}
                  selectedCourses={selectedCourses}
                  isFlexible={isFlexible}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                  showUnselectedLOs={showUnselectedLOs}
                />
              )}
              {loType === LEARNING_PROGRAM &&
                sections.map((section, index) => {

                  //Flex LP case - If all LO instances inside section is either selected or completed 
                  const fullSectionSelected = isFullSectionSelected(section, index);
                  if(fullSectionSelected){
                    return;
                  }
                  const trainingIds = section.loIds;
                  const { name } = getPreferredLocalizedMetadata(
                    section.localizedMetadata,
                    locale
                  );
                  const subLOs = training.subLOs.filter(
                    (subLO) => trainingIds.indexOf(subLO.id) !== -1
                  );
                  subLOs.sort(
                    (trainingId1, trainingId2) =>
                      trainingIds.indexOf(trainingId1.id) -
                      trainingIds.indexOf(trainingId2.id)
                  );

                  return (
                    <section
                      className={styles.trainingOverviewContainer}
                      key={index}
                    >
                      <h3 className={styles.sectionName}>{name}</h3>
                      {!section.mandatory ? (
                        <div>
                          <span className={styles.sectionOptional}>
                            {formatMessage({
                              id: "alm.overview.section.optional",
                              defaultMessage: "Optional",
                            })}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}
                      {section.mandatory &&
                      section.mandatoryLOCount !== section.loIds?.length ? (
                        <div>
                          <span className={styles.sectionOptional}>
                            {formatMessage(
                              { id: "alm.overview.section.xOutOfy" },
                              {
                                0: section.mandatoryLOCount,
                                1: section.loIds?.length,
                              }
                            )}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}

                      <PrimeTrainingOverview
                        trainings={subLOs}
                        launchPlayerHandler={launchPlayerHandler}
                        isPartOfLP={loType === LEARNING_PROGRAM}
                        showMandatoryLabel={
                          section.mandatory &&
                          section.mandatoryLOCount === section.loIds?.length
                        }
                        isPreviewEnabled={isPreviewEnabled}
                        updateFileSubmissionUrl={updateFileSubmissionUrl}
                        isParentLOEnrolled={isEnrolled}
                        parentLoName={loName}
                        setTimeBetweenAttemptEnabled={
                          setTimeBetweenAttemptEnabled
                        }
                        timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                        sendInstanceId={sendInstanceId}
                        selectedCourses={selectedCourses}
                        isFlexible={isFlexible}
                        selectedInstanceInfo={selectedInstanceInfo}
                        notes={notes}
                        updateNote={updateNote}
                        deleteNote={deleteNote}
                        downloadNotes={downloadNotes}
                        sendNotesOnMail={sendNotesOnMail}
                        lastPlayingLoResourceId={lastPlayingLoResourceId}
                        showUnselectedLOs={showUnselectedLOs}
                      />
                    </section>
                  );
                })}
            </div>
            <div className={styles.right}>
              <PrimeTrainingPageMetadata
                skills={skills}
                training={training}
                trainingInstance={trainingInstance}
                badge={instanceBadge}
                instanceSummary={instanceSummary}
                showAuthorInfo={trainingOverviewAttributes.showAuthorInfo}
                showEnrollDeadline={
                  trainingOverviewAttributes.showEnrollDeadline
                }
                enrollmentHandler={enrollmentHandler}
                launchPlayerHandler={launchPlayerHandler}
                unEnrollmentHandler={unEnrollmentHandler}
                addToCartHandler={addToCartHandler}
                updateEnrollmentHandler={updateEnrollmentHandler}
                jobAidClickHandler={jobAidClickHandler}
                isPreviewEnabled={isPreviewEnabled}
                alternateLanguages={alternateLanguages}
                updateRating={updateRating}
                updateBookMark={updateBookMark}
                waitlistPosition={waitlistPosition}
                setActiveExtension={setActiveExtension}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                selectedInstanceInfo={selectedInstanceInfo}
                flexLpEnrollHandler={flexLpEnrollHandler}
                isFlexible={isFlexible}
                areAllInstancesSelectedHandler={areAllInstancesSelectedHandler}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
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
