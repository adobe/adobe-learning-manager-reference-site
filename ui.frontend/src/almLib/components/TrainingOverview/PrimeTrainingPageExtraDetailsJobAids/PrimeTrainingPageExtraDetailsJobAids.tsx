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

import styles from "./PrimeTrainingPageExtraDetailsJobAids.module.css";
import { PrimeLearningObject, PrimeResource } from "../../../models/PrimeModels";
import { useEffect } from "react";
import { GetTranslation } from "../../../utils/translationService";
import { useJobAids } from "../../../hooks/useJobAids";
import { JOBAID_ICON_REMOVE, JOBAID_ICON_ADD } from "../../../utils/inline_svg";
import { useAlert } from "../../../common/Alert/useAlert";
import { AlertType } from "../../../common/Alert/AlertDialog";

const PrimeTrainingPageExtraJobAid: React.FC<{
  resource: PrimeResource;
  training: PrimeLearningObject;
  enrollmentHandler: Function;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
}> = ({ resource, training, enrollmentHandler, unEnrollmentHandler, jobAidClickHandler }) => {
  const {
    enrollJobAid,
    unenrollJobAid,
    jobAidAddToListMsg,
    jobAidRemoveToListMsg,
    nameClickHandler,
    isEnrolled,
    showAlert,
  } = useJobAids(training, enrollmentHandler, () => {}, unEnrollmentHandler);
  const [almAlert] = useAlert();
  useEffect(() => {
    if (showAlert) {
      almAlert(true, GetTranslation("alm.overview.job.aid.not.in.list", true), AlertType.error);
    }
  }, [showAlert]);
  return (
    <div className={styles.jobAid}>
      <a
        className={styles.name}
        onClick={(event) => {
          event.preventDefault()
          nameClickHandler()
        }}
        role="button"
        tabIndex={0}
        href=""
      >
        {resource.name}
      </a>
      <span className={styles.jobAidIcon}>
        {isEnrolled ? (
          <span title={jobAidRemoveToListMsg} onClick={unenrollJobAid} role="button" tabIndex={0}>
            {JOBAID_ICON_REMOVE()}
          </span>
        ) : (
          <span title={jobAidAddToListMsg} onClick={enrollJobAid} role="button" tabIndex={0}>
            {JOBAID_ICON_ADD()}
          </span>
        )}
      </span>
    </div>
  );
};

export default PrimeTrainingPageExtraJobAid;
