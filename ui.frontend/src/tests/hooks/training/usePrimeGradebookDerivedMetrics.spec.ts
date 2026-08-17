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

import React from 'react';
import { act } from '@testing-library/react';
import ReactDOM from 'react-dom';
import { usePrimeGradebookDerivedMetrics } from '@hooks/training/usePrimeGradebookDerivedMetrics';
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
} from '@models/PrimeModels';

const mockGetEnrollment = jest.fn();

jest.mock('@utils/hooks', () => ({
  getEnrollment: (...args: any[]) => mockGetEnrollment(...args),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  // Appends serialised params so tests can assert interpolated values, e.g. "[count:2]"
  GetTranslationsReplaced: (key: string, params: Record<string, string | number>) => {
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return paramStr ? `${key}[${paramStr}]` : key;
  },
  formatMap: {},
}));

function renderHook<T>(hookCallback: () => T) {
  const result: { current: T | null } = { current: null };
  function TestComponent() {
    result.current = hookCallback();
    return null;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(React.createElement(TestComponent), container);
  });
  return {
    result,
    unmount: () => ReactDOM.unmountComponentAtNode(container),
  };
}

const makeTraining = (overrides: Partial<PrimeLearningObject> = {}): PrimeLearningObject =>
  ({
    hasOptionalLoResources: false,
    loResourceCompletionCount: 0,
    gradebookPassingScore: null,
    gradebookAllModules: undefined,
    gradebookEnabled: true,
    gradebookVisibleLearner: true,
    ...overrides,
  } as PrimeLearningObject);

const makeInstance = (): PrimeLearningObjectInstance =>
  ({ id: 'instance-1' } as PrimeLearningObjectInstance);

const makeResource = (
  id: string,
  overrides: Partial<PrimeLearningObjectResource> = {}
): PrimeLearningObjectResource =>
  ({ id, mandatory: false, weight: null, ...overrides } as PrimeLearningObjectResource);

const makeGrade = (
  id: string,
  overrides: Partial<PrimeLearningObjectResourceGrade> = {}
): PrimeLearningObjectResourceGrade =>
  ({ id, completed: false, hasPassed: false, dateStarted: '', ...overrides } as any);

describe('usePrimeGradebookDerivedMetrics', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    mockGetEnrollment.mockReset();
  });

  describe('isCoursePassed', () => {
    it.each([
      ['no enrollment',           null],
      ['enrollment.hasPassed false', { hasPassed: false, score: 0, loResourceGrades: [] }],
    ] as const)('is false when %s', (_label, enrollment) => {
      mockGetEnrollment.mockReturnValue(enrollment);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [],        })
      );
      expect(result.current!.isCoursePassed).toBe(false);
    });

    it('is true when enrollment.hasPassed is true', () => {
      mockGetEnrollment.mockReturnValue({ hasPassed: true, score: 0, loResourceGrades: [] });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [],        })
      );
      expect(result.current!.isCoursePassed).toBe(true);
    });
  });

  describe('aggregateFormatted', () => {
    it('returns the score dash translation key when no enrollment', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { weight: 50 })],        })
      );
      expect(result.current!.aggregateFormatted).toBe('alm.overview.gradebook.scoreDash');
    });

    it('returns formatted percent from enrollment.score', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        loResourceGrades: [],
        score: 40,
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { weight: 50 })],        })
      );
      expect(result.current!.aggregateFormatted).toBe('40%');
    });

    it('formats backend decimal aggregate score to two decimal places', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        loResourceGrades: [],
        score: 86.65,
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { weight: 100 })],        })
      );
      expect(result.current!.aggregateFormatted).toBe('86.65%');
    });

    it('returns 0% (not a dash) when enrollment.score is 0', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        loResourceGrades: [],
        score: 0,
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { weight: 100 })],        })
      );
      expect(result.current!.aggregateFormatted).toBe('0%');
    });

    it('returns formatted aggregate from enrollment.score for multiple modules', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        loResourceGrades: [],
        score: 74,
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { weight: 60 }),
            makeResource('r2', { weight: 40 }),
          ],        })
      );
      expect(result.current!.aggregateFormatted).toBe('74%');
    });
  });

  describe('summaryState', () => {
    it('is NOT_STARTED when not enrolled and no module activity', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { mandatory: true })],        })
      );
      expect(result.current!.summaryState).toBe('NOT_STARTED');
    });

    it('is IN_PROGRESS when enrolled and at least one module has dateStarted', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        score: 0,
        loResourceGrades: [
          makeGrade('inst_r1_g', { completed: false, dateStarted: '2024-01-01T00:00:00Z' }),
        ],
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: false }),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { mandatory: true })],        })
      );
      expect(result.current!.summaryState).toBe('IN_PROGRESS');
    });

    it('is PASSED when enrolled, hasPassed=true and mandatory modules are complete', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: true,
        score: 80,
        loResourceGrades: [makeGrade('inst_r1_g', { completed: true, hasPassed: true })],
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: false }),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { mandatory: true })],        })
      );
      expect(result.current!.summaryState).toBe('PASSED');
    });

    it('is FAILED when enrollment marks the course completed with hasPassed=false', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        score: 60,
        dateCompleted: '2024-01-15T00:00:00Z',
        loResourceGrades: [makeGrade('inst_r1_g', { completed: true, hasPassed: false })],
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: false }),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { mandatory: true })],        })
      );
      expect(result.current!.summaryState).toBe('FAILED');
    });
  });

  describe('progressMetrics', () => {
    it('returns zero total when no modules are required and loResourceCompletionCount is unset', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [makeResource('r1', { mandatory: false })],        })
      );
      expect(result.current!.progressMetrics).toEqual({ completed: 0, total: 0 });
    });

    it('counts mandatory total correctly and increments completed for each passed module', () => {
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        score: 50,
        loResourceGrades: [
          makeGrade('inst_r1_g', { completed: true, hasPassed: true }),
          makeGrade('inst_r2_g', { completed: true, hasPassed: false }),
        ],
      });
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining(),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: true }),
            makeResource('r2', { mandatory: true }),
          ],        })
      );
      expect(result.current!.progressMetrics).toEqual({ completed: 1, total: 2 });
    });
  });

  describe('passingCriteriaText', () => {
    it('uses the all-modules criteria key when every module is mandatory and optional resources exist', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: true, loResourceCompletionCount: 0 }),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: true }),
            makeResource('r2', { mandatory: true }),
          ],        })
      );
      expect(result.current!.passingCriteriaText).toBe(
        'alm.overview.gradebook.inProgressCriteriaAllModules'
      );
    });

    it('uses the required-modules key when optional resources exist and some modules are mandatory', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: true, loResourceCompletionCount: 0 }),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: true }),
            makeResource('r2', { mandatory: true }),
            makeResource('r3', { mandatory: false }),
          ],        })
      );
      expect(result.current!.passingCriteriaText).toContain(
        'alm.overview.gradebook.inProgressCriteriaRequiredModules'
      );
      expect(result.current!.passingCriteriaText).toContain('[count:2]');
    });

    it('falls back to unavailable when hasOptionalLoResources is false and loResourceCompletionCount is unset', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: false, loResourceCompletionCount: 0 }),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: true }),
            makeResource('r2', { mandatory: true }),
            makeResource('r3', { mandatory: false }),
          ],        })
      );
      expect(result.current!.passingCriteriaText).toBe(
        'alm.overview.gradebook.passingCriteriaUnavailable'
      );
    });

    it('uses loResourceCompletionCount for complete-any banner count when set', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({ hasOptionalLoResources: false, loResourceCompletionCount: 3 }),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: true }),
            makeResource('r2', { mandatory: true }),
            makeResource('r3', { mandatory: false }),
            makeResource('r4', { mandatory: false }),
          ],        })
      );
      expect(result.current!.passingCriteriaText).toContain(
        'alm.overview.gradebook.passingCriteriaCompleteAny'
      );
      expect(result.current!.passingCriteriaText).toContain('[count:3]');
    });

    it('uses all-modules criteria when loResourceCompletionCount equals module count', () => {
      mockGetEnrollment.mockReturnValue(null);
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training: makeTraining({
            hasOptionalLoResources: false,
            loResourceCompletionCount: 2,
          }),
          trainingInstance: makeInstance(),
          loResources: [
            makeResource('r1', { mandatory: false }),
            makeResource('r2', { mandatory: false }),
          ],        })
      );
      expect(result.current!.passingCriteriaText).toBe(
        'alm.overview.gradebook.inProgressCriteriaAllModules'
      );
    });
  });

  describe('enrollment forwarding', () => {
    it('calls getEnrollment with training+instance and returns the result as enrollment', () => {
      const enrollment = { hasPassed: false, score: 0, loResourceGrades: [] };
      mockGetEnrollment.mockReturnValue(enrollment);
      const training = makeTraining();
      const instance = makeInstance();
      const { result } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instance,
          loResources: [],        })
      );
      expect(mockGetEnrollment).toHaveBeenCalledWith(training, instance);
      expect(result.current!.enrollment).toBe(enrollment);
    });
  });

  describe('enrollment isolation — per-instance data', () => {
    it('uses the enrollment from the specific trainingInstance, not a different instance', () => {
      const enrollmentA = { hasPassed: true, score: 85, loResourceGrades: [] };
      const enrollmentB = { hasPassed: false, score: 40, loResourceGrades: [] };
      const training = makeTraining();
      const instanceA = { id: 'instance-A' } as PrimeLearningObjectInstance;
      const instanceB = { id: 'instance-B' } as PrimeLearningObjectInstance;

      mockGetEnrollment.mockImplementation((_t: any, inst: any) =>
        inst.id === 'instance-A' ? enrollmentA : enrollmentB
      );

      const { result: resultA } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instanceA,
          loResources: [],        })
      );
      const { result: resultB } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instanceB,
          loResources: [],        })
      );

      expect(resultA.current!.enrollment).toBe(enrollmentA);
      expect(resultB.current!.enrollment).toBe(enrollmentB);
      expect(resultA.current!.isCoursePassed).toBe(true);
      expect(resultB.current!.isCoursePassed).toBe(false);
    });

    it('does not bleed grade data between two instances that share the same training object', () => {
      const gradesA = [makeGrade('g-a', { completed: true, hasPassed: true })];
      const gradesB = [makeGrade('g-b', { completed: false, hasPassed: false })];
      const training = makeTraining();
      const instanceA = { id: 'inst-A' } as PrimeLearningObjectInstance;
      const instanceB = { id: 'inst-B' } as PrimeLearningObjectInstance;

      mockGetEnrollment.mockImplementation((_t: any, inst: any) =>
        inst.id === 'inst-A'
          ? { hasPassed: true, score: 90, loResourceGrades: gradesA }
          : { hasPassed: false, score: 30, loResourceGrades: gradesB }
      );

      const { result: resultA } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instanceA,
          loResources: [makeResource('r1', { mandatory: true })],        })
      );
      const { result: resultB } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instanceB,
          loResources: [makeResource('r1', { mandatory: true })],        })
      );

      expect(resultA.current!.aggregateFormatted).toBe('90%');
      expect(resultB.current!.aggregateFormatted).toBe('30%');
    });
  });

  describe('reattempt score — aggregate reflects latest attempt', () => {
    it('aggregateFormatted shows the latest enrollment score after a reattempt (score increases)', () => {
      // First attempt: score 50
      mockGetEnrollment.mockReturnValue({ hasPassed: false, score: 50, loResourceGrades: [] });
      const training = makeTraining();
      const instance = makeInstance();
      const { result: r1 } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instance,
          loResources: [makeResource('r1', { weight: 100 })],        })
      );
      expect(r1.current!.aggregateFormatted).toBe('50%');

      // Second attempt (re-render with new enrollment score 80)
      mockGetEnrollment.mockReturnValue({ hasPassed: true, score: 80, loResourceGrades: [] });
      const { result: r2 } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instance,
          loResources: [makeResource('r1', { weight: 100 })],        })
      );
      expect(r2.current!.aggregateFormatted).toBe('80%');
    });

    it('isCoursePassed reflects the latest attempt result (FAILED → PASSED after reattempt)', () => {
      // Failed first attempt
      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        score: 55,
        dateCompleted: '2024-01-01T00:00:00Z',
        loResourceGrades: [],
      });
      const training = makeTraining();
      const instance = makeInstance();
      const { result: failed } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instance,
          loResources: [],        })
      );
      expect(failed.current!.isCoursePassed).toBe(false);

      // Passed second attempt
      mockGetEnrollment.mockReturnValue({
        hasPassed: true,
        score: 82,
        dateCompleted: '2024-02-01T00:00:00Z',
        loResourceGrades: [],
      });
      const { result: passed } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({
          training,
          trainingInstance: instance,
          loResources: [],        })
      );
      expect(passed.current!.isCoursePassed).toBe(true);
      expect(passed.current!.aggregateFormatted).toBe('82%');
    });

    it('summaryState transitions from FAILED to PASSED after a successful reattempt', () => {
      const training = makeTraining({ hasOptionalLoResources: false });
      const instance = makeInstance();
      const loResources = [makeResource('r1', { mandatory: true })];

      mockGetEnrollment.mockReturnValue({
        hasPassed: false,
        score: 45,
        dateCompleted: '2024-01-10T00:00:00Z',
        loResourceGrades: [makeGrade('inst_r1_g', { completed: true, hasPassed: false })],
      });
      const { result: failedResult } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({ training, trainingInstance: instance, loResources })
      );
      expect(failedResult.current!.summaryState).toBe('FAILED');

      mockGetEnrollment.mockReturnValue({
        hasPassed: true,
        score: 78,
        dateCompleted: '2024-02-10T00:00:00Z',
        loResourceGrades: [makeGrade('inst_r1_g', { completed: true, hasPassed: true })],
      });
      const { result: passedResult } = renderHook(() =>
        usePrimeGradebookDerivedMetrics({ training, trainingInstance: instance, loResources })
      );
      expect(passedResult.current!.summaryState).toBe('PASSED');
    });
  });
});
