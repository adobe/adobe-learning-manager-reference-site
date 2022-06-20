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
import React from "react";
import { PrimeLearningObjectInstanceEnrollment } from "../../../models/PrimeModels";
import { checkIsEnrolled } from "../../../utils/overview";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./PrimeTrainingOverviewHeader.module.css";

const PrimeTrainingOverviewHeader: React.FC<{
  format: string;
  title: string;
  color: string;
  bannerUrl: string;
  showProgressBar?: boolean;
  enrollment?: PrimeLearningObjectInstanceEnrollment;
}> = (props) => {
  const {
    format,
    title,
    color,
    bannerUrl,
    showProgressBar = false,
    enrollment,
  } = props;

  return (
    <div
      style={
        bannerUrl
          ? { background: `url(${bannerUrl}) no-repeat center center / cover` }
          : { backgroundColor: color }
      }
      className={styles.header}
    >
      <div className={styles.headingContainer}>
        <div className={styles.format}>
          {GetTranslation(`alm.catalog.card.${format}`, true)}
        </div>
        <h1
          className={styles.title}
          id={title}
          aria-label={title}
          title={title}
          data-automationid={title}
        >
          {title}
        </h1>
        {showProgressBar && enrollment && checkIsEnrolled(enrollment) && (
          <div className={styles.progressContainer}>
            <ProgressBar
              showValueLabel={false}
              value={enrollment.progressPercent}
              UNSAFE_className={styles.progressBar}
            />
            <span className={styles.percent}>
              {enrollment.progressPercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrimeTrainingOverviewHeader;
