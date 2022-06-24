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
import {
  PrimeLearningObject,
  PrimeLocalizationMetadata,
} from "../../../models";
import { getALMConfig } from "../../../utils/global";
import { filterTrainingInstance } from "../../../utils/hooks";
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
}> = (props) => {
  const {
    training,
    launchPlayerHandler,
    isPartOfLP = false,
    showMandatoryLabel = false,
    isPreviewEnabled = false,
    updateFileSubmissionUrl,
    isParentLOEnrolled,
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const { locale } = getALMConfig();

  const trainingInstance = filterTrainingInstance(training);
  const { name, description, overview, richTextOverview } =
    useMemo((): PrimeLocalizationMetadata => {
      return getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    }, [training.localizedMetadata, locale]);

  const clickHandler = () => {
    setIsCollapsed((prevState) => !prevState);
  };
  const subLos = training.subLOs;
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
            return (
              <div key={subLo.id} className={styles.lpListItemContainer}>
                <PrimeCourseItemContainer
                  training={subLo}
                  launchPlayerHandler={launchPlayerHandler}
                  isPartOfLP={isPartOfLP}
                  isPreviewEnabled={isPreviewEnabled}
                  updateFileSubmissionUrl={updateFileSubmissionUrl}
                  isParentLOEnrolled={isParentLOEnrolled}
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
