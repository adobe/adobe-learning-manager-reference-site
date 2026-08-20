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
 * Unit tests for restAdapter.ts
 * Tests HTTP request handling, authentication, error handling, and request cancellation
 */

// Mock dependencies BEFORE imports to prevent circular dependency issues
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://test.api.com/primeapi/v2',
    commerceURL: 'https://test.commerce.com',
    graphqlProxyPath: 'https://test.graphql.com',
    locale: 'en-US',
  })),
  getALMObject: jest.fn(() => ({
    storage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
  })),
  getALMUser: jest.fn(),
  getALMAttribute: jest.fn(),
  getQueryParamsFromUrl: jest.fn(() => ({})),
  updateURLParams: jest.fn(),
  redirectToLoginAndAbort: jest.fn(),
}));

jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(data => (typeof data === 'string' ? JSON.parse(data).data : data.data)),
}));
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(key => key),
  GetTranslationReplaced: jest.fn(),
}));
jest.mock('@utils/instance');

jest.mock('../../store/APIStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({
      appState: { appMode: 'WEB', isOnline: true },
    })),
  },
}));

import { RestAdapter, IRestAdapterGetOptions, IRestAdapterAjaxOptions } from '@utils/restAdapter';
import * as globalUtils from '@utils/global';
import store from '../../store/APIStore';
import { AppMode, NetworkStatus } from '@utils/mobileAppUtils/appConstants';

// Mock dependencies
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;
const mockGetALMObject = globalUtils.getALMObject as jest.MockedFunction<
  typeof globalUtils.getALMObject
>;
const mockGetQueryParamsFromUrl = globalUtils.getQueryParamsFromUrl as jest.MockedFunction<
  typeof globalUtils.getQueryParamsFromUrl
>;
const mockRedirectToLoginAndAbort = globalUtils.redirectToLoginAndAbort as jest.MockedFunction<
  typeof globalUtils.redirectToLoginAndAbort
>;

describe('RestAdapter', () => {
  let mockXHR: Partial<XMLHttpRequest>;
  let xhrInstances: Partial<XMLHttpRequest>[];

  beforeEach(() => {
    jest.clearAllMocks();
    xhrInstances = [];

    // Mock XMLHttpRequest
    mockXHR = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      abort: jest.fn(),
      status: 200,
      statusText: 'OK',
      response: JSON.stringify({ success: true }),
      responseText: JSON.stringify({ success: true }),
      readyState: 4,
      withCredentials: true,
      onload: null,
      onerror: null,
      onreadystatechange: null,
      DONE: 4,
    };

    // Mock XMLHttpRequest constructor
    (global as any).XMLHttpRequest = jest.fn(() => {
      const instance = { ...mockXHR };
      xhrInstances.push(instance);
      return instance;
    }) as any;

    // Add static constants to XMLHttpRequest
    (global as any).XMLHttpRequest.DONE = 4;
    (global as any).XMLHttpRequest.UNSENT = 0;
    (global as any).XMLHttpRequest.OPENED = 1;
    (global as any).XMLHttpRequest.HEADERS_RECEIVED = 2;
    (global as any).XMLHttpRequest.LOADING = 3;

    // Default mock implementations
    mockGetALMConfig.mockReturnValue({
      csrfToken: false,
      learnerMobileApp: false,
    } as any);

    mockGetALMObject.mockReturnValue({
      isPrimeUserLoggedIn: jest.fn().mockReturnValue(true),
      getAccessToken: jest.fn().mockReturnValue('test-token'),
      getCsrfToken: jest.fn().mockReturnValue('csrf-token'),
      navigateToOfflinePage: jest.fn(),
    } as any);

    mockGetQueryParamsFromUrl.mockReturnValue({});

    // Mock store
    (store.getState as jest.Mock).mockReturnValue({
      appState: {
        appMode: AppMode.WEB,
        isOnline: true,
      },
    });
  });

  afterEach(() => {
    // Reset current requests
    RestAdapter.currentRequest = {};
  });

  // ==========================================
  // GET Requests
  // ==========================================

  describe('GET Requests', () => {
    it('should make a GET request with URL', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      // Trigger onload on the actual instance
      const xhr = xhrInstances[0];
      if (xhr && xhr.onload) {
        xhr.onload.call(xhr as any, {} as any);
      }

      await promise;

      expect(xhr?.open).toHaveBeenCalledWith('GET', 'https://api.example.com/users');
      expect(xhr?.send).toHaveBeenCalledWith(null);
    });

    it('should add query parameters to URL', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        params: {
          page: 1,
          limit: 10,
          active: true,
        },
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('active=true');
    });

    it('should set custom headers', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.setRequestHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(xhrInstances[0]?.setRequestHeader).toHaveBeenCalledWith(
        'X-Custom-Header',
        'custom-value'
      );
    });

    it('should set response type when specified', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/file',
        responseType: 'blob',
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.responseType).toBe('blob');
    });

    it('should set withCredentials to true by default', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.withCredentials).toBe(true);
    });

    it('should respect withCredentials option', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        withCredentials: false,
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.withCredentials).toBe(false);
    });
  });

  // ==========================================
  // POST Requests
  // ==========================================

  describe('POST Requests', () => {
    it('should make a POST request with body', async () => {
      const options: IRestAdapterAjaxOptions = {
        url: 'https://api.example.com/users',
        method: 'POST',
        body: JSON.stringify({ name: 'John' }),
      };

      const promise = RestAdapter.post(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith('POST', 'https://api.example.com/users');
      expect(xhrInstances[0]?.send).toHaveBeenCalledWith(JSON.stringify({ name: 'John' }));
    });

    it('should send null when no body provided', async () => {
      const options: IRestAdapterAjaxOptions = {
        url: 'https://api.example.com/users',
        method: 'POST',
      };

      const promise = RestAdapter.post(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.send).toHaveBeenCalledWith(null);
    });
  });

  // ==========================================
  // PATCH, PUT, DELETE Requests
  // ==========================================

  describe('PATCH Requests', () => {
    it('should make a PATCH request', async () => {
      const options: IRestAdapterAjaxOptions = {
        url: 'https://api.example.com/users/1',
        method: 'PATCH',
        body: JSON.stringify({ name: 'Jane' }),
      };

      const promise = RestAdapter.patch(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith(
        'PATCH',
        'https://api.example.com/users/1'
      );
    });
  });

  describe('PUT Requests', () => {
    it('should make a PUT request', async () => {
      const options: IRestAdapterAjaxOptions = {
        url: 'https://api.example.com/users/1',
        method: 'PUT',
        body: JSON.stringify({ name: 'Bob' }),
      };

      const promise = RestAdapter.put(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith('PUT', 'https://api.example.com/users/1');
    });
  });

  describe('DELETE Requests', () => {
    it('should make a DELETE request', async () => {
      const options: IRestAdapterAjaxOptions = {
        url: 'https://api.example.com/users/1',
        method: 'DELETE',
      };

      const promise = RestAdapter.delete(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith(
        'DELETE',
        'https://api.example.com/users/1'
      );
    });
  });

  // ==========================================
  // Authentication
  // ==========================================

  describe('Authentication', () => {
    it('should add Authorization header when access token is available', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.setRequestHeader).toHaveBeenCalledWith(
        'Authorization',
        'oauth test-token'
      );
    });

    it('should add CSRF token to URL when csrfToken is enabled', async () => {
      mockGetALMConfig.mockReturnValue({
        csrfToken: true,
      } as any);

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      RestAdapter.get(options);

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('csrf_token=csrf-token');
    });

    it('should handle CSRF token with existing query params', async () => {
      mockGetALMConfig.mockReturnValue({
        csrfToken: true,
      } as any);

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users?page=1',
      };

      RestAdapter.get(options);

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('csrf_token=csrf-token');
    });

    it('should handle mobile app mode when not logged in', async () => {
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: jest.fn().mockReturnValue(false),
      } as any);

      mockGetALMConfig.mockReturnValue({
        learnerMobileApp: true,
      } as any);

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.withCredentials).toBe(false);
    });

    it('should open the request for a non-logged-in commerce (aem-commerce) user', () => {
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: jest.fn().mockReturnValue(false),
      } as any);
      mockGetALMConfig.mockReturnValue({
        usageType: 'aem-commerce',
      } as any);

      RestAdapter.get({ url: 'https://api.example.com/trainings' });

      // Regression: aem-commerce guests must open() the XHR before send(). Previously this
      // branch was skipped (only aem-es / mobile were handled), so send() threw InvalidStateError.
      expect(xhrInstances[0]?.open).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/trainings'
      );
      expect(xhrInstances[0]?.withCredentials).toBe(false);
    });

    it('should open the request for a non-logged-in ES (aem-es) user', () => {
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: jest.fn().mockReturnValue(false),
      } as any);
      mockGetALMConfig.mockReturnValue({
        usageType: 'aem-es',
      } as any);

      RestAdapter.get({ url: 'https://api.example.com/trainings' });

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith(
        'GET',
        'https://api.example.com/trainings'
      );
      expect(xhrInstances[0]?.withCredentials).toBe(false);
    });

    it('should not open the request for a non-logged-in aem-sites user (login required)', () => {
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: jest.fn().mockReturnValue(false),
      } as any);
      mockGetALMConfig.mockReturnValue({
        usageType: 'aem-sites',
      } as any);

      RestAdapter.get({ url: 'https://api.example.com/trainings' });

      expect(xhrInstances[0]?.open).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Response Handling
  // ==========================================

  describe('Response Handling', () => {
    it('should resolve on successful response (200)', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      // Set properties after the call
      Object.defineProperty(xhrInstances[0]!, 'status', { value: 200, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'response', {
        value: JSON.stringify({ data: 'success' }),
        writable: true,
      });

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      const result = await promise;
      expect(result).toBe(JSON.stringify({ data: 'success' }));
    });

    it('should resolve on 2xx status codes', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 201, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'response', {
        value: JSON.stringify({ created: true }),
        writable: true,
      });

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await expect(promise).resolves.toBe(JSON.stringify({ created: true }));
    });

    it('should resolve on 304 Not Modified', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 304, writable: true });

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await expect(promise).resolves.toBe(JSON.stringify({ success: true }));
    });

    it('should reject on 4xx client errors', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users/999',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 404, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'statusText', { value: 'Not Found', writable: true });
      Object.defineProperty(xhrInstances[0]!, 'responseText', {
        value: JSON.stringify({ error: 'Not Found' }),
        writable: true,
      });

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await expect(promise).rejects.toEqual({
        status: 404,
        statusText: 'Not Found',
        responseText: JSON.stringify({ error: 'Not Found' }),
      });
    });

    it('should reject on 5xx server errors', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 500, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'statusText', {
        value: 'Internal Server Error',
        writable: true,
      });
      Object.defineProperty(xhrInstances[0]!, 'responseText', {
        value: JSON.stringify({ error: 'Server Error' }),
        writable: true,
      });

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await expect(promise).rejects.toEqual({
        status: 500,
        statusText: 'Internal Server Error',
        responseText: JSON.stringify({ error: 'Server Error' }),
      });
    });

    it('should reject on network error', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 0, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'statusText', { value: '', writable: true });
      Object.defineProperty(xhrInstances[0]!, 'responseText', { value: '', writable: true });

      if (xhrInstances[0] && xhrInstances[0].onerror) {
        xhrInstances[0].onerror.call(xhrInstances[0] as any, {} as any);
      }

      await expect(promise).rejects.toEqual({
        status: 0,
        statusText: '',
        responseText: '',
      });
    });
  });

  // ==========================================
  // 401 Unauthorized Handling
  // ==========================================

  describe('401 Unauthorized Handling', () => {
    it('should redirect to login on 401 status', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/protected',
      };

      RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 401, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'readyState', { value: 4, writable: true }); // DONE

      // Trigger onreadystatechange
      if (xhrInstances[0] && xhrInstances[0].onreadystatechange) {
        xhrInstances[0].onreadystatechange.call(xhrInstances[0] as any, {} as any);
      }

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalledWith(true);
    });

    it('should not redirect on non-401 status', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 200, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'readyState', { value: 4, writable: true });

      if (xhrInstances[0] && xhrInstances[0].onreadystatechange) {
        xhrInstances[0].onreadystatechange.call(xhrInstances[0] as any, {} as any);
      }

      expect(mockRedirectToLoginAndAbort).not.toHaveBeenCalled();
    });

    it('should not redirect when readyState is not DONE', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/protected',
      };

      RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 401, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'readyState', { value: 2, writable: true }); // HEADERS_RECEIVED

      if (xhrInstances[0] && xhrInstances[0].onreadystatechange) {
        xhrInstances[0].onreadystatechange.call(xhrInstances[0] as any, {} as any);
      }

      expect(mockRedirectToLoginAndAbort).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Request Cancellation
  // ==========================================

  describe('Request Cancellation', () => {
    it('should cancel previous request with same cancel token', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/search',
        cancelToken: 'search-token',
      };

      // First request
      RestAdapter.get(options);
      const firstXHR = xhrInstances[0];

      // Second request with same token
      RestAdapter.get(options);

      expect(firstXHR.abort).toHaveBeenCalled();
    });

    it('should store current request with cancel token', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/search',
        cancelToken: 'search-token',
      };

      RestAdapter.get(options);

      expect(RestAdapter.currentRequest['search-token']).toBe(xhrInstances[0]);
    });

    it('should not cancel requests without cancel token', () => {
      const options1: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const options2: IRestAdapterGetOptions = {
        url: 'https://api.example.com/posts',
      };

      RestAdapter.get(options1);
      const firstXHR = xhrInstances[0];

      RestAdapter.get(options2);

      expect(firstXHR.abort).not.toHaveBeenCalled();
    });

    it('should reset previous request on completion', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/search',
        cancelToken: 'search-token',
      };

      const promise = RestAdapter.get(options);

      expect(RestAdapter.currentRequest['search-token']).toBe(xhrInstances[0]);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(RestAdapter.currentRequest['search-token']).toBeUndefined();
    });

    it('should reset previous request on error', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/search',
        cancelToken: 'search-token',
      };

      const promise = RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 500, writable: true });

      if (xhrInstances[0] && xhrInstances[0].onerror) {
        xhrInstances[0].onerror.call(xhrInstances[0] as any, {} as any);
      }

      await promise.catch(() => {});

      expect(RestAdapter.currentRequest['search-token']).toBeUndefined();
    });

    it('should reset previous request on 401', () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/protected',
        cancelToken: 'auth-token',
      };

      RestAdapter.get(options);

      Object.defineProperty(xhrInstances[0]!, 'status', { value: 401, writable: true });
      Object.defineProperty(xhrInstances[0]!, 'readyState', { value: 4, writable: true });

      if (xhrInstances[0] && xhrInstances[0].onreadystatechange) {
        xhrInstances[0].onreadystatechange.call(xhrInstances[0] as any, {} as any);
      }

      expect(RestAdapter.currentRequest['auth-token']).toBeUndefined();
    });
  });

  // ==========================================
  // Offline Mode (Mobile App)
  // ==========================================

  describe('Offline Mode', () => {
    it('should redirect to offline page when app is offline', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        appState: {
          appMode: AppMode.INSIDEAPP,
          isOnline: false,
        },
      });

      const navigateToOfflinePage = jest.fn();
      mockGetALMObject.mockReturnValue({
        navigateToOfflinePage,
      } as any);

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      // Just verify navigation was called
      await Promise.resolve();

      expect(navigateToOfflinePage).toHaveBeenCalled();
    });

    it('should not intercept when app mode is WEB', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        appState: {
          appMode: AppMode.WEB,
          isOnline: false,
        },
      });

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalled();
    });

    it('should not intercept when online', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        appState: {
          appMode: AppMode.INSIDEAPP,
          isOnline: true,
        },
      });

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalled();
    });

    it('should check networkStatus from query params', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        appState: {
          appMode: AppMode.INSIDEAPP,
          isOnline: false,
        },
      });

      mockGetQueryParamsFromUrl.mockReturnValue({
        networkStatus: NetworkStatus.OFFLINE,
      });

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      // Should proceed with request when networkStatus is OFFLINE
      expect(xhrInstances[0]?.open).toHaveBeenCalled();
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================

  describe('Edge Cases', () => {
    it('should handle empty params object', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        params: {},
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalledWith('GET', 'https://api.example.com/users');
    });

    it('should handle empty headers object', async () => {
      // Mock no authentication
      mockGetALMObject.mockReturnValue({
        isPrimeUserLoggedIn: () => false,
        getAccessToken: () => null,
        getCsrfToken: () => null,
      } as any);

      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        headers: {},
      };

      RestAdapter.get(options);

      expect(xhrInstances[0]?.setRequestHeader).not.toHaveBeenCalled();
    });

    it('should handle URL without protocol', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
      };

      const promise = RestAdapter.get(options);

      if (xhrInstances[0] && xhrInstances[0].onload) {
        xhrInstances[0].onload.call(xhrInstances[0] as any, {} as any);
      }

      await promise;

      expect(xhrInstances[0]?.open).toHaveBeenCalled();
    });

    it('should handle numeric param values', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        params: {
          page: 1,
          limit: 10,
        },
      };

      RestAdapter.get(options);

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
    });

    it('should handle boolean param values', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        params: {
          active: true,
          deleted: false,
        },
      };

      RestAdapter.get(options);

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('active=true');
      expect(calledUrl).toContain('deleted=false');
    });

    it('should handle array param values', async () => {
      const options: IRestAdapterGetOptions = {
        url: 'https://api.example.com/users',
        params: {
          ids: [1, 2, 3],
        },
      };

      RestAdapter.get(options);

      const calledUrl = (xhrInstances[0]?.open as jest.Mock).mock.calls[0][1];
      expect(calledUrl).toContain('ids=');
    });
  });

  // ==========================================
  // resetPreviousRequest
  // ==========================================

  describe('resetPreviousRequest', () => {
    it('should reset current request for given cancel token', () => {
      RestAdapter.currentRequest['test-token'] = mockXHR as XMLHttpRequest;

      RestAdapter.resetPreviousRequest({
        url: 'https://api.example.com/test',
        method: 'GET',
        cancelToken: 'test-token',
      });

      expect(RestAdapter.currentRequest['test-token']).toBeUndefined();
    });

    it('should do nothing when cancel token is not provided', () => {
      RestAdapter.currentRequest['test-token'] = mockXHR as XMLHttpRequest;

      RestAdapter.resetPreviousRequest({
        url: 'https://api.example.com/test',
        method: 'GET',
      });

      expect(RestAdapter.currentRequest['test-token']).toBe(mockXHR);
    });

    it('should handle non-existent cancel token', () => {
      RestAdapter.resetPreviousRequest({
        url: 'https://api.example.com/test',
        method: 'GET',
        cancelToken: 'non-existent',
      });

      // A non-existent token should not create an entry in currentRequest
      expect(RestAdapter.currentRequest['non-existent']).toBeUndefined();
    });
  });
});
