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
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../../../models/PrimeModels";
import { convertSecondsToTimeText } from "../../../utils/dateTime";
import { getALMConfig } from "../../../utils/global";
import {
  filteredResource,
  filterLoReourcesBasedOnResourceType,
} from "../../../utils/hooks";
import { PrimeModuleList } from "../PrimeModuleList";
import styles from "./PrimeCourseOverview.module.css";

const PrimeCourseOverview: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  isPartOfLP?: boolean;
  showDuration?: boolean;
  showNotes?: boolean;
  isPreviewEnabled: boolean;
}> = (props: any) => {
  const {
    training,
    trainingInstance,
    showDuration = true,
    showNotes = false,
    launchPlayerHandler,
    isPartOfLP = false,
    isPreviewEnabled = false,
  } = props;

  const config = getALMConfig();
  const locale = config.locale;

  const moduleReources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Content"
  );
  const testOutResources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Test Out"
  );

  const preWorkResources = filterLoReourcesBasedOnResourceType(
    trainingInstance,
    "Pre Work"
  );

  let [preWorkDuration, setPreWorkDuration] = useState(0);
  useEffect(() => {
    if (preWorkResources.length) {
      let duration = 0;
      preWorkResources.forEach((preWorkResource) => {
        const resource = filteredResource(preWorkResource, locale);
        const resDuration = resource.desiredDuration;
        duration += isNaN(resDuration) ? 0 : resDuration;
      });
      setPreWorkDuration(duration);
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
        <Item key="Modules">Modules</Item>
        {showTestout && <Item key="Testout">Testout</Item>}
        {showNotes && <Item key="Notes">Notes</Item>}
      </TabList>
      <TabPanels UNSAFE_className={styles.tabPanels}>
        <Item key="Modules">
          {showDuration && preWorkResources.length > 0 && (
            <>
              <div className={styles.overviewcontainer}>
                <header role="heading" className={styles.header} aria-level={2}>
                  <div className={styles.loResourceType}>Prework</div>
                  <div className={styles.time}>
                    {convertSecondsToTimeText(preWorkDuration)}
                  </div>
                </header>
              </div>
              <PrimeModuleList
                launchPlayerHandler={launchPlayerHandler}
                loResources={preWorkResources}
                training={training}
                isPartOfLP={isPartOfLP}
                trainingInstance={trainingInstance}
                isPreviewEnabled={isPreviewEnabled}
              ></PrimeModuleList>
            </>
          )}

          {showDuration && (
            <div className={styles.overviewcontainer}>
              <header role="heading" className={styles.header} aria-level={2}>
                <div className={styles.loResourceType}>Core Content</div>
                <div className={styles.time}>
                  {convertSecondsToTimeText(training.duration)}
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
            ></PrimeModuleList>
          </Item>
        )}
        {showNotes && <Item key="Notes">You have no notes.</Item>}
      </TabPanels>
    </Tabs>
  );
};

export default PrimeCourseOverview;
