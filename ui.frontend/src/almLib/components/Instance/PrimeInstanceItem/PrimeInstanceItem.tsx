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
import { COMPLETED, ENGLISH_LOCALE, WAITING } from "../../../utils/constants";
import { formatTime, GetFormattedDate } from "../../../utils/dateTime";
import { checkIsEnrolled } from "../../../utils/overview";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  formatMap,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import styles from "./PrimeInstanceItem.module.css";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import { useUserContext } from "../../../contextProviders/userContextProvider";

const PrimeInstanceItem = (props: any) => {
  const {
    id,
    name,
    format,
    showStartDateAndInstructor,
    showLocation,
    showCompletionDateColumn,
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
    extension,
    extensionClickHandler,
    instanceId,
    hasCrVcModule,
    waitlistPosition,
    instanceLanguage,
  } = props;
  const { formatMessage } = useIntl();

  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

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
      <a
        tabIndex={0}
        className={styles.instanceName}
        onClick={selectHandler}
        data-automationid={`component:instance-details-list:::selectInstance:::${name}`}
      >
        {name}
      </a>
    );
  };

  const extensionLocalizedMetadata = useMemo(() => {
    if (!extension) {
      return {} as any;
    }
    return getPreferredLocalizedMetadata(extension.localizedMetadata, contentLocale);
  }, [extension, contentLocale]);

  const seatsAvailableText = seatLimit ? (
    <>
      {seatsAvailable > 0 ? (
        <span className={styles.label}>
          {formatMessage({
            id: `alm.overviewseatsAvailableMsg`,
          })}
          {": "}
          <span className={styles.value}>{seatsAvailable}</span>
        </span>
      ) : enrollment && enrollment.state === WAITING ? (
        <span>
          {formatMessage({
            id: `alm.overview.waitlist.position`,
          })}
          {waitlistPosition}
        </span>
      ) : (
        <span className={styles.seatNotAvailable}>
          {formatMessage({
            id: `alm.overview.no.seats.available`,
          })}
        </span>
      )}
    </>
  ) : hasCrVcModule ? (
    <>
      <span className={styles.label}>
        {formatMessage({
          id: `alm.overviewseatsAvailableMsg`,
        })}
      </span>
    </>
  ) : (
    ""
  );

  const languageText = instanceLanguage ? (
    <p className={styles.languageInfo}>
      <span className={styles.label}>
        {formatMessage({
          id: `alm.text.language`,
        })}
        {": "}
        <span className={styles.value}>{instanceLanguage}</span>
      </span>
    </p>
  ) : null;

  const otherInstructorNames = () => {
    const names = instructorsName.slice(1).join(", ");
    return names;
  };

  const otherLocations = () => {
    const names = location.join(", ");
    return names;
  };

  return (
    <div className={styles.instanceListItem} role="row">
      <div role="cell" className={styles.instanceNameWrapper}>
        {getInstanceName()}
        <p className={styles.instanceLoFormat}>{fomatLabel}</p>
        <p className={styles.seatsInfo}>
          {(!enrollment || enrollment?.state === WAITING) && seatsAvailableText}
        </p>
        {languageText}
        {/* Instructors List */}
        {showStartDateAndInstructor && instructorsName.length > 0 && (
          <p className={styles.instructorsName} title={otherInstructorNames()}>
            <span className={styles.aboveMobile}>
              {formatMessage({
                id: "alm.instance.instructors",
                defaultMessage: "Instructors",
              })}
              {": "}
            </span>
            <span className={`${styles.mobileOnly} ${styles.icon}`} aria-hidden="true">
              <User />
            </span>
            {instructorsName[0]}
            {instructorsName.length > 1 && (
              <>
                <span>, </span>
                <span style={{ textDecoration: "underline" }}>+{instructorsName.length - 1}</span>
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
              <span className={styles.percent}>{enrollment.progressPercent}%</span>
            )}
          </div>
        )}

        {/* Enrollment Deadline */}
        {!enrollment && enrollByDateValue && (
          <p className={styles.label}>
            {formatMessage({
              id: "alm.instance.enrolBy.label",
              defaultMessage: "Enroll by",
            })}
            {": "}
            <span className={styles.value}>{enrollByDateValue}</span>
          </p>
        )}
      </div>

      <div className={styles.middleSection}>
        {/* Starting Date for CR/VCR course */}
        {showStartDateAndInstructor && (
          <div role="cell" className={styles.dateWrapper}>
            {startDateValue && (
              <p className={styles.startDate}>
                <span className={`${styles.mobileOnly} ${styles.icon}`} aria-hidden="true">
                  <Calendar />
                </span>
                {startDateValue} <br />
                {`(${startTimeValue})`}
              </p>
            )}
          </div>
        )}

        {/* Completion Deadline */}
        {showCompletionDateColumn && (
          <div role="cell" className={styles.completionDateWrapper}>
            {completionDateValue && (
              <p className={styles.completionDate}>
                <span className={`${styles.mobileOnly} ${styles.icon}`} aria-hidden="true">
                  <Calendar />
                </span>
                {completionDateValue} <br /> {`(${completionTimeValue})`}
              </p>
            )}
          </div>
        )}

        {/* List of CR/VCR locations */}
        {showLocation && (
          <div role="cell" className={styles.locationWrapper} title={otherLocations()}>
            {location.length > 0 && (
              <p className={styles.startDate}>
                <span className={`${styles.mobileOnly} ${styles.icon}`} aria-hidden="true">
                  <Location />
                </span>
                {location[0]}
                {location.length > 1 && (
                  <>
                    <span> </span>
                    <span style={{ textDecoration: "underline" }}>+{location.length - 1} more</span>
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {/* Training price */}
        {price && (
          <div role="cell" className={styles.priceWrapper}>
            <p className={styles.startDate}>
              <span className={`${styles.mobileOnly} ${styles.icon}`} aria-hidden="true">
                <Money />
              </span>
              {getFormattedPrice(price)}
            </p>
          </div>
        )}
      </div>

      {/* Select instance button */}
      <div role="cell" className={styles.actionWrapper}>
        <button
          onClick={selectHandler}
          className={`almButton secondary ${styles.buttonLabel}`}
          data-automationid={`component:instance-details-list:::selectInstance:::${name}`}
        >
          {formatMessage({
            id: "alm.instance.select",
            defaultMessage: "Select",
          })}
        </button>
        {extension && (
          <a
            className={styles.extensionLabel}
            onClick={event => extensionClickHandler(instanceId, event)}
            tabIndex={0}
          >
            {extensionLocalizedMetadata?.label}
          </a>
        )}
      </div>
    </div>
  );
};

export default PrimeInstanceItem;
