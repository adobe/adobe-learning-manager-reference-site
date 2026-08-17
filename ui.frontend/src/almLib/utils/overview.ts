/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeSections,
} from '../models';
import {
  CHECKLIST,
  COMPLETED,
  CONTENT,
  PENDING,
  PENDING_ACCEPTANCE,
  PENDING_APPROVAL,
  PREWORK,
  TESTOUT,
  WAITING,
} from './constants';
import { getALMObject, updateURLParams, isAccAltCompletionEnabled } from './global';
import { isTrainingCompleted } from './lo-utils';

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

/**
 * Returns the list of prerequisite LO ids that are mandatory (must be completed when enforced).
 * When prequisiteConstraints is present, only LOs with mandatory: true are required.
 * When prequisiteConstraints is empty or missing, all prerequisiteLOs are required.
 */
const getMandatoryPrerequisiteLoIds = (training: PrimeLearningObject): string[] | null => {
  const constraints = training.prequisiteConstraints;
  if (constraints?.length) {
    return constraints.filter(c => c.mandatory).map(c => c.prerequisiteLOId);
  }
  return null;
};

export const arePrerequisitesEnforcedAndCompleted = (
  training: PrimeLearningObject,
  account: PrimeAccount,
  shouldConsiderPassStatus = false
) => {
  if (!training.prerequisiteLOs?.length || !training.isPrerequisiteEnforced) {
    return true;
  }

  const mandatoryIds = getMandatoryPrerequisiteLoIds(training);
  const prerequisiteLOsToCheck =
    mandatoryIds === null
      ? training.prerequisiteLOs
      : training.prerequisiteLOs.filter(lo => mandatoryIds.includes(lo.id));

  const hasIncompleteMandatory = prerequisiteLOsToCheck.some(
    l =>
      //if prerequiste is alternate complete, consider it satisfied (only if alternate completion is enabled)
      (!isAccAltCompletionEnabled(account) || !l.isAlternateComplete) &&
      (!l.enrollment ||
        l.enrollment.state !== COMPLETED ||
        (shouldConsiderPassStatus && !l.enrollment.hasPassed))
  );

  return !hasIncompleteMandatory;
};

export const isNonBlockingChecklistModule = (loResource: PrimeLearningObjectResource) => {
  return loResource.resourceSubType === CHECKLIST && !loResource.isChecklistMandatory;
};

export const checkLoResourceForModuleLocking = (
  loResource: PrimeLearningObjectResource,
  trainingInstance: PrimeLearningObjectInstance
) => {
  const loResourceId = loResource.id;

  if (loResource.loResourceType === PREWORK || loResource.loResourceType === TESTOUT) {
    return false;
  }
  const loResources = trainingInstance.loResources?.filter(
    loResource => loResource.loResourceType === CONTENT
  );

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
      const prevResources = loResources.slice(0, index);
      const prevResourceIds = prevResources.map(r => r.id);

      // To get the grades in correct order
      const prevGrades = (trainingInstance.enrollment?.loResourceGrades || []).filter(g =>
        prevResourceIds.some(id => g.id.includes(id))
      );

      if (prevGrades.length === 0 || prevResource.checklistEvaluationStatus === PENDING) {
        return true;
      }

      const areAllPrevGradesCompleted = prevGrades.every(grade => grade.completed);
      if (!areAllPrevGradesCompleted) {
        return true;
      }

      if (isNonBlockingChecklistModule(prevResource)) {
        return false;
      }
    }
  }
  return false;
};

export const checkIsTrainingLocked = (
  parentLO: PrimeLearningObject,
  training: PrimeLearningObject,
  shouldConsiderPassStatus: boolean,
  account: PrimeAccount
) => {
  //NOTE:needed here to check if current LO is enrolled and completed (or alternate completed)
  if (
    (training.enrollment && isTrainingCompleted(training.enrollment)) ||
    (isAccAltCompletionEnabled(account) && training.isAlternateComplete)
  ) {
    return false;
  }
  const { sections, subLOs, enrollment, isSubLoOrderEnforced } = parentLO;

  if (!enrollment) {
    if (isSubLoOrderEnforced) {
      let subLoIndex = subLOs.findIndex(item => item.id === training.id);

      if (sections?.length > 0) {
        const loSectionIndex = sections.findIndex(item => item.loIds.includes(training.id));
        subLoIndex = sections[loSectionIndex].loIds.findIndex(loId => loId === training.id);
      }

      if (subLoIndex > 0) {
        // CPRIME-83034 - isCourseNotEnrollable
        return true;
      }
    }
    return false;
  }
  if (!arePrerequisitesEnforcedAndCompleted(parentLO, account, shouldConsiderPassStatus)) {
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
      shouldConsiderPassStatus,
      account
    );
  }
  // For Certifications
  return checkIsTrainingLockedForSubLOs(training, subLOs, shouldConsiderPassStatus, account);
};

const checkIsTrainingLockedInsideSections = (
  sections: PrimeSections[],
  training: PrimeLearningObject,
  parentSubLOs: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean,
  account: PrimeAccount
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
      shouldConsiderPassStatus,
      account
    );
  }

  // For Section Index > 0
  // Checking last mandatory training sections, if not found, then checking previous section
  const mandatorySections = getPreviousRequiredSections(sections, loSectionIndex);

  const previousSectionMandatoryLOsNotCompleted = mandatorySections.some(previousSection => {
    return (
      previousSection.mandatory &&
      !areMandatoryLOsCompletedInsideSection(previousSection, parentSubLOs, account)
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
  return checkIsTrainingLockedForSubLOs(
    training,
    parentSubLOs,
    shouldConsiderPassStatus,
    account,
    sections
  );
};

const checkIsTrainingLockedForSubLOs = (
  training: PrimeLearningObject,
  parentSubLOs: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean,
  account: PrimeAccount,
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
    shouldConsiderPassStatus,
    account
  );
};

const isCurrentOrPreviousTrainingsCompleted = (
  currLOEnrollment: PrimeLearningObjectInstanceEnrollment,
  previousLos: PrimeLearningObject[],
  shouldConsiderPassStatus: boolean,
  account: PrimeAccount
) => {
  // If Current LO or previous LO is passed don't lock it
  if (isTrainingCompleted(currLOEnrollment)) {
    return true;
  }

  // Check if all previous LOs meet the completion and pass status requirements
  return previousLos.every(
    lo =>
      (isAccAltCompletionEnabled(account) && lo.isAlternateComplete) ||
      (lo.enrollment &&
        isTrainingCompleted(lo.enrollment) &&
        (!shouldConsiderPassStatus || lo.enrollment.hasPassed))
  );
};
const areMandatoryLOsCompletedInsideSection = (
  section: PrimeSections,
  parentSubLOs: PrimeLearningObject[],
  account: PrimeAccount
) => {
  const mandatoryLOCount = section.mandatoryLOCount;
  const completedLOs = section.loIds.filter(loId => {
    const lo = parentSubLOs.find(item => item.id === loId);
    return (
      (isAccAltCompletionEnabled(account) && lo?.isAlternateComplete) ||
      lo?.enrollment?.progressPercent === 100 ||
      lo?.enrollment?.state === COMPLETED
    );
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

export const notifyParentToCleanModuleParams = () => {
  const hash = window.location.hash || '';
  const cleanedHash = hash.replace(/[?&]moduleId=[^&#]*/g, '').replace(/\/module\/[^/?&#]*/g, '');
  if (cleanedHash !== hash) {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search + cleanedHash
    );
  }
  window.parent.postMessage({ type: 'ALM_CLEAR_MODULE_ID' }, '*');
};
