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
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import { JOBAID } from "../../../utils/constants";
import { modifyTimeDDMMYY } from "../../../utils/dateTime";
import { navigateToLogin } from "../../../utils/global";
import { useCanShowRating } from "../../../utils/hooks";
import { getFormattedPrice, isCommerceEnabled } from "../../../utils/price";
import { GetTranslation, formatMap } from "../../../utils/translationService";
import { ALMStarRating } from "../../ALMRatings";
import styles from "./PrimeTrainingList.module.css";

const PrimeTrainingList: React.FC<{
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
    listThumbnailBgStyle,
    enrollment,
    cardClickHandler,
  } = useTrainingCard(training);
  const { formatMessage, locale } = useIntl();

  const avgRating = training?.rating?.averageRating;
  const ratingsCount = training?.rating?.ratingsCount;

  const skillsAsString = skillNames;
  const descriptionHtml = description ? (
    <p className={styles.description}>{description}</p>
  ) : (
    ""
  );
  const enrollmentHtml = enrollment ? (
    <>
      <ProgressBar
        showValueLabel={false}
        value={enrollment.progressPercent}
        UNSAFE_className={styles.progressBar}
      />{" "}
      <span className={styles.progressValueText}>
        {enrollment.progressPercent}%{" "}
        {formatMessage({
          id: "alm.catalog.card.complete.label",
          defaultMessage: "Complete",
        })}
      </span>
    </>
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

  const formatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);
  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`alm.training.${type}`, true) : "";
  }, [type]);
  let priceLabel = "";
  const price = training.price;

  const isPaidLo = () => {
    if (price && isCommerceEnabled()) {
      priceLabel =
        formatMessage({ id: "alm.catalog.filter.price.label" }) +
        ": " +
        getFormattedPrice(price);
      return true;
    }
    return false;
  };

  const showStateButton = () => {
    return (
      <button
        className={styles.exploreButton}
        onClick={
          guest
            ? () => {
                navigateToLogin(signUpURL, training.id, almDomain);
              }
            : cardClickHandler
        }
      >
        {enrollment
          ? formatMessage({
              id: "alm.text.visit",
            })
          : formatMessage({
              id: "alm.text.explore",
            })}
      </button>
    );
  };

  return (
    <>
      <div className={styles.listItem}>
        <div className={styles.listRow}>
          <div
            style={{ ...listThumbnailBgStyle }}
            className={styles.loThumbnail}
          ></div>
          <div className={styles.loDetails}>
            <div
              className={styles.loName}
              onClick={
                guest
                  ? () => {
                      navigateToLogin(signUpURL, training.id, almDomain);
                    }
                  : cardClickHandler
              }
            >
              {name}
            </div>
            <div className={styles.loType}>
              <span className={styles.loType}>{trainingTypeLabel}</span>
              <span className={styles.separatorDot}></span>
              <span className={styles.loDeliveryType}>{formatLabel}</span>
            </div>
          </div>
          {isPaidLo() && (
            <div className={styles.priceDiv}>
              {isPaidLo() && <span className={styles.price}>{priceLabel}</span>}
            </div>
          )}
        </div>
        {descriptionHtml}
        <div className={styles.loAdditionalData}>
          <div className={styles.loSkillsData}>
            {(hasCompletedTrainingHtml || skillsAsString) && (
              <>
                <span>
                  {GetTranslation("alm.catalog.card.skills.label", true)}
                </span>
                : <span>{skillsAsString}</span>
              </>
            )}
          </div>
          <div className={styles.loEnrollmentData}>
            <div className={styles.loEnrollData}>
              <div className={styles.starRating}>
                {useCanShowRating(training) ? (
                  avgRating !== 0 ? (
                    <ALMStarRating
                      avgRating={avgRating}
                      ratingsCount={ratingsCount}
                    />
                  ) : (
                    <p>{GetTranslation("alm.text.noRating.listView")}</p>
                  )
                ) : (
                  ""
                )}
              </div>
              {enrollment && type !== JOBAID ? (
                <>
                  {enrollmentHtml}
                  {completionDeadline && (
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
                  )}
                </>
              ) : (
                ""
              )}
            </div>
            <div className={styles.actionButton}>{showStateButton()}</div>
          </div>
        </div>
      </div>
      <hr className={styles.primeVerticalSeparator}></hr>
    </>
  );
};

export default PrimeTrainingList;
