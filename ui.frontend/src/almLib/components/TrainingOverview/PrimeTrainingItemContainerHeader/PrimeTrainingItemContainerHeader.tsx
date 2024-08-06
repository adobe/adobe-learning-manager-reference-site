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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useIntl } from "react-intl";
import { PrimeLearningObject, PrimeLearningObjectInstance } from "../../../models/PrimeModels";
import { COMPLETED, COURSE, PREVIEW, STARTED } from "../../../utils/constants";
import { calculateSecondsToTime } from "../../../utils/dateTime";
import { getALMObject, getTrimmedText } from "../../../utils/global";
import {
  getEnrolledInstancesCount,
  hasSingleActiveInstance,
  pushToBreadcrumbPath,
  useCanShowRating,
  useCardIcon,
} from "../../../utils/hooks";
import styles from "./PrimeTrainingItemContainerHeader.module.css";
import Visibility from "@spectrum-icons/workflow/Visibility";
import { debounce, splitStringIntoArray } from "../../../utils/catalog";
import { GetTranslation, GetTranslationReplaced } from "../../../utils/translationService";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import LockClosed from "@spectrum-icons/workflow/LockClosed";
import { ALMStarRating } from "../../ALMRatings";
import {
  arePrerequisitesEnforcedAndCompleted,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import { useAlert } from "../../../common/Alert/useAlert";
import {
  displayPendingRequirements,
  isTrainingCompleted,
  shouldShowOnlyExternalAuthor,
} from "../../../utils/lo-utils";

const DESCRIPTION_LENGTH = 180;

const PrimeTrainingItemContainerHeader: React.FC<{
  name: string;
  description: string;
  overview: string;
  richTextOverview: string;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  isParentFlexLP?: boolean;
  flexLPTraining?: boolean;
  isRootLOEnrolled: boolean;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  showMandatoryLabel?: boolean;
  isprerequisiteLO?: boolean;
  isPreviewEnabled?: boolean;
  isParentLOEnrolled?: boolean;
  parentLoName?: string;
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  isTrainingLocked: boolean;
}> = props => {
  const {
    name,
    description,
    overview,
    training,
    trainingInstance,
    launchPlayerHandler,
    isParentFlexLP = false,
    flexLPTraining = false,
    isRootLOEnrolled = false,
    isPartOfLP = false,
    isPartOfCertification = false,
    showMandatoryLabel = false,
    isprerequisiteLO = false,
    isPreviewEnabled = false,
    isParentLOEnrolled = false,
    parentLoName,
    parentHasEnforcedPrerequisites,
    parentHasSubLoOrderEnforced,
    isTrainingLocked,
  } = props;
  const { formatMessage } = useIntl();
  const [almAlert] = useAlert();
  const authorNames = training.authorNames?.length ? training.authorNames.join(", ") : "";

  const { cardBgStyle } = useCardIcon(training);
  const isDefaultTileIcon = cardBgStyle.background?.includes("default_card_icons");
  const trainingDescription = overview || description;
  let loType = training.loType;
  let loFormat = training.loFormat;
  // const isEnrolled = checkIsEnrolled(training.enrollment);
  const isPreviewable = isPreviewEnabled && training.hasPreview && !isParentLOEnrolled;
  const primaryEnrollment = training.enrollment;

  // checking if either parent has enforced prerequisites or the current training has enforced prerequisites
  const hasEnforcedPrerequisites =
    parentHasEnforcedPrerequisites ||
    (primaryEnrollment?.progressPercent === 0 && !arePrerequisitesEnforcedAndCompleted(training));

  const isPartOfParentLO = isPartOfLP || isPartOfCertification;
  const parentEnrollmentStatus = !isPartOfParentLO || isParentLOEnrolled;

  // Training should not be locked if its completed
  const isTrainingIncomplete =
    !trainingInstance.enrollment ||
    (trainingInstance.enrollment && !isTrainingCompleted(trainingInstance.enrollment));

  const isLocked =
    (isTrainingLocked && isTrainingIncomplete) ||
    (hasEnforcedPrerequisites && !isprerequisiteLO && parentEnrollmentStatus);

  // If training is part of flex LP but locked due to subLO order enforced, then it should not be disabled
  // Navigation are prohibited for locked trainings
  const isTrainingDisabled = isLocked && !isParentFlexLP;

  const avgRating = training.rating?.averageRating;
  const ratingsCount = training.rating?.ratingsCount;
  const showRating = useCanShowRating(training) && avgRating !== 0;
  const enrolledWithNoInstance = primaryEnrollment && !primaryEnrollment.loInstance;

  const handleDisabledLoClick = () => {
    if (training.loType !== COURSE) {
      return;
    }
    // showing alert box only for course ( same as old UI )
    displayPendingRequirements(
      hasEnforcedPrerequisites,
      parentHasEnforcedPrerequisites,
      parentHasSubLoOrderEnforced,
      isPartOfLP,
      isPartOfCertification,
      almAlert
    );
  };

  const onClickHandler = (event: any) => {
    if (isLocked && event.target.id !== "complete-prerequisite") {
      handleDisabledLoClick();
      return;
    }

    //NOTE: Don't open player in case training name is clicked
    // For prerequisiteLOs never open the Launch Player.
    if (
      event.target?.id !== "navigate-to-training" &&
      event.target?.id !== "complete-prerequisite" &&
      !isprerequisiteLO
    ) {
      // Blocking player launch in case of flex lp
      if (loType !== COURSE || !isRootLOEnrolled || flexLPTraining) {
        return;
      }
      if (primaryEnrollment && launchPlayerHandler !== undefined) {
        launchPlayerHandler({ id: training.id, trainingInstanceId: trainingInstance.id });
      }
    } else {
      event.target?.classList.add(styles.disabled);
      const hasMultipleInstances = !hasSingleActiveInstance(training);
      let parentLoId = splitStringIntoArray(window.location.href, "trainingId/")[1];
      parentLoId = splitStringIntoArray(parentLoId, "/")[0];
      const parentDetails = parentLoName ? parentLoId + "::" + parentLoName : "";
      const currentLoDetails = training.id + "::" + name;

      pushToBreadcrumbPath(parentDetails, currentLoDetails);

      if (
        (!primaryEnrollment ||
          enrolledWithNoInstance ||
          (training.multienrollmentEnabled && getEnrolledInstancesCount(training) > 1)) &&
        hasMultipleInstances
      ) {
        getALMObject().navigateToInstancePage(training.id);
      } else {
        getALMObject().navigateToTrainingOverviewPage(training.id, trainingInstance.id);
      }
    }
  };

  const loClickHandler = debounce(onClickHandler);

  const previewHandler = async () => {
    storeActionInNonLoggedMode(PREVIEW);
    launchPlayerHandler({ id: training.id, trainingInstanceId: trainingInstance.id });
  };

  let statusText = "";
  let showCompletionMark = false;
  if (primaryEnrollment?.state) {
    const { state, hasPassed } = primaryEnrollment;
    if (state === STARTED) {
      statusText = formatMessage({
        id: "alm.overview.label.inProgress",
        defaultMessage: "In Progress",
      });
    } else if (state === COMPLETED || hasPassed) {
      showCompletionMark = true;
      statusText = formatMessage({
        id: "alm.overview.label.completed",
        defaultMessage: "Completed",
      });
    }
  }

  const showStatus = () => {
    return (
      <div className={styles.status} data-automationid={`${name}-status`}>
        {showCompletionMark && (
          <p className={styles.trainingCompleted}>
            <CheckmarkCircle aria-hidden="true" />
          </p>
        )}
        {statusText}
      </div>
    );
  };

  const getSeparatorDot = () => {
    return <div className={styles.metadata__separator}></div>;
  };

  const getStarRating = () => {
    return (
      <div className={styles.starRating}>
        <ALMStarRating avgRating={avgRating} ratingsCount={ratingsCount} />
      </div>
    );
  };

  const showPrereqLabel = () => {
    return (
      isPartOfParentLO &&
      isParentLOEnrolled &&
      !isprerequisiteLO &&
      primaryEnrollment?.state !== COMPLETED &&
      !arePrerequisitesEnforcedAndCompleted(training)
    );
  };

  return (
    <div
      className={`${styles.headerContainer} ${
        isPartOfParentLO ? styles.isPartOfParentLO : ""
      } ${isTrainingDisabled && styles.locked} `}
      data-automationid={`${name}-header`}
      onClick={loClickHandler}
    >
      {/* <h2 className={styles.courseInfoHeader}>{name} </h2> */}
      <div className={styles.metadata} data-automationid={`${name}-metadata`}>
        <div className={styles.metadataContents}>
          <div className={styles.loType} data-automationid={`${name}-loType`}>
            {isPartOfLP ? GetTranslation(`cpw.loType.${loType}`, true) : loFormat}
          </div>
          {isprerequisiteLO && !loType ? (
            ""
          ) : authorNames.length ? (
            <>
              {getSeparatorDot()}
              <div className={styles.x} data-automationid={`${name}-author-names`}>
                {shouldShowOnlyExternalAuthor(training)
                  ? GetTranslation("alm.text.externalAuthor")
                  : authorNames}
              </div>
            </>
          ) : (
            ""
          )}
          {!isprerequisiteLO && training.duration ? (
            <>
              {getSeparatorDot()}
              <div data-automationid={`${name}-duration`}>
                {GetTranslationReplaced(
                  "text.durationLabel",
                  calculateSecondsToTime(training.duration)
                )}
              </div>
            </>
          ) : (
            ``
          )}
          {showMandatoryLabel && (
            <>
              {getSeparatorDot()}
              <span
                className={`${styles.mandatory} ${isTrainingDisabled && styles.disabledMandatory}`}
                data-automationid={`${name}-required`}
              >
                {formatMessage({
                  id: "alm.overview.section.required",
                  defaultMessage: "Required",
                })}
              </span>
            </>
          )}
          {isLocked && (
            <div className={styles.lockedIcon} data-automationid={`${name}-lockedIcon`}>
              {getSeparatorDot()}
              <LockClosed aria-hidden="true" />
            </div>
          )}
        </div>
        {showRating && getStarRating()}
        {isPreviewable ? (
          <span
            className={styles.previewable}
            tabIndex={0}
            data-automationid={`${name}-preview`}
            onClick={previewHandler}
          >
            {formatMessage({
              id: "alm.module.session.preview",
              defaultMessage: "Preview",
            })}
            <Visibility aria-hidden="true" />
          </span>
        ) : (
          ""
        )}
        {statusText && isParentLOEnrolled && (
          <>
            {showRating && getSeparatorDot()}
            {showStatus()}
          </>
        )}
      </div>
      <div className={styles.trainingDetailsContainer}>
        <button
          className={`${styles.card} ${isDefaultTileIcon && styles.defaultCardTiles}`}
          style={{ ...cardBgStyle }}
          onClick={loClickHandler}
          data-automationid={`${name}-lo-card`}
          id={"navigate-to-training"}
          tabIndex={-1}
        ></button>
        <div className={styles.trainingDetials}>
          {/* Change it to button and role="link" */}
          <button
            aria-label={name}
            className={`${styles.title} ${isTrainingDisabled && styles.disabled}`}
            onClick={loClickHandler}
            id={"navigate-to-training"}
            data-automationid={`go-to-${name}`}
          >
            {name}
          </button>
          <p
            className={styles.description}
            data-automationid={`${name}-description`}
            title={trainingDescription}
          >
            {getTrimmedText(trainingDescription, DESCRIPTION_LENGTH)}
          </p>
        </div>
      </div>
      {showPrereqLabel() && (
        <div
          className={styles.prerequisiteMessage}
          data-automationid="complete-prerequisite-message"
        >
          <LockClosed aria-hidden="true" />
          <button
            className={styles.completePrerequisite}
            aria-label={name}
            onClick={loClickHandler}
            data-automationid={`${name}-prerequisite`}
            id="complete-prerequisite"
          >
            {GetTranslation(`alm.overview.complete.prerequisite.message.${loType}`, true)}
          </button>
        </div>
      )}
    </div>
  );
};

export default PrimeTrainingItemContainerHeader;
