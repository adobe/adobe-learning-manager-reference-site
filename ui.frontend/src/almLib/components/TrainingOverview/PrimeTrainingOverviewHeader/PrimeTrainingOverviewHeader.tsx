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
import { ProgressBar } from "@adobe/react-spectrum";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLocalizationMetadata,
} from "../../../models/PrimeModels";
import { checkIsEnrolled } from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  formatMap,
  GetTranslationReplaced,
} from "../../../utils/translationService";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { ALMStarRating } from "../../ALMRatings";
import styles from "./PrimeTrainingOverviewHeader.module.css";
import { SHARE_ICON } from "../../../utils/inline_svg";
import Link from "@spectrum-icons/workflow/Link";
import Email from "@spectrum-icons/workflow/Email";
import Close from "@spectrum-icons/workflow/Close";
import BookmarkSingleOutline from "@spectrum-icons/workflow/BookmarkSingleOutline";
import BookmarkSingle from "@spectrum-icons/workflow/BookmarkSingle";
import { PrimeLearningObject, PrimeLoInstanceSummary } from "../../../models/PrimeModels";
import { getALMConfig, getALMObject } from "../../../utils/global";
import {
  CERTIFICATION,
  COMPLETED,
  COURSE,
  ENGLISH_LOCALE,
  ENROLLED,
  EXTERNAL_STR,
  INTERNAL_STR,
  LEARNING_PROGRAM,
  PENDING_APPROVAL,
  REJECTED,
  TRAINING_INSTANCE_ID_STR,
} from "../../../utils/constants";
import {
  getLoId,
  getLoName,
  getBreadcrumbPath,
  getTrainingUrl,
  hasSingleActiveInstance,
  useCanShowRating,
} from "../../../utils/hooks";
import { useAccount } from "../../../hooks/account/useAccount";
import { GetFormattedDate } from "../../../utils/dateTime";
import {
  getCertificationProofPendingMessage,
  getCertificationStatusMessage,
  getTrainingLink,
} from "../../../utils/lo-utils";
import { ratingFormatter } from "../../Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper";
import { useUserContext } from "../../../contextProviders/userContextProvider";
interface trainingOverviewProps {
  format: string;
  title: string;
  color: string;
  bannerUrl: string;
  showProgressBar?: boolean;
  enrollment?: PrimeLearningObjectInstanceEnrollment;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  instanceSummary: PrimeLoInstanceSummary;
  updateBookMark: (isBookmarked: boolean, loId: any) => Promise<void | undefined>;
}

const PrimeTrainingOverviewHeader = (props: trainingOverviewProps) => {
  const {
    format,
    title,
    color,
    bannerUrl,
    showProgressBar = false,
    enrollment,
    training,
    trainingInstance,
    updateBookMark,
    instanceSummary,
  } = props;
  const { account } = useAccount();
  const { formatMessage } = useIntl();
  const { locale } = useIntl();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCopiedUrlMsg, setShowCopiedUrlMsg] = useState(false);
  const [isBookMarked, setIsBookMarked] = useState(training.isBookmarked);
  const [almAlert] = useAlert();
  let menuRef = useRef<HTMLInputElement>(null);
  const showRating = useCanShowRating(training);
  const enrollmentCount = instanceSummary?.enrollmentCount;
  const progressPercent = enrollment?.progressPercent;
  //show only if not enrolled
  const showEnrollmentCount = !enrollment && enrollmentCount !== undefined ? true : false;
  const isExternalCertification = training.loType === CERTIFICATION && training.isExternal;
  const previousExpiryDate = enrollment?.previousExpiryDate;
  const gracePeriod = training?.gracePeriod;
  const displayProgressBar =
    !isExternalCertification && showProgressBar && enrollment && checkIsEnrolled(enrollment);
  const isCertificationExpired = useMemo(() => {
    if (!previousExpiryDate) return false;
    return new Date() > new Date(previousExpiryDate);
  }, [previousExpiryDate]);
  const starRatingCount = training?.rating?.ratingsCount;

  const shouldDisplayExpiredMessage = useMemo(() => {
    const isCertificationCompleted = enrollment?.state === COMPLETED;
    return !isCertificationCompleted && isCertificationExpired && enrollment;
  }, [enrollment?.state, isCertificationExpired]);
  const isCertificationInNotificationPeriod = useMemo(() => {
    if (!previousExpiryDate) return false;

    const previousVersionExpiryDate = new Date(previousExpiryDate);
    const notificationPeriodStartDate = new Date();
    notificationPeriodStartDate.setDate(notificationPeriodStartDate.getDate() - gracePeriod);
    const currentDate = new Date();
    return currentDate > notificationPeriodStartDate && currentDate < previousVersionExpiryDate;
  }, [previousExpiryDate, gracePeriod]);

  const shouldDisplayExpiringMessage = useMemo(() => {
    return (
      isCertificationInNotificationPeriod &&
      enrollment &&
      enrollment?.state != COMPLETED &&
      !(enrollment?.progressPercent === 100)
    );
  }, [enrollment?.state, isCertificationInNotificationPeriod]);

  const certificationStatusForExternalCertIfExpired = useMemo(
    () =>
      previousExpiryDate &&
      getCertificationStatusMessage(
        false,
        training,
        previousExpiryDate,
        isExternalCertification,
        locale
      ),
    [enrollment]
  );

  const certificationStatusForExternalCertIfExpiring = useMemo(
    () =>
      previousExpiryDate &&
      getCertificationStatusMessage(
        true,
        training,
        previousExpiryDate,
        isExternalCertification,
        locale
      ),
    [enrollment]
  );

  const externalCertificationStatus = useMemo(() => {
    const state = enrollment?.state;
    if (!isExternalCertification) return "";

    switch (state) {
      case ENROLLED:
        return getCertificationProofPendingMessage(training);
      case REJECTED:
        return GetTranslation("msg.proof.rejected");
      case PENDING_APPROVAL:
        return GetTranslation("msg.approvalPending");
      case COMPLETED:
        return GetTranslation("alm.certification.completed", true);
      default:
        return "";
    }
  }, [enrollment]);

  const certificationStatusMessage = useMemo(() => {
    if (isExternalCertification) {
      if (shouldDisplayExpiredMessage) {
        return certificationStatusForExternalCertIfExpired;
      } else if (shouldDisplayExpiringMessage) {
        return certificationStatusForExternalCertIfExpiring;
      }
      return externalCertificationStatus;
    }
    return "";
  }, [shouldDisplayExpiredMessage, shouldDisplayExpiringMessage, externalCertificationStatus]);

  const internalCertificationStatusMessage = useMemo(() => {
    if (!isExternalCertification && shouldDisplayExpiredMessage) {
      return GetTranslation("msg.validityExpired.internal", true);
    }
    if (shouldDisplayExpiringMessage && previousExpiryDate && !isExternalCertification) {
      return GetTranslationReplaced(
        "msg.validityExpiration",
        GetFormattedDate(previousExpiryDate, locale),
        true
      );
    }
    return "";
  }, [isExternalCertification, previousExpiryDate, shouldDisplayExpiredMessage]);

  function getSentenceCaseOfString(str: string) {
    //Doing this for the overview page loName text
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const getCourseFormat = () => {
    if (!trainingInstance?.loResources?.length) {
      return "";
    }
    const loModules = trainingInstance.loResources;
    const firstModuleType = loModules[0]?.resourceType;
    for (const module of trainingInstance.loResources) {
      if (module.resourceType !== firstModuleType) {
        return GetTranslation("alm.catalog.card.blended", true);
      }
    }
    return GetTranslation(formatMap[firstModuleType], true);
  };

  const formatLabel = useMemo(() => {
    switch (training.loType) {
      case COURSE:
        return format ? getCourseFormat().toUpperCase() : "";
      case LEARNING_PROGRAM:
        return GetTranslation(`alm.training.learningProgram`, true);
      case CERTIFICATION:
        const certType = isExternalCertification ? EXTERNAL_STR : INTERNAL_STR;
        return certType + " " + GetTranslation("alm.training.certification", true);
    }
  }, [format]);

  const toggle = () => {
    setIsBookMarked((prevState: any) => !prevState);
    updateBookMark(!isBookMarked, training.id);
  };

  const getBookMarkIcon = (
    <span className={styles.bookMarkIcon}>
      {isBookMarked ? <BookmarkSingle /> : <BookmarkSingleOutline />}
    </span>
  );

  useEffect(() => {
    if (showCopiedUrlMsg) {
      almAlert(
        true,
        formatMessage({
          id: "alm.copyUrlSuccess",
          defaultMessage: "URL copied successfully",
        }),
        AlertType.success
      );
    }
  }, [showCopiedUrlMsg, almAlert, formatMessage]);

  const handleClickOutside = (e: any) => {
    if (menuRef && menuRef.current && !menuRef.current.contains(e.target)) {
      setShowShareMenu(false);
    }
  };

  const avgRating = training?.rating?.averageRating;
  const isAvgRatingAvailable = avgRating && avgRating != 0;

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
  }, []);

  function copyURL() {
    const url = getTrainingLink(training.id, account.id);
    navigator.clipboard.writeText(url);
    setShowCopiedUrlMsg(true);
    setShowShareMenu(false);
    setTimeout(() => {
      setShowCopiedUrlMsg(false);
    }, 2000);
  }

  function sendEmail() {
    // const learnerAppOrigin = getALMConfig().almBaseURL;
    const shareUrlLink = getTrainingLink(training.id, account.id);

    //const shareUrlLink = `${learnerAppOrigin}${trainingOverview}/trainingId/${trainingId}`;
    const subject = title;
    window.location.href = `mailto:?subject= ${formatMessage(
      {
        id: "alm.text.training",
        defaultMessage: "Training",
      },
      {
        training: GetTranslation(`alm.training.${training.loType}`, true),
        subject: subject,
      }
    )}&body=${formatMessage(
      {
        id: "alm.text.trainingLink",
        defaultMessage: "Training Link - ",
      },
      {
        training: GetTranslation(`alm.training.${training.loType}`, true),
        shareUrlLink: shareUrlLink,
      }
    )}`;
    setShowShareMenu(false);
  }
  const { name, description } = useMemo((): PrimeLocalizationMetadata => {
    return getPreferredLocalizedMetadata(training.localizedMetadata, contentLocale);
  }, [training.localizedMetadata, contentLocale]);

  const almTrainingShareInTeams = () => {
    const shareEvent = {
      eventType: "shareLoInTeams",
      data: {
        url: getTrainingUrl(window.location.href),
        name: name,
        description: description,
      },
    };
    console.log(shareEvent);
    window.parent.postMessage(shareEvent, "*");
  };

  const shareHandler = () => {
    if (getALMConfig().handleShareExternally) {
      return almTrainingShareInTeams();
    }
    setShowShareMenu(prevState => !prevState);
  };

  const ratingCountLabel = ratingFormatter(starRatingCount);
  const displayAvgStarRating = () => {
    if (showRating && isAvgRatingAvailable) {
      return (
        <div className={styles.averageRatingCount}>
          <ALMStarRating avgRating={avgRating} ratingsCount={starRatingCount} />
          <div className={styles.ratingContainer}>({ratingCountLabel})</div>
        </div>
      );
    }
  };

  const enrollmentCountButtonDisplay = () => {
    return (
      showEnrollmentCount && (
        <>
          <label>{enrollmentCount}</label>
          <span className={styles.enrollmentLabel}>
            {GetTranslation("alm.overview.enrollment.count")}
          </span>
        </>
      )
    );
  };
  const formatRatingsAndEnrollments = (id: string, values: any) => formatMessage({ id }, values);

  const getAriaLabelForRatingsAndEnrollments = useMemo(() => {
    if (isAvgRatingAvailable && avgRating) {
      if (showEnrollmentCount) {
        return formatRatingsAndEnrollments("alm.label.ratingsAndEnrollments", {
          x: avgRating,
          y: 5,
          ratingsCount: training?.rating?.ratingsCount,
          count: enrollmentCount,
        });
      }
      return formatRatingsAndEnrollments("alm.label.ratings", {
        x: avgRating,
        y: 5,
        ratingsCount: training?.rating?.ratingsCount,
      });
    } else if (showEnrollmentCount) {
      return formatRatingsAndEnrollments("alm.label.enrollments", { count: enrollmentCount });
    }
  }, [avgRating, isAvgRatingAvailable, showEnrollmentCount]);

  const avgRatingDisplay = displayAvgStarRating();
  const enrollmentDisplay = enrollmentCountButtonDisplay();
  const ratingAndEnrollmentLabel = getAriaLabelForRatingsAndEnrollments;

  const shareButtonDisplay = () => {
    return (
      <div>
        <button
          className={`${styles.shareButton}`}
          onClick={shareHandler}
          aria-label={formatMessage({
            id: "alm.header.text.sharePop",
            defaultMessage: "share, menu pop-up",
          })}
        >
          <span aria-hidden="true">{SHARE_ICON()}</span>
          <span className={styles.shareText}>{GetTranslation("alm.text.share")}</span>
        </button>
        {!showShareMenu && (
          <button
            className={
              getALMConfig().handleShareExternally
                ? `${styles.disableShareInTeamsMobile}`
                : `${styles.share}`
            }
            onClick={shareHandler}
          >
            <span aria-hidden="true" className={styles.xshareIcon}>
              {SHARE_ICON()}
            </span>
          </button>
        )}
        {showShareMenu && (
          <div>
            <button className={styles.boxButton} onClick={copyURL} role="link">
              <span aria-hidden="true" className={styles.urlIcon}>
                <Link />
              </span>
              <span className={styles.shareText}>{GetTranslation("alm.text.shareUrl")}</span>
            </button>
            <button className={styles.boxButton} onClick={sendEmail}>
              <span aria-hidden="true" className={styles.urlIcon}>
                <Email />
              </span>
              <span className={styles.shareText}>{GetTranslation("alm.text.shareViaEmail")}</span>
            </button>
            <button className={`${styles.share}`} onClick={shareHandler}>
              <span aria-hidden="true" className={styles.xshareIcon}>
                <Close />
              </span>
            </button>
            <button className={styles.box} onClick={copyURL}>
              <span aria-hidden="true" className={styles.xurlIcon}>
                <Link />
              </span>
            </button>
            <button className={styles.box} onClick={sendEmail}>
              <span aria-hidden="true" className={styles.xurlIcon}>
                <Email />
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const primaryEnrollment = training.enrollment;
  const hasMultipleInstances = !hasSingleActiveInstance(training);

  const showParentBreadCrumbs = () => {
    const { parentPath, currentPath } = getBreadcrumbPath();
    if (parentPath.length === 0) {
      return;
    }
    return (
      <div className={styles.breadcrumbParent}>
        {parentPath.map((loDetails: string, index: number) => {
          const loName = decodeURI(getLoName(loDetails));
          let loId = getLoId(loDetails);
          let loInstanceId = "";
          const instanceIdPath = `/${TRAINING_INSTANCE_ID_STR}/`;
          if (loId.indexOf(instanceIdPath) > -1) {
            const [id, instanceId] = loId.split(instanceIdPath);
            loId = id;
            loInstanceId = instanceId;
          }
          return (
            <React.Fragment key={`breadcrumb-${index}`}>
              <button
                className={styles.breadcrumbLink}
                onClick={() => getALMObject().navigateToTrainingOverviewPage(loId, loInstanceId)}
                title={getSentenceCaseOfString(loName)}
              >
                {loName}
              </button>
              {index <= parentPath.length - 1 && (
                <b className={styles.breadcrumbArrow}>&nbsp; &gt; &nbsp;</b>
              )}
            </React.Fragment>
          );
        })}
        {(primaryEnrollment && primaryEnrollment.loInstance) || !hasMultipleInstances ? (
          ""
        ) : (
          <button
            className={styles.breadcrumbLink}
            onClick={() => {
              getALMObject().navigateToInstancePage(training.id);
            }}
          >
            {GetTranslation("alm.breadcrumb.all.instances", true)}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.breadcrumbMobile}>{showParentBreadCrumbs()}</div>
      <div
        className={styles.header}
        style={
          bannerUrl
            ? {
                background: `linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0)),url(${bannerUrl}) no-repeat `,
              }
            : { backgroundColor: color }
        }
      >
        <div className={styles.headingContainer}>
          <div className={styles.left}>
            <div className={styles.formatMobile}>{formatLabel}</div>
            <div className={styles.titleBlock}>
              <div className={styles.avgRatingOverviewMobile} data-automationid="avgRating-mobile">
                {displayAvgStarRating()}
              </div>
              <div className={styles.breadcrumbDesktop}>{showParentBreadCrumbs()}</div>
              <h1
                className={styles.title}
                id={title}
                aria-label={`${GetTranslation(`alm.training.${training.loType}`, true)} ${title}`}
                title={title}
                data-automationid={title}
                data-skip="skip-target"
                tabIndex={0}
              >
                {getSentenceCaseOfString(title)}
              </h1>
              <div className={styles.certificationStatus}>{certificationStatusMessage}</div>
              <div className={styles.certificationStatus}>{internalCertificationStatusMessage}</div>
              <div className={styles.format}>{formatLabel}</div>
            </div>
            {displayProgressBar && (
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  {formatMessage({
                    id: "alm.text.progress",
                    defaultMessage: "Progress",
                  })}
                  :
                </div>
                <ProgressBar
                  showValueLabel={false}
                  value={progressPercent}
                  UNSAFE_className={styles.progressBar}
                />
                <span
                  className={styles.percent}
                  data-automationid={`progress-value-${progressPercent}`}
                >
                  {progressPercent}%
                </span>
              </div>
            )}
          </div>
          <div className={styles.right}>
            {(avgRatingDisplay || enrollmentDisplay) && (
              <div
                className={styles.ratingAndEnrollment}
                aria-label={ratingAndEnrollmentLabel}
                title={ratingAndEnrollmentLabel}
              >
                <div className={styles.ratingAndEnrollmentText} aria-hidden="true">
                  {showRating && avgRating !== 0 && (
                    <div data-automationid="avgRating">{avgRatingDisplay}</div>
                  )}
                  {avgRatingDisplay && enrollmentDisplay && " | "}{" "}
                  <div className={styles.enrollmentHeader} data-automationid="enrollmentCount">
                    {enrollmentDisplay}
                  </div>
                </div>
              </div>
            )}
            <button className={styles.bookMark} onClick={toggle}>
              {getBookMarkIcon}
            </button>
            <div ref={menuRef} className={`${styles.xshare}`}>
              {shareButtonDisplay()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default PrimeTrainingOverviewHeader;
