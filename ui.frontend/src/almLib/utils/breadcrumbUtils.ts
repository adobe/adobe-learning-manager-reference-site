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

import { splitStringIntoArray } from "./catalog";
import { CURRENT_BREADCRUMB_PATH, PREVIOUS_BREADCRUMB_PATH } from "./constants";
import { getALMObject } from "./global";

export const getBreadcrumbPath = (breadcrumbPathQuery = CURRENT_BREADCRUMB_PATH) => {
  const breadcrumbPathString = getALMObject().storage.getItem(breadcrumbPathQuery);

  return breadcrumbPathString ? breadcrumbPathString : { parentPath: [], currentTrainingId: "" };
};

const setBreadcrumbPath = (breadcrumbPathQuery: string, breadcrumbPathObj: any) => {
  getALMObject().storage.setItem(breadcrumbPathQuery, breadcrumbPathObj);
};

export const pushToBreadcrumbPath = (path: string, currentTrainingId: string) => {
  const breadcrumbPathObj = getBreadcrumbPath();
  breadcrumbPathObj.parentPath.push(path);
  breadcrumbPathObj.currentTrainingId = currentTrainingId;
  setBreadcrumbPath(CURRENT_BREADCRUMB_PATH, breadcrumbPathObj);
};

export const popFromBreadcrumbPath = (loId: string) => {
  // Handling back-button scenario
  const breadcrumbPathObj = getBreadcrumbPath();

  while (breadcrumbPathObj.parentPath.length > 0) {
    const item = breadcrumbPathObj.parentPath.pop();
    breadcrumbPathObj.currentTrainingId = splitStringIntoArray(item, "::")[0];
    if (item.startsWith(loId)) {
      setBreadcrumbPath(CURRENT_BREADCRUMB_PATH, breadcrumbPathObj);
      return;
    }
  }
};

export const clearBreadcrumbPathDetails = (newTrainingId: string) => {
  const breadcrumbPathObj = getBreadcrumbPath();
  const currentTrainingId = breadcrumbPathObj.currentTrainingId;

  if (currentTrainingId && currentTrainingId !== newTrainingId) {
    // Saving the current breadcrumb path details to previous breadcrumb path for back button scenario
    setBreadcrumbPath(PREVIOUS_BREADCRUMB_PATH, breadcrumbPathObj);

    // Clearing the breadcrumb path details if the current path is not the same as the training id
    // case - when copied url is used or navigating to related LOs
    breadcrumbPathObj.parentPath = [];
    breadcrumbPathObj.currentTrainingId = newTrainingId;
    setBreadcrumbPath(CURRENT_BREADCRUMB_PATH, breadcrumbPathObj);
  }
};

export const restorePreviousBreadcrumbPath = () => {
  const previousBreadcrumbPathObj = getBreadcrumbPath(PREVIOUS_BREADCRUMB_PATH);

  if (previousBreadcrumbPathObj) {
    setBreadcrumbPath(CURRENT_BREADCRUMB_PATH, previousBreadcrumbPathObj);
    getALMObject().storage.removeItem(PREVIOUS_BREADCRUMB_PATH);
  }
};
