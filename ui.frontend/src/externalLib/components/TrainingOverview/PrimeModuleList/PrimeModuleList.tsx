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
import React from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from "../../../models/PrimeModels";
import { PrimeModuleItem } from "../PrimeModuleItem";
import styles from "./PrimeModuleList.module.css";

const PrimeModuleList: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  launchPlayerHandler: Function;
  loResources: PrimeLearningObjectResource[];
  isPartOfLP?: boolean;
  isContent?: boolean;
  isPreviewEnabled: boolean;
}> = (props) => {
  const {
    loResources,
    launchPlayerHandler,
    training,
    trainingInstance,
    isPartOfLP,
    isContent,
    isPreviewEnabled,
  } = props;

  return (
    <ul
      className={`${styles.moduleListContainer} ${
        isPartOfLP ? styles.isPartOfLP : ""
      }`}
    >
      {loResources.map((loResource, index) => (
        <PrimeModuleItem
          loResource={loResource}
          key={loResource.id}
          launchPlayerHandler={launchPlayerHandler}
          training={training}
          trainingInstance={trainingInstance}
          isContent={isContent}
          isPreviewEnabled={isPreviewEnabled}
        ></PrimeModuleItem>
      ))}
    </ul>
  );
};

export default PrimeModuleList;
