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
 * Unit tests for useBadges hook
 * Tests badge fetching, pagination, and download functionality
 */

// Mock dependencies BEFORE imports to prevent circular dependency issues
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://test.api.com/primeapi/v2',
    commerceURL: 'https://test.commerce.com',
    graphqlProxyPath: 'https://test.graphql.com',
    locale: 'en-US',
    accountId: 'test-account',
  })),
  getALMObject: jest.fn(() => ({
    storage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
    isPrimeUserLoggedIn: jest.fn(() => true),
  })),
  getALMUser: jest.fn(() => Promise.resolve({ user: { id: 'user:123' } })),
  getALMAttribute: jest.fn(),
  getQueryParamsFromUrl: jest.fn(() => ({})),
}));
jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(data => (typeof data === 'string' ? JSON.parse(data).data : data.data)),
}));
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(key => key),
  GetTranslationReplaced: jest.fn(),
  getPreferredLocalizedMetadata: jest.fn(),
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    getUsersBadges: jest.fn(),
    loadMore: jest.fn(),
    get: jest.fn(),
  },
}));

import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useBadges } from '@hooks/badges/useBadges';
import APIServiceInstance from '@common/APIService';
import * as globalUtils from '@utils/global';
import * as restAdapterModule from '@utils/restAdapter';
import * as jsonAPIAdapter from '@utils/jsonAPIAdapter';
import { COMPLETED_IC } from '@utils/constants';

// Custom renderHook implementation for React Testing Library v9
function renderHook<T>(hookCallback: () => T, options?: { wrapper?: React.ComponentType<any> }) {
  const result: any = { current: null };

  function TestComponent() {
    result.current = hookCallback();
    return null;
  }

  const Wrapper = options?.wrapper || React.Fragment;
  const container = document.createElement('div');

  if (document.body) {
    document.body.appendChild(container);
  }

  const component = React.createElement(Wrapper, null, React.createElement(TestComponent));

  ReactDOM.render(component, container);

  return {
    result,
    rerender: () => {
      const newComponent = React.createElement(Wrapper, null, React.createElement(TestComponent));
      ReactDOM.render(newComponent, container);
    },
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
      if (document.body && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    },
  };
}

// Mock dependencies
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;
const mockGetALMObject = globalUtils.getALMObject as jest.MockedFunction<
  typeof globalUtils.getALMObject
>;
const mockGetALMUser = globalUtils.getALMUser as jest.MockedFunction<typeof globalUtils.getALMUser>;
const mockRestAdapter = restAdapterModule.RestAdapter as jest.Mocked<
  typeof restAdapterModule.RestAdapter
>;
const mockJsonApiParse = jsonAPIAdapter.JsonApiParse as jest.MockedFunction<
  typeof jsonAPIAdapter.JsonApiParse
>;

// Mock Redux store
const createMockStore = (initialState: any) => {
  return createStore(() => initialState);
};

// Mock wrapper for Redux
const createWrapper = (store: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useBadges', () => {
  let mockStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock setup
    mockGetALMConfig.mockReturnValue({
      primeApiURL: 'https://test.api.com/',
    } as any);

    mockGetALMObject.mockReturnValue({
      isPrimeUserLoggedIn: jest.fn().mockReturnValue(true),
    } as any);

    mockGetALMUser.mockResolvedValue({
      user: { id: 'user-123' },
    } as any);

    // Default Redux store
    mockStore = createMockStore({
      badge: {
        badges: [],
        next: '',
      },
    });
  });

  afterEach(() => {
    // Restore all mocks to prevent interference between tests
    jest.restoreAllMocks();
    // Clear all timers if they were set up
    if (jest.isMockFunction(setTimeout)) {
      jest.useRealTimers();
    }
  });

  // ==========================================
  // Badge Fetching
  // ==========================================

  describe('Badge Fetching', () => {
    it('should fetch badges on mount', async () => {
      const mockBadges = [
        { id: 'badge:1', name: 'Badge 1' },
        { id: 'badge:2', name: 'Badge 2' },
      ];

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: mockBadges,
        links: { next: '' },
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(APIServiceInstance.getUsersBadges).toHaveBeenCalledWith('user-123', {
        'page[offset]': 0,
        'page[limit]': 10,
        include: 'badge,model,model.skill',
        sort: '-dateAchieved',
      });
    });

    it('should not fetch badges when user not logged in', async () => {
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: jest.fn().mockReturnValue(false),
      } as any);

      renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(APIServiceInstance.getUsersBadges).not.toHaveBeenCalled();
      });
    });

    it('should not fetch badges when no userId', async () => {
      mockGetALMUser.mockResolvedValue({
        user: { id: null },
      } as any);

      renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(APIServiceInstance.getUsersBadges).not.toHaveBeenCalled();
      });
    });

    it('should handle API error gracefully', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockRejectedValue(new Error('API Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching badges: ', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should dispatch loadBadges with empty array on error', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockRejectedValue(new Error('API Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      // Wait for the error to be logged
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching badges: ', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should handle response without badgeList', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        links: { next: 'https://next.url' },
      });

      renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(APIServiceInstance.getUsersBadges).toHaveBeenCalled();
      });
    });

    it('should handle response without next link', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [{ id: 'badge:1' }],
        links: {},
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(APIServiceInstance.getUsersBadges).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Pagination
  // ==========================================

  describe('Pagination', () => {
    it('should load more badges when next URL exists', async () => {
      const storeWithNext = createMockStore({
        badge: {
          badges: [{ id: 'badge:1' }],
          next: 'https://next.url',
        },
      });

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      (APIServiceInstance.loadMore as jest.Mock).mockResolvedValue({
        userBadgeList: [{ id: 'badge:2' }],
        links: { next: '' },
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(storeWithNext),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMoreBadge();
      });

      expect(APIServiceInstance.loadMore).toHaveBeenCalledWith('https://next.url');
    });

    it('should not load more when no next URL', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      await act(async () => {
        await result.current.loadMoreBadge();
      });

      expect(APIServiceInstance.loadMore).not.toHaveBeenCalled();
    });

    it('should handle loadMore with empty userBadgeList', async () => {
      const storeWithNext = createMockStore({
        badge: {
          badges: [{ id: 'badge:1' }],
          next: 'https://next.url',
        },
      });

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      (APIServiceInstance.loadMore as jest.Mock).mockResolvedValue({
        links: { next: '' },
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(storeWithNext),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMoreBadge();
      });

      expect(APIServiceInstance.loadMore).toHaveBeenCalled();
    });
  });

  // ==========================================
  // PDF Download
  // ==========================================

  describe('PDF Download', () => {
    it('should initiate PDF download and poll for completion', async () => {
      jest.useFakeTimers();

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      mockRestAdapter.post = jest.fn().mockResolvedValue({});
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      mockJsonApiParse.mockReturnValueOnce({ job: { id: 'job-123' } } as any).mockReturnValueOnce({
        job: {
          id: 'job-123',
          status: {
            code: COMPLETED_IC,
            data: { s3Url: 'https://s3.amazonaws.com/badge.pdf' },
          },
        },
      } as any);

      const mockLink = {
        href: '',
        download: '',
        target: '',
        style: { display: '' },
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement(tagName);
      });
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        result.current.handleDownloadPdfClick(mockEvent, 'badge-123');
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      expect(mockRestAdapter.post).toHaveBeenCalledWith({
        url: 'https://test.api.com/jobs',
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'job',
            attributes: {
              description: '',
              jobType: 'generateUserBadge',
              payload: {
                userBadgeId: 'badge-123',
              },
            },
          },
        }),
        headers: {
          'content-type': 'application/json',
        },
      });

      // Advance the poll interval so the job resolves as COMPLETED and the hook
      // clears its own interval. Without this the interval leaks and can fire
      // during a later test, causing flaky failures under CI load.
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockRestAdapter.get).toHaveBeenCalledWith({
          url: 'https://test.api.com/jobs/job-123',
        });
      });

      jest.useRealTimers();
    });

    it('should poll and download when job completes', async () => {
      jest.useFakeTimers();

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      mockRestAdapter.post = jest.fn().mockResolvedValue({});
      mockRestAdapter.get = jest.fn().mockResolvedValue({});

      mockJsonApiParse.mockReturnValueOnce({ job: { id: 'job-123' } } as any).mockReturnValueOnce({
        job: {
          id: 'job-123',
          status: {
            code: COMPLETED_IC,
            data: { s3Url: 'https://s3.amazonaws.com/badge.pdf' },
          },
        },
      } as any);

      const mockLink = {
        href: '',
        download: '',
        target: '',
        style: { display: '' },
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement(tagName);
      });
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        result.current.handleDownloadPdfClick(mockEvent, 'badge-123');
      });

      // Advance timers to trigger the first poll
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockRestAdapter.get).toHaveBeenCalledWith({
          url: 'https://test.api.com/jobs/job-123',
        });
      });

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.href).toBe('https://s3.amazonaws.com/badge.pdf');

      jest.useRealTimers();
    });

    it('should handle PDF download error', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      mockRestAdapter.post = jest.fn().mockRejectedValue(new Error('API Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        await result.current.handleDownloadPdfClick(mockEvent, 'badge-123');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: ', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should create download link with correct attributes', async () => {
      jest.useFakeTimers();

      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      mockRestAdapter.post = jest.fn().mockResolvedValue({});
      mockRestAdapter.get = jest.fn().mockResolvedValue({});

      mockJsonApiParse.mockReturnValueOnce({ job: { id: 'job-123' } } as any).mockReturnValueOnce({
        job: {
          id: 'job-123',
          status: {
            code: COMPLETED_IC,
            data: { s3Url: 'https://s3.amazonaws.com/badge.pdf' },
          },
        },
      } as any);

      const mockLink = {
        href: '',
        download: '',
        target: '',
        style: { display: '' },
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement(tagName);
      });
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        result.current.handleDownloadPdfClick(mockEvent, 'badge-123');
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockLink.target).toBe('_blank');
        expect(mockLink.style.display).toBe('none');
        expect(mockLink.setAttribute).toHaveBeenCalledWith('download', '');
      });

      jest.useRealTimers();
    });
  });

  // ==========================================
  // Image Download
  // ==========================================

  describe('Image Download', () => {
    it('should download image successfully', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      const mockBlob = new Blob(['image data'], { type: 'image/png' });
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/image');

      const mockLink = {
        href: '',
        download: '',
        target: '',
        style: { display: '' },
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement(tagName);
      });
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        await result.current.handleDownloadImgClick(mockEvent, 'https://test.com/badge.png');
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      expect(global.fetch).toHaveBeenCalledWith('https://test.com/badge.png');
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should handle image download error', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        await result.current.handleDownloadImgClick(mockEvent, 'https://test.com/badge.png');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error downloading file:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should append and remove link from document body', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockResolvedValue({
        badgeList: [],
        links: {},
      });

      const mockBlob = new Blob(['image data']);
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/image');

      const mockLink = {
        href: '',
        download: '',
        target: '',
        style: { display: '' },
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return originalCreateElement(tagName);
      });
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as any;

      await act(async () => {
        await result.current.handleDownloadImgClick(mockEvent, 'https://test.com/badge.png');
      });

      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });
  });

  // ==========================================
  // Return Values
  // ==========================================

  describe('Return Values', () => {
    it('should update isLoading state correctly', async () => {
      (APIServiceInstance.getUsersBadges as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ badgeList: [], links: {} });
          }, 100);
        });
      });

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(mockStore),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
