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
import Calendar from "@spectrum-icons/workflow/Calendar";
import Clock from "@spectrum-icons/workflow/Clock";
import ClockCheck from "@spectrum-icons/workflow/ClockCheck";
import Download from "@spectrum-icons/workflow/Download";
import GlobeGrid from "@spectrum-icons/workflow/GlobeGrid";
import Money from "@spectrum-icons/workflow/Money";
import PinOff from "@spectrum-icons/workflow/PinOff";
import Send from "@spectrum-icons/workflow/Send";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import BookmarkSingleOutline from "@spectrum-icons/workflow/BookmarkSingleOutline";
import BookmarkSingle from "@spectrum-icons/workflow/BookmarkSingle";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { InstanceBadge, Skill } from "../../../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResourceGrade,
  PrimeLoInstanceSummary,
} from "../../../models/PrimeModels";
import {
  ADD_TO_CART,
  ADOBE_COMMERCE,
  CERTIFICATION,
  COURSE,
  ENROLL,
  LEARNING_PROGRAM,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  PREVIEW,
  STARTED,
  WAITING,
} from "../../../utils/constants";
import { modifyTime } from "../../../utils/dateTime";
import {
  getALMAccount,
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  updateURLParams,
} from "../../../utils/global";
import {
  useCanShowRating,
  filterLoReourcesBasedOnResourceType,
} from "../../../utils/hooks";
import { DEFAULT_USER_SVG, LEARNER_BADGE_SVG } from "../../../utils/inline_svg";
import {
  checkIsEnrolled,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
// import { ALMStarRating } from "../../ALMRatings";
import { StarRatingSubmitDialog } from "../../StarRatingSubmitDialog";
import { ALMTooltip } from "../../Common/ALMTooltip";
import { PrimeTrainingPageExtraJobAid } from "../PrimeTrainingPageExtraDetailsJobAids";
import styles from "./PrimeTrainingPageMetadata.module.css";
import { PrimeAccount } from "../../../models/PrimeModels";

const PrimeTrainingPageMetaData: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  showAuthorInfo: string;
  showEnrollDeadline: string;
  enrollmentHandler: () => Promise<PrimeLearningObjectInstanceEnrollment>;
  updateRating: (
    rating: number,
    loInstanceId: any
  ) => Promise<void | undefined>;
  updateBookMark: (
    isBookmarked: boolean,
    loId: any
  ) => Promise<void | undefined>;
  alternateLanguages: Promise<string[]>;
  launchPlayerHandler: () => void;
  addToCartHandler: () => Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }>;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
  isPreviewEnabled: boolean;
}> = ({
  trainingInstance,
  skills,
  training,
  badge,
  instanceSummary,
  showAuthorInfo,
  showEnrollDeadline,
  enrollmentHandler,
  launchPlayerHandler,
  addToCartHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
  isPreviewEnabled,
  alternateLanguages,
  updateRating,
  updateBookMark,
}) => {
  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const { formatMessage, locale } = useIntl();
  const enrollment = training.enrollment;
  const loType = training.loType;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const isPricingEnabled =
    training.price && getALMConfig().usageType === ADOBE_COMMERCE;

  const [isTrainingSynced, setIsTrainingSynced] = useState(true);
  const [isBookMarked, setIsBookMarked] = useState(training.isBookmarked);

  const [alternativesLangAvailable, setAlternativesLangAvailable] = useState<
    string[]
  >([]);

  const isEnrolled = checkIsEnrolled(enrollment);

  const toggle = () => {
    setIsBookMarked((prevState) => !prevState);
    updateBookMark(!isBookMarked, training.id);
  };
  const getBookMarkIcon = (
    <span className={styles.bookMarkIcon}>
      {isBookMarked ? <BookmarkSingle /> : <BookmarkSingleOutline />}
    </span>
  );
  const getBookMarkStatusText = (
    <span className={styles.bookMarkText}>
      {isBookMarked
        ? GetTranslation("alm.text.saved")
        : GetTranslation("alm.text.save")}
    </span>
  );

  const typeOfUnEnrollButton =
    loType === "certification"
      ? GetTranslation("alm.text.unenroll.certification",true)
      : loType === "learningProgram"
      ? GetTranslation("alm.text.unenroll.learningProgram",true)
      : GetTranslation("alm.text.unenroll.course",true);

  let showPreviewButton =
    isPreviewEnabled && training.hasPreview && !isEnrolled;
  const showPriceDetails = isPricingEnabled && enrollment;

  const action: string = useMemo(() => {
    if (enrollment) {
      if (enrollment.state === PENDING_APPROVAL) {
        return "pendingApproval";
      } else if (enrollment.state === PENDING_ACCEPTANCE) {
        return "pendingAcceptance";
      } else if (enrollment.state === WAITING) {
        return "waiting";
      } else if (enrollment.state === STARTED) {
        return "continue";
      } else if (enrollment.progressPercent === 0) {
        return "start";
      } else if (enrollment.progressPercent === 100) {
        return "revisit";
      }
      return "continue";
    } else if (trainingInstance.state === "Retired") {
      return "registerInterest";
    } else if (isPricingEnabled) {
      return "addToCart";
    } else {
      return "enroll";
    }
  }, [enrollment, trainingInstance.state, isPricingEnabled]);

  const enrollmentCount = instanceSummary?.enrollmentCount;
  const seatLimit = instanceSummary?.seatLimit;
  const seatsAvailable =
    seatLimit !== undefined ? seatLimit - (enrollmentCount || 0) : -1;

  const isSeatAvailable = trainingInstance.seatLimit
    ? trainingInstance.seatLimit > 0 && seatsAvailable > 0
    : true;

  const seatsAvailableText = trainingInstance.seatLimit ? (
    seatLimit && seatsAvailable > 0 ? (
      <p style={{ textAlign: "center" }} className={styles.label}>
        {formatMessage(
          {
            id: `alm.overview.seatsAvailable`,
          },
          { x: seatsAvailable }
        )}
      </p>
    ) : (
      seatLimit &&
      seatsAvailable <= 0 && (
        <p style={{ textAlign: "center" }} className={styles.errorText}>
          {formatMessage({
            id: `alm.overview.no.seats.available`,
          })}
        </p>
      )
    )
  ) : (
    ""
  );

  const waitListText =
    enrollment && enrollment.state === WAITING ? (
      <p style={{ textAlign: "center" }} className={styles.label}>
        {formatMessage({
          id: `alm.overview.waitlist`,
        })}
      </p>
    ) : (
      ""
    );

  const actionText = useMemo(() => {
    if (action === "addToCart") {
      return formatMessage(
        {
          id: `alm.addToCart`,
        },
        { x: getFormattedPrice(training.price) }
      );
    }
    return formatMessage({
      id: `alm.overview.button.${action}`,
    });
  }, [action, formatMessage, training.price]);

  const filteredSkills: Skill[] = useMemo(() => {
    let map: any = {};
    let filteredSkills = skills?.filter((item) => {
      if (!map[item.name]) {
        map[item.name] = true;
        return true;
      }
      return false;
    });
    return filteredSkills;
  }, [skills]);

  const unEnrollClickHandler = () => {
    unEnrollmentHandler({ enrollmentId: training.enrollment.id });
  };

  const handleEnrollment = async () => {
    if (trainingInstance.isFlexible) {
      const flexLpLink = `${
        getALMConfig().almBaseURL
      }/app/learner#/learningProgram/${training.id.split(":")[1]}/instance/${
        trainingInstance.id.split("_")[1]
      }`;
      window.open(flexLpLink, "_blank");
    } else {
      storeActionInNonLoggedMode(ENROLL);
      try {
        const enrollment = await enrollmentHandler();
        if (checkIsEnrolled(enrollment)) {
          launchPlayerHandler();
        }
      } catch (e) {}
    }
  };

  const previewHandler = async () => {
    storeActionInNonLoggedMode(PREVIEW);
    launchPlayerHandler();
  };

  useEffect(() => {
    getAlternateLanguages();
  }, [alternateLanguages]);

  const getAlternateLanguages = async () => {
    try {
      setAlternativesLangAvailable(await alternateLanguages);
    } catch (e) {}
  };

  const addToCart = async () => {
    try {
      storeActionInNonLoggedMode(ADD_TO_CART);
      const { error, totalQuantity } = await addToCartHandler();
      if (isPrimeUserLoggedIn) {
        if (error && error.length) {
          let errorKey = "alm.addToCart.general.error";
          error?.forEach((item: any) => {
            if (
              item &&
              item.message &&
              item.message?.includes("exceeds the maximum qty allowed")
            ) {
              errorKey = "alm.overview.added.to.cart.error";
            }
          });
          almAlert(
            true,
            formatMessage({ id: errorKey }, { loType: loType }),
            AlertType.error
          );
        } else {
          getALMObject().updateCart(totalQuantity);
          almAlert(
            true,
            formatMessage({ id: "alm.addedToCart" }),
            AlertType.success
          );
        }
      }
    } catch (e) {}
  };

  //show only if not enrolled
  const showEnrollmentCount =
    !trainingInstance.learningObject.enrollment && enrollmentCount !== undefined
      ? true
      : false;

  const showBadges =
    !trainingInstance.learningObject.enrollment && badge?.badgeUrl;

  const showAuthors =
    showAuthorInfo === "true" &&
    training.authors?.length > 0 &&
    getALMObject().isPrimeUserLoggedIn();
  var legacyAuthorNames = new Set(training.authorNames);
  training.authors?.forEach((author) => {
    legacyAuthorNames.delete(author.name);
  });

  const completionDeadline = trainingInstance.completionDeadline;
  const unenrollmentDeadline = trainingInstance.unenrollmentDeadline;
  const enrollmentDeadline = trainingInstance.enrollmentDeadline;

  const showAfterEnrollmentDeadlines =
    training.enrollment &&
    showEnrollDeadline === "true" &&
    (completionDeadline || unenrollmentDeadline);
  const showEnrollmentDeadline =
    !training.enrollment && trainingInstance.enrollmentDeadline;

  const hasEnrollmentDeadlinePassed = enrollmentDeadline
    ? new Date(enrollmentDeadline) < new Date()
    : false;

  const getUnenrollmentConfirmationString = () => {
    if (isPricingEnabled) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: formatMessage({
              id: "alm.overview.unenroll.confirmationWithRefundInfo",
              defaultMessage:
                "Unenrolling will delete all your progress data and personal information like Notes and Quiz Score (if any).<br><br>Are you sure you want to continue?<br><br>Please contact the Administrator to receive a refund.",
            }),
          }}
        />
      );
    }
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: formatMessage({
            id: "alm.overview.unenroll.confirmationInfo",
            defaultMessage:
              "Unenrolling will delete all your progress data and personal information like Notes and Quiz Score (if any). <br><br> Are you sure you want to continue?",
          }),
        }}
      />
    );
  };

  const unEnrollConfirmationClickHandler = () => {
    const confirmationMessage: any = getUnenrollmentConfirmationString();
    almConfirmationAlert(
      formatMessage({
        id: "alm.overview.unenrollment.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      confirmationMessage,
      formatMessage({
        id: "alm.overview.unenrollment.confirmationYes",
        defaultMessage: "Yes",
      }),
      formatMessage({
        id: "alm.overview.unenrollment.confirmationNo",
        defaultMessage: "No",
      }),
      unEnrollClickHandler
    );
  };

  const showJobAids = training.supplementaryLOs?.length;
  const showResource = training.supplementaryResources?.length;
  const canUnenroll =
    training.enrollment &&
    training.unenrollmentAllowed &&
    !(enrollment.progressPercent === 100);
  const showCertificationDeadline =
    training.enrollment && training.enrollment.completionDeadline;
  const isCertification = loType === CERTIFICATION;

  const enrollmentDeadlineContainer =
    enrollmentDeadline && showEnrollmentDeadline ? (
      <>
        <div className={styles.subtleText}>
          {GetTranslation(`alm.overview.enrollment.deadline`)}
          {modifyTime(trainingInstance.enrollmentDeadline, locale)}
        </div>
      </>
    ) : (
      ""
    );

  const completionDeadlineContainer = completionDeadline ? (
    <div className={styles.subtleText}>
      {GetTranslation(`alm.overview.completion.deadline`)}
      {/* <div className={styles.label}> */}
      {loType === CERTIFICATION
        ? !showCertificationDeadline
          ? formatMessage(
              {
                id: "alm.overview.certification.deadline",
              },
              {
                0: trainingInstance?.completionDeadline?.slice(0, -1),
              }
            )
          : modifyTime(showCertificationDeadline, locale)?.slice(0, -10)
        : modifyTime(trainingInstance.completionDeadline, locale)}
      {/* </div> */}
    </div>
  ) : (
    ""
  );

  const unenrollmentDeadlineContainer =
    unenrollmentDeadline && !showEnrollmentDeadline && canUnenroll ? (
      <>
        <div className={styles.subtleText}>
          {formatMessage({
            id: "alm.overview.unenrollment.deadline",
            defaultMessage: "Unenrollment - ",
          })}
          {modifyTime(trainingInstance.unenrollmentDeadline, locale)}
        </div>
      </>
    ) : (
      ""
    );

  useEffect(() => {
    const computeIsSynced = async () => {
      const account = await getALMAccount();
      if (
        !account ||
        !isPrimeUserLoggedIn ||
        new Date(training.dateCreated) <=
          new Date(account.lastSyncedDateCreatedForMagento)
      ) {
        setIsTrainingSynced(true);
      } else {
        setIsTrainingSynced(false);
      }
    };
    computeIsSynced();
  }, [training.dateCreated, training.price]);

  const trainingNotAvailableForPurchaseText = !isTrainingSynced ? (
    <p style={{ textAlign: "center" }} className={styles.label}>
      {formatMessage(
        {
          id: "alm.training.overview.not.available",
        },
        { training: GetTranslation(`alm.training.${loType}`, true) }
      )}
    </p>
  ) : (
    ""
  );

  const enrollmentDeadlinePassedText = hasEnrollmentDeadlinePassed ? (
    <p style={{ textAlign: "center" }} className={styles.errorText}>
      {formatMessage({
        id: "alm.training.overview.enrollmentDeadline.passed",
      })}
    </p>
  ) : (
    ""
  );

  const mandatoryModulesCount = useMemo(() => {
    let count = 0;
    trainingInstance?.loResources?.forEach((resource) => {
      if (resource.mandatory) {
        count += 1;
      }
    });
    return count;
  }, [trainingInstance?.loResources]);

  const showMandatoryModulesCount =
    training.loType === COURSE && mandatoryModulesCount > 0;

  const showMinimumCompletion =
    training.loResourceCompletionCount &&
    training.loResourceCompletionCount !== trainingInstance.loResources?.length;
  const coreContentModules = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  );
  const minimumCriteria = useMemo(() => {
    let label = "";
    let value = "";
    let completionCount = training.loResourceCompletionCount;

    if (training.loType === COURSE) {
      const totalCount = coreContentModules.length;
      label = GetTranslationsReplaced(
        "alm.overview.course.minimum.criteria.label",
        {
          x: completionCount,
          y: totalCount,
        },
        true
      );
      value = `${completionCount}/${totalCount}`;
    } else if (training.loType === CERTIFICATION) {
      const totalCount = training.subLOs?.length;
      if (totalCount) {
        label = GetTranslationsReplaced(
          "alm.overview.certification.minimum.criteria.label",
          {
            x: completionCount,
            y: totalCount,
          },
          true
        );
        value = `${completionCount}/${totalCount}`;
      }
    }
    return { label, value };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    training.loResourceCompletionCount,
    training.loType,
    training.subLOs?.length,
    trainingInstance,
  ]);

  const coreContentCompleted = useMemo(() => {
    let value = "";
    //shown only for courses in classic
    if (!isEnrolled || training.loType !== COURSE) {
      return value;
    }
    if (training.loType === COURSE) {
      const totalCount = coreContentModules.length;
      let completionCount = 0;
      training.enrollment?.loResourceGrades.forEach(
        (item: PrimeLearningObjectResourceGrade) => {
          if (item.hasPassed) {
            completionCount += 1;
          }
        }
      );

      value = `${completionCount}/${totalCount}`;
    }
    return value;
  }, [
    coreContentModules?.length,
    isEnrolled,
    training.enrollment?.loResourceGrades,
    training.loType,
  ]);
  const trainingsCompleted = useMemo(() => {
    let value = "";
    if (
      !isEnrolled ||
      (training.loType !== LEARNING_PROGRAM &&
        training.loType !== CERTIFICATION)
    ) {
      return value;
    }
    if (
      training.loType === LEARNING_PROGRAM ||
      training.loType === CERTIFICATION
    ) {
      const totalCount = training.subLOs?.length || 0;
      let completionCount = 0;
      training.subLOs?.forEach((lo) => {
        if (lo.enrollment?.hasPassed) {
          completionCount += 1;
        }
      });
      value = `${completionCount}/${totalCount}`;
    }
    return value;
  }, [isEnrolled, training.loType, training.subLOs]);

  useEffect(() => {
    const queryParams = getQueryParamsFromUrl();
    if (
      isPrimeUserLoggedIn &&
      !checkIsEnrolled(training.enrollment) &&
      queryParams?.action
    ) {
      updateURLParams({ action: "" });
      const action = queryParams.action;
      switch (action) {
        case PREVIEW:
          launchPlayerHandler();
          break;
        case ADD_TO_CART:
          addToCart();
          break;
        case ENROLL:
          handleEnrollment();
          break;
      }
    }
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.actionContainer}>
        {action === "registerInterest" && (
          <button className={`almButton secondary ${styles.commonButton}`}>
            {actionText}
          </button>
        )}
        {action === "enroll" && (
          <>
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={handleEnrollment}
              disabled={hasEnrollmentDeadlinePassed}>
              {actionText}
            </button>
            {enrollmentDeadlinePassedText}
            {seatsAvailableText}
          </>
        )}
        {(action === "start" ||
          action === "continue" ||
          action === "revisit") && (
          <>
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={launchPlayerHandler}>
              {actionText}
            </button>
            {waitListText}
          </>
        )}

        {action === "addToCart" && (
          <>
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={addToCart}
              disabled={
                !isTrainingSynced ||
                !isSeatAvailable ||
                hasEnrollmentDeadlinePassed
              }>
              {actionText}
            </button>
            {trainingNotAvailableForPurchaseText}
            {enrollmentDeadlinePassedText}
            {seatsAvailableText}
          </>
        )}
        {action === "pendingApproval" && (
          <>
            <button
              className={`almButton secondary ${styles.commonButton}`}
              disabled={true}>
              {actionText}
            </button>
            <div className={styles.mangerPendingApprovalText}>
              {formatMessage({
                id: "alm.overview.manager.approval.pending",
              })}
            </div>
            {seatsAvailableText}
          </>
        )}

        {action === "pendingAcceptance" && (
          <>
            <button
              className={`almButton secondary ${styles.commonButton}`}
              disabled={true}>
              {actionText}
            </button>

            {seatsAvailableText}
          </>
        )}
        {action === "waiting" && (
          <>
            <button
              className={`almButton secondary ${styles.commonButton}`}
              disabled={true}>
              {actionText}
            </button>

            {waitListText}
          </>
        )}
      </div>
      {showPreviewButton && (
        <div
          className={` ${styles.actionContainer} ${styles.crsStsButtonPreBookSection}`}>
          <div className={styles.backgroundButton}>
            <button
              className={`${styles.previewButton}`}
              onClick={previewHandler}>
              {formatMessage({
                id: `alm.overview.button.preview`,
              })}
            </button>
          </div>
          <div className={styles.preBmSeperator}></div>
          <div className={styles.backgroundButton}>
            <button className={` ${styles.previewButton}`} onClick={toggle}>
              {getBookMarkIcon}
              {getBookMarkStatusText}
            </button>
          </div>
        </div>
      )}
      {!showPreviewButton && (
        <div className={styles.actionContainer}>
          <button className={styles.bookMark} onClick={toggle}>
            {getBookMarkIcon}
            {getBookMarkStatusText}
          </button>
        </div>
      )}

      {/* Rating Container*/}
      {useCanShowRating(training) && isEnrolled && (
        <div
          className={[styles.submitRatingBox, styles.borderContainer].join(
            " "
          )}>
          <StarRatingSubmitDialog
            ratingGiven={
              training.enrollment.rating ? training.enrollment.rating : 0
            }
            updateRating={updateRating}
            training={training}
            trainingInstance={trainingInstance}
          />
        </div>
      )}
      <section className={styles.borderContainer}>
        {showPriceDetails && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <Money />
            </span>
            <div className={styles.innerContainer}>
              <div>
                {formatMessage({
                  id: "alm.purchase.details",
                  defaultMessage: "Purchase Details",
                })}
              </div>
              <div>
                {formatMessage(
                  {
                    id: "alm.training.price",
                    defaultMessage: "Price",
                  },
                  { amount: getFormattedPrice(training.price) }
                )}
              </div>
              <div>{modifyTime(enrollment.dateEnrolled, locale)}</div>
            </div>
          </div>
        )}

        {/* Alternate Languages */}
        {alternativesLangAvailable.length > 0 && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.altLangIcon}>
              <GlobeGrid />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.subtleText}>
                {formatMessage({
                  id: "alm.overview.alternativesAvailable",
                  defaultMessage: "Alternatives Available",
                })}
              </label>
              <ALMTooltip
                message={formatMessage({
                  id: "alm.overview.alternativesAvailable.toolTip",
                  defaultMessage:
                    "You can change the language or the format of the content in the player.",
                })}></ALMTooltip>
              {alternativesLangAvailable?.map((language) => {
                return (
                  <div className={styles.altLang} key={language}>
                    {language}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimum Completion Criteria container */}
        {showMinimumCompletion && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.minimumCriteria}>
              {minimumCriteria.value}
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.subtleText}>
                {formatMessage({
                  id: "alm.overview.minimum.completion.criteria",
                  defaultMessage: "Minimum Completion Criteria",
                })}
              </label>
              <ALMTooltip message={minimumCriteria.label}></ALMTooltip>
            </div>
          </div>
        )}

        {/* Trainings Completed container */}
        {isEnrolled && trainingsCompleted && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.minimumCriteria}>
              {trainingsCompleted}
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.subtleText}>
                {formatMessage({
                  id: "alm.overview.qminimum.completion.criteria",
                  defaultMessage: "Trainings Completed",
                })}
              </label>
            </div>
          </div>
        )}

        {/* Mandatory Modules container */}
        {showMandatoryModulesCount && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.mandatory}>
              {mandatoryModulesCount}
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.subtleText}>
                {GetTranslation("alm.text.required.modules", true)}
              </label>
              <ALMTooltip
                message={GetTranslation(
                  "alm.text.required.modules.tooltip",
                  true
                )}></ALMTooltip>
            </div>
          </div>
        )}

        {/* CORE content completed container */}
        {isEnrolled && coreContentCompleted && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.minimumCriteria}>
              {coreContentCompleted}
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.subtleText}>
                {formatMessage({
                  id: "alm.overview.course.core.completed",
                  defaultMessage: "Core Content Completed",
                })}
              </label>
            </div>
          </div>
        )}

        {/*Deadline container */}
        {(enrollmentDeadline || completionDeadline || unenrollmentDeadline) && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <Calendar />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {formatMessage({
                  id: "alm.overview.deadline",
                  defaultMessage: "Deadline(s)",
                })}
              </label>
              {enrollmentDeadlineContainer}
              {unenrollmentDeadlineContainer}
              {completionDeadlineContainer}
            </div>
          </div>
        )}

        {/* Certificate Type container */}
        {isCertification && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <Clock />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {formatMessage({
                  id: "alm.overview.certification.type",
                  defaultMessage: "Type",
                })}
              </label>
              <div>
                {trainingInstance?.validity ? "Recurring" : "Non Recurring"}
              </div>
            </div>
          </div>
        )}
        {/* Certificate Validity container */}
        {isCertification && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <ClockCheck />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {formatMessage({
                  id: "alm.overview.certification.validity",
                  defaultMessage: "Validity",
                })}
              </label>
              <div>
                {trainingInstance?.validity
                  ? formatMessage(
                      { id: "alm.overview.certification.durationTime" },
                      { 0: trainingInstance?.validity?.slice(0, -1) }
                    )
                  : formatMessage({
                      id: "alm.certification.type",
                      defaultMessage: "Perpetual",
                    })}
              </div>
            </div>
          </div>
        )}

        {/* enrollment container */}
        {showEnrollmentCount && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <UserGroup />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {formatMessage(
                  {
                    id: "alm.overview.enrollment.count",
                  },
                  {
                    0: enrollmentCount,
                  }
                )}
              </label>
            </div>
          </div>
        )}
        {/* Badge Container */}
        {showBadges && (
          <div className={styles.commonContainer}>
            <span
              aria-hidden="true"
              className={`${styles.icon} ${styles.badge}`}>
              {LEARNER_BADGE_SVG()}
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {GetTranslation("alm.overview.badge", true)}
              </label>
              {
                <img
                  src={badge.badgeUrl}
                  alt="badge"
                  width={"50px"}
                  height={"50px"}
                />
              }
            </div>
          </div>
        )}
        {/* Modules Completed container */}
        {/* {showModulesCompleted && (
        <div className={styles.commonContainer}>
          <span className={styles.moduleCompleted}>0/1</span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>Course completed</label>
          </div>
        </div>
      )} */}
        {/* Skills Container */}
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.sendIcon}>
            <Send></Send>
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {GetTranslation(
                `alm.overview.skills.achieve.level.${loType}`,
                true
              )}
            </label>
            {filteredSkills?.map((skill) => {
              return (
                <div className={styles.subtleText} key={skill.name}>
                  {skill.name} - {skill.levelName}{" "}
                  {formatMessage(
                    { id: "alm.training.skill.credits" },
                    { x: skill.credits }
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Author */}
        {showAuthors && (
          <div className={styles.authorContainer}>
            <label className={styles.label}>
              {GetTranslation("alm.text.author(s)")}
            </label>
            {Array.from(legacyAuthorNames).map((legacyAuthorName) => {
              return (
                <div className={styles.authors}>
                  <span className={styles.cpauthorcircle}>
                    {DEFAULT_USER_SVG()}
                  </span>
                  <div className={styles.innerContainer}>
                    <p className={styles.authorName}>{legacyAuthorName}</p>
                  </div>
                </div>
              );
            })}
            {training.authors?.map((author) => {
              return (
                <div key={author.id}>
                  <div className={styles.authors}>
                    <span aria-hidden="true">
                      <img src={author.avatarUrl} aria-hidden="true" alt="" />
                    </span>
                    <div className={styles.innerContainer}>
                      <p className={styles.subtleText}>{author.name}</p>
                    </div>
                  </div>
                  {/* <p className={styles.authorName}>{author.bio}</p> */}
                </div>
              );
            })}
          </div>
        )}
        {/* JOB Aid container */}
        {showJobAids && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <PinOff />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {GetTranslation("alm.training.jobAid", true)}
              </label>
              <div>
                {training.supplementaryLOs.map((item) => {
                  return item.instances[0].loResources.map((loResource) => {
                    return loResource.resources.map((resource) => (
                      <PrimeTrainingPageExtraJobAid
                        resource={resource}
                        training={item}
                        enrollmentHandler={enrollmentHandler}
                        key={item.id}
                        unEnrollmentHandler={unEnrollmentHandler}
                        jobAidClickHandler={jobAidClickHandler}
                      />
                    ));
                  });
                })}
              </div>
            </div>
          </div>
        )}
        {/* Resources container */}
        {showResource && (
          <div className={styles.commonContainer}>
            <span aria-hidden="true" className={styles.icon}>
              <Download />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {formatMessage({
                  id: "alm.text.resources",
                  defaultMessage: "Resources",
                })}
              </label>
              <div>
                {training.supplementaryResources.map((item) => {
                  return training.enrollment ? (
                    <a
                      href={item.location}
                      download
                      className={styles.supplymentaryLoName}
                      target="_blank"
                      rel="noreferrer"
                      key={item.id}>
                      <span className={styles.resourceName}>{item.name}</span>
                    </a>
                  ) : (
                    <span className={styles.subtleText}>{item.name}</span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* UnEnroll button container */}
      {canUnenroll && (
        <div className={styles.commonContainer}>
          <span
            aria-hidden="true"
            className={styles.icon}
            style={{ visibility: "hidden" }}>
            <Download />
          </span>
          <div className={styles.bottomContainer}>
            <button
              className={`almButton ${styles.unenrollButton}`}
              onClick={unEnrollConfirmationClickHandler}>
              {typeOfUnEnrollButton}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
export default PrimeTrainingPageMetaData;
