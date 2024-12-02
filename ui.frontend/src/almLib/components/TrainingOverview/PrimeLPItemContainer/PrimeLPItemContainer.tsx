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
  PrimeSections,
} from "../../../models";
import { filterTrainingInstance, getCourseInstanceMapping } from "../../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { PrimeCourseItemContainer } from "../PrimeCourseItemContainer";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeLPItemContainer.module.css";
import { COURSE, ENGLISH_LOCALE } from "../../../utils/constants";
import { checkIsTrainingLocked } from "../../../utils/overview";
import { useUserContext } from "../../../contextProviders/userContextProvider";
const PrimeLPItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP: boolean;
  isParentLOEnrolled: boolean;
  isRootLOEnrolled: boolean;
  isRootLoPreviewEnabled: boolean;
  showMandatoryLabel?: boolean;
  isPreviewEnabled: boolean;
  isFlexLPValidationEnabled: boolean;
  flexLPTraining: boolean;
  updateFileSubmissionUrl: Function;
  parentLoName: string;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  setSelectedInstanceInfo: Function;
  courseInstanceMapping: any;
  selectedLoList: any;
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
  showUnselectedLOs: boolean;
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  isTrainingLocked: boolean;
  updatePlayerLoState: Function;
  isRootLoCompleted: boolean;
  setEnrollViaModuleClick: Function;
  isPartOfFirstChildTraining: boolean;
  courseInstanceMap: any;
}> = props => {
  const {
    training,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isPreviewEnabled = false,
    isFlexLPValidationEnabled = false,
    flexLPTraining = false,
    updateFileSubmissionUrl,
    isParentLOEnrolled,
    isRootLOEnrolled,
    isRootLoPreviewEnabled = false,
    parentLoName,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    setSelectedInstanceInfo,
    courseInstanceMapping,
    selectedLoList,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    showUnselectedLOs,
    parentHasEnforcedPrerequisites,
    parentHasSubLoOrderEnforced,
    isTrainingLocked,
    updatePlayerLoState,
    isRootLoCompleted,
    setEnrollViaModuleClick,
    isPartOfFirstChildTraining,
    courseInstanceMap,
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const { formatMessage, locale } = useIntl();
  const user = useUserContext() || {};
  const shouldConsiderPassStatus = user.account?.shouldPreReqConsiderPassStatus;
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, contentLocale);
    }, [training.localizedMetadata, contentLocale]);

  const clickHandler = () => {
    setIsCollapsed(prevState => !prevState);
  };
  useEffect(() => {
    // Expanded initally to get flex lp course count. Here collapsing it.
    setIsCollapsed(true);
  }, []);

  const areAllInstancesOfSectionSelected = (section: PrimeSections) => {
    const selectedLoObj = Object.keys(selectedLoList);

    return section.loIds.every(id => {
      const lo = training.subLOs.find(subLO => subLO.id === id);

      if (lo?.loType === COURSE) {
        return !trainingInstance.isFlexible || selectedLoObj.includes(lo.id);
      } else {
        return (
          !lo?.instances[0].isFlexible ||
          lo?.subLOs.every(subLO => selectedLoObj.includes(subLO.id))
        );
      }
    });
  };

  const getSectionHeader = (section: PrimeSections) => {
    const { name } = getPreferredLocalizedMetadata(section.localizedMetadata, contentLocale);

    const hasContent =
      name || !section.mandatory || section.mandatoryLOCount !== section.loIds?.length;

    return (
      <div className={`${hasContent ? styles.sectionHeader : styles.noSection}`}>
        {name && (
          <h3 className={styles.sectionName} data-automationid={`${name}-section-name`}>
            {name}
          </h3>
        )}
        {!section.mandatory && (
          <span className={styles.sectionOptional} data-automationid={`${name}-section-optional`}>
            {formatMessage({
              id: "alm.overview.section.optional",
              defaultMessage: "Optional",
            })}
          </span>
        )}
        {section.mandatory && section.mandatoryLOCount !== section.loIds?.length && (
          <span className={styles.sectionOptional} data-automationid={`${name}-section-options`}>
            {formatMessage(
              { id: "alm.overview.section.xOutOfy" },
              {
                0: section.mandatoryLOCount,
                1: section.loIds?.length,
              }
            )}
          </span>
        )}
      </div>
    );
  };

  const getSubLOsOfLP = () => {
    return training.sections.map((section, index) => {
      //Flex LP case - If all LO instances inside section is either selected or completed
      if (showUnselectedLOs && areAllInstancesOfSectionSelected(section)) {
        return ``;
      }
      const trainingIds = section.loIds;
      const subLOs = training.subLOs.filter(subLO => trainingIds.indexOf(subLO.id) !== -1);
      subLOs.sort(
        (trainingId1, trainingId2) =>
          trainingIds.indexOf(trainingId1.id) - trainingIds.indexOf(trainingId2.id)
      );

      return (
        <section className={styles.trainingContainer} key={index}>
          {getSectionHeader(section)}
          {subLOs?.map(subLo => {
            // There will only be list of courses inside nested LP
            if (showUnselectedLOs && getCourseInstanceMapping(selectedLoList, subLo.id)) {
              // If instance is already selected, then not showing under unselected tab in flex lp
              return ``;
            }

            const isLocked =
              isTrainingLocked || checkIsTrainingLocked(training, subLo, shouldConsiderPassStatus);

            return (
              <div key={subLo.id} className={styles.lpListItemContainer}>
                <PrimeCourseItemContainer
                  training={subLo}
                  launchPlayerHandler={launchPlayerHandler}
                  isPartOfLP={isPartOfLP}
                  isPreviewEnabled={isPreviewEnabled}
                  isFlexLPValidationEnabled={isFlexLPValidationEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={training.enrollment ? true : false}
                  isRootLOEnrolled={isRootLOEnrolled}
                  isRootLoPreviewEnabled={isRootLoPreviewEnabled}
                  parentLoName={parentLoName}
                  setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                  timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                  setSelectedInstanceInfo={setSelectedInstanceInfo}
                  isParentFlexLP={trainingInstance.isFlexible}
                  flexLPTraining={flexLPTraining}
                  notes={notes}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                  downloadNotes={downloadNotes}
                  sendNotesOnMail={sendNotesOnMail}
                  lastPlayingLoResourceId={lastPlayingLoResourceId}
                  parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
                  parentHasSubLoOrderEnforced={
                    parentHasSubLoOrderEnforced || training.isSubLoOrderEnforced
                  }
                  showUnselectedLOs={showUnselectedLOs}
                  courseInstanceMapping={courseInstanceMapping}
                  showMandatoryLabel={
                    section.mandatory && section.mandatoryLOCount === section.loIds?.length
                  }
                  isTrainingLocked={isLocked}
                  updatePlayerLoState={updatePlayerLoState}
                  childLpId={training.id}
                  isRootLoCompleted={isRootLoCompleted}
                  setEnrollViaModuleClick={setEnrollViaModuleClick}
                  isPartOfFirstChildTraining={isPartOfFirstChildTraining}
                  courseInstanceMap={courseInstanceMap}
                />
              </div>
            );
          })}
        </section>
      );
    });
  };

  return (
    <li className={`${styles.container} ${isPartOfLP ? styles.isPartOfLP : ""}`}>
      <PrimeTrainingItemContainerHeader
        name={name}
        description={description}
        training={training}
        trainingInstance={trainingInstance}
        overview={overview}
        richTextOverview={richTextOverview}
        launchPlayerHandler={launchPlayerHandler}
        isPartOfLP={isPartOfLP}
        isParentFlexLP={trainingInstance.isFlexible} // If immediate parent is flex LP
        flexLPTraining={flexLPTraining} // If root training is flex lp or contains flex lp
        isRootLOEnrolled={isRootLOEnrolled}
        showMandatoryLabel={showMandatoryLabel}
        isPreviewEnabled={isPreviewEnabled}
        isParentLOEnrolled={isParentLOEnrolled}
        parentLoName={parentLoName}
        parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
        parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
        isPartOfFirstChildTraining={isPartOfFirstChildTraining}
        isTrainingLocked={isTrainingLocked}
      />
      <div className={styles.collapsibleContainer}>
        <Button
          variant="overBackground"
          isQuiet
          onPress={clickHandler}
          data-automationid={`${name}-collapse`}
        >
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      {!isCollapsed && <ul className={styles.lpList}>{getSubLOsOfLP()}</ul>}
    </li>
  );
};

export default PrimeLPItemContainer;
