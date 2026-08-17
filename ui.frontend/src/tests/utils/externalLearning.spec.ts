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

// The utilities in @utils/externalLearning are thin wrappers over APIServiceInstance methods —
// the actual REST calls + JSON:API parsing happen inside ALMCustomHooks. Tests here verify the
// delegation contract: each wrapper forwards the right arguments and returns whatever the
// service returns.
jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    getExternalLearningSettings: jest.fn(),
    getExternalLearnings: jest.fn(),
    getExternalLearningsByUrl: jest.fn(),
    getExternalLearningById: jest.fn(),
    updateExternalLearning: jest.fn(),
  },
}));

import {
  fetchExternalLearningSettings,
  fetchExternalLearnings,
  fetchExternalLearningsByUrl,
  fetchExternalLearningById,
  updateExternalLearning,
} from '@utils/externalLearning';
import APIServiceInstance from '@common/APIService';

const mockGetSettings = APIServiceInstance.getExternalLearningSettings as jest.MockedFunction<
  typeof APIServiceInstance.getExternalLearningSettings
>;
const mockGetLearnings = APIServiceInstance.getExternalLearnings as jest.MockedFunction<
  typeof APIServiceInstance.getExternalLearnings
>;
const mockGetByUrl = APIServiceInstance.getExternalLearningsByUrl as jest.MockedFunction<
  typeof APIServiceInstance.getExternalLearningsByUrl
>;
const mockGetById = APIServiceInstance.getExternalLearningById as jest.MockedFunction<
  typeof APIServiceInstance.getExternalLearningById
>;
const mockUpdate = APIServiceInstance.updateExternalLearning as jest.MockedFunction<
  typeof APIServiceInstance.updateExternalLearning
>;

describe('externalLearning utils', () => {
  describe('fetchExternalLearningSettings', () => {
    it('fetchSettings_delegatesToAPIService', async () => {
      const settings = { data: { attributes: { enabled: true, coreFields: [] } } };
      mockGetSettings.mockResolvedValue(settings as any);

      const result = await fetchExternalLearningSettings();

      expect(mockGetSettings).toHaveBeenCalledTimes(1);
      expect(result).toBe(settings);
    });

    it('fetchSettings_apiError_propagates', async () => {
      mockGetSettings.mockRejectedValue(new Error('Network Error'));
      await expect(fetchExternalLearningSettings()).rejects.toThrow('Network Error');
    });

    it('fetchSettings_returnsDataWithAttributes', async () => {
      const settings = {
        data: { attributes: { enabled: true, coreFields: [{ id: 'title', type: 'TEXT' }], customFields: [] } },
      };
      mockGetSettings.mockResolvedValue(settings as any);

      const result = await fetchExternalLearningSettings();
      expect(result.data.attributes).toEqual(settings.data.attributes);
    });
  });

  describe('fetchExternalLearnings', () => {
    it('fetchLearnings_delegatesWithParams', async () => {
      const parsed = { externalLearningList: [], links: {} };
      mockGetLearnings.mockResolvedValue(parsed as any);

      const params = { 'page[offset]': '0', 'page[limit]': '10' };
      const result = await fetchExternalLearnings(params);

      expect(mockGetLearnings).toHaveBeenCalledWith(params);
      expect(result).toBe(parsed);
    });

    it('fetchLearnings_apiError_propagates', async () => {
      mockGetLearnings.mockRejectedValue(new Error('Server Error'));
      await expect(fetchExternalLearnings({ 'page[offset]': '0' })).rejects.toThrow('Server Error');
    });

    it('fetchLearnings_withPagination_forwardsCorrectParams', async () => {
      mockGetLearnings.mockResolvedValue({ externalLearningList: [] } as any);

      const params = { 'page[offset]': '10', 'page[limit]': '5' };
      await fetchExternalLearnings(params);

      expect(mockGetLearnings).toHaveBeenCalledWith(params);
    });
  });

  describe('fetchExternalLearningsByUrl', () => {
    it('fetchByUrl_delegatesWithUrl', async () => {
      const parsed = { externalLearningList: [{ id: 'sub:1' }], links: { next: 'https://next.url' } };
      mockGetByUrl.mockResolvedValue(parsed as any);

      const url = 'https://api.test.com/externalLearnings?page[offset]=10';
      const result = await fetchExternalLearningsByUrl(url);

      expect(mockGetByUrl).toHaveBeenCalledWith(url);
      expect(result).toBe(parsed);
    });

    it('fetchByUrl_apiError_propagates', async () => {
      mockGetByUrl.mockRejectedValue(new Error('Timeout'));
      await expect(fetchExternalLearningsByUrl('https://example.com')).rejects.toThrow('Timeout');
    });
  });

  describe('fetchExternalLearningById', () => {
    it('fetchById_delegatesWithId', async () => {
      const parsed = { externalLearning: { id: 'sub:1', status: 'PENDING' } };
      mockGetById.mockResolvedValue(parsed as any);

      const result = await fetchExternalLearningById('sub:1');

      expect(mockGetById).toHaveBeenCalledWith('sub:1');
      expect(result).toBe(parsed);
    });

    it('fetchById_idWithColon_passedThroughUnchanged', async () => {
      mockGetById.mockResolvedValue({} as any);

      await fetchExternalLearningById('abc:123');

      expect(mockGetById).toHaveBeenCalledWith('abc:123');
    });

    it('fetchById_apiError_propagatesStructure', async () => {
      mockGetById.mockRejectedValue({ status: 404, message: 'Not Found' });
      await expect(fetchExternalLearningById('missing:1')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('updateExternalLearning', () => {
    it('update_delegatesWithIdAndPayload', async () => {
      mockUpdate.mockResolvedValue(undefined as any);
      const payload = { data: { type: 'externalLearning', attributes: { fields: [] } } };

      await updateExternalLearning('sub:1', payload);

      expect(mockUpdate).toHaveBeenCalledWith('sub:1', payload);
    });

    it('update_forwardsPayloadVerbatim', async () => {
      mockUpdate.mockResolvedValue(undefined as any);
      const payload = {
        data: {
          type: 'externalLearning',
          attributes: {
            submissionUrl: 'https://file.com/doc.pdf',
            fields: [{ id: 'title', value: 'Test' }],
          },
        },
      };

      await updateExternalLearning('sub:1', payload);

      expect(mockUpdate).toHaveBeenCalledWith('sub:1', payload);
    });

    it('update_apiError_propagates', async () => {
      mockUpdate.mockRejectedValue(new Error('PUT failed'));
      await expect(updateExternalLearning('sub:1', {})).rejects.toThrow('PUT failed');
    });
  });
});
