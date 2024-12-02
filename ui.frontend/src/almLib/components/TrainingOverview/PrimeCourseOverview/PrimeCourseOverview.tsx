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
import { Item, TabList, TabPanels, Tabs } from "@react-spectrum/tabs";
import React from "react";
import { useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeNote,
  PrimeLocalizationMetadata,
} from "../../../models/PrimeModels";
import { CONTENT, ENGLISH_LOCALE, PREWORK, TESTOUT } from "../../../utils/constants";
import { calculateSecondsToTime } from "../../../utils/dateTime";
import { filterLoReourcesBasedOnResourceType, getDuration } from "../../../utils/hooks";
import { getPreferredLocalizedMetadata, GetTranslation } from "../../../utils/translationService";
import { PrimeModuleList } from "../PrimeModuleList";
import { PrimeNoteList } from "../PrimeNoteList";
import styles from "./PrimeCourseOverview.module.css";
import EmailOutline from "@spectrum-icons/workflow/EmailOutline";
import { DOWNLOAD_ICON_ROUNDED } from "../../../utils/inline_svg";
import { Content, InlineAlert } from "@adobe/react-spectrum";
import { useUserContext } from "../../../contextProviders/userContextProvider";

const PrimeCourseOverview: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  isParentLOEnrolled?: boolean;
  isRootLOEnrolled?: boolean;
  isRootLoPreviewEnabled: boolean;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  isParentFlexLP?: boolean;
  showDuration?: boolean;
  showNotes: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
  notes: PrimeNote[];
  lastPlayingLoResourceId: String;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
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
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  isTrainingLocked: boolean;
  updatePlayerLoState: Function;
  childLpId?: string;
  isRootLoCompleted: boolean;
  setEnrollViaModuleClick: Function;
  isPartOfFirstChildTraining?: boolean;
}> = (props: any) => {
  const {
    training,
    trainingInstance,
    showDuration = true,
    showNotes,
    launchPlayerHandler,
    isPartOfLP = false,
    isPartOfCertification = false,
    isParentLOEnrolled = false,
    isRootLOEnrolled = false,
    isRootLoPreviewEnabled = false,
    isPreviewEnabled = false,
    isParentFlexLP = false,
    parentHasEnforcedPrerequisites = false,
    parentHasSubLoOrderEnforced = false,
    updateFileSubmissionUrl,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    isTrainingLocked,
    updatePlayerLoState,
    childLpId = "",
    isRootLoCompleted,
    setEnrollViaModuleClick,
    isPartOfFirstChildTraining = false,
  } = props;

  const { locale } = useIntl();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
  interface INotesbyModuleName {
    moduleName: string;
    moduleId: string;
    notes: PrimeNote[];
  }
  interface INotesByNamesAndId {
    [key: string]: INotesbyModuleName;
  }

  let moduleResources = filterLoReourcesBasedOnResourceType(trainingInstance, CONTENT);
  const testOutResources = filterLoReourcesBasedOnResourceType(trainingInstance, TESTOUT);

  let preWorkResources = filterLoReourcesBasedOnResourceType(trainingInstance, PREWORK);

  const contentModuleDuration = getDuration(moduleResources, locale);
  const isPartOfParentLO = isPartOfLP || isPartOfCertification;
  const isTrainingDisabled = isTrainingLocked && !isParentFlexLP;

  if (isPartOfParentLO) {
    moduleResources = [...preWorkResources, ...moduleResources];
    preWorkResources = [] as PrimeLearningObjectResource[];
  }

  let [preWorkDuration, setPreWorkDuration] = useState(0);
  useEffect(() => {
    if (preWorkResources?.length) {
      setPreWorkDuration(getDuration(preWorkResources, locale));
    }
  }, [locale, preWorkResources]);

  const showNotesTab = showNotes && !isPartOfParentLO;
  const showTestout = testOutResources?.length !== 0;
  const showTabs = (isPartOfParentLO && (showTestout || showNotesTab)) || !isPartOfParentLO;
  const classNames = `${styles.tablist} ${
    isPartOfParentLO ? "" : styles.tablistInsideParentLO
  } ${showTabs ? "" : styles.hide}`;
  const getModuleId = useMemo(() => {
    const getIds = () => {
      let moduleIds: string[] = [];
      moduleResources?.forEach(element => {
        moduleIds.push(element.id);
      });
      return moduleIds;
    };
    return getIds();
  }, [moduleResources]);

  const notesWithoutBookmarks = useMemo(() => {
    return notes.filter((note: PrimeNote) => note.text !== "bookmark");
  }, [notes]);

  const notesByModuleName = useMemo(() => {
    const filterNotesByModuleName = (notesList: PrimeNote[]) => {
      const notesbyModuleId = notesList.reduce(function (
        accumulator: INotesByNamesAndId,
        note: PrimeNote
      ) {
        const metaData = getPreferredLocalizedMetadata(
          note?.loResource?.localizedMetadata,
          contentLocale
        );
        const moduleId = note?.loResource?.id;
        if (!accumulator[moduleId]) {
          accumulator[moduleId] = {
            notes: [],
            moduleName: metaData.name,
            moduleId: moduleId,
          };
        }
        accumulator[moduleId].notes.push(note);
        return accumulator;
      }, {});
      return Object.keys(notesbyModuleId).map((id: string) => notesbyModuleId[id]);
    };
    return filterNotesByModuleName(notesWithoutBookmarks);
  }, [notesWithoutBookmarks]);

  const sortNotesWithModuleCheck = (notes: INotesbyModuleName[]) => {
    // when module is deleted, notes will be shown at the end
    return notes.sort((note1, note2) => {
      if (!note1.moduleId) {
        return 1;
      }
      if (!note2.moduleId) {
        return -1;
      }
      return 0;
    });
  };

  const sortNotesByModuleResourceIds = useMemo(() => {
    const moduleIds = getModuleId;
    return notesByModuleName.sort(
      (a, b) => moduleIds.indexOf(a.moduleId) - moduleIds.indexOf(b.moduleId)
    );
  }, [notesByModuleName]);
  const memoizedNotesByModuleId = useMemo(() => {
    return notesByModuleName.map((item, index) => {
      if (item.notes) {
        const areMarkersSame = item.notes.every(note => note.marker === item.notes[0].marker);
        if (areMarkersSame) {
          item.notes.reverse();
        } else {
          item.notes.sort((a, b) => parseFloat(a.marker) - parseFloat(b.marker));
        }
      }
      return item;
    });
  }, [notesByModuleName]);
  const handleNotesDownload = () => {
    const trainingMetadata = getPreferredLocalizedMetadata(
      training.localizedMetadata,
      contentLocale
    ) as PrimeLocalizationMetadata;
    const trainingInstanceMetadata = getPreferredLocalizedMetadata(
      trainingInstance.localizedMetadata,
      contentLocale
    ) as PrimeLocalizationMetadata;
    downloadNotes(
      training.id,
      trainingInstance.id,
      trainingMetadata.name,
      trainingInstanceMetadata.name
    );
  };

  const handleNotesMailing = () => {
    sendNotesOnMail(training.id, trainingInstance.id);
  };

  const getTotalDuration = (duration: number) => {
    if (!duration) {
      return ``;
    }
    return <div className={styles.time}>{calculateSecondsToTime(duration)}</div>;
  };

  return (
    <Tabs
      aria-label={GetTranslation("alm.text.moduleList", true)}
      UNSAFE_className={`
        ${isPartOfParentLO && styles.isPartOfParentLO}
          ${isTrainingDisabled && styles.tabsDisabled}`}
    >
      <TabList id="tabList" UNSAFE_className={classNames}>
        <Item key="Modules">
          {isPartOfParentLO
            ? GetTranslation("alm.text.curriculum")
            : GetTranslation("alm.training.modules", true)}
        </Item>
        {showTestout && <Item key="Testout">{GetTranslation("alm.text.testout", true)}</Item>}
        {showNotesTab && <Item key="Notes">{GetTranslation("alm.text.notes")}</Item>}
      </TabList>
      <TabPanels UNSAFE_className={styles.tabPanels}>
        <Item key="Modules">
          {preWorkResources?.length > 0 && (
            <>
              <div className={styles.overviewcontainer} data-automationid="preWorkResources">
                <header role="heading" className={styles.header} aria-level={2}>
                  <div className={styles.loResourceType}>
                    {GetTranslation("alm.text.prework", true)}
                  </div>
                  {showDuration && getTotalDuration(preWorkDuration)}
                </header>
              </div>
              <hr className={styles.panelSeperator} />
              <PrimeModuleList
                launchPlayerHandler={launchPlayerHandler}
                loResources={preWorkResources}
                training={training}
                isPartOfLP={isPartOfLP}
                isPartOfCertification={isPartOfCertification}
                trainingInstance={trainingInstance}
                isPreviewEnabled={isPreviewEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isParentLOEnrolled}
                isRootLOEnrolled={isRootLOEnrolled}
                isRootLoPreviewEnabled={isRootLoPreviewEnabled}
                isParentFlexLP={isParentFlexLP}
                parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
                parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
                setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                isLocked={isTrainingLocked}
                updatePlayerLoState={updatePlayerLoState}
                childLpId={childLpId}
                isRootLoCompleted={isRootLoCompleted}
                setEnrollViaModuleClick={setEnrollViaModuleClick}
                isPartOfFirstChildTraining={isPartOfFirstChildTraining}
              ></PrimeModuleList>
            </>
          )}

          {moduleResources.length > 0 ? (
            <>
              {showDuration && (
                <>
                  <div className={styles.overviewcontainer} data-automationid="coreContent">
                    <header role="heading" className={styles.header} aria-level={2}>
                      <div className={styles.loResourceType}>
                        {GetTranslation("alm.text.coreContent", true)}
                      </div>
                      {getTotalDuration(contentModuleDuration)}
                    </header>
                  </div>
                  <hr className={styles.panelSeperator} />
                </>
              )}
              <PrimeModuleList
                launchPlayerHandler={launchPlayerHandler}
                loResources={moduleResources}
                training={training}
                isPartOfLP={isPartOfLP}
                isPartOfCertification={isPartOfCertification}
                trainingInstance={trainingInstance}
                isContent={true}
                isPreviewEnabled={isPreviewEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isParentLOEnrolled}
                isRootLOEnrolled={isRootLOEnrolled}
                isRootLoPreviewEnabled={isRootLoPreviewEnabled}
                isParentFlexLP={isParentFlexLP}
                parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
                parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
                lastPlayingLoResourceId={lastPlayingLoResourceId}
                setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
                timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
                isLocked={isTrainingLocked}
                updatePlayerLoState={updatePlayerLoState}
                childLpId={childLpId}
                isRootLoCompleted={isRootLoCompleted}
                setEnrollViaModuleClick={setEnrollViaModuleClick}
                isPartOfFirstChildTraining={isPartOfFirstChildTraining}
              ></PrimeModuleList>
            </>
          ) : (
            <InlineAlert variant="neutral" UNSAFE_className={styles.noModulesContainer}>
              <Content UNSAFE_className={styles.noModulesContainerHeader}>
                {GetTranslation("alm.overview.no.modules.header", true)}
              </Content>
              <Content>{GetTranslation("alm.overview.no.modules", true)}</Content>
            </InlineAlert>
          )}
        </Item>
        {showTestout && (
          <Item key="Testout">
            <PrimeModuleList
              launchPlayerHandler={launchPlayerHandler}
              loResources={testOutResources}
              training={training}
              trainingInstance={trainingInstance}
              isPreviewEnabled={isPreviewEnabled}
              updateFileSubmissionUrl={updateFileSubmissionUrl}
              isPartOfLP={isPartOfLP}
              isPartOfCertification={isPartOfCertification}
              isParentLOEnrolled={isParentLOEnrolled}
              isRootLOEnrolled={isRootLOEnrolled}
              isRootLoPreviewEnabled={isRootLoPreviewEnabled}
              isParentFlexLP={isParentFlexLP}
              lastPlayingLoResourceId={lastPlayingLoResourceId}
              parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
              parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
              setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
              timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
              isLocked={isTrainingLocked}
              updatePlayerLoState={updatePlayerLoState}
              childLpId={childLpId}
              isRootLoCompleted={isRootLoCompleted}
              setEnrollViaModuleClick={setEnrollViaModuleClick}
              isPartOfFirstChildTraining={isPartOfFirstChildTraining}
            ></PrimeModuleList>
          </Item>
        )}
        {showNotesTab && (
          <Item key="Notes">
            {Object.keys(notesWithoutBookmarks[0] || {}).length ? (
              <>
                <div className={styles.notesActions}>
                  <p onClick={handleNotesDownload}>
                    <span aria-hidden="true" className={styles.downloadIcon}>
                      {DOWNLOAD_ICON_ROUNDED()}
                    </span>
                    <span>{GetTranslation("alm.text.download", true)}</span>
                  </p>
                  <p onClick={handleNotesMailing}>
                    <span aria-hidden="true" className={styles.mailIcon}>
                      <EmailOutline />
                    </span>
                    <span>{GetTranslation("alm.text.email", true)}</span>
                  </p>
                </div>
                {sortNotesWithModuleCheck(notesByModuleName).map((item: INotesbyModuleName) => (
                  <React.Fragment key={`notes-${item.moduleName}`}>
                    <div
                      className={styles.moduleContainer}
                      data-automationid={`${item.moduleName}`}
                    >
                      <p className={styles.moduleName}>
                        {item.moduleName ? (
                          <>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: GetTranslation("alm.text.moduleName", true),
                              }}
                            />
                          </>
                        ) : (
                          GetTranslation("alm.text.notesWithoutModule", true)
                        )}
                        {item.moduleName}
                      </p>
                    </div>
                    <PrimeNoteList
                      training={training}
                      trainingInstance={trainingInstance}
                      notes={item.notes}
                      updateNote={updateNote}
                      deleteNote={deleteNote}
                      launchPlayerHandler={launchPlayerHandler}
                      isPartOfLP={isPartOfLP}
                      isPartOfCertification={isPartOfCertification}
                      updatePlayerLoState={updatePlayerLoState}
                      childLpId={childLpId}
                    />
                  </React.Fragment>
                ))}
              </>
            ) : (
              <div className={styles.notesNotPresent}>{GetTranslation("alm.text.noNotes")}</div>
            )}
          </Item>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default PrimeCourseOverview;
