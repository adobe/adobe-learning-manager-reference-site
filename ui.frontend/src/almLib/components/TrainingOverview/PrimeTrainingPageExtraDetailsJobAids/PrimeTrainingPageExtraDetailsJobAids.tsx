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

import RemoveCircle from "@spectrum-icons/workflow/RemoveCircle";
import AddCircle from "@spectrum-icons/workflow/AddCircle";
import styles from "./PrimeTrainingPageExtraDetailsJobAids.module.css";
import {
  PrimeLearningObject,
  PrimeResource,
} from "../../../models/PrimeModels";
import { useState } from "react";
import { isJobaidContentTypeUrl } from "../../../utils/catalog";
import { PrimeAlertDialog } from "../../Community/PrimeAlertDialog";
import { GetTranslation } from "../../../utils/translationService";
import { useIntl } from "react-intl";

const PrimeTrainingPageExtraJobAid: React.FC<{
  resource: PrimeResource;
  training: PrimeLearningObject;
  enrollmentHandler: Function;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
}> = ({
  resource,
  training,
  enrollmentHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
}) => {
  const { formatMessage } = useIntl();
  //on clikc, if not enrolled show popup alert
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return training.enrollment ? true : false;
  });
  const [showAlert, setShowAlert] = useState(false);

  const unenroll = () => {
    unEnrollmentHandler({
      enrollmentId: training.enrollment.id,
      isSupplementaryLO: true,
    });
    setIsEnrolled(false);
  };

  const enroll = () => {
    enrollmentHandler({
      id: training.id,
      instanceId: training.instances[0].id,
      isSupplementaryLO: false,
    });
    setIsEnrolled(true);
  };

  const nameClickHandler = () => {
    if (isJobaidContentTypeUrl(training)) {
      jobAidClickHandler(training);
      return;
    }

    if (isEnrolled) {
      jobAidClickHandler(training);
      return;
    } else {
      // alert("not in your list");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      //need to show dialog
    }
  };

  const jobAidAddToListMsg = formatMessage({
    id: "alm.overview.job.aid.add.from.list",
    defaultMessage: "Add to my list",
  });

  const jobAidRemoveToListMsg = formatMessage({
    id: "alm.overview.job.aid.remove.from.list",
    defaultMessage: "Remove from my list",
  });
  
  return (
    <div className={styles.jobAid}>
      <a
        className={styles.name}
        onClick={nameClickHandler}
        role="button"
        tabIndex={0}
        href="javascript:void(0)"
      >
        {resource.name}
      </a>
      <span className={styles.jobAidIcon}>
        {isEnrolled ? (
          <span title = {jobAidRemoveToListMsg} onClick={unenroll} role="button" tabIndex={0}>
            <RemoveCircle aria-label={jobAidRemoveToListMsg} />
          </span>
        ) : (
          <span title = {jobAidAddToListMsg} onClick={enroll} role="button" tabIndex={0}>
            <AddCircle aria-label={jobAidAddToListMsg} />
          </span>
        )}
      </span>

      {showAlert && (
        <PrimeAlertDialog
          variant="warning"
          title={GetTranslation("alm.overview.job.aid.not.in.list", true)}
          primaryActionLabel="Ok"
          classes={styles.warningDialog}
          show={true}
        ></PrimeAlertDialog>
      )}
    </div>
  );
};

export default PrimeTrainingPageExtraJobAid;
