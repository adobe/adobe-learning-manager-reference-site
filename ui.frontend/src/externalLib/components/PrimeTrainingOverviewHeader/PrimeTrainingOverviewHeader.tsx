import React from "react";
import styles from "./PrimeTrainingOverviewHeader.module.css";

const PrimeTrainingOverviewHeader: React.FC<{
  format: string;
  title: string;
  color: string;
  bannerUrl: string;
}> = (props) => {
  const { format, title, color } = props;
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
      </div>
    </div>
  );
};

export default PrimeTrainingOverviewHeader;
