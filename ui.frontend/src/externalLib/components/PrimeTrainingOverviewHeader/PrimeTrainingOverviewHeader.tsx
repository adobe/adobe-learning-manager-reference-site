import React from "react";
import styles from "./PrimeTrainingOverviewHeader.module.css";

const PrimeTrainingOverviewHeader: React.FC<{
  format: string;
  title: string;
  color: string;
}> = (props) => {
  const { format, title, color } = props;
  return (
    <div style={{ backgroundColor: color }} className={styles.primeTrainingHeader}>
      <div className={styles.primeTraingingHeadingContainer}>
        <div className={styles.primeTrainingFormat}>{format}</div>
        <div role="heading" className={styles.primeTrainingTitle} id={title} aria-label={title} title={title} data-automationid={title}>{title}</div>
      </div>
    </div>
  );
};

export default PrimeTrainingOverviewHeader;
