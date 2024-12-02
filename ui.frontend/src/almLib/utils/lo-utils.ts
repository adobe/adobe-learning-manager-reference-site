import {
  JsonApiResponse,
  PrimeJobAidTrainingMap,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
} from "../models";
import APIServiceInstance from "../common/APIService";
import { QueryParams, RestAdapter } from "./restAdapter";
import {
  ACTIVE,
  ACTIVITY,
  CERTIFICATION,
  COMPLETED,
  CONTENT,
  COURSE,
  DEFAULT_INCLUDE_LO_OVERVIEW,
  ELEARNING,
  ENROLLED,
  EXTERNAL_AUTHOR,
  INCLUDE_SUBLO_INSTANCES,
  JOBAID,
  LEARNING_PROGRAM,
  LO_TYPES,
  OTHER,
  PENDING_APPROVAL,
  PLAYER_CLOSE,
  REJECTED,
  SNIPPET_TYPES,
} from "./constants";
import { getALMConfig, getALMObject } from "./global";
import { JsonApiParse } from "./jsonAPIAdapter";
import { GetTranslation, GetTranslationReplaced } from "./translationService";
import { AlertType } from "../common/Alert/AlertDialog";
import { arePrerequisitesEnforcedAndCompleted } from "./overview";
import { GetFormattedDate } from "./dateTime";
import {
  filterLoReourcesBasedOnResourceType,
  getTrainingUrl,
  isValidSubLoForFlexLpToLaunch,
} from "./hooks";
import { splitStringIntoArray } from "./catalog";

export const enrollTraining = async (
  loId: string,
  loInstanceId: string,
  headers = {}
): Promise<JsonApiResponse | undefined> => {
  const queryParam: QueryParams = {
    loId,
    loInstanceId,
  };
  return await APIServiceInstance.enrollToTraining(queryParam, headers);
};

export const getTraining = async (loId: string): Promise<PrimeLearningObject | undefined> => {
  const queryParam: QueryParams = {
    loId,
    include: DEFAULT_INCLUDE_LO_OVERVIEW,
    useCache: true,
    "filter.ignoreEnhancedLP": false,
  };
  return await APIServiceInstance.getTraining(loId, queryParam);
};

export const fetchJobAidResource = async (training: PrimeLearningObject) => {
  if (!training || training.loType !== JOBAID) {
    return "";
  }
  const params: QueryParams = {};
  params["include"] = "instances.loResources.resources";
  try {
    const response = await RestAdapter.get({
      url: `${getALMConfig().primeApiURL}/learningObjects/${training.id}`,
      params: params,
    });
    const parsedResponse = JsonApiParse(response);
    const resource = parsedResponse?.learningObject?.instances[0]?.loResources?.[0]?.resources?.[0];
    if (resource?.contentType === OTHER) {
      return resource.location;
    }
    return "";
  } catch (e) {
    console.log("Error while calling job aid " + e);
  }
};

const lpCertSet = new Set([LO_TYPES.LEARNING_PROGRAM, LO_TYPES.CERTIFICATION]);
const courseSet = new Set([LO_TYPES.COURSE]);
const DISALLOWED_LO_TYPES: Record<string, Set<string>> = {
  [SNIPPET_TYPES.CERTIFICATION_NAME]: lpCertSet,

  [SNIPPET_TYPES.COURSE_NAME]: courseSet,
  [SNIPPET_TYPES.COURSE_DESCRIPTION]: lpCertSet,
  [SNIPPET_TYPES.COURSE_OVERVIEW]: lpCertSet,

  [SNIPPET_TYPES.LP_NAME]: lpCertSet,
  [SNIPPET_TYPES.JOB_AID_DESCRIPTION]: new Set([...lpCertSet, ...courseSet]),
  [SNIPPET_TYPES.JOB_AID_NAME]: new Set([LO_TYPES.JOB_AID]),
};

export const canAddSnippet = (snippetType: string, training: PrimeLearningObject) => {
  const disallowedLoTypes = DISALLOWED_LO_TYPES[snippetType];
  return !(disallowedLoTypes && disallowedLoTypes.has(training.loType));
};

export const getInstanceSummary = async (trainingInstance: PrimeLearningObjectInstance) => {
  return await APIServiceInstance.getTrainingInstanceSummary(
    trainingInstance.learningObject.id,
    trainingInstance.id
  )
    .then(response => response?.loInstanceSummary)
    .catch(error => console.log(error));
};

export const defaultCartValues = { redirectionUrl: "", error: [""] };

export const extractTrainingIdNum = (trainingId: string) => {
  if (!trainingId) {
    return "";
  }
  return trainingId.split(":")[1];
};

export const displayPendingRequirements = (
  hasPendingPrerequisites: boolean,
  parentHasEnforcedPrerequisites: boolean,
  parentHasSubLoOrderEnforced: boolean,
  isPartOfLP: boolean,
  isPartOfCertification: boolean,
  almAlert: Function
) => {
  // priority order of message => parent training prerequisite > current training prerequisite > parent training sublo order > current training subvlo order
  let messages: string = GetTranslation("alm.overview.cannot.skip.ordered.course", true);

  // hasPendingPrerequisites => either current training or parent training has prequisites pending
  if (hasPendingPrerequisites) {
    // Module's parent check necessary because parent can be Course/LP
    // isEnforcedPrerequisiteIncomplete => current training has enforced prerequisites
    // parentHasEnforcedPrerequisites => parent training has enforced prerequisites
    // Certificates doesn't have prerequisites
    const loTypeHavingEnforcedPrerequisites =
      parentHasEnforcedPrerequisites && isPartOfLP ? LEARNING_PROGRAM : COURSE;
    messages = GetTranslation(
      `alm.overview.error.unmetPreReqMessage.${loTypeHavingEnforcedPrerequisites}`,
      true
    );
  } else if (parentHasSubLoOrderEnforced) {
    const parentLoType = isPartOfLP
      ? LEARNING_PROGRAM
      : isPartOfCertification
        ? CERTIFICATION
        : COURSE;
    messages = GetTranslation(`alm.overview.cannot.skip.ordered.${parentLoType}`, true);
  }
  almAlert(true, messages, AlertType.error);
};

export const getSectionLOsOrder = (training: PrimeLearningObject) => {
  // Specific for LPs - always have atleast one section
  return training.sections.map((section, index) => {
    const trainingIds = section.loIds;

    // Filter sub-LOs based on trainingIds
    const subLOsInsideLP = training.subLOs.filter(subLO => trainingIds.indexOf(subLO.id) !== -1);

    // Sort sub-LOs based on their order in trainingIds
    subLOsInsideLP.sort(
      (subLO1, subLO2) => trainingIds.indexOf(subLO1.id) - trainingIds.indexOf(subLO2.id)
    );

    return subLOsInsideLP;
  });
};

export const doesLPHaveActiveInstance = (training: PrimeLearningObject) => {
  if (training.enrollment) {
    return true;
  }
  return training.instances?.some((instance: PrimeLearningObjectInstance) => {
    const { completionDeadline, state } = instance;
    return (
      state === ACTIVE && (completionDeadline ? new Date(completionDeadline) >= new Date() : true)
    );
  });
};

export const shouldResetAttempt = (
  training: PrimeLearningObject,
  loResource: PrimeLearningObjectResource,
  enrollment: PrimeLearningObjectInstanceEnrollment
) => {
  // If MQA is not enabled, return null
  if (!training.isMqaEnabled) {
    return null;
  }

  const filteredResourceGrades = enrollment?.loResourceGrades?.filter(
    loResourceGrade => loResourceGrade.id.search(loResource.id) !== -1
  );

  const loResourceGrade = filteredResourceGrades?.length
    ? filteredResourceGrades[0]
    : ({} as PrimeLearningObjectResourceGrade);

  if (isRevisitAllowed(loResource, loResourceGrade)) {
    const attemptDuration = loResource?.multipleAttempt?.attemptDuration || 0;
    // If attempt duration is set, return true, else return false
    return attemptDuration > 0;
  }

  return !isAdminReset(loResource);
};

export const isRevisitAllowed = (
  loResource: PrimeLearningObjectResource,
  loResourceGrade: PrimeLearningObjectResourceGrade
) => {
  const multipleAttempt = loResource?.multipleAttempt;
  const attemptEndCriteria = multipleAttempt?.attemptEndCriteria;

  if (!loResourceGrade || !loResourceGrade.dateStarted) {
    return true;
  }

  return attemptEndCriteria !== PLAYER_CLOSE;
};

export const isAdminReset = (loResource: PrimeLearningObjectResource) => {
  const multipleAttempt = loResource?.multipleAttempt;
  const attemptInfo = loResource?.learnerAttemptInfo;

  const maxAttemptCount = multipleAttempt?.maxAttemptCount;
  const currentAttemptNum = attemptInfo?.currentAttemptNumber;
  const hasInfiniteAttempts = multipleAttempt?.infiniteAttempts;

  return currentAttemptNum && !hasInfiniteAttempts && currentAttemptNum > maxAttemptCount;
};

export const doesFirstTrainingHavePrerequisites = (
  training: PrimeLearningObject
): { hasPrerequisites: boolean; trainingType: string } => {
  if (!arePrerequisitesEnforcedAndCompleted(training)) {
    return { hasPrerequisites: true, trainingType: training.loType };
  }

  if (!training.subLOs) {
    return { hasPrerequisites: false, trainingType: "" };
  }

  if (training.loType === CERTIFICATION) {
    const firstCourse = training.subLOs[0];
    return doesFirstTrainingHavePrerequisites(firstCourse); // Return COURSE if certification's first course has prerequisites
  }

  if (training.loType === LEARNING_PROGRAM) {
    const firstTrainingId = training.sections[0].loIds[0];
    const firstTraining = training.subLOs.find(lo => lo.id === firstTrainingId);
    if (!firstTraining) {
      return { hasPrerequisites: false, trainingType: "" };
    }

    if (firstTraining.loType === LEARNING_PROGRAM) {
      return doesFirstTrainingHavePrerequisites(firstTraining);
    }

    // For course inside LP
    if (!arePrerequisitesEnforcedAndCompleted(firstTraining)) {
      return { hasPrerequisites: true, trainingType: LEARNING_PROGRAM }; // Return LEARNING_PROGRAM if LP's first child has prerequisites
    }
  }

  return { hasPrerequisites: false, trainingType: "" };
};
export function getAllCoursesOfTraining(training: PrimeLearningObject): PrimeLearningObject[] {
  // For Lp and cert get all the courses inside them
  let allCourses: PrimeLearningObject[] = [];
  training.subLOs?.forEach(subLO => {
    if (subLO.loType === COURSE) {
      allCourses.push(subLO);
    } else {
      allCourses = allCourses.concat(getAllCoursesOfTraining(subLO));
    }
  });
  return allCourses;
}
function isAnyModuleOfCourseLaunched(course: PrimeLearningObject) {
  // check if any module in the course is started
  return (
    course?.enrollment?.loResourceGrades?.some(resourceGrade => resourceGrade.dateStarted) || false
  );
}

export function shouldShowContinueButton(
  isEnrolled: boolean,
  isCourse: boolean,
  training: PrimeLearningObject,
  isFlexLPOrContainsFlexLP: boolean
) {
  //If not enrolled, don't show continue button
  if (!isEnrolled) {
    return false;
  } else if (isCourse) {
    return isAnyModuleOfCourseLaunched(training);
  } else if (
    isFlexLPOrContainsFlexLP &&
    training?.isSubLoOrderEnforced &&
    training?.enrollment?.progressPercent === 0
  ) {
    const sectionSubLOs = getSectionLOsOrder(training);
    // Launch the first course if subLoOrder is enforced after enrollment, if instance not selected throw error
    const firstSubLO = sectionSubLOs[0][0];
    const firstCourse = firstSubLO.loType === COURSE ? firstSubLO : firstSubLO.subLOs[0];
    //If any module is started in first course we show completed
    return firstCourse && isAnyModuleOfCourseLaunched(firstCourse);
  } else {
    const allCourses = getAllCoursesOfTraining(training);
    // For all the courses call getCourseHasStartedResource to check if any module is launched
    return (
      allCourses.some(course => isAnyModuleOfCourseLaunched(course)) &&
      training?.enrollment.state !== COMPLETED
    );
  }
}

export function areAllMandatoryCoursesCompleted(training: PrimeLearningObject) {
  if (!training.modulesMandatory || !training.subLOs) {
    return true;
  }

  const completedCourses = training.subLOs.filter(
    subLO => subLO.enrollment?.state === COMPLETED || subLO.enrollment?.progressPercent === 100
  );

  // If loResourceCompletionCount is not present, it means all courses are mandatory
  const totalMandatoryCoursesCount = training.loResourceCompletionCount || training.subLOs.length;

  return completedCourses?.length >= totalMandatoryCoursesCount;
}

export function getCertificationProofPendingMessage(training: PrimeLearningObject) {
  return training.modulesMandatory
    ? GetTranslation("msg.mandatory.completionProof.pending", true)
    : GetTranslation("alm.proof.completion.pending");
}
export const getAllJobAidsInTraining = (data: PrimeLearningObject) => {
  const resources: PrimeJobAidTrainingMap[] = [];
  data.supplementaryLOs?.forEach(item => {
    item.instances[0].loResources?.forEach(loResource => {
      loResource.resources?.forEach(resource => {
        resources.push({ resource, item });
      });
    });
  });
  const uniqueJobAids = Array.from(
    new Map(resources.map(resource => [resource.resource.id, resource])).values()
  );
  return uniqueJobAids;
};
export const getCertificationStatusMessage = (
  isExpiring: boolean,
  training: PrimeLearningObject,
  previousExpiryDate: string,
  isExternalCertification: boolean,
  locale: string
) => {
  const state = training?.enrollment?.state;
  const mandatoryCompletionMessage = getCertificationProofPendingMessage(training);

  if (!isExternalCertification) return "";

  const validityMessage =
    isExpiring && previousExpiryDate
      ? GetTranslationReplaced(
          "msg.validityExpiration.short",
          GetFormattedDate(previousExpiryDate, locale),
          true
        )
      : GetTranslation("msg.validity.expired.external");

  switch (state) {
    case ENROLLED:
      return `${validityMessage} | ${mandatoryCompletionMessage}`;
    case REJECTED:
      return GetTranslation("msg.proof.rejected");
    case PENDING_APPROVAL:
      return `${validityMessage} | ${GetTranslation("msg.managerApprovalPending")}`;
    case COMPLETED:
      return GetTranslation("alm.certification.completed", true);
    default:
      return "";
  }
};

export function getCourseToLaunchForFlexLP(
  LO: PrimeLearningObject
): PrimeLearningObject | undefined {
  for (const course of getAllCoursesOfTraining(LO)) {
    if (isValidSubLoForFlexLpToLaunch(course)) {
      return course;
    }
  }
}

export function findSubLoToLaunchForFlexLp(LOSection: PrimeLearningObject[]) {
  let subLoToLaunch: PrimeLearningObject | undefined = {} as PrimeLearningObject;
  for (const subLO of LOSection) {
    if (subLO.loType === LEARNING_PROGRAM) {
      subLoToLaunch = getCourseToLaunchForFlexLP(subLO);
      if (subLoToLaunch) {
        break;
      }
    } else if (subLO.loType === COURSE && isValidSubLoForFlexLpToLaunch(subLO)) {
      subLoToLaunch = subLO;
      break;
    }
  }
  return subLoToLaunch;
}

export function getSubLoDetails(
  subLO: PrimeLearningObject[],
  trainingId: string
): PrimeLearningObject {
  return subLO.find(subLo => subLo.id === trainingId) || ({} as PrimeLearningObject);
}

export function getInstanceIdToLaunch(course: PrimeLearningObject, trainingInstanceId: string) {
  if (trainingInstanceId.includes(course.id)) {
    return trainingInstanceId;
  } else {
    return course?.instances?.[0].id;
  }
}

export function getInstanceDetails(course: PrimeLearningObject, trainingInstanceId: string) {
  return course?.instances.find(lo => lo.id === trainingInstanceId);
}

export function isTrainingCompleted(enrollment: PrimeLearningObjectInstanceEnrollment) {
  return enrollment?.state === COMPLETED || enrollment?.progressPercent === 100;
}

export function getModuleIdToLaunch(course: PrimeLearningObject, trainingInstanceId: string) {
  const instanceDetails =
    course && trainingInstanceId && getInstanceDetails(course, trainingInstanceId);
  const coreContentModules =
    instanceDetails && filterLoReourcesBasedOnResourceType(instanceDetails, CONTENT);
  return coreContentModules && coreContentModules[0]?.id;
}

export function getAllPreviewableModules(coreContentModules: PrimeLearningObjectResource[]) {
  return coreContentModules?.filter(
    coreContentModule => coreContentModule?.previewEnabled && coreContentModule?.resources?.length
  );
}

export function getAllCoreContentModulesOfTraining(
  training: PrimeLearningObject,
  trainingInstance: PrimeLearningObjectInstance
) {
  let coreContentModules: PrimeLearningObjectResource[] = [];
  const getContentModules = (instance: PrimeLearningObjectInstance) =>
    filterLoReourcesBasedOnResourceType(instance, CONTENT);
  if (training.loType === COURSE) {
    coreContentModules = getContentModules(trainingInstance);
    return coreContentModules;
  }
  const allCourses = getAllCoursesOfTraining(training);
  allCourses.forEach(course => {
    const contentModules = getContentModules(course?.instances[0]);
    if (contentModules) {
      coreContentModules = coreContentModules.concat(contentModules);
    }
  });
  return coreContentModules;
}

export function determineLoType(trainingId: string) {
  switch (true) {
    case checkIncludes(trainingId, COURSE):
      return COURSE;
    case checkIncludes(trainingId, LEARNING_PROGRAM):
      return LEARNING_PROGRAM;
    case checkIncludes(trainingId, CERTIFICATION):
      return CERTIFICATION;
    case checkIncludes(trainingId, JOBAID):
      return JOBAID;
  }
}

function checkIncludes(trainingId: string, type: string) {
  return trainingId.includes(type);
}

export function getErrorMessage(loType: string) {
  switch (loType) {
    case COURSE:
      return GetTranslation("alm.no.permission.error.text.course", true);
    case LEARNING_PROGRAM:
      return GetTranslation("alm.no.permission.error.text.lp", true);
    case CERTIFICATION:
      return GetTranslation("alm.no.permission.error.text.cert", true);
    case JOBAID:
      return GetTranslation("alm.no.permission.error.text.jobAid", true);
  }
}
//If authorDetails has ExternalAuthor as name then course is not external
export const shouldShowOnlyExternalAuthor = (training: PrimeLearningObject) => {
  const isAuthorNamesIncludeExternalAuthor = training.authorNames?.includes(EXTERNAL_AUTHOR);
  const isCourseHasExternalAuthorName = training.authorDetails?.some(
    author => author.authorName === EXTERNAL_AUTHOR
  );
  return isAuthorNamesIncludeExternalAuthor && !isCourseHasExternalAuthorName;
};

export function getCourseIdAndInstanceIdFromResourceId(resourceId: string) {
  const [courseId, instanceId] = resourceId.split("_");
  return {
    courseId,
    courseInstanceId: `${courseId}_${instanceId}`,
  };
}

export function getTrainingLink(trainingId: string, accountId: string, instanceId?: string) {
  return (
    (getALMObject().getTrainingUrl &&
      getALMObject().getTrainingUrl(accountId, trainingId, instanceId)) ||
    getTrainingUrl(window.location.href, instanceId)
  );
}

export function disableStart(coreContentModule: PrimeLearningObjectResource): boolean {
  const crOrVcTime = new Date(coreContentModule?.resources?.[0]?.dateStart).getTime();
  return crOrVcTime ? (crOrVcTime - Date.now()) / (1000 * 60) >= 15 : true;
}

export function courseIsNotCrVcOrTimingEnabled(modules: PrimeLearningObjectResource[]): boolean {
  return modules.some(
    module =>
      module?.resourceType === ELEARNING ||
      module?.resourceType === ACTIVITY ||
      !disableStart(module)
  );
}

export function subLoHasResources(training: PrimeLearningObject): boolean {
  const subLos = training.subLOs;

  if (!training.showAggregatedResources || !subLos?.length) {
    return false;
  }
  //when the sub LO is a course only then we show the resources from a sub LO
  return subLos.some(item => item.supplementaryResources?.length > 0);
}

export const fetchCourseInstanceMapping = async (
  training: PrimeLearningObject,
  trainingInstanceId: string,
  courseInstanceMap: { [key: string]: string } = {}
) => {
  try {
    const params: QueryParams = { include: INCLUDE_SUBLO_INSTANCES };
    const headers = { "content-type": "application/json" };

    let response = await RestAdapter.ajax({
      url: `${getALMConfig().primeApiURL}/learningObjects/${training.id}/instances/${trainingInstanceId}`,
      method: "GET",
      headers,
      params,
    });

    if (response) {
      const parsedResponse = JsonApiParse(response);
      const subLoInstances = parsedResponse?.learningObjectInstance?.subLoInstances;
      if (subLoInstances?.length) {
        const courseSubLOs = training.subLOs.flatMap(subLo =>
          subLo.loType === COURSE ? subLo : subLo.subLOs || []
        );
        mapCourseInstances(courseSubLOs, subLoInstances, courseInstanceMap);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const mapCourseInstances = (
  courseSubLOs: PrimeLearningObject[],
  subLoInstances: PrimeLearningObjectInstance[],
  courseInstanceMap: { [key: string]: string } = {}
) => {
  subLoInstances.forEach(subLoInstance => {
    const loId = splitStringIntoArray(subLoInstance.id, "_")[0];
    if (subLoInstance.subLoInstances) {
      mapCourseInstances(courseSubLOs, subLoInstance.subLoInstances, courseInstanceMap); // Embeded LP Case
    } else {
      const training = courseSubLOs.find(subLo => subLo.id === loId);
      courseInstanceMap[loId] = training?.enrollment?.loInstance?.id || subLoInstance.id;
    }
  });
};
