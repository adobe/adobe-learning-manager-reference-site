import { PrimeAccount, PrimeLearningObject, PrimeLearningObjectInstance } from "../../../models";
import { GetTranslation, GetTranslationReplaced } from "../../../utils/translationService";
import { Widget, WidgetTypeNew } from "../../../utils/widgets/common";
import {
  getALMObject,
  getWidgetConfig,
  getWindowObject,
  navigateToLo,
} from "../../../utils/global";
import {
  ACTIVE,
  ALM_LEARNER_UPDATE_URL,
  CERTIFICATION,
  COURSE,
  CPENEW,
  GET_ABSTRACT_COM,
  LEARNING_PROGRAM,
  LINKED_IN_LEARNING,
  SELF_ENROLL,
} from "../../../utils/constants";
import {
  GetCertPageLink,
  GetCourseInstancePageLink,
  GetCoursePageLink,
  GetLPInstancePageLink,
  GetLPPageLink,
  GetPlayerOpenLink,
  SendLinkEvent,
  SendMessageToParent,
} from "../../../utils/widgets/base/EventHandlingBase";
import { LaunchPlayer } from "../../../utils/playback-utils";
import { ToastQueue } from "@react-spectrum/toast";
import { getDefaultIntsance } from "../../../utils/catalog";
import { CalculateIfTablet } from "../../../utils/widgets/utils";
import { doesLPHaveActiveInstance } from "../../../utils/lo-utils";
import { isEnrolledInAutoInstance } from "../../../utils/hooks";

export const hasSingleActiveInstance = (training: PrimeLearningObject): boolean => {
  const instances = training.instances;
  let count = 0;
  for (let i = 0; i < instances?.length; i++) {
    const instance = instances[i];
    if (instance.state == ACTIVE && checkIfEnrollmentDeadlineNotPassed(instance)) {
      count++;
    }
    if (count > 1) {
      return false;
    }
  }
  return count == 0 ? false : true;
};

export const getActionTextForDisabledLinks = (widget: Widget): string => {
  return widget?.attributes?.disableLinks ? "" : GetTranslation("locard.explore");
};

export const isLinkedinLO = (training: PrimeLearningObject): boolean => {
  return training.authorNames?.some(value =>
    value.toLowerCase().includes(LINKED_IN_LEARNING.toLowerCase())
  );
};

export const canShowPrice = (training: PrimeLearningObject, account: PrimeAccount): boolean => {
  return !training.enrollment && account.enableECommerce && training.price && training.price > 0
    ? true
    : false;
};

export const canStart = (
  training: PrimeLearningObject,
  enrollExtensionPresent: boolean,
  account: PrimeAccount
): boolean => {
  if (
    training.isMqaEnabled ||
    (!training.enrollment && canShowPrice(training, account)) ||
    (isLinkedinLO(training) && getWidgetConfig()?.isLoadedInsideApp) ||
    (enrollExtensionPresent && !training.enrollment)
  ) {
    return false;
  }

  const isSingleActiveInstance = training.enrollment ? true : hasSingleActiveInstance(training);
  return isSingleActiveInstance && !getActiveInstance(training)?.isFlexible;
};

export const checkIfEnrollmentDeadlineNotPassed = (
  instance: PrimeLearningObjectInstance
): boolean => {
  const enrollmentDeadlineStr = instance.enrollmentDeadline;
  return enrollmentDeadlineStr && new Date(enrollmentDeadlineStr) < new Date() ? false : true;
};

export const getActiveInstance = (
  training: PrimeLearningObject
): PrimeLearningObjectInstance | undefined => {
  const instances = training.instances;
  let activeInstance;
  for (let i = 0; i < instances?.length; i++) {
    const instance = instances[i];
    if (instance.state === ACTIVE && checkIfEnrollmentDeadlineNotPassed(instance)) {
      activeInstance = instance;
    }
  }
  return activeInstance;
};

export function isExtensionAllowed(
  lo: PrimeLearningObject,
  loInstance?: PrimeLearningObjectInstance
): boolean {
  if (
    (lo.loType === COURSE && lo.enrollmentType !== SELF_ENROLL) ||
    (lo.loType === CERTIFICATION && loInstance?.validity) ||
    (lo.loType === LEARNING_PROGRAM && lo.enrollmentType !== SELF_ENROLL)
  ) {
    return false;
  }

  return true;
}

export const hideEnrollIcon = (
  training: PrimeLearningObject,
  enrollExtensionPresent: boolean,
  account: PrimeAccount
): boolean => {
  return Boolean(training.enrollment) || canShowPrice(training, account) || enrollExtensionPresent;
};

export const checkIfRecoOrCPENEWDiscoveryStrip = (
  widget: Widget,
  account: PrimeAccount
): boolean => {
  return (
    widget?.type === WidgetTypeNew.RECOMMENDATIONS_STRIP ||
    (widget?.type === WidgetTypeNew.DISCOVERY_RECO && account.recommendationAccountType === CPENEW)
  );
};

export const getEnrolledInstancesCount = (training: PrimeLearningObject): number => {
  const instances = training.instances;
  let count = 0;
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    if (instance.enrollment) {
      count++;
    }
  }
  return count;
};
export const getLoViewRefLink = (training: PrimeLearningObject): string => {
  const isSingleActiveInstance = hasSingleActiveInstance(training);
  const isEnrolledInSingleInstance = getEnrolledInstancesCount(training) === 1;
  const { loType, id } = training;
  switch (loType) {
    case COURSE:
      return isSingleActiveInstance || !getActiveInstance(training) || isEnrolledInSingleInstance
        ? `${GetCoursePageLink()}?courseId=${id}`
        : `${GetCourseInstancePageLink()}?courseId=${id}`;
    case LEARNING_PROGRAM:
      return isSingleActiveInstance || !getActiveInstance(training) || training.enrollment
        ? `${GetLPPageLink()}?lpId=${id}`
        : `${GetLPInstancePageLink()}?lpId=${id}`;
    case CERTIFICATION:
      return `${GetCertPageLink()}?certId=${id}`;
    default:
      return "";
  }
};

export const launchPlayerHandler = (training: PrimeLearningObject): void => {
  if (getWidgetConfig()?.emitPlayerLaunchEvent) {
    SendLinkEvent(`${GetPlayerOpenLink()}?loId=${training.id}`);
  } else {
    const playerDimension = getWidgetConfig().isMobile || CalculateIfTablet() ? "100%" : "70%";
    LaunchPlayer({ trainingId: training.id, playerDimension });
  }
};

export const openJobAid = (training: PrimeLearningObject, url?: string): void => {
  if (!url) {
    launchPlayerHandler(training);
    return;
  }
  const win = getWindowObject().open(url, "_blank");
  win?.focus();
};

export const handleLinkCLick = (training: PrimeLearningObject, widget: Widget) => {
  if (!widget?.attributes?.disableLinks) {
    navigateToLo(training);
  }
};

export const showToast = (message: string, timeout = 2000): void => {
  ToastQueue.neutral(message, {
    timeout,
  });
};

export const handleRedirectionForLoggedIn = (
  training: PrimeLearningObject,
  activeInstances: PrimeLearningObjectInstance[]
) => {
  const alm = getALMObject();
  const trainingId = training.id;
  const loType = training.loType;
  let instanceId;

  //handling enrolled case
  if (training.enrollment) {
    //handling LP and certs
    instanceId = training.enrollment.loInstance.id;
    if (loType !== COURSE) {
      alm.navigateToTrainingOverviewPage(trainingId, instanceId);
      return;
    }

    const hasMultipleInstances = !hasSingleActiveInstance(training);
    const enrollmentCount = getEnrolledInstancesCount(training);
    const isAutoInstanceEnrolled = isEnrolledInAutoInstance(training);

    // Multiple instances but not enrolled in auto instance
    if (enrollmentCount !== 1 && hasMultipleInstances && !isAutoInstanceEnrolled) {
      alm.navigateToInstancePage(trainingId);
      return;
    }
    alm.navigateToTrainingOverviewPage(trainingId, instanceId);
    return;
  }

  // Handling unenrolled training navigation
  const lpHasNoActiveInstance = loType === LEARNING_PROGRAM && !doesLPHaveActiveInstance(training);

  if (lpHasNoActiveInstance) {
    alm.navigateToInstancePage(trainingId);
    return;
  }

  if (activeInstances?.length === 1) {
    instanceId = activeInstances[0].id;
  } else if (activeInstances?.length === 0) {
    //for retired scenario, where all the instances are retired
    if (loType === LEARNING_PROGRAM) {
      alm.navigateToInstancePage(trainingId);
      return;
    }
    instanceId = getDefaultIntsance(training)[0]?.id;
  } else {
    SendMessageToParent(
      {
        origin: window.origin,
        instancePageUrl: `instancePage=${trainingId}`,
        instancePage: true,
        type: ALM_LEARNER_UPDATE_URL,
      },
      "*"
    );
    alm.navigateToInstancePage(trainingId);
    return;
  }

  alm.navigateToTrainingOverviewPage(trainingId, instanceId);
};


export const handleRedirectionForNonLoggedIn = (
  training: PrimeLearningObject,
  activeInstances: PrimeLearningObjectInstance[]
) => {
  const alm = getALMObject();
  //Does ES have instances in response
  if (!activeInstances || activeInstances?.length === 1) {
    alm.navigateToTrainingOverviewPage(training.id);
  } else {
    alm.navigateToInstancePage(training.id);
  }
};

export const getAuthorName = (training: PrimeLearningObject): string => {
  const lowerCaseLinkedInLearning = LINKED_IN_LEARNING.toLowerCase();
  const lowerCaseGetAbstractCom = GET_ABSTRACT_COM;
  const externalAuthorName = training?.authorNames?.find(authorName => {
    const lowerCaseAuthorName = authorName.toLowerCase();
    return (
      lowerCaseAuthorName === lowerCaseLinkedInLearning ||
      lowerCaseAuthorName === lowerCaseGetAbstractCom
    );
  });

  if (externalAuthorName) {
    return externalAuthorName.toLowerCase() === lowerCaseLinkedInLearning
      ? LINKED_IN_LEARNING
      : GET_ABSTRACT_COM;
  }

  return training.authorNames?.length ? training.authorNames[0] : "";
};

export const ratingFormatter = (num: number): string => {
  return num > 999
    ? GetTranslationReplaced("text.thousands", 1 * +(num / 1000).toFixed(1) + "")
    : num + "";
};
