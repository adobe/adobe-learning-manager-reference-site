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
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../../models/PrimeModels";
import { COMPLETED } from "../../../utils/constants";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { getALMObject } from "../../../utils/global";
import { getEnrolledInstancesCount, hasSingleActiveInstance, pushToParentPathStack, useCardIcon } from "../../../utils/hooks";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./PrimeTrainingItemContainerHeader.module.css";
import Visibility from "@spectrum-icons/workflow/Visibility";
import { checkIsEnrolled } from "../../../utils/overview";
import { CardBgStyle } from "../../../models/custom";
import { useEffect, useState } from "react";
import { debounce } from "../../../utils/catalog";

const PrimeTrainingItemContainerHeader: React.FC<{
  name: string;
  description: string;
  overview: string;
  richTextOverview: string;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler?: Function;
  isPartOfLP?: boolean;
  showMandatoryLabel?: boolean;
  isprerequisiteLO?: boolean;
  isPreviewEnabled?: boolean;
  isParentLOEnrolled?: boolean;
  parentLoName?: string;
}> = (props) => {
  const {
    name,
    description,
    overview,
    training,
    trainingInstance,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isprerequisiteLO = false,
    isPreviewEnabled = false,
    isParentLOEnrolled = false,
    parentLoName,
  } = props;
  const { formatMessage } = useIntl();
  const authorNames = training.authorNames?.length
    ? training.authorNames.join(", ")
    : "";

  const { cardBgStyle } = useCardIcon(training);

  let loType = training.loType;
  let loFormat = training.loFormat;
  // const isEnrolled = checkIsEnrolled(training.enrollment);
  const isPreviewable =
    isPreviewEnabled && training.hasPreview && !isParentLOEnrolled;

  const onClickHandler = (event: any) => {
    //NOTE: Don't open player in case training name is clicked

    // For prerequisiteLOs never open the Launch Player.
    if (event.target?.tagName !== "A" && !isprerequisiteLO) {
      if (training.enrollment && launchPlayerHandler != undefined) {
        launchPlayerHandler({ id: training.id });
      }
    } else {
      event.target?.classList.add(styles.disabled);
      const hasMultipleInstances = !hasSingleActiveInstance(training);

      let parentLoId = window.location.href.split("trainingId/")[1];
      let parentDetails = parentLoName? parentLoId + "::" + parentLoName: "";
      pushToParentPathStack(parentDetails);

      if ((!training.enrollment || (training.multienrollmentEnabled && getEnrolledInstancesCount(training)>1)) && hasMultipleInstances) {
        getALMObject().navigateToInstancePage(training.id);
      }
      else{
        getALMObject().navigateToTrainingOverviewPage(
          training.id,
          trainingInstance.id
        );
      }
    }
  };

  const loClickHandler = debounce(onClickHandler);

  let statusText = "";
  if (training.enrollment?.state) {
    const { state } = training.enrollment;
    if (state === "STARTED") {
      statusText = formatMessage({
        id: "alm.overview.label.inProgress",
        defaultMessage: "In Progress",
      });
    } else if (state === COMPLETED) {
      statusText = formatMessage({
        id: "alm.overview.label.completed",
        defaultMessage: "Completed",
      });
    }
  }
  return (
    <div
      className={`${styles.headerContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
      onClick={loClickHandler}>
      {/* <h2 className={styles.courseInfoHeader}>{name} </h2> */}
      <div className={styles.metadata}>
        <div className={styles.metadataContents}>
          <div className={styles.authorNames}>{loFormat}</div>
          {isprerequisiteLO && !loType ? (
            ""
          ) : authorNames.length ? (
            <>
              <div className={styles.metadata__separator}></div>
              <div className={styles.authorNames}>{authorNames}</div>
            </>
          ) : (
            ""
          )}
          {isprerequisiteLO ? (
            ""
          ) : training.duration ? (
            <>
              <div className={styles.metadata__separator}></div>
              <div>{convertSecondsToTimeText(training.duration)}</div>
            </>
          ) : (
            ""
          )}
          {showMandatoryLabel && (
            <>
              <span className={styles.mandatory}>
                {formatMessage({
                  id: "alm.overview.section.required",
                  defaultMessage: "Required",
                })}
              </span>
            </>
          )}
        </div>
        {isPreviewable ? (
          <span className={styles.previewable}>
            {formatMessage({
              id: "alm.module.session.preview",
              defaultMessage: "Preview",
            })}
            <Visibility aria-hidden="true" />
          </span>
        ) : (
          ""
        )}
        {statusText && <div className={styles.status}>{statusText}</div>}
      </div>
      <div className={styles.trainingDetailsContainer}>
        <div className={styles.card} style={{ ...cardBgStyle }}></div>
        <div className={styles.trainingDetials}>
          {/* Change it to button and role="link" */}
          <a
            aria-label={name}
            className={styles.title}>
            {name}
          </a>
          <p className={styles.description}>{overview || description}</p>
        </div>
      </div>
    </div>
  );
};

export default PrimeTrainingItemContainerHeader;
