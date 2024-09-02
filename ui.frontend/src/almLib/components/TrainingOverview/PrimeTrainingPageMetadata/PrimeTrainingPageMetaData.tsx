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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { VariantType, useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { InstanceBadge, Skill } from "../../../models/custom";
import {
  MODULE_COMPLETION_STATUS_ICON,
  CERTIFICATION_TYPE_ICON,
  CERTIFICATION_VALIDITY_ICON,
  CALENDAR_ICON,
  INSTANCES_ICON,
  BADGES_RECIEVED_ICON,
  LO_SKILLS_ICON,
  LO_AUTHORS_ICON,
  LO_JOBAID_ICON,
  LO_RESOURCES_ICON,
  NATIVE_EXTENSIBILITY_ICON,
  LO_RESOURCE_DOWNLOAD_ICON,
  LO_LANGUAGES_AVAILABLE_ICON,
  BOOKMARK_ICON,
  BOOKMARKED_ICON,
  LO_RECOMMENDATIONS_ICON,
  WHO_SHOULD_ATTEND_ICON,
  DEFAULT_USER_SVG,
  Warning_ICON,
  YELLOW_ALERT_ICON,
  PURCHASE_DETAILS_ICON,
  LO_RESOURCE_LINK_ICON,
} from "../../../utils/inline_svg";
import {
  PrimeAccount,
  PrimeExtension,
  PrimeJobAidTrainingMap,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
  PrimeLoInstanceSummary,
  PrimeRecommendations,
  PrimeResource,
} from "../../../models/PrimeModels";
import {
  ACTIVITY,
  ADD_TO_CART,
  ADOBE_COMMERCE,
  ADVANCED,
  CERTIFICATION,
  CLASSROOM,
  COMPLETED,
  COURSE,
  ENROLL,
  FLEX_LP_COURSE_INFO,
  INTERMEDIATE,
  LEARNING_PROGRAM,
  MANAGER_APPROVAL,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  PREVIEW,
  RETIRED,
  STARTED,
  VIRTUAL_CLASSROOM,
  WAITING,
  START,
  CONTINUE,
  REVISIT,
  REGISTER_INTEREST,
  CONTENT,
  ENROLL_ACTION,
  UPDATE_ENROLLMENT_ACTION,
  WAITING_ACTION,
  ADD_TO_CART_ACTION,
  PENDING_APPROVAL_ACTION,
  PENDING_ACCEPTANCE_ACTION,
  ADD_TO_CART_NATIVE_ACTION,
  BUY_NOW_NATIVE_ACTION,
  ALM_FETCH_CART,
  EXTERNAL_STR,
  ERROR_ALREADY_ADDED,
  UNREGISTER_INTEREST,
  POST_REQUEST,
  DELETE_REQUEST,
  PAPI_ERROR_CODES,
  EXTERNAL_AUTHOR,
  ENGLISH_LOCALE,
} from "../../../utils/constants";
import { modifyTime } from "../../../utils/dateTime";
import {
  checkIfLinkedInLearningCourse,
  getALMAccount,
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  getWindowObject,
  isDarkThemeApplied,
  isExtensionAllowed,
  launchContentUrlInNewWindow,
  sendEvent,
  updateURLParams,
} from "../../../utils/global";
import {
  useCanShowRating,
  filterLoReourcesBasedOnResourceType,
  hasSingleActiveInstance,
  getEnrolledInstancesCount,
  getEnrollment,
  isEnrolledInAutoInstance,
  getCoursesInsideFlexLP,
  getCourseInstanceMapping,
  checkIfEntityIsValid,
  getConflictingSessions,
  isValidSubLoForFlexLpToLaunch,
  isEnrolledInstanceAutoInstance,
} from "../../../utils/hooks";
import {
  arePrerequisitesEnforcedAndCompleted,
  checkIsEnrolled,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import { StarRatingSubmitDialog } from "../../StarRatingSubmitDialog";
import { ALMTooltip } from "../../Common/ALMTooltip";
import { PrimeTrainingPageExtraJobAid } from "../PrimeTrainingPageExtraDetailsJobAids";
import { PrimeTrainingRelatedLoList } from "../PrimeTrainingRelatedLoList";
import { PrimeLoLeaderBoard } from "../../ALMLpLeaderBoard";
import styles from "./PrimeTrainingPageMetadata.module.css";
import React from "react";
import {
  checkIfEnrollmentDeadlineNotPassed,
  checkIfUnenrollmentDeadlinePassed,
} from "../../../utils/instance";
import {
  InvocationType,
  getExtension,
  isExtensionAllowedForLO,
} from "../../../utils/native-extensibility";
import SessionConflictDialog from "../../SessionConflict/SessionConflictDialog";
import {
  doesFirstTrainingHavePrerequisites,
  findSubLoToLaunchForFlexLp,
  getAllCoreContentModulesOfTraining,
  getAllCoursesOfTraining,
  getAllJobAidsInTraining,
  getAllPreviewableModules,
  getCourseIdAndInstanceIdFromResourceId,
  getInstanceIdToLaunch,
  getModuleIdToLaunch,
  getSectionLOsOrder,
  shouldDisableStart,
  shouldResetAttempt,
  shouldShowContinueButton,
  shouldShowOnlyExternalAuthor,
} from "../../../utils/lo-utils";
import { downloadFile } from "../../../utils/widgets/utils";
import { useProfile } from "../../../hooks";
import { PrimeEvent } from "../../../utils/widgets/common";
import { useUserContext } from "../../../contextProviders/userContextProvider";

const PrimeTrainingPageMetaData: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  showAuthorInfo: string;
  showEnrollDeadline: string;
  enrollmentHandler: Function;
  flexLpEnrollHandler: Function;
  updateRating: (rating: number, loInstanceId: any) => Promise<void | undefined>;
  updateLearningObject: (loId: string) => Promise<PrimeLearningObject>;
  updateBookMark: (isBookmarked: boolean, loId: any) => Promise<void | undefined>;
  alternateLanguages: Promise<string[]>;
  launchPlayerHandler: Function;
  addToCartHandler: () => Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }>;
  addToCartNativeHandler: () => Promise<{
    redirectionUrl: string;
    error: any;
  }>;
  buyNowNativeHandler: () => Promise<{
    redirectionUrl: string;
    error: any;
  }>;
  updateEnrollmentHandler: Function;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
  isPreviewEnabled: boolean;
  waitlistPosition: string;
  setActiveExtension: Function;
  timeBetweenAttemptEnabled: boolean;
  courseInstanceMapping: any;
  isFlexLPOrContainsFlexLP: boolean;
  areAllInstancesSelected: Function;
  lastPlayingLoResourceId: string;
  lastPlayingCourseId: string;
  lastPlayingCourseInstanceId: string;
  relatedCoursesList: PrimeLearningObject[];
  relatedLpList: PrimeLearningObject[];
  setCourseInstanceMapping: any;
  enrollViaModuleClick: any;
  setEnrollViaModuleClick: Function;
  isRegisterInterestEnabled: boolean;
  registerInterestHandler: Function;
  isCourseEnrollable: boolean;
  isCourseEnrolled: boolean;
}> = ({
  trainingInstance,
  skills,
  training,
  badge,
  instanceSummary,
  showAuthorInfo,
  enrollmentHandler,
  launchPlayerHandler,
  addToCartHandler,
  addToCartNativeHandler,
  buyNowNativeHandler,
  updateEnrollmentHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
  flexLpEnrollHandler,
  isPreviewEnabled,
  alternateLanguages,
  courseInstanceMapping,
  isFlexLPOrContainsFlexLP,
  updateRating,
  updateLearningObject,
  updateBookMark,
  waitlistPosition,
  setActiveExtension,
  timeBetweenAttemptEnabled,
  areAllInstancesSelected,
  lastPlayingLoResourceId,
  lastPlayingCourseId,
  lastPlayingCourseInstanceId,
  relatedCoursesList,
  relatedLpList,
  setCourseInstanceMapping,
  enrollViaModuleClick,
  setEnrollViaModuleClick,
  isRegisterInterestEnabled,
  registerInterestHandler,
  isCourseEnrollable,
  isCourseEnrolled,
}) => {
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const { formatMessage, locale } = useIntl();

  const { updateProfileSettings } = useProfile();
  const [flexLPCoursesList, setFlexLPCoursesList] = useState({
    enrolledCourses: [],
    unenrolledCourses: [],
  });

  const primaryEnrollment = training.enrollment;
  const enrollment = getEnrollment(training, trainingInstance);
  const enrolledInstancesCount = getEnrolledInstancesCount(training);

  const loType = training.loType;
  const isCourse = loType === COURSE;
  const isLP = loType === LEARNING_PROGRAM;
  const isCertification = loType === CERTIFICATION;
  const isExternalCertification = isCertification && training.isExternal;
  const subLOs = training.subLOs;
  const sections = training.sections;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const loPrice = training.price;
  const learnerDesktopApp = getALMConfig().learnerDesktopApp;
  const isPricingEnabled =
    loPrice && (getALMConfig().usageType === ADOBE_COMMERCE || learnerDesktopApp);
  const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);
  const isCourseEnrolledInstanceAutoInstance = isEnrolledInstanceAutoInstance(training);
  const hasOptionalLoResources = training.hasOptionalLoResources;
  const [isTrainingSynced, setIsTrainingSynced] = useState(true);
  const [isBookMarked, setIsBookMarked] = useState(training.isBookmarked);
  const [overviewExtension, setOverviewExtension] = useState<PrimeExtension>();
  const [enrollExtension, setEnrollExtension] = useState<PrimeExtension>();
  const [alternativesLangAvailable, setAlternativesLangAvailable] = useState<string[]>([]);
  const trainingProgressPercent = enrollment && enrollment.progressPercent;
  const isEnrolled = checkIsEnrolled(enrollment);
  const [account, setAccount] = useState({} as PrimeAccount);
  const recommendationText = useMemo(() => {
    return GetTranslation("alm.lo.recommended.for");
  }, []);
  const isInstanceRetired = useMemo(() => {
    return trainingInstance.state === RETIRED;
  }, [trainingInstance.state]);

  const isCourseNotEnrollable = isCourse && !isCourseEnrollable && !isCourseEnrolled;

  useEffect(() => {
    if (
      enrollViaModuleClick.id &&
      !isEnrollButtonDisabled &&
      !isPricingEnabled &&
      !isCourseNotEnrollable
    ) {
      const enrollOnClick = user.enrollOnClick;

      const makeEnrollmentCall = () => {
        checkConflictingSessions();
        return;
      };

      if (enrollOnClick) {
        makeEnrollmentCall();
        return;
      }

      almConfirmationAlert(
        formatMessage({
          id: "alm.community.board.confirmationRequired",
          defaultMessage: "Confirmation Required",
        }),
        GetTranslation("alm.module.click.description", true),
        formatMessage({
          id: "text.continue",
        }),
        formatMessage({
          id: "alm.overview.cancel",
        }),
        async () => {
          try {
            makeEnrollmentCall();
            updateProfileSettings({ shouldEnrollOnClick: true }); // updating enrollOnClick to true
          } catch (e) {
            almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
          }
        },
        setEnrollViaModuleClick([]) // setting empty
      );
    }
  }, [enrollViaModuleClick, user]);

  useEffect(() => {
    document.addEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
    return () => {
      document.removeEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
    };
  }, []);

  const handlePlayerClose = async (event: any) => {
    const actionButton = document.getElementById(actionButtonId);
    actionButton?.focus();
  };
  const toggle = () => {
    setIsBookMarked(prevState => !prevState);
    updateBookMark(!isBookMarked, training.id);
  };
  const getBookMarkStatus = () => {
    const bookMarkIcon = isBookMarked ? BOOKMARKED_ICON() : BOOKMARK_ICON();
    const bookMarkStatus = isBookMarked
      ? GetTranslation("alm.text.saved")
      : GetTranslation("alm.text.save");
    return (
      <>
        <span className={styles.bookMarkIcon} data-automationid="bookmark">
          {bookMarkIcon}
        </span>
        <span className={styles.bookMarkText} data-automationid="bookmark-status">
          {bookMarkStatus}
        </span>
      </>
    );
  };
  const isInstanceNotSelected = (
    <>
      <div
        className={styles.selectCiMsg}
        data-automationid={GetTranslation(`alm.training.flexlp.select.instance`, true)}
      >
        {GetTranslation(`alm.training.flexlp.select.instance`, true)}
      </div>
      <div
        className={styles.scrollToSelectMsg}
        data-automationid={GetTranslation(`alm.training.flexlp.no.instance`, true)}
      >
        {GetTranslation(`alm.training.flexlp.no.instance`, true)}
      </div>
    </>
  );

  const isInstanceSwitchEnabled =
    training.instanceSwitchEnabled &&
    (primaryEnrollment?.state !== COMPLETED || primaryEnrollment?.progressPercent === 100);
  const isMultiEnrollmentEnabled = training.multienrollmentEnabled;
  const hasMultipleInstances = !hasSingleActiveInstance(training);

  const isPendingApproval = primaryEnrollment?.state === PENDING_APPROVAL;
  const requireManagerApproval = training.enrollmentType === MANAGER_APPROVAL;
  const isPrimaryEnrollmentWaitlisted = primaryEnrollment?.state === WAITING;

  const typeOfUnEnrollButton = useMemo(() => {
    return isCertification
      ? GetTranslation("alm.text.unenroll.certification", true)
      : isLP
        ? GetTranslation("alm.text.unenroll.learningProgram", true)
        : hasMultipleInstances && isMultiEnrollmentEnabled && enrolledInstancesCount > 1
          ? GetTranslation("alm.text.unenroll.instance", true)
          : GetTranslation("alm.text.unenroll.course", true);
  }, [training]);

  const courseIdList = Object.keys(courseInstanceMapping);

  let showPreviewButton =
    isPreviewEnabled && training.hasPreview && !checkIsEnrolled(training.enrollment);

  const flexLpUpdationChecker = () => {
    const entries = Object.entries(courseInstanceMapping);
    for (let i = 0; i < entries.length; i++) {
      const loInstanceObj = entries[i][1] as any;
      if (loInstanceObj.isInstanceUpdated) {
        return true;
      }
    }
    return false;
  };
  // Enrolled courses inside flex lp, for which instance not selected
  const courseInstanceNotSelected =
    loType == COURSE && primaryEnrollment && !primaryEnrollment.loInstance;

  const courseInstanceInsideFlexLPSelected = useMemo(() => {
    const allCoursesOfFlexLP = getAllCoursesOfTraining(training);
    return allCoursesOfFlexLP?.some(
      course =>
        checkIfEntityIsValid(course.enrollment) &&
        checkIfEntityIsValid(course.enrollment?.loInstance)
    );
  }, [training?.subLOs]);

  const action: string = useMemo(() => {
    if (courseInstanceNotSelected) {
      return START;
    } else if (enrollment) {
      if (enrollment.state === PENDING_APPROVAL) {
        return PENDING_APPROVAL_ACTION;
      } else if (enrollment.state === PENDING_ACCEPTANCE) {
        return PENDING_ACCEPTANCE_ACTION;
      } else if (enrollment.state === WAITING) {
        return WAITING_ACTION;
      } else if (
        trainingProgressPercent >= 0 &&
        flexLpUpdationChecker() &&
        isFlexLPOrContainsFlexLP
      ) {
        return UPDATE_ENROLLMENT_ACTION;
      } else if (
        (enrollment.state === STARTED ||
          shouldShowContinueButton(isEnrolled, isCourse, training, isFlexLPOrContainsFlexLP)) &&
        trainingProgressPercent != 100 &&
        enrollment.state !== COMPLETED
      ) {
        return CONTINUE;
      } else if (trainingProgressPercent === 0) {
        return START;
      } else if (trainingProgressPercent === 100 || enrollment.state === COMPLETED) {
        return REVISIT;
      }
      return CONTINUE;
    } else if (isInstanceRetired && !isRegisterInterestEnabled) {
      return REGISTER_INTEREST;
    } else if (isInstanceRetired && isRegisterInterestEnabled) {
      return UNREGISTER_INTEREST;
    } else if (isPricingEnabled) {
      const isMultiItemCart = account.multiItemCartEnabled;
      if (learnerDesktopApp && isMultiItemCart) {
        return ADD_TO_CART_NATIVE_ACTION;
      } else if (learnerDesktopApp && !isMultiItemCart) {
        return BUY_NOW_NATIVE_ACTION;
      }
      return ADD_TO_CART_ACTION;
    } else if (isPrimaryEnrollmentWaitlisted) {
      return UPDATE_ENROLLMENT_ACTION;
    } else if (isCourseNotEnrollable) {
      return "";
    }
    return ENROLL_ACTION;
  }, [enrollment, trainingInstance.state, isPricingEnabled, account, isRegisterInterestEnabled]);

  useEffect(() => {
    const getAndSetOverviewExtension = async () => {
      const account = await getALMAccount();
      setAccount(account);
      if (account) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_OVERVIEW
        );
        extension && isExtensionAllowed(extension) && setOverviewExtension(extension);
      }
    };
    getAndSetOverviewExtension();
  }, [training]);
  useEffect(() => {
    const getEnrollExtension = async () => {
      const account = await getALMAccount();
      if (account) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_ENROLL
        );
        extension &&
          isExtensionAllowedForLO(training, trainingInstance) &&
          setEnrollExtension(extension);
      }
    };
    getEnrollExtension();
  }, [training, trainingInstance]);

  const completionDeadline = trainingInstance.completionDeadline;
  const unenrollmentDeadline = trainingInstance.unenrollmentDeadline;
  const enrollmentDeadline = trainingInstance.enrollmentDeadline;

  const enrollmentCount = instanceSummary?.enrollmentCount;
  const seatLimit = instanceSummary?.seatLimit;
  const seatsAvailable = seatLimit !== undefined ? seatLimit - (enrollmentCount || 0) : -1;

  const isSeatAvailable = trainingInstance.seatLimit
    ? trainingInstance.seatLimit > 0 && seatsAvailable > 0
    : true;

  const isEnrollingToWaitlisted = !enrollment && seatLimit !== undefined && !isSeatAvailable;

  const hasEnrollmentDeadlinePassed = enrollmentDeadline
    ? new Date(enrollmentDeadline) < new Date()
    : false;

  const isEnrolledInPrimaryInstance = primaryEnrollment?.loInstance?.id === trainingInstance.id;
  const hasCompletedPrimaryEnrollment =
    primaryEnrollment?.state === COMPLETED || primaryEnrollment?.progressPercent === 100;
  const isSwitchToOtherInstanceDisabled =
    training.instanceSwitchEnabled && !isEnrolledInPrimaryInstance && hasCompletedPrimaryEnrollment;

  const isEnrollButtonDisabled =
    hasEnrollmentDeadlinePassed ||
    (primaryEnrollment && !isPrimaryEnrollmentWaitlisted && isEnrollingToWaitlisted) ||
    (!isInstanceSwitchEnabled &&
      !isMultiEnrollmentEnabled &&
      primaryEnrollment &&
      primaryEnrollment.loInstance &&
      !isEnrolledInPrimaryInstance &&
      !isPrimaryEnrollmentWaitlisted) ||
    isPendingApproval ||
    isSwitchToOtherInstanceDisabled;
  const purchasedDate = enrollment?.dateEnrolled || "";
  const showPriceDetails = account.enableECommerce && loPrice && loPrice > 0 && enrollment;
  const getPriceFormatHTML = (header: string, body: any) => {
    return (
      <>
        <div className={styles.bodyHeader} data-automationid={GetTranslation(header)}>
          {GetTranslation(header)}
        </div>
        <div className={styles.bodyText} data-automationid={`Purchased-details-${body}`}>
          {body}
        </div>
      </>
    );
  };
  const getPriceDetails = useMemo(() => {
    return (
      <>
        <div> {getPriceFormatHTML("alm.training.price", `$${loPrice}`)}</div>
        <div>
          {getPriceFormatHTML(
            "alm.overview.session.date.header",
            modifyTime(purchasedDate, locale)
          )}
        </div>
      </>
    );
  }, []);
  const seatsAvailableText = trainingInstance.seatLimit ? (
    seatLimit && seatsAvailable > 0 ? (
      <p className={`${styles.label} ${styles.centerAlign}`} data-automationid="seats-available">
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
          <p
            className={`${styles.errorText} ${styles.centerAlign}`}
            data-automationid="seats-unavailable"
          >
            {formatMessage({
              id: `alm.overview.no.seats.available`,
            })}
          </p>
          {!isEnrollButtonDisabled && (
            <p className={styles.centerAlign} data-automationid="waitlisted">
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
      <p className={`${styles.label} ${styles.centerAlign}`} data-automationid="waitlist-position">
        {formatMessage({
          id: `alm.overview.waitlist.position`,
        })}
        {waitlistPosition}
      </p>
    ) : (
      ""
    );

  const prerequisiteCompletionText = action === START &&
    !arePrerequisitesEnforcedAndCompleted(training) && (
      <p
        className={`${styles.label} ${styles.centerAlign} ${styles.PreRequisiteAlert}`}
        data-automationid="complete-prerequisite-message"
      >
        {YELLOW_ALERT_ICON()}
        {GetTranslation(`alm.overview.complete.prerequisite.message.${loType}`, true)}
      </p>
    );

  const actionText = useMemo(() => {
    if (action === ADD_TO_CART_ACTION) {
      return formatMessage(
        {
          id: `alm.addToCart`,
        },
        { x: getFormattedPrice(loPrice) }
      );
    } else if (action === ADD_TO_CART_NATIVE_ACTION) {
      return formatMessage(
        {
          id: `alm.addToCartNative`,
        },
        { x: getFormattedPrice(loPrice) }
      );
    } else if (action === BUY_NOW_NATIVE_ACTION) {
      return formatMessage(
        {
          id: `alm.buyNowNative`,
        },
        { x: getFormattedPrice(loPrice) }
      );
    } else if (action === "") {
      return "";
    }
    return formatMessage({
      id: `alm.overview.button.${action}`,
    });
  }, [action, formatMessage, loPrice]);
  const actionButtonId = `actionButton-${actionText}`;

  const filteredSkills: Skill[] = useMemo(() => {
    let map: any = {};
    let filteredSkills = skills?.filter(item => {
      if (!map[item.name]) {
        map[item.name] = true;
        return true;
      }
      return false;
    });
    return filteredSkills;
  }, [skills]);
  const doLoSkillsExist = filteredSkills?.length > 0;
  function getUnenrollmentMessageKey(isSuccess: boolean) {
    let type;
    if (isCertification) {
      type = "cert";
    } else if (isLP) {
      type = "lp";
    } else if (hasMultipleInstances && isMultiEnrollmentEnabled && enrolledInstancesCount > 1) {
      type = "instance";
    } else {
      type = COURSE;
    }
    return `${isSuccess ? "succMsg" : "errMsg"}.learner.${type}.unenroll`;
  }

  function showUnenrollmentMessage(isSuccess: boolean) {
    const messageKey = getUnenrollmentMessageKey(isSuccess);
    return almAlert(
      true,
      GetTranslation(messageKey, true),
      isSuccess ? AlertType.success : AlertType.error
    );
  }

  function showUnenrollmentSuccessMessage() {
    return showUnenrollmentMessage(true);
  }

  function showUnenrollmentErrorMessage() {
    return showUnenrollmentMessage(false);
  }

  const unEnrollmentClickHandler = async () => {
    try {
      const response = await unEnrollmentHandler({
        enrollmentId: enrollment?.id || training?.enrollment?.id,
        isFlexLp: isFlexLPOrContainsFlexLP,
      });
      showUnenrollmentSuccessMessage();
      if (isCourse && hasMultipleInstances && response) {
        //If course has multiple instances we navigate to instancePage
        viewAllInstanceHandler();
      } else {
        // For LP and Cert we go back to catalog page
        alm.navigateToCatalogPage();
      }
    } catch (e) {
      showUnenrollmentErrorMessage();
    }
  };

  const instanceUpdateClickHandler = () => {
    updateEnrollmentHandler({
      enrollmentId: primaryEnrollment.id,
      instanceEnrollList: {
        enroll: {
          [training.id]: trainingInstance.id,
        },
      },
      isFlexLp: false,
    });
  };

  const { hasPrerequisites, trainingType } = doesFirstTrainingHavePrerequisites(training);

  const enrollmentClickHandler = async (launchPlayer = true) => {
    try {
      const account = await getALMAccount();
      if (account && isExtensionAllowedForLO(training, trainingInstance)) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_ENROLL
        );
        if (extension && isExtensionAllowed(extension)) {
          setActiveExtension(extension);
          return;
        }
      }

      const newEnrollment = await enrollmentHandler({
        allowMultiEnrollment: isMultiEnrollmentEnabled,
      });
      if (checkIsEnrolled(newEnrollment) && launchPlayer) {
        if (isExternalCertification && !training.subLOs) {
          return;
        }

        if (hasPrerequisites) {
          almAlert(
            true,
            GetTranslation(`alm.overview.error.unmetPreReqMessage.${trainingType}`, true),
            AlertType.error
          );
          return;
        }
        if (isFirstModuleCrOrVc() || isFirstResourceType(ACTIVITY)) {
          return;
        }
        if (
          checkIfLinkedInLearningCourse(training) &&
          getALMConfig().handleLinkedInContentExternally
        ) {
          return launchContentUrlInNewWindow(training, coreContentModules[0]);
        }
        await updateLearningObject(training?.id);
        playerHandler(newEnrollment);
      }
      setEnrollViaModuleClick([]); // setting empty once enrollment is done
    } catch (error: any) {
      if (error.message === PAPI_ERROR_CODES.ERROR_ENROLLMENT_WAITLIST_FULL) {
        almConfirmationAlert(
          GetTranslation("alm.error.waitlist.limit.title"),
          GetTranslation("alm.error.waitlist.limit.message"),
          GetTranslation("alm.community.ok.label")
        );
        return;
      } else if (error.message === PAPI_ERROR_CODES.ERROR_BL_ENROLLMENT_ACQUIRED_COURSE_LIMIT) {
        almAlert(true, GetTranslation("enrollment.limit.reached.error", true), AlertType.error);
        return;
      }

      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  };

  // Need to update this later
  const updateEnrollmentClickHandler = () => {
    unEnrollmentHandler({ enrollmentId: primaryEnrollment.id }).then(() => {
      enrollmentClickHandler();
    });
  };

  const getFlexLpPayload = (
    training: PrimeLearningObject,
    flexLpCourseListUpdated: any,
    instanceSwitchAllowedForParentLO: boolean
  ) => {
    const flexLpObject = {} as any;

    // For both enrollment and update enrollment calls
    const coursesInsideFlexLP = training.subLOs.reduce(
      (result: PrimeLearningObject[], subLO: PrimeLearningObject) => {
        if (subLO.loType === COURSE) {
          result.push(subLO);
        }
        return result;
      },
      []
    );

    // instance switch not allowed if no seats available or enrollment/unenrollment deadline is passed
    instanceSwitchAllowedForParentLO = Object.entries(courseInstanceMapping).every(
      ([id, course]: [string, any]) => {
        const isSwitchAllowed = course.isInstanceSwitchAllowed;
        const coursePresent = coursesInsideFlexLP.some(course => course.id === id);

        return !coursePresent || (coursePresent && isSwitchAllowed);
      }
    );

    Object.entries(courseInstanceMapping).forEach(([id, course]: [string, any]) => {
      const instanceId = course.instanceId;
      const isInstanceUpdated = action === ENROLL_ACTION || course.isInstanceUpdated;
      const courseObj = { name: course.name, id: id };
      const isSwitchAllowed = course.isInstanceSwitchAllowed;

      if (coursesInsideFlexLP.some(course => course.id === id && isInstanceUpdated)) {
        if (instanceSwitchAllowedForParentLO) {
          flexLpObject[id] = instanceId;
          flexLpCourseListUpdated.enrolledCourses.push(courseObj);
        } else if (!isSwitchAllowed) {
          // instance switch not allowed if no seats available or enrollment deadline is passed
          flexLpCourseListUpdated.unenrolledCourses.push(courseObj);
        }
      }
    });
    return flexLpObject;
  };

  const flexLpEnrollmentHandler = async () => {
    try {
      const account = await getALMAccount();
      const isAllowed = account && isExtensionAllowedForLO(training, trainingInstance);

      if (isAllowed) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_ENROLL
        );

        if (extension && isExtensionAllowed(extension)) {
          getALMObject().storage.setItem(FLEX_LP_COURSE_INFO, courseInstanceMapping, 1800);
          setActiveExtension(extension);
          return;
        }
      }

      await updateOrEnrollFlexibleSubLOs();
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrEnrollFlexibleSubLOs = async () => {
    // Instance switch is not allowed if enrollment deadline is passed or no seats available
    const flexLpCourseListUpdated = { ...flexLPCoursesList };
    let instanceSwitchAllowedForParentLO = true;

    await Promise.all(
      subLOs.map(async subLO => {
        if (subLO.loType === LEARNING_PROGRAM && subLO.instances[0].isFlexible) {
          const enrollRequestObj = getFlexLpPayload(
            subLO,
            flexLpCourseListUpdated,
            instanceSwitchAllowedForParentLO
          );
          if (instanceSwitchAllowedForParentLO) {
            await updateOrEnrollFlexLP(subLO, enrollRequestObj);
          }
        }
      })
    );

    instanceSwitchAllowedForParentLO = true;
    const enrollRequestObj = getFlexLpPayload(
      training,
      flexLpCourseListUpdated,
      instanceSwitchAllowedForParentLO
    );

    setFlexLPCoursesList(flexLpCourseListUpdated);

    if (instanceSwitchAllowedForParentLO) {
      // Root training enrollment
      await updateOrEnrollFlexLP(training, enrollRequestObj, trainingInstance.id);
      if (
        action === UPDATE_ENROLLMENT_ACTION &&
        flexLpCourseListUpdated.unenrolledCourses.length === 0
      ) {
        almAlert(true, GetTranslation(`alm.text.saveSuccessfulMessage`), AlertType.success);
      }
    }

    updateCourseInstanceMapping(flexLpCourseListUpdated);
  };
  const showFlexLpEnrollmentAlert = () => {
    const title = getFlexLpEnrollmentFailedTitle();
    const message = getFlexLpEnrollmentFailedMessage();
    const variant =
      flexLPCoursesList.enrolledCourses.length > 0 ? VariantType.WARNING : VariantType.ERROR;

    almConfirmationAlert(
      title,
      message,
      formatMessage({ id: "alm.community.ok.label" }),
      "",
      () => setFlexLPCoursesList({ enrolledCourses: [], unenrolledCourses: [] }),
      undefined,
      variant
    );
  };

  useEffect(() => {
    /* Flex LP Validations */
    if (flexLPCoursesList.unenrolledCourses.length > 0) {
      showFlexLpEnrollmentAlert();
    }
  }, [flexLPCoursesList]);

  const updateOrEnrollFlexLP = async (
    training: PrimeLearningObject,
    requestBody: any,
    trainingInstanceId = ""
  ) => {
    const payload = {
      id: training.id,
      instanceId: trainingInstanceId || training.instances[0].id,
      allowMultiEnrollment: training.multienrollmentEnabled,
    };

    const emptyRequest = Object.keys(requestBody).length === 0;

    if (action === ENROLL_ACTION) {
      try {
        if (emptyRequest) {
          await enrollmentHandler(payload);
        } else {
          await flexLpEnrollHandler({
            ...payload,
            body: { enroll: requestBody },
          });
        }
      } catch (error: any) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
      return;
    }

    if (emptyRequest) {
      return;
    }
    await updateEnrollmentHandler({
      enrollmentId: training.enrollment.id,
      instanceEnrollList: {
        enroll: requestBody,
      },
      isFlexLp: true,
    });
  };

  const updateCourseInstanceMapping = (flexLPCoursesList: any) => {
    const updatedMapping = { ...courseInstanceMapping };

    Object.entries(courseInstanceMapping).forEach(([id, course]: [string, any]) => {
      const isUnenrolled = flexLPCoursesList.unenrolledCourses.some(
        (unenrolledCourse: any) => unenrolledCourse.id === id
      );

      // Setting isInstanceUpdated to be false after successfull enrollment call if instance switch was allowed
      updatedMapping[id] = { ...course, isInstanceUpdated: isUnenrolled };
    });
    setCourseInstanceMapping(updatedMapping);
  };

  const getAllCoursesInsideFlexLPSection = (
    subLOsInsideLP: PrimeLearningObject[],
    isFlexible: boolean
  ) => {
    let allCourses: PrimeLearningObject[] = [];
    subLOsInsideLP.forEach(lo => {
      if (lo.loType === LEARNING_PROGRAM && lo.instances[0].isFlexible) {
        allCourses.push(...getCoursesInsideFlexLP(lo, true));
      } else if (lo.loType === COURSE && isFlexible) {
        allCourses.push(lo);
      }
    });
    return allCourses;
  };

  function flexLPInstanceConfirmationMessage() {
    return (
      <>
        <p className={styles.dialogBoxMessage}>
          {GetTranslation("alm.training.flexLp.enrollmentDialogBox.selectedCourseMessage", true)}
        </p>
        <p className={styles.dialogBoxMessage}>
          {GetTranslation("alm.training.flexLp.enrollmentDialogBox.instanceChangeMessage", true)}
        </p>
        <p className={styles.dialogBoxMessage}>
          <span className={styles.warningIcon}>{Warning_ICON()}</span>
          {GetTranslation("alm.training.flexLp.enrollmentDialogBox.pendingCourseMessage", true)}
        </p>
        <hr></hr>
        <ol className={styles.flexLpDialogList}>
          {sections.map((section, index) => {
            const trainingIds = section.loIds;
            const subLOsInsideLP = training.subLOs.filter(
              subLO => trainingIds.indexOf(subLO.id) !== -1
            );
            const isFlexible = trainingInstance.isFlexible;

            subLOsInsideLP.sort(
              (trainingId1, trainingId2) =>
                trainingIds.indexOf(trainingId1.id) - trainingIds.indexOf(trainingId2.id)
            );
            const allCourses = getAllCoursesInsideFlexLPSection(subLOsInsideLP, isFlexible);
            return allCourses.map((item: any) => {
              const selectedInstanceDetails = getCourseInstanceMapping(
                courseInstanceMapping,
                item.id
              );
              const isValidEnrollment = checkIfEntityIsValid(item.enrollment);

              const trainingName = item.localizedMetadata[0].name;
              let instanceName = "";

              if (courseIdList.includes(item.id)) {
                instanceName = selectedInstanceDetails.instanceName;
              } else if (
                (item.enrollment && training.enrollment && isValidEnrollment) ||
                item.enrollment?.state === COMPLETED
              ) {
                instanceName = selectedInstanceDetails.instanceName;
              }

              return (
                <React.Fragment key={item.id}>
                  <li className={styles.courseListInFlexLp}>
                    <span>
                      <b data-automationid={trainingName}>{trainingName}</b>
                      <p data-automationid={`${trainingName}-selected-instance`}>
                        {GetTranslation("alm.overview.flexlp.dialog.instance", true)}:{" "}
                        {instanceName || (
                          <span className={styles.notSelected}>
                            {formatMessage({
                              id: "alm.overview.flexlp.dialog.noInstanceSelected",
                            })}
                          </span>
                        )}
                      </p>
                    </span>
                  </li>
                </React.Fragment>
              );
            });
          })}
        </ol>
      </>
    );
  }

  const flexLpEnrollmentConfirmationClickHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.training.flexLp.enrollment.new",
        defaultMessage: "Proceed with enrollment",
      }),
      flexLPInstanceConfirmationMessage(),
      formatMessage({
        id: primaryEnrollment ? "alm.text.update" : "alm.overview.button.enroll",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      flexLpEnrollmentHandler
    );
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
      instanceUpdateClickHandler
    );
  };

  const multiEnrollmentConfirmationClickHandler = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      GetTranslation("alm.multi.enrollment.confirmation", true),
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
      GetTranslation("alm.change.instance.enrollment", true),
      formatMessage({
        id: "text.proceed",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      instanceUpdateClickHandler
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
        className={`${styles.instanceUnenrollmentConfirmation} ${isDarkThemeApplied() ? styles.darkThemeLinkColor : styles.lightThemeLinkColor}`}
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
    const confirmationMessage: any = getInstanceUnenrollmentConfirmationString();
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
    alm.navigateToTrainingOverviewPage(training.id, primaryEnrollment.loInstance.id);
  };

  const alm = getALMObject();

  const handleEnrollment = async () => {
    if (isFlexLPOrContainsFlexLP) {
      storeActionInNonLoggedMode(ENROLL);
      flexLpEnrollmentConfirmationClickHandler();
    } else if (hasMultipleInstances && primaryEnrollment) {
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
    playerHandlerForPreview();
  };

  const playerHandlerForPreview = () => {
    const coreContentModules = getAllCoreContentModulesOfTraining(training, trainingInstance);
    const previewableModules = getAllPreviewableModules(coreContentModules);
    const previewableModuleToLaunch = previewableModules?.[0];
    launchPlayerHandler({
      id: previewableModuleToLaunch?.learningObject.id,
      moduleId: previewableModuleToLaunch?.id,
      trainingInstanceId: previewableModuleToLaunch?.loInstance.id,
      isResetRequired: resetAttemptForFirstModule,
    });
  };
  // MQA Case
  const lastPlayedloResource =
    trainingInstance?.loResources?.find(loResource => {
      return loResource.id === lastPlayingLoResourceId;
    }) ||
    (trainingInstance?.loResources && trainingInstance?.loResources[0]);

  const resetAttemptForFirstModule = shouldResetAttempt(training, lastPlayedloResource, enrollment);
  const getFirstSubLoOfParentLo = (Lo: PrimeLearningObject): PrimeLearningObject | undefined => {
    if (Lo.loType === COURSE) {
      return Lo;
    }
    if (Lo.loType != COURSE && Lo.subLOs && Lo.subLOs.length > 0) {
      const allSubLOs = getSectionLOsOrder(Lo);
      return getFirstSubLoOfParentLo(allSubLOs[0][0]);
    }
  };

  const launchPlayerForNewEnrollmentOrRevisit = () => {
    //Launch the first subLO of the first section
    //For certification we take the first course, for LP we take the first course of the first section
    const sectionSubLOs = isLP ? getSectionLOsOrder(training) : [];
    const childLo = isCertification ? training.subLOs[0] : isLP ? sectionSubLOs[0][0] : training;
    const subLoToLaunch = isCourse ? training : getFirstSubLoOfParentLo(childLo);
    const trainingId = subLoToLaunch && subLoToLaunch.id;
    const trainingInstanceId =
      subLoToLaunch &&
      (subLoToLaunch.enrollment && checkIfEntityIsValid(subLoToLaunch.enrollment)
        ? subLoToLaunch?.enrollment?.loInstance.id
        : getInstanceIdToLaunch(subLoToLaunch, trainingInstance.id));
    const loResourceId =
      subLoToLaunch && trainingInstanceId && getModuleIdToLaunch(subLoToLaunch, trainingInstanceId);
    if (!loResourceId) {
      // If loResourceId is not present don't launch the player
      return;
    }
    launchPlayerHandler({
      id: trainingId,
      moduleId: loResourceId,
      trainingInstanceId: trainingInstanceId,
      isResetRequired: resetAttemptForFirstModule,
    });
  };

  const launchPlayerForExistingEnrollment = async () => {
    //If PlayerLoState API returns empty response then launch the first module
    if (!lastPlayingLoResourceId) {
      launchPlayerForNewEnrollmentOrRevisit();
    } else {
      // If lastPlayingCourseId or lastPlayingCourseInstanceId is not present then extract from resourceId
      const courseAndInstanceId = getCourseIdAndInstanceIdFromResourceId(lastPlayingLoResourceId);
      const instanceIdToLaunch = trainingInstance?.id.includes(courseAndInstanceId.courseId)
        ? trainingInstance?.id
        : courseAndInstanceId.courseInstanceId;
      launchPlayerHandler({
        id: lastPlayingCourseId || courseAndInstanceId.courseId,
        moduleId: lastPlayingLoResourceId,
        trainingInstanceId: lastPlayingCourseInstanceId || instanceIdToLaunch,
        isResetRequired: resetAttemptForFirstModule,
      });
    }
  };

  const playerHandler = (newEnrollment?: PrimeLearningObjectInstanceEnrollment) => {
    if (checkIfLinkedInLearningCourse(training) && getALMConfig().handleLinkedInContentExternally) {
      return launchContentUrlInNewWindow(training, coreContentModules[0]);
    }
    if (isFlexLPOrContainsFlexLP) {
      const sectionSubLOs = getSectionLOsOrder(training);
      let subLoToLaunch;

      if (training.isSubLoOrderEnforced && action === START) {
        // Launch the first course if subLoOrder is enforced after enrollment, if instance not selected throw error
        const firstSubLO = sectionSubLOs[0][0];
        subLoToLaunch = firstSubLO.loType === COURSE ? firstSubLO : firstSubLO.subLOs[0]; // For LP, we take the first course of the first section
      } else {
        let launchSubLO;
        for (const section of sectionSubLOs) {
          launchSubLO = findSubLoToLaunchForFlexLp(section);
          if (launchSubLO && Object.keys(launchSubLO).length !== 0) {
            break;
          }
        }
        subLoToLaunch = launchSubLO
          ? getFirstSubLoOfParentLo(launchSubLO)
          : getFirstSubLoOfParentLo(sectionSubLOs[0][0]);
      }
      const trainingId = subLoToLaunch && subLoToLaunch.id;
      const trainingName = subLoToLaunch?.localizedMetadata[0].name || "";
      const selectedInstanceDetails =
        trainingId && getCourseInstanceMapping(courseInstanceMapping, trainingId);

      const trainingInstanceId =
        (subLoToLaunch &&
          isValidSubLoForFlexLpToLaunch(subLoToLaunch) &&
          subLoToLaunch.enrollment.loInstance.id) ||
        selectedInstanceDetails?.instanceId;

      if (!trainingInstanceId) {
        almAlert(
          true,
          GetTranslationReplaced("alm.flexlp.error.player.select.instance", trainingName, true),
          AlertType.error
        );
        return;
      }

      launchPlayerHandler({
        id: trainingId,
        moduleId: "",
        trainingInstanceId: trainingInstanceId,
      });
    } else if (enrollViaModuleClick.id) {
      // for enrollment done via module click, open that course module in player
      const { id, moduleId, instanceId, isMultienrolled } = enrollViaModuleClick;
      launchPlayerHandler({
        id: id,
        moduleId: moduleId,
        trainingInstanceId: instanceId,
        isMultienrolled: isMultienrolled,
      });
    } else if (isMultiEnrollmentEnabled) {
      const isMultienrolled =
        getEnrolledInstancesCount(training) > 1 ||
        (newEnrollment && primaryEnrollment !== newEnrollment);
      launchPlayerHandler({
        id: training.id,
        moduleId: "",
        trainingInstanceId: trainingInstance.id,
        isMultienrolled: isMultienrolled,
        isResetRequired: resetAttemptForFirstModule,
      });
    } else {
      if (!newEnrollment) {
        launchPlayerForExistingEnrollment();
      } else {
        launchPlayerForNewEnrollmentOrRevisit();
      }
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

  const handleCartAction = useCallback(() => {
    if (action === ADD_TO_CART_ACTION) {
      addToCart();
    } else if (action === ADD_TO_CART_NATIVE_ACTION) {
      addToCartNative();
    } else if (action === BUY_NOW_NATIVE_ACTION) {
      buyNowNative();
    }
  }, [action]);

  const addToCart = async () => {
    try {
      storeActionInNonLoggedMode(ADD_TO_CART);
      const { error, totalQuantity } = await addToCartHandler();
      if (isPrimeUserLoggedIn) {
        if (error && error.length) {
          let errorKey = "alm.addToCart.general.error";
          error?.forEach((item: any) => {
            if (item && item.message && item.message?.includes("exceeds the maximum qty allowed")) {
              errorKey = "alm.overview.added.to.cart.error";
            }
          });
          almAlert(true, formatMessage({ id: errorKey }, { loType: loType }), AlertType.error);
        } else {
          getALMObject().updateCart(totalQuantity);
          almAlert(true, formatMessage({ id: "alm.addedToCart" }), AlertType.success);
        }
      }
    } catch (e) {}
  };

  const addToCartNative = async () => {
    try {
      if (!isPrimeUserLoggedIn) return;
      const { redirectionUrl, error } = await addToCartNativeHandler();
      if (error && error.length) {
        let errorKey = "alm.addToCart.general.error";
        error?.forEach((item: any) => {
          if (item && item === ERROR_ALREADY_ADDED) {
            errorKey = "alm.overview.added.to.cart.error";
          }
        });
        almAlert(true, formatMessage({ id: errorKey }, { loType: loType }), AlertType.error);
      } else {
        sendEvent(ALM_FETCH_CART);
        almAlert(true, formatMessage({ id: "alm.addedToCart" }), AlertType.success);
      }
    } catch (e) {}
  };

  const buyNowNative = async () => {
    try {
      if (!isPrimeUserLoggedIn) return;
      const { redirectionUrl, error } = await buyNowNativeHandler();
      if (error && error.length) {
        const errorKey = "alm.addToCart.general.error";
        almAlert(true, formatMessage({ id: errorKey }, { loType: loType }), AlertType.error);
      } else {
        if (redirectionUrl && window.parent) {
          window.parent.location = redirectionUrl;
        } else if (redirectionUrl) {
          window.location.href = redirectionUrl;
        }
      }
    } catch (e) {}
  };

  const showBadges = badge?.badgeUrl;

  const showAuthors =
    showAuthorInfo === "true" &&
    training.authorNames?.length > 0 &&
    getALMObject().isPrimeUserLoggedIn();
  const externalAuthorString = useMemo(() => {
    return GetTranslation("alm.text.externalAuthor");
  }, []);

  const renderAuthorDetails = () => {
    if (shouldShowOnlyExternalAuthor(training)) {
      return externalAuthorDetails;
    }
    return (
      <>
        {training?.authorDetails?.map(
          author => isAuthorExternal(author) && getAuthorDetails(author, true)
        )}
        {training?.authors?.map(author => getAuthorDetails(author, false))}
        {legacyAuthorNames && showLegacyAuthorDetails}
      </>
    );
  };
  const getAuthorDetailElement = (authorName: string) => (
    <div className={styles.authorHeader} data-automationid="avatar-image">
      <span
        className={styles.cpauthorcircle}
        data-automationid="default-avatar"
        aria-label={GetTranslation("author.avatar.text")}
      >
        {DEFAULT_USER_SVG()}
      </span>
      <span className={styles.externalAuthor} data-automationid={authorName}>
        {authorName}
      </span>
    </div>
  );
  const legacyAuthorNames = new Set(training.authorNames);
  training.authorDetails?.forEach(author => {
    legacyAuthorNames.delete(author.authorName);
  });
  const externalAuthorDetails = useMemo(() => {
    return getAuthorDetailElement(externalAuthorString);
  }, [shouldShowOnlyExternalAuthor]);

  const showLegacyAuthorDetails = useMemo(() => {
    return Array.from(legacyAuthorNames).map(authorName => getAuthorDetailElement(authorName));
  }, [legacyAuthorNames]);

  const showEnrollmentDeadline = !enrollment && trainingInstance.enrollmentDeadline;

  const getUnenrollmentConfirmationString = () => {
    if (isMultiEnrollmentEnabled && hasMultipleInstances) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: GetTranslation("alm.overview.instance.multi.unenroll.confirmation", true),
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
    let displayResource: boolean = false;
    if (subLOs?.length) {
      displayResource = subLOs.some(item => {
        //when the sub LO is a learing program only then we show the resources from a sub LO
        if (item.loType === "learningProgram" && item.supplementaryResources?.length) {
          return true;
        }
      });
    }
    return displayResource;
  };

  // Job aids not supported in non-logged
  const supplementaryLOs = training.supplementaryLOs;
  const jobAidsForCourse = isCourse && supplementaryLOs?.length;
  const jobAidsForLp =
    isLP &&
    (supplementaryLOs?.length ||
      training.subLOs?.some(item => item.supplementaryLOs !== undefined));
  const showJobAids = (jobAidsForCourse || jobAidsForLp) && isPrimeUserLoggedIn;
  const showResource = training.supplementaryResources?.length || childLpHasResource();

  const isUnenrollmentDeadlinePassed = trainingInstance.unenrollmentDeadline
    ? checkIfUnenrollmentDeadlinePassed(trainingInstance)
    : false;
  const showUnenrollForPendingApproval = isCertification
    ? isPendingApproval && training?.unenrollmentAllowed
    : isPendingApproval;
  const canUnenroll =
    (enrollment &&
      training.unenrollmentAllowed &&
      !(enrollment?.state === COMPLETED || enrollment?.progressPercent === 100)) ||
    showUnenrollForPendingApproval;
  const showCompletionDeadline = primaryEnrollment && primaryEnrollment.completionDeadline;
  const showEnrollmentDeadlineData = enrollmentDeadline && showEnrollmentDeadline;
  const showUnenrollmentDeadlineData =
    unenrollmentDeadline && !showEnrollmentDeadline && canUnenroll;

  const enrollmentDeadlineContainer = showEnrollmentDeadlineData ? (
    <>
      <div
        className={styles.bodyHeader}
        data-automationid={GetTranslation("alm.overview.enrollment.deadline")}
      >
        {GetTranslation(`alm.overview.enrollment.deadline`)}
      </div>
      <div
        className={styles.bodyText}
        data-automationid={modifyTime(trainingInstance.enrollmentDeadline, locale)}
      >
        {modifyTime(trainingInstance.enrollmentDeadline, locale)}
      </div>
    </>
  ) : (
    ""
  );

  const completionDeadlineData = useMemo(() => {
    if (!isCertification) {
      return modifyTime(completionDeadline, locale);
    }
    if (showCompletionDeadline) {
      return modifyTime(showCompletionDeadline, locale)?.slice(0, -10);
    }
    return formatMessage(
      { id: "alm.overview.certification.deadline" },
      { 0: trainingInstance?.completionDeadline?.slice(0, -1) }
    );
  }, [loType, showCompletionDeadline, trainingInstance, completionDeadline]);

  const completionDeadlineContainer = completionDeadline ? (
    <>
      <div
        className={styles.bodyHeader}
        data-automationid={`completion-deadline-info - ${completionDeadlineData}`}
      >
        {GetTranslation(`alm.overview.completion.deadline`)}
      </div>
      <div className={styles.bodyText}>{completionDeadlineData}</div>
    </>
  ) : (
    ""
  );

  const unenrollmentDeadlineContainer = showUnenrollmentDeadlineData ? (
    <>
      <div className={styles.bodyHeader} data-automationid="unenrollment-deadline">
        {formatMessage({
          id: "alm.overview.unenrollment.deadline",
          defaultMessage: "Unenrollment - ",
        })}
      </div>
      <div
        className={` ${styles.bodyText} ${isUnenrollmentDeadlinePassed ? styles.unenrollmentDeadlinePassed : ""}`}
      >
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
        new Date(training.dateCreated) <= new Date(account.lastSyncedDateCreatedForMagento)
      ) {
        setIsTrainingSynced(true);
      } else {
        setIsTrainingSynced(false);
      }
    };
    computeIsSynced();
  }, [training.dateCreated, loPrice]);

  const trainingNotAvailableForPurchaseText = !isTrainingSynced ? (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {formatMessage(
        {
          id: "alm.training.overview.not.available",
        },
        { training: GetTranslation(`alm.training.${loType}`, true) }
      )}
    </p>
  ) : isFlexLPOrContainsFlexLP && courseIdList.length === 0 ? (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {GetTranslation("alm.flexlp.addToCart", true)}
    </p>
  ) : (
    ""
  );

  const enrollmentDeadlinePassedText =
    !isInstanceRetired && hasEnrollmentDeadlinePassed ? (
      <p className={`${styles.errorText} ${styles.centerAlign}`}>
        {formatMessage({
          id: "alm.training.overview.enrollmentDeadline.passed",
        })}
      </p>
    ) : (
      ""
    );

  const showInstanceContainerDetail = () => {
    const progressMessage = GetTranslation(`alm.overview.instanceSwitch.tooltip`, true);

    if (isAutoInstanceEnrolled) {
      return "";
    }
    return (
      <>
        {primaryEnrollment && training.instanceSwitchEnabled && !hasCompletedPrimaryEnrollment && (
          <div className={styles.bodyHeader} data-automationid="instance-switch-description">
            {GetTranslation(`alm.instance.switch.detail`, true)}
            <ALMTooltip message={progressMessage}></ALMTooltip>
          </div>
        )}
        {primaryEnrollment && isMultiEnrollmentEnabled && !isEnrollButtonDisabled && (
          <div className={styles.bodyHeader} data-automationid="multi-enrollment-description">
            {enrollment
              ? GetTranslation(`alm.multi.enrollment.enrolled.instance.detail`, true)
              : GetTranslation(`alm.multi.enrollment.unenrolled.instance.detail`, true)}
          </div>
        )}
      </>
    );
  };
  const getMandatoryModulesCount = useMemo(() => {
    let count = 0;
    trainingInstance?.loResources?.forEach(resource => {
      if (resource.mandatory) {
        count += 1;
      }
    });
    return count;
  }, [hasOptionalLoResources]);
  const mandatoryModulesCount = hasOptionalLoResources
    ? getMandatoryModulesCount
    : training.loResourceCompletionCount;

  const coreContentModules = filterLoReourcesBasedOnResourceType(trainingInstance, CONTENT);
  const showMandatoryModulesCount =
    mandatoryModulesCount > 0 && mandatoryModulesCount != coreContentModules?.length;

  const coreContentCompleted = useMemo(() => {
    // show completion status only for course and LP
    if (!isEnrolled) {
      return;
    }
    let completionCount = 0;
    if (isCourse) {
      enrollment?.loResourceGrades?.forEach((item: PrimeLearningObjectResourceGrade) => {
        if (item.completed && item.loResource.loResourceType === CONTENT) {
          completionCount += 1;
        }
      });
    } else if (isLP) {
      training.subLOs.forEach(subLO => {
        if (subLO.enrollment?.state === COMPLETED || subLO.enrollment?.progressPercent === 100) {
          completionCount += 1;
        }
      });
    }
    return completionCount;
  }, [coreContentModules?.length, isEnrolled, enrollment?.loResourceGrades, loType]);

  function parseURLForHTTP(url: string) {
    const pattern = /^(ftp|http|https):\/\//;
    if (!pattern.test(url)) {
      url = "http://" + url;
    }
    return url;
  }
  const openResourceLink = (item: PrimeResource) => {
    if (item.isExternalUrl) {
      const win = getWindowObject().open(parseURLForHTTP(item.location), "_blank");
      win?.focus();
      return;
    } else {
      downloadFile(item.location);
    }
  };
  const renderResources = (training: PrimeLearningObject) => {
    return training?.supplementaryResources?.map((item, index) => {
      if (enrollment) {
        const { name, isExternalUrl, id } = item;
        return (
          <div className={styles.loResources} data-automationid={name} key={index}>
            <span className={styles.resourceName}>{name}</span>
            <a
              href="javascript:void(0)"
              className={styles.supplymentaryLoName}
              onClick={() => openResourceLink(item)}
              key={id}
            >
              {isExternalUrl ? LO_RESOURCE_LINK_ICON() : LO_RESOURCE_DOWNLOAD_ICON()}
            </a>
          </div>
        );
      } else {
        return <div className={styles.subtleText}>{item.name}</div>;
      }
    });
  };

  const renderResourcesFromChildLP = (training: PrimeLearningObject) => {
    //if parent LP has resources don't render resources from child lp
    if (training?.supplementaryResources?.length) {
      return;
    }
    return subLOs?.map((loItem: any) => {
      if (loItem.loType === "learningProgram") {
        return renderResources(loItem);
      }
    });
  };

  const checkConflictingSessions = async () => {
    const conflictingSessions = await getConflictingSessions(training.id, trainingInstance.id);
    if (!conflictingSessions || conflictingSessions.length === 0) {
      handleEnrollment();
      return;
    }

    SessionConflictDialog({
      conflictingSessionsList: conflictingSessions,
      locale: locale,
      handleEnrollment: handleEnrollment,
      confirmationDialog: almConfirmationAlert,
      delay: 300,
    });
  };
  useEffect(() => {
    const queryParams = getQueryParamsFromUrl();
    if (isPrimeUserLoggedIn && !checkIsEnrolled(training.enrollment) && queryParams?.action) {
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
          checkConflictingSessions();
          break;
      }
    }
  }, []);

  const changeInstanceText = hasMultipleInstances && (
    <a className={`${styles.allInstances} ${styles.centerAlign}`} onClick={viewAllInstanceHandler}>
      {GetTranslation(`alm.overview.waitlist.change.instance`, true)}
    </a>
  );

  const enrollmentDisabledInfoText = (
    <p className={styles.centerAlign}>
      {primaryEnrollment?.state === COMPLETED
        ? GetTranslation(`alm.instance.completed`, true)
        : GetTranslation(`alm.instance.enrolled`, true)}
    </p>
  );

  // Enrolled courses inside flex lp, for which instance not selected
  const instanceNotSelectedInfoText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      <span className={styles.warningIcon}>{Warning_ICON()}</span>
      <span>{GetTranslation(`alm.overview.flexlp.course.instance.not.selected`, true)}</span>
    </p>
  );

  const navigateToEnrolledInstance = (
    <a className={`${styles.allInstances} ${styles.centerAlign}`} onClick={viewPrimaryEnrollment}>
      {GetTranslation(`alm.visit.enrolled.instance`, true)}
    </a>
  );

  const requireManagerApprovalText = (
    <p className={styles.centerAlign}>
      {formatMessage({
        id: "alm.overview.request.manager.approval",
      })}
    </p>
  );

  const pendingApprovalText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {GetTranslation("alm.overview.pending.approval", true)}
    </p>
  );

  const showEnrollmentInfoText = () => {
    if (courseInstanceNotSelected) {
      return <>{instanceNotSelectedInfoText}</>;
    } else if (isPendingApproval && enrollment?.state !== PENDING_APPROVAL) {
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
          {/* Only for instance switch enabled courses */}
          {isSwitchToOtherInstanceDisabled ? (
            <>
              <p className={styles.centerAlign}>{GetTranslation(`alm.instance.completed`, true)}</p>
              {navigateToEnrolledInstance}
            </>
          ) : (
            <>
              {enrollmentDeadlinePassedText}
              {seatsAvailableText}
            </>
          )}
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
      if (!checkIfEnrollmentDeadlineNotPassed(trainingInstance)) {
        return "alm.overview.manager.approval.pending.enrollment.deadline.passed";
      } else if (isInstanceRetired) {
        return GetTranslation("alm.overview.manager.approval.pending.singleInstance", true);
      } else {
        return "alm.overview.manager.approval.pending";
      }
    } else if (!checkIfEnrollmentDeadlineNotPassed(trainingInstance)) {
      return GetTranslation(
        "alm.overview.manager.approval.pending.enrollment.deadline.passed.change.instance",
        true
      );
    } else if (isInstanceRetired) {
      return GetTranslation("alm.overview.manager.approval.pending.instance.retired", true);
    } else {
      return "alm.overview.manager.approval.pending";
    }
  };

  const hasContentModule = () => {
    return coreContentModules && coreContentModules[0];
  };

  const isLpOrCert = () => {
    return subLOs && subLOs[0];
  };

  const hasFirstSubLoAsLP = () => {
    return subLOs[0].loType === LEARNING_PROGRAM;
  };

  const getModuleTypeOfFirstSubLo = () => {
    let firstLoInstance = subLOs[0].instances[0];
    if (hasFirstSubLoAsLP()) {
      firstLoInstance = firstLoInstance?.subLoInstances?.[0];
    }
    return firstLoInstance?.loResources?.[0].resourceType;
  };

  const isFirstResourceType = (type: string) => {
    return (
      (hasContentModule() && coreContentModules[0].resourceType === type) ||
      (isLpOrCert() && type === getModuleTypeOfFirstSubLo())
    );
  };

  const isFirstModuleCrOrVc = () => {
    return isFirstResourceType(CLASSROOM) || isFirstResourceType(VIRTUAL_CLASSROOM);
  };

  function disableStartForCourse(course: PrimeLearningObject): boolean {
    const isModuleCrOrVc = isFirstModuleCrOrVc();
    const coreContentOfTheCourse = filterLoReourcesBasedOnResourceType(
      course?.enrollment?.loInstance,
      CONTENT
    );
    // If the course has more than one core content modules
    if (coreContentOfTheCourse?.length > 1 || !isModuleCrOrVc) {
      return false;
    }
    //If the course has only one module and its cr/vc then disable it
    return shouldDisableStart(coreContentOfTheCourse, isModuleCrOrVc);
  }

  function disableStartForLPOrCert(training: PrimeLearningObject): boolean {
    // If LP/Cert has more than one subLo then don't disable start button
    if (training?.subLOs?.length > 1) {
      return false;
    }
    //recursively check if childLo is LP/ course then check the condition for course
    const childLo = training?.subLOs?.[0];
    if (childLo.loType === COURSE) {
      return disableStartForCourse(childLo);
    }
    return disableStartForLPOrCert(childLo);
  }

  function disableStartForCrOrVc(): boolean {
    if (isCourse) {
      return disableStartForCourse(training);
    }
    return disableStartForLPOrCert(training);
  }

  const isButtonDisabled = () => {
    return (
      (action === START &&
        (!arePrerequisitesEnforcedAndCompleted(training) ||
          hasPrerequisites ||
          disableStartForCrOrVc())) ||
      courseInstanceNotSelected ||
      (primaryEnrollment && isFlexLPOrContainsFlexLP && !courseInstanceInsideFlexLPSelected) ||
      timeBetweenAttemptEnabled
    );
  };

  const extensionLocalizedMetadata = useMemo(() => {
    if (!overviewExtension) {
      return {} as any;
    }
    return getPreferredLocalizedMetadata(overviewExtension.localizedMetadata, contentLocale);
  }, [overviewExtension, contentLocale]);

  const handleExtensionClick = (extension: PrimeExtension) => {
    extension && isExtensionAllowed(extension) && setActiveExtension(extension);
  };

  const isEnrollExtensionAllowed =
    enrollExtension && !isExtensionAllowed(enrollExtension) ? true : false;
  const enrollButtonNotAvailableText =
    !enrollment && isEnrollExtensionAllowed
      ? formatMessage({
          id: "alm.extension.feature.not.supported",
          defaultMessage:
            "This feature is currently not available on teams app, please login to ALM to access this feature.",
        })
      : "";
  const showCoreContent = isEnrolled && (isCourse ? coreContentModules : isLP);
  const getTranslatedStringsForCompletionCriteria = (
    text: string,
    minimiumCount: number,
    totalCount: number
  ) => {
    return GetTranslationsReplaced(
      text,
      {
        x: minimiumCount,
        y: totalCount,
      },
      true
    );
  };

  const getCompletionStatus = (minimumCount: any, completionTitle: string, totalCount: number) => {
    const moduleDataForCourse = isCourse
      ? getTranslatedStringsForCompletionCriteria("alm.modules.required", minimumCount, totalCount)
      : getTranslatedStringsForCompletionCriteria(
          "alm.modules.completed",
          minimumCount,
          totalCount
        );
    const toolTipForCourse = hasOptionalLoResources
      ? GetTranslation("msg.info.mandatory.module.completion", true)
      : getTranslatedStringsForCompletionCriteria(
          "alm.text.required.modules.tooltip",
          minimumCount,
          totalCount
        );
    const toolTipForCert = getTranslatedStringsForCompletionCriteria(
      "alm.text.required.courses.tooltip",
      minimumCount,
      totalCount
    );
    const moduleDataForCert = getTranslatedStringsForCompletionCriteria(
      "alm.courses.required",
      minimumCount,
      totalCount
    );
    const moduleData = isCertification ? moduleDataForCert : moduleDataForCourse;
    const toolTipString = isCertification ? toolTipForCert : toolTipForCourse;
    return (
      <>
        <div className={styles.bodyHeader} data-automationid={completionTitle}>
          {completionTitle}
        </div>
        <div className={styles.bodyText} data-automationid={moduleData}>
          {moduleData}
          {completionTitle === GetTranslation("alm.minimum.module.required", true) && (
            <ALMTooltip message={toolTipString}></ALMTooltip>
          )}
        </div>
      </>
    );
  };
  const isCompletionStatusAvailable = useCallback(() => {
    //Adding true/false because it was rendering the number on UI
    return showMandatoryModulesCount || showCoreContent ? true : false;
  }, [mandatoryModulesCount, coreContentCompleted]);
  const showMetaDataContainer = isCompletionStatusAvailable() || doLoSkillsExist || isCertification;
  const showCompletionStatus = () => {
    const totalCount = !isCourse ? training?.subLOs.length : coreContentModules?.length;
    const mandatoryModules = showMandatoryModulesCount && (
      <div>
        {getCompletionStatus(
          mandatoryModulesCount,
          GetTranslation("alm.minimum.module.required", true),
          totalCount
        )}
      </div>
    );
    const coreContent = !isCertification && showCoreContent && (
      <div>
        {getCompletionStatus(
          coreContentCompleted,
          GetTranslation("alm.catalog.card.complete.label"),
          totalCount
        )}
      </div>
    );
    // Return null if neither mandatoryModules nor coreContent is available
    if (!mandatoryModules && !coreContent) {
      return null;
    }
    return (
      <div>
        {mandatoryModules}
        {coreContent}
      </div>
    );
  };

  const showCertificationType = (
    certTypeIcon: JSX.Element,
    certTypeHeader: string,
    validityText: string,
    invalidityText: string
  ) => {
    return (
      <>
        <div className={styles.headerContainer}>
          <div className={styles.metadataIcons}>{certTypeIcon}</div>
          <div className={styles.headerText} data-automationid={certTypeHeader}>
            {certTypeHeader}
          </div>
        </div>
        <div className={styles.bodyText} data-automationid="certification-validity">
          {trainingInstance?.validity ? validityText : invalidityText}
        </div>
      </>
    );
  };
  const showTypeOfCertification = () => {
    return showCertificationType(
      CERTIFICATION_TYPE_ICON(),
      GetTranslation("alm.overview.certification.type", true),
      GetTranslation("alm.overview.certification.recurring"),
      GetTranslation("alm.overview.certification.non.recurring")
    );
  };
  const showValidityOfCertification = () => {
    return showCertificationType(
      CERTIFICATION_VALIDITY_ICON(),
      GetTranslation("alm.overview.certification.validity", true),
      formatMessage(
        { id: "alm.overview.certification.durationTime" },
        { 0: trainingInstance?.validity?.slice(0, -1) }
      ),
      formatMessage({
        id: "alm.certification.type",
        defaultMessage: "Perpetual",
      })
    );
  };

  const getInstanceDetailsHeader = useMemo(
    () => (
      <div className={styles.headerContainer}>
        <div className={styles.metadataIcons}>{INSTANCES_ICON()}</div>
        <div
          className={styles.headerText}
          data-automationid={GetTranslation("alm.instance.details")}
        >
          {GetTranslation(`alm.instance.details`, true)}
        </div>
      </div>
    ),
    []
  );

  const getAutoInstanceDetails = useMemo(
    () =>
      training?.instances.length > 2 ? (
        <div className={styles.paddingSeperator}>
          {getInstanceDetailsHeader}
          <div className={styles.bodyText} data-automationid="instance-name">
            {GetTranslation(`alm.text.autoInstance`, true)}
          </div>
        </div>
      ) : null,
    [training?.instances.length, getInstanceDetailsHeader]
  );
  const showInstanceConfiguration = () =>
    isAutoInstanceEnrolled && isCourseEnrolledInstanceAutoInstance
      ? getAutoInstanceDetails
      : hasMultipleInstances &&
        isCourse && (
          <div className={styles.paddingSeperator}>
            {getInstanceDetailsHeader}
            <div className={styles.bodyText} data-automationid="instance-name">
              {
                <>
                  {trainingInstance.localizedMetadata[0].name}
                  <a
                    className={styles.allInstances}
                    onClick={e => {
                      e.preventDefault();
                      viewAllInstanceHandler();
                    }}
                    href="javascript:void(0)"
                    tabIndex={0}
                    aria-label={GetTranslation(`alm.instances`, true)}
                  >
                    {GetTranslation(`alm.instances`, true)}
                  </a>
                </>
              }
            </div>
            {!isPrimaryEnrollmentWaitlisted && showInstanceContainerDetail()}
          </div>
        );

  const showBadgeContainer = () => {
    return (
      showBadges && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{BADGES_RECIEVED_ICON()}</div>
            <div
              className={styles.headerText}
              data-automationid={GetTranslation("alm.overview.badge")}
            >
              {GetTranslation(`alm.overview.badge`, true)}
            </div>
          </div>
          <div className={styles.bodyText} data-automationid="badgeUrl">
            {<img src={badge.badgeUrl} alt="badge" width={"35px"} height={"35px"} />}
          </div>
        </div>
      )
    );
  };
  const showLOSkills = () => {
    return (
      doLoSkillsExist && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{LO_SKILLS_ICON()}</div>
            <div className={styles.headerText} data-automationid="skills-achieved">
              {GetTranslation(`alm.overview.skills.achieve.level.${loType}`, true)}
            </div>
          </div>
          {filteredSkills?.map(skill => {
            return (
              <div className={styles.bodyText} key={skill.name} data-automationid={skill.name}>
                {skill.name} -{" "}
                <span className={styles.skillLevel}>
                  {skill.levelName}{" "}
                  {!isLP &&
                    formatMessage({ id: "alm.training.skill.credits" }, { x: skill.credits })}
                </span>
              </div>
            );
          })}
        </div>
      )
    );
  };
  const isAuthorExternal = (author: any) => {
    return author.authorType == EXTERNAL_STR;
  };
  const navigateToAuthorPage = (author: any) => {
    if (isAuthorExternal(author)) {
      alm.navigateToAuthorPage(author.authorId, true, author.authorName);
    } else {
      alm.navigateToAuthorPage(author.id);
    }
  };
  const getAuthorDetails = (author: any, isLegacy: boolean) => {
    const keyValue = isLegacy ? author.authorId : author.id;
    const authorName = isLegacy ? author.authorName : author.name;
    return (
      <div key={keyValue}>
        <div className={styles.authorHeader} data-automationid="avatar-image">
          {isLegacy ? (
            <span className={styles.cpauthorcircle} data-automationid="default-avatar">
              {DEFAULT_USER_SVG()}
            </span>
          ) : (
            <img
              className={styles.cpauthorcircle}
              src={author.avatarUrl}
              alt={GetTranslation("author.avatar.text")}
            />
          )}
          <a
            className={styles.authorNames}
            data-automationid={`author-name- ${authorName}`}
            onClick={e => {
              e.preventDefault();
              navigateToAuthorPage(author);
            }}
            href="#"
            aria-label={authorName}
            tabIndex={0}
          >
            {authorName}
          </a>
        </div>
      </div>
    );
  };
  const showAuthorDetails = () => {
    return (
      showAuthors && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{LO_AUTHORS_ICON()}</div>
            <div
              className={styles.headerText}
              data-automationid={GetTranslation("alm.text.author(s)")}
            >
              {GetTranslation("alm.text.author(s)")}
            </div>
          </div>
          {renderAuthorDetails()}
        </div>
      )
    );
  };

  const showWhoShouldAttend = () => {
    const whoShouldTake =
      training.loType === COURSE && training?.whoShouldTake && training.whoShouldTake.join(", ");
    return (
      whoShouldTake && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{WHO_SHOULD_ATTEND_ICON()}</div>
            <div className={styles.headerText} data-automationid="who-should-attend">
              {GetTranslation("alm.overview.who.should.attend")}
            </div>
          </div>
          <div className={styles.bodyText} data-automationid="who-should-attend-text">
            {whoShouldTake}
          </div>
        </div>
      )
    );
  };
  const getProductOrRoleLevel = (level: string) => {
    let id = "alm.catalog.filter.beginner";
    let defaultMessage = "Beginner";
    switch (level) {
      case INTERMEDIATE:
        id = "alm.catalog.filter.intermediate";
        defaultMessage = "Intermediate";
        break;
      case ADVANCED:
        id = "alm.catalog.filter.advanced";
        defaultMessage = "Advanced";
    }
    return formatMessage({
      id: id,
      defaultMessage: defaultMessage,
    });
  };
  const getProductsOrRoles = (
    productsOrRoles: PrimeRecommendations[],
    headerText: string,
    showLevels: boolean
  ) => {
    return (
      <>
        <div className={styles.metaDataHeader} data-automationid={headerText}>
          {headerText} {showLevels && GetTranslation("alm.level")}
        </div>
        <div className={styles.metaDataText}>
          {productsOrRoles.map(productsOrRole => {
            return (
              <div
                className={styles.recommendation}
                key={productsOrRole.id}
                data-automationid={productsOrRole.name}
              >
                <div className={styles.recommendationText}>{productsOrRole.name}</div>
                {productsOrRole.levels && (
                  <span> ({getProductOrRoleLevel(productsOrRole.levels[0])})</span>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };
  const showLevels = (productsOrRoles: PrimeRecommendations[]): boolean => {
    return productsOrRoles?.some(item => item.levels !== undefined);
  };
  const showRecomendations = () => {
    const products = training.products;
    const showProductLevels = showLevels(products);
    const productsForLo =
      products &&
      getProductsOrRoles(products, GetTranslation("alm.lo.products", true), showProductLevels);
    const roles = training.roles;
    const showRoleLevels = showLevels(roles);
    const rolesForLo =
      roles && getProductsOrRoles(roles, GetTranslation("alm.lo.roles", true), showRoleLevels);
    if (!productsForLo && !rolesForLo) {
      return null;
    }
    return (
      <div>
        {productsForLo}
        {rolesForLo}
      </div>
    );
  };
  const isRecommendationAvailable = training.products || training.roles;
  const getJobAids = (resources: PrimeJobAidTrainingMap[]) => {
    return resources.map((resource, index) => {
      return (
        <PrimeTrainingPageExtraJobAid
          resource={resource.resource}
          training={resource.item}
          key={index}
          enrollmentHandler={enrollmentHandler}
          unEnrollmentHandler={unEnrollmentHandler}
          jobAidClickHandler={jobAidClickHandler}
        />
      );
    });
  };
  const getAllJobAidsForTraining = useMemo(() => {
    const resources: PrimeJobAidTrainingMap[] = [];
    if (isCourse) {
      resources.push(...getAllJobAidsInTraining(training));
    } else if (isLP) {
      training.subLOs.forEach(lo => {
        resources.push(...getAllJobAidsInTraining(lo));
      });
    }
    const uniqueResources = Array.from(new Map(resources.map(r => [r.resource.id, r])).values());
    return uniqueResources;
  }, [training.supplementaryLOs]);
  const showJobAidsForLO = () => {
    return (
      showJobAids && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{LO_JOBAID_ICON()}</div>
            <div className={styles.headerText} data-automationid="JobAids">
              {GetTranslation("alm.training.jobAid", true)}
            </div>
          </div>
          <div className={styles.bodyText}>{getJobAids(getAllJobAidsForTraining)}</div>
        </div>
      )
    );
  };
  const avgRating = useMemo(() => {
    return primaryEnrollment?.rating || training?.rating?.averageRating;
  }, [primaryEnrollment?.rating, training?.rating?.averageRating]);
  const showRatingDialog = () => {
    return (
      <div className={`${styles.submitRatingBox} ${styles.borderContainer}`}>
        <StarRatingSubmitDialog
          key={avgRating}
          ratingGiven={avgRating}
          updateRating={updateRating}
          training={training}
          trainingInstance={trainingInstance}
          loType={loType}
        />
      </div>
    );
  };
  const displayratingDialog = showRatingDialog();
  const showLOResources = () => {
    return (
      showResource && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{LO_RESOURCES_ICON()}</div>
            <div
              className={styles.headerText}
              data-automationid={formatMessage({
                id: "alm.text.resources",
                defaultMessage: "Resources",
              })}
            >
              {formatMessage({
                id: "alm.text.resources",
                defaultMessage: "Resources",
              })}
            </div>
          </div>
          <div className={styles.bodyText}>
            {renderResources(training)}
            {renderResourcesFromChildLP(training)}
          </div>
        </div>
      )
    );
  };
  const showNativeExtensions = () => {
    return (
      overviewExtension && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer}>
            <div className={styles.metadataIcons}>{NATIVE_EXTENSIBILITY_ICON()}</div>
            <div className={styles.headerText}>
              {GetTranslation("alm.extension.overview.other.details")}
            </div>
          </div>
          <a
            className={styles.allInstances + " " + styles.extensions}
            role="button"
            tabIndex={0}
            href="javascript:void(0)"
            onClick={() => handleExtensionClick(overviewExtension)}
          >
            {extensionLocalizedMetadata?.label}
          </a>
        </div>
      )
    );
  };
  const showAlternateLanguages = () => {
    return (
      alternativesLangAvailable.length > 0 && (
        <div className={styles.paddingSeperator}>
          <div className={styles.headerContainer} data-automationid="alternate-languages-available">
            <div className={styles.metadataIcons}>{LO_LANGUAGES_AVAILABLE_ICON()}</div>
            <div className={styles.headerText}>
              {formatMessage({
                id: "alm.overview.alternativesAvailable",
                defaultMessage: "Alternatives Available",
              })}

              <ALMTooltip
                message={formatMessage({
                  id: "alm.overview.alternativesAvailable.toolTip",
                  defaultMessage:
                    "You can change the language or the format of the content in the player.",
                })}
              ></ALMTooltip>
            </div>
          </div>
          {alternativesLangAvailable?.map(language => {
            return (
              <div className={styles.bodyText} data-automationid={language} key={language}>
                {language}
              </div>
            );
          })}
        </div>
      )
    );
  };

  const getFlexLpEnrollmentFailedTitle = () => {
    if (flexLPCoursesList.enrolledCourses.length > 0) {
      return GetTranslation("alm.flexlp.text.partial.enrollment");
    }
    return GetTranslation("alm.flexlp.text.unsuccess.enrollment");
  };

  const getFlexLpEnrollmentFailedMessage = () => {
    return (
      <>
        {flexLPCoursesList.enrolledCourses.length > 0 && (
          <>
            <p className={styles.flexLpEnrollmentErrorText}>
              {GetTranslation("alm.flexlp.error.enroll.successCourses", true)}
            </p>
            <ul className={styles.flexLpEnrollmentErrorText}>
              {flexLPCoursesList.enrolledCourses.map(
                (course: { name: string; id: string }, index: number) => {
                  return (
                    <li key={index} data-automationid={course.name}>
                      {course.name}
                    </li>
                  );
                }
              )}
            </ul>
          </>
        )}
        <p className={styles.flexLpEnrollmentErrorText}>
          {GetTranslation("alm.flexlp.error.enroll", true)}
        </p>
        <ul>
          {flexLPCoursesList.unenrolledCourses.map(
            (course: { name: string; id: string }, index: number) => {
              return (
                <li key={index} data-automationid={course.name}>
                  {course.name}
                </li>
              );
            }
          )}
        </ul>
        <p className={styles.flexLpRetryEnrollmentText}>
          {GetTranslation("alm.flexlp.error.retry.enroll", true)}
        </p>
      </>
    );
  };
  const handleRegisterInterest = async (
    method: string,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await registerInterestHandler(method);
      almAlert(true, successMessage, AlertType.success);
    } catch (error) {
      almAlert(true, errorMessage, AlertType.error);
    }
  };
  const getRelatedLos = (
    relatedLoList: PrimeLearningObject[],
    relatedLoText: string,
    showDescription?: string
  ) => {
    return Object.keys(relatedLoList[0] || {}).length ? (
      <div className={`${styles.borderContainer} ${styles.paddingSeperatorForBorderContainer}`}>
        <PrimeTrainingRelatedLoList
          relatedLOs={relatedLoList}
          skills={skills}
          updateBookMark={updateBookMark}
          relatedLoText={relatedLoText}
          showDescription={showDescription}
        />
      </div>
    ) : null;
  };

  const showLeaderBoard = () => {
    const isLp = training.loType === LEARNING_PROGRAM;
    // const isGamificationEnabled; get this for this training
    if (!isLp || (isLp && !isEnrolled)) {
      return;
    }
    return <PrimeLoLeaderBoard training={training} trainingInstanceId={trainingInstance} />;
  };
  const showCartButton = [
    ADD_TO_CART_ACTION,
    ADD_TO_CART_NATIVE_ACTION,
    BUY_NOW_NATIVE_ACTION,
  ].includes(action);

  const showLoActionButton = !isExternalCertification && (action === START || action === CONTINUE);
  const showRevistButton = !isExternalCertification && action === REVISIT;
  return (
    <section>
      {enrollButtonNotAvailableText ? (
        <div className={styles.actionContainer}>
          <p>{enrollButtonNotAvailableText}</p>
        </div>
      ) : (
        <div className={styles.actionContainer}>
          {action === REGISTER_INTEREST && (
            <button
              className={`almButton primary ${styles.commonButton}`}
              data-automationid={REGISTER_INTEREST}
              onClick={() =>
                handleRegisterInterest(
                  POST_REQUEST,
                  GetTranslation("learner.registerInterestSuccessMessage", true),
                  GetTranslation("learner.registerInterestErrorMessage", true)
                )
              }
            >
              {actionText}
            </button>
          )}
          {action === UNREGISTER_INTEREST && (
            <button
              className={`almButton primary ${styles.commonButton}`}
              data-automationid={UNREGISTER_INTEREST}
              onClick={() =>
                handleRegisterInterest(
                  DELETE_REQUEST,
                  GetTranslation("learner.unregisterInterestSuccessMessage", true),
                  GetTranslation("learner.unregisterInterestErrorMessage", true)
                )
              }
            >
              {actionText}
            </button>
          )}
          {(action === ENROLL_ACTION || action === UPDATE_ENROLLMENT_ACTION) && (
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={checkConflictingSessions}
              disabled={isEnrollButtonDisabled || false}
              data-automationid={actionText}
              id={actionButtonId}
            >
              {actionText}
            </button>
          )}
          {showLoActionButton && (
            <>
              <button
                className={`almButton primary ${styles.commonButton}`}
                onClick={() => playerHandler()}
                disabled={isButtonDisabled()}
                data-automationid={actionText}
                id={actionButtonId}
              >
                {actionText}
              </button>
              {waitListText}
              {prerequisiteCompletionText}
            </>
          )}
          {showRevistButton && (
            <button
              className={`almButton primary ${styles.commonButton}`}
              onClick={() => launchPlayerForNewEnrollmentOrRevisit()}
              disabled={isButtonDisabled()}
              data-automationid={actionText}
              id={actionButtonId}
            >
              {actionText}
            </button>
          )}
          {showCartButton && (
            <>
              <button
                className={`almButton primary ${styles.commonButton}`}
                onClick={handleCartAction}
                disabled={!isTrainingSynced || !isSeatAvailable || hasEnrollmentDeadlinePassed}
                data-automationid={actionText}
              >
                {actionText}
              </button>
              {trainingNotAvailableForPurchaseText}
            </>
          )}
          {!isExternalCertification && action === PENDING_APPROVAL_ACTION && (
            <>
              <button
                className={`almButton secondary ${styles.commonButton}`}
                disabled={true}
                data-automationid={actionText}
              >
                {actionText}
              </button>
              <div className={styles.mangerPendingApprovalText} data-automationid={actionText}>
                {formatMessage({
                  id: pendingApprovalMssgId(),
                })}
              </div>
              {seatsAvailableText}
            </>
          )}

          {action === PENDING_ACCEPTANCE_ACTION && (
            <>
              <button
                className={`almButton primary ${styles.commonButton}`}
                disabled={true}
                data-automationid={actionText}
              >
                {actionText}
              </button>

              {seatsAvailableText}
            </>
          )}
          {action === WAITING_ACTION && (
            <button
              className={`almButton secondary ${styles.commonButton}`}
              disabled={true}
              data-automationid={actionText}
            >
              {actionText}
            </button>
          )}
        </div>
      )}
      {/* Enrollment information */}
      {!isCertification && <div className={styles.actionContainer}>{showEnrollmentInfoText()}</div>}
      {showPreviewButton && (
        <div className={` ${styles.actionContainer} ${styles.crsStsButtonPreBookSection}`}>
          <div className={`${styles.backgroundButton} ${styles.bookmarkContainer}`}>
            <button
              className={`${styles.previewButton} almButton secondary`}
              onClick={toggle}
              data-automationid="bookmark"
            >
              {getBookMarkStatus()}
            </button>
          </div>
          <div className={styles.preBmSeperator}></div>
          <div className={styles.backgroundButton}>
            <button
              className={`${styles.previewButton} almButton secondary`}
              disabled={!areAllInstancesSelected()}
              onClick={previewHandler}
              data-automationid="preview"
            >
              {formatMessage({
                id: `alm.overview.button.preview`,
              })}
            </button>
          </div>
        </div>
      )}
      {primaryEnrollment &&
      isFlexLPOrContainsFlexLP &&
      !courseInstanceInsideFlexLPSelected &&
      !flexLpUpdationChecker() &&
      !courseInstanceNotSelected
        ? isInstanceNotSelected
        : ""}
      {!showPreviewButton && (
        <div className={styles.actionContainer}>
          <button className={styles.bookMark} onClick={toggle}>
            {getBookMarkStatus()}
          </button>
        </div>
      )}
      {/* Show leaderboard stats*/}
      {showLeaderBoard()}
      {/* Rating Container*/}
      {useCanShowRating(training) && isEnrolled && displayratingDialog}

      <section className={` ${styles.borderContainer} ${styles.container}`}>
        {/* purchase details for LO container*/}
        {showPriceDetails && (
          <div className={styles.paddingSeperator}>
            <div className={styles.headerContainer}>
              <div className={styles.metadataIcons}>{PURCHASE_DETAILS_ICON()}</div>
              <div
                className={styles.headerText}
                data-automationid={GetTranslation("alm.purchase.details")}
              >
                {GetTranslation("alm.purchase.details")}
              </div>
            </div>
            {getPriceDetails}
          </div>
        )}

        {/* Instances configurations */}
        {showInstanceConfiguration()}
        {/* Alternate Languages */}
        {showAlternateLanguages()}
        {/* minimum criteria completion container */}
        {isCompletionStatusAvailable() && (
          <div className={styles.paddingSeperator}>
            <div className={styles.headerContainer}>
              <div className={styles.metadataIcons}>{MODULE_COMPLETION_STATUS_ICON()}</div>
              <div
                className={styles.headerText}
                data-automationid={GetTranslation("alm.module.completion.status")}
              >
                {GetTranslation("alm.module.completion.status", true)}
              </div>
            </div>

            {showCompletionStatus()}
          </div>
        )}
        {/* Certificate Type container */}
        {isCertification && (
          <div className={styles.paddingSeperator}>{showTypeOfCertification()}</div>
        )}
        {/* Certificate Validity container */}
        {isCertification && (
          <div className={styles.paddingSeperator}>{showValidityOfCertification()}</div>
        )}
        {/* Who should Attend */}
        {showWhoShouldAttend()}
        {/* Skills Container */}
        {showLOSkills()}
        {/*Deadline container */}
        {!isInstanceRetired &&
          (showEnrollmentDeadlineData || completionDeadline || showUnenrollmentDeadlineData) && (
            <div className={styles.paddingSeperator}>
              <div className={styles.headerContainer} data-automationid="deadlines">
                {CALENDAR_ICON()}
                <div className={styles.headerText}>
                  {GetTranslation("alm.overview.deadline", true)}
                </div>
              </div>
              {enrollmentDeadlineContainer}
              {unenrollmentDeadlineContainer}
              {completionDeadlineContainer}
            </div>
          )}

        {/* Badge Container */}
        {showBadgeContainer()}

        {/* Recommendation container */}
        {isRecommendationAvailable && (
          <div className={styles.paddingSeperator}>
            <div className={styles.headerContainer}>
              {LO_RECOMMENDATIONS_ICON()}
              <div className={styles.headerText} data-automationid={recommendationText}>
                {recommendationText}
              </div>
            </div>

            {showRecomendations()}
          </div>
        )}
        {/* Extension Details */}
        {showNativeExtensions()}
        {/* JOB Aid container */}
        {showJobAidsForLO()}
        {/* Resources container */}
        {showLOResources()}
        {/* Author */}
        {showAuthorDetails()}
      </section>

      {/* UnEnroll button container */}
      {canUnenroll && !isUnenrollmentDeadlinePassed && (
        <div className={styles.commonContainer}>
          <div className={styles.bottomContainer}>
            <button
              className={`almButton secondary ${styles.unenrollButton}`}
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
      {/* Related Learning paths */}
      {getRelatedLos(
        relatedLpList,
        GetTranslation("alm.related.learning.programs", true),
        GetTranslation("alm.related.lp.to.take.next")
      )}
      {/* Related Courses */}
      {getRelatedLos(relatedCoursesList, GetTranslation("alm.related.Los", true))}
    </section>
  );
};
export default PrimeTrainingPageMetaData;
