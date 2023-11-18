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
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { COMPLETED, WAITING } from "../../../utils/constants";
import {  GetFormattedDate } from "../../../utils/dateTime";
import { checkIsEnrolled } from "../../../utils/overview";
import {
  GetTranslation,
  formatMap,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import styles from "./PrimeInstanceCard.module.css";
import { THREE_DOTS_MENU_SVG } from "../../../utils/inline_svg";

const PrimeInstanceCard = (props: any) => {
  const {
    id,
    name,
    type,
    format,
    completionDate,
    selectInstanceHandler,
    locale,
    enrollment,
    showProgressBar,
    seatLimit,
    seatsAvailable,
    cardBgStyle,
    extension,
    extensionClickHandler,
    instanceId,
  } = props;

  const { formatMessage } = useIntl();

  const selectHandler = () => {
    selectInstanceHandler(id);
  };
  const completionDateValue = GetFormattedDate(completionDate, locale);

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const extraIconHtml = (
    <div className={styles.extraIcon}>{THREE_DOTS_MENU_SVG()}</div>
  );

  const skillsAsString = props.skill;

  const enrollmentHtml = enrollment ? (
    <ProgressBar
      showValueLabel={false}
      value={enrollment.progressPercent}
      UNSAFE_className={styles.progressBar}
    />
  ) : (
    ""
  );

  const seatsAvailableText = seatLimit ? (
    <>
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

  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`alm.training.${type}`, true) : "";
  }, [type]);

  const fomatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);

  const cardClass = `${styles.card} ${isHovered ? styles.hover : ""}`;
  const extraBlock = `${isHovered ? styles.hideBlock : styles.extra}`;
  const hoverBlock = `${isHovered ? styles.showOnHover : styles.hideBlock}`;

  const extensionLocalizedMetadata = useMemo(() => {
    return extension
      ? getPreferredLocalizedMetadata(extension.localizedMetadata, locale)
      : ({} as any);
  }, [extension, locale]);

  return (
    <div className={cardClass} tabIndex={-1} aria-label={name}>
      <div
        className={styles.cardTileView}
        onClick={() => selectInstanceHandler(id)}
        onMouseLeave={onMouseLeaveHandler}
        onBlur={onMouseLeaveHandler}
      >
        <div className={styles.thumbnail} style={{ ...cardBgStyle }}>
          <div className={styles.bottomBar} tabIndex={-1}>
            <div className={!isHovered ? styles.loInfo : ""}>
              <div className={styles.title}>{name}</div>
              <div className={!isHovered ? styles.format : styles.formatHover}>
                <span>{trainingTypeLabel} </span>
                <span> &middot; </span>
                <span>{fomatLabel}</span>
              </div>
            </div>
            <div
              className={styles.descriptionContainer}
              onMouseEnter={onMouseEnterHandler}
              onFocus={onMouseEnterHandler}
              tabIndex={-1}
              aria-label={name}
            >
              {/* Course Progress Bar */}

              <div className={extraBlock}>
                {!enrollment || enrollment?.state === WAITING ? (
                  <div className={styles.instanceLoFormat}>
                    {seatsAvailableText}
                  </div>
                ) : (
                  <></>
                )}

                {showProgressBar &&
                enrollment &&
                checkIsEnrolled(enrollment) ? (
                  <div className={styles.progressContainer}>
                    {enrollment.state === COMPLETED ? (
                      <>
                        <p className={styles.completed}>
                          {formatMessage({
                            id: "alm.catalog.filter.completed",
                            defaultMessage: "Completed",
                          })}
                        </p>
                      </>
                    ) : (
                      <ProgressBar
                        showValueLabel={false}
                        value={enrollment.progressPercent}
                        UNSAFE_className={styles.progressBar}
                      />
                    )}
                  </div>
                ) : (
                  <div className={styles.extraWrapper} tabIndex={-1}>
                    {extraIconHtml}
                  </div>
                )}
              </div>
              <div className={hoverBlock} tabIndex={-1}>
                {skillsAsString ? (
                  <>
                    <div className={styles.skillsContainer} tabIndex={-1}>
                      <span className={styles.skiillsLabel}>
                        {GetTranslation("alm.catalog.card.skills.label", true)}
                      </span>
                      <span className={styles.skillsValue}>
                        {skillsAsString}
                      </span>
                    </div>
                  </>
                ) : (
                  ""
                )}

                {enrollment ? (
                  <>
                    <div className={styles.skillsContainer}>
                      {enrollmentHtml}
                      <div className={styles.percentComplete}>
                        {formatMessage(
                          {
                            id: "alm.catalog.card.progress.percent",
                            defaultMessage: `${enrollment?.progressPercent}% completes`,
                          },
                          { "0": enrollment?.progressPercent }
                        )}
                        <span className={styles.forLeftSpace}>|</span>
                        <span
                          className={styles.enrolledSelectButton}
                          onClick={selectHandler}
                          onKeyDownCapture={(event: any) => {
                            if (event.key === "Enter") {
                              return selectHandler();
                            }
                          }}
                          tabIndex={0}
                        >
                          {GetTranslation("alm.instance.select", false)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.selectBlock}>
                    <span
                      className={styles.unenrolledSelectButton}
                      onClick={selectHandler}
                      onKeyDownCapture={(event: any) => {
                        if (event.key === "Enter") {
                          return selectHandler();
                        }
                      }}
                      tabIndex={0}
                    >
                      {GetTranslation("alm.instance.select", true)}
                    </span>
                  </div>
                )}
                {extension && (
                  <a
                    className={styles.enrolledSelectButton}
                    onClick={(event) =>
                      extensionClickHandler(instanceId, event)
                    }
                    href="javascript:void(0)"
                  >
                    {extensionLocalizedMetadata?.label}
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* Completion Deadline */}

          <div className={styles.topBar}>
            <div
              className={
                !isHovered
                  ? styles.completionDateWrapper
                  : styles.completionDateWrapperHovered
              }
            >
              {completionDateValue ? (
                <p>
                  <span
                    className={`${styles.mobileOnly} ${styles.icon}`}
                    aria-hidden="true"
                  >
                    <Calendar />
                  </span>
                  {completionDateValue}
                </p>
              ) : (
                <p>{GetTranslation("alm.instance.noDeadLine", true)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeInstanceCard;
