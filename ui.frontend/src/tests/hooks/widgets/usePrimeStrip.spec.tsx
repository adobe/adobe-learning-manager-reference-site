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
/**
 * Unit Tests for usePrimeStrip Hook
 * 
 * This is a complex hook handling:
 * - Multiple widget types (BOOKMARKS, MYLEARNING, ADMIN_RECO, TRENDING_RECO, etc.)
 * - Pagination (cursor and offset-based)
 * - Fetching learning objects/recommendations
 * - Bookmark management
 * - Enrollment handling
 * - Recommendation blocking/unblocking
 * - Item removal from list
 * 
 * Due to the hook's extreme complexity (521 lines, 9 widget types, async state management),
 * these tests focus on:
 * 1. Hook initialization with different widget types
 * 2. Core functionality verification
 * 3. API parameter configuration
 * 4. State management
 * 5. Handler functions
 * 6. Error scenarios
 * 
 * TESTING CHALLENGES:
 * 1. Complex async state updates across multiple renders
 * 2. Deep integration with RestAdapter, JsonApiParse
 * 3. Widget-specific logic branching (9 different types)
 * 4. Pagination state management (cursor vs offset)
 * 5. No useEffect - manual fetchMore() calls required
 * 6. Deep dependencies on global config and account
 * 7. State updates trigger cascading effects
 * 8. Account-specific shuffling and filtering logic
 * 
 * RECOMMENDATION: For comprehensive testing of complex pagination flows and
 * widget-specific behavior, integration tests would be more effective and maintainable.
 */

// Mock dependencies BEFORE imports
jest.mock('../../../almLib/utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    ajax: jest.fn(),
  },
}));

jest.mock('../../../almLib/utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMAccount: jest.fn(),
  getWidgetConfig: jest.fn(),
}));

jest.mock('../../../almLib/utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(),
  JsonApiRelationshipUpdate: jest.fn(),
}));

jest.mock('../../../almLib/utils/lo-utils', () => ({
  enrollTraining: jest.fn(),
  getTraining: jest.fn(),
}));

jest.mock('../../../almLib/utils/translationService', () => ({
  GetTranslation: jest.fn((key) => key),
}));

jest.mock('../../../almLib/utils/widgets/utils', () => ({
  GetTrimmedValues: jest.fn((val) => val),
}));

jest.mock('../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper', () => ({
  getItemIndexFromList: jest.fn(),
  getMaxItemsToFetchForWidget: jest.fn(() => 15),
  getPageLimitForWidget: jest.fn(() => 10),
  shouldShuffleResults: jest.fn(() => false),
  showActionElement: jest.fn(() => false),
  shuffleResults: jest.fn((items) => items),
  updateLOBookmark: jest.fn(),
}));

import { act } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { usePrimeStrip } from '../../../almLib/hooks/widgets/usePrimeStrip';
import { RestAdapter } from '../../../almLib/utils/restAdapter';
import { getALMConfig, getALMAccount, getWidgetConfig } from '../../../almLib/utils/global';
import { JsonApiParse } from '../../../almLib/utils/jsonAPIAdapter';
import { enrollTraining, getTraining } from '../../../almLib/utils/lo-utils';
import { GetTranslation } from '../../../almLib/utils/translationService';
import {
  getItemIndexFromList,
  shouldShuffleResults,
  showActionElement,
  updateLOBookmark,
} from '../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper';

// Custom renderHook implementation for React Testing Library v9
function renderHook<T>(hookCallback: () => T) {
  const result: any = { current: null };

  function TestComponent() {
    result.current = hookCallback();
    return null;
  }

  const container = document.createElement('div');

  if (document.body) {
    document.body.appendChild(container);
  }

  ReactDOM.render(React.createElement(TestComponent), container);

  return {
    result,
    rerender: () => {
      ReactDOM.render(React.createElement(TestComponent), container);
    },
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  };
}

describe('usePrimeStrip', () => {
  const mockGetALMConfig = getALMConfig as jest.MockedFunction<typeof getALMConfig>;
  const mockGetALMAccount = getALMAccount as jest.MockedFunction<typeof getALMAccount>;
  const mockGetWidgetConfig = getWidgetConfig as jest.MockedFunction<typeof getWidgetConfig>;
  const mockRestAdapterGet = RestAdapter.get as jest.MockedFunction<typeof RestAdapter.get>;
  const mockRestAdapterPost = RestAdapter.post as jest.MockedFunction<typeof RestAdapter.post>;
  const mockRestAdapterDelete = RestAdapter.delete as jest.MockedFunction<typeof RestAdapter.delete>;
  const mockRestAdapterAjax = RestAdapter.ajax as jest.MockedFunction<typeof RestAdapter.ajax>;
  const mockJsonApiParse = JsonApiParse as jest.MockedFunction<typeof JsonApiParse>;
  const mockEnrollTraining = enrollTraining as jest.MockedFunction<typeof enrollTraining>;
  const mockGetTraining = getTraining as jest.MockedFunction<typeof getTraining>;
  const mockGetTranslation = GetTranslation as jest.MockedFunction<typeof GetTranslation>;
  const mockGetItemIndexFromList = getItemIndexFromList as jest.MockedFunction<
    typeof getItemIndexFromList
  >;
  const mockShouldShuffleResults = shouldShuffleResults as jest.MockedFunction<
    typeof shouldShuffleResults
  >;
  const mockShowActionElement = showActionElement as jest.MockedFunction<typeof showActionElement>;
  const mockUpdateLOBookmark = updateLOBookmark as jest.MockedFunction<typeof updateLOBookmark>;

  const mockConfig = {
    primeApiURL: 'https://learningmanager.adobe.com/primeapi/v2/',
  };

  const mockAccount = {
    id: 'account-1',
    name: 'Test Account',
    recommendationAccountType: 'CPNEW',
    prlCriteria: { enabled: false },
  };

  const mockWidget = {
    widgetRef: 'com.adobe.captivateprime.lostrip.mylearning',
    attributes: {
      heading: 'My Learning',
    },
  };

  const mockLearningObject = {
    id: 'lo-1',
    type: 'learningObject',
    attributes: {
      name: 'Test Course',
      loType: 'course',
    },
    enrollment: {
      id: 'enrollment-1',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue(mockConfig as any);
    mockGetALMAccount.mockResolvedValue(mockAccount as any);
    mockGetWidgetConfig.mockReturnValue({} as any);
    mockGetTranslation.mockImplementation((key) => key);
    mockShouldShuffleResults.mockReturnValue(false);
    mockShowActionElement.mockReturnValue(false);
  });

  describe('Hook Initialization', () => {
    it('should initialize with empty items array', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.items).toEqual([]);
    });

    it('should initialize with fetchedAll as false', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.fetchedAll).toBe(false);
    });

    it('should initialize with fetchingData as false', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.fetchingData).toBe(false);
    });

    it('should initialize with totalFetched as 0', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.totalFetched).toBe(0);
    });

    it('should initialize with firstFetchDone as false', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.firstFetchDone).toBe(false);
    });

    it('should not fetch data on initialization', () => {
      renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // Should not call API on mount (no useEffect)
      expect(mockRestAdapterGet).not.toHaveBeenCalled();
    });
  });

  describe('hasMoreResults', () => {
    it('should return true when fetchedAll is false', () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      expect(result.current.hasMoreResults()).toBe(true);
    });
  });

  describe('fetchMore - MYLEARNING Widget', () => {
    it('should fetch learning objects for MYLEARNING widget', async () => {
      const mockResponse = {
        data: [mockLearningObject],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockRestAdapterGet).toHaveBeenCalled();
      expect(result.current.items).toHaveLength(1);
    });

    it('should not fetch when fetchedAll is true', async () => {
      const mockResponse = {
        data: [mockLearningObject],
        links: {}, // No next link
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // First fetch sets fetchedAll = true
      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.fetchedAll).toBe(true);
      mockRestAdapterGet.mockClear();

      // Try second fetch after fetchedAll is true
      await act(async () => {
        await result.current.fetchMore();
      });

      // Should not call API again
      expect(mockRestAdapterGet).not.toHaveBeenCalled();
    });
  });

  describe('fetchMore - BOOKMARKS Widget', () => {
    it('should configure API correctly for BOOKMARKS widget', async () => {
      const bookmarksWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.mybookmarks',
        attributes: {},
      };

      const mockResponse = {
        data: [],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePrimeStrip(bookmarksWidget as any, mockAccount as any)
      );

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.bookmarks']).toBe(true);
      expect(callArgs.params['sort']).toBe('name');
    });
  });

  describe('fetchMore - CATALOG Widget', () => {
    it('should configure API correctly for CATALOG widget with catalogIds', async () => {
      const catalogWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
        attributes: {
          catalogIds: ['1', '2'],
          sort: 'name',
        },
      };

      const mockResponse = {
        data: [],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(catalogWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.catalogIds']).toBe('1,2');
      expect(callArgs.params['sort']).toBe('name');
    });
  });

  describe('fetchMore - RECOMMENDATIONS_STRIP Widget', () => {
    it('should use POST method for RECOMMENDATIONS_STRIP widget', async () => {
      const recoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.reco',
        attributes: {
          recommendationConfig: {
            products: [{ name: 'Product A', levels: ['Beginner'] }],
          },
        },
      };

      const mockResponse = {
        data: [],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterAjax.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(recoWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockRestAdapterAjax).toHaveBeenCalled();
      expect(mockRestAdapterAjax.mock.calls[0][0].method).toBe('POST');
    });
  });

  describe('fetchMore - VIRTUAL_COACH Widget', () => {
    it('should configure API correctly for VIRTUAL_COACH widget', async () => {
      const virtualCoachWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.virtualcoach',
        attributes: {},
      };

      const mockResponse = {
        data: [],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePrimeStrip(virtualCoachWidget as any, mockAccount as any)
      );

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect((callArgs.params!['filter.loTypes'] as string[]).length).toBe(1);
      expect((callArgs.params!['filter.loTypes'] as string[])[0]).toBe('jobAid');
      expect((callArgs.params!['filter.jobAidType'])).toBe('AI_COACH');
      expect((callArgs.params!['sort'])).toBe('-date');
    });
  });

  describe('fetchMore - Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockRestAdapterGet.mockRejectedValue(new Error('API Error'));

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.callFailed).toBe(true);
    });
  });

  describe('fetchMore - Pagination', () => {
    it('should handle cursor-based pagination', async () => {
      const mockResponse1 = {
        data: [mockLearningObject],
        links: { next: 'https://api.example.com?page[cursor]=abc123' },
      };

      const mockResponse2 = {
        data: [{ ...mockLearningObject, id: 'lo-2' }],
        links: {},
      };

      mockJsonApiParse
        .mockReturnValueOnce({
          learningObjectList: [mockLearningObject],
          links: { next: 'https://api.example.com?page[cursor]=abc123' },
        } as any)
        .mockReturnValueOnce({
          learningObjectList: [{ ...mockLearningObject, id: 'lo-2' }],
          links: {},
        } as any);

      mockRestAdapterGet
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // First fetch
      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.currentCursor).toBe('abc123');

      // Second fetch
      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(2);
    });

    it('should handle offset-based pagination', async () => {
      const mockResponse1 = {
        data: [mockLearningObject],
        links: { next: 'https://api.example.com?page[offset]=10' },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: { next: 'https://api.example.com?page[offset]=10' },
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse1);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.currentOffset).toBe('10');
    });

    it('should set fetchedAll to true when no next link', async () => {
      const mockResponse = {
        data: [mockLearningObject],
        links: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.fetchedAll).toBe(true);
      expect(result.current.hasMoreResults()).toBe(false);
    });
  });

  describe('addBookmarkHandler', () => {
    it('should add bookmark successfully', async () => {
      mockRestAdapterPost.mockResolvedValue({});
      mockUpdateLOBookmark.mockReturnValue([
        { ...mockLearningObject, bookmarked: true },
      ] as any);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // Add an item first
      await act(async () => {
        result.current.items.push(mockLearningObject as any);
      });

      await act(async () => {
        await result.current.addBookmarkHandler('lo-1');
      });

      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: 'https://learningmanager.adobe.com/primeapi/v2//learningObjects/lo-1/bookmark',
        method: 'POST',
      });
      expect(mockUpdateLOBookmark).toHaveBeenCalled();
    });

    it('should throw error on bookmark failure', async () => {
      mockRestAdapterPost.mockRejectedValue(new Error('Bookmark failed'));

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await expect(result.current.addBookmarkHandler('lo-1')).rejects.toThrow();
      });
    });
  });

  describe('removeBookmarkHandler', () => {
    it('should remove bookmark successfully', async () => {
      mockRestAdapterDelete.mockResolvedValue({});
      mockUpdateLOBookmark.mockReturnValue([
        { ...mockLearningObject, bookmarked: false },
      ] as any);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.removeBookmarkHandler('lo-1');
      });

      expect(mockRestAdapterDelete).toHaveBeenCalledWith({
        url: 'https://learningmanager.adobe.com/primeapi/v2//learningObjects/lo-1/bookmark',
        method: 'DELETE',
      });
    });

    it('should throw error on remove bookmark failure', async () => {
      mockRestAdapterDelete.mockRejectedValue(new Error('Remove bookmark failed'));

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await expect(result.current.removeBookmarkHandler('lo-1')).rejects.toThrow();
      });
    });
  });

  describe('removeItemFromList', () => {
    it('should remove item from list', async () => {
      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // Add items
      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject, { ...mockLearningObject, id: 'lo-2' }],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({
        data: [mockLearningObject, { ...mockLearningObject, id: 'lo-2' }],
        links: {},
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(2);

      // Remove one item
      await act(async () => {
        result.current.removeItemFromList('lo-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('lo-2');
    });
  });

  describe('blockLORecommendationHandler', () => {
    it('should block recommendation successfully', async () => {
      mockRestAdapterPost.mockResolvedValue({});

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.blockLORecommendationHandler('lo-1');
      });

      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: 'https://learningmanager.adobe.com/primeapi/v2//recommendationPreferences/learningObjects/lo-1/ignore',
        method: 'POST',
      });
    });

    it('should throw error on block failure', async () => {
      mockRestAdapterPost.mockRejectedValue(new Error('Block failed'));

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await expect(result.current.blockLORecommendationHandler('lo-1')).rejects.toThrow();
      });
    });
  });

  describe('unblockLORecommendationHandler', () => {
    it('should unblock recommendation successfully', async () => {
      mockRestAdapterDelete.mockResolvedValue({});

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.unblockLORecommendationHandler('lo-1');
      });

      expect(mockRestAdapterDelete).toHaveBeenCalledWith({
        url: 'https://learningmanager.adobe.com/primeapi/v2//recommendationPreferences/learningObjects/lo-1/ignore',
        method: 'DELETE',
      });
    });
  });

  describe('updateLearningObject', () => {
    it('should update learning object successfully', async () => {
      const updatedLO = { ...mockLearningObject, attributes: { name: 'Updated Course' } };
      mockGetTraining.mockResolvedValue(updatedLO as any);
      mockGetItemIndexFromList.mockReturnValue(0);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // Add items first
      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({
        data: [mockLearningObject],
        links: {},
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      // Update
      let updatedResult;
      await act(async () => {
        updatedResult = await result.current.updateLearningObject('lo-1');
      });

      expect(mockGetTraining).toHaveBeenCalledWith('lo-1', expect.any(String));
      expect(updatedResult).toEqual(updatedLO);
    });

    it('should throw error on update failure', async () => {
      mockGetTraining.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await expect(result.current.updateLearningObject('lo-1')).rejects.toThrow();
      });
    });
  });

  describe('enrollmentHandler', () => {
    it('should enroll and update learning object', async () => {
      const updatedLO = {
        ...mockLearningObject,
        enrollment: { id: 'enrollment-1', state: 'active' },
      };
      mockEnrollTraining.mockResolvedValue({});
      mockGetTraining.mockResolvedValue(updatedLO as any);
      mockGetItemIndexFromList.mockReturnValue(0);

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      // Add items first
      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({
        data: [mockLearningObject],
        links: {},
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      // Enroll
      let enrollmentResult;
      await act(async () => {
        enrollmentResult = await result.current.enrollmentHandler('lo-1', 'instance-1', {});
      });

      expect(mockEnrollTraining).toHaveBeenCalledWith('lo-1', 'instance-1', {});
      expect(mockGetTraining).toHaveBeenCalledWith('lo-1', expect.any(String));
      expect(enrollmentResult).toEqual(updatedLO);
    });

    it('should throw translated error on enrollment failure', async () => {
      mockEnrollTraining.mockRejectedValue(new Error('Enrollment failed'));
      mockGetTranslation.mockReturnValue('Enrollment error message');

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await expect(
          result.current.enrollmentHandler('lo-1', 'instance-1', {})
        ).rejects.toThrow('Enrollment error message');
      });

      expect(mockGetTranslation).toHaveBeenCalledWith('alm.enrollment.error');
    });
  });

  describe('Widget Type Configuration', () => {
    it('should configure ADMIN_RECO widget correctly', async () => {
      const adminRecoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.adminreco',
        attributes: {},
      };

      mockJsonApiParse.mockReturnValue({
        recommendationList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() =>
        usePrimeStrip(adminRecoWidget as any, mockAccount as any)
      );

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.recType']).toBe('announcement');
    });

    it('should configure TRENDING_RECO widget correctly', async () => {
      const trendingWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.trending',
        attributes: {},
      };

      mockJsonApiParse.mockReturnValue({
        recommendationList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(trendingWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.recType']).toBe('peer_group');
    });

    it('should configure AOI_RECO widget correctly', async () => {
      const aoiWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.myinterest',
        attributes: {
          view: 'consolidated',
        },
      };

      mockJsonApiParse.mockReturnValue({
        recommendationList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(aoiWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.recType']).toBe('skill_interest');
    });

    it('should configure SEARCH widget with query', async () => {
      const searchWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.search',
        attributes: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(searchWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.url).toContain('/learningObjects');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle shuffle results when configured', async () => {
      mockShouldShuffleResults.mockReturnValue(true);
      const shuffledItems = [{ ...mockLearningObject, id: 'shuffled-1' }];
      const mockShuffleResults = require('../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper')
        .shuffleResults as jest.Mock;
      mockShuffleResults.mockReturnValue(shuffledItems);

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [mockLearningObject], links: {} });

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockShuffleResults).toHaveBeenCalled();
    });

    it('should add action element when fetchedAll and showActionElement returns true', async () => {
      mockShowActionElement.mockReturnValue(true);

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [mockLearningObject],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [mockLearningObject], links: {} });

      const { result } = renderHook(() => usePrimeStrip(mockWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(2); // 1 LO + 1 action element
      expect((result.current.items[1] as any).actionElement).toBe(true);
    });

    it('should filter catalog list to exclude default catalog', async () => {
      const catalogBrowserWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.browsecatalog',
        attributes: {},
      };

      mockJsonApiParse.mockReturnValue({
        catalogList: [
          { id: 'cat-1', isDefault: false },
          { id: 'cat-2', isDefault: true },
          { id: 'cat-3', isDefault: false },
        ],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() =>
        usePrimeStrip(catalogBrowserWidget as any, mockAccount as any)
      );

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(2); // Only non-default catalogs
    });
  });

  describe('Widget Configuration Edge Cases', () => {
    it('should handle CATALOG widget with skillName filter', async () => {
      const catalogWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
        attributes: {
          skillName: ['JavaScript', 'React'],
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(catalogWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.skillName']).toBe('JavaScript,React');
    });

    it('should handle CATALOG widget with tagName filter', async () => {
      const catalogWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
        attributes: {
          tagName: ['beginner', 'advanced'],
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(catalogWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.tagName']).toBe('beginner,advanced');
    });

    it('should handle CATALOG widget with loTypes filter', async () => {
      const catalogWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
        attributes: {
          loTypes: ['course', 'certification'],
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(catalogWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.loTypes']).toBe('course,certification');
    });

    it('should handle CATALOG widget with progress sort and partition order', async () => {
      const catalogWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
        attributes: {
          sort: 'progress',
          preferredSortPartitionOrder: ['enrolled', 'started'],
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(catalogWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['preferredSortPartitionOrder']).toBe('enrolled,started');
    });

    it('should handle AOI_RECO widget with multi_skill_interest view', async () => {
      const aoiWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.myinterest',
        attributes: {
          view: 'multi_view',
          stripNum: 2,
        },
      };

      mockJsonApiParse.mockReturnValue({
        recommendationList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(aoiWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.recType']).toBe('multi_skill_interest');
      expect(callArgs.params['strip']).toBe(2);
    });

    it('should handle SEARCH widget without query', async () => {
      const searchWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.search',
        attributes: {},
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(searchWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['sort']).toBe('-date');
    });

    it('should handle RECOMMENDATIONS_STRIP with roles config', async () => {
      const recoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.reco',
        attributes: {
          recommendationConfig: {
            roles: [{ name: 'Developer', levels: ['Intermediate'] }],
          },
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterAjax.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(recoWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockRestAdapterAjax).toHaveBeenCalled();
    });

    it('should handle RECOMMENDATIONS_STRIP with skills config', async () => {
      const recoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.reco',
        attributes: {
          recommendationConfig: {
            skills: [{ name: 'JavaScript' }],
          },
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterAjax.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(recoWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockRestAdapterAjax).toHaveBeenCalled();
    });

    it('should handle RECOMMENDATIONS_STRIP with CPENEW account type and prlCriteria enabled', async () => {
      const accountWithPrl = {
        ...mockAccount,
        recommendationAccountType: 'CPENEW',
        prlCriteria: { enabled: true },
      };

      const recoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.reco',
        attributes: {
          recommendationConfig: {},
        },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: [],
        links: {},
      } as any);

      mockRestAdapterAjax.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() => usePrimeStrip(recoWidget as any, accountWithPrl as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterAjax.mock.calls[0][0];
      expect(callArgs.params['enforcedFields[learningObject]']).toContain('products');
    });

    it('should handle CATALOG_BROWSER widget', async () => {
      const catalogBrowserWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.browsecatalog',
        attributes: {
          catalogIds: ['1', '2'],
        },
      };

      mockGetWidgetConfig.mockReturnValue({
        ignoreHigherOrderLOEnrollment: true,
      } as any);

      mockJsonApiParse.mockReturnValue({
        catalogList: [{ id: 'cat-1', isDefault: false }],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });

      const { result } = renderHook(() =>
        usePrimeStrip(catalogBrowserWidget as any, mockAccount as any)
      );

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.params['filter.ignoreHigherOrderLOEnrollment']).toBe(true);
    });
  });

  describe('Pagination with maxItemToFetch', () => {
    it('should stop fetching when maxItemToFetch is reached', async () => {
      const mockGetMaxItemsToFetchForWidget = require('../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper')
        .getMaxItemsToFetchForWidget as jest.Mock;
      const mockGetPageLimitForWidget = require('../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper')
        .getPageLimitForWidget as jest.Mock;

      mockGetMaxItemsToFetchForWidget.mockReturnValue(15);
      mockGetPageLimitForWidget.mockReturnValue(10);

      const mockResponse = {
        data: Array.from({ length: 10 }, (_, i) => ({
          ...mockLearningObject,
          id: `lo-${i}`,
        })),
        links: { next: 'https://api.example.com?page[offset]=10' },
      };

      mockJsonApiParse.mockReturnValue({
        learningObjectList: Array.from({ length: 10 }, (_, i) => ({
          ...mockLearningObject,
          id: `lo-${i}`,
        })),
        links: { next: 'https://api.example.com?page[offset]=10' },
      } as any);

      mockRestAdapterGet.mockResolvedValue(mockResponse);

      // Create a widget that will hit maxItemToFetch
      const recoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.reco',
        attributes: {
          recommendationConfig: {},
        },
      };

      mockRestAdapterAjax.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePrimeStrip(recoWidget as any, mockAccount as any));

      // First fetch (10 items)
      mockJsonApiParse.mockReturnValue({
        learningObjectList: Array.from({ length: 10 }, (_, i) => ({
          ...mockLearningObject,
          id: `lo-${i}`,
        })),
        links: { next: 'https://api.example.com?page[cursor]=abc' },
      } as any);

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.totalFetched).toBe(10);
      expect(result.current.fetchedAll).toBe(false);

      // Second fetch would exceed maxItemToFetch (15)
      mockJsonApiParse.mockReturnValue({
        learningObjectList: Array.from({ length: 10 }, (_, i) => ({
          ...mockLearningObject,
          id: `lo-second-${i}`,
        })),
        links: { next: 'https://api.example.com?page[cursor]=def' },
      } as any);

      await act(async () => {
        await result.current.fetchMore();
      });

      // Should set fetchedAll to true because totalFetched (20) >= maxItemToFetch (15)
      expect(result.current.fetchedAll).toBe(true);
    });
  });

  describe('Update Learning Object for Recommendations', () => {
    it('should update recommendation learningObject relationship', async () => {
      const mockRecommendation = {
        id: 'reco-1',
        type: 'recommendation',
        learningObject: {
          id: 'lo-1',
          type: 'learningObject',
        },
      };

      const updatedLO = {
        ...mockLearningObject,
        enrollment: { id: 'enrollment-new' },
      };

      mockGetTraining.mockResolvedValue(updatedLO as any);
      mockGetItemIndexFromList.mockReturnValue(0);

      // Use ADMIN_RECO widget which returns recommendations, not LOs
      const adminRecoWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.adminreco',
        attributes: {},
      };

      const { result } = renderHook(() =>
        usePrimeStrip(adminRecoWidget as any, mockAccount as any)
      );

      // Add recommendation items first
      mockJsonApiParse.mockReturnValue({
        recommendationList: [mockRecommendation],
        links: {},
      } as any);

      mockRestAdapterGet.mockResolvedValue({
        data: [mockRecommendation],
        links: {},
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.isPrimeLearningObjectList).toBe(false);

      // Update
      await act(async () => {
        await result.current.updateLearningObject('lo-1');
      });

      expect(mockGetTraining).toHaveBeenCalledWith('lo-1', expect.any(String));
    });
  });

  describe('fetchMore - PERSONALIZED_PATH_STRIP Widget', () => {
    it('should call /personalizedPaths endpoint with skills and enrollment includes', async () => {
      const plpWidget = {
        widgetRef: 'com.adobe.captivateprime.lostrip.personalizedpathstrip',
        attributes: {},
      };

      mockRestAdapterGet.mockResolvedValue({ data: [], links: {} });
      (JsonApiParse as jest.Mock).mockReturnValue({ learningObjectList: [], links: {} } as any);

      const { result } = renderHook(() => usePrimeStrip(plpWidget as any, mockAccount as any));

      await act(async () => {
        await result.current.fetchMore();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const callArgs = mockRestAdapterGet.mock.calls[0][0];
      expect(callArgs.url).toContain('/personalizedPaths');
      expect(callArgs.params['include']).toContain('skills.skillLevel.skill');
      expect(callArgs.params['include']).toContain('enrollment');
    });
  });
});

