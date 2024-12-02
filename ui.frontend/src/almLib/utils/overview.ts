import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeSections,
} from "../models";
import {
  CHECKLIST,
  COMPLETED,
  CONTENT,
  PENDING,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  PREWORK,
  WAITING,
} from "./constants";
import { getALMObject, updateURLParams } from "./global";
import { isTrainingCompleted } from "./lo-utils";

export function checkIsEnrolled(enrollment: PrimeLearningObjectInstanceEnrollment): boolean {
  const state = enrollment?.state;
  return (
    Boolean(state) &&
    state !== PENDING_APPROVAL &&
    state !== PENDING_ACCEPTANCE &&
    state !== WAITING
  );
}

export const storeActionInNonLoggedMode = (actionType: string) => {
  if (!getALMObject().isPrimeUserLoggedIn()) {
    updateURLParams({ action: actionType });
  }
};

export const arePrerequisitesEnforcedAndCompleted = (training: PrimeLearningObject) => {
  if (
    training.prerequisiteLOs &&
    training.isPrerequisiteEnforced &&
    training.prerequisiteLOs.some(l => !l.enrollment || l.enrollment.state !== COMPLETED)
  ) {
    // prerequisite enforced and not completed
    return false;
  }
  return true;
};

export const isNonBlockingChecklistModule = (loResource: PrimeLearningObjectResource) => {
  return loResource.resourceSubType === CHECKLIST && !loResource.isChecklistMandatory;
};

export const checkLoResourceForModuleLocking = (
  loResource: PrimeLearningObjectResource,
  training: PrimeLearningObject,
  trainingInstance: PrimeLearningObjectInstance
) => {
  const loResourceId = loResource.id;

  if (loResource.loResourceType === PREWORK) {
    return false;
  }
  const loResources = trainingInstance.loResources;

  if (!loResources) {
    return true;
  }

  for (let index = 0; index < loResources.length; index++) {
    const resource = loResources[index];
    const loResourceType = resource.loResourceType;

    const prevResource = loResources[index - 1];
    const prevResId = prevResource?.id;
    const prevResourceType = prevResource?.loResourceType;

    if (loResourceId !== resource.id) {
      continue;
    }

    if (
      (index > 0 && prevResourceType === PREWORK) ||
      (index === 0 && loResourceType === CONTENT)
    ) {
      return false;
    }

    if (index > 0 && prevResource && loResourceType === CONTENT) {
      const prevResGrade = training.enrollment?.loResourceGrades?.filter(
        loResourceGrade => loResourceGrade.id.search(prevResId) > -1
      );
      if (
        !prevResGrade ||
        prevResGrade.length === 0 ||
        prevResource.checklistEvaluationStatus === PENDING
      ) {
        return true;
      }

      if (isNonBlockingChecklistModule(prevResource) || prevResGrade[0].completed) {
        return false;
      }
      return true;
    }
  }
  return true;
};

export const checkIsTrainingLocked = (
  parentLO: PrimeLearningObject,
  training: PrimeLearningObject,
  shouldConsiderPassStatus: boolean
) => {
  //NOTE:needed here to check if current LO is enrolled and completed
  if (training.enrollment && isTrainingCompleted(training.enrollment)) {
    return false;
  }
  const { sections, subLOs, enrollment, isSubLoOrderEnforced } = parentLO;

  if (!enrollment) {
    return false;
  }
  if (!arePrerequisitesEnforcedAndCompleted(parentLO)) {
    return true;
  }
  if (!isSubLoOrderEnforced) {
    return false;
  }

  if (training.enrollment?.progressPercent > 0) {
    return false;
  }

  if (sections) {
    return checkIsTrainingLockedInsideSections(
      sections,
      training,
      subLOs,
      shouldConsiderPassStatus
    );
  }
  // For Certifications
  return checkIsTrainingLockedForSubLOs(training, subLOs, shouldConsiderPassStatus);
};

const checkIsTrainingLockedInsideSections = (
  sections: PrimeSections[],
  training: PrimeLearningObject,
  parentSubLOs: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean
) => {
  const { id: trainingId, enrollment: trainingEnrollment } = training;

  const loSectionIndex = sections.findIndex(item => item.loIds.includes(trainingId));
  const section = sections[loSectionIndex];
  const loIndex = section.loIds.findIndex(item => item === trainingId);

  const notAllTrainingsRequired =
    !section.mandatory || section.mandatoryLOCount !== section.loIds.length;

  // Check for Section Index === 0
  if (loSectionIndex === 0) {
    // If section is optional don't lock any LO
    // And for Section Index === 0 && LO Index === 0
    // If completing all trainings is not required, we don't follow subLOs order
    if (!section.mandatory || loIndex === 0 || notAllTrainingsRequired) {
      return false;
    }

    // For Lo Index > 0, Look at the Previous LOs and check if all are passed
    const previousLoIds = section.loIds.slice(0, loIndex);
    const previousLOs = parentSubLOs.filter(lo => previousLoIds.includes(lo.id));

    // When the LP is immediately enrolled, in Redux we don't have enrollment info in subLOs
    return !isCurrentOrPreviousTrainingsCompleted(
      trainingEnrollment,
      previousLOs,
      shouldConsiderPassStatus
    );
  }

  // For Section Index > 0
  // Checking last mandatory training sections, if not found, then checking previous section
  const mandatorySections = getPreviousRequiredSections(sections, loSectionIndex);

  const previousSectionMandatoryLOsNotCompleted = mandatorySections.some(previousSection => {
    return (
      previousSection.mandatory &&
      !areMandatoryLOsCompletedInsideSection(previousSection, parentSubLOs)
    );
  });

  // If mandatory trainings of previous section are completed, then don't lock
  if (previousSectionMandatoryLOsNotCompleted) {
    return true;
  }

  const previousSection = mandatorySections[0] || sections[loSectionIndex - 1];

  // For Section Index > 0 and LO Index === 0
  if (loIndex === 0) {
    // If previous section is optional then open the first LO
    if (!previousSection.mandatory) {
      return false;
    }
    return false;
  }

  // If completing all trainings is not required, we don't follow subLOs order
  if (notAllTrainingsRequired) {
    return false;
  }

  // For Section Index > 0 and LO Index > 0
  return checkIsTrainingLockedForSubLOs(training, parentSubLOs, shouldConsiderPassStatus, sections);
};

const checkIsTrainingLockedForSubLOs = (
  training: PrimeLearningObject,
  parentSubLOs: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean,
  sections?: PrimeSections[]
) => {
  // For subLO inside Certification, check all subLOs before the current subLO from parentSubLOs
  // For subLO inside LP Section, check all subLOs before the current subLO from its section
  let subLoIndex = parentSubLOs.findIndex(item => item.id === training.id);
  let loSectionIndex = 0;

  if (sections) {
    // Getting section id and subLO id for which training is part of
    loSectionIndex = sections.findIndex(item => item.loIds.includes(training.id));
    subLoIndex = sections[loSectionIndex].loIds.findIndex(loId => loId === training.id);
  }

  if (subLoIndex === 0) {
    return false;
  }

  if (!training.enrollment) {
    return true;
  }

  // For subLoIndex > 0
  let previousLos = parentSubLOs.slice(0, subLoIndex);
  if (sections) {
    // For Lo Index > 0, Look at the Previous LOs inside section and check if all are passed
    const previousLoIds = sections[loSectionIndex].loIds.slice(0, subLoIndex);
    previousLos = parentSubLOs.filter(lo => previousLoIds.includes(lo.id));
  }
  return !isCurrentOrPreviousTrainingsCompleted(
    training.enrollment,
    previousLos,
    shouldConsiderPassStatus
  );
};

const isCurrentOrPreviousTrainingsCompleted = (
  currLOEnrollment: PrimeLearningObjectInstanceEnrollment,
  previousLos: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean
) => {
  // If Current LO or previous LO is passed don't lock it
  if (isTrainingCompleted(currLOEnrollment)) {
    return true;
  }

  // Check if all previous LOs meet the completion and pass status requirements
  return previousLos.every(
    lo =>
      lo.enrollment &&
      isTrainingCompleted(lo.enrollment) &&
      (!shouldConsiderPassStatus || lo.enrollment.hasPassed)
  );
};
const areMandatoryLOsCompletedInsideSection = (
  section: PrimeSections,
  parentSubLOs: PrimeLearningObject[]
) => {
  const mandatoryLOCount = section.mandatoryLOCount;
  const completedLOs = section.loIds.filter(loId => {
    const lo = parentSubLOs.find(item => item.id === loId);
    return lo?.enrollment?.progressPercent === 100 || lo?.enrollment?.state === COMPLETED;
  }).length;

  return completedLOs >= mandatoryLOCount;
};

const getPreviousRequiredSections = (sections: PrimeSections[], currentSectionIdx: number) => {
  let mandatorySections = [];

  // Need reverse order here, to check immediate previous mandatory sections
  for (let i = currentSectionIdx - 1; i >= 0; i--) {
    if (sections[i].mandatory) {
      mandatorySections.push(sections[i]);
    }
  }
  return mandatorySections;
};
