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
import { JOBAID } from "../../../utils/constants";
import { modifyTimeDDMMYY } from "../../../utils/dateTime";
import { navigateToLogin } from "../../../utils/global";
import { SEND_SVG, THREE_DOTS_MENU_SVG } from "../../../utils/inline_svg";
import { getFormattedPrice, isCommerceEnabled } from "../../../utils/price";
import { formatMap, GetTranslation } from "../../../utils/translationService";
import { ALMStarRating } from "../../ALMRatings";
import styles from "./PrimeTrainingCard.module.css";
import { useTrainingPage } from "../../../hooks";
import { useJobAids } from "../../../hooks/useJobAids";
import { useCanShowRating } from "../../../utils/hooks";

const PrimeTrainingCard: React.FC<{
  training: PrimeLearningObject;
  guest?: boolean;
  signUpURL?: string;
  almDomain?: string;
}> = ({ training, guest, signUpURL, almDomain }) => {
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

  const { enrollmentHandler, unEnrollmentHandler, jobAidClickHandler } =
    useTrainingPage(training.id, "", {}, true);
  const {
    enroll,
    unenroll,
    jobAidAddToListMsg,
    jobAidRemoveToListMsg,
    nameClickHandler,
    isEnrolled,
  } = useJobAids(
    training,
    enrollmentHandler,
    unEnrollmentHandler,
    jobAidClickHandler
  );

  const [isHovered, setIsHovered] = useState(false);
  const { formatMessage, locale } = useIntl();
  const ratingsCount = training?.rating?.ratingsCount;
  const avgRating = training?.rating?.averageRating;

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const addJobAid = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    enroll();
  };

  const removeJobAid = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
    unenroll();
  };

  const skillsAsString = skillNames;
  const descriptionHtml = description ? (
    <p className={styles.description} aria-label={formatMessage({id:'alm.text.description'},{description:description})} tabIndex={0}>{description}</p>
  ) : (
    ""
  );

  const jobAidOptions =
    training.loType === JOBAID ? (
      <div>
        <div onClick={nameClickHandler} className={styles.jobAidAction}>
          {GetTranslation("alm.jobaid.view")}
        </div>
        {!isEnrolled ? (
          <a
            href="javascript:void(0)"
            role="button"
            onClick={(e) => {
              addJobAid(e);
            }}
          >
            <div className={styles.jobAidAction}>{jobAidAddToListMsg}</div>
          </a>
        ) : (
          <a
            href="javascript:void(0)"
            role="button"
            onClick={(e) => {
              removeJobAid(e);
            }}
          >
            <div className={styles.jobAidAction}>{jobAidRemoveToListMsg}</div>
          </a>
        )}
        {isEnrolled &&
          training.instances![0] !== undefined &&
          training.instances![0].loResources !== undefined &&
          training.instances![0].loResources![0].resources !== undefined &&
          training.instances![0].loResources![0].resources![0].contentType !==
            "OTHER" &&
          training.instances![0].loResources![0].resources![0].downloadUrl && (
            <a
              href={
                training.instances![0].loResources![0].resources![0].downloadUrl
              }
              role="button"
              download
              target="_blank"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className={styles.jobAidAction}>
                {GetTranslation("alm.text.download")}
              </div>
            </a>
          )}
      </div>
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
    type !== JOBAID ? (
      <div className={styles.completed}>
        {formatMessage({
          id: "alm.catalog.card.complete.label",
          defaultMessage: "Complete",
        })}
      </div>
    ) : (
      ""
    )
  ) : (
    enrollmentHtml
  );

  const completionDeadline = useMemo(() => {
    if (!enrollment) return "";
    const { completionDeadline, loInstance } = enrollment;
    if (completionDeadline) {
      return completionDeadline;
    }
    if (loInstance?.completionDeadline) {
      return loInstance?.completionDeadline;
    }
  }, [enrollment]);

  const cardClass = `${styles.card} ${isHovered ? styles.hover : ""}`;
  const fomatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);
  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`alm.training.${type}`, true) : "";
  }, [type]);
  let priceLabel = "";
  const price = training.price;

  if (price && isCommerceEnabled()) {
    priceLabel = getFormattedPrice(price);
  }
  const extraIconHtml = (
    <div className={styles.extraIcon}>{THREE_DOTS_MENU_SVG()}</div>
  );

  return (
    <>
      <li className={styles.listItem}>
        <div
          className={cardClass}
          onMouseLeave={onMouseLeaveHandler}
          onClick={
            guest 
              ? () => {
                  navigateToLogin(signUpURL, training.id, almDomain);
                }
              : cardClickHandler
          }
          tabIndex={0}
          aria-label={formatMessage({id:"alm.label.view"},{name:name})}
          role='link'
        >
          <div style={{ ...cardBgStyle }} className={styles.thumbnail}></div>

          {imageUrl ? <div className={styles.backdrop}></div> : ""}

          <div className={styles.detailsContainer}>
            <div className={styles.bottomBar}>
              <div className={styles.title}>{name}</div>
              <div className={styles.trainingType}>{trainingTypeLabel}</div>
              {priceLabel && <span className={styles.price}>{priceLabel}</span>}
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
                  {jobAidOptions}
                  {descriptionHtml}
                  {completionDeadline ? (
                    <div className={styles.skillsContainer}>
                      <span className={styles.dueDateLabel}>
                        {formatMessage(
                          {
                            id: "alm.catalog.card.due.date",
                          },
                          {
                            "0": modifyTimeDDMMYY(completionDeadline, locale),
                          }
                        )}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}

                  {type !== JOBAID && skillsAsString ? (
                    <>
                      <div className={styles.skillsContainer}>
                        <span className={styles.skiillsLabel}>
                          {GetTranslation(
                            "alm.catalog.card.skills.label",
                            true
                          )}
                        </span>
                        <span className={styles.skillsValue}>
                          {skillsAsString}
                        </span>
                      </div>
                    </>
                  ) : (
                    ""
                  )}

                  {enrollment && type !== JOBAID ? (
                    <div
                      className={styles.skillsContainer}
                      style={{ marginBottom: 0 }}
                    >
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
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>

            <div className={styles.topBar}>
              <div className={styles.format}>{fomatLabel}</div>
              {useCanShowRating(training) ? (
                <ALMStarRating
                  avgRating={avgRating}
                  ratingsCount={ratingsCount}
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default PrimeTrainingCard;
