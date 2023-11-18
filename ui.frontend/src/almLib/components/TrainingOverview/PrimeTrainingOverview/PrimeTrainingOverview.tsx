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
import {
  PrimeLearningObject,
  PrimeLearningObjectResource,
  PrimeNote,
} from "../../../models/PrimeModels";
import { findCoursesInsideFlexLP } from "../../../utils/hooks";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeLPItemContainer } from "../PrimeLPItemContainer";

const COURSE = "course";
const LEARNING_PROGRAM = "learningProgram";
const PrimeTrainingOverview: React.FC<{
  trainings: PrimeLearningObject[];
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  isParentLOEnrolled?: boolean;
  showMandatoryLabel?: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
  parentLoName: string;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  sendInstanceId: Function;
  selectedCourses: Object;
  isFlexible: boolean;
  selectedInstanceInfo?: Object;
  notes: PrimeNote[];
  updateNote: (
    note: PrimeNote,
    updatedText: string,
    loId: string,
    loResourceId: PrimeLearningObjectResource
  ) => Promise<void | undefined>;
  deleteNote: (
    noteId: string,
    loId: string,
    loResourceId: string
  ) => Promise<void | undefined>;
  downloadNotes: (
    loId: string,
    loInstanceId: string
  ) => Promise<void | undefined>;
  sendNotesOnMail: (
    loId: string,
    loInstanceId: string
  ) => Promise<void | undefined>;
  lastPlayingLoResourceId: string;
  showUnselectedLOs: boolean;
}> = (props) => {
  const {
    trainings,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isPreviewEnabled = false,
    updateFileSubmissionUrl,
    isParentLOEnrolled = false,
    parentLoName,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    sendInstanceId,
    selectedCourses,
    isFlexible,
    selectedInstanceInfo,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    showUnselectedLOs
  } = props;

  const allCoursesAreSelected=(training: PrimeLearningObject)=>{
    if(!selectedInstanceInfo){
      return false;
    }
      const allCourses=findCoursesInsideFlexLP(training, isFlexible);
      const courseIdList = Object.keys(selectedInstanceInfo);
      let allSelected = allCourses.every((subLO) => courseIdList.includes(subLO.id));
    return allSelected;
  }

  return (
    <>
      {trainings?.map((training) => {
        const loType = training.loType;
        if (loType === COURSE) {
          return (
            <>
              <PrimeCourseItemContainer
                key={training.id}
                training={training}
                launchPlayerHandler={launchPlayerHandler}
                isPartOfLP={isPartOfLP}
                showMandatoryLabel={showMandatoryLabel}
                isPreviewEnabled={isPreviewEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isParentLOEnrolled}
                parentLoName={parentLoName}
                setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                sendInstanceId={sendInstanceId}
                selectedCourses={selectedCourses}
                isFlexible={isFlexible}
                selectedInstanceInfo={selectedInstanceInfo}
                notes={notes}
                updateNote={updateNote}
                deleteNote={deleteNote}
                downloadNotes={downloadNotes}
                sendNotesOnMail={sendNotesOnMail}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
              ></PrimeCourseItemContainer>
            </>
          );
        } else if (loType === LEARNING_PROGRAM) {
          
          if((showUnselectedLOs && isFlexible && allCoursesAreSelected(training)) || 
              (showUnselectedLOs && !training.instances[0].isFlexible)){
                // assuming one instance of LP
            return;
          }
          return (
            <PrimeLPItemContainer
              key={training.id}
              training={training}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              showMandatoryLabel={showMandatoryLabel}
              isPreviewEnabled={isPreviewEnabled}
              updateFileSubmissionUrl={updateFileSubmissionUrl}
              isParentLOEnrolled={isParentLOEnrolled}
              parentLoName={parentLoName}
              setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
              timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
              sendInstanceId={sendInstanceId}
              selectedCourses={selectedCourses}
              isFlexible={isFlexible}
              selectedInstanceInfo={selectedInstanceInfo}
              notes={notes}
              updateNote={updateNote}
              deleteNote={deleteNote}
              downloadNotes={downloadNotes}
              sendNotesOnMail={sendNotesOnMail}
              lastPlayingLoResourceId={lastPlayingLoResourceId}
              showUnselectedLOs={showUnselectedLOs}
            ></PrimeLPItemContainer>
          );
        }
        return <></>;
      })}
    </>
  );
};

export default PrimeTrainingOverview;
