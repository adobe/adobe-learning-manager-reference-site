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
  PrimeLearningObjectInstanceEnrollment,
  PrimeLocalizationMetadata,
} from "../../../models/PrimeModels";
import { checkIsEnrolled } from "../../../utils/overview";
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  formatMap,
} from "../../../utils/translationService";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { ALMStarRating } from "../../ALMRatings";
import styles from "./PrimeTrainingOverviewHeader.module.css";
import Reply from "@spectrum-icons/workflow/Reply";
import Link from "@spectrum-icons/workflow/Link";
import Email from "@spectrum-icons/workflow/Email";
import Close from "@spectrum-icons/workflow/Close";
import BookmarkSingleOutline from "@spectrum-icons/workflow/BookmarkSingleOutline";
import BookmarkSingle from "@spectrum-icons/workflow/BookmarkSingle";
import { transform } from "@babel/core";
import { PrimeLearningObject } from "../../../models/PrimeModels";
import {
  getALMConfig,
  getALMObject,
  navigateToLoInTeamsApp,
} from "../../../utils/global";
import {
  COURSE,
  LEARNING_PROGRAM,
  PARENT_PATH_QUERY_PARAM,
} from "../../../utils/constants";
import { useCanShowRating } from "../../../utils/hooks";

interface trainingOverviewProps {
  format: string;
  title: string;
  color: string;
  bannerUrl: string;
  showProgressBar?: boolean;
  enrollment?: PrimeLearningObjectInstanceEnrollment;
  training: PrimeLearningObject;
  updateBookMark: (
    isBookmarked: boolean,
    loId: any
  ) => Promise<void | undefined>;
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
    updateBookMark,
  } = props;
  const { formatMessage } = useIntl();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCopiedUrlMsg, setShowCopiedUrlMsg] = useState(false);
  const [isBookMarked, setIsBookMarked] = useState(training.isBookmarked);
  const [almAlert] = useAlert();
  let menuRef = useRef<HTMLInputElement>(null);
  const showRating = useCanShowRating(training);

  const formatLabel = useMemo(() => {
    if (training.loType === COURSE) {
      return format ? GetTranslation(`${formatMap[format]}`, true) : "";
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
  }, [showCopiedUrlMsg]);

  const handleClickOutside = (e: any) => {
    if (menuRef && menuRef.current && !menuRef.current.contains(e.target)) {
      setShowShareMenu(false);
    }
  };

  const avgRating = training?.rating?.averageRating;

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
  }, []);

  function copyURL() {
    navigator.clipboard.writeText(window.location.href);
    setShowCopiedUrlMsg(true);
    setShowShareMenu(false);
    setTimeout(() => {
      setShowCopiedUrlMsg(false);
    }, 2000);
  }

  function sendEmail() {
    // const learnerAppOrigin = getALMConfig().almBaseURL;
    const shareUrlLink = window.location.href;
    const trainingOverview = getALMConfig().trainingOverviewPath;
    const trainingId = training.id;
    //const shareUrlLink = `${learnerAppOrigin}${trainingOverview}/trainingId/${trainingId}`;
    const subject = title;
    window.location.href = `mailto:?subject= ${formatMessage(
      {
        id: "alm.text.training",
        defaultMessage: "Training",
      },
      { subject: subject }
    )}&body=${formatMessage(
      {
        id: "alm.text.trainingLink",
        defaultMessage: "Training Link - ",
      },
      { shareUrlLink: shareUrlLink }
    )}`;
    setShowShareMenu(false);
  }

  const { locale } = useIntl();

  const { name, description } = useMemo((): PrimeLocalizationMetadata => {
    return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
  }, [training.localizedMetadata, locale]);

  const almTrainingShareInTeams = () => {
    const shareEvent = {
      eventType: "shareLoInTeams",
      data: {
        url: window.location.href,
        name: name,
        description: description,
      },
    };
    console.log(shareEvent);
    window.parent.postMessage(shareEvent, "*");
  };

  const shareHandler = () => {
    if (getALMConfig().isTeamsApp) {
      return almTrainingShareInTeams();
    }
    setShowShareMenu((prevState) => !prevState);
  };

  const displayAvgStarRating = () => {
    if (showRating && avgRating !== 0) {
      return (
        <ALMStarRating
          avgRating={avgRating}
          ratingsCount={training?.rating?.ratingsCount}
        />
      );
    }
  };
  const shareButtonDisplay = () => {
    return (
      <div>
        <button className={`${styles.shareButton}`} onClick={shareHandler}>
          <span aria-hidden="true" className={styles.shareIcon}>
            <Reply />
          </span>
          {GetTranslation("alm.text.share")}
        </button>
        {!showShareMenu && (
          <button className={`${styles.share}`} onClick={shareHandler}>
            <span aria-hidden="true" className={styles.xshareIcon}>
              <Reply />
            </span>
          </button>
        )}
        {showShareMenu && (
          <div>
            <button className={styles.boxButton} onClick={copyURL}>
              <span aria-hidden="true" className={styles.urlIcon}>
                <Link />
              </span>
              {GetTranslation("alm.text.shareUrl")}
            </button>
            <button className={styles.boxButton} onClick={sendEmail}>
              <span aria-hidden="true" className={styles.urlIcon}>
                <Email />
              </span>
              {GetTranslation("alm.text.shareViaEmail")}
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

  const isParentPathQueryParam = () => {
    return window.location.href.indexOf(PARENT_PATH_QUERY_PARAM) > -1;
  };

  const getLoDetails = () => {
    return window.location.href.split(PARENT_PATH_QUERY_PARAM)[1].split(",");
  };

  const getLoId = (loDetails: string) => {
    return loDetails.split("::")[0];
  };

  const getLoName = (loDetails: string) => {
    return loDetails.split("::")[1];
  };

  const navigateToLo = (trainingId: string, index: number) => {
    let rootParent = index === 0;
    let parentLoDetails = "";
    if (!rootParent && isParentPathQueryParam()) {
      parentLoDetails = getLoDetails()[0];
    }
    if (getALMConfig().isTeamsApp) {
      navigateToLoInTeamsApp(trainingId, "", parentLoDetails, true);
    } else {
      getALMObject().navigateToTrainingOverviewPage(
        trainingId,
        "",
        parentLoDetails,
        true
      );
    }
  };

  const showParentBreadCrumbs = () => {
    if (isParentPathQueryParam()) {
      let loDetailsArray = getLoDetails();
      return (
        <div className={styles.breadcrumbParent}>
          {loDetailsArray.map((loDetails, index) => {
            return (
              <a
                className={styles.breadcrumbLink}
                onClick={() => navigateToLo(getLoId(loDetails), index)}>
                {decodeURI(getLoName(loDetails))}
                {index < loDetailsArray.length - 1 && <span>&gt;</span>}
              </a>
            );
          })}
        </div>
      );
    }
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
        }>
        <div className={styles.headingContainer}>
          <div className={styles.left}>
            <div className={styles.formatMobile}>{formatLabel}</div>
            <div className={styles.titleBlock}>
              <div className={styles.avgRatingOverviewMobile}>
                {displayAvgStarRating()}
              </div>
              <div className={styles.breadcrumbDesktop}>
                {showParentBreadCrumbs()}
              </div>
              <h1
                className={styles.title}
                id={title}
                aria-label={title}
                title={title}
                data-automationid={title}>
                {title}
              </h1>
              <div className={styles.format}>
                <p>{formatLabel}</p>
              </div>
            </div>
            {showProgressBar && enrollment && checkIsEnrolled(enrollment) && (
              <div className={styles.progressContainer}>
                <ProgressBar
                  showValueLabel={false}
                  value={enrollment.progressPercent}
                  UNSAFE_className={styles.progressBar}
                />
                <span className={styles.percent}>
                  {enrollment.progressPercent}%
                </span>
              </div>
            )}
          </div>
          <div className={styles.right}>
            {useCanShowRating(training) && avgRating !== 0 && (
              <div className={styles.avgRatingOverview}>
                {displayAvgStarRating()}
                <p className={styles.ratingText}>
                  {GetTranslation("alm.text.ratings")}
                </p>
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
