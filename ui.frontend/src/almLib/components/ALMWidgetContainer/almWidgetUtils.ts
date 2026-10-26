/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { WidgetType } from '../../utils/widgets/common';

/**
 * This config contains the widget references and the attributes that are multi-selectable.
 */
const multiSelectConfig = {
  [WidgetType.COURSES_AND_PATHS.toString()]: [
    'loIds',
    'sourceIds',
    'loTypes',
    'sourceDetails',
    'learnerState',
    'preferredSortPartitionOrder',
    'tagName',
  ],
  [WidgetType.CATEGORY.toString()]: ['sourceIds'],
};

/**
 * Handles comma-separated values for multi-selectable attributes.
 *
 * @param widgetRef - The widget reference/type
 * @param attributes - The widget attributes object
 * @returns A new object with comma-separated string values converted to arrays
 *
 * @example
 * // Input: { loIds: "course:123, course:456 , course:789" }
 * // Output: { loIds: ["course:123", "course:456", "course:789"] }
 */
export const handleCommaSeparatedValues = (widgetRef: string, attributes: any) => {
  // Get the multi-selectable attributes for this widget type
  const multiSelectAttributes = multiSelectConfig[widgetRef];

  // If no multi-select config exists for this widget, return attributes as-is
  if (!multiSelectAttributes || !Array.isArray(multiSelectAttributes)) {
    return attributes;
  }

  // Create a new object to avoid mutating the original
  const updatedAttributes = { ...attributes };

  // Process each multi-selectable attribute
  multiSelectAttributes.forEach((attributeName: string) => {
    // Check if the attribute exists in the input and has a value
    if (
      attributeName in updatedAttributes &&
      updatedAttributes[attributeName] !== null &&
      updatedAttributes[attributeName] !== undefined
    ) {
      const value = updatedAttributes[attributeName];

      // If the value is a string, split by comma and trim spaces
      if (typeof value === 'string') {
        updatedAttributes[attributeName] = value
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0); // Remove empty strings
      }
      // If it's already an array, keep it as-is
      // If it's any other type, keep it as-is
    }
  });

  return updatedAttributes;
};
