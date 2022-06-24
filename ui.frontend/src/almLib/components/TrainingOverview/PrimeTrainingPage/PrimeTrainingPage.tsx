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
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import store from "../../../../store/APIStore";
import { useTrainingPage } from "../../../hooks/catalog/useTrainingPage";
import {
  CERTIFICATION,
  COMPLETED,
  COURSE,
  ENROLLED,
  LEARNING_PROGRAM,
  PENDING_APPROVAL,
  REJECTED,
  TRAINING_ID_STR,
  TRAINING_INSTANCE_ID_STR,
} from "../../../utils/constants";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import {
  getALMConfig,
  getConfigurableAttributes,
  getPathParams,
  PrimeConfig,
  setALMAttribute,
} from "../../../utils/global";
import { SOCIAL_CANCEL_SVG } from "../../../utils/inline_svg";
import { checkIsEnrolled } from "../../../utils/overview";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
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
import styles from "./PrimeTrainingPage.module.css";

const getTrainingOverviewAttributes = (config: PrimeConfig) => {
  let cssSelector = config.mountingPoints.trainingOverviewPage;
  let trainingOverviewAttributes = getConfigurableAttributes(cssSelector) || {};
  setALMAttribute("trainingOverviewAttributes", trainingOverviewAttributes);
  return trainingOverviewAttributes;
};

const PrimeTrainingPage = () => {
  const config = getALMConfig();
  let trainingOverviewPath = config.trainingOverviewPath;

  let pathParams = getPathParams(trainingOverviewPath, [
    TRAINING_ID_STR,
    TRAINING_INSTANCE_ID_STR,
  ]);
  let trainingId = pathParams[TRAINING_ID_STR];
  let trainingInstanceId = pathParams[TRAINING_INSTANCE_ID_STR];

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
    unEnrollmentHandler,
    jobAidClickHandler,
    addToCartHandler,
    isPreviewEnabled,
    alternateLanguages,
    updateFileSubmissionUrl,
  } = useTrainingPage(trainingId, trainingInstanceId);
  const locale = config.locale;
  const { formatMessage } = useIntl();
  const [{ showAuthorInfo, showDescription, showEnrollDeadline }] = useState(
    () => getTrainingOverviewAttributes(config)
  );

  const inputRef = useRef<null | HTMLInputElement>(null);
  const state = store.getState();
  const [isUploading, setIsUploading] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [fileUploadProgress, setFileUploadProgress] = useState(
    state.fileUpload.uploadProgress
  );
  const { updateCertificationProofUrl } = useTrainingPage("", "");

  if (isLoading || !training) {
    return <ALMLoader classes={styles.loader} />;
  }
  const loType = training.loType;
  const sections = training.sections;
  const prerequisiteLOs = training.prerequisiteLOs;
  const prequisiteConstraints = training.prequisiteConstraints;
  const isEnrolled = checkIsEnrolled(training?.enrollment);

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
    const url = submissionUrl || training.enrollment.url;
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

  const showCertProof = () => {
    return training.loType && training.isExternal && training.enrollment;
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <ALMBackButton />
        <PrimeTrainingOverviewHeader
          format={training.loType}
          color={color}
          title={name}
          bannerUrl={bannerUrl}
          showProgressBar={true}
          enrollment={training.enrollment}
        />
        <div className={styles.pageContainer}>
          <div className={styles.left}>
            {showDescription === "true" && (
              <div
                dangerouslySetInnerHTML={{
                  __html: richTextOverview || overview || description,
                }}
                className={`${styles.overview} ql-editor`}
              ></div>
            )}
            <span className={styles.duration}>
              {formatMessage(
                { id: "alm.overview.total.duration" },
                { 0: convertSecondsToTimeText(training.duration) }
              )}
            </span>

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
                    {getCertUploadSection(training.enrollment.state)}
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
                    isPreviewEnabled={isPreviewEnabled}
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
              />
            )}
            {loType === CERTIFICATION && (
              <PrimeTrainingOverview
                trainings={training.subLOs}
                launchPlayerHandler={launchPlayerHandler}
                isPreviewEnabled={isPreviewEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isEnrolled}
              />
            )}
            {loType === LEARNING_PROGRAM &&
              sections.map((section, index) => {
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
              showAuthorInfo={showAuthorInfo}
              showEnrollDeadline={showEnrollDeadline}
              enrollmentHandler={enrollmentHandler}
              launchPlayerHandler={launchPlayerHandler}
              unEnrollmentHandler={unEnrollmentHandler}
              addToCartHandler={addToCartHandler}
              jobAidClickHandler={jobAidClickHandler}
              isPreviewEnabled={isPreviewEnabled}
              alternateLanguages={alternateLanguages}
            />
          </div>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeTrainingPage;
