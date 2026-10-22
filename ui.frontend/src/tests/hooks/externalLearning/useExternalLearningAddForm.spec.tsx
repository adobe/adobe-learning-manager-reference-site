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

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    submitExternalLearning: jest.fn(),
  },
}));

import { act } from '@testing-library/react';
import { useExternalLearningAddForm } from '@hooks/externalLearning';
import * as externalLearningUtils from '@utils/externalLearning';
import APIServiceInstance from '@common/APIService';
import { createRenderHook } from '../../util/renderHook';

const mockFetchSettings = externalLearningUtils.fetchExternalLearningSettings as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearningSettings>;
const mockSubmitExternalLearning = APIServiceInstance.submitExternalLearning as jest.MockedFunction<typeof APIServiceInstance.submitExternalLearning>;

function makeSettings(): any {
  return {
    enabled: true,
    coreFields: [{ id: 'title', type: 'TEXT', enabled: true, mandatory: true }],
    customFields: [],
  };
}

const renderHook = () => createRenderHook(() => useExternalLearningAddForm());

describe('useExternalLearningAddForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('beforeFetch_isLoadingTrue_formNull', () => {
      let resolveSettings: (v: any) => void;
      mockFetchSettings.mockReturnValue(new Promise((res) => { resolveSettings = res; }) as any);

      const { result } = renderHook();

      expect(result.current.isLoading).toBe(true);
      expect(result.current.externalLearningForm).toBeNull();

      act(() => { resolveSettings!({ data: { attributes: makeSettings() } }); });
    });
  });

  describe('settings fetch', () => {
    it('fetchSuccess_setsFormFromDataAttributes', async () => {
      const settings = makeSettings();
      mockFetchSettings.mockResolvedValue({ data: { attributes: settings } } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.externalLearningForm).toEqual(settings);
      expect(hookResult.result.current.isLoading).toBe(false);
      expect(hookResult.result.current.errorCode).toBe('');
    });

    it('fetchSuccess_nullAttributes_setsFormNull', async () => {
      mockFetchSettings.mockResolvedValue({ data: { attributes: null } } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.externalLearningForm).toBeNull();
    });

    it('fetchError_setsErrorCode', async () => {
      mockFetchSettings.mockRejectedValue({ status: 500 });

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe(500);
      expect(hookResult.result.current.isLoading).toBe(false);
    });

    it('fetchError_noStatus_setsGenericError', async () => {
      mockFetchSettings.mockRejectedValue(new Error('Fetch failed'));

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe('error');
    });
  });

  describe('submitExternalLearning', () => {
    it('submit_success_forwardsPayloadToAPIService', async () => {
      mockFetchSettings.mockResolvedValue({ data: { attributes: makeSettings() } } as any);
      mockSubmitExternalLearning.mockResolvedValue(undefined);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      const payload = { data: { type: 'externalLearning', attributes: { fields: [{ id: 'title', value: 'My Course' }] } } };
      await act(async () => { await hookResult.result.current.submitExternalLearning(payload); });

      expect(mockSubmitExternalLearning).toHaveBeenCalledWith(payload);
    });

    it('submit_apiError_throwsError', async () => {
      mockFetchSettings.mockResolvedValue({ data: { attributes: makeSettings() } } as any);
      mockSubmitExternalLearning.mockRejectedValue(new Error('POST failed'));

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      await expect(hookResult.result.current.submitExternalLearning({})).rejects.toThrow('POST failed');
    });
  });
});
