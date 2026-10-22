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

import * as translationService from '../../almLib/utils/translationService';
import {
  formatAggregateScore,
  formatGradebookPercent,
  getGradeFormLoResource,
  getGradebookProgressMetrics,
  getGradebookPassingCriteriaText,
  getGradebookSummaryState,
  getGradebookVisibleModules,
  getMandatoryModuleCount,
  getModuleGradebookWeight,
  GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES,
  GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_REQUIRED_MODULES,
  GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE,
  GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY,
  getModuleScorePercent,
  getWeightedContributionPercent,
  roundCalculatedPercent,
  toGradebookPercentDisplay,
  getGradebookPassingScoreForDisplay,
  isGradebookVisibleToLearner,
  isGradebookWeightApplicable,
  isResourceGradeCompleted,
  isResourceGradePassed,
} from '../../almLib/utils/gradebookUtils';
import { PrimeLearningObjectResourceGrade } from '../../almLib/models/PrimeModels';
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectResource,
} from '../../almLib/models/PrimeModels';

const baseResource = (
  id: string,
  mandatory: boolean,
  weight?: PrimeLearningObjectResource['weight']
): PrimeLearningObjectResource =>
  ({
    id,
    mandatory,
    weight,
    resourceType: 'Virtual Classroom',
  } as PrimeLearningObjectResource);

const baseTraining = (overrides: Partial<PrimeLearningObject> = {}): PrimeLearningObject =>
  ({
    hasOptionalLoResources: false,
    loResourceCompletionCount: 0,
    gradebookPassingScore: undefined,
    gradebookAllModules: undefined,
    gradebookEnabled: true,
    gradebookVisibleLearner: true,
    ...overrides,
  } as PrimeLearningObject);

describe('gradebookUtils', () => {
  describe('getGradeFormLoResource', () => {
    it('returns undefined for missing, empty, or non-matching grades', () => {
      expect(getGradeFormLoResource('res1', undefined)).toBeUndefined();
      expect(getGradeFormLoResource('res1', [])).toBeUndefined();
      expect(
        getGradeFormLoResource('res1', [
          { id: 'other', completed: true } as PrimeLearningObjectResourceGrade,
        ])
      ).toBeUndefined();
    });

    it('matches first grade whose composite id includes the resource id', () => {
      const grades = [
        { id: 'prefix_res1_suffix', completed: true } as PrimeLearningObjectResourceGrade,
        { id: 'other', completed: false } as PrimeLearningObjectResourceGrade,
      ];
      expect(getGradeFormLoResource('res1', grades)).toBe(grades[0]);
    });

    it('treats resource id as literal substring (no RegExp metacharacters)', () => {
      const grades = [
        { id: 'grade.course.1', completed: true } as PrimeLearningObjectResourceGrade,
      ];
      expect(getGradeFormLoResource('course.1', grades)).toBe(grades[0]);
    });
  });

  describe('getGradebookVisibleModules', () => {
    const modA = baseResource('a', true, undefined);
    const modB = baseResource('b', false, undefined);
    const modC = baseResource('c', false, 25);
    const ordered = [modA, modB, modC];

    it('returns empty when loResources is empty', () => {
      expect(getGradebookVisibleModules(baseTraining(), [])).toEqual([]);
    });

    it('when gradebookAllModules is not strictly false, shows all core modules', () => {
      expect(getGradebookVisibleModules(baseTraining({ gradebookAllModules: undefined }), ordered)).toEqual(ordered);
      expect(getGradebookVisibleModules(baseTraining({ gradebookAllModules: true }), ordered)).toEqual(ordered);
    });

    it.each(['Pre Work', 'Test Out'])(
      'excludes %s modules even when gradebookAllModules is true',
      loResourceType => {
        const core = baseResource('core', true, 20);
        const excluded = { ...baseResource('excluded', true, 20), loResourceType };
        expect(
          getGradebookVisibleModules(baseTraining({ gradebookAllModules: true }), [core, excluded]).map(
            r => r.id
          )
        ).toEqual(['core']);
      }
    );

    it('when gradebookAllModules is false and passing score > 0 — mandatory and weighted modules', () => {
      const modA2 = baseResource('a', true, 40);
      const modB2 = baseResource('b', false, 50);
      const modC2 = baseResource('c', true, 30);
      const ordered2 = [modA2, modB2, modC2];
      const training = baseTraining({ gradebookAllModules: false, gradebookPassingScore: 70 });
      expect(getGradebookVisibleModules(training, ordered2).map(r => r.id)).toEqual(['a', 'b', 'c']);
      expect(
        getGradebookVisibleModules(
          baseTraining({ gradebookAllModules: false, hasOptionalLoResources: true, loResourceCompletionCount: 3, gradebookPassingScore: 70 }),
          ordered2
        ).map(r => r.id)
      ).toEqual(['a', 'b', 'c']);
    });

    it('when gradebookAllModules is false and passing score is 0 — mandatory modules only', () => {
      expect(
        getGradebookVisibleModules(
          baseTraining({ gradebookAllModules: false, gradebookPassingScore: 0 }),
          ordered
        ).map(r => r.id)
      ).toEqual(['a']);
    });

    it('when gradebookAllModules is false and all modules are required — shows all core modules', () => {
      const modules = [baseResource('a', true, 40), baseResource('b', true, 50), baseResource('c', true, 30)];
      const training = baseTraining({
        gradebookAllModules: false,
        loResourceCompletionCount: modules.length,
        gradebookPassingScore: 70,
      });
      expect(getGradebookVisibleModules(training, modules).map(r => r.id)).toEqual(['a', 'b', 'c']);
    });

    it('when gradebookAllModules is false and passing score is missing — mandatory modules only', () => {
      expect(
        getGradebookVisibleModules(
          baseTraining({ gradebookAllModules: false, gradebookPassingScore: undefined }),
          ordered
        ).map(r => r.id)
      ).toEqual(['a']);
    });

    it('preserves input order for filtered rows', () => {
      const list = [
        baseResource('z', true, 10),
        baseResource('y', true, undefined),
        baseResource('x', true, 5),
      ];
      const training = baseTraining({ gradebookAllModules: false, gradebookPassingScore: 50 });
      expect(getGradebookVisibleModules(training, list).map(r => r.id)).toEqual(['z', 'y', 'x']);
    });
  });

  describe('getMandatoryModuleCount', () => {
    it('counts modules with mandatory strictly true', () => {
      const modules = [baseResource('a', true), baseResource('b', false), baseResource('c', true)];
      expect(getMandatoryModuleCount(modules)).toBe(2);
    });

    it('returns zero when no modules are mandatory', () => {
      const modules = [baseResource('a', false), baseResource('b', false)];
      expect(getMandatoryModuleCount(modules)).toBe(0);
    });
  });

  describe('getGradebookPassingCriteriaText', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns complete-any copy when loResourceCompletionCount is below table size', () => {
      const getTR = jest
        .spyOn(translationService, 'GetTranslationsReplaced')
        .mockReturnValue('COMPLETE_ANY');
      const training = baseTraining({ loResourceCompletionCount: 3 });
      const modules = [
        baseResource('a', false),
        baseResource('b', false),
        baseResource('c', false),
        baseResource('d', false),
        baseResource('e', false),
      ];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('COMPLETE_ANY');
      expect(getTR).toHaveBeenCalledWith(
        GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY,
        { count: 3 },
        true
      );
    });

    it('returns required-modules copy when mandatory modules exist and loResourceCompletionCount is unset', () => {
      const getTR = jest
        .spyOn(translationService, 'GetTranslationsReplaced')
        .mockReturnValue('REQUIRED_MODULES');
      const training = baseTraining({ hasOptionalLoResources: true, loResourceCompletionCount: 0 });
      const modules = [
        baseResource('a', true),
        baseResource('b', true),
        baseResource('c', false),
        baseResource('d', false),
        baseResource('e', false),
      ];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('REQUIRED_MODULES');
      expect(getTR).toHaveBeenCalledWith(
        GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_REQUIRED_MODULES,
        { count: 2 },
        true
      );
    });

    it('returns unavailable copy when optional resources exist but no modules are mandatory', () => {
      const getT = jest
        .spyOn(translationService, 'GetTranslation')
        .mockReturnValue('CURRENTLY_UNAVAILABLE');
      const getTR = jest.spyOn(translationService, 'GetTranslationsReplaced');
      const training = baseTraining({ hasOptionalLoResources: true, loResourceCompletionCount: 0 });
      const modules = [
        baseResource('a', false),
        baseResource('b', false),
        baseResource('c', false),
      ];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('CURRENTLY_UNAVAILABLE');
      expect(getT).toHaveBeenCalledWith(GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE, true);
      expect(getTR).not.toHaveBeenCalled();
    });

    it('returns all-modules copy when every module is mandatory and loResourceCompletionCount is unset', () => {
      const getT = jest.spyOn(translationService, 'GetTranslation').mockReturnValue('ALL_MODULES');
      const getTR = jest.spyOn(translationService, 'GetTranslationsReplaced');
      const training = baseTraining({ hasOptionalLoResources: true, loResourceCompletionCount: 0 });
      const modules = [
        baseResource('a', true),
        baseResource('b', true),
        baseResource('c', true),
        baseResource('d', true),
        baseResource('e', true),
      ];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('ALL_MODULES');
      expect(getT).toHaveBeenCalledWith(GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES, true);
      expect(getTR).not.toHaveBeenCalled();
    });

    it('returns all-modules copy when loResourceCompletionCount equals table size', () => {
      const getT = jest
        .spyOn(translationService, 'GetTranslation')
        .mockReturnValue('ALL_MODULES');
      const getTR = jest.spyOn(translationService, 'GetTranslationsReplaced');
      const training = baseTraining({ loResourceCompletionCount: 5 });
      const modules = [
        baseResource('a', false),
        baseResource('b', false),
        baseResource('c', false),
        baseResource('d', false),
        baseResource('e', false),
      ];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('ALL_MODULES');
      expect(getT).toHaveBeenCalledWith(
        GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES,
        true
      );
      expect(getTR).not.toHaveBeenCalled();
    });

    it('returns unavailable copy when loResourceCompletionCount exceeds the module count', () => {
      const getT = jest
        .spyOn(translationService, 'GetTranslation')
        .mockReturnValue('CURRENTLY_UNAVAILABLE');
      const getTR = jest.spyOn(translationService, 'GetTranslationsReplaced');
      const training = baseTraining({ loResourceCompletionCount: 10 });
      const modules = [baseResource('a', false), baseResource('b', false), baseResource('c', false)];
      expect(getGradebookPassingCriteriaText(training, modules)).toBe('CURRENTLY_UNAVAILABLE');
      expect(getT).toHaveBeenCalledWith(GRADEBOOK_BANNER_CRITERIA_UNAVAILABLE, true);
      expect(getTR).not.toHaveBeenCalled();
    });
  });

  describe('isResourceGradeCompleted', () => {
    it('is true only when completed flag is true', () => {
      expect(isResourceGradeCompleted({ completed: true } as any)).toBe(true);
      expect(isResourceGradeCompleted({ completed: false, hasPassed: true } as any)).toBe(false);
      expect(isResourceGradeCompleted(undefined)).toBe(false);
    });
  });

  describe('isResourceGradePassed', () => {
    it('is true only when completed and hasPassed are both true', () => {
      expect(isResourceGradePassed({ completed: true, hasPassed: true } as any)).toBe(true);
      expect(isResourceGradePassed({ completed: true, hasPassed: false } as any)).toBe(false);
      expect(isResourceGradePassed({ completed: false, hasPassed: true } as any)).toBe(false);
      expect(isResourceGradePassed(undefined)).toBe(false);
    });
  });

  describe('getGradebookSummaryState', () => {
    const trainingOptional = baseTraining({ hasOptionalLoResources: true });
    const mods = [baseResource('a', true, 50), baseResource('b', true, 50)];

    it('NOT_STARTED when optional course has no grades and learner has not passed', () => {
      expect(
        getGradebookSummaryState({
          isCoursePassed: false,
          isCourseFailed: false,
          training: trainingOptional,
          modules: mods,
          gradeByLoResourceId: () => undefined,
        })
      ).toBe('NOT_STARTED');
    });

    it('IN_PROGRESS under completion-count rule until enough modules completed', () => {
      const gradeByLoResourceId = (id: string) => ({ completed: id === 'a' } as any);
      expect(
        getGradebookSummaryState({
          isCoursePassed: false,
          isCourseFailed: false,
          training: trainingOptional,
          modules: mods,
          gradeByLoResourceId,
        })
      ).toBe('IN_PROGRESS');
    });

    it('PASSED or FAILED under completion-count rule depending on enrollment state', () => {
      expect(
        getGradebookSummaryState({ isCoursePassed: true, isCourseFailed: false, training: trainingOptional, modules: mods, gradeByLoResourceId: () => ({ completed: true } as any) })
      ).toBe('PASSED');
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: true, training: trainingOptional, modules: mods, gradeByLoResourceId: () => ({ completed: true } as any) })
      ).toBe('FAILED');
    });

    it('IN_PROGRESS when no completion-count rule and mandatory incomplete', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const gradeByLoResourceId = (id: string) =>
        id === 'a' ? ({ completed: true } as any) : undefined;
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: false, training, modules: mods, gradeByLoResourceId })
      ).toBe('IN_PROGRESS');
    });

    it('treats zero mandatory modules as all mandatory complete (non-optional path)', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const optionalOnly = [baseResource('x', false, 10)];
      expect(
        getGradebookSummaryState({
          isCoursePassed: true,
          isCourseFailed: false,
          training,
          modules: optionalOnly,
          gradeByLoResourceId: () => undefined,
        })
      ).toBe('PASSED');
    });

    it('IN_PROGRESS (not FAILED) when no mandatory modules, course not passed, and not all modules completed', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const allOptional = [
        baseResource('a', false, 90),
        baseResource('b', false, 10),
        baseResource('c', false, 22),
      ];
      const gradeByLoResourceId = (id: string) =>
        ({ completed: id === 'a', dateStarted: '2026-05-11T18:39:20Z' } as any);
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: false, training, modules: allOptional, gradeByLoResourceId })
      ).toBe('IN_PROGRESS');
    });

    it('FAILED on mandatory path when all mandatory complete and enrollment marks course failed', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const gradeByLoResourceId = () => ({ completed: true } as any);
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: true, training, modules: mods, gradeByLoResourceId })
      ).toBe('FAILED');
    });

    it('IN_PROGRESS when all mandatory complete but enrollment has not marked course failed', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const gradeByLoResourceId = () => ({ completed: true } as any);
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: false, training, modules: mods, gradeByLoResourceId })
      ).toBe('IN_PROGRESS');
    });

    it('NOT_STARTED when no activity detected (no grades, or grades with empty dateStarted and completed=false)', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      expect(
        getGradebookSummaryState({
          isCoursePassed: false,
          isCourseFailed: false,
          training,
          modules: mods,
          gradeByLoResourceId: () => undefined,
        })
      ).toBe('NOT_STARTED');
      expect(
        getGradebookSummaryState({
          isCoursePassed: false,
          isCourseFailed: false,
          training,
          modules: mods,
          gradeByLoResourceId: () => ({ completed: false, dateStarted: '' } as any),
        })
      ).toBe('NOT_STARTED');
    });

    it('returns PASSED immediately when coursePassed is true, regardless of module activity', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      expect(
        getGradebookSummaryState({
          isCoursePassed: true,
          isCourseFailed: false,
          training,
          modules: mods,
          gradeByLoResourceId: () => undefined,
        })
      ).toBe('PASSED');
    });

    it('IN_PROGRESS once at least one module has dateStarted set', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      const gradeByLoResourceId = (id: string) =>
        id === 'a' ? ({ completed: false, dateStarted: '2024-01-01T00:00:00Z' } as any) : undefined;
      expect(
        getGradebookSummaryState({ isCoursePassed: false, isCourseFailed: false, training, modules: mods, gradeByLoResourceId })
      ).toBe('IN_PROGRESS');
    });

    it('PASSED or FAILED on mandatory path depending on enrollment state (boundary)', () => {
      const training = baseTraining({ hasOptionalLoResources: false });
      expect(
        getGradebookSummaryState({
          isCoursePassed: true,
          isCourseFailed: false,
          training,
          modules: mods,
          gradeByLoResourceId: () => ({ completed: true } as any),
        })
      ).toBe('PASSED');
      expect(
        getGradebookSummaryState({
          isCoursePassed: false,
          isCourseFailed: true,
          training,
          modules: mods,
          gradeByLoResourceId: () => ({ completed: true } as any),
        })
      ).toBe('FAILED');
    });
  });

  describe('getGradebookProgressMetrics', () => {
    it('uses loResourceCompletionCount when set', () => {
      const training = baseTraining({ loResourceCompletionCount: 2 });
      const mods = [baseResource('a', true), baseResource('b', true)];
      const gradeByLoResourceId = (id: string) =>
        ({ completed: id === 'a', hasPassed: id === 'a' } as any);
      expect(getGradebookProgressMetrics(training, mods, gradeByLoResourceId)).toEqual({
        completed: 1,
        total: 2,
      });
    });

    it('does not count completed-but-failed modules toward passed progress', () => {
      const training = baseTraining({ loResourceCompletionCount: 2 });
      const mods = [baseResource('a', true), baseResource('b', true)];
      const gradeByLoResourceId = (id: string) =>
        ({
          completed: true,
          hasPassed: id === 'a',
        } as any);
      expect(getGradebookProgressMetrics(training, mods, gradeByLoResourceId)).toEqual({
        completed: 1,
        total: 2,
      });
    });

    it('counts only mandatory rows when loResourceCompletionCount is unset', () => {
      const training = baseTraining({ loResourceCompletionCount: 0 });
      const mods = [baseResource('a', true), baseResource('b', false), baseResource('c', true)];
      const gradeByLoResourceId = (id: string) =>
        ({ completed: id === 'a', hasPassed: id === 'a' } as any);
      expect(getGradebookProgressMetrics(training, mods, gradeByLoResourceId)).toEqual({
        completed: 1,
        total: 2,
      });
    });

    it('returns zero total when no modules are required and loResourceCompletionCount is unset', () => {
      const training = baseTraining({ loResourceCompletionCount: 0 });
      const mods = [baseResource('x', false), baseResource('y', false)];
      const gradeByLoResourceId = (id: string) =>
        ({ completed: id === 'x', hasPassed: id === 'x' } as any);
      expect(getGradebookProgressMetrics(training, mods, gradeByLoResourceId)).toEqual({
        completed: 0,
        total: 0,
      });
    });
  });

  describe('getGradebookPassingScoreForDisplay', () => {
    it.each([
      [false, 70, undefined],
      [true, 0, undefined],
      [true, null, undefined],
      [true, undefined, undefined],
      [true, 70, 70],
      [true, 74.9, 74.9],
    ])(
      'gradebookEnabled=%s, score=%s → %s',
      (gradebookEnabled, score, expected) => {
        expect(
          getGradebookPassingScoreForDisplay(
            baseTraining({ gradebookEnabled, gradebookPassingScore: score as number | null | undefined })
          )
        ).toBe(expected);
      }
    );
  });

  describe('isGradebookVisibleToLearner', () => {
    const account: PrimeAccount = { gradebookVisibleLearner: true } as PrimeAccount;

    it('returns false when any required toggle is disabled or account is absent', () => {
      expect(isGradebookVisibleToLearner(baseTraining(), { gradebookVisibleLearner: false } as PrimeAccount)).toBe(false);
      expect(isGradebookVisibleToLearner(baseTraining(), null)).toBe(false);
      expect(isGradebookVisibleToLearner(baseTraining(), undefined)).toBe(false);
      expect(isGradebookVisibleToLearner(baseTraining({ gradebookVisibleLearner: false }), account)).toBe(false);
      expect(isGradebookVisibleToLearner(baseTraining({ gradebookEnabled: false }), account)).toBe(false);
    });

    it('returns true when all toggles and gradebook are enabled', () => {
      expect(isGradebookVisibleToLearner(baseTraining(), account)).toBe(true);
    });
  });

  describe('getModuleGradebookWeight', () => {
    const elearningRes = (contentType: string, weight?: number): PrimeLearningObjectResource =>
      ({
        id: 'r1',
        resourceType: 'Elearning',
        weight,
        resources: [{ contentType }],
      }) as PrimeLearningObjectResource;

    const sessionRes = (resourceType: string, weight?: number): PrimeLearningObjectResource =>
      ({ id: 'r1', resourceType, weight }) as PrimeLearningObjectResource;

    // Non-scorable Elearning sub-types — sourced from server-core ContentType.java
    it.each([
      'VIDEO', 'AUDIO', 'IMAGE', 'ONLINEVIDEO',
      'PDF', 'DOC', 'PPT', 'XLS', 'HTML',
      'HYPERLINK', 'OFFLINE', 'OTHER',
    ])(
      'returns null for non-gradeable Elearning content sub-type: %s',
      contentType => {
        expect(getModuleGradebookWeight(elearningRes(contentType, 20))).toBeNull();
      }
    );

    it('returns null for Elearning module when contentType is absent (resources not dereferenced)', () => {
      expect(getModuleGradebookWeight({ id: 'r1', resourceType: 'Elearning', weight: 20 } as PrimeLearningObjectResource)).toBeNull();
    });

    // Gradeable Elearning sub-types — sourced from server-core ContentType.java
    it.each([
      'SCORM12', 'SCORM2004', 'TINCAN', 'CP', 'AICC', 'PR', 'QUIZ', 'LTI', 'AI_COACH',
    ])(
      'returns weight for gradeable Elearning content sub-type: %s',
      contentType => {
        expect(getModuleGradebookWeight(elearningRes(contentType, 14))).toBe(14);
      }
    );

    it('returns null when weight is unset even for gradeable Elearning content', () => {
      expect(getModuleGradebookWeight(elearningRes('SCORM2004'))).toBeNull();
    });

    it('returns weight when any sub-resource is gradeable, not only the first', () => {
      expect(
        getModuleGradebookWeight({
          id: 'r1',
          resourceType: 'Elearning',
          weight: 20,
          resources: [{ contentType: 'PDF' }, { contentType: 'SCORM2004' }],
        } as PrimeLearningObjectResource)
      ).toBe(20);
    });

    it('returns null when no sub-resource has a gradeable content type', () => {
      expect(
        getModuleGradebookWeight({
          id: 'r1',
          resourceType: 'Elearning',
          weight: 20,
          resources: [{ contentType: 'PDF' }, { contentType: 'VIDEO' }],
        } as PrimeLearningObjectResource)
      ).toBeNull();
    });

    it('returns the weight for session-based resource types (Virtual Classroom, Classroom, Activity)', () => {
      expect(getModuleGradebookWeight(sessionRes('Virtual Classroom', 22))).toBe(22);
      expect(getModuleGradebookWeight(sessionRes('Classroom', 25))).toBe(25);
      expect(getModuleGradebookWeight(sessionRes('Activity', 10))).toBe(10);
    });

    it('returns null when weight is unset for session-based types', () => {
      expect(getModuleGradebookWeight(sessionRes('Virtual Classroom'))).toBeNull();
      expect(getModuleGradebookWeight(sessionRes('Classroom'))).toBeNull();
    });

    it.each(['Pre Work', 'Test Out'])(
      'returns null for prework and testout modules regardless of weight',
      loResourceType => {
        expect(
          getModuleGradebookWeight({
            id: 'r1',
            loResourceType,
            resourceType: 'Elearning',
            weight: 40,
            resources: [{ contentType: 'SCORM2004' }],
          } as PrimeLearningObjectResource)
        ).toBeNull();
      }
    );

    it('returns null for resourceTypes that are not gradebook-weighted (e.g. Discussion)', () => {
      expect(getModuleGradebookWeight(sessionRes('Discussion', 20))).toBeNull();
    });

    it('returns null when resourceType is undefined', () => {
      expect(
        getModuleGradebookWeight({ id: 'r1', weight: 20 } as PrimeLearningObjectResource)
      ).toBeNull();
    });
  });

  describe('isGradebookWeightApplicable', () => {
    it.each(['Pre Work', 'Test Out'])(
      'returns false for %s modules',
      loResourceType => {
        expect(
          isGradebookWeightApplicable({ loResourceType } as PrimeLearningObjectResource)
        ).toBe(false);
      }
    );

    it('returns true for core content modules', () => {
      expect(
        isGradebookWeightApplicable({ loResourceType: 'content' } as PrimeLearningObjectResource)
      ).toBe(true);
    });
  });

  describe('getModuleScorePercent', () => {
    it('returns null when grade is undefined', () => {
      expect(getModuleScorePercent(undefined)).toBeNull();
    });

    it('returns null when maxScore is zero', () => {
      expect(getModuleScorePercent({ score: 50, maxScore: 0 } as any)).toBeNull();
    });

    it('returns null when score or maxScore is missing', () => {
      expect(getModuleScorePercent({ score: undefined, maxScore: 100 } as any)).toBeNull();
      expect(getModuleScorePercent({ score: 50, maxScore: undefined } as any)).toBeNull();
    });

    it('computes (score / maxScore) × 100', () => {
      expect(getModuleScorePercent({ score: 75, maxScore: 100 } as any)).toBe(75);
      expect(getModuleScorePercent({ score: 1, maxScore: 4 } as any)).toBe(25);
      expect(getModuleScorePercent({ score: 50, maxScore: 50 } as any)).toBe(100);
    });

    describe('HIGHEST moduleScoring', () => {
      it('uses highestScore instead of score when moduleScoring is HIGHEST', () => {
        const grade = { score: 40, highestScore: 80, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, 'HIGHEST')).toBe(80);
      });

      it('returns null when highestScore is missing and moduleScoring is HIGHEST', () => {
        const grade = { score: 40, highestScore: undefined, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, 'HIGHEST')).toBeNull();
      });

      it('returns null when maxScore is zero and moduleScoring is HIGHEST', () => {
        const grade = { score: 40, highestScore: 80, maxScore: 0 } as any;
        expect(getModuleScorePercent(grade, 'HIGHEST')).toBeNull();
      });

      it('clamps highestScore result to [0, 100]', () => {
        const grade = { score: 10, highestScore: 150, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, 'HIGHEST')).toBe(100);
      });
    });

    describe('LATEST moduleScoring', () => {
      it('uses score (not highestScore) when moduleScoring is LATEST', () => {
        const grade = { score: 40, highestScore: 80, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, 'LATEST')).toBe(40);
      });
    });

    describe('default (no moduleScoring)', () => {
      it('uses score when moduleScoring is undefined', () => {
        const grade = { score: 60, highestScore: 90, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, undefined)).toBe(60);
        expect(getModuleScorePercent(grade)).toBe(60);
      });

      it('uses score when moduleScoring is null', () => {
        const grade = { score: 50, highestScore: 90, maxScore: 100 } as any;
        expect(getModuleScorePercent(grade, null)).toBe(50);
      });

      it('rounds repeating-decimal module score percents to two places', () => {
        expect(getModuleScorePercent({ score: 63.154, maxScore: 100 } as any, null)).toBe(63.15);
        expect(getModuleScorePercent({ score: 1, maxScore: 3 } as any, null)).toBe(33.33);
      });
    });
  });

  describe('roundCalculatedPercent', () => {
    it('rounds to two decimal places using half-up rounding', () => {
      expect(roundCalculatedPercent(49.644)).toBe(49.64);
      expect(roundCalculatedPercent(49.646)).toBe(49.65);
      expect(roundCalculatedPercent(12.629999999999997)).toBe(12.63);
      expect(roundCalculatedPercent(12)).toBe(12);
    });
  });

  describe('toGradebookPercentDisplay', () => {
    it('rounds and trims trailing zeros for display', () => {
      expect(toGradebookPercentDisplay(75)).toBe(75);
      expect(toGradebookPercentDisplay(75.0)).toBe(75);
      expect(toGradebookPercentDisplay(75.25)).toBe(75.25);
      expect(toGradebookPercentDisplay(49.644)).toBe(49.64);
      expect(toGradebookPercentDisplay(12.629999999999997)).toBe(12.63);
    });
  });

  describe('getWeightedContributionPercent', () => {
    it('computes (weight × score) / 100 including zero weight and zero score', () => {
      expect(getWeightedContributionPercent(40, 80)).toBe(32);
      expect(getWeightedContributionPercent(100, 100)).toBe(100);
      expect(getWeightedContributionPercent(100, 0)).toBe(0);
      expect(getWeightedContributionPercent(0, 80)).toBe(0);
    });

    it('clamps the result to [0, 100]', () => {
      expect(getWeightedContributionPercent(100, 200)).toBe(100);
      expect(getWeightedContributionPercent(-50, 80)).toBe(0);
    });

    it('rounds decimal contributions to two places', () => {
      expect(getWeightedContributionPercent(20, 63.15)).toBe(12.63);
      expect(getWeightedContributionPercent(20, 63.154)).toBe(12.63);
    });
  });

  describe('formatAggregateScore', () => {
    it('formats backend aggregate score to two decimal places', () => {
      expect(formatAggregateScore(82)).toBe('82%');
      expect(formatAggregateScore(86.65)).toBe('86.65%');
      expect(formatAggregateScore(12.63)).toBe('12.63%');
      expect(formatAggregateScore(86.654)).toBe('86.65%');
    });

    it('returns empty string when score is null or NaN', () => {
      expect(formatAggregateScore(null)).toBe('');
      expect(formatAggregateScore(Number.NaN)).toBe('');
    });

    it('returns 0% for zero score', () => {
      expect(formatAggregateScore(0)).toBe('0%');
    });
  });

  describe('formatGradebookPercent', () => {
    it('returns an empty string when value is null or undefined', () => {
      expect(formatGradebookPercent(null as unknown as number)).toBe('');
      expect(formatGradebookPercent(undefined as unknown as number)).toBe('');
    });

    it('returns an empty string when value is NaN', () => {
      expect(formatGradebookPercent(NaN)).toBe('');
    });

    it('omits decimal point for integer-rounded values (0, 75, 100, and trailing-zero decimals)', () => {
      expect(formatGradebookPercent(0)).toBe('0%');
      expect(formatGradebookPercent(75)).toBe('75%');
      expect(formatGradebookPercent(75.0)).toBe('75%');
      expect(formatGradebookPercent(100)).toBe('100%');
    });

    it('formats decimals up to two places and trims trailing zeros', () => {
      expect(formatGradebookPercent(75.3)).toBe('75.3%');
      expect(formatGradebookPercent(75.25)).toBe('75.25%');
    });

    it('preserves 0.5 decimal so paired values do not sum to 101 when displayed', () => {
      // 49.5 + 50.5 = 100; rounding to integers would give 50 + 51 = 101
      expect(formatGradebookPercent(49.5)).toBe('49.5%');
      expect(formatGradebookPercent(50.5)).toBe('50.5%');
    });

    it('rounds to two decimal places', () => {
      expect(formatGradebookPercent(49.64)).toBe('49.64%');
      expect(formatGradebookPercent(49.66)).toBe('49.66%');
      expect(formatGradebookPercent(49.644)).toBe('49.64%');
      expect(formatGradebookPercent(49.646)).toBe('49.65%');
      expect(formatGradebookPercent(12.629999999999997)).toBe('12.63%');
    });
  });
});
