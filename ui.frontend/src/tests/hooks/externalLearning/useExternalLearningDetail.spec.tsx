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
  fetchExternalLearningById: jest.fn(),
  fetchExternalLearningSettings: jest.fn(),
}));

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://api.test.com/',
    locale: 'en-US',
  })),
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    getUserById: jest.fn(),
  },
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
}));

import { act } from '@testing-library/react';
import { useExternalLearningDetail } from '@hooks/externalLearning';
import * as externalLearningUtils from '@utils/externalLearning';
import * as globalUtils from '@utils/global';
import * as translationService from '@utils/translationService';
import APIServiceInstance from '@common/APIService';
import { createRenderHook } from '../../util/renderHook';

const mockFetchById = externalLearningUtils.fetchExternalLearningById as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearningById>;
const mockFetchSettings = externalLearningUtils.fetchExternalLearningSettings as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearningSettings>;
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<typeof globalUtils.getALMConfig>;
const mockGetUserById = APIServiceInstance.getUserById as jest.MockedFunction<typeof APIServiceInstance.getUserById>;
const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<typeof translationService.GetTranslation>;

function makeSettings(coreFieldOverrides: any[] = []): any {
  return {
    data: {
      attributes: {
        enabled: true,
        coreFields: [
          { id: 'title', type: 'TEXT', enabled: true, mandatory: true, default: true, label: 'alm.externallearning.title', description: '', editable: true, order: 1 },
          { id: 'date', type: 'TIMESTAMP', enabled: true, mandatory: false, default: true, label: 'alm.externallearning.date', description: '', editable: true, order: 2 },
          { id: 'score', type: 'NUMBER', enabled: true, mandatory: false, default: true, label: 'alm.externallearning.score', description: '', editable: true, order: 3 },
          ...coreFieldOverrides,
        ],
        customFields: [],
      },
    },
  };
}

function makeSubmission(overrides: any = {}): any {
  return {
    id: 'sub:1',
    status: 'PENDING',
    modifiedAt: '2026-01-15T10:00:00Z',
    reviewerComment: '',
    reviewerUserId: null,
    fields: [
      { id: 'title', value: 'My Course' },
      { id: 'date', value: { start_date: '2026-01-01T00:00:00Z', end_date: 'null' } },
      { id: 'score', value: { achieved_score: '80', max_score: '100' } },
    ],
    ...overrides,
  };
}

const renderHook = (id = 'sub:1') => createRenderHook(() => useExternalLearningDetail(id));

describe('useExternalLearningDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue({ primeApiURL: 'https://api.test.com/', locale: 'en-US' } as any);
    // resetMocks:true resets all jest.fn() implementations — restore translation key passthrough
    mockGetTranslation.mockImplementation((key: string) => key);
  });

  describe('no id', () => {
    it('emptyId_doesNotFetch_staysLoading', () => {
      const { result } = renderHook('');
      expect(mockFetchById).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('successful fetch without reviewer', () => {
    it('fetchSuccess_setsSubmissionAndEnrichedFields', async () => {
      const submission = makeSubmission();
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.submission).toEqual(submission);
      expect(hookResult.result.current.isLoading).toBe(false);
      expect(hookResult.result.current.errorCode).toBe('');
    });

    it('fetchSuccess_enrichesFieldsWithLabelsFromSettings', async () => {
      const submission = makeSubmission({ fields: [{ id: 'title', value: 'Test Title' }] });
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      const titleField = hookResult.result.current.enrichedFields.find((f: any) => f.id === 'title');
      expect(titleField).toBeDefined();
      expect(titleField.rawValue).toBe('Test Title');
      expect(titleField.type).toBe('TEXT');
    });

    it('fetchSuccess_noReviewerUserId_setsReviewerNameEmpty', async () => {
      mockFetchById.mockResolvedValue({ externalLearning: makeSubmission({ reviewerUserId: null }) } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.reviewerName).toBe('');
      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it('fetchSuccess_setsSettingsFromParsedResponse', async () => {
      const settingsData = makeSettings();
      mockFetchById.mockResolvedValue({ externalLearning: makeSubmission() } as any);
      mockFetchSettings.mockResolvedValue(settingsData as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.settings).toEqual(settingsData.data.attributes);
    });
  });

  describe('successful fetch with reviewer', () => {
    it('fetchSuccess_withReviewerUserId_fetchesReviewerName', async () => {
      const submission = makeSubmission({
        reviewerUserId: { id: 'user:99' },
        status: 'APPROVED',
      });
      // APIServiceInstance.getUserById is the JSON:API-parsed adapter method; the hook reads res.user.name directly.
      const userParsed = { user: { name: 'Jane Reviewer', id: 'user:99' } };

      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);
      mockGetUserById.mockResolvedValue(userParsed as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(mockGetUserById).toHaveBeenCalledWith('user:99');
      expect(hookResult.result.current.reviewerName).toBe('Jane Reviewer');
    });

    it('fetchSuccess_userApiReturnsNoName_setsReviewerNameEmpty', async () => {
      const submission = makeSubmission({ reviewerUserId: { id: 'user:88' } });
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);
      mockGetUserById.mockResolvedValue({ user: {} } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.reviewerName).toBe('');
    });
  });

  describe('field enrichment edge cases', () => {
    it('fieldWithNoSettingsMatch_usesFieldIdAsLabel', async () => {
      const submission = makeSubmission({ fields: [{ id: 'unknown_field', value: 'some value' }] });
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      const field = hookResult.result.current.enrichedFields.find((f: any) => f.id === 'unknown_field');
      expect(field?.label).toBe('unknown_field');
      expect(field?.type).toBe('');
    });

    it('customFieldLabel_localizedRecord_resolvesToLocale', async () => {
      const settingsWithCustom = {
        data: {
          attributes: {
            enabled: true,
            coreFields: [],
            customFields: [
              {
                id: 'cf:1',
                type: 'TEXT',
                enabled: true,
                mandatory: false,
                default: false,
                label: { en_US: 'Custom Field', en_US_alt: 'Alt' },
                description: {},
                editable: true,
                order: 1,
              },
            ],
          },
        },
      };
      const submission = makeSubmission({ fields: [{ id: 'cf:1', value: 'custom value' }] });
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(settingsWithCustom as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      const field = hookResult.result.current.enrichedFields.find((f: any) => f.id === 'cf:1');
      expect(field?.label).toBe('Custom Field');
    });

    it('submissionNullFields_enrichedFieldsEmpty', async () => {
      const submission = makeSubmission({ fields: null });
      mockFetchById.mockResolvedValue({ externalLearning: submission } as any);
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.enrichedFields).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('fetchError_withStatus_setsErrorCode', async () => {
      mockFetchById.mockRejectedValue({ status: 404 });
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe(404);
      expect(hookResult.result.current.isLoading).toBe(false);
    });

    it('fetchError_noStatus_setsGenericErrorCode', async () => {
      mockFetchById.mockRejectedValue(new Error('Network'));
      mockFetchSettings.mockResolvedValue(makeSettings() as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe('error');
    });
  });

});
