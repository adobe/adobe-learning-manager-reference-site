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
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/aria-role */
import { ProgressBar } from "@adobe/react-spectrum";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { SEND_SVG, THREE_DOTS_MENU_SVG } from "../../../utils/inline_svg";
import { GetTranslation } from "../../../utils/translationService";
import styles from "./PrimeTrainingCard.module.css";

export const formatMap: any = {
  Elearning: "alm.catalog.card.self.paced",
  Activity: "alm.catalog.card.activity",
  Blended: "alm.catalog.card.blended",
  "Virtual Classroom": "alm.catalog.card.virtual.classroom",
  Classroom: "alm.catalog.card.classroom",
  "Self Paced": "alm.catalog.card.self.paced",
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
        id: "alm.catalog.card.complete.label",
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
    return type ? GetTranslation(`alm.catalog.card.${type}`, true) : "";
  }, [type]);
  let priceLabel = "";
  const price = training.price;
  // if (training.price?.value) {
  if (price) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      // currency: training.price?.currency,
      currency: "USD",
    });

    priceLabel = formatter.format(price);
  }

  const extraIconHtml = (
    <div className={styles.extraIcon}>{THREE_DOTS_MENU_SVG()}</div>
  );

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
              {priceLabel && <span className={styles.price}>{priceLabel}</span>}
              <div className={styles.title}>{name}</div>
              <div className={styles.trainingType}>
                {trainingTypeLabel} {fomatLabel ? `- ${fomatLabel}` : ""}
              </div>
              <div
                className={styles.descriptionContainer}
                onMouseEnter={onMouseEnterHandler}
              >
                <div className={styles.extra}>
                  {hasCompletedTrainingHtml ||
                    (skillsAsString ? (
                      <div className={styles.extraWrapper}>
                        <div className={styles.sendIcon}>{SEND_SVG()}</div>
                        <div className={styles.extraLabel}>
                          <span>
                            {GetTranslation(
                              "alm.catalog.card.skills.label",
                              true
                            )}
                          </span>
                          <span>{skillsAsString}</span>
                        </div>
                        {extraIconHtml}
                      </div>
                    ) : (
                      extraIconHtml
                    ))}
                </div>
                <div className={styles.showOnHover}>
                  {descriptionHtml}
                  {skillsAsString ? (
                    <div className={styles.skillsContainer}>
                      <span className={styles.skiillsLabel}>
                        {GetTranslation("alm.catalog.card.skills.label", true)}
                      </span>
                      <span className={styles.skillsValue}>
                        {skillsAsString}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className={styles.skillsContainer}>
                    {enrollment ? (
                      <>
                        {enrollmentHtml}
                        <div className={styles.percentComplete}>
                          {formatMessage(
                            {
                              id: "alm.catalog.card.progress.percent",
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
