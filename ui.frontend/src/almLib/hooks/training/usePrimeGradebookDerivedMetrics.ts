/**
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useMemo } from 'react';
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
} from '../../models/PrimeModels';
import { getEnrollment } from '../../utils/hooks';
import {
  formatAggregateScore,
  getGradeFormLoResource,
  getGradebookPassingCriteriaText,
  getGradebookProgressMetrics,
  getGradebookSummaryState,
  type GradebookSummaryState,
} from '../../utils/gradebookUtils';
import { GetTranslation } from '../../utils/translationService';

export interface UsePrimeGradebookDerivedMetricsParams {
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  loResources: PrimeLearningObjectResource[];
}

export interface PrimeGradebookDerivedMetrics {
  enrollment: ReturnType<typeof getEnrollment>;
  getGradeFormLoResourceId: (loResourceId: string) => PrimeLearningObjectResourceGrade | undefined;
  /** Enrollment-level aggregate score percent (0–100) as returned by the API; 0 when no enrollment. */
  aggregatePercent: number;
  summaryState: GradebookSummaryState;
  /** Mandatory / completion-target progress for the banner. */
  progressMetrics: { completed: number; total: number };
  passingCriteriaText: string;
  aggregateFormatted: string;
  isCoursePassed: boolean;
}

export const usePrimeGradebookDerivedMetrics = (
  params: UsePrimeGradebookDerivedMetricsParams
): PrimeGradebookDerivedMetrics => {
  const { training, trainingInstance, loResources } = params;

  const enrollment = useMemo(
    () => getEnrollment(training, trainingInstance),
    [training, trainingInstance]
  );

  const isCoursePassed = enrollment?.hasPassed === true;
  const isCourseFailed = !!enrollment?.dateCompleted && enrollment?.hasPassed === false;

  const getGradeFormLoResourceId = useMemo(
    () => (loResourceId: string) =>
      getGradeFormLoResource(loResourceId, enrollment?.loResourceGrades),
    [enrollment?.loResourceGrades]
  );

  const aggregatePercent = enrollment?.score ?? 0;

  const summaryState = useMemo(
    () =>
      getGradebookSummaryState({
        isCoursePassed,
        isCourseFailed,
        training,
        modules: loResources,
        gradeByLoResourceId: getGradeFormLoResourceId,
      }),
    [isCoursePassed, isCourseFailed, training, loResources, getGradeFormLoResourceId]
  );

  const progressMetrics = useMemo(
    () => getGradebookProgressMetrics(training, loResources, getGradeFormLoResourceId),
    [training, loResources, getGradeFormLoResourceId]
  );

  const passingCriteriaText = useMemo(() => {
    return getGradebookPassingCriteriaText(training, loResources);
  }, [training, loResources]);

  const aggregateFormatted = useMemo(
    () =>
      typeof enrollment?.score === 'number' && !Number.isNaN(enrollment.score)
        ? formatAggregateScore(enrollment.score)
        : GetTranslation('alm.overview.gradebook.scoreDash', true),
    [enrollment?.score]
  );

  return {
    enrollment,
    getGradeFormLoResourceId,
    aggregatePercent,
    summaryState,
    progressMetrics,
    passingCriteriaText,
    aggregateFormatted,
    isCoursePassed,
  };
};
