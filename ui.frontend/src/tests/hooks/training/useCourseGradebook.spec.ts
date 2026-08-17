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
import {
  useCourseGradebook,
  type UseCourseGradebookParams,
} from '@hooks/training/useCourseGradebook';
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectResource,
} from '@models/PrimeModels';
import {
  getGradebookVisibleModules,
  isGradebookVisibleToLearner,
} from '@utils/gradebookUtils';

jest.mock('@utils/gradebookUtils', () => ({
  getGradebookVisibleModules: jest.fn(),
  isGradebookVisibleToLearner: jest.fn(),
}));

const mockGetGradebookVisibleModules = getGradebookVisibleModules as jest.Mock;
const mockIsGradebookVisibleToLearner = isGradebookVisibleToLearner as jest.Mock;

// Custom renderHook for @testing-library/react v9 (no built-in renderHook)
function renderHook<T>(hookCallback: () => T) {
  const result: any = { current: null };
  function TestComponent() {
    result.current = hookCallback();
    return null;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => { ReactDOM.render(React.createElement(TestComponent), container); });
  return { result, unmount: () => ReactDOM.unmountComponentAtNode(container) };
}

/** Re-render the hook with updated params (for useMemo dependency coverage). */
function renderHookWithMutableParams(initial: UseCourseGradebookParams) {
  const result: { current: ReturnType<typeof useCourseGradebook> | null } = { current: null };
  const propsRef = { current: initial };
  const bumpRef = { current: () => {} };

  function TestComponent() {
    const [, setTick] = React.useState(0);
    bumpRef.current = () => setTick((t) => t + 1);
    result.current = useCourseGradebook(propsRef.current);
    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(React.createElement(TestComponent), container);
  });

  return {
    result,
    setParams: (next: UseCourseGradebookParams) => {
      propsRef.current = next;
      act(() => bumpRef.current());
    },
    unmount: () => ReactDOM.unmountComponentAtNode(container),
  };
}

const makeTraining = (overrides: Partial<PrimeLearningObject> = {}): PrimeLearningObject =>
  ({ ...overrides } as PrimeLearningObject);

const makeResource = (id: string): PrimeLearningObjectResource =>
  ({ id } as PrimeLearningObjectResource);

const makeAccount = (overrides: Partial<PrimeAccount> = {}): PrimeAccount =>
  ({ ...overrides } as PrimeAccount);

describe('useCourseGradebook', () => {
  beforeEach(() => {
    mockGetGradebookVisibleModules.mockClear();
    mockIsGradebookVisibleToLearner.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('gradebookOrderedResources', () => {
    it('returns empty array without calling getGradebookVisibleModules when moduleResources is empty', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(false);
      const { result } = renderHook(() =>
        useCourseGradebook({ moduleResources: [], training: makeTraining(), account: null, isEnrolled: true })
      );
      expect(result.current.gradebookOrderedResources).toEqual([]);
      expect(mockGetGradebookVisibleModules).not.toHaveBeenCalled();
    });

    it('delegates to getGradebookVisibleModules when moduleResources is non-empty', () => {
      const resources = [makeResource('r1'), makeResource('r2')];
      const filtered = [makeResource('r1')];
      mockGetGradebookVisibleModules.mockReturnValue(filtered);
      mockIsGradebookVisibleToLearner.mockReturnValue(true);

      const { result } = renderHook(() =>
        useCourseGradebook({ moduleResources: resources, training: makeTraining(), account: null, isEnrolled: true })
      );
      expect(result.current.gradebookOrderedResources).toBe(filtered);
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledTimes(1);
    });

    it('passes training and moduleResources to getGradebookVisibleModules', () => {
      const training = makeTraining({ gradebookAllModules: true });
      const resources = [makeResource('r1')];
      mockGetGradebookVisibleModules.mockReturnValue(resources);
      mockIsGradebookVisibleToLearner.mockReturnValue(false);

      renderHook(() =>
        useCourseGradebook({ moduleResources: resources, training, account: null, isEnrolled: true })
      );
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledWith(training, resources);
    });

    it('recomputes when training changes', () => {
      const trainingA = makeTraining({ gradebookAllModules: false });
      const trainingB = makeTraining({ gradebookAllModules: true });
      const resources = [makeResource('r1')];
      mockGetGradebookVisibleModules.mockReturnValue(resources);
      mockIsGradebookVisibleToLearner.mockReturnValue(false);

      const baseParams: UseCourseGradebookParams = {
        moduleResources: resources,
        training: trainingA,
        account: null,
        isEnrolled: true,
      };
      const { setParams, unmount } = renderHookWithMutableParams(baseParams);

      expect(mockGetGradebookVisibleModules).toHaveBeenCalledTimes(1);
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledWith(trainingA, resources);

      setParams({ ...baseParams, training: trainingB });
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledTimes(2);
      expect(mockGetGradebookVisibleModules).toHaveBeenLastCalledWith(trainingB, resources);

      unmount();
    });

    it('does not call getGradebookVisibleModules again when moduleResources becomes empty', () => {
      const training = makeTraining();
      const resources = [makeResource('r1')];
      mockGetGradebookVisibleModules.mockReturnValue(resources);
      mockIsGradebookVisibleToLearner.mockReturnValue(false);

      const { result, setParams, unmount } = renderHookWithMutableParams({
        moduleResources: resources,
        training,
        account: null,
        isEnrolled: true,
      });
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledTimes(1);

      setParams({ moduleResources: [], training, account: null, isEnrolled: true });
      expect(result.current?.gradebookOrderedResources).toEqual([]);
      expect(mockGetGradebookVisibleModules).toHaveBeenCalledTimes(1);

      unmount();
    });
  });

  describe('showGradebook', () => {
    it('is true when isGradebookVisibleToLearner returns true and learner is enrolled', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(true);
      const { result } = renderHook(() =>
        useCourseGradebook({ moduleResources: [], training: makeTraining(), account: makeAccount(), isEnrolled: true })
      );
      expect(result.current.showGradebook).toBe(true);
    });

    it('is false when isGradebookVisibleToLearner returns false', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(false);
      const { result } = renderHook(() =>
        useCourseGradebook({ moduleResources: [], training: makeTraining(), account: null, isEnrolled: true })
      );
      expect(result.current.showGradebook).toBe(false);
    });

    it('is false when learner is not enrolled even if isGradebookVisibleToLearner returns true', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(true);
      const { result } = renderHook(() =>
        useCourseGradebook({ moduleResources: [], training: makeTraining(), account: makeAccount(), isEnrolled: false })
      );
      expect(result.current.showGradebook).toBe(false);
    });

    it('does not call isGradebookVisibleToLearner when learner is not enrolled (short-circuit)', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(true);
      renderHook(() =>
        useCourseGradebook({ moduleResources: [], training: makeTraining(), account: makeAccount(), isEnrolled: false })
      );
      expect(mockIsGradebookVisibleToLearner).not.toHaveBeenCalled();
    });

    it('passes training and undefined account when account is omitted', () => {
      const training = makeTraining({ gradebookEnabled: true });
      mockIsGradebookVisibleToLearner.mockReturnValue(false);

      renderHook(() =>
        useCourseGradebook({ moduleResources: [], training, isEnrolled: true })
      );
      expect(mockIsGradebookVisibleToLearner).toHaveBeenCalledWith(training, undefined);
    });

    it('passes training and account to isGradebookVisibleToLearner', () => {
      const training = makeTraining({ gradebookEnabled: true });
      const account = makeAccount({ gradebookVisibleLearner: true });
      mockIsGradebookVisibleToLearner.mockReturnValue(true);

      renderHook(() =>
        useCourseGradebook({ moduleResources: [], training, account, isEnrolled: true })
      );
      expect(mockIsGradebookVisibleToLearner).toHaveBeenCalledWith(training, account);
    });
  });

  describe('graceful disabled state', () => {
    it('returns showGradebook:false and empty gradebookOrderedResources when gradebook is disabled', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(false);
      const { result } = renderHook(() =>
        useCourseGradebook({
          moduleResources: [],
          training: makeTraining({ gradebookEnabled: false }),
          account: makeAccount({ gradebookVisibleLearner: false }),
          isEnrolled: true,
        })
      );
      expect(result.current.showGradebook).toBe(false);
      expect(result.current.gradebookOrderedResources).toEqual([]);
    });

    it('does not throw when training has no gradebook fields set', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(false);
      expect(() =>
        renderHook(() =>
          useCourseGradebook({
            moduleResources: [],
            training: makeTraining(),
            account: null,
            isEnrolled: true,
          })
        )
      ).not.toThrow();
    });

    it('returns showGradebook:false when account is null (account-level disable)', () => {
      mockIsGradebookVisibleToLearner.mockReturnValue(false);
      const { result } = renderHook(() =>
        useCourseGradebook({
          moduleResources: [],
          training: makeTraining({ gradebookEnabled: true }),
          account: null,
          isEnrolled: true,
        })
      );
      expect(result.current.showGradebook).toBe(false);
    });
  });
});
