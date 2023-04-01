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
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../../models";
import { getALMConfig } from "../../../utils/global";
import {
  filterLoReourcesBasedOnResourceType,
  filterTrainingInstance,
} from "../../../utils/hooks";
import { getPreferredLocalizedMetadata } from "../../../utils/translationService";
import { PrimeCourseOverview } from "../PrimeCourseOverview";
import { PrimeTrainingItemContainerHeader } from "../PrimeTrainingItemContainerHeader";
import styles from "./PrimeCourseItemContainer.module.css";
const PrimeCourseItemContainer: React.FC<{
  training: PrimeLearningObject;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  isParentLOEnrolled?: boolean;
  showMandatoryLabel?: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
  parentLoName: string;
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
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };
  const { locale } = useIntl();

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const noOfModules = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  ).length;

  return (
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
      />
      {!isCollapsed && (
        <PrimeCourseOverview
          training={training}
          trainingInstance={trainingInstance}
          showDuration={false}
          showNotes={false}
          launchPlayerHandler={launchPlayerHandler}
          isPartOfLP={isPartOfLP}
          isPreviewEnabled={isPreviewEnabled}
          updateFileSubmissionUrl={updateFileSubmissionUrl}
          isParentLOEnrolled={isParentLOEnrolled}
        />
      )}

      <div className={styles.collapsibleContainer}>
        <Button variant="overBackground" isQuiet onPress={clickHandler}>
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
        {noOfModules > 0 && isCollapsed && (
          <span className={styles.count}>{noOfModules} Module</span>
        )}
      </div>
    </li>
  );
};

export default PrimeCourseItemContainer;
