import { ProgressBar } from "@adobe/react-spectrum";
import React from "react";
import { PrimeLearningObjectInstanceEnrollment } from "../../../models/PrimeModels";
import styles from "./PrimeTrainingOverviewHeader.module.css";

const PrimeTrainingOverviewHeader: React.FC<{
  format: string;
  title: string;
  color: string;
  bannerUrl: string;
  showProgressBar?: boolean;
  enrollment?: PrimeLearningObjectInstanceEnrollment;
}> = (props) => {
  const { format, title, color, showProgressBar = false, enrollment } = props;

  return (
    <div style={{ backgroundColor: color }} className={styles.header}>
      <div className={styles.headingContainer}>
        <div className={styles.format}>{format}</div>
        <h1
          className={styles.title}
          id={title}
          aria-label={title}
          title={title}
          data-automationid={title}
        >
          {title}
        </h1>
        {showProgressBar && enrollment && (
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
