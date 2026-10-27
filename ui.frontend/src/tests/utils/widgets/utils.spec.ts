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
 * Unit tests for utils/widgets/utils.ts
 * Target: 80%+ code coverage
 */

// Mock dependencies BEFORE imports
jest.mock('@almLib/utils/widgets/windowWrapper', () => ({
  GetPrimeObj: jest.fn(() => ({
    commonConfig: {
      isMobile: false,
    },
  })),
}));

jest.mock('@almLib/utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
  },
}));

jest.mock('@almLib/utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
  GetTranslationReplaced: jest.fn((key: string, orgName: string) => `${key} ${orgName}`),
}));

jest.mock('@almLib/utils/widgets/base/EventHandlingBase', () => ({
  GetAllCatalogGroupFilterLink: jest.fn(() => '/catalog/groups'),
  GetCatalogPageLink: jest.fn(() => '/catalog'),
  GetCatalogPageLinkWithBookmarks: jest.fn(() => '/catalog/bookmarks'),
  GetMyLearningPageLink: jest.fn(() => '/mylearning'),
  GetSkillsPageLink: jest.fn(() => '/skills'),
  SendLinkEvent: jest.fn(),
  GetVirtualCoachPageLink: jest.fn(() => '/catalog?virtualCoachSelected=true&selectedSortOption=-date'),
}));

jest.mock('@almLib/utils/global', () => ({
  IsFlexibleWidth: jest.fn(() => false),
  getALMConfig: jest.fn(() => ({
    nativeExtensionToken: 'test-token',
    primeApiURL: 'https://test.adobe.com',
    locale: 'en-US',
    learnerMobileApp: false,
  })),
  getWidgetConfig: jest.fn(() => ({
    disableLinks: false,
    disableSocialWidgetLink: false,
    disableLeaderBoardWidgetLink: false,
    enableAnnouncementRecoUGWLink: false,
    isMobile: false,
    hideSkillInterestViewUpdate: false,
  })),
  getWindowObject: jest.fn(() => ({
    innerWidth: 1920,
    nativeExtensionToken: 'test-token',
    performance: { now: () => 1000 },
    location: { href: 'https://test.adobe.com' },
    matchMedia: jest.fn(),
  })),
  getALMAccount: jest.fn(() => ({
    id: 'account-1',
    name: 'Test Account',
  })),
  getALMObject: jest.fn(() => ({
    isPrimeUserLoggedIn: () => true,
    navigateToMyLearningPage: jest.fn(),
    navigateToCatalogPage: jest.fn(),
    navigateToSkillsPage: jest.fn(),
    navigateToHomePage: jest.fn(),
    navigateToCustomPage: jest.fn(),
    navigateToTrainingOverviewPage: jest.fn(),
    navigateToInstancePage: jest.fn(),
  })),
  getALMUser: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-1',
        account: { id: 'account-1' },
        gamificationEnabled: true,
      },
    })
  ),
}));

// Now import after all mocks are defined
import {
  interpolateTemplateAndMap,
  interpolateTemplate,
  getTemplateVariables,
  AreSetsEqual,
  ensureSlashAtEnd,
  randomIdGenerator,
  isBitSet,
  forceNumberIfDefined,
  addHtmlStrAttributeIfNotEmpty,
  getEpochMillis,
  getRoundedHourMillis,
  ShuffleArray,
  SpliceArrayIntoChunks,
  JoinArrayChunks,
  GetFormattedDate,
  GetFormattedDateForCompliance,
  GetFormattedSessionTimeForCalendar,
  ShallowClone,
  TransformToUpperCase,
  SleepPromise,
  sliceArrayIntoChunks,
  GetJsonParsedIfNeeded,
  AddToArrIfDefined,
  IsAnyUrl,
  GetWinLocation,
  GetQueryParam,
  URLDecodeString,
  GetEmptyPromise,
  LoadScript,
  getCachedData,
  setCachedData,
  CalculateIfTablet,
  GetTrimmedValues,
  isExtensionAllowed,
  getMaxCards,
  getMinCards,
  getHeading,
  getCurrentWindowWidth,
  setWidgetAttributesForMobileView,
  setWidgetAttributes,
  getMyLearningCardsCount,
  isPrimeLearningObject,
  ApplyWidgetOverrides,
  ApplyInjectables,
  handleLinkClick,
  handleKeyDownEvent,
  getDonutDimensions,
  downloadFile,
  setIsCustomPage,
  getIsCustomPage,
  injectCss,
  extractTextFromReactNode,
  // setupALMConfigEventListener, // Skip complex event listeners for now
  // setupHTMLWidgetNavigationListener,
  calculatePaginationState,
  fixWidgetAttributes,
  COURSE,
  LEARNING_PROGRAM,
  CERTIFICATION,
  SELF_ENROLL,
  WIDGET_REF_MAP,
  WIDGET_REF_MAP_NAME,
} from '@almLib/utils/widgets/utils';
import { Widget, WidgetType, IThemeData } from '@almLib/utils/widgets/common';
import { PrimeLearningObject, PrimeLearningObjectInstance } from '@models/PrimeModels';
import { RestAdapter } from '@almLib/utils/restAdapter';

// Get the mocked functions to properly set them up
const { getALMConfig, getWidgetConfig, getWindowObject, getALMAccount, getALMObject, getALMUser } =
  require('@almLib/utils/global');
const { GetPrimeObj } = require('@almLib/utils/widgets/windowWrapper');
const { GetTranslation, GetTranslationReplaced } = require('@almLib/utils/translationService');

describe('utils/widgets/utils.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    (getALMConfig as jest.Mock).mockReturnValue({
      nativeExtensionToken: 'test-token',
      primeApiURL: 'https://test.adobe.com',
      locale: 'en-US',
      learnerMobileApp: false,
    });

    (getWidgetConfig as jest.Mock).mockReturnValue({
      disableLinks: false,
      disableSocialWidgetLink: false,
      disableLeaderBoardWidgetLink: false,
      enableAnnouncementRecoUGWLink: false,
      isMobile: false,
      hideSkillInterestViewUpdate: false,
    });

    (getWindowObject as jest.Mock).mockReturnValue({
      innerWidth: 1920,
      nativeExtensionToken: 'test-token',
      performance: { now: () => 1000 },
      location: { href: 'https://test.adobe.com' },
      matchMedia: jest.fn(),
    });

    (GetPrimeObj as jest.Mock).mockReturnValue({
      commonConfig: {
        isMobile: false,
      },
    });

    (GetTranslation as jest.Mock).mockImplementation((key: string) => key);
    (GetTranslationReplaced as jest.Mock).mockImplementation(
      (key: string, orgName: string) => `${key} ${orgName}`
    );
  });

  describe('Template Functions', () => {
    describe('interpolateTemplateAndMap', () => {
      it('should interpolate template with params object', () => {
        const template = 'Hello ${name}, you are ${age} years old';
        const params = { name: 'John', age: 30 };
        const result = interpolateTemplateAndMap(template, params);
        expect(result).toBe('Hello John, you are 30 years old');
      });

      it('should handle boolean values', () => {
        const template = 'Is active: ${active}';
        const params = { active: true };
        const result = interpolateTemplateAndMap(template, params);
        expect(result).toBe('Is active: true');
      });

      it('should handle numeric values', () => {
        const template = 'Count: ${count}';
        const params = { count: 42 };
        const result = interpolateTemplateAndMap(template, params);
        expect(result).toBe('Count: 42');
      });
    });

    describe('interpolateTemplate', () => {
      it('should interpolate template with keys and values arrays', () => {
        const template = 'Hello ${name}, you are ${age} years old';
        const keys = ['name', 'age'];
        const values = ['Jane', '25'];
        const result = interpolateTemplate(template, keys, values);
        expect(result).toBe('Hello Jane, you are 25 years old');
      });

      it('should handle Set objects', () => {
        const template = '${a} + ${b} = ${c}';
        const keys = new Set(['a', 'b', 'c']);
        const values = new Set(['1', '2', '3']);
        const result = interpolateTemplate(template, keys, values);
        expect(result).toContain('1');
      });
    });

    describe('getTemplateVariables', () => {
      it('should extract variables from template string', () => {
        const template = 'Hello ${name}, you are ${age} years old in ${city}';
        const variables = getTemplateVariables(template);
        expect(variables).toEqual(['name', 'age', 'city']);
      });

      it('should return empty array for template without variables', () => {
        const template = 'Hello World';
        const variables = getTemplateVariables(template);
        expect(variables).toEqual([]);
      });

      it('should handle complex expressions', () => {
        const template = '${user.name} - ${user.email}';
        const variables = getTemplateVariables(template);
        expect(variables).toEqual(['user.name', 'user.email']);
      });
    });
  });

  describe('Set and Array Utilities', () => {
    describe('AreSetsEqual', () => {
      it('should return true for equal sets', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2, 3]);
        expect(AreSetsEqual(set1, set2)).toBe(true);
      });

      it('should return false for different sized sets', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2]);
        expect(AreSetsEqual(set1, set2)).toBe(false);
      });

      it('should return false for sets with different values', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2, 4]);
        expect(AreSetsEqual(set1, set2)).toBe(false);
      });

      it('should return true for empty sets', () => {
        const set1 = new Set();
        const set2 = new Set();
        expect(AreSetsEqual(set1, set2)).toBe(true);
      });
    });

    describe('ShuffleArray', () => {
      it('should shuffle array with seed', () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled = ShuffleArray([...arr], 42);
        expect(shuffled).toHaveLength(arr.length);
        expect(shuffled.sort()).toEqual(arr.sort());
      });

      it('should produce same shuffle with same seed', () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled1 = ShuffleArray([...arr], 42);
        const shuffled2 = ShuffleArray([...arr], 42);
        expect(shuffled1).toEqual(shuffled2);
      });

      it('should handle empty array', () => {
        const arr: number[] = [];
        const shuffled = ShuffleArray(arr, 42);
        expect(shuffled).toEqual([]);
      });
    });

    describe('SpliceArrayIntoChunks', () => {
      it('should split array into chunks of specified size', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7];
        const chunks = SpliceArrayIntoChunks(arr, 3);
        expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
      });

      it('should handle exact division', () => {
        const arr = [1, 2, 3, 4, 5, 6];
        const chunks = SpliceArrayIntoChunks(arr, 2);
        expect(chunks).toEqual([[1, 2], [3, 4], [5, 6]]);
      });

      it('should handle empty array', () => {
        const arr: number[] = [];
        const chunks = SpliceArrayIntoChunks(arr, 3);
        expect(chunks).toEqual([]);
      });
    });

    describe('JoinArrayChunks', () => {
      it('should join array chunks back together', () => {
        const chunks = [[1, 2, 3], [4, 5, 6], [7]];
        const joined = JoinArrayChunks(chunks);
        expect(joined).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });

      it('should handle empty chunks', () => {
        const chunks: number[][] = [];
        const joined = JoinArrayChunks(chunks);
        expect(joined).toEqual([]);
      });
    });

    describe('sliceArrayIntoChunks', () => {
      it('should slice array into chunks', () => {
        const arr = [1, 2, 3, 4, 5];
        const chunks = sliceArrayIntoChunks(arr, 2);
        expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
      });
    });

    describe('ShallowClone', () => {
      it('should create shallow copy of array', () => {
        const arr = [1, 2, 3];
        const cloned = ShallowClone(arr);
        expect(cloned).toEqual(arr);
        expect(cloned).not.toBe(arr);
      });
    });

    describe('AddToArrIfDefined', () => {
      it('should add element if defined', () => {
        const arr: number[] = [];
        AddToArrIfDefined(arr, 5);
        expect(arr).toEqual([5]);
      });

      it('should not add undefined element', () => {
        const arr: number[] = [];
        AddToArrIfDefined(arr, undefined);
        expect(arr).toEqual([]);
      });

      it('should apply transform function', () => {
        const arr: number[] = [];
        AddToArrIfDefined(arr, '5', (str: string) => parseInt(str));
        expect(arr).toEqual([5]);
      });
    });
  });

  describe('String Utilities', () => {
    describe('ensureSlashAtEnd', () => {
      it('should add slash if not present', () => {
        expect(ensureSlashAtEnd('path')).toBe('path/');
      });

      it('should not add slash if already present', () => {
        expect(ensureSlashAtEnd('path/')).toBe('path/');
      });
    });

    describe('TransformToUpperCase', () => {
      it('should transform to uppercase', () => {
        expect(TransformToUpperCase('hello', 'en-US')).toBe('HELLO');
      });

      it('should handle locale-specific uppercase', () => {
        expect(typeof TransformToUpperCase('hello', 'tr-TR')).toBe('string');
      });
    });

    describe('GetTrimmedValues', () => {
      it('should trim and return comma-separated values', () => {
        const result = GetTrimmedValues('  a  , b ,  c  ');
        expect(result).toBe('a,b,c');
      });

      it('should handle single value', () => {
        const result = GetTrimmedValues('  test  ');
        expect(result).toBe('test');
      });
    });

    describe('URLDecodeString', () => {
      it('should decode URL encoded string', () => {
        const encoded = 'Hello%20World';
        expect(URLDecodeString(encoded)).toBe('Hello World');
      });

      it('should return null for null input', () => {
        expect(URLDecodeString(null)).toBeNull();
      });
    });
  });

  describe('Number Utilities', () => {
    describe('isBitSet', () => {
      it('should return true if bit is set', () => {
        expect(isBitSet(5, 0)).toBe(true); // 101, bit 0 is set
        expect(isBitSet(5, 2)).toBe(true); // 101, bit 2 is set
      });

      it('should return false if bit is not set', () => {
        expect(isBitSet(5, 1)).toBe(false); // 101, bit 1 is not set
      });
    });

    describe('forceNumberIfDefined', () => {
      it('should convert string to number', () => {
        expect(forceNumberIfDefined('42')).toBe(42);
      });

      it('should handle number input', () => {
        expect(forceNumberIfDefined(42)).toBe(42);
      });

      it('should handle decimal conversion', () => {
        expect(forceNumberIfDefined('42.7')).toBe(42);
      });

      it('should return undefined for invalid input', () => {
        expect(forceNumberIfDefined('not a number')).toBeUndefined();
      });

      it('should return undefined for undefined input', () => {
        expect(forceNumberIfDefined(undefined)).toBeUndefined();
      });
    });

    describe('randomIdGenerator', () => {
      it('should generate random id', () => {
        const id1 = randomIdGenerator();
        const id2 = randomIdGenerator();
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
        expect(id1).not.toBe(id2);
      });
    });
  });

  describe('Date and Time Utilities', () => {
    describe('getEpochMillis', () => {
      it('should return current epoch milliseconds', () => {
        const now = Date.now();
        const result = getEpochMillis();
        expect(result).toBeGreaterThanOrEqual(now);
        expect(result).toBeLessThanOrEqual(now + 1000);
      });
    });

    describe('getRoundedHourMillis', () => {
      it('should return rounded hour milliseconds', () => {
        const result = getRoundedHourMillis();
        const hourInMs = 60 * 60 * 1000;
        expect(result % hourInMs).toBe(0);
      });
    });

    describe('GetFormattedDate', () => {
      it('should format date for en-US locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDate(dateStr, 'en-US');
        expect(result).toContain('15');
        expect(result).toContain('Jan');
      });

      it('should format date for zh-CN locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDate(dateStr, 'zh-CN');
        expect(result).toContain('月');
        expect(result).toContain('日');
      });

      it('should format date for ja-JP locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDate(dateStr, 'ja-JP');
        expect(result).toContain('月');
        expect(result).toContain('日');
      });
    });

    describe('GetFormattedDateForCompliance', () => {
      it('should format date with year for en-US locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDateForCompliance(dateStr, 'en-US');
        expect(result).toContain('15');
        expect(result).toContain('2024');
      });

      it('should format date for zh-CN locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDateForCompliance(dateStr, 'zh-CN');
        expect(result).toContain('月');
        expect(result).toContain('2024');
      });

      it('should format date for ja-JP locale', () => {
        const dateStr = '2024-01-15T10:00:00Z';
        const result = GetFormattedDateForCompliance(dateStr, 'ja-JP');
        expect(result).toContain('月');
        expect(result).toContain('2024');
      });
    });

    describe('GetFormattedSessionTimeForCalendar', () => {
      const startDate = '2024-01-15T10:00:00Z';
      const endDate = '2024-01-15T11:30:00Z';

      it('should format time for zh-CN locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'zh-CN');
        expect(result).toContain('-');
      });

      it('should format time for ja-JP locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'ja-JP');
        expect(result).toContain('~');
      });

      it('should format time for ko-KR locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'ko-KR');
        expect(result).toContain('~');
      });

      it('should format time for de-DE locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'de-DE');
        expect(result).toContain('Uhr');
      });

      it('should format time for fr-FR locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'fr-FR');
        expect(result).toContain('h');
      });

      it('should format time for nl-NL locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'nl-NL');
        expect(result).toContain('.');
      });

      it('should format time for pt-BR locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'pt-BR');
        expect(result).toContain('às');
      });

      it('should format time for nb-NO locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'nb-NO');
        expect(result).toContain('til');
      });

      it('should format time for default locale', () => {
        const result = GetFormattedSessionTimeForCalendar(startDate, endDate, 'en-US');
        expect(result).toContain('-');
      });
    });
  });

  describe('Async Utilities', () => {
    describe('SleepPromise', () => {
      it('should resolve after specified time', async () => {
        const start = Date.now();
        await SleepPromise(100);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(90);
      });
    });

    describe('GetEmptyPromise', () => {
      it('should create resolvable promise', async () => {
        const promise = GetEmptyPromise();
        promise.resolve('test');
        const result = await promise;
        expect(result).toBe('test');
      });

      it('should create rejectable promise', async () => {
        const promise = GetEmptyPromise();
        promise.reject('error');
        await expect(promise).rejects.toBe('error');
      });

      it('should chain resolve', async () => {
        const promise = GetEmptyPromise();
        const result = promise.resolve('test');
        expect(result).toBe(promise);
        await promise; // Ensure promise is consumed
      });

      it('should chain reject', async () => {
        const promise = GetEmptyPromise();
        const result = promise.reject('error');
        expect(result).toBe(promise);
        await expect(promise).rejects.toBe('error');
      });
    });
  });

  describe('JSON and Type Utilities', () => {
    describe('GetJsonParsedIfNeeded', () => {
      it('should parse JSON string', () => {
        const jsonStr = '{"key": "value"}';
        const result = GetJsonParsedIfNeeded(jsonStr);
        expect(result).toEqual({ key: 'value' });
      });

      it('should return object as is', () => {
        const obj = { key: 'value' };
        const result = GetJsonParsedIfNeeded(obj);
        expect(result).toBe(obj);
      });
    });
  });

  describe('URL Utilities', () => {
    describe('IsAnyUrl', () => {
      it('should return true for valid URL', () => {
        expect(IsAnyUrl('https://example.com')).toBe(true);
        expect(IsAnyUrl('http://example.com')).toBe(true);
        expect(IsAnyUrl('ftp://example.com')).toBe(true);
      });

      it('should return false for non-URL', () => {
        expect(IsAnyUrl('example.com')).toBe(false);
        expect(IsAnyUrl('/path/to/resource')).toBe(false);
      });

      it('should return false for undefined', () => {
        expect(IsAnyUrl(undefined)).toBe(false);
      });
    });

    describe('GetWinLocation', () => {
      it('should return window location href', () => {
        const mockWindow = { location: { href: 'https://test.com' } } as Window;
        const result = GetWinLocation(mockWindow);
        expect(result).toBe('https://test.com');
      });

      it('should return null on error', () => {
        const mockWindow = {} as Window;
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const result = GetWinLocation(mockWindow);
        expect(result).toBeNull();
        consoleSpy.mockRestore();
      });
    });

    describe('GetQueryParam', () => {
      it('should extract query parameter from URL', () => {
        const url = 'https://example.com?name=John&age=30';
        expect(GetQueryParam(url, 'name')).toBe('John');
        expect(GetQueryParam(url, 'age')).toBe('30');
      });

      it('should return null for missing parameter', () => {
        const url = 'https://example.com?name=John';
        expect(GetQueryParam(url, 'age')).toBeNull();
      });

      it('should return null for invalid URL', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        expect(GetQueryParam('invalid-url', 'param')).toBeNull();
        consoleSpy.mockRestore();
      });

      it('should return null for null URL', () => {
        expect(GetQueryParam(null, 'param')).toBeNull();
      });
    });
  });

  describe('HTML Utilities', () => {
    describe('addHtmlStrAttributeIfNotEmpty', () => {
      it('should add attribute with value', () => {
        const result = addHtmlStrAttributeIfNotEmpty('data-id', 'test123');
        expect(result).toBe("data-id='test123'");
      });

      it('should return empty string for falsy value', () => {
        const result = addHtmlStrAttributeIfNotEmpty('data-id', '');
        expect(result).toBe('');
      });

      it('should return attribute alone if addAttributeAlone is true', () => {
        const result = addHtmlStrAttributeIfNotEmpty('required', '', true);
        expect(result).toBe('required');
      });

      it('should handle boolean true', () => {
        const result = addHtmlStrAttributeIfNotEmpty('checked', true);
        expect(result).toBe("checked='true'");
      });

      it('should handle numbers', () => {
        const result = addHtmlStrAttributeIfNotEmpty('value', 42);
        expect(result).toBe("value='42'");
      });
    });

    describe('LoadScript', () => {
      it('should load script successfully', async () => {
        const parentEl = document.createElement('div');
        const promise = LoadScript(parentEl, 'https://example.com/script.js', true);

        // Simulate script load
        const scriptEl = parentEl.querySelector('script');
        expect(scriptEl).not.toBeNull();
        if (scriptEl) {
          expect(scriptEl.src).toBe('https://example.com/script.js');
          expect(scriptEl.async).toBe(true);

          // Trigger onload
          scriptEl.dispatchEvent(new Event('load'));
        }
        await expect(promise).resolves.toBeUndefined();
      });

      it('should handle script error', async () => {
        const parentEl = document.createElement('div');
        const promise = LoadScript(parentEl, 'https://example.com/script.js', false);

        const scriptEl = parentEl.querySelector('script');
        expect(scriptEl).not.toBeNull();
        if (scriptEl) {
          expect(scriptEl.async).toBe(false);

          // Trigger onerror
          scriptEl.dispatchEvent(new Event('error'));
        }
        await expect(promise).rejects.toBeUndefined();
      });
    });
  });

  describe('Storage Utilities', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe('setCachedData and getCachedData', () => {
      it('should not store data when ENABLE_BASIC_OFFLINE is false', () => {
        setCachedData('session-123', 'test-key', 'test-value');
        const result = getCachedData('session-123', 'test-key');
        expect(result).toBeNull();
      });

      it('should return null for undefined sessionUid', () => {
        const result = getCachedData(undefined, 'test-key');
        expect(result).toBeNull();
      });
    });
  });

  describe('Device Detection', () => {
    describe('CalculateIfTablet', () => {
      it('should detect tablet device', () => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(query => ({
            matches: query === 'only screen and (min-width: 768px) and (max-width: 1024px)',
            media: query,
          })),
        });

        const result = CalculateIfTablet();
        expect(result).toBe(true);
      });

      it('should return false for non-tablet', () => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(() => ({
            matches: false,
          })),
        });

        const result = CalculateIfTablet();
        expect(result).toBe(false);
      });
    });
  });

  describe('Widget Utilities', () => {
    describe('fixWidgetAttributes', () => {
      it('should fix widget attributes with defaults', () => {
        const attr: any = {};
        fixWidgetAttributes(attr);
        expect(attr.disableLinks).toBe(false);
        expect(attr.disableSocialWidgetLink).toBe(false);
        expect(attr.disableLeaderBoardWidgetLink).toBe(false);
        expect(attr.enableAnnouncementRecoUGWLink).toBe(false);
      });

      it('should not override existing attributes', () => {
        const attr: any = {
          disableLinks: true,
          disableSocialWidgetLink: true,
        };
        fixWidgetAttributes(attr);
        expect(attr.disableLinks).toBe(true);
        expect(attr.disableSocialWidgetLink).toBe(true);
      });

      it('should handle undefined attr', () => {
        // fixWidgetAttributes should be a no-op when attr is undefined
        const result = fixWidgetAttributes(undefined);
        expect(result).toBeUndefined();
      });
    });

    describe('isExtensionAllowed', () => {
      it('should return false for non-self-enroll course', () => {
        const lo = { loType: COURSE, enrollmentType: 'Manager Enroll' } as PrimeLearningObject;
        const instance = {} as PrimeLearningObjectInstance;
        expect(isExtensionAllowed(lo, instance)).toBe(false);
      });

      it('should return false for certification with validity', () => {
        const lo = { loType: CERTIFICATION } as PrimeLearningObject;
        const instance = { validity: '2024-12-31' } as any;
        expect(isExtensionAllowed(lo, instance)).toBe(false);
      });

      it('should return false for non-self-enroll learning program', () => {
        const lo = {
          loType: LEARNING_PROGRAM,
          enrollmentType: 'Manager Enroll',
        } as PrimeLearningObject;
        const instance = {} as PrimeLearningObjectInstance;
        expect(isExtensionAllowed(lo, instance)).toBe(false);
      });

      it('should return true for self-enroll course', () => {
        const lo = { loType: COURSE, enrollmentType: SELF_ENROLL } as PrimeLearningObject;
        const instance = {} as PrimeLearningObjectInstance;
        expect(isExtensionAllowed(lo, instance)).toBe(true);
      });
    });

    describe('getMaxCards', () => {
      it('should return 2 for calendar widget on desktop', () => {
        const result = getMaxCards(WIDGET_REF_MAP['com.adobe.captivateprime.calendar']);
        expect(result).toBe(2);
      });

      it('should return 2 for compliance widget on desktop', () => {
        const result = getMaxCards(WIDGET_REF_MAP['com.adobe.captivateprime.compliance']);
        expect(result).toBe(2);
      });

      it('should return 1 for leaderboard widget', () => {
        const result = getMaxCards(WIDGET_REF_MAP['com.adobe.captivateprime.leaderboard']);
        expect(result).toBe(1);
      });

      it('should return 1 for social widget', () => {
        const result = getMaxCards(WIDGET_REF_MAP['com.adobe.captivateprime.social']);
        expect(result).toBe(1);
      });

      it('should return -1 for unknown widget', () => {
        const result = getMaxCards('unknown-widget');
        expect(result).toBe(-1);
      });
    });

    describe('getMinCards', () => {
      it('should always return 1', () => {
        expect(getMinCards('any-widget')).toBe(1);
      });
    });
  });

  describe('Widget Heading', () => {
    const mockAccount: any = {
      name: 'Test Org',
      filterPanelSetting: { groups: true },
      exploreSkills: true,
      recommendationAccountType: 'CPENEW',
      prlCriteria: { enabled: false },
    };

    describe('getHeading', () => {
      it('should return admin reco heading', () => {
        const widget = {
          widgetRef: WidgetType.ADMIN_RECO,
          attributes: { enableAnnouncementRecoUGWLink: false },
        } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.name).toContain('Test Org');
        expect(heading.automationid).toBe('primelxp-adminreco');
      });

      it('should return mylearning heading', () => {
        const widget = { widgetRef: WidgetType.MYLEARNING, attributes: {} } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.automationid).toBe('primelxp-mylearning');
        expect(heading.link).toContain('myLearning=true');
      });

      it('should return bookmarks heading', () => {
        const widget = { widgetRef: WidgetType.BOOKMARKS, attributes: {} } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.automationid).toBe('primelxp-myBookmarks');
      });

      it('should return trending heading', () => {
        const widget = { widgetRef: WidgetType.TRENDING_RECO, attributes: {} } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.automationid).toBe('primelxp-trending');
      });

      it('should return catalog heading', () => {
        const widget = {
          widgetRef: WidgetType.CATALOG,
          attributes: { heading: 'My Catalog', sort: 'name' },
        } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.name).toBe('My Catalog');
        expect(heading.automationid).toBe('primelxp-catalog');
      });

      it('should handle AOI_RECO with skill name', () => {
        const widget = {
          widgetRef: WidgetType.AOI_RECO,
          attributes: { view: 'individual', stripNum: 1, hideExploreSkills: false },
        } as Widget;
        const heading = getHeading(widget, mockAccount, undefined, { skillName: 'JavaScript' });
        expect(heading.name).toContain('JavaScript');
        expect(heading.showAOIExploreLinks).toBe(true);
      });

      it('should handle RECOMMENDATIONS_STRIP', () => {
        const widget = {
          widgetRef: WidgetType.RECOMMENDATIONS_STRIP,
          attributes: {
            heading: 'Recommended',
            headerAriaLabel: 'Recommended courses',
            link: '/recommendations',
            recommendationConfig: { stripType: 'SUPER_RELEVANT_STRIP' },
          },
        } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.name).toBe('Recommended');
        expect(heading.headerAriaLabel).toBe('Recommended courses');
      });

      it('should return VIRTUAL_COACH heading', () => {
        const widget = { widgetRef: WidgetType.VIRTUAL_COACH, attributes: {} } as Widget;
        const heading = getHeading(widget, mockAccount);
        expect(heading.automationid).toBe('primelxp-browsevirtualcoach');
        expect(heading.description).toBe('alm.strip.virtualcoach.description');
        expect(heading.icon).not.toBeNull();
        expect(heading.showNewTag).toBeTruthy();
      });
    });
  });

  describe('Layout Functions', () => {
    describe('getCurrentWindowWidth', () => {
      it('should calculate window width and card count', () => {
        const result = getCurrentWindowWidth();
        expect(typeof result.innerWidth).toBe('number');
        expect(typeof result.availableWidth).toBe('number');
        expect(typeof result.maxCardsPossiblePerRow).toBe('number');
        expect(typeof result.isMobile).toBe('boolean');
        expect(typeof result.parentContainerWidth).toBe('string');
      });
    });

    describe('setWidgetAttributesForMobileView', () => {
      it('should set mobile attributes for widget', () => {
        const widget: Widget = {
          widgetRef: WIDGET_REF_MAP_NAME.MYLEARNING,
          layoutAttributes: {},
          attributes: {},
        } as Widget;

        setWidgetAttributesForMobileView(widget);
        expect(widget.layoutAttributes!.cardsToShow).toBe(1);
        expect(widget.layoutAttributes!.width).toBe('100%');
        expect(widget.layoutAttributes!.isFullRow).toBe(true);
      });

      it('should set specific width for calendar widget', () => {
        const widget: Widget = {
          widgetRef: WIDGET_REF_MAP_NAME.CALENDAR,
          layoutAttributes: {},
          attributes: {},
        } as Widget;

        setWidgetAttributesForMobileView(widget);
        expect(widget.layoutAttributes!.width).toContain('px');
        expect(widget.layoutAttributes!.isFullRow).toBe(false);
      });
    });

    describe('setWidgetAttributes', () => {
      it('should set desktop attributes for widget', () => {
        const widget: Widget = {
          widgetRef: 'com.adobe.captivateprime.lostrip.catalog',
          layoutAttributes: {},
          attributes: { numCards: 3 },
        } as Widget;
        const widgets: Widget[] = [widget];

        setWidgetAttributes(widget, widgets, 5, 0);
        expect(widget.layoutAttributes!.cardsToShow).toBe(5);
      });
    });

    describe('getMyLearningCardsCount', () => {
      it('should calculate my learning cards count', () => {
        const widget: Widget = {
          widgetRef: WIDGET_REF_MAP_NAME.MYLEARNING,
          layoutAttributes: {},
          attributes: { numberOfCardsLoaded: 3 },
        } as Widget;
        const widgets: Widget[] = [widget, { attributes: { numCards: 1 } } as Widget];

        const count = getMyLearningCardsCount(widget, widgets, 5, 0);
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Object Type Checks', () => {
    describe('isPrimeLearningObject', () => {
      it('should return true for valid learning object', () => {
        const lo = { id: 'lo-123' } as PrimeLearningObject;
        expect(isPrimeLearningObject(lo)).toBe(true);
      });

      it('should return false for object without id', () => {
        const lo = {} as PrimeLearningObject;
        expect(isPrimeLearningObject(lo)).toBe(false);
      });

      it('should return false for null', () => {
        expect(isPrimeLearningObject(null as any)).toBe(false);
      });
    });
  });

  describe('Widget Overrides', () => {
    describe('ApplyWidgetOverrides', () => {
      it('should apply overrides to widget', () => {
        const widget: Widget = {
          widgetRef: 'test',
          attributes: { numCards: 3 },
        } as Widget;
        const overrides = { numCards: 5, newProp: 'test' };

        ApplyWidgetOverrides(widget, overrides as any);
        expect(widget.attributes!.numCards).toBe(5);
        expect((widget.attributes as any).newProp).toBe('test');
      });

      it('should handle undefined overrides', () => {
        const widget: Widget = {
          widgetRef: 'test',
          attributes: { numCards: 3 },
        } as Widget;

        ApplyWidgetOverrides(widget, undefined);
        // With undefined overrides the existing attributes remain unchanged
        expect(widget.attributes!.numCards).toBe(3);
      });

      it('should initialize attributes if undefined', () => {
        const widget: Widget = {
          widgetRef: 'test',
        } as Widget;

        ApplyWidgetOverrides(widget, { numCards: 5 } as any);
        expect(widget.attributes!.numCards).toBe(5);
      });
    });
  });

  describe('Theme Injectables', () => {
    describe('ApplyInjectables', () => {
      it('should return current theme if no injectables URL', async () => {
        const currentTheme: IThemeData = { tileColors: ['#fff'] };
        const result = await ApplyInjectables(undefined, currentTheme);
        expect(result).toEqual(currentTheme);
      });

      it('should merge theme from injectables URL', async () => {
        const currentTheme: IThemeData = { tileColors: ['#fff'] };
        const externalTheme = { theme: { tileColors: ['#000'], globalCssText: 'body{}' } };

        (RestAdapter.get as jest.Mock).mockResolvedValue(JSON.stringify(externalTheme));

        const result = await ApplyInjectables('https://example.com/theme.json', currentTheme);
        expect(result.tileColors).toEqual(['#000']);
        expect(result.globalCssText).toBe('body{}');
      });

      it('should handle invalid URL', async () => {
        const currentTheme: IThemeData = { tileColors: ['#fff'] };
        const result = await ApplyInjectables('not-a-url', currentTheme);
        expect(result).toEqual(currentTheme);
      });

      it('should handle fetch error', async () => {
        const currentTheme: IThemeData = { tileColors: ['#fff'] };
        (RestAdapter.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const result = await ApplyInjectables('https://example.com/theme.json', currentTheme);
        expect(result).toEqual(currentTheme);
        consoleSpy.mockRestore();
      });

      it('should parse customization JSON', async () => {
        const currentTheme: IThemeData = {
          customization: '{"globalCssText": "test"}',
        };
        const result = await ApplyInjectables(undefined, currentTheme);
        expect(result.globalCssText).toBe('test');
      });

      it('should handle invalid customization JSON', async () => {
        const currentTheme: IThemeData = {
          customization: 'invalid-json',
        };
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const result = await ApplyInjectables(undefined, currentTheme);
        expect(result).toEqual(currentTheme);
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Event Handlers', () => {
    describe('handleLinkClick', () => {
      it('should stop propagation and send link event', () => {
        const event = {
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };
        const SendLinkEvent = require('@almLib/utils/widgets/base/EventHandlingBase').SendLinkEvent;

        handleLinkClick(event, '/test-link');
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(SendLinkEvent).toHaveBeenCalledWith('/test-link');
      });

      it('should not send link if link is undefined', () => {
        const event = {
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };

        handleLinkClick(event, undefined);
        expect(event.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('handleKeyDownEvent', () => {
      it('should handle Enter key', () => {
        const event = {
          key: 'Enter',
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };

        handleKeyDownEvent(event, '/test-link');
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should handle Space key', () => {
        const event = {
          key: ' ',
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };

        handleKeyDownEvent(event, '/test-link');
        expect(event.stopPropagation).toHaveBeenCalled();
      });

      it('should handle Spacebar key', () => {
        const event = {
          key: 'Spacebar',
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };

        handleKeyDownEvent(event, '/test-link');
        expect(event.stopPropagation).toHaveBeenCalled();
      });

      it('should not handle Tab key', () => {
        const event = {
          key: 'Tab',
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        };

        handleKeyDownEvent(event, '/test-link');
        expect(event.stopPropagation).not.toHaveBeenCalled();
      });
    });
  });

  describe('UI Utilities', () => {
    describe('getDonutDimensions', () => {
      it('should return compliance label dimensions when enabled', () => {
        const dims = getDonutDimensions(true);
        expect(dims.svgHeight).toBe(130);
        expect(dims.outerRadius).toBe(48);
      });

      it('should return default dimensions when disabled', () => {
        const dims = getDonutDimensions(false);
        expect(dims.svgHeight).toBe(225);
        expect(dims.outerRadius).toBe(60);
      });
    });

    describe('downloadFile', () => {
      it('should create and click download link', () => {
        const createElementSpy = jest.spyOn(document, 'createElement');
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

        downloadFile('https://example.com/file.pdf');

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
      });
    });

    describe('setIsCustomPage and getIsCustomPage', () => {
      it('should set and get custom page flag', () => {
        setIsCustomPage(true);
        expect(getIsCustomPage()).toBe(true);

        setIsCustomPage(false);
        expect(getIsCustomPage()).toBe(false);
      });
    });

    describe('injectCss', () => {
      it('should inject CSS link if not exists', () => {
        const querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(null);
        const createElementSpy = jest.spyOn(document, 'createElement');
        const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation();

        injectCss('https://example.com/style.css');

        expect(createElementSpy).toHaveBeenCalledWith('link');
        expect(appendChildSpy).toHaveBeenCalled();

        querySelectorSpy.mockRestore();
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
      });

      it('should not inject if CSS already exists', () => {
        const mockLink = document.createElement('link');
        const querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(mockLink);
        const appendChildSpy = jest.spyOn(document.head, 'appendChild');

        injectCss('https://example.com/style.css');

        expect(appendChildSpy).not.toHaveBeenCalled();
        querySelectorSpy.mockRestore();
      });
    });

    describe('extractTextFromReactNode', () => {
      it('should extract text from string', () => {
        expect(extractTextFromReactNode('Hello')).toBe('Hello');
      });

      it('should extract text from number', () => {
        expect(extractTextFromReactNode(42)).toBe('42');
      });

      it('should extract text from React element', () => {
        const node = { props: { children: 'Hello World' } };
        expect(extractTextFromReactNode(node as any)).toBe('Hello World');
      });

      it('should extract text from nested children', () => {
        const node = { props: { children: ['Hello', ' ', 'World'] } };
        expect(extractTextFromReactNode(node as any)).toBe('Hello World');
      });

      it('should return empty string for null', () => {
        expect(extractTextFromReactNode(null)).toBe('');
      });
    });
  });


  describe('Pagination Utilities', () => {
    describe('calculatePaginationState', () => {
      it('should calculate pagination with cursor', () => {
        const result = calculatePaginationState(
          'https://api.example.com?page[cursor]=abc123',
          false,
          10,
          10,
          undefined,
          null,
          null,
          true
        );

        expect(result.totalFetched).toBe(20);
        expect(result.fetchedAll).toBe(false);
        expect(result.cursorBased).toBe(true);
      });

      it('should calculate pagination with offset', () => {
        const result = calculatePaginationState(
          'https://api.example.com?page[offset]=20',
          false,
          10,
          10,
          undefined,
          null,
          '10',
          false
        );

        expect(result.totalFetched).toBe(20);
        expect(result.currentOffset).toBe('20');
        expect(result.cursorBased).toBe(false);
      });

      it('should mark as fetched all when no next URL', () => {
        const result = calculatePaginationState(
          '',
          false,
          10,
          10,
          undefined,
          null,
          null,
          undefined
        );

        expect(result.fetchedAll).toBe(true);
      });

      it('should respect maxItemToFetch limit', () => {
        const result = calculatePaginationState(
          'https://api.example.com?page[cursor]=abc',
          false,
          10,
          10,
          20,
          null,
          null,
          true
        );

        expect(result.fetchedAll).toBe(true);
      });

      it('should not mark fetched all when next URL is empty but selected id slices remain', () => {
        const result = calculatePaginationState(
          '',
          true,
          10,
          10,
          undefined,
          null,
          null,
          undefined
        );

        // Selected-id queries return no next link; pagination continues through the remaining id slices
        expect(result.fetchedAll).toBe(false);
      });

      it('should mark fetched all at maxItemToFetch even when selected id slices remain', () => {
        const result = calculatePaginationState('', true, 10, 5, 15, null, null, undefined);

        expect(result.fetchedAll).toBe(true);
      });

      it.each([
        [5, 1],
        [10, 1],
        [20, 2],
        [25, 3],
      ])(
        'should fetch all %i selected ids in %i non-empty slice(s) and then stop',
        (idCount, expectedSlices) => {
          // Mirrors the selected-id slicing in useALMCoursePathWidget / useALMCategoryWidget
          const pageLimit = 10;
          const ids = Array.from({ length: idCount }, (_, i) => `id${i}`);
          const slices: string[][] = [];
          let callNumber = 0;
          let totalFetched = 0;
          let fetchedAll = false;

          while (!fetchedAll && callNumber < 100) {
            if (ids.length < pageLimit * callNumber) break;
            slices.push(ids.slice(pageLimit * callNumber, pageLimit * callNumber + pageLimit));
            const hasMoreSelectedIds = pageLimit * (callNumber + 1) < ids.length;
            const state = calculatePaginationState(
              '',
              hasMoreSelectedIds,
              totalFetched,
              pageLimit,
              undefined,
              null,
              null,
              undefined
            );
            totalFetched = state.totalFetched;
            fetchedAll = state.fetchedAll;
            callNumber++;
          }

          expect(slices).toHaveLength(expectedSlices);
          expect(slices.every(slice => slice.length > 0)).toBe(true);
          expect(slices.flat()).toHaveLength(idCount);
          expect(fetchedAll).toBe(true);
        }
      );

      it('should handle invalid next URL gracefully', () => {
        const result = calculatePaginationState(
          'invalid-url',
          false,
          10,
          10,
          undefined,
          null,
          null,
          undefined
        );

        // URL constructor throws for invalid URLs; extractPaginationFromNextUrl returns null,
        // so cursor/offset are not updated and fetchedAll remains false
        expect(result.fetchedAll).toBe(false);
      });
    });
  });
});
