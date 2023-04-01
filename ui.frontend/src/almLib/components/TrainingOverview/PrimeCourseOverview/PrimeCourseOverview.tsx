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
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from "../../../models/PrimeModels";
import { CONTENT, PREWORK, TESTOUT } from "../../../utils/constants";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { getALMConfig } from "../../../utils/global";
import {
  filteredResource,
  filterLoReourcesBasedOnResourceType,
} from "../../../utils/hooks";
import { GetTranslation } from "../../../utils/translationService";
import { PrimeModuleList } from "../PrimeModuleList";
import styles from "./PrimeCourseOverview.module.css";

const PrimeCourseOverview: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  isParentLOEnrolled?: boolean;
  isPartOfLP?: boolean;
  showDuration?: boolean;
  showNotes?: boolean;
  isPreviewEnabled: boolean;
  updateFileSubmissionUrl: Function;
}> = (props: any) => {
  const {
    training,
    trainingInstance,
    showDuration = true,
    showNotes = false,
    launchPlayerHandler,
    isPartOfLP = false,
    isParentLOEnrolled = false,
    isPreviewEnabled = false,
    updateFileSubmissionUrl,
  } = props;

  const { locale } = useIntl();
  const getDuration = (
    learningObjectResources: PrimeLearningObjectResource[]
  ) => {
    let duration = 0;
    learningObjectResources.forEach((learningObjectResource) => {
      const resource = filteredResource(learningObjectResource, locale);
      const resDuration =
        resource.authorDesiredDuration || resource.desiredDuration || 0;
      duration += resDuration;
    });
    return duration;
  };

  let moduleReources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    CONTENT
  );
  const testOutResources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    TESTOUT
  );

  let preWorkResources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    PREWORK
  );

  const contentModuleDuration = getDuration(moduleReources);

  if (isPartOfLP) {
    moduleReources = [...preWorkResources, ...moduleReources];
    preWorkResources = [] as PrimeLearningObjectResource[];
  }

  let [preWorkDuration, setPreWorkDuration] = useState(0);
  useEffect(() => {
    if (preWorkResources.length) {
      setPreWorkDuration(getDuration(preWorkResources));
    }
  }, [locale, preWorkResources]);

  const showTestout = testOutResources.length !== 0;
  const showTabs = showTestout || showNotes;
  const classNames = `${styles.tablist} ${showTabs ? "" : styles.hide}`;

  return (
    <Tabs
      aria-label="Module list"
      UNSAFE_className={isPartOfLP ? styles.isPartOfLP : ""}
    >
      <TabList id="tabList" UNSAFE_className={classNames}>
        <Item key="Modules">
          {GetTranslation("alm.training.modules", true)}
        </Item>
        {showTestout && (
          <Item key="Testout">{GetTranslation("alm.text.testout", true)}</Item>
        )}
        {showNotes && (
          <Item key="Notes">{GetTranslation("alm.text.notes")}</Item>
        )}
      </TabList>
      <TabPanels UNSAFE_className={styles.tabPanels}>
        <Item key="Modules">
          {preWorkResources.length > 0 && (
            <>
              <div className={styles.overviewcontainer}>
                <header role="heading" className={styles.header} aria-level={2}>
                  <div className={styles.loResourceType}>
                    {GetTranslation("alm.text.prework", true)}
                  </div>
                  {showDuration && (
                    <div className={styles.time}>
                      {convertSecondsToTimeText(preWorkDuration)}
                    </div>
                  )}
                </header>
              </div>
              <PrimeModuleList
                launchPlayerHandler={launchPlayerHandler}
                loResources={preWorkResources}
                training={training}
                isPartOfLP={isPartOfLP}
                trainingInstance={trainingInstance}
                isPreviewEnabled={isPreviewEnabled}
                updateFileSubmissionUrl={updateFileSubmissionUrl}
                isParentLOEnrolled={isParentLOEnrolled}
              ></PrimeModuleList>
            </>
          )}

          {showDuration && (
            <div className={styles.overviewcontainer}>
              <header role="heading" className={styles.header} aria-level={2}>
                <div className={styles.loResourceType}>
                  {GetTranslation("alm.text.coreContent", true)}
                </div>
                <div className={styles.time}>
                  {convertSecondsToTimeText(contentModuleDuration)}
                </div>
              </header>
            </div>
          )}
          <PrimeModuleList
            launchPlayerHandler={launchPlayerHandler}
            loResources={moduleReources}
            training={training}
            isPartOfLP={isPartOfLP}
            trainingInstance={trainingInstance}
            isContent={true}
            isPreviewEnabled={isPreviewEnabled}
            updateFileSubmissionUrl={updateFileSubmissionUrl}
            isParentLOEnrolled={isParentLOEnrolled}
          ></PrimeModuleList>
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
              isParentLOEnrolled={isParentLOEnrolled}
            ></PrimeModuleList>
          </Item>
        )}
        {showNotes && (
          <Item key="Notes">{GetTranslation("alm.text.noNotes")}</Item>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default PrimeCourseOverview;
