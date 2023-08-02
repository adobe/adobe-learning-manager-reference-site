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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { ProgressBar } from "@adobe/react-spectrum";
import Calendar from "@spectrum-icons/workflow/Calendar";
import Location from "@spectrum-icons/workflow/Location";
import Money from "@spectrum-icons/workflow/Money";
import User from "@spectrum-icons/workflow/User";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { COMPLETED, WAITING } from "../../../utils/constants";
import { formatTime, GetFormattedDate } from "../../../utils/dateTime";
import { getALMConfig } from "../../../utils/global";
import { checkIsEnrolled } from "../../../utils/overview";
import { getFormattedPrice } from "../../../utils/price";
import { GetTranslation, formatMap } from "../../../utils/translationService";
import styles from "./PrimeInstanceItem.module.css";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";

const PrimeInstanceItem = (props: any) => {
  const {
    id,
    name,
    format,
    showLocationAndInstructor,
    startDate,
    completionDate,
    enrollByDate,
    location,
    instructorsName,
    selectInstanceHandler,
    locale,
    price,
    enrollment,
    showProgressBar,
    seatLimit,
    seatsAvailable,
  } = props;
  const { formatMessage } = useIntl();

  const selectHandler = () => {
    selectInstanceHandler(id);
  };
  const startDateValue = GetFormattedDate(startDate, locale);
  const startTimeValue = formatTime(startDate, locale);
  const completionDateValue = GetFormattedDate(completionDate, locale);
  const completionTimeValue = formatTime(completionDate, locale);
  const enrollByDateValue = GetFormattedDate(enrollByDate, locale);

  const fomatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);

  const getInstanceName = () => {
    return (
      <a className={styles.instanceName} onClick={selectHandler}>
        {name}
      </a>
    );
  };

  const seatsAvailableText = seatLimit ? (
    <>
      &nbsp; &#124; &nbsp;
      {seatsAvailable > 0 ? (
        <span className={styles.seatAvailable}>
          {formatMessage(
            {
              id: `alm.overview.seatsAvailable`,
            },
            { x: seatsAvailable }
          )}
        </span>
      ) : enrollment && enrollment.state === WAITING ? (
        <span>
          {formatMessage({
            id: `alm.overview.waitlist`,
          })}
        </span>
      ) : (
        <span className={styles.seatNotAvailable}>
          {formatMessage({
            id: `alm.overview.no.seats.available`,
          })}
        </span>
      )}
    </>
  ) : (
    ""
  );

  const otherInstructorNames = () => {
    const names = instructorsName.join(", ");
    return names;
  };

  const otherLocations = () => {
    const names = location.join(", ");
    return names;
  };

  return (
    <li className={styles.instanceListItem}>
      <div className={styles.instanceNameWrapper}>
        {getInstanceName()}
        <p className={styles.instanceLoFormat}>
          {fomatLabel}
          {seatsAvailableText}
        </p>

        {/* Instructors List */}
        {showLocationAndInstructor && instructorsName.length > 0 && (
          <p className={styles.instructorsName} title={otherInstructorNames()}>
            <span className={styles.aboveMobile}>
              {formatMessage({
                id: "alm.instance.instructors",
                defaultMessage: "Instructors",
              })}
              {" : "}
            </span>
            <span
              className={`${styles.mobileOnly} ${styles.icon}`}
              aria-hidden="true"
            >
              <User />
            </span>
            {instructorsName[0]}
            {instructorsName.length > 1 && (
              <>
                <span>, </span>
                <span style={{ textDecoration: "underline" }}>
                  +{instructorsName.length - 1}
                </span>
              </>
            )}
          </p>
        )}

        {/* Course Progress Bar */}
        {showProgressBar && enrollment && checkIsEnrolled(enrollment) && (
          <div className={styles.progressContainer}>
            <ProgressBar
              showValueLabel={false}
              value={enrollment.progressPercent}
              UNSAFE_className={styles.progressBar}
            />
            {enrollment.state === COMPLETED ? (
              <>
                &ensp;
                <p className={styles.courseCompleted}>
                  <CheckmarkCircle aria-hidden="true" />
                </p>
                <p className={styles.completed}>
                  &nbsp;|&nbsp;
                  {formatMessage({
                    id: "alm.catalog.filter.completed",
                    defaultMessage: "Completed",
                  })}
                </p>
              </>
            ) : (
              <span className={styles.percent}>
                {enrollment.progressPercent}%
              </span>
            )}
          </div>
        )}

        {/* Enrollment Deadline */}
        {!enrollment && enrollByDateValue && (
          <div className={styles.instanceLoFormat}>
            {formatMessage({
              id: "alm.instance.enrolBy.label",
              defaultMessage: "Enrol by: ",
            })}
            {enrollByDateValue}
          </div>
        )}
      </div>

      {/* Starting Date for CR/VCR course */}
      {showLocationAndInstructor && (
        <div className={styles.dateWrapper}>
          {startDateValue && (
            <p className={styles.startDate}>
              <span
                className={`${styles.mobileOnly} ${styles.icon}`}
                aria-hidden="true"
              >
                <Calendar />
              </span>
              {startDateValue} {`(${startTimeValue})`}
            </p>
          )}
        </div>
      )}

      {/* Completion Deadline */}
      {!showLocationAndInstructor && (
        <div className={styles.completionDateWrapper}>
          {completionDateValue && (
            <p className={styles.completioDate}>
              <span
                className={`${styles.mobileOnly} ${styles.icon}`}
                aria-hidden="true"
              >
                <Calendar />
              </span>
              {completionDateValue} {`(${completionTimeValue})`}
            </p>
          )}
        </div>
      )}

      {/* List of CR/VCR locations */}
      {showLocationAndInstructor && (
        <div className={styles.locationWrapper} title={otherLocations()}>
          {location.length > 0 && (
            <p className={styles.startDate}>
              <span
                className={`${styles.mobileOnly} ${styles.icon}`}
                aria-hidden="true"
              >
                <Location />
              </span>
              {location[0]}
              {location.length > 1 && (
                <>
                  <span>, </span>
                  <span style={{ textDecoration: "underline" }}>
                    +{location.length - 1} more
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      )}

      {/* Training price */}
      {price && (
        <div className={styles.priceWrapper}>
          <p className={styles.startDate}>
            <span
              className={`${styles.mobileOnly} ${styles.icon}`}
              aria-hidden="true"
            >
              <Money />
            </span>
            {getFormattedPrice(price)}
          </p>
        </div>
      )}

      {/* View instance button */}
      <div className={styles.actionWrapper}>
        <button
          onClick={selectHandler}
          className={`almButton secondary ${styles.button}`}
        >
          {formatMessage({
            id: "alm.instance.view",
            defaultMessage: "View",
          })}
        </button>
      </div>
    </li>
  );
};

export default PrimeInstanceItem;
