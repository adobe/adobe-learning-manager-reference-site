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
  fetchExternalLearnings: jest.fn(),
  fetchExternalLearningsByUrl: jest.fn(),
}));

import { act } from '@testing-library/react';
import { useExternalLearning } from '@hooks/externalLearning';
import * as externalLearningUtils from '@utils/externalLearning';
import { createRenderHook } from '../../util/renderHook';

const mockFetchExternalLearnings = externalLearningUtils.fetchExternalLearnings as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearnings>;
const mockFetchExternalLearningsByUrl = externalLearningUtils.fetchExternalLearningsByUrl as jest.MockedFunction<typeof externalLearningUtils.fetchExternalLearningsByUrl>;

function makeSubmission(overrides: any = {}): any {
  return {
    id: 'sub:1',
    status: 'PENDING',
    modifiedAt: '2026-01-15T10:00:00Z',
    fields: [{ id: 'title', value: 'My Learning' }],
    ...overrides,
  };
}

const renderHook = () => createRenderHook(() => useExternalLearning());

describe('useExternalLearning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial load', () => {
    it('initialLoad_success_setsSubmissionsFromResponse', async () => {
      const submissions = [makeSubmission(), makeSubmission({ id: 'sub:2' })];
      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: submissions,
        links: { next: '' },
      } as any);

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook();
      });

      expect(hookResult.result.current.submissions).toHaveLength(2);
      expect(hookResult.result.current.isLoading).toBe(false);
      expect(hookResult.result.current.errorCode).toBe('');
    });

    it('initialLoad_callsFetchWithCorrectPaginationParams', async () => {
      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [],
        links: {},
      } as any);

      await act(async () => { renderHook(); });

      expect(mockFetchExternalLearnings).toHaveBeenCalledWith({
        'page[offset]': '0',
        'page[limit]': '10',
      });
    });

    it('initialLoad_setsNextLinkFromResponse', async () => {
      const nextUrl = 'https://api.test.com/externalLearnings?page[offset]=10';
      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [makeSubmission()],
        links: { next: nextUrl },
      } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.hasMore).toBe(true);
    });

    it('initialLoad_noNextLink_hasMoreIsFalse', async () => {
      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [],
        links: { next: '' },
      } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.hasMore).toBe(false);
    });

    it('initialLoad_emptyResponse_setsEmptySubmissions', async () => {
      mockFetchExternalLearnings.mockResolvedValue({} as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.submissions).toEqual([]);
    });

    it('initialLoad_apiError_setsErrorCode', async () => {
      mockFetchExternalLearnings.mockRejectedValue({ status: 500 });

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe(500);
      expect(hookResult.result.current.isLoading).toBe(false);
    });

    it('initialLoad_apiErrorNoStatus_setsGenericErrorCode', async () => {
      mockFetchExternalLearnings.mockRejectedValue(new Error('Unknown'));

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      expect(hookResult.result.current.errorCode).toBe('error');
    });
  });

  describe('loadMore', () => {
    it('loadMore_withNextLink_appendsNewSubmissions', async () => {
      const initial = [makeSubmission({ id: 'sub:1' })];
      const more = [makeSubmission({ id: 'sub:2' }), makeSubmission({ id: 'sub:3' })];
      const nextUrl = 'https://api.test.com/externalLearnings?page[offset]=10';

      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: initial,
        links: { next: nextUrl },
      } as any);
      mockFetchExternalLearningsByUrl.mockResolvedValue({
        externalLearningList: more,
        links: { next: '' },
      } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });
      await act(async () => { await hookResult.result.current.loadMore(); });

      expect(mockFetchExternalLearningsByUrl).toHaveBeenCalledWith(nextUrl);
      expect(hookResult.result.current.submissions).toHaveLength(3);
      expect(hookResult.result.current.hasMore).toBe(false);
    });

    it('loadMore_withNoNextLink_doesNotFetch', async () => {
      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [],
        links: { next: '' },
      } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });
      await act(async () => { await hookResult.result.current.loadMore(); });

      expect(mockFetchExternalLearningsByUrl).not.toHaveBeenCalled();
    });

    it('loadMore_updatesNextLink_allowsChainedPages', async () => {
      const page1Next = 'https://api.test.com/el?offset=10';
      const page2Next = 'https://api.test.com/el?offset=20';

      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [makeSubmission({ id: 'sub:1' })],
        links: { next: page1Next },
      } as any);
      mockFetchExternalLearningsByUrl
        .mockResolvedValueOnce({
          externalLearningList: [makeSubmission({ id: 'sub:2' })],
          links: { next: page2Next },
        } as any)
        .mockResolvedValueOnce({
          externalLearningList: [makeSubmission({ id: 'sub:3' })],
          links: { next: '' },
        } as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });
      await act(async () => { await hookResult.result.current.loadMore(); });
      await act(async () => { await hookResult.result.current.loadMore(); });

      expect(hookResult.result.current.submissions).toHaveLength(3);
      expect(hookResult.result.current.hasMore).toBe(false);
    });

    it('loadMore_apiError_logsErrorAndDoesNotCrash', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const nextUrl = 'https://api.test.com/el?offset=10';

      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [makeSubmission()],
        links: { next: nextUrl },
      } as any);
      mockFetchExternalLearningsByUrl.mockRejectedValue(new Error('Network failure'));

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });
      await act(async () => { await hookResult.result.current.loadMore(); });

      expect(consoleSpy).toHaveBeenCalled();
      expect(hookResult.result.current.submissions).toHaveLength(1);
      consoleSpy.mockRestore();
    });

    it('loadMore_setsIsLoadingMoreDuringFetch', async () => {
      let resolveLoadMore: (v: any) => void;
      const loadMorePromise = new Promise((res) => { resolveLoadMore = res; });

      mockFetchExternalLearnings.mockResolvedValue({
        externalLearningList: [],
        links: { next: 'https://api.test.com/el?offset=10' },
      } as any);
      mockFetchExternalLearningsByUrl.mockReturnValue(loadMorePromise as any);

      let hookResult: any;
      await act(async () => { hookResult = renderHook(); });

      act(() => { hookResult.result.current.loadMore(); });
      expect(hookResult.result.current.isLoadingMore).toBe(true);

      await act(async () => { resolveLoadMore!({ externalLearningList: [], links: {} }); });
      expect(hookResult.result.current.isLoadingMore).toBe(false);
    });
  });
});
