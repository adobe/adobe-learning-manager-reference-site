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
import Layers from "@spectrum-icons/workflow/Layers";
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
  PrimeExtension,
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
  FLEX_LP_COURSE_INFO,
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
  checkIfLinkedInLearningCourse,
  getALMAccount,
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  isExtensionAllowed,
  launchContentUrlInNewWindow,
  updateURLParams,
} from "../../../utils/global";
import {
  useCanShowRating,
  filterLoReourcesBasedOnResourceType,
  hasSingleActiveInstance,
  getEnrolledInstancesCount,
  getEnrollment,
  isEnrolledInAutoInstance,
  findCoursesInsideFlexLP,
  findFlexlpInsideLP,
} from "../../../utils/hooks";
import {
  DEFAULT_USER_SVG,
  Extension_SVG,
  INSTANCE_ICON,
  LEARNER_BADGE_SVG,
  Warning_ICON,
} from "../../../utils/inline_svg";
import {
  arePrerequisiteEnforcedAndCompleted,
  checkIsEnrolled,
  storeActionInNonLoggedMode,
} from "../../../utils/overview";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  GetTranslationsReplaced,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
// import { ALMStarRating } from "../../ALMRatings";
import { StarRatingSubmitDialog } from "../../StarRatingSubmitDialog";
import { ALMTooltip } from "../../Common/ALMTooltip";
import { PrimeTrainingPageExtraJobAid } from "../PrimeTrainingPageExtraDetailsJobAids";
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
  setActiveExtension: Function;
  timeBetweenAttemptEnabled: boolean;
  selectedInstanceInfo: Object;
  isFlexible: boolean;
  areAllInstancesSelectedHandler: Function;
  lastPlayingLoResourceId: string;
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
  updateEnrollmentHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
  flexLpEnrollHandler,
  isPreviewEnabled,
  alternateLanguages,
  selectedInstanceInfo,
  isFlexible,
  updateRating,
  updateBookMark,
  waitlistPosition,
  setActiveExtension,
  timeBetweenAttemptEnabled,
  areAllInstancesSelectedHandler,
  lastPlayingLoResourceId,
}) => {
  const [almAlert] = useAlert();
  const [almConfirmationAlert] = useConfirmationAlert();
  const { formatMessage, locale } = useIntl();

  const primaryEnrollment = training.enrollment;
  const enrollment = getEnrollment(training, trainingInstance);
  const enrolledInstancesCount = getEnrolledInstancesCount(training);

  const loType = training.loType;
  const subLOs = training.subLOs;
  const sections = training.sections;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const isPricingEnabled =
    training.price && getALMConfig().usageType === ADOBE_COMMERCE;
  const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);

  const [isTrainingSynced, setIsTrainingSynced] = useState(true);
  const [isBookMarked, setIsBookMarked] = useState(training.isBookmarked);
  const [overviewExtension, setOverviewExtension] = useState<PrimeExtension>();
  const [enrollExtension, setEnrollExtension] = useState<PrimeExtension>();

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

  const isInstanceNotSelected = (
    <div>
      <div className={styles.selectCiMsg}>
        {GetTranslation(`alm.training.flexlp.select.instance`, true)}
      </div>
      <div className={styles.scrollToSelectMsg}>
        {GetTranslation(`alm.training.flexlp.no.instance`, true)}
      </div>
    </div>
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

  const courseIdList = Object.keys(selectedInstanceInfo);
  const courseInfoList = Object.values(selectedInstanceInfo);

  let showPreviewButton =
    isPreviewEnabled && training.hasPreview && !isEnrolled;
  const showPriceDetails = isPricingEnabled && enrollment;

  const flexLp = () => {
    let flexLpObject = {} as any;
    for (let i = 0; i < courseIdList.length; i++) {
      flexLpObject[courseIdList[i] as keyof typeof flexLpObject] =
        courseInfoList[i]["instanceId" as keyof (typeof courseInfoList)[0]];
    }
    return flexLpObject;
  };

  const updationChecker = () => {
    for (let i = 0; i < courseInfoList.length; i++) {
      if (courseInfoList[i]["isbuttonChange"]) {
        return true;
      }
    }
    return false;
  };

  const [isChildFlexLP, setIsChildFlexLP] = useState(false);
  const [isTrainingFlexLP, setIsTrainingFlexLP] = useState(false);

  useEffect(() => {
    const childIsFlexLP = findFlexlpInsideLP(training);
    if (childIsFlexLP) {
      setIsChildFlexLP(true);
      setIsTrainingFlexLP(true);
    } else if (isFlexible) {
      setIsTrainingFlexLP(true);
    }
  }, []);

  // Enrolled courses inside flex lp, for which instance not selected
  const courseInstanceNotSelected =
    loType == COURSE && primaryEnrollment && !primaryEnrollment.loInstance;

  const courseInstanceInsideFlexLPSelected = training.subLOs?.some((lo) => {
    return lo.enrollment?.loInstance !== undefined;
  });

  const action: string = useMemo(() => {
    if (courseInstanceNotSelected) {
      return "start";
    } else if (enrollment) {
      if (enrollment.state === PENDING_APPROVAL) {
        return "pendingApproval";
      } else if (enrollment.state === PENDING_ACCEPTANCE) {
        return "pendingAcceptance";
      } else if (enrollment.state === WAITING) {
        return "waiting";
      } else if (
        enrollment.progressPercent >= 0 &&
        updationChecker() &&
        isTrainingFlexLP
      ) {
        return "updateEnrollment";
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

  useEffect(() => {
    const getAndSetOverviewExtension = async () => {
      const account = await getALMAccount();
      if (account) {
        const extension = getExtension(
          account.extensions,
          training.extensionOverrides,
          InvocationType.LEARNER_OVERVIEW
        );
        extension &&
          isExtensionAllowed(extension) &&
          setOverviewExtension(extension);
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
      primaryEnrollment.loInstance &&
      primaryEnrollment.loInstance.id !== trainingInstance.id &&
      !isPrimaryEnrollmentWaitlisted) ||
    isPendingApproval ||
    (isTrainingFlexLP && courseIdList.length === 0);

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

  const prerequisiteCompletionText = action === "start" &&
    !arePrerequisiteEnforcedAndCompleted(training) && (
      <p className={`${styles.label} ${styles.centerAlign}`}>
        {formatMessage(
          {
            id: "alm.overview.complete.prerequisite.message",
          },
          { loType: loType }
        )}
      </p>
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
        isFlexLp: isFlexible,
      });
      if (hasMultipleInstances && response) {
        viewAllInstanceHandler();
      }
    } catch (e) {}
  };

  const instanceUpdateClickHandler = () => {
    const instanceEnrollmentList = isTrainingFlexLP
      ? { enroll: flexLp() }
      : {
          enroll: {
            [training.id]: trainingInstance.id,
          },
        };

    updateEnrollmentHandler({
      enrollmentId: primaryEnrollment.id,
      instanceEnrollList: instanceEnrollmentList,
      isFlexLp: isTrainingFlexLP,
    });
  };

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
        if (
          isFirstModuleCrOrVc() ||
          isFirstResourceType(ACTIVITY) ||
          !arePrerequisiteEnforcedAndCompleted(training)
        ) {
          return;
        }
        if (
          checkIfLinkedInLearningCourse(training) &&
          getALMConfig().handleLinkedInContentExternally
        ) {
          return launchContentUrlInNewWindow(training, coreContentModules[0]);
        }
        playerHandler(newEnrollment);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Need to update this later
  const updateEnrollmentClickHandler = () => {
    unEnrollmentHandler({ enrollmentId: primaryEnrollment.id }).then(() => {
      enrollmentClickHandler();
    });
  };
  const instanceEnrollmentHandler = async () => {
    if (action === "enroll") {
      try {
        const account = await getALMAccount();

        if (account && isExtensionAllowedForLO(training, trainingInstance)) {
          const extension = getExtension(
            account.extensions,
            training.extensionOverrides,
            InvocationType.LEARNER_ENROLL
          );
          if (extension && isExtensionAllowed(extension)) {
            getALMObject().storage.setItem(
              FLEX_LP_COURSE_INFO,
              selectedInstanceInfo,
              1800
            );
            setActiveExtension(extension);
            return;
          }
        }
        const enrollRequestObj = flexLp();
        await flexLpEnrollHandler({
          allowMultiEnrollment: isMultiEnrollmentEnabled,
          body: { enroll: enrollRequestObj },
        });
      } catch (e) {}
    } else {
      instanceUpdateClickHandler();
    }
  };

  const getAllCoursesInsideFlexLP = (subLOsInsideLP: PrimeLearningObject[]) => {
    let allCourses: PrimeLearningObject[] = [];
    subLOsInsideLP.forEach((lo) => {
      if (lo.loType === LEARNING_PROGRAM && lo.instances[0].isFlexible) {
        allCourses.push(...findCoursesInsideFlexLP(lo));
      } else if (lo.loType === COURSE) {
        allCourses.push(lo);
      }
    });
    return allCourses;
  };

  function dialogBoxMessageHandler() {
    return (
      <>
        <p className={styles.dialogBoxMessage}>
          {GetTranslation(
            "alm.training.flexLp.enrollmentDialogBox.selectedCourseMessage",
            true
          )}
        </p>
        <p className={styles.dialogBoxMessage}>
          {GetTranslation(
            "alm.training.flexLp.enrollmentDialogBox.instanceChangeMessage",
            true
          )}
        </p>
        <p className={styles.dialogBoxMessage}>
          <span className={styles.warningIcon}>{Warning_ICON()}</span>
          {GetTranslation(
            "alm.training.flexLp.enrollmentDialogBox.pendingCourseMessage",
            true
          )}
        </p>
        <hr></hr>
        <ol className={styles.flexLpDialogList}>
          {sections.map((section, index) => {
            const trainingIds = section.loIds;
            const subLOsInsideLP = training.subLOs.filter(
              (subLO) => trainingIds.indexOf(subLO.id) !== -1
            );

            subLOsInsideLP.sort(
              (trainingId1, trainingId2) =>
                trainingIds.indexOf(trainingId1.id) -
                trainingIds.indexOf(trainingId2.id)
            );
            const allCourses = getAllCoursesInsideFlexLP(subLOsInsideLP);
            return allCourses.map((item: any) => {
              return (
                <React.Fragment key={item.id}>
                  {courseIdList.includes(item.id) ? (
                    <li className={styles.courseListInFlexLp}>
                      <b>
                        {
                          selectedInstanceInfo[
                            item.id as keyof typeof selectedInstanceInfo
                          ]["name" as keyof typeof selectedInstanceInfo]
                        }
                      </b>
                      <p>
                        {GetTranslation(
                          "alm.overview.flexlp.dialog.instance",
                          true
                        )}
                        :{" "}
                        {
                          selectedInstanceInfo[
                            item.id as keyof typeof selectedInstanceInfo
                          ]["instanceName" as keyof typeof selectedInstanceInfo]
                        }
                      </p>
                    </li>
                  ) : (
                    <li className={styles.courseListInFlexLp}>
                      {(item.enrollment &&
                        training.enrollment &&
                        item.enrollment.loInstance) ||
                      (item.enrollment?.state === COMPLETED &&
                        item.enrollment.loInstance) ? (
                        <p>
                          <b>{item.localizedMetadata[0].name}</b>
                          <p>
                            {GetTranslation(
                              "alm.overview.flexlp.dialog.instance",
                              true
                            )}
                            :{" "}
                            {
                              item.enrollment.loInstance.localizedMetadata[0]
                                .name
                            }
                          </p>
                        </p>
                      ) : (
                        <p>
                          <b>{item.localizedMetadata[0].name}</b>
                          <p>
                            {GetTranslation(
                              "alm.overview.flexlp.dialog.instance",
                              true
                            )}
                            :{" "}
                            <span className={styles.notSelected}>
                              {formatMessage({
                                id: "alm.overview.flexlp.dialog.noInstanceSelected",
                              })}
                            </span>
                          </p>
                        </p>
                      )}
                    </li>
                  )}
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
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      dialogBoxMessageHandler(),
      formatMessage({
        id: "alm.overview.confirm",
      }),
      formatMessage({
        id: "alm.overview.cancel",
      }),
      instanceEnrollmentHandler
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
      GetTranslation("alm.update.enrollment.confirmationInfo", true),
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
    if (isTrainingFlexLP) {
      if (isChildFlexLP) {
        almAlert(
          true,
          GetTranslation("alm.training.flexlp.no.support", true),
          AlertType.error
        );
        return;
      }
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
    playerHandler();
  };

  // MQA Case
  const lastPlayedloResource =
    trainingInstance?.loResources?.find((loResource) => {
      return loResource.id === lastPlayingLoResourceId;
    }) ||
    (trainingInstance?.loResources && trainingInstance?.loResources[0]);

  let resetAttemptForFirstModule = true;
  const infiniteAttempts =
    lastPlayedloResource?.multipleAttempt?.infiniteAttempts;
  if (infiniteAttempts || !lastPlayedloResource?.multipleAttemptEnabled) {
    resetAttemptForFirstModule = false;
  }

  const playerHandler = (
    newEnrollment?: PrimeLearningObjectInstanceEnrollment
  ) => {
    if (
      checkIfLinkedInLearningCourse(training) &&
      getALMConfig().handleLinkedInContentExternally
    ) {
      return launchContentUrlInNewWindow(training, coreContentModules[0]);
    }
    if (isTrainingFlexLP) {
      const sectionSubLOs = sections.map((section, index) => {
        const trainingIds = section.loIds;

        // Filter sub-LOs based on trainingIds
        const subLOsInsideLP = training.subLOs.filter(
          (subLO) => trainingIds.indexOf(subLO.id) !== -1
        );

        // Sort sub-LOs based on their order in trainingIds
        subLOsInsideLP.sort(
          (subLO1, subLO2) =>
            trainingIds.indexOf(subLO1.id) - trainingIds.indexOf(subLO2.id)
        );

        return subLOsInsideLP;
      });

      let launchSubLO;
      for (const subLO of sectionSubLOs[0]) {
        if (subLO.enrollment && subLO.enrollment.loInstance) {
          launchSubLO = subLO;
          break;
        }
      }

      const trainingId = (launchSubLO && launchSubLO.id) || subLOs[0].id;

      const trainingInstanceId =
        (Object.keys(selectedInstanceInfo).length > 0 &&
          selectedInstanceInfo[trainingId as keyof typeof selectedInstanceInfo][
            "instanceId" as keyof typeof selectedInstanceInfo
          ]) ||
        (launchSubLO && launchSubLO.enrollment.loInstance.id) ||
        subLOs[0].enrollment.loInstance.id;

      launchPlayerHandler({
        id: trainingId,
        moduleId: "",
        trainingInstanceId: trainingInstanceId,
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
      launchPlayerHandler({ isResetRequired: resetAttemptForFirstModule });
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

  const showBadges = badge?.badgeUrl;

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
            __html: GetTranslation(
              "alm.overview.instance.multi.unenroll.confirmation",
              true
            ),
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
      displayResource = subLOs.some((item) => {
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

  const isUnenrollmentDeadlinePassed = trainingInstance.unenrollmentDeadline
    ? checkIfUnenrollmentDeadlinePassed(trainingInstance)
    : false;

  const canUnenroll =
    (enrollment &&
      training.unenrollmentAllowed &&
      !(enrollment?.progressPercent === 100)) ||
    isPendingApproval;
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
  ) : isTrainingFlexLP && courseIdList.length === 0 ? (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      {GetTranslation("alm.flexlp.addToCart", true)}
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
    loType === COURSE && mandatoryModulesCount > 0;

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

    if (loType === COURSE) {
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
    } else if (loType === CERTIFICATION) {
      const totalCount = subLOs?.length;
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
    loType,
    subLOs?.length,
    trainingInstance,
  ]);

  const coreContentCompleted = useMemo(() => {
    let value = "";
    //shown only for courses in classic
    if (!isEnrolled || loType !== COURSE) {
      return value;
    }
    if (loType === COURSE) {
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
    loType,
  ]);
  const trainingsCompleted = useMemo(() => {
    let value = "";
    if (
      !isEnrolled ||
      (loType !== LEARNING_PROGRAM && loType !== CERTIFICATION)
    ) {
      return value;
    }
    if (loType === LEARNING_PROGRAM || loType === CERTIFICATION) {
      const totalCount = subLOs?.length || 0;
      let completionCount = 0;
      subLOs?.forEach((lo) => {
        if (lo.enrollment?.hasPassed) {
          completionCount += 1;
        }
      });
      value = `${completionCount}/${totalCount}`;
    }
    return value;
  }, [isEnrolled, loType, subLOs]);

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
      {primaryEnrollment?.state === COMPLETED
        ? GetTranslation(`alm.instance.completed`, true)
        : GetTranslation(`alm.instance.enrolled`, true)}
    </p>
  );

  // Enrolled courses inside flex lp, for which instance not selected
  const instanceNotSelectedInfoText = (
    <p className={`${styles.label} ${styles.centerAlign}`}>
      <span className={styles.warningIcon}>{Warning_ICON()}</span>
      <span>
        {GetTranslation(
          `alm.overview.flexlp.course.instance.not.selected`,
          true
        )}
      </span>
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
      if (!checkIfEnrollmentDeadlineNotPassed(trainingInstance)) {
        return "alm.overview.manager.approval.pending.enrollment.deadline.passed";
      } else if (trainingInstance.state === RETIRED) {
        return GetTranslation(
          "alm.overview.manager.approval.pending.singleInstance",
          true
        );
      } else {
        return "alm.overview.manager.approval.pending";
      }
    } else if (!checkIfEnrollmentDeadlineNotPassed(trainingInstance)) {
      return GetTranslation(
        "alm.overview.manager.approval.pending.enrollment.deadline.passed.change.instance",
        true
      );
    } else if (trainingInstance.state === RETIRED) {
      return GetTranslation(
        "alm.overview.manager.approval.pending.instance.retired",
        true
      );
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
    return subLOs[0].loType === "learningProgram";
  };

  const getModuleTypeOfFirstSubLo = () => {
    let firstLoInstance = subLOs[0].instances[0];
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
    return (
      (action === "start" &&
        (isFirstModuleCrOrVc() ||
          !arePrerequisiteEnforcedAndCompleted(training))) ||
      courseInstanceNotSelected ||
      (primaryEnrollment &&
        isTrainingFlexLP &&
        !courseInstanceInsideFlexLPSelected) ||
      timeBetweenAttemptEnabled
    );
  };

  const extensionLocalizedMetadata = useMemo(() => {
    if (!overviewExtension) {
      return {} as any;
    }
    return getPreferredLocalizedMetadata(
      overviewExtension.localizedMetadata,
      locale
    );
  }, [overviewExtension, locale]);

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

  return (
    <section className={styles.container}>
      {enrollButtonNotAvailableText ? (
        <div className={styles.actionContainer}>
          <p>{enrollButtonNotAvailableText}</p>
        </div>
      ) : (
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
              {prerequisiteCompletionText}
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
                  hasEnrollmentDeadlinePassed ||
                  (isTrainingFlexLP && courseIdList.length === 0)
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
      )}

      {showPreviewButton && (
        <div
          className={` ${styles.actionContainer} ${styles.crsStsButtonPreBookSection}`}
        >
          <div className={styles.backgroundButton}>
            <button
              className={`${styles.previewButton} almButton secondary`}
              disabled={!areAllInstancesSelectedHandler()}
              onClick={previewHandler}
            >
              {formatMessage({
                id: `alm.overview.button.preview`,
              })}
            </button>
          </div>
          <div className={styles.preBmSeperator}></div>
          <div
            className={`${styles.backgroundButton} ${styles.bookmarkContainer}`}
          >
            <button
              className={`${styles.previewButton} almButton secondary`}
              onClick={toggle}
            >
              {getBookMarkIcon}
              {getBookMarkStatusText}
            </button>
          </div>
        </div>
      )}

      {primaryEnrollment &&
      isTrainingFlexLP &&
      !courseInstanceInsideFlexLPSelected &&
      !updationChecker() &&
      !courseInstanceNotSelected
        ? isInstanceNotSelected
        : ""}

      {!showPreviewButton && (
        <div className={styles.actionContainer}>
          <button className={styles.bookMark} onClick={toggle}>
            {getBookMarkIcon}
            {getBookMarkStatusText}
          </button>
        </div>
      )}

      {/* Enrollment information */}
      {loType === COURSE && (
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
            loType={loType}
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
          loType === COURSE && (
            <div className={styles.commonContainer}>
              <span className={styles.instanceIcon}>{INSTANCE_ICON()}</span>
              <div className={styles.innerContainer}>
                <label className={styles.label}>
                  {GetTranslation(`alm.instance.details`, true)}
                </label>
                <label className={styles.instanceName}>
                  {isAutoInstanceEnrolled ? (
                    GetTranslation(`alm.text.autoInstance`, true)
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

        {/* Extension Details */}
        {overviewExtension && (
          <div className={styles.commonContainer}>
            <span
              aria-hidden="true"
              className={styles.sendIcon + " " + styles.extensionIcon}
            >
              <Layers />
            </span>
            <div className={styles.innerContainer}>
              <label className={styles.label}>
                {GetTranslation("alm.extension.overview.other.details")}
              </label>
              <div className={styles.subtleText}>
                <a
                  className={styles.allInstances}
                  onClick={() => handleExtensionClick(overviewExtension)}
                >
                  {extensionLocalizedMetadata?.label}
                </a>
              </div>
            </div>
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
