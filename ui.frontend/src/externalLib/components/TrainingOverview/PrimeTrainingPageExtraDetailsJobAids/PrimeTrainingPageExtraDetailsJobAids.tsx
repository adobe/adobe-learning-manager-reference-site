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
  //on clikc, if not enrolled show popup alert
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return training.enrollment ? true : false;
  });

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
      isSupplementaryLO: true,
    });
    setIsEnrolled(true);
  };

  const nameClickHandler = () => {
    if (isEnrolled) {
      jobAidClickHandler(training);
      return;
    } else {
      //need to show dialog
      alert("not in your list");
    }
  };

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
          <span onClick={unenroll} role="button" tabIndex={0}>
            <RemoveCircle aria-label="Remove from My List" />
          </span>
        ) : (
          <span onClick={enroll} role="button" tabIndex={0}>
            <AddCircle aria-label="Add to My List" />
          </span>
        )}
      </span>
    </div>
  );
};

export default PrimeTrainingPageExtraJobAid;
