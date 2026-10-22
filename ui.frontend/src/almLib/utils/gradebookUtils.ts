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

import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
} from '../models/PrimeModels';
import { GetTranslation, GetTranslationsReplaced, formatMap } from './translationService';
import {
  ACTIVITY,
  CHECKLIST,
  CLASSROOM,
  CONTENT_TYPES,
  ELEARNING,
  GRADEBOOK_STATES,
  MODULE_SCORING_TYPES,
  PREWORK,
  TESTOUT,
  VIRTUAL_CLASSROOM,
  CALCULATED_PERCENT_DECIMALS,
} from './constants';

/** i18n keys for gradebook passing-criteria banner (shared by utils and tests). */
export const GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES =
  'alm.overview.gradebook.inProgressCriteriaAllModules';
export const GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY =
  'alm.overview.gradebook.passingCriteriaCompleteAny';
export const GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_REQUIRED_MODULES =
  'alm.overview.gradebook.inProgressCriteriaRequiredModules';
export const GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE =
  'alm.overview.gradebook.passingCriteriaUnavailable';

export type GradebookSummaryState = (typeof GRADEBOOK_STATES)[keyof typeof GRADEBOOK_STATES];

/**
 * Completion-rule sentence for the gradebook passing-criteria banner. Does not include minimum
 * aggregate score; callers may append that in the UI.
 */
export function getGradebookPassingCriteriaText(
  training: PrimeLearningObject,
  modules: PrimeLearningObjectResource[]
): string {
  const totalModulesCount = modules.length;
  const loResourceCompletionCount = training.loResourceCompletionCount;

  const hasOptionalLoResources = training.hasOptionalLoResources;

  if (hasOptionalLoResources) {
    const mandatoryCount = getMandatoryModuleCount(modules);

    // All modules are individually mandatory.
    if (totalModulesCount > 0 && mandatoryCount === totalModulesCount) {
      return GetTranslation(GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES, true);
    }

    // Some (but not all) modules are required.
    if (mandatoryCount > 0 && mandatoryCount < totalModulesCount) {
      return GetTranslationsReplaced(
        GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_REQUIRED_MODULES,
        { count: mandatoryCount },
        true
      );
    }

    // required modules details not available.
    return GetTranslation(GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE, true);
  }
  if (loResourceCompletionCount != null && loResourceCompletionCount > 0) {
    // All modules required
    if (loResourceCompletionCount === totalModulesCount) {
      return GetTranslation(GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES, true);
    } else if (
      // x-of-y modules are required.
      loResourceCompletionCount < totalModulesCount
    ) {
      return GetTranslationsReplaced(
        GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY,
        { count: loResourceCompletionCount },
        true
      );
    }
  }
  return GetTranslation(GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE, true);
}

// Elearning content sub-types that produce a gradebook score (sourced from ContentType.java)
const GRADEABLE_ELEARNING_CONTENT_TYPES = new Set<string>([
  CONTENT_TYPES.SCORM12,
  CONTENT_TYPES.SCORM2004,
  CONTENT_TYPES.TINCAN,
  CONTENT_TYPES.CP,
  CONTENT_TYPES.AICC,
  CONTENT_TYPES.PR,
  CONTENT_TYPES.QUIZ,
  CONTENT_TYPES.LTI,
  CONTENT_TYPES.AI_COACH,
]);

/** Gradebook weightage applies to core content only; prework and testout are excluded. */
export function isGradebookWeightApplicable(loResource: PrimeLearningObjectResource): boolean {
  return loResource.loResourceType !== PREWORK && loResource.loResourceType !== TESTOUT;
}

/** Numeric module weight for gradebook display and filtering.
 * - Elearning: only gradeable sub-types (SCORM, CP, QUIZ, LTI, AI_COACH…) return weight.
 * - Classroom / Virtual Classroom / Activity: always return weight if set.
 * - Prework / Testout: null (not part of gradebook weighting).
 * - Unknown resourceType: null. */
export function getModuleGradebookWeight(
  loResource: PrimeLearningObjectResource
): NonNullable<PrimeLearningObjectResource['weight']> | null {
  if (!isGradebookWeightApplicable(loResource)) {
    return null;
  }

  const { resourceType } = loResource;

  if (resourceType === ELEARNING) {
    const hasGradeableContent = loResource.resources?.some(
      resource =>
        resource.contentType && GRADEABLE_ELEARNING_CONTENT_TYPES.has(resource.contentType)
    );
    if (!hasGradeableContent) {
      return null;
    }
    return loResource.weight ?? null;
  }

  if (
    resourceType === CLASSROOM ||
    resourceType === VIRTUAL_CLASSROOM ||
    resourceType === ACTIVITY
  ) {
    return loResource.weight ?? null;
  }

  return null;
}

/** Minimum aggregate score for learner-facing copy — only when gradebook is enabled and score > 0. */
export function getGradebookPassingScoreForDisplay(
  training: Pick<PrimeLearningObject, 'gradebookEnabled' | 'gradebookPassingScore'>
): number | undefined {
  if (training.gradebookEnabled !== true) {
    return undefined;
  }
  const score = training.gradebookPassingScore;
  if (score == null || score <= 0) {
    return undefined;
  }
  return score;
}

/**
 * Learner may see Gradebook when account and course explicitly enable learner visibility
 * (`gradebookVisibleLearner === true` on both) and the course has gradebook enabled.
 */
export function isGradebookVisibleToLearner(
  training: PrimeLearningObject,
  account?: PrimeAccount | null
): boolean {
  if (account?.gradebookVisibleLearner !== true) {
    return false;
  }
  if (training.gradebookVisibleLearner !== true) {
    return false;
  }
  return training.gradebookEnabled === true;
}

export const getMandatoryModuleCount = (modules: PrimeLearningObjectResource[]): number => {
  return modules.reduce((prev, curr) => {
    return prev + (curr.mandatory === true ? 1 : 0);
  }, 0);
};

/**
 * Learner gradebook table rows. Pre Work and Test Out modules are never included.
 * When gradebookAllModules is not strictly `false`, every remaining core module in `loResources` is shown.
 * When gradebookAllModules is `false` and loResourceCompletionCount is set (all-modules-required or x-of-y),
 * every core module is shown. Otherwise (selected-modules-required), mandatory modules are shown; when
 * gradebookPassingScore is positive, optional modules with a gradebook weight are also shown.
 */
export function getGradebookVisibleModules(
  training: PrimeLearningObject,
  loResources: PrimeLearningObjectResource[]
): PrimeLearningObjectResource[] {
  if (!loResources?.length) {
    return [];
  }

  const coreModules = loResources.filter(isGradebookWeightApplicable);
  if (training.gradebookAllModules !== false) {
    return coreModules;
  }

  // All-modules-required (loResourceCompletionCount === module count) and x-of-y both use a positive count.
  if (training.loResourceCompletionCount) {
    return coreModules;
  }

  const gradebookPassingScore = training.gradebookPassingScore;
  return coreModules.filter(moduleResource => {
    if (gradebookPassingScore != null && gradebookPassingScore > 0) {
      if (moduleResource.mandatory === true) {
        return true;
      }

      const weight = getModuleGradebookWeight(moduleResource);
      return weight !== null && weight !== 0;
    }
    return moduleResource.mandatory === true;
  });
}

export function isResourceGradeCompleted(
  grade: PrimeLearningObjectResourceGrade | undefined
): boolean {
  return grade?.completed === true;
}

/** Module counts toward gradebook "modules passed" progress when completed and passed. */
export function isResourceGradePassed(
  grade: PrimeLearningObjectResourceGrade | undefined
): boolean {
  return grade?.completed === true && grade?.hasPassed === true;
}

export function getGradebookSummaryState(gradebookSummaryInput: {
  isCoursePassed: boolean;
  isCourseFailed: boolean;
  training: PrimeLearningObject;
  modules: PrimeLearningObjectResource[];
  gradeByLoResourceId: (loResourceId: string) => PrimeLearningObjectResourceGrade | undefined;
}): GradebookSummaryState {
  const { isCoursePassed, isCourseFailed, modules, gradeByLoResourceId } = gradebookSummaryInput;
  if (isCoursePassed) {
    return GRADEBOOK_STATES.PASSED;
  }
  if (isCourseFailed) {
    return GRADEBOOK_STATES.FAILED;
  }
  const anyActivityDetected = modules.some(module => {
    const grade = gradeByLoResourceId(module.id);
    return !!grade?.dateStarted || grade?.completed === true;
  });
  if (!anyActivityDetected) {
    return GRADEBOOK_STATES.NOT_STARTED;
  }
  return GRADEBOOK_STATES.IN_PROGRESS;
}

export function getGradebookProgressMetrics(
  training: PrimeLearningObject,
  modules: PrimeLearningObjectResource[],
  gradeByLoResourceId: (loResourceId: string) => PrimeLearningObjectResourceGrade | undefined
): { completed: number; total: number } {
  const totalModulesCount = modules.length;
  const loCompletionCount = training.loResourceCompletionCount;

  // If minimum number of modules are required to complete.
  if (
    loCompletionCount != null &&
    loCompletionCount > 0 &&
    loCompletionCount <= totalModulesCount
  ) {
    const passedModulesCount = modules.reduce((prev, curr) => {
      return prev + (isResourceGradePassed(gradeByLoResourceId(curr.id)) ? 1 : 0);
    }, 0);
    return {
      completed: Math.min(passedModulesCount, loCompletionCount),
      total: loCompletionCount,
    };
  }

  const requiredModulesCount = modules.reduce((prev, curr) => {
    return prev + (curr.mandatory === true ? 1 : 0);
  }, 0);

  const passedRequiredModulesCount = modules.reduce((prev, curr) => {
    return (
      prev +
      (curr.mandatory === true && isResourceGradePassed(gradeByLoResourceId(curr.id)) ? 1 : 0)
    );
  }, 0);

  return {
    completed: passedRequiredModulesCount,
    total: requiredModulesCount,
  };
}

export function getGradeFormLoResource(
  loResourceId: string,
  grades?: PrimeLearningObjectResourceGrade[]
): PrimeLearningObjectResourceGrade | undefined {
  if (!grades) {
    return undefined;
  }
  return grades.find((resourceGrade: PrimeLearningObjectResourceGrade) =>
    resourceGrade.id.includes(loResourceId)
  );
}

/** Module score as a percent of max (0–100), when score and max are available.
 * When moduleScoring is 'HIGHEST', uses grade.highestScore as the numerator. */
export function getModuleScorePercent(
  grade?: PrimeLearningObjectResourceGrade,
  moduleScoring?: string | null
): number | null {
  if (!grade) {
    return null;
  }
  const rawScore =
    moduleScoring === MODULE_SCORING_TYPES.HIGHEST ? grade.highestScore : grade.score;
  const { maxScore } = grade;

  if (rawScore == null || maxScore == null || maxScore === 0) {
    return null;
  }
  return roundCalculatedPercent(Math.max(0, Math.min(100, (rawScore / maxScore) * 100)));
}

/** Contribution to weighted aggregate: (weight% × module score%) / 100. */
export function getWeightedContributionPercent(
  weightPercent: NonNullable<PrimeLearningObjectResource['weight']>,
  moduleScorePercent: number
): number {
  return roundCalculatedPercent(
    Math.max(0, Math.min(100, (weightPercent * moduleScorePercent) / 100))
  );
}

/** Backend aggregate percent — rounded to {@link CALCULATED_PERCENT_DECIMALS} for display. */
export function formatAggregateScore(
  score: NonNullable<PrimeLearningObjectInstanceEnrollment['score']> | null | undefined
): string {
  if (score == null || Number.isNaN(score)) {
    return '';
  }
  if (score === 0) {
    return '0%';
  }
  return `${toGradebookPercentDisplay(score)}%`;
}

/** Round FE-calculated percents to a fixed precision before display or downstream use. */
export function roundCalculatedPercent(value: number): number {
  return Math.round(value * 10 ** CALCULATED_PERCENT_DECIMALS) / 10 ** CALCULATED_PERCENT_DECIMALS;
}

/** Round and normalize a percent for display (max 2 decimals, trailing zeros trimmed). */
export function toGradebookPercentDisplay(value: number): number {
  return parseFloat(roundCalculatedPercent(value).toFixed(CALCULATED_PERCENT_DECIMALS));
}

/** Format FE-calculated percents (module score %, contribution) with rounding applied. */
export function formatGradebookPercent(
  value: NonNullable<PrimeLearningObjectInstanceEnrollment['score']>
): string {
  if (value == null || Number.isNaN(value)) {
    return '';
  }
  const displayValue = toGradebookPercentDisplay(value);
  if (displayValue === 0) {
    return '0%';
  }
  return `${displayValue}%`;
}

const capitalizeFirstChar = (input: string) =>
  input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);

export const getModuleStatusPill = (
  loResourceGrade: ReturnType<typeof getGradeFormLoResource>,
  {
    statusPillNeutral,
    statusPillSuccess,
    statusPillDanger,
    statusPillInProgress,
  }: Record<string, string>
): { statusLabel: string; statusPillClass: string } => {
  if (loResourceGrade?.completed) {
    if (loResourceGrade.hasPassed) {
      return {
        statusLabel: GetTranslation('alm.overview.gradebook.passed', true),
        statusPillClass: statusPillSuccess,
      };
    }
    return {
      statusLabel: GetTranslation('alm.overview.gradebook.failed', true),
      statusPillClass: statusPillDanger,
    };
  }
  if (loResourceGrade?.dateStarted) {
    return {
      statusLabel: GetTranslation('alm.overview.gradebook.inProgress', true),
      statusPillClass: statusPillInProgress,
    };
  }
  return {
    statusLabel: GetTranslation('alm.overview.gradebook.notStarted', true),
    statusPillClass: statusPillNeutral,
  };
};

export const getModuleFormatLabel = (loResource: PrimeLearningObjectResource): string => {
  if (!loResource.resourceType || !formatMap[loResource.resourceType]) {
    return '';
  }
  const formatTranslationKey =
    loResource.resourceSubType !== CHECKLIST
      ? formatMap[loResource.resourceType]
      : formatMap[capitalizeFirstChar(loResource.resourceSubType)];
  return GetTranslation(String(formatTranslationKey), true);
};
