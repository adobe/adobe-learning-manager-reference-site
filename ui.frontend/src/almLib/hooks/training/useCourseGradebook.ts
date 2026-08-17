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
import { useMemo } from 'react';
import { PrimeAccount, PrimeLearningObject, PrimeLearningObjectResource } from '../../models';
import {
  getGradebookVisibleModules,
  isGradebookVisibleToLearner,
} from '../../utils/gradebookUtils';

export interface UseCourseGradebookParams {
  moduleResources: PrimeLearningObjectResource[];
  training: PrimeLearningObject;
  account?: PrimeAccount | null;
  isEnrolled: boolean;
}

export function useCourseGradebook(params: UseCourseGradebookParams): {
  gradebookOrderedResources: PrimeLearningObjectResource[];
  showGradebook: boolean;
} {
  const { moduleResources, training, account, isEnrolled } = params;

  const gradebookOrderedResources = useMemo((): PrimeLearningObjectResource[] => {
    if (!moduleResources.length) {
      return [];
    }
    return getGradebookVisibleModules(training, moduleResources);
  }, [moduleResources, training]);

  const showGradebook = useMemo(
    () => isEnrolled && isGradebookVisibleToLearner(training, account),
    [isEnrolled, training, account]
  );
  return { gradebookOrderedResources, showGradebook };
}
