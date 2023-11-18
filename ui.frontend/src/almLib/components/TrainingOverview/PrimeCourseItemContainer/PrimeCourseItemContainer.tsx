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
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useTrainingPage } from "../../../hooks";
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../../models";
import {
  filterLoReourcesBasedOnResourceType,
  filterTrainingInstance,
  getDuration,
} from "../../../utils/hooks";
import { checkIsEnrolled } from "../../../utils/overview";
import {
  GetTranslation,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
import { COMPLETED, CONTENT, RETIRED } from "../../../utils/constants";
import { useEffect } from "react";
import {
  PrimeLearningObjectResource,
  PrimeNote,
} from "../../../models/PrimeModels";
import { getEnrollment } from "../../../utils/hooks";
import { Picker, Item } from "@adobe/react-spectrum";

const PrimeCourseItemContainer: React.FC<{
  training: PrimeLearningObject;
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
}> = (props) => {
  const {
    training,
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
  } = props;
  const { locale } = useIntl();
  const [instanceList, setInstanceList] = useState([] as any[]);

  const enrolledInstanceId =
    training.enrollment && training.enrollment.loInstance
      ? training.enrollment.loInstance.id
      : null;

  const createInstanceList = () => {
    if (training.instances && training.instances.length) {
      Promise.all(
        training.instances.map(async (instance) => {
          if(instance.state !== RETIRED || (instance.state=== RETIRED && instance.enrollment)){
            let item: any = {};
            item.id = instance.id;
            item.name = getPreferredLocalizedMetadata(
              instance.localizedMetadata,
              locale
            )?.name;
            item.enrollment = getEnrollment(training, instance);
            return item;
          }
        })
      ).then((instanceList) => setInstanceList(instanceList.filter(Boolean)));
    }
  };

  useEffect(() => {
    createInstanceList();
  }, [
    enrolledInstanceId,
    training.instances.length,
    locale,
    training.loFormat,
  ]);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const [showModule, setShowModule] = useState("");

  const trainingInstance = filterTrainingInstance(training);

  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const noOfModules = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  ).length;

  const isEnrolled = checkIsEnrolled(training?.enrollment);

  function enrolledInstanceName() {
    let enrolledInstanceInfo = instanceList.find(
      (item: any) => item.id === enrolledInstanceId
    );
    if (!enrolledInstanceInfo) {
      return "";
    } else {
      return enrolledInstanceInfo.name;
    }
  }
  const state = training.enrollment?.state;

  let moduleReources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    CONTENT
  );
  const contentModuleDuration = getDuration(moduleReources, locale);

  const filteredInstanceList = instanceList.filter((item: any) => {
    if (!isEnrolled || !item.enrollment || enrolledInstanceId === item.id) {
      return item;
    }
  });

  function sendInstanceIdHandler(key: any) {
    setIsCollapsed(false);
    let selectedInstance = filteredInstanceList.find((item) => item.id === key);

    // If key is list index
    if (!selectedInstance && key) {
      selectedInstance = filteredInstanceList[parseInt(key)];
    }

    setShowModule(selectedInstance?.name);

    if (training.enrollment) {
      if (enrolledInstanceId === selectedInstance?.id) {
        sendInstanceId(
          selectedInstance?.id,
          training.id,
          name,
          false,
          selectedInstance?.name,
          contentModuleDuration
        );
      } else {
        sendInstanceId(
          selectedInstance?.id,
          training.id,
          name,
          true,
          selectedInstance?.name,
          contentModuleDuration
        );
      }
    } else {
      if (isParentLOEnrolled) {
        sendInstanceId(
          selectedInstance?.id,
          training.id,
          name,
          true,
          selectedInstance?.name,
          contentModuleDuration
        );
      } else {
        sendInstanceId(
          selectedInstance?.id,
          training.id,
          name,
          false,
          selectedInstance?.name,
          contentModuleDuration
        );
      }
    }
  }

  useEffect(() => {
    if (state === COMPLETED && isFlexible) {
      sendInstanceId(
        training.enrollment.loInstance.id,
        training.id,
        name,
        false,
        training.enrollment.loInstance.localizedMetadata[0].name,
        contentModuleDuration,
        true
      );
    }

    if(isParentLOEnrolled && training.enrollment && training.enrollment.loInstance){
      setIsCollapsed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedInstanceInfo &&
      !(selectedInstanceInfo![
        training?.id as keyof typeof selectedInstanceInfo
      ] as any)
    ) {
      setShowModule("");
      setIsCollapsed(true);
    }
  }, [training.enrollment]);

  const getSelectedKey = () => {
    return (
      (
        selectedInstanceInfo![
          training?.id as keyof typeof selectedInstanceInfo
        ] as any
      )?.instanceId || ""
    );
  };

  const getSelectedTrainingInstance = (selectedInstanceId: string) => {
    const instance = training.instances.find((instance) => {
      return instance.id === selectedInstanceId;
    });
    return instance || trainingInstance;
  };

  return (
    <>
      {(Object.keys(selectedCourses).indexOf(training.id) === -1 ||
        !isFlexible) && (
        <li className={styles.container}>
          <PrimeTrainingItemContainerHeader
            name={name}
            description={description}
            overview={overview}
            richTextOverview={richTextOverview}
            training={training}
            trainingInstance={trainingInstance}
            launchPlayerHandler={launchPlayerHandler}
            isPartOfLP={isPartOfLP}
            showMandatoryLabel={showMandatoryLabel}
            isPreviewEnabled={isPreviewEnabled}
            isParentLOEnrolled={isParentLOEnrolled}
            parentLoName={parentLoName}
            isFlexible={isFlexible}
          />
          {isFlexible && filteredInstanceList.length > 0 && (
            <>
              <div className={styles.line}></div>
              <div className={styles.line}></div>
              <div className={styles.dropdownGroup}>
                <div className={styles.instanceLabel}>Instance</div>
                <div>
                  {/* can check via flexLp */}
                  {state !== COMPLETED ? (
                    <>
                      {isEnrolled && isParentLOEnrolled ? (
                        training.enrollment.loInstance ? (
                          <Picker
                            UNSAFE_className={styles.picker}
                            direction="top"
                            placeholder={enrolledInstanceName()}
                            onSelectionChange={(key: any) => {
                              sendInstanceIdHandler(key);
                            }}
                          >
                            {filteredInstanceList!.map(
                              (item: any, index: any) => (
                                <Item key={index}>{item.name}</Item>
                              )
                            )}
                          </Picker>
                        ) : (
                          // Enrolled courses inside flex lp, for which instance not selected
                          <Picker
                            UNSAFE_className={styles.picker}
                            direction="top"
                            placeholder={
                              !showModule
                                ? GetTranslation(
                                    "alm.training.flexlp.instanceChooseMessage",
                                    true
                                  )
                                : showModule
                            }
                            onSelectionChange={(key: any) => {
                              sendInstanceIdHandler(key);
                            }}
                          >
                            {filteredInstanceList!.map(
                              (item: any, index: any) => (
                                <Item key={index}>{item.name}</Item>
                              )
                            )}
                          </Picker>
                        )
                      ) : (
                        <Picker
                          UNSAFE_className={styles.picker}
                          direction="top"
                          placeholder={
                            !showModule
                              ? GetTranslation(
                                  "alm.training.flexlp.instanceChooseMessage",
                                  true
                                )
                              : showModule
                          }
                          selectedKey={getSelectedKey()}
                          onSelectionChange={(key: any) =>
                            sendInstanceIdHandler(key)
                          }
                        >
                          {filteredInstanceList!.map((item: any) => (
                            <Item key={item.id}>{item.name}</Item>
                          ))}
                        </Picker>
                      )}
                    </>
                  ) : (
                    <>
                      <Picker
                        UNSAFE_className={styles.picker}
                        placeholder={enrolledInstanceName()}
                        isDisabled
                        onSelectionChange={(key: any) =>
                          sendInstanceIdHandler(key)
                        }
                      >
                        <Item>{enrolledInstanceName()}</Item>
                      </Picker>
                    </>
                  )}
                </div>
              </div>
              {isParentLOEnrolled &&
                isEnrolled &&
                getSelectedKey() !== "" &&
                enrolledInstanceId &&
                enrolledInstanceId !== getSelectedKey() && (
                  <div className={styles.flexLPUpdate}>
                    {GetTranslation(
                      "alm.training.flexlp.switch.instance",
                      true
                    )}
                  </div>
                )}
            </>
          )}
          {!isCollapsed ? (
            <PrimeCourseOverview
              training={training}
              trainingInstance={
                isFlexible
                  ? getSelectedTrainingInstance(getSelectedKey())
                  : trainingInstance
              }
              showDuration={false}
              showNotes={isEnrolled}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              isPreviewEnabled={isPreviewEnabled}
              updateFileSubmissionUrl={updateFileSubmissionUrl}
              isParentLOEnrolled={isParentLOEnrolled}
              isParentFlexLP={isFlexible}
              notes={notes}
              updateNote={updateNote}
              deleteNote={deleteNote}
              downloadNotes={downloadNotes}
              sendNotesOnMail={sendNotesOnMail}
              lastPlayingLoResourceId={lastPlayingLoResourceId}
              setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
              timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
            />
          ) : null}
          {(!isFlexible || showModule!=="" || getSelectedKey()!=="") && (
            <div className={styles.collapsibleContainer}>
              <Button variant="overBackground" isQuiet onPress={clickHandler}>
                {isCollapsed ? <ChevronDown /> : <ChevronUp />}
              </Button>
              {noOfModules > 0 && isCollapsed && (
                <span className={styles.count}>{noOfModules} Module</span>
              )}
            </div>
          )}
        </li>
      )}
    </>
  );
};

export default PrimeCourseItemContainer;
