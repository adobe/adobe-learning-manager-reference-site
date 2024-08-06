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
  PrimeLearningObjectResource,
  PrimeNote,
} from "../../../models/PrimeModels";
import { getCoursesInsideFlexLP, hasFlexibleChildLP } from "../../../utils/hooks";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";
import { checkIsTrainingLocked } from "../../../utils/overview";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  trainings: PrimeLearningObject[];
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  isParentLOEnrolled?: boolean;
  isRootLOEnrolled?: boolean;
  isRootLoPreviewEnabled: boolean;
  showMandatoryLabel?: boolean;
  isPreviewEnabled: boolean;
  isFlexLPValidationEnabled?: boolean;
  updateFileSubmissionUrl: Function;
  parentLO: PrimeLearningObject;
  parentLoName: string;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  setSelectedInstanceInfo: Function;
  isFlexible: boolean;
  flexLPTraining: boolean;
  courseInstanceMapping: any;
  notes: PrimeNote[];
  updateNote: (
    note: PrimeNote,
    updatedText: string,
    loId: string,
    loResourceId: PrimeLearningObjectResource
  ) => Promise<void | undefined>;
  deleteNote: (noteId: string, loId: string, loResourceId: string) => Promise<void | undefined>;
  downloadNotes: (
    loId: string,
    loInstanceId: string,
    loName: string,
    loInstanceName: string
  ) => Promise<void | undefined>;
  sendNotesOnMail: (loId: string, loInstanceId: string) => Promise<void | undefined>;
  lastPlayingLoResourceId: string;
  selectedLoList: any;
  showUnselectedLOs: boolean;
  parentHasEnforcedPrerequisites: boolean;
  updatePlayerLoState: Function;
  isRootLoCompleted: boolean;
  parentHasSubLoOrderEnforced: boolean;
  setEnrollViaModuleClick: Function;
  firstChildId: string;
}> = props => {
  const {
    trainings,
    launchPlayerHandler,
    isPartOfLP = false,
    isPartOfCertification = false,
    showMandatoryLabel = false,
    isPreviewEnabled = false,
    isFlexLPValidationEnabled = false,
    updateFileSubmissionUrl,
    isParentLOEnrolled = false,
    isRootLOEnrolled = false,
    isRootLoPreviewEnabled = false,
    parentLO,
    parentLoName,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    setSelectedInstanceInfo,
    isFlexible: isParentFlexLP,
    flexLPTraining = false,
    courseInstanceMapping,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    selectedLoList,
    showUnselectedLOs,
    parentHasEnforcedPrerequisites,
    updatePlayerLoState,
    isRootLoCompleted,
    parentHasSubLoOrderEnforced,
    setEnrollViaModuleClick,
    firstChildId,
  } = props;

  const areAllCoursesSelected = (training: PrimeLearningObject) => {
    const courseIdList = Object.keys(selectedLoList);
    if (courseIdList.length === 0) {
      return false;
    }
    const allCourses = getCoursesInsideFlexLP(training, true);
    const allSelected = allCourses.every(subLO => courseIdList.includes(subLO.id));
    return allSelected;
  };

  return (
    <>
      {trainings?.map(training => {
        const loType = training.loType;

        // Enforced subLOs inside flex lp not handled
        const isTrainingLocked = checkIsTrainingLocked(parentLO, training);

        const isPartOfFirstChildTraining = firstChildId === training.id;

        if (loType === COURSE) {
          if (showUnselectedLOs && !isParentFlexLP) {
            return;
          }
          return (
            <React.Fragment key={training.id}>
              <PrimeCourseItemContainer
                key={training.id}
                training={training}
                launchPlayerHandler={launchPlayerHandler}
                isPartOfLP={isPartOfLP}
                isPartOfCertification={isPartOfCertification}
                showMandatoryLabel={showMandatoryLabel}
                isPreviewEnabled={isPreviewEnabled}
                isFlexLPValidationEnabled={isFlexLPValidationEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isParentLOEnrolled}
                isRootLOEnrolled={isRootLOEnrolled}
                isRootLoPreviewEnabled={isRootLoPreviewEnabled}
                parentLoName={parentLoName}
                setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                setSelectedInstanceInfo={setSelectedInstanceInfo}
                isParentFlexLP={isParentFlexLP}
                flexLPTraining={flexLPTraining}
                notes={notes}
                updateNote={updateNote}
                deleteNote={deleteNote}
                downloadNotes={downloadNotes}
                sendNotesOnMail={sendNotesOnMail}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
                parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
                parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
                showUnselectedLOs={showUnselectedLOs}
                courseInstanceMapping={courseInstanceMapping}
                isTrainingLocked={isTrainingLocked}
                updatePlayerLoState={updatePlayerLoState}
                isRootLoCompleted={isRootLoCompleted}
                setEnrollViaModuleClick={setEnrollViaModuleClick}
                isPartOfFirstChildTraining={isPartOfFirstChildTraining}
              ></PrimeCourseItemContainer>
            </React.Fragment>
          );
        } else if (loType === LEARNING_PROGRAM) {
          const isFlexLP = training.instances[0].isFlexible;
          if (showUnselectedLOs && (!isFlexLP || (isFlexLP && areAllCoursesSelected(training)))) {
            return;
          }
          return (
            <PrimeLPItemContainer
              key={training.id}
              training={training}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              flexLPTraining={flexLPTraining}
              showMandatoryLabel={showMandatoryLabel}
              isPreviewEnabled={isPreviewEnabled}
              isFlexLPValidationEnabled={isFlexLPValidationEnabled}
              updateFileSubmissionUrl={updateFileSubmissionUrl}
              isParentLOEnrolled={isParentLOEnrolled}
              isRootLOEnrolled={isRootLOEnrolled}
              isRootLoPreviewEnabled={isRootLoPreviewEnabled}
              parentLoName={parentLoName}
              setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
              timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
              setSelectedInstanceInfo={setSelectedInstanceInfo}
              courseInstanceMapping={courseInstanceMapping}
              selectedLoList={selectedLoList}
              notes={notes}
              updateNote={updateNote}
              deleteNote={deleteNote}
              downloadNotes={downloadNotes}
              sendNotesOnMail={sendNotesOnMail}
              lastPlayingLoResourceId={lastPlayingLoResourceId}
              showUnselectedLOs={showUnselectedLOs}
              parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
              parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
              isTrainingLocked={isTrainingLocked}
              updatePlayerLoState={updatePlayerLoState}
              isRootLoCompleted={isRootLoCompleted}
              setEnrollViaModuleClick={setEnrollViaModuleClick}
              isPartOfFirstChildTraining={isPartOfFirstChildTraining}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
