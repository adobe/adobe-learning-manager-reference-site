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
import { PREWORK, TESTOUT } from "../../../utils/constants";
import { getEnrollment } from "../../../utils/hooks";
import { arePrerequisiteEnforcedAndCompleted } from "../../../utils/overview";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResources: PrimeLearningObjectResource[];
  isPartOfLP?: boolean;
  isParentLOEnrolled?: boolean;
  isParentFlexLP?: boolean;
  isContent?: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
  lastPlayingLoResourceId: String;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
}> = (props) => {
  const {
    loResources,
    launchPlayerHandler,
    training,
    trainingInstance,
    isPartOfLP = false,
    isParentLOEnrolled = false,
    isParentFlexLP = false,
    isContent,
    isPreviewEnabled,
    updateFileSubmissionUrl,
    lastPlayingLoResourceId,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
  } = props;

  const isModuleLocked = (
    loResource: PrimeLearningObjectResource,
    index: number
  ): boolean => {
    if (!arePrerequisiteEnforcedAndCompleted(training)) {
      return true;
    }
    if (!training.isSubLoOrderEnforced) {
      return false;
    }
    const enrollment = getEnrollment(training, trainingInstance);
    
    if (!enrollment) {
      if(index==0){
        return false;
      }
      return true;
    }
    const loResourceGrades = enrollment.loResourceGrades;
    
    if(loResource.loResourceType === TESTOUT || loResource.loResourceType === PREWORK){
      return false;
    }

    if (index === 0) {
      return false;
    }
    const previousResourceId = loResources[index - 1]?.id;
    const filteredPreviousResourceGrade = loResourceGrades.filter(
      (loResourceGrade) => loResourceGrade.id.search(previousResourceId) > -1
    );
    if (
      filteredPreviousResourceGrade.length &&
      !filteredPreviousResourceGrade[0].hasPassed
    ) {
      return true;
    }

    return false;
  };

  return (
    <ul
      className={`${styles.moduleListContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
    >
      {loResources?.map((loResource, index) => (
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
          isParentLOEnrolled={isParentLOEnrolled}
          isParentFlexLP={isParentFlexLP}
          lastPlayingLoResourceId = {lastPlayingLoResourceId}
          setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
          timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
