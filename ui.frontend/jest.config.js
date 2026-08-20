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
'use strict';

module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/tests/**',
    // inline_svg.tsx is a ~676KB file of pure presentational SVG markup. Babel
    // does not instrument files above ~500KB, so it can never receive runtime
    // coverage (it always reports 0%, dragging totals down and making the
    // changed-line gate unsatisfiable for any icon added to it). Exclude it.
    '!src/almLib/utils/inline_svg.tsx',
  ],
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 58,
      functions: 61,
      lines: 66,
    },
  },
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/config/jest/babelTransform.js',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(three|three-spritetext)[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@almLib/(.*)$': '<rootDir>/src/almLib/$1',
    '^@components/(.*)$': '<rootDir>/src/almLib/components/$1',
    '^@hooks$': '<rootDir>/src/almLib/hooks/index.ts',
    '^@hooks/(.*)$': '<rootDir>/src/almLib/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/almLib/utils/$1',
    '^@models$': '<rootDir>/src/almLib/models/index.ts',
    '^@models/(.*)$': '<rootDir>/src/almLib/models/$1',
    '^@almStore/(.*)$': '<rootDir>/src/almLib/store/$1',
    '^@contextProviders/(.*)$': '<rootDir>/src/almLib/contextProviders/$1',
    '^@common/(.*)$': '<rootDir>/src/almLib/common/$1',
    '^@styles/(.*)$': '<rootDir>/src/almLib/styles/$1',
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};
