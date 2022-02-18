/* eslint-disable jsx-a11y/aria-role */
import { useState } from "react";
import { useTrainingCard } from "../../hooks/catalog/useTrainingCard";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { useIntl } from "react-intl";

import styles from "./PrimeTrainingCard.module.css";
import { SEND_SVG, THREE_DOTS_MENU_SVG } from "../../utils/inline_svg";

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
  const descriptionHtml = description ? (
    <p className={styles.description}>{description}</p>
  ) : (
    ""
  );
  const enrollmentHtml = enrollment ? (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: enrollment.progressPercent + "%" }}
      ></div>
    </div>
  ) : (
    ""
  );
  const hasCompletedTrainingHtml = enrollment?.hasPassed ? (
    <div className={styles.completed}>
      {formatMessage({
        id: "prime.catalog.card.complete.label",
        defaultMessage: "Complete",
      })}
    </div>
  ) : (
    enrollmentHtml
  );

  const cardClass = `${styles.card} ${isHovered ? styles.hover : ""}`;
  return (
    <>
      <li role="anchor" className={styles.listItem} onClick={cardClickHandler}>
        <div className={cardClass} onMouseLeave={onMouseLeaveHandler}>
          <div
            style={{ ...cardBgStyle }}
            className={styles.thumbnail}
          ></div>

          {imageUrl ? <div className={styles.backdrop}></div> : ""}

          <div className={styles.detailsContainer}>
            <div className={styles.topBar}>
              <div className={styles.format}>{format}</div>
            </div>

            <div className={styles.bottomBar}>
              <span className={styles.price}>$9009</span>
              <div className={styles.title}>{name}</div>
              <div className={styles.trainingType}>
                {type} - {training.loFormat}
              </div>
              <div
                className={styles.descriptionContainer}
                onMouseEnter={onMouseEnterHandler}
              >
                <div className={styles.extra}>
                  {hasCompletedTrainingHtml || (
                    <div className={styles.extraWrapper}>
                      <div className={styles.sendIcon}>{SEND_SVG()}</div>
                      <div className={styles.extraLabel}>
                        <span>
                          {formatMessage({
                            id: "prime.catalog.card.skills.label",
                            defaultMessage: "Skills",
                          })}
                        </span>
                        <span>
                          {skillsAsString}
                        </span>
                      </div>
                      <div className={styles.extraIcon}>
                        {THREE_DOTS_MENU_SVG()}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.showOnHover}>
                  {descriptionHtml}
                  <div className={styles.skillsContainer}>
                    <span className={styles.skiillsLabel}>
                      {formatMessage({
                        id: "prime.catalog.card.skills.label",
                        defaultMessage: "Skills",
                      })}
                    </span>
                    <span className={styles.skillsValue}>{skillsAsString}</span>
                  </div>
                  <div className={styles.skillsContainer}>
                    {enrollment ? (
                      <>
                        {enrollmentHtml}
                        <div className={styles.percentComplete}>
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
