/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/aria-role */
import { useMemo, useState } from "react";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { useIntl } from "react-intl";
import { ProgressBar } from "@adobe/react-spectrum";
import { GetTranslation } from "../../../utils/translationService";

import styles from "./PrimeTrainingCard.module.css";
import { SEND_SVG, THREE_DOTS_MENU_SVG } from "../../../utils/inline_svg";

export const formatMap: any = {
  "Self Paced": "prime.catalog.card.self.paced",
  Activity: "prime.catalog.card.activity",
  Blended: "prime.catalog.card.blended",
  "Virtual Classroom": "prime.catalog.card.virtual.classroom",
  Elearning: "prime.catalog.card.elearning",
  Classroom: "prime.catalog.card.classroom",
};
const PrimeTrainingCard: React.FC<{
  training: PrimeLearningObject;
}> = ({ training }) => {
  const {
    format,
    type,
    skillNames,
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

  const skillsAsString = skillNames?.join(",");
  const descriptionHtml = description ? (
    <p className={styles.description}>{description}</p>
  ) : (
    ""
  );
  const enrollmentHtml = enrollment ? (
    <ProgressBar
      showValueLabel={false}
      value={enrollment.progressPercent}
      UNSAFE_className={styles.progressBar}
    />
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
  const fomatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);
  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`prime.catalog.card.${type}`, true) : "";
  }, [type]);
  return (
    <>
      <li className={styles.listItem}>
        <a
          className={cardClass}
          onMouseLeave={onMouseLeaveHandler}
          href={"#"}
          onClick={cardClickHandler}
        >
          <div style={{ ...cardBgStyle }} className={styles.thumbnail}></div>

          {imageUrl ? <div className={styles.backdrop}></div> : ""}

          <div className={styles.detailsContainer}>
            <div className={styles.topBar}>
              <div className={styles.format}>{fomatLabel}</div>
            </div>

            <div className={styles.bottomBar}>
              {/* <span className={styles.price}>$9009</span> */}
              <div className={styles.title}>{name}</div>
              <div className={styles.trainingType}>
                {trainingTypeLabel} - {fomatLabel}
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
                          {GetTranslation(
                            "prime.catalog.card.skills.label",
                            true
                          )}
                        </span>
                        <span>{skillsAsString}</span>
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
                      {GetTranslation("prime.catalog.card.skills.label", true)}
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
        </a>
      </li>
    </>
  );
};

export default PrimeTrainingCard;
