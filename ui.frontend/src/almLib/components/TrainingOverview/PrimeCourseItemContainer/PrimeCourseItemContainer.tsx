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
import React, { useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { PrimeLearningObject, PrimeLocalizationMetadata } from "../../../models";
import {
  filterLoReourcesBasedOnResourceType,
  filterTrainingInstance,
  getCourseInstanceMapping,
  getDuration,
  checkIfEntityIsValid,
} from "../../../utils/hooks";
import { arePrerequisitesEnforcedAndCompleted, checkIsEnrolled } from "../../../utils/overview";
import {
  GetTranslation,
  GetTranslationReplaced,
  getPreferredLocalizedMetadata,
} from "../../../utils/translationService";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
import { COMPLETED, CONTENT, ENGLISH_LOCALE, RETIRED } from "../../../utils/constants";
import { useEffect } from "react";
import {
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeNote,
} from "../../../models/PrimeModels";
import { getEnrollment } from "../../../utils/hooks";
import { Picker, Item } from "@adobe/react-spectrum";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import { modifyTime } from "../../../utils/dateTime";
import {
  checkIfEnrollmentDeadlineNotPassed,
  checkIfUnenrollmentDeadlinePassed,
} from "../../../utils/instance";
import { ERROR_ICON_SVG } from "../../../utils/inline_svg";
import { getInstanceSummary, isTrainingCompleted } from "../../../utils/lo-utils";
import { useUserContext } from "../../../contextProviders/userContextProvider";

const PrimeCourseItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  isPartOfCertification?: boolean;
  isParentLOEnrolled?: boolean;
  isRootLOEnrolled?: boolean;
  isRootLoPreviewEnabled: boolean;
  showMandatoryLabel?: boolean;
  isPreviewEnabled: boolean;
  isFlexLPValidationEnabled: boolean;
  updateFileSubmissionUrl: Function;
  parentLoName: string;
  setTimeBetweenAttemptEnabled: Function;
  timeBetweenAttemptEnabled: boolean;
  setSelectedInstanceInfo: Function;
  isParentFlexLP: boolean;
  flexLPTraining: boolean;
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
  parentHasEnforcedPrerequisites: boolean;
  parentHasSubLoOrderEnforced: boolean;
  courseInstanceMapping: any;
  showUnselectedLOs: boolean;
  isTrainingLocked: boolean;
  updatePlayerLoState: Function;
  childLpId?: string;
  isRootLoCompleted: boolean;
  setEnrollViaModuleClick: Function;
  isPartOfFirstChildTraining: boolean;
}> = props => {
  const {
    training,
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
    parentLoName,
    setTimeBetweenAttemptEnabled,
    timeBetweenAttemptEnabled,
    setSelectedInstanceInfo,
    isParentFlexLP,
    flexLPTraining,
    notes,
    updateNote,
    deleteNote,
    downloadNotes,
    sendNotesOnMail,
    lastPlayingLoResourceId,
    parentHasEnforcedPrerequisites,
    parentHasSubLoOrderEnforced,
    courseInstanceMapping,
    showUnselectedLOs,
    isTrainingLocked,
    updatePlayerLoState,
    childLpId = "",
    isRootLoCompleted,
    setEnrollViaModuleClick,
    isPartOfFirstChildTraining,
  } = props;
  const { locale, formatMessage } = useIntl();
  const user = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
  const trainingId = training.id;
  const trainingInstance = filterTrainingInstance(training);
  const primaryEnrollment = training.enrollment;
  const enrolledTrainingInstance =
    checkIfEntityIsValid(primaryEnrollment) && primaryEnrollment.loInstance;
  const isEnrolled = checkIsEnrolled(primaryEnrollment);
  const state = primaryEnrollment?.state;

  //For ongoing session, once you complete the training, enrollment state takes some time to update to COMPLETED. For that case, we will be checking progress percent.
  const isCompleted = state === COMPLETED || primaryEnrollment?.progressPercent === 100;

  const [instanceList, setInstanceList] = useState([] as any[]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const instanceMetadata = useRef({
    instanceSwitchErrorMessage: "",
    availableSeats: 0,
    enrollmentDeadline: "",
  });

  const [selectedInstance, setSelectedInstance] = useState({
    name: "",
    id: "",
  });

  const areAllInstancesRetired = training.instances.every(instance => instance.state === RETIRED);
  const enrolledInstanceId = enrolledTrainingInstance ? enrolledTrainingInstance.id : null;

  useEffect(() => {
    const selectedInstanceDetails = getCourseInstanceMapping(courseInstanceMapping, trainingId);

    let instanceName = "";
    let instanceId = "";
    let isCollapsed = true;

    if (selectedInstanceDetails) {
      instanceName = selectedInstanceDetails.instanceName;
      instanceId = selectedInstanceDetails.instanceId;
      isCollapsed = false;
    }

    setSelectedInstance(prevState => ({
      ...prevState,
      name: instanceName,
      id: instanceId,
    }));

    setIsCollapsed(isCollapsed);
  }, [courseInstanceMapping, training]);

  useEffect(() => {
    const createInstanceList = async () => {
      if (!training.instances || !training.instances.length) {
        return;
      }

      const instanceList = training.instances.map(instance => {
        const isInstanceRetired = instance.state === RETIRED;
        if (!isInstanceRetired || (isInstanceRetired && instance.enrollment)) {
          const item: any = {};
          item.id = instance.id;
          item.name = getPreferredLocalizedMetadata(
            instance.localizedMetadata,
            contentLocale
          )?.name;
          item.enrollment = getEnrollment(training, instance);
          return item;
        }
      });

      setInstanceList(instanceList.filter(Boolean));
    };
    createInstanceList();
  }, [enrolledInstanceId, training.instances.length, locale, training.loFormat]);

  useEffect(() => {
    if (enrolledTrainingInstance && isParentFlexLP && !areAllInstancesRetired) {
      // Initalization
      // If the user is enrolled and the parent LO is a Flex LP
      // Mapping the selected instance to the course

      if (isCompleted || isParentLOEnrolled) {
        setSelectedInstanceInfo(
          enrolledTrainingInstance.id,
          trainingId,
          training.localizedMetadata[0].name,
          false,
          enrolledTrainingInstance.localizedMetadata[0].name,
          contentModuleDuration
        );
      }
    }
  }, []);

  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, contentLocale);
    }, [training.localizedMetadata, contentLocale]);

  function enrolledInstanceName() {
    const enrolledInstanceInfo = instanceList.find((item: any) => item.id === enrolledInstanceId);
    if (!enrolledInstanceInfo) {
      return "";
    } else {
      return enrolledInstanceInfo.name;
    }
  }

  const moduleResources = filterLoReourcesBasedOnResourceType(trainingInstance, CONTENT);

  const numModules = moduleResources.length;
  const contentModuleDuration = getDuration(moduleResources, locale);

  const isNewInstanceSelected = (selectedInstanceId: string) => {
    if (primaryEnrollment) {
      // Case-1 If instance selected is not enrolled instance
      // Case-2 If parent LP is not enrolled
      return selectedInstanceId !== enrolledInstanceId || (isPartOfLP && !isParentLOEnrolled);
    }

    // Case-3 if no enrollment present for the training
    return true;
  };

  const filteredInstanceList = instanceList.filter((item: any) => {
    if (!isEnrolled || !item.enrollment || enrolledInstanceId === item.id) {
      return item;
    }
  });

  function getSelectedInstance(key: any) {
    let selectedInstance = filteredInstanceList.find(item => item.id === key);

    // If key is list index
    if (!selectedInstance && key) {
      selectedInstance = filteredInstanceList[parseInt(key)];
    }

    return selectedInstance;
  }

  function resetInstanceMetadataForFlexLP() {
    instanceMetadata.current = {
      instanceSwitchErrorMessage: "",
      availableSeats: 0,
      enrollmentDeadline: "",
    };
  }

  async function handleFlexLPValidations(instance: PrimeLearningObjectInstance) {
    let isInstanceSwitchAllowed = true;
    let errorMessage = "";
    // checking if unenrollment deadline of current enrolled instance is passed
    if (
      enrolledTrainingInstance &&
      enrolledTrainingInstance.unenrollmentDeadline &&
      checkIfUnenrollmentDeadlinePassed(enrolledTrainingInstance)
    ) {
      isInstanceSwitchAllowed = false;
      errorMessage = GetTranslationReplaced(
        "alm.error.flexlp.unDeadline_final",
        enrolledInstanceName(),
        true
      );
    } else {
      instanceMetadata.current.enrollmentDeadline = instance.enrollmentDeadline;

      // Checking if enrollment deadline of new selected instance is passed
      if (!checkIfEnrollmentDeadlineNotPassed(instance)) {
        isInstanceSwitchAllowed = false;
        errorMessage = GetTranslation("alm.error.flexlp.enDeadline", true);
      } else {
        // Checking if seats are available
        const instanceSummary = await getInstanceSummary(instance);
        const enrollmentCount = instanceSummary?.enrollmentCount;
        const seatLimit = instanceSummary?.seatLimit;
        const seatsAvailable = seatLimit !== undefined ? seatLimit - (enrollmentCount || 0) : -1;

        const isSeatAvailable = instance.seatLimit
          ? instance.seatLimit > 0 && seatsAvailable > 0
          : true;

        instanceMetadata.current.availableSeats = seatsAvailable;
        if (!isSeatAvailable) {
          isInstanceSwitchAllowed = false;
          errorMessage = GetTranslation("alm.error.flexlp.seatLimit", true);
        }
      }
    }

    instanceMetadata.current.instanceSwitchErrorMessage = errorMessage;
    return isInstanceSwitchAllowed;
  }

  async function updateInstanceIdHandler(key: any) {
    const selectedInstance = getSelectedInstance(key);
    const instanceId = selectedInstance.id;
    const instance = training.instances.find(ins => ins.id === instanceId);
    const isNewInstance = isNewInstanceSelected(instanceId);
    let isInstanceSwitchAllowed = true;
    resetInstanceMetadataForFlexLP();

    if (isFlexLPValidationEnabled && isNewInstance && instance) {
      isInstanceSwitchAllowed = await handleFlexLPValidations(instance);
    }

    let updateEnrollButtonState = false;
    let moduleDuration = contentModuleDuration;

    if (isNewInstance) {
      updateEnrollButtonState = true;
      const moduleResources = filterLoReourcesBasedOnResourceType(instance!, CONTENT);
      moduleDuration = getDuration(moduleResources, locale);
    }

    setSelectedInstanceInfo(
      instanceId,
      trainingId,
      name,
      updateEnrollButtonState,
      selectedInstance.name,
      moduleDuration,
      isInstanceSwitchAllowed
    );
  }

  const getSelectedTrainingInstance = (instanceId: string) => {
    const instance = training.instances.find(instance => {
      return instance.id === instanceId;
    });
    return instance || trainingInstance;
  };

  const dropdownClassName = `${styles.picker} ${
    instanceMetadata.current.instanceSwitchErrorMessage ? styles.dropdownError : ``
  }`;

  const getInstanceSelectDropdown = () => {
    let instanceName = selectedInstance.name;

    if (isEnrolled && isParentLOEnrolled && enrolledTrainingInstance) {
      instanceName = enrolledInstanceName();
    }

    return (
      <Picker
        UNSAFE_className={dropdownClassName}
        placeholder={
          instanceName || GetTranslation("alm.training.flexlp.instanceChooseMessage", true)
        }
        onSelectionChange={(key: any) => updateInstanceIdHandler(key)}
        isDisabled={isCompleted}
      >
        {filteredInstanceList!.map((item: any) => (
          <Item key={item.id}>{item.name}</Item>
        ))}
      </Picker>
    );
  };

  const checkEnrollment = isParentLOEnrolled && isEnrolled && enrolledInstanceId;

  const isDifferentFromEnrolledInstance = () => {
    return selectedInstance.id && enrolledInstanceId !== selectedInstance.id;
  };

  const getInstanceInfo = () => {
    if (instanceMetadata.current.instanceSwitchErrorMessage) {
      return (
        <div className={styles.flexLPSeatLimitError} data-automationid={`${name}-seat-limit-label`}>
          {ERROR_ICON_SVG()}
          <span
            dangerouslySetInnerHTML={{
              __html: instanceMetadata.current.instanceSwitchErrorMessage,
            }}
          />
        </div>
      );
    }

    // check if selected instance is different from enrolled instance
    const isDiffInstance = isDifferentFromEnrolledInstance();

    if (
      enrolledTrainingInstance &&
      !isDiffInstance &&
      enrolledTrainingInstance.unenrollmentDeadline
    ) {
      const unenrollmentDeadline = modifyTime(
        enrolledTrainingInstance.unenrollmentDeadline,
        locale
      );
      return (
        <div className={styles.unenrollmentDeadline}>
          {formatMessage(
            {
              id: `alm.overview.unenrollment.date`,
            },
            { x: unenrollmentDeadline }
          )}
          {checkIfUnenrollmentDeadlinePassed(enrolledTrainingInstance) ? (
            <>
              {" | "}
              {GetTranslation("alm.overview.unenrollment.deadline.passed", true)}
            </>
          ) : (
            ""
          )}
        </div>
      );
    }

    if (!isDiffInstance) {
      return;
    }
    return (
      <>
        {checkEnrollment && (
          <div
            className={styles.instanceSwitch}
            data-automationid={`${name}-switch-instance-label`}
            dangerouslySetInnerHTML={{
              __html: GetTranslation("alm.training.flexlp.switch.instance", true),
            }}
          />
        )}
        <div className={styles.instanceMetaData}>
          {instanceMetadata.current.availableSeats > 0 && (
            <div data-automationid={`${name}-seats-available`}>
              {formatMessage(
                { id: "alm.overview.seatsAvailable" },
                { x: instanceMetadata.current.availableSeats }
              )}
            </div>
          )}
          {instanceMetadata.current.enrollmentDeadline && (
            <div data-automationid={`${name}-enrollment-deadline`}>
              {formatMessage(
                { id: "alm.overview.enrollment.date" },
                {
                  x: modifyTime(instanceMetadata.current.enrollmentDeadline, locale),
                }
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  // checking if either parent has enforced prerequisites or the current training has enforced prerequisites
  const hasEnforcedPrerequisites =
    parentHasEnforcedPrerequisites ||
    (training.enrollment?.progressPercent === 0 && !arePrerequisitesEnforcedAndCompleted(training));
  const isPartOfParentLO = isPartOfLP || isPartOfCertification;

  const isLocked = () => {
    // Checking parent LO enrollment state
    const parentEnrollmentStatus = !isPartOfParentLO || isParentLOEnrolled;

    // Training should not be locked if its completed
    const isTrainingIncomplete =
      !trainingInstance.enrollment ||
      (trainingInstance.enrollment && !isTrainingCompleted(trainingInstance.enrollment));

    return (
      (isTrainingLocked && isTrainingIncomplete) ||
      (hasEnforcedPrerequisites && parentEnrollmentStatus)
    );
  };

  // Course is locked but not disabled if its part of a Flex LP
  // Navigation are prohibited for locked trainings
  const isTrainingDisabled = isLocked() && !isParentFlexLP;

  const getInstancesDropdownContainer = () => {
    return (
      <div
        className={`${styles.instanceSelectContainer} ${isTrainingDisabled ? styles.trainingDisabled : ``}`}
      >
        <div className={styles.instanceSelectDropdown}>
          <span className={styles.instanceLabel} data-automationid={`${name}-instance-label`}>
            {GetTranslation("alm.overview.flexlp.dialog.instance", true)}
          </span>
          {getInstanceSelectDropdown()}
          {checkEnrollment && !isDifferentFromEnrolledInstance() && (
            <div className={styles.isEnrolled} data-automationid={`${name}-enrolled-label`}>
              <CheckmarkCircle aria-hidden="true" />
              {GetTranslation("alm.catalog.filter.enrolled")}
            </div>
          )}
        </div>
        {getInstanceInfo()}
      </div>
    );
  };

  const getSelectedCourses = () => {
    if (showUnselectedLOs) {
      return courseInstanceMapping;
    }
    return {};
  };

  return (
    <>
      {(Object.keys(getSelectedCourses()).indexOf(trainingId) === -1 || !isParentFlexLP) && (
        <li className={styles.container}>
          <PrimeTrainingItemContainerHeader
            name={name}
            description={description}
            overview={overview}
            richTextOverview={richTextOverview}
            training={training}
            trainingInstance={trainingInstance}
            launchPlayerHandler={launchPlayerHandler}
            isParentFlexLP={isParentFlexLP}
            flexLPTraining={flexLPTraining}
            isPartOfLP={isPartOfLP}
            isPartOfCertification={isPartOfCertification}
            isRootLOEnrolled={isRootLOEnrolled}
            showMandatoryLabel={showMandatoryLabel}
            isPreviewEnabled={isPreviewEnabled}
            isParentLOEnrolled={isParentLOEnrolled}
            parentLoName={parentLoName}
            parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
            parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
            isTrainingLocked={isLocked()}
          />
          {isParentFlexLP && (
            <>
              {filteredInstanceList.length > 0 && getInstancesDropdownContainer()}
              {!selectedInstance.id && (
                // show line separator only when no instance is selected
                <hr className={styles.contentSeparator} />
              )}
            </>
          )}
          {(!isParentFlexLP || selectedInstance.name || selectedInstance.id) && (
            <div className={styles.collapsibleContainer}>
              <Button
                variant="overBackground"
                onPress={() => setIsCollapsed(prevState => !prevState)}
                data-automationid={`${name}-collapse`}
              >
                {isCollapsed ? <ChevronDown /> : <ChevronUp />}
              </Button>
              {isCollapsed && (
                <span className={styles.count} data-automationid={`${name}-modules-count`}>
                  {numModules}{" "}
                  {GetTranslation(
                    numModules === 1 ? "alm.training.module" : "alm.training.modules",
                    true
                  )}
                </span>
              )}
            </div>
          )}
          {!isCollapsed ? (
            <PrimeCourseOverview
              training={training}
              trainingInstance={
                isParentFlexLP ? getSelectedTrainingInstance(selectedInstance.id) : trainingInstance
              }
              showDuration={false}
              showNotes={isEnrolled}
              launchPlayerHandler={launchPlayerHandler}
              isPartOfLP={isPartOfLP}
              isPartOfCertification={isPartOfCertification}
              isPreviewEnabled={isPreviewEnabled}
              updateFileSubmissionUrl={updateFileSubmissionUrl}
              isParentLOEnrolled={isParentLOEnrolled}
              isRootLOEnrolled={isRootLOEnrolled}
              isRootLoPreviewEnabled={isRootLoPreviewEnabled}
              isParentFlexLP={isParentFlexLP}
              notes={notes}
              updateNote={updateNote}
              deleteNote={deleteNote}
              downloadNotes={downloadNotes}
              sendNotesOnMail={sendNotesOnMail}
              lastPlayingLoResourceId={lastPlayingLoResourceId}
              setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
              timeBetweenAttemptEnabled={timeBetweenAttemptEnabled}
              parentHasEnforcedPrerequisites={parentHasEnforcedPrerequisites}
              parentHasSubLoOrderEnforced={parentHasSubLoOrderEnforced}
              isTrainingLocked={isLocked()}
              updatePlayerLoState={updatePlayerLoState}
              childLpId={childLpId}
              isRootLoCompleted={isRootLoCompleted}
              setEnrollViaModuleClick={setEnrollViaModuleClick}
              isPartOfFirstChildTraining={isPartOfFirstChildTraining}
            />
          ) : null}
        </li>
      )}
    </>
  );
};

export default PrimeCourseItemContainer;
