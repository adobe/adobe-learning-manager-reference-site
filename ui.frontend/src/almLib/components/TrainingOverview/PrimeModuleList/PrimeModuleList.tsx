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
import React from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from "../../../models/PrimeModels";
import { CHECKLIST, CONTENT, PENDING } from "../../../utils/constants";
import { filterLoReourcesBasedOnResourceType, getEnrollment } from "../../../utils/hooks";
import {
  arePrerequisitesEnforcedAndCompleted,
  checkLoResourceForModuleLocking,
  isNonBlockingChecklistModule,
} from "../../../utils/overview";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResources: PrimeLearningObjectResource[];
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  isParentLOEnrolled?: boolean;
  isRootLOEnrolled?: boolean;
  isRootLoPreviewEnabled: boolean;
  isParentFlexLP?: boolean;
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  isContent?: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
  lastPlayingLoResourceId: String;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  isLocked: boolean;
  updatePlayerLoState: Function;
  childLpId: string;
  isRootLoCompleted: boolean;
  setEnrollViaModuleClick: Function;
  isPartOfFirstChildTraining: boolean;
}> = props => {
  const {
    loResources,
    launchPlayerHandler,
    training,
    trainingInstance,
    isPartOfLP = false,
    isPartOfCertification = false,
    isParentLOEnrolled = false,
    isRootLOEnrolled = false,
    isRootLoPreviewEnabled = false,
    isParentFlexLP = false,
    parentHasEnforcedPrerequisites = false,
    parentHasSubLoOrderEnforced = false,
    isContent,
    isPreviewEnabled,
    updateFileSubmissionUrl,
    lastPlayingLoResourceId,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    isLocked,
    updatePlayerLoState,
    childLpId,
    isRootLoCompleted,
    setEnrollViaModuleClick,
    isPartOfFirstChildTraining,
  } = props;

  const isPartOfParentLO = isPartOfLP || isPartOfCertification;
  const hasSubLoOrderEnforced = training.isSubLoOrderEnforced || parentHasSubLoOrderEnforced;

  const isModuleLocked = (
    loResource: PrimeLearningObjectResource,
    loResourceIndex: number
  ): boolean => {
    if (isLocked) {
      return true;
    }
    if (!hasSubLoOrderEnforced) {
      return false;
    }

    const coreContentResources = filterLoReourcesBasedOnResourceType(trainingInstance, CONTENT);
    const isFirstModuleOfCoreContent = coreContentResources[0]?.id === loResource.id;
    const loResourceType = loResource.loResourceType;

    if (isPartOfParentLO && !isRootLOEnrolled && parentHasSubLoOrderEnforced) {
      // if parent has subLOs enforced and not enrolled, lock all modules except first course's modules

      if (!isPartOfFirstChildTraining) {
        return true;
      }

      // First course of training
      if (training.isSubLoOrderEnforced) {
        // If subLO order is enforced, lock all modules except first one
        // Not locking PREWORK and TESTOUT modules of first course
        return loResourceType === CONTENT && !isFirstModuleOfCoreContent;
      }
      return false;
    }

    // If the module is a prework or testout, it should be unlocked
    if (loResourceType !== CONTENT) {
      return false;
    }

    if (isFirstModuleOfCoreContent) {
      return false;
    }

    // Flex lp check to handle the case if course is enrolled but not instance is selected
    const enrollment = isParentFlexLP ? training.enrollment : trainingInstance.enrollment;
    if (!enrollment || !isParentLOEnrolled) {
      if (loResourceIndex === 0) {
        return false;
      }
      return true;
    }

    // A. if previousResourceGrade (i.e enrollment is there)
    // ----> 1. if previous resource checklistEvaluationStatus is pending -> Lock the (current) module
    // ----> 2. if previous resource is non-blocking checklist module -> Unlock the (current) module
    // ----> 3. if previous resource hasPassed -> Unlock the (current) module
    // ----> 4. if previous resource has blocking checklist module (mandatory) and not passed -> Lock the (current) module
    // B. if previousResourceGrade is not there (no enrollment) -> Lock the (current) module

    const checklistResources = filterLoReourcesBasedOnResourceType(trainingInstance, CHECKLIST);
    const loResourceGrades = enrollment.loResourceGrades;
    if (checklistResources.length > 0 && loResourceIndex >= 0) {
      const previousResource = coreContentResources[loResourceIndex - 1];
      const previousResourceId = previousResource?.id;
      const filteredPreviousResourceGrade = loResourceGrades?.filter(
        loResourceGrade => loResourceGrade.id.search(previousResourceId) > -1
      );
      if (!filteredPreviousResourceGrade.length) {
        return true;
      }

      if (previousResource.checklistEvaluationStatus === PENDING) {
        return true;
      }

      if (
        isNonBlockingChecklistModule(previousResource) ||
        filteredPreviousResourceGrade[0].hasPassed
      ) {
        return false;
      }

      return true;
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    if (!arePrerequisitesEnforcedAndCompleted(training)) {
      // prerequisite enforced and not completed
      return true;
    }

    if (training.isSubLoOrderEnforced) {
      return checkLoResourceForModuleLocking(loResource, training, trainingInstance);
    }

    return false;
  };

  return (
    <ul
      className={`${styles.moduleListContainer} ${isPartOfParentLO ? styles.isPartOfParentLO : ""}`}
      data-automationid={`${training.localizedMetadata[0].name}-modules-list`}
    >
      {loResources?.map((loResource, index) => (
        <div key={index}>
          <PrimeModuleItem
            loResource={loResource}
            key={loResource.id}
            launchPlayerHandler={launchPlayerHandler}
            training={training}
            trainingInstance={trainingInstance}
            isContent={isContent}
            isPreviewEnabled={isPreviewEnabled}
            canPlay={!isModuleLocked(loResource, index)}
            updateFileSubmissionUrl={updateFileSubmissionUrl}
            isPartOfLP={isPartOfLP}
            isPartOfCertification={isPartOfCertification}
            isParentLOEnrolled={isParentLOEnrolled}
            isRootLOEnrolled={isRootLOEnrolled}
            isRootLoPreviewEnabled={isRootLoPreviewEnabled}
            isParentFlexLP={isParentFlexLP}
            parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
            parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
            lastPlayingLoResourceId={lastPlayingLoResourceId}
            setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
            timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
            updatePlayerLoState={updatePlayerLoState}
            childLpId={childLpId}
            isRootLoCompleted={isRootLoCompleted}
            setEnrollViaModuleClick={setEnrollViaModuleClick}
          ></PrimeModuleItem>
          <hr className={styles.loResourceSeparator} />
        </div>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
