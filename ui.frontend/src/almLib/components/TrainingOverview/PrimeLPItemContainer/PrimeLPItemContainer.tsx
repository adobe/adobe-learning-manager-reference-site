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
import { Button } from "@adobe/react-spectrum";
import ChevronDown from "@spectrum-icons/workflow/ChevronDown";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
  PrimeLearningObject,
  PrimeLearningObjectResource,
  PrimeLocalizationMetadata,
  PrimeNote,
} from "../../../models";
import { CONTENT, LEARNING_PROGRAM } from "../../../utils/constants";
import { filterLoReourcesBasedOnResourceType, filterTrainingInstance, findCoursesInsideFlexLP, findRetiredCoursesInsideFlexLP, getDuration} from "../../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeLPItemContainer.module.css";
const PrimeLPItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP: boolean;
  isParentLOEnrolled: boolean;
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
    training,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isPreviewEnabled = false,
    updateFileSubmissionUrl,
    isParentLOEnrolled,
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

  const [isCollapsed, setIsCollapsed] = useState(true);
  const { locale } = useIntl();

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };
  const subLos = training.subLOs;

  const isFlexLP=()=>{
    if(training.loType===LEARNING_PROGRAM){
      return trainingInstance.isFlexible;
    }
    else if(isFlexible){
      return true;
    }
    return false;
  }

  const allCoursesInsideFlexLP = findCoursesInsideFlexLP(training, isFlexLP());
  const retiredCoursesInsideFlexLP = findRetiredCoursesInsideFlexLP(training, isFlexLP());
  
  useEffect(() => {
    allCoursesInsideFlexLP.forEach((lo) => {
      if (!selectedInstanceInfo || !(
        selectedInstanceInfo![
          lo.id as keyof typeof selectedInstanceInfo
        ] as any
      )) {
        if (lo.enrollment && lo.enrollment.loInstance && isFlexLP() && isParentLOEnrolled) {
          let moduleResources = filterLoReourcesBasedOnResourceType(
            lo.enrollment.loInstance,
            CONTENT
          );
          const contentModuleDuration = getDuration(moduleResources, locale);
          sendInstanceId(
            lo.enrollment.loInstance.id,
            lo.id,
            lo.localizedMetadata[0].name,
            false,
            lo.enrollment.loInstance.localizedMetadata[0].name,
            contentModuleDuration,
            true
          );
        }
      }
    });

    //FLEX LP list initialization - retired courses
    retiredCoursesInsideFlexLP.forEach((lo) => {
      if (!selectedInstanceInfo || !(
        selectedInstanceInfo![
          lo.id as keyof typeof selectedInstanceInfo
        ] as any
      )) {
        let moduleResources = filterLoReourcesBasedOnResourceType(
          lo.instances[0],
          CONTENT
        );
        const contentModuleDuration = getDuration(moduleResources, locale);
        sendInstanceId(
          lo.instances[0].id,
          lo.id,
          lo.localizedMetadata[0].name,
          false,
          lo.instances[0].localizedMetadata[0].id,
          contentModuleDuration,
          true
        );
      }
    });
  },[]);
  
  return (
    <li
      className={`${styles.container} ${isPartOfLP ? styles.isPartOfLP : ""}`}
    >
      <PrimeTrainingItemContainerHeader
        name={name}
        description={description}
        training={training}
        trainingInstance={trainingInstance}
        overview={overview}
        richTextOverview={richTextOverview}
        launchPlayerHandler={launchPlayerHandler}
        isPartOfLP={isPartOfLP}
        showMandatoryLabel={showMandatoryLabel}
        isPreviewEnabled={isPreviewEnabled}
        isParentLOEnrolled={isParentLOEnrolled}
        parentLoName={parentLoName}
        isFlexible={isFlexLP()}
      />
      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      {!isCollapsed && (
        <ul className={styles.lpList}>
          {subLos.map((subLo) => {
            // There will only be list of courses inside nested LP
            if(showUnselectedLOs && selectedInstanceInfo && selectedInstanceInfo[
              subLo.id as keyof typeof selectedInstanceInfo
            ]){
              return;
            }
            return (
              <div key={subLo.id} className={styles.lpListItemContainer}>
                <PrimeCourseItemContainer
                  training={subLo}
                  launchPlayerHandler={launchPlayerHandler}
                  isPartOfLP={isPartOfLP}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={isParentLOEnrolled}
                  parentLoName={parentLoName}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                  sendInstanceId={sendInstanceId}
                  selectedCourses={selectedCourses}
                  isFlexible={isFlexLP()}
                  selectedInstanceInfo={selectedInstanceInfo}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                ></PrimeCourseItemContainer>
              </div>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default PrimeLPItemContainer;
