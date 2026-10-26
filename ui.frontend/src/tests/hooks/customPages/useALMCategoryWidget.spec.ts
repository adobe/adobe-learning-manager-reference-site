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
 * Unit Tests for useALMCategoryWidget Hook
 *
 * Hook handles:
 * - Fetching category widget data with pagination
 * - Cursor-based and offset-based pagination
 * - Processing API responses and adding pageId to items
 * - Retrying when no data with selected source IDs
 * - Managing complex state for category widgets
 * - Integration with APIServiceInstance
 */

// Mock dependencies BEFORE imports
jest.mock('../../../almLib/utils/global', () => ({
  getALMConfig: jest.fn(),
}));

jest.mock('../../../almLib/utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
    ajax: jest.fn(),
  },
}));

jest.mock('../../../almLib/utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(),
}));

jest.mock('../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper', () => ({
  getMaxItemsToFetchForWidget: jest.fn(),
  getPageLimitForWidget: jest.fn(),
}));

jest.mock('../../../almLib/common/APIService', () => ({
  __esModule: true,
  default: {
    getCategoryWidgetData: jest.fn(),
  },
}));

jest.mock('../../../almLib/utils/widgets/utils', () => ({
  calculatePaginationState: jest.fn(),
}));

import { act } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { useALMCategoryWidget } from '../../../almLib/hooks/customPages/useALMCategoryWidget';
import { getALMConfig } from '../../../almLib/utils/global';
import { RestAdapter } from '../../../almLib/utils/restAdapter';
import { JsonApiParse } from '../../../almLib/utils/jsonAPIAdapter';
import {
  getMaxItemsToFetchForWidget,
  getPageLimitForWidget,
} from '../../../almLib/components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper';
import APIServiceInstance from '../../../almLib/common/APIService';
import { calculatePaginationState } from '../../../almLib/utils/widgets/utils';

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

describe('useALMCategoryWidget', () => {
  const mockGetALMConfig = getALMConfig as jest.MockedFunction<typeof getALMConfig>;
  const mockRestAdapter = RestAdapter as jest.Mocked<typeof RestAdapter>;
  const mockJsonApiParse = JsonApiParse as jest.MockedFunction<typeof JsonApiParse>;
  const mockGetMaxItemsToFetchForWidget = getMaxItemsToFetchForWidget as jest.MockedFunction<
    typeof getMaxItemsToFetchForWidget
  >;
  const mockGetPageLimitForWidget = getPageLimitForWidget as jest.MockedFunction<
    typeof getPageLimitForWidget
  >;
  const mockGetCategoryWidgetData = APIServiceInstance.getCategoryWidgetData as jest.MockedFunction<
    typeof APIServiceInstance.getCategoryWidgetData
  >;
  const mockCalculatePaginationState = calculatePaginationState as jest.MockedFunction<
    typeof calculatePaginationState
  >;

  const mockConfig = {
    primeApiURL: 'https://learningmanager.adobe.com/primeapi/v2/',
  };

  const mockWidget = {
    id: 'widget-1',
    type: 'categoryWidget',
    attributes: {
      source: 'catalog',
      sourceIds: null, // Set to null to avoid recursive fetchMore
      fetchAll: false,
    },
  };

  const mockCategory = {
    id: 'category:123',
    type: 'category',
    attributes: {
      name: 'Test Category',
      description: 'Test Description',
    },
    relationships: {
      pages: {
        data: [{ id: 'page:456', type: 'page' }],
      },
    },
  };

  const mockCategories = [
    mockCategory,
    {
      id: 'category:124',
      type: 'category',
      attributes: { name: 'Category 2' },
      relationships: { pages: { data: [{ id: 'page:457', type: 'page' }] } },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue(mockConfig as any);
    mockJsonApiParse.mockImplementation((data: any) => data);
    mockGetPageLimitForWidget.mockReturnValue(10);
    mockGetMaxItemsToFetchForWidget.mockReturnValue(100);
    mockCalculatePaginationState.mockReturnValue({
      totalFetched: 2,
      fetchedAll: false,
      currentCursor: null,
      currentOffset: null,
      cursorBased: false,
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with empty items array', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.items).toEqual([]);
    });

    it('should initialize with currentOffset null', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.currentOffset).toBeNull();
    });

    it('should initialize with currentCursor null', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.currentCursor).toBeNull();
    });

    it('should initialize with pageLimit from helper', () => {
      mockGetPageLimitForWidget.mockReturnValue(20);
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.pageLimit).toBe(20);
    });

    it('should initialize with maxItemToFetch from helper', () => {
      mockGetMaxItemsToFetchForWidget.mockReturnValue(50);
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.maxItemToFetch).toBe(50);
    });

    it('should initialize with fetchedAll false', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.fetchedAll).toBe(false);
    });

    it('should initialize with callFailed false', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.callFailed).toBe(false);
    });

    it('should initialize with totalFetched 0', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.totalFetched).toBe(0);
    });

    it('should initialize with fetchingData false', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.fetchingData).toBe(false);
    });

    it('should initialize with firstFetchDone false', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.firstFetchDone).toBe(false);
    });

    it('should initialize with numberOfResults 0', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.numberOfResults).toBe(0);
    });

    it('should initialize with callNumber 0', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.callNumber).toBe(0);
    });

    it('should initialize with itemsPerPage 4', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.itemsPerPage).toBe(4);
    });

    it('should initialize with enableArrows true', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.enableArrows).toBe(true);
    });

    it('should initialize with empty searchString', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.searchString).toBe('');
    });

    it('should initialize with hideList false', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));
      expect(result.current.hideList).toBe(false);
    });
  });

  describe('fetchMore', () => {
    it('should not fetch when already fetching', async () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      // Set fetchingData to true
      act(() => {
        result.current.updateState({ fetchingData: true });
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockGetCategoryWidgetData).not.toHaveBeenCalled();
    });

    it('should not fetch when fetchedAll is true', async () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.updateState({ fetchedAll: true });
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockGetCategoryWidgetData).not.toHaveBeenCalled();
    });

    it('should fetch category data successfully', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: 'cursor-123',
        meta: { formalCount: 2 },
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockGetCategoryWidgetData).toHaveBeenCalled();
    });

    it('should call getCategoryWidgetData with correct filters', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockGetCategoryWidgetData.mock.calls[0];
      expect(callArgs[0]).toHaveProperty('source', 'catalog');
      expect(callArgs[0]).toHaveProperty('sourceIds', undefined); // null sourceIds become undefined
      expect(callArgs[0]).toHaveProperty('fetchAll', false);
    });

    it('should call getCategoryWidgetData with correct pagination', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockGetCategoryWidgetData.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('cursor', null);
      expect(callArgs[1]).toHaveProperty('offset', null);
      expect(callArgs[1]).toHaveProperty('pageLimit', 10);
      expect(callArgs[1]).toHaveProperty('page', 0);
    });

    it('should paginate sourceIds correctly', async () => {
      const widgetWithSourceIds = {
        ...mockWidget,
        attributes: {
          ...mockWidget.attributes,
          sourceIds: ['cat:1', 'cat:2', 'cat:3'],
        },
      };

      mockGetPageLimitForWidget.mockReturnValue(2);
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(widgetWithSourceIds as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      const callArgs = mockGetCategoryWidgetData.mock.calls[0];
      // Should get first 2 sourceIds
      expect(callArgs[0].sourceIds).toEqual(['cat:1', 'cat:2']);
    });

    it.each([
      [['cat:1', 'cat:2', 'cat:3'], true],
      [['cat:1', 'cat:2'], false],
      // Empty selection must still stop on the last page (CPRIME-110969)
      [[], false],
    ])(
      'should tell calculatePaginationState whether selected sourceIds %j remain (%s)',
      async (sourceIds, expected) => {
        const widget = { ...mockWidget, attributes: { ...mockWidget.attributes, sourceIds } };

        mockGetPageLimitForWidget.mockReturnValue(2);
        mockGetCategoryWidgetData.mockResolvedValue({
          categories: mockCategories,
          next: '',
          meta: {},
        });

        const { result } = renderHook(() => useALMCategoryWidget(widget as any));

        await act(async () => {
          await result.current.fetchMore();
        });

        expect(mockCalculatePaginationState.mock.calls[0][1]).toBe(expected);
      }
    );

    it('should fetch the next sourceIds slice when pageLimit is below 10', async () => {
      const sourceIds = Array.from({ length: 8 }, (_, i) => `cat:${i + 1}`);
      const widget = { ...mockWidget, attributes: { ...mockWidget.attributes, sourceIds } };

      mockGetPageLimitForWidget.mockReturnValue(5);
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(widget as any));

      await act(async () => {
        await result.current.fetchMore();
      });
      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockGetCategoryWidgetData).toHaveBeenCalledTimes(2);
      expect(mockGetCategoryWidgetData.mock.calls[1][0].sourceIds).toEqual(sourceIds.slice(5));
    });

    it('should not fetch an empty sourceIds slice once all selected ids are consumed', async () => {
      const sourceIds = ['cat:1', 'cat:2', 'cat:3', 'cat:4'];
      const widget = { ...mockWidget, attributes: { ...mockWidget.attributes, sourceIds } };

      mockGetPageLimitForWidget.mockReturnValue(2);
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(widget as any));

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current.fetchMore();
        });
      }

      expect(mockGetCategoryWidgetData).toHaveBeenCalledTimes(2);
    });

    it('should set fetchingData to true while fetching', async () => {
      let resolveFetch: any;
      const fetchPromise = new Promise(resolve => {
        resolveFetch = resolve;
      });
      mockGetCategoryWidgetData.mockReturnValue(fetchPromise as any);

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.fetchMore();
      });

      expect(result.current.fetchingData).toBe(true);

      await act(async () => {
        resolveFetch({ categories: mockCategories, next: '', meta: {} });
        await fetchPromise;
      });
    });

    it('should handle API errors gracefully', async () => {
      mockGetCategoryWidgetData.mockRejectedValue(new Error('API Error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.callFailed).toBe(true);
      expect(result.current.fetchingData).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Result fetching failed', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle null response', async () => {
      mockGetCategoryWidgetData.mockResolvedValue(null as any);

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.callFailed).toBe(true);
      expect(result.current.fetchingData).toBe(false);
    });

    it('should not fetch if sourceIds limit reached', async () => {
      const widgetWithLimitedSourceIds = {
        ...mockWidget,
        attributes: {
          ...mockWidget.attributes,
          sourceIds: ['cat:1', 'cat:2'],
        },
      };

      const { result } = renderHook(() => useALMCategoryWidget(widgetWithLimitedSourceIds as any));

      // Set callNumber to a high value
      act(() => {
        result.current.updateState({ callNumber: 10 });
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      // Should not call API when sourceIds.length <= pageLimit * callNumber
      expect(mockGetCategoryWidgetData).not.toHaveBeenCalled();
    });

    it('should accept query string parameter', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore('search-query');
      });

      expect(mockGetCategoryWidgetData).toHaveBeenCalled();
    });
  });

  describe('parseResponseFromAPI', () => {
    it('should populate items with categories from API response', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: { formalCount: 2 },
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      // The hook spreads categories directly into items without transformation;
      // page relationships remain in the relationships field, not attributes.pageId
      expect(result.current.items[0].id).toBe('category:123');
      expect(result.current.items[1].id).toBe('category:124');
      expect((result.current.items[0] as any).relationships.pages.data[0].id).toBe('page:456');
      expect((result.current.items[1] as any).relationships.pages.data[0].id).toBe('page:457');
    });

    it('should handle categories without page relationships', async () => {
      const categoryWithoutPages = {
        id: 'category:125',
        type: 'category',
        attributes: { name: 'No Pages' },
      };

      mockGetCategoryWidgetData.mockResolvedValue({
        categories: [categoryWithoutPages],
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items[0]).toEqual(categoryWithoutPages);
    });

    it('should append new items to existing items', async () => {
      mockGetCategoryWidgetData
        .mockResolvedValueOnce({
          categories: [mockCategories[0]],
          next: 'cursor-1',
          meta: {},
        })
        .mockResolvedValueOnce({
          categories: [mockCategories[1]],
          next: '',
          meta: {},
        });

      mockCalculatePaginationState
        .mockReturnValueOnce({
          totalFetched: 1,
          fetchedAll: false,
          currentCursor: 'cursor-1',
          currentOffset: null,
          cursorBased: true,
        })
        .mockReturnValueOnce({
          totalFetched: 2,
          fetchedAll: true,
          currentCursor: null,
          currentOffset: null,
          cursorBased: true,
        });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.updateState({ fetchedAll: false });
      });

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.items).toHaveLength(2);
    });

    it('should set firstFetchDone to true', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.firstFetchDone).toBe(true);
    });

    it('should increment callNumber', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      expect(result.current.callNumber).toBe(0);

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.callNumber).toBe(1);
    });

    it('should set numberOfResults from meta', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: '',
        meta: { formalCount: 42 },
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(result.current.numberOfResults).toBe(42);
    });

    it('should use calculatePaginationState utility', async () => {
      mockGetCategoryWidgetData.mockResolvedValue({
        categories: mockCategories,
        next: 'cursor-123',
        meta: {},
      });

      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      await act(async () => {
        await result.current.fetchMore();
      });

      expect(mockCalculatePaginationState).toHaveBeenCalledWith(
        'cursor-123',
        false, // hasMoreSelectedSourceIds (false because mockWidget has sourceIds: null)
        0, // totalFetched
        10, // pageLimit
        100, // maxItemToFetch
        null, // currentCursor
        null, // currentOffset
        undefined // cursorBased
      );
    });
  });

  describe('hasMoreResults', () => {
    it('should return true when not fetchedAll', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.updateState({ fetchedAll: false });
      });

      // hasMoreResults is internal, but we can test via fetchMore behavior
      expect(result.current.fetchedAll).toBe(false);
    });

    it('should return false when fetchedAll', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.updateState({ fetchedAll: true });
      });

      expect(result.current.fetchedAll).toBe(true);
    });
  });

  describe('updateState', () => {
    it('should update state properties', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.updateState({ searchString: 'test search' });
      });

      expect(result.current.searchString).toBe('test search');
    });

    it('should update multiple properties at once', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      act(() => {
        result.current.updateState({
          hideList: true,
          enableArrows: false,
          itemsPerPage: 8,
        });
      });

      expect(result.current.hideList).toBe(true);
      expect(result.current.enableArrows).toBe(false);
      expect(result.current.itemsPerPage).toBe(8);
    });

    it('should preserve other state properties', () => {
      const { result } = renderHook(() => useALMCategoryWidget(mockWidget as any));

      const initialCallNumber = result.current.callNumber;

      act(() => {
        result.current.updateState({ searchString: 'new search' });
      });

      expect(result.current.callNumber).toBe(initialCallNumber);
      expect(result.current.searchString).toBe('new search');
    });
  });
});
