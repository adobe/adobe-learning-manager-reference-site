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
  ACTIVITY,
  ADD_TO_CART,
  ADOBE_COMMERCE,
  CERTIFICATION,
  CLASSROOM,
  COMPLETED,
  COURSE,
  ENROLL,
  LEARNING_PROGRAM,
  MANAGER_APPROVAL,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  PREVIEW,
  RETIRED,
  STARTED,
  VIRTUAL_CLASSROOM,
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
  hasSingleActiveInstance,
  getEnrolledInstancesCount,
  getEnrollment,
  isEnrolledInAutoInstance,
} from "../../../utils/hooks";
import {
  DEFAULT_USER_SVG,
  INSTANCE_ICON,
  LEARNER_BADGE_SVG,
} from "../../../utils/inline_svg";
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
import React from "react";
import { checkIfEnrollmentDeadlineNotPassed, checkIfUnenrollmentDeadlinePassed } from "../../../utils/instance";

const PrimeTrainingPageMetaData: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  showAuthorInfo: string;
  showEnrollDeadline: string;
  enrollmentHandler: Function;
  updateRating: (
    rating: number,
    loInstanceId: any
  ) => Promise<void | undefined>;
  updateBookMark: (
    isBookmarked: boolean,
    loId: any
  ) => Promise<void | undefined>;
  alternateLanguages: Promise<string[]>;
  launchPlayerHandler: Function;
  addToCartHandler: () => Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }>;
  updateEnrollmentHandler: Function;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
  isPreviewEnabled: boolean;
  waitlistPosition: string;
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
  updateEnrollmentHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
  isPreviewEnabled,
  alternateLanguages,
  updateRating,
  updateBookMark,
  waitlistPosition,
}) => {
  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const { formatMessage, locale } = useIntl();

  const primaryEnrollment = training.enrollment;
  const enrollment = getEnrollment(training, trainingInstance);
  const enrolledInstancesCount = getEnrolledInstancesCount(training);

  const loType = training.loType;
  const subLOs = training.subLOs;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const isPricingEnabled =
    training.price && getALMConfig().usageType === ADOBE_COMMERCE;
  const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);

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

  const isInstanceSwitchEnabled =
    training.instanceSwitchEnabled && primaryEnrollment?.state !== COMPLETED;
  const isMultiEnrollmentEnabled = training.multienrollmentEnabled;
  const hasMultipleInstances = !hasSingleActiveInstance(training);

  const isPendingApproval = primaryEnrollment?.state === PENDING_APPROVAL;
  const requireManagerApproval = training.enrollmentType === MANAGER_APPROVAL;
  const isPrimaryEnrollmentWaitlisted = primaryEnrollment?.state === WAITING;

  const typeOfUnEnrollButton =
    loType === CERTIFICATION
      ? GetTranslation("alm.text.unenroll.certification", true)
      : loType === LEARNING_PROGRAM
      ? GetTranslation("alm.text.unenroll.learningProgram", true)
      : hasMultipleInstances &&
        isMultiEnrollmentEnabled &&
        enrolledInstancesCount > 1
      ? GetTranslation("alm.text.unenroll.instance", true)
      : GetTranslation("alm.text.unenroll.course", true);

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
    } else if (trainingInstance.state === RETIRED) {
      return "registerInterest";
    } else if (isPricingEnabled) {
      return "addToCart";
    } else if (isPrimaryEnrollmentWaitlisted) {
      return "updateEnrollment";
    } else {
      return "enroll";
    }
  }, [enrollment, trainingInstance.state, isPricingEnabled]);

  const completionDeadline = trainingInstance.completionDeadline;
  const unenrollmentDeadline = trainingInstance.unenrollmentDeadline;
  const enrollmentDeadline = trainingInstance.enrollmentDeadline;

  const enrollmentCount = instanceSummary?.enrollmentCount;
  const seatLimit = instanceSummary?.seatLimit;
  const seatsAvailable =
    seatLimit !== undefined ? seatLimit - (enrollmentCount || 0) : -1;

  const isSeatAvailable = trainingInstance.seatLimit
    ? trainingInstance.seatLimit > 0 && seatsAvailable > 0
    : true;

  const isEnrollingToWaitlisted =
    !enrollment && seatLimit !== undefined && !isSeatAvailable;

  const hasEnrollmentDeadlinePassed = enrollmentDeadline
    ? new Date(enrollmentDeadline) < new Date()
    : false;

  const isEnrollButtonDisabled =
    hasEnrollmentDeadlinePassed ||
    (primaryEnrollment &&
      !isPrimaryEnrollmentWaitlisted &&
      isEnrollingToWaitlisted) ||
    (!isInstanceSwitchEnabled &&
      !isMultiEnrollmentEnabled &&
      primaryEnrollment &&
      primaryEnrollment?.loInstance.id !== trainingInstance.id &&
      !isPrimaryEnrollmentWaitlisted) ||
    isPendingApproval;

  const seatsAvailableText = trainingInstance.seatLimit ? (
    seatLimit && seatsAvailable > 0 ? (
      <p className={`${styles.label} ${styles.centerAlign}`}>
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
        <>
          <p className={`${styles.errorText} ${styles.centerAlign}`}>
            {formatMessage({
              id: `alm.overview.no.seats.available`,
            })}
          </p>
          {!isEnrollButtonDisabled && (
            <p className={styles.centerAlign}>
              {formatMessage({
                id: `alm.overview.to.be.waitlisted`,
              })}
            </p>
          )}
        </>
      )
    )
  ) : (
    ""
  );

  const waitListText =
    enrollment && enrollment.state === WAITING ? (
      <p className={`${styles.label} ${styles.centerAlign}`}>
        {formatMessage({
          id: `alm.overview.waitlist.position`,
        })}
        {waitlistPosition}
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

  const unEnrollmentClickHandler = async () => {
    try {
      const response = await unEnrollmentHandler({
        enrollmentId: enrollment.id,
      });
      if (hasMultipleInstances && response) {
        viewAllInstanceHandler();
      }
    } catch (e) {}
  };

  const instanceSwitchClickHandler = () => {
    const instanceEnrollList = {
      enroll: {
        [training.id]: trainingInstance.id,
      },
    };
    updateEnrollmentHandler({
      enrollmentId: primaryEnrollment.id,
      instanceEnrollList: instanceEnrollList
    });
  };

  const enrollmentClickHandler = async () => {
    try {
      const newEnrollment = await enrollmentHandler({
        allowMultiEnrollment: isMultiEnrollmentEnabled,
      });
      if (checkIsEnrolled(newEnrollment)) {
        if (isFirstModuleCrOrVc() || isFirstResourceType(ACTIVITY)) {
          return;
        }
        playerHandler(newEnrollment);
      }
    } catch (e) {}
  };

  // Need to update this later
  const updateEnrollmentClickHandler = () => {
    unEnrollmentHandler({ enrollmentId: primaryEnrollment.id }).then(() => {
      enrollmentClickHandler();
    });
  };

  const instanceSwitchConfirmationClickHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      GetTranslationsReplaced(
        "alm.instance.switch.confirmation",
        {
          x: primaryEnrollment?.loInstance.localizedMetadata[0].name,
          y: trainingInstance.localizedMetadata[0].name,
        },
        true
      ),
      formatMessage({
        id: "alm.overview.confirm",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      instanceSwitchClickHandler
    );
  };

  const multiEnrollmentConfirmationClickHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      formatMessage({
        id: "alm.multi.enrollment.confirmation",
      }),
      formatMessage({
        id: "alm.overview.confirm",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      enrollmentClickHandler
    );
  };

  const updateEnrollmentConfirmationClickHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.update.enrollment.confirmationRequired",
      }),
      formatMessage({
        id: "alm.update.enrollment.confirmationInfo",
      }),
      formatMessage({
        id: "alm.overview.confirm",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      updateEnrollmentClickHandler
    );
  };

  let instancePageLink =
    window.location.href.split(getALMConfig().trainingOverviewPath)[0] +
    getALMConfig().instancePath +
    "/trainingId/" +
    training.id;

  const getInstanceUnenrollmentConfirmationString = () => {
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: GetTranslationsReplaced(
            "alm.overview.instance.switch.unenroll.confirmation",
            {
              url: instancePageLink,
            },
            true
          ),
        }}
      />
    );
  };

  const instanceUnenrollConfirmationClickHandler = () => {
    const confirmationMessage: any =
      getInstanceUnenrollmentConfirmationString();
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      confirmationMessage,
      formatMessage({
        id: "alm.overview.confirm.unenrollment",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      unEnrollmentClickHandler
    );
  };

  const viewAllInstanceHandler = () => {
    alm.navigateToInstancePage(training.id);
  };
  const viewPrimaryEnrollment = () => {
    alm.navigateToTrainingOverviewPage(
      training.id,
      primaryEnrollment.loInstance.id
    );
  };

  const alm = getALMObject();

  const handleEnrollment = async () => {
    if (hasMultipleInstances && primaryEnrollment) {
      if (primaryEnrollment.state === WAITING) {
        updateEnrollmentConfirmationClickHandler();
      } else if (isInstanceSwitchEnabled) {
        instanceSwitchConfirmationClickHandler();
      } else if (isMultiEnrollmentEnabled) {
        multiEnrollmentConfirmationClickHandler();
      }
    } else {
      storeActionInNonLoggedMode(ENROLL);
      enrollmentClickHandler();
    }
  };

  const previewHandler = async () => {
    storeActionInNonLoggedMode(PREVIEW);
    playerHandler();
  };

  const playerHandler = (
    newEnrollment?: PrimeLearningObjectInstanceEnrollment
  ) => {
    if (isMultiEnrollmentEnabled) {
      const isMultienrolled =
        getEnrolledInstancesCount(training) > 1 ||
        (newEnrollment && primaryEnrollment !== newEnrollment);
      launchPlayerHandler({
        id: training.id,
        moduleId: "",
        trainingInstanceId: trainingInstance.id,
        isMultienrolled: isMultienrolled,
      });
    } else {
      launchPlayerHandler();
    }
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
    !enrollment && enrollmentCount !== undefined ? true : false;

  const showBadges = enrollment && badge?.badgeUrl;

  const showAuthors =
    showAuthorInfo === "true" &&
    training.authorNames?.length > 0 &&
    getALMObject().isPrimeUserLoggedIn();
  var legacyAuthorNames = new Set(training.authorNames);
  training.authors?.forEach((author) => {
    legacyAuthorNames.delete(author.name);
  });

  // const showAfterEnrollmentDeadlines =
  //   training.enrollment &&
  //   showEnrollDeadline === "true" &&
  //   (completionDeadline || unenrollmentDeadline);
  const showEnrollmentDeadline =
    !enrollment && trainingInstance.enrollmentDeadline;

  const getUnenrollmentConfirmationString = () => {
    if (isMultiEnrollmentEnabled && hasMultipleInstances) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: formatMessage({
              id: "alm.overview.instance.multi.unenroll.confirmation",
            }),
          }}
        />
      );
    }
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
      unEnrollmentClickHandler
    );
  };

  const childLpHasResource = () => {
    let displayResource: any = false;
    if (training.subLOs?.length) {
      const subLOs = training.subLOs;
      displayResource = subLOs.map((item) => {
        //when the sub LO is a learing program only then we show the resources from a sub LO
        if (
          item.loType === "learningProgram" &&
          item.supplementaryResources?.length
        ) {
          return true;
        }
      });
    }
    return displayResource;
  };

  // Job aids not supported in non-logged 
  const showJobAids = training.supplementaryLOs?.length && isPrimeUserLoggedIn;
  const showResource =
    training.supplementaryResources?.length || childLpHasResource();

  const isUnenrollmentDeadlinePassed = trainingInstance.unenrollmentDeadline ? checkIfUnenrollmentDeadlinePassed(trainingInstance) : false;

  const canUnenroll =
    ((enrollment && training.unenrollmentAllowed && !(enrollment?.progressPercent === 100)) ||
      isPendingApproval);
  const showCertificationDeadline =
    primaryEnrollment && primaryEnrollment.completionDeadline;
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
    <p className={`${styles.label} ${styles.centerAlign}`}>
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
    <p className={`${styles.errorText} ${styles.centerAlign}`}>
      {formatMessage({
        id: "alm.training.overview.enrollmentDeadline.passed",
      })}
    </p>
  ) : (
    ""
  );

  const showInstanceContainerDetail = () => {
    const progressMessage = GetTranslation(
      `alm.overview.instanceSwitch.tooltip`,
      true
    );

    if (isAutoInstanceEnrolled) {
      return "";
    }
    return (
      <>
        {primaryEnrollment && isInstanceSwitchEnabled && (
          <div>
            <label className={styles.subtleText}>
              {GetTranslation(`alm.instance.switch.detail`, true)}
            </label>
            <ALMTooltip message={progressMessage}></ALMTooltip>
          </div>
        )}
        {primaryEnrollment &&
          isMultiEnrollmentEnabled &&
          !isEnrollButtonDisabled && (
            <div>
              <label className={styles.subtleText}>
                {enrollment
                  ? GetTranslation(
                      `alm.multi.enrollment.enrolled.instance.detail`,
                      true
                    )
                  : GetTranslation(
                      `alm.multi.enrollment.unenrolled.instance.detail`,
                      true
                    )}
              </label>
            </div>
          )}
      </>
    );
  };
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
      const totalCount = coreContentModules?.length;
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
      const totalCount = coreContentModules?.length;
      let completionCount = 0;
      enrollment?.loResourceGrades?.forEach(
        (item: PrimeLearningObjectResourceGrade) => {
          if (item.hasPassed) {
            completionCount += 1;
          }
        }
      );

      value = `${completionCount}/${totalCount || 0}`;
    }
    return value;
  }, [
    coreContentModules?.length,
    isEnrolled,
    enrollment?.loResourceGrades,
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

  const renderResources = (training: PrimeLearningObject) => {
    return training?.supplementaryResources?.map((item) => {
      if (enrollment) {
        return (
          <a
            href={item.location}
            download
            className={styles.supplymentaryLoName}
            target="_blank"
            rel="noreferrer"
            key={item.id}
          >
            <span className={styles.resourceName}>{item.name}</span>
          </a>
        );
      } else {
        return <span className={styles.subtleText}>{item.name}</span>;
      }
    });
  };

  const renderResourcesFromChildLP = (training: PrimeLearningObject) => {
    //if LP has resources don't render resources from child lp
    if (training?.supplementaryResources?.length) {
      return;
    }
    return subLOs?.map((loItem: any) => {
      if (loItem.loType === "learningProgram") {
        return renderResources(loItem);
      }
    });
  };

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
          playerHandler();
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

  const changeInstanceText = hasMultipleInstances && (
    <a
      className={`${styles.allInstances} ${styles.centerAlign}`}
      onClick={viewAllInstanceHandler}
    >
      {GetTranslation(`alm.overview.waitlist.change.instance`, true)}
    </a>
  );

  const enrollmentDisabledInfoText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {formatMessage({
        id:
          primaryEnrollment?.state === COMPLETED
            ? "alm.instance.completed"
            : "alm.instance.enrolled",
      })}
    </p>
  );

  const navigateToEnrolledInstance = (
    <a
      className={`${styles.allInstances} ${styles.centerAlign}`}
      onClick={viewPrimaryEnrollment}
    >
      {GetTranslation(`alm.visit.enrolled.instance`, true)}
    </a>
  );

  const requireManagerApprovalText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {formatMessage({
        id: "alm.overview.request.manager.approval",
      })}
    </p>
  );

  const pendingApprovalText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {formatMessage({
        id: "alm.overview.pending.approval",
      })}
    </p>
  );

  const showEnrollmentInfoText = () => {
    if (isPendingApproval && enrollment?.state !== PENDING_APPROVAL) {
      return (
        <>
          {pendingApprovalText}
          {navigateToEnrolledInstance}
        </>
      );
    } else if (primaryEnrollment?.state === WAITING) {
      return enrollment?.state === WAITING ? (
        <div>
          {waitListText}
          {changeInstanceText}
        </div>
      ) : (
        <div>
          {enrollmentDisabledInfoText}
          {changeInstanceText}
        </div>
      );
    } else if (!primaryEnrollment && requireManagerApproval) {
      return <div>{requireManagerApprovalText}</div>;
    } else if (
      !primaryEnrollment ||
      (primaryEnrollment &&
        (isInstanceSwitchEnabled || isMultiEnrollmentEnabled) &&
        enrollment === undefined)
    ) {
      return (
        <div>
          {enrollmentDeadlinePassedText}
          {seatsAvailableText}
        </div>
      );
    } else if (primaryEnrollment && enrollment === undefined) {
      return (
        <>
          {enrollmentDisabledInfoText}
          {navigateToEnrolledInstance}
        </>
      );
    }
    return;
  };

  const pendingApprovalMssgId = () => {
    if (hasSingleActiveInstance(training)) {
      return "alm.overview.manager.approval.pending.singleInstance";
    } else if (!checkIfEnrollmentDeadlineNotPassed(trainingInstance)) {
      return "alm.overview.manager.approval.pending.deadline.passed";
    } else if (trainingInstance.state === RETIRED) {
      return "alm.overview.manager.approval.pending.instance.retired";
    } else {
      return "alm.overview.manager.approval.pending";
    }
  };

  const hasContentModule = () => {
    return coreContentModules && coreContentModules[0];
  };

  const isLpOrCert = () => {
    return training.subLOs && training.subLOs[0];
  };

  const hasFirstSubLoAsLP = () => {
    return training.subLOs[0].loType === "learningProgram";
  };

  const getModuleTypeOfFirstSubLo = () => {
    let firstLoInstance = training.subLOs[0].instances[0];
    if (hasFirstSubLoAsLP()) {
      firstLoInstance = firstLoInstance.subLoInstances[0];
    }
    return firstLoInstance.loResources[0].resourceType;
  };

  const isFirstResourceType = (type: string) => {
    return (
      (hasContentModule() && coreContentModules[0].resourceType === type) ||
      (isLpOrCert() && type === getModuleTypeOfFirstSubLo())
    );
  };

  const isFirstModuleCrOrVc = () => {
    return (
      isFirstResourceType(CLASSROOM) || isFirstResourceType(VIRTUAL_CLASSROOM)
    );
  };

  const isButtonDisabled = () => {
    return action === "start" && isFirstModuleCrOrVc();
  };

  return (
    <section className={styles.container}>
      <div className={styles.actionContainer}>
        {action === "registerInterest" && (
          <button className={`almButton secondary ${styles.commonButton}`}>
            {actionText}
          </button>
        )}
        {(action === "enroll" || action === "updateEnrollment") && (
          <button
            className={`almButton primary ${styles.commonButton}`}
            onClick={handleEnrollment}
            disabled={isEnrollButtonDisabled || false}
          >
            {actionText}
          </button>
        )}
        {(action === "start" ||
          action === "continue" ||
          action === "revisit") && (
          <>
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={() => playerHandler()}
              disabled={isButtonDisabled()}
            >
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
              }
            >
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
              disabled={true}
            >
              {actionText}
            </button>
            <div className={styles.mangerPendingApprovalText}>
              {formatMessage({
                id: pendingApprovalMssgId(),
              })}
            </div>
            {seatsAvailableText}
          </>
        )}

        {action === "pendingAcceptance" && (
          <>
            <button
              className={`almButton secondary ${styles.commonButton}`}
              disabled={true}
            >
              {actionText}
            </button>

            {seatsAvailableText}
          </>
        )}
        {action === "waiting" && (
          <button
            className={`almButton secondary ${styles.commonButton}`}
            disabled={true}
          >
            {actionText}
          </button>
        )}
      </div>
      {showPreviewButton && (
        <div
          className={` ${styles.actionContainer} ${styles.crsStsButtonPreBookSection}`}
        >
          <div className={styles.backgroundButton}>
            <button
              className={`${styles.previewButton}`}
              onClick={previewHandler}
            >
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

      {/* Enrollment information */}
      {training.loType === COURSE && (
        <div className={styles.actionContainer}>{showEnrollmentInfoText()}</div>
      )}

      {/* Rating Container*/}
      {useCanShowRating(training) && isEnrolled && (
        <div
          className={[styles.submitRatingBox, styles.borderContainer].join(" ")}
        >
          <StarRatingSubmitDialog
            ratingGiven={
              primaryEnrollment.rating ? primaryEnrollment.rating : 0
            }
            updateRating={updateRating}
            training={training}
            trainingInstance={trainingInstance}
            loType={training.loType}
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

        {/* Instance Switch Container */}
        {(hasMultipleInstances || isAutoInstanceEnrolled) &&
          training.loType === COURSE && (
            <div className={styles.commonContainer}>
              <span className={styles.instanceIcon}>{INSTANCE_ICON()}</span>
              <div className={styles.innerContainer}>
                <label className={styles.label}>
                  {GetTranslation(`alm.instance.details`, true)}
                </label>
                <label className={styles.instanceName}>
                  {isAutoInstanceEnrolled ? (
                    GetTranslation("alm.text.autoInstance")
                  ) : (
                    <>
                      {trainingInstance.localizedMetadata[0].name}
                      <a
                        className={styles.allInstances}
                        onClick={viewAllInstanceHandler}
                      >
                        {GetTranslation(`alm.instances`, true)}
                      </a>
                    </>
                  )}
                </label>
                {!isPrimaryEnrollmentWaitlisted &&
                  showInstanceContainerDetail()}
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
                })}
              ></ALMTooltip>
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
                )}
              ></ALMTooltip>
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
              className={`${styles.icon} ${styles.badge}`}
            >
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
              <div style={{ display: "grid" }}>
                {renderResources(training)}
                {renderResourcesFromChildLP(training)}
              </div>
            </div>
          </div>
        )}
        {/* Author */}
        {showAuthors && (
          <div className={styles.authorContainer}>
            <label className={styles.label}>
              {GetTranslation("alm.text.author(s)")}
            </label>
            {Array.from(legacyAuthorNames).map((legacyAuthorName) => {
              return (
                <div
                  className={styles.authors}
                  key={`authors-${legacyAuthorName}`}
                >
                  <span className={styles.cpauthorcircle}>
                    {DEFAULT_USER_SVG()}
                  </span>
                  <div className={styles.innerContainer}>
                    <p className={styles.subtleText}>{legacyAuthorName}</p>
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
      </section>

      {/* UnEnroll button container */}
      {canUnenroll && (
        <div className={styles.commonContainer}>
          <span
            aria-hidden="true"
            className={styles.icon}
            style={{ visibility: "hidden" }}
          >
            <Download />
          </span>
          <div className={styles.bottomContainer}>
            <button
              className={`almButton secondary ${styles.unenrollButton}`}
              disabled={isUnenrollmentDeadlinePassed}
              onClick={
                hasMultipleInstances && isInstanceSwitchEnabled
                  ? instanceUnenrollConfirmationClickHandler
                  : unEnrollConfirmationClickHandler
              }
            >
              {typeOfUnEnrollButton}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
export default PrimeTrainingPageMetaData;
