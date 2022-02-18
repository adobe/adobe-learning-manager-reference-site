/* eslint-disable jsx-a11y/aria-role */
import { useState } from "react";
import { useTrainingCard } from "../../hooks/catalog/useTrainingCard";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { useIntl } from "react-intl";

import styles from "./PrimeTrainingCard.module.css";

const PrimeTrainingCard: React.FC<{
  training: PrimeLearningObject;
}> = ({ training }) => {
  const {
    format,
    type,
    skills,
    name,
    description,
    imageUrl,
    cardBgStyle,
    enrollment,
    cardClickHandler,
  } = useTrainingCard(training);
  const [isHovered, setIsHovered] = useState(false);
  const { formatMessage } = useIntl();

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const skillsAsString = skills?.map((item) => item.skillLevel.name).join(",");
  const descriptHtml = description ? (
    <p className={styles.primeTrainingDescription}>{description}</p>
  ) : (
    ""
  );
  const enrollmentHtml = enrollment ? (
    <div className={styles.primeTrainingProgressBarContainer}>
      <div
        className={styles.primeTrainingProgressBar}
        style={{ width: enrollment.progressPercent + "%" }}
      ></div>
    </div>
  ) : (
    ""
  );
  const hasCompletedTrainingHtml = enrollment?.hasPassed ? (
    <div className={styles.primeTrainingCompleted}>
      {formatMessage({
        id: "prime.catalog.card.complete.label",
        defaultMessage: "Complete",
      })}
    </div>
  ) : (
    enrollmentHtml
  );

  const cardClass = `${styles.primeTrainingCard} ${
    isHovered ? styles.hover : ""
  }`;
  return (
    <>
      <li
        role="anchor"
        className={styles.primeTrainingsListItem}
        onClick={cardClickHandler}
      >
        <div className={cardClass} onMouseLeave={onMouseLeaveHandler}>
          <div
            style={{ ...cardBgStyle }}
            className={styles.primeTrainingThumbnail}
          ></div>

          {imageUrl ? <div className={styles.primeTrainingBackdrop}></div> : ""}

          <div className={styles.primeTrainingDetailsContainer}>
            <div className={styles.primeTrainingTopBar}>
              <div className={styles.primeTrainingFormat}>{format}</div>
            </div>

            <div className={styles.primeTrainingBottomBar}>
              <span className={styles.primeTrainingPrice}>$9009</span>
              <div className={styles.primeTrainingTitle}>{name}</div>
              <div className={styles.primeTrainingType}>
                {type} - {training.loFormat}
              </div>
              <div
                className={styles.primeTrainingDescriptionContainer}
                onMouseEnter={onMouseEnterHandler}
              >
                <div className={styles.primeTrainingExtra}>
                  {hasCompletedTrainingHtml || (
                    <div className={styles.primeTrainingExtraWrapper}>
                      <div>Icon</div>
                      <div className={styles.primeTrainingExtraLabel}>
                        <span>
                          {formatMessage({
                            id: "prime.catalog.card.skills.label",
                            defaultMessage: "Skills",
                          })}
                        </span>
                        <span className={styles.primeTrainingSkillsExtraValue}>
                          {skillsAsString}
                        </span>
                      </div>
                      <div className={styles.primeTrainingExtraIcon}>
                        3 dots
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.showOnHover}>
                  {descriptHtml}
                  <div className={styles.primeTrainingSkillsContainer}>
                    <span className={styles.primeTrainingSkillsLabel}>
                      {formatMessage({
                        id: "prime.catalog.card.skills.label",
                        defaultMessage: "Skills",
                      })}
                    </span>
                    <span className={styles.primeTrainingSkillsValue}>
                      {skillsAsString}
                    </span>
                  </div>
                  <div className={styles.primeTrainingSkillsContainer}>
                    {enrollment ? (
                      <>
                        {enrollmentHtml}
                        <div className={styles.primeTrainingPercentComplete}>
                          {formatMessage(
                            {
                              id: "prime.catalog.card.progress.percent",
                              defaultMessage: `${enrollment?.progressPercent}% completes`,
                            },
                            { "0": enrollment?.progressPercent }
                          )}
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default PrimeTrainingCard;
