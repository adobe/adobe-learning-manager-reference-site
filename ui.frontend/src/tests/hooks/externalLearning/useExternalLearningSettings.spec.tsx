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

jest.mock('@utils/externalLearning', () => ({
  fetchExternalLearningSettings: jest.fn(),
}));

import { act } from '@testing-library/react';
import { useExternalLearningSettings } from '@hooks/externalLearning/useExternalLearningSettings';
import * as externalLearningUtils from '@utils/externalLearning';
import { createRenderHook } from '../../util/renderHook';

const mockFetchSettings = externalLearningUtils.fetchExternalLearningSettings as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearningSettings>;

function makeSettings(overrides: any = {}): any {
  return {
    enabled: true,
    updatedAt: '2026-01-01T00:00:00Z',
    coreFields: [
      { id: 'title', type: 'TEXT', enabled: true, mandatory: true, default: true, label: 'alm.externallearning.title', description: '', editable: true, order: 1 },
      { id: 'date', type: 'TIMESTAMP', enabled: true, mandatory: false, default: true, label: 'alm.externallearning.date', description: '', editable: true, order: 2 },
    ],
    customFields: [],
    ...overrides,
  };
}

const renderHook = () => createRenderHook(() => useExternalLearningSettings());

describe('useExternalLearningSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('beforeFetch_isLoadingTrue_settingsNull', () => {
      let resolveSettings: (v: any) => void;
      mockFetchSettings.mockReturnValue(new Promise((res) => { resolveSettings = res; }) as any);

      const { result } = renderHook();

      expect(result.current.isLoading).toBe(true);
      expect(result.current.settings).toBeNull();
      expect(result.current.errorCode).toBe('');

      act(() => { resolveSettings!({ data: { attributes: makeSettings() } }); });
    });
  });

  describe('successful fetch', () => {
    it('fetchSuccess_setsSettingsFromDataAttributes', async () => {
      const settings = makeSettings();
      mockFetchSettings.mockResolvedValue({ data: { attributes: settings } } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.settings).toEqual(settings);
      expect(hookResult.result.current.isLoading).toBe(false);
      expect(hookResult.result.current.errorCode).toBe('');
    });

    it('fetchSuccess_nullDataAttributes_setsSettingsNull', async () => {
      mockFetchSettings.mockResolvedValue({ data: null } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.settings).toBeNull();
      expect(hookResult.result.current.isLoading).toBe(false);
    });

    it('fetchSuccess_undefinedResponse_setsSettingsNull', async () => {
      mockFetchSettings.mockResolvedValue(undefined as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.settings).toBeNull();
    });

    it('fetchSuccess_withCustomFields_setsSettingsWithCustomFields', async () => {
      const settings = makeSettings({
        customFields: [
          { id: 'cf:1', type: 'TEXT', enabled: true, mandatory: false, default: false, label: { en_US: 'Notes' }, description: {}, editable: true, order: 1 },
        ],
      });
      mockFetchSettings.mockResolvedValue({ data: { attributes: settings } } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.settings?.customFields).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('fetchError_withStatus_setsErrorCode', async () => {
      mockFetchSettings.mockRejectedValue({ status: 403 });

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe(403);
      expect(hookResult.result.current.isLoading).toBe(false);
      expect(hookResult.result.current.settings).toBeNull();
    });

    it('fetchError_noStatus_setsGenericErrorCode', async () => {
      mockFetchSettings.mockRejectedValue(new Error('Network Error'));

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe('error');
    });
  });
});
