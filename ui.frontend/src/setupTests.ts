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
// =======================================================================================
// JEST MOCKS MUST BE DEFINED FIRST (before any code execution) to be properly hoisted
// =======================================================================================

// Mock CommerceContextProviders to prevent module load time execution of getALMConfig
jest.mock('./almLib/contextProviders/CommerceContextProviders', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement(React.Fragment, null, children),
    CommerceContextProvider: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Mock fontLoading module to prevent DOM manipulation during tests
jest.mock('./almLib/utils/fontLoading', () => ({}));

// Mock linkify-html module
jest.mock('linkify-html', () => ({
  __esModule: true,
  default: (text: string) => {
    if (!text) return '';
    // Simple linkification - wrap http(s) URLs in anchor tags
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  },
}));

// Mock inline_svg module to return mock SVG JSX elements for all functions
// Using a Proxy to automatically handle all 144+ SVG exports
jest.mock('./almLib/utils/inline_svg', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string' && prop !== '__esModule') {
          // Convert property name to kebab-case for data-icon attribute
          const iconName = prop.toLowerCase().replace(/_svg$/, '').replace(/_/g, '-');
          // Return a function that optionally takes a parameter
          // Make it a named function so it has a proper identity
          const svgFunc = function (param?: any) {
            return React.createElement(
              'svg',
              { 'data-icon': iconName, 'data-testid': iconName },
              null
            );
          };
          Object.defineProperty(svgFunc, 'name', { value: prop });
          return svgFunc;
        }
        if (prop === '__esModule') return true;
        return undefined;
      },
    }
  );
});

// Mock APIServiceInstance to prevent circular dependency issues at module load time
const mockAPIService = {
  registerServiceInstance: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  loadMore: jest.fn(),
};

jest.mock('./almLib/common/APIService', () => ({
  __esModule: true,
  default: mockAPIService,
}));

// Mock the store reducer to prevent module load time errors
// Use a Proxy to ensure it's always a function
const mockReducer = (state: any = {}, action: any) => state;
jest.mock('./almLib/store/reducer', () => ({
  __esModule: true,
  default: mockReducer,
}));

// Also mock the entire store to prevent reducer issues
jest.mock('./store/APIStore', () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
}));

// Mock filters.ts to avoid circular dependency with FILTER constant
// This prevents the module load time error when filtersDefaultState is created
jest.mock('./almLib/utils/filters', () => {
  // Use lazy evaluation to avoid circular dependencies
  let actualFilters: any;
  const getActual = () => {
    if (!actualFilters) {
      actualFilters = jest.requireActual('./almLib/utils/filters');
    }
    return actualFilters;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const actual = getActual();
        return actual[prop];
      },
    }
  );
});

// Mock ALMCustomHooks to prevent module load time instantiation with getALMConfig
jest.mock('./almLib/common/ALMCustomHooks', () => {
  let actualModule: any;
  const getActual = () => {
    if (!actualModule) {
      actualModule = jest.requireActual('./almLib/common/ALMCustomHooks');
    }
    return actualModule;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const actual = getActual();
        return actual[prop];
      },
    }
  );
});

// Mock AkamaiCustomHooks to prevent module load time instantiation with getALMConfig
jest.mock('./almLib/common/AkamaiCustomHooks', () => {
  let actualModule: any;
  const getActual = () => {
    if (!actualModule) {
      actualModule = jest.requireActual('./almLib/common/AkamaiCustomHooks');
    }
    return actualModule;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const actual = getActual();
        return actual[prop];
      },
    }
  );
});

// Mock CommerceCustomHooks to prevent module load time instantiation with getALMConfig
jest.mock('./almLib/common/CommerceCustomHooks', () => {
  let actualModule: any;
  const getActual = () => {
    if (!actualModule) {
      actualModule = jest.requireActual('./almLib/common/CommerceCustomHooks');
    }
    return actualModule;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const actual = getActual();
        return actual[prop];
      },
    }
  );
});

// Mock utils/global to ensure getALMConfig and other functions are available at module load time
// Do NOT use jest.requireActual here as it can cause circular dependencies
jest.mock('./almLib/utils/global', () => ({
  __esModule: true,
  getALMConfig: jest.fn(() => ({
    accountId: 'test-account-id',
    baseUrl: 'https://test.example.com',
    locale: 'en-US',
    accessToken: 'test-access-token',
    csrfToken: 'test-csrf-token',
    commerceURL: 'https://test.example.com/commerce',
    graphqlProxyPath: 'https://test.example.com/graphql',
    almBaseURL: 'https://test.example.com',
    primeApiURL: 'https://test.example.com/primeapi/v2',
    themeData: {
      name: 'Prime Default',
    },
  })),
  getAccessToken: jest.fn(() => 'test-access-token'),
  getCsrfToken: jest.fn(() => 'test-csrf-token'),
  getALMUser: jest.fn(() => Promise.resolve({ user: {} })),
  getALMObject: jest.fn(() => ({
    getALMConfig: () => ({
      accountId: 'test-account-id',
      baseUrl: 'https://test.example.com',
      locale: 'en-US',
      accessToken: 'test-access-token',
      csrfToken: 'test-csrf-token',
      commerceURL: 'https://test.example.com/commerce',
      graphqlProxyPath: 'https://test.example.com/graphql',
      almBaseURL: 'https://test.example.com',
      primeApiURL: 'https://test.example.com/primeapi/v2',
      themeData: {
        name: 'Prime Default',
      },
    }),
    getAccessToken: () => 'test-access-token',
    getCsrfToken: () => 'test-csrf-token',
    isPrimeUserLoggedIn: () => true,
  })),
  getWindowObject: () => (global as any).window,
  getALMAttribute: jest.fn(),
  setALMAttribute: jest.fn(),
  sendEvent: jest.fn(),
  getSkuId: jest.fn(),
  isAccAltCompletionEnabled: jest.fn(() => false),
  getQueryParamsFromUrl: jest.fn(() => ({})),
}));

// =======================================================================================
// GLOBAL SETUP (after mocks are defined)
// =======================================================================================

// Set up the global ALM object AFTER mocks are defined
const mockALMConfig = {
  accountId: 'test-account-id',
  baseUrl: 'https://test.example.com',
  locale: 'en-US',
  accessToken: 'test-access-token',
  csrfToken: 'test-csrf-token',
  commerceURL: 'https://test.example.com/commerce',
  graphqlProxyPath: 'https://test.example.com/graphql',
  almBaseURL: 'https://test.example.com',
  primeApiURL: 'https://test.example.com/primeapi/v2',
  themeData: {
    name: 'Prime Default',
  },
};

const mockALMObject = {
  getALMConfig: () => mockALMConfig,
  getAccessToken: () => 'test-access-token',
  getCsrfToken: () => 'test-csrf-token',
  getNativeExtensionToken: () => 'test-native-token',
  isPrimeUserLoggedIn: () => true,
  handleLogOut: () => {},
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  ALMConfig: mockALMConfig,
};

// Stub out window methods not implemented in jsdom
window.scrollTo = jest.fn();

// CSS.supports not implemented in jsdom
Object.defineProperty(global, 'CSS', {
  value: { supports: jest.fn(() => false) },
  writable: true,
});

// Set window.ALM
(global as any).window = (global as any).window || {};
(global as any).window.ALM = mockALMObject;
(global as any).window.initNotNeeded = true;
(global as any).window._satellite = {
  track: () => {},
  getVar: () => {},
};

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
