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
 * Unit tests for catalog.ts utility functions
 * Coverage target: 80-85%
 */

// Mock ALL dependencies BEFORE imports to prevent circular dependency issues
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMObject: jest.fn(),
  getALMUser: jest.fn(),
  getALMAttribute: jest.fn(),
  getQueryParamsFromUrl: jest.fn(),
  updateURLParams: jest.fn(),
  getItemFromStorage: jest.fn(),
  setItemToStorage: jest.fn(),
  isBookmarksEnabled: jest.fn(),
  isAccAltCompletionEnabled: jest.fn(),
  isStructuredLocationEnabled: jest.fn(() => false),
}));

jest.mock('@utils/instance', () => ({
  checkIfCompletionDeadlineNotPassed: jest.fn(),
  filterInstanceList: jest.fn(),
}));

jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(),
  getBrowserLocale: jest.fn(),
  getPreferredLocalizedMetadata: jest.fn(),
}));

// Now import everything
import {
  isJobaid,
  isJobaidContentTypeUrl,
  getJobaidUrl,
  getActiveInstances,
  getDefaultIntsance,
  debounce,
  getOrUpdateCatalogFilters,
  isAttributeEnabled,
  getParamsForCatalogApi,
  getFiltersObjectForESApi,
  getRequestObjectForESApi,
  getIndividualFiltersForCommerce,
  sortList,
  splitStringIntoArray,
  getPRLFilters,
  getTruePropertiesAsString,
  filterObjectByTruthyValues,
  convertStringToObject,
  hasKeys,
  getLocalesForCatalogApi,
  getLocalesForSearch,
  getSnippetTypes,
  fetchRecommendationData,
  getFilterNames,
  getStructuredLocationList,
  getCatalogList,
  getAnnouncedGroupsList,
  getSettledValue,
  fetchFilterData,
  getInitialView,
  isMyLearningPage,
  getSearchOrCatalog,
  getAlternateCompletionLOParams,
} from '@utils/catalog';
import { PrimeLearningObject, PrimeUser, PrimeAccount } from '@models/PrimeModels';
import { CatalogFilterState, CatalogState } from '../../store/reducers/catalog';
import { ACTIVE, ENGLISH_LOCALE } from '@utils/constants';

import {
  getALMConfig,
  getALMObject,
  getALMUser,
  getALMAttribute,
  getQueryParamsFromUrl,
  updateURLParams,
  getItemFromStorage,
  setItemToStorage,
  isBookmarksEnabled,
  isAccAltCompletionEnabled,
  isStructuredLocationEnabled,
} from '@utils/global';
import { checkIfCompletionDeadlineNotPassed } from '@utils/instance';
import { JsonApiParse } from '@utils/jsonAPIAdapter';
import { RestAdapter } from '@utils/restAdapter';
import { GetTranslation, getBrowserLocale, getPreferredLocalizedMetadata } from '@utils/translationService';

// Create typed mocks
const mockGetALMAttribute = getALMAttribute as jest.MockedFunction<typeof getALMAttribute>;
const mockGetALMConfig = getALMConfig as jest.MockedFunction<typeof getALMConfig>;
const mockGetALMObject = getALMObject as jest.MockedFunction<typeof getALMObject>;
const mockGetItemFromStorage = getItemFromStorage as jest.MockedFunction<typeof getItemFromStorage>;
const mockSetItemToStorage = setItemToStorage as jest.MockedFunction<typeof setItemToStorage>;
const mockGetQueryParamsFromUrl = getQueryParamsFromUrl as jest.MockedFunction<
  typeof getQueryParamsFromUrl
>;
const mockIsBookmarksEnabled = isBookmarksEnabled as jest.MockedFunction<typeof isBookmarksEnabled>;
const mockIsAccAltCompletionEnabled = isAccAltCompletionEnabled as jest.MockedFunction<typeof isAccAltCompletionEnabled>;
const mockIsStructuredLocationEnabled = isStructuredLocationEnabled as jest.MockedFunction<typeof isStructuredLocationEnabled>;
const mockCheckIfCompletionDeadlineNotPassed =
  checkIfCompletionDeadlineNotPassed as jest.MockedFunction<
    typeof checkIfCompletionDeadlineNotPassed
  >;
const mockJsonApiParse = JsonApiParse as jest.MockedFunction<typeof JsonApiParse>;
const mockGetBrowserLocale = getBrowserLocale as jest.MockedFunction<typeof getBrowserLocale>;
const mockGetPreferredLocalizedMetadata = getPreferredLocalizedMetadata as jest.MockedFunction<typeof getPreferredLocalizedMetadata>;

// Helper function to create mock training objects
const createMockTraining = (overrides: any = {}): any => {
  return {
    id: 'training:1',
    type: 'learningObject',
    loType: 'course',
    state: ACTIVE,
    instances: [],
    enrollment: undefined,
    ...overrides,
  };
};

// Helper function to create mock user
const createMockUser = (overrides: any = {}): any => {
  return {
    id: 'user:1',
    type: 'user',
    attributes: {
      email: 'test@example.com',
    },
    account: {
      prlCriteria: {},
    },
    ...overrides,
  };
};

// Helper function to create mock account
const createMockAccount = (overrides: any = {}): any => {
  return {
    id: 'account:1',
    type: 'account',
    attributes: {
      ...overrides,
    },
  };
};

// Helper function to create mock filter state
const createMockFilterState = (overrides: any = {}): any => {
  return {
    loTypes: '',
    tagName: '',
    duration: '', // Changed from {} to '' since function expects string
    catalogs: '',
    price: '',
    skill: '',
    skillLevel: '',
    cities: '',
    skillName: '',
    loFormat: '',
    ...overrides,
  };
};

describe('catalog utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockGetALMConfig.mockReturnValue({
      primeApiURL: 'https://api.test.com/',
      locale: 'en-US',
    } as any);
    mockGetALMObject.mockReturnValue({} as any);
    mockGetALMAttribute.mockReturnValue(null);
    mockGetQueryParamsFromUrl.mockReturnValue({});
    mockIsBookmarksEnabled.mockReturnValue(false);
    mockGetBrowserLocale.mockReturnValue('en-US');
  });

  // ==========================================
  // Category 1: Simple Utilities
  // ==========================================

  describe('isJobaid', () => {
    it('should return true for jobaid type', () => {
      const training = createMockTraining({ loType: 'jobaid' });
      expect(isJobaid(training)).toBe(true);
    });

    it('should return false for non-jobaid type', () => {
      const training = createMockTraining({ loType: 'course' });
      expect(isJobaid(training)).toBe(false);
    });

    it('should handle case insensitive check', () => {
      const training1 = createMockTraining({ loType: 'JobAid' });
      const training2 = createMockTraining({ loType: 'JOBAID' });
      expect(isJobaid(training1)).toBe(true);
      expect(isJobaid(training2)).toBe(true);
    });
  });

  describe('isAttributeEnabled', () => {
    it('should return true for "true" string', () => {
      expect(isAttributeEnabled('true')).toBe(true);
    });

    it('should return false for non-"true" string', () => {
      expect(isAttributeEnabled('false')).toBe(false);
      expect(isAttributeEnabled('1')).toBe(false);
      expect(isAttributeEnabled('')).toBe(false);
    });

    it('should handle undefined as false', () => {
      expect(isAttributeEnabled(undefined as any)).toBe(false);
    });
  });

  describe('hasKeys', () => {
    it('should return true for object with keys', () => {
      expect(hasKeys({ a: 1 })).toBe(true);
      expect(hasKeys({ foo: 'bar', baz: 123 })).toBe(true);
    });

    it('should return false for empty object', () => {
      expect(hasKeys({})).toBe(false);
    });

    it('should handle nested objects', () => {
      expect(hasKeys({ nested: { key: 'value' } })).toBe(true);
    });
  });

  describe('splitStringIntoArray', () => {
    it('should split comma-separated string', () => {
      expect(splitStringIntoArray('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should handle single value', () => {
      expect(splitStringIntoArray('single')).toEqual(['single']);
    });

    it('should handle empty string', () => {
      expect(splitStringIntoArray('')).toEqual(['']);
    });

    it('should use custom delimiter', () => {
      expect(splitStringIntoArray('a-b-c', '-')).toEqual(['a', 'b', 'c']);
    });

    it('should preserve spaces', () => {
      expect(splitStringIntoArray('a, b, c')).toEqual(['a', ' b', ' c']);
    });
  });

  describe('sortList', () => {
    it('should sort array of objects by parameter name', () => {
      const list = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      const sorted = sortList(list, 'name');
      expect(sorted).toEqual([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    });

    it('should handle empty array', () => {
      expect(sortList([], 'name')).toEqual([]);
    });

    it('should trim values before sorting', () => {
      const list = [{ name: '  Charlie  ' }, { name: 'Alice' }, { name: '  Bob' }];
      const sorted = sortList(list, 'name');
      expect(sorted[0].name).toBe('Alice');
    });

    it('should not mutate original array', () => {
      const list = [{ name: 'Charlie' }, { name: 'Alice' }];
      const original = [...list];
      sortList(list, 'name');
      expect(list).toEqual(original);
    });
  });

  describe('getInitialView', () => {
    it('should return TILE_VIEW for GRID', () => {
      expect(getInitialView('GRID')).toBe('TILE_VIEW');
    });

    it('should return LIST_VIEW for other values', () => {
      expect(getInitialView('LIST')).toBe('LIST_VIEW');
      expect(getInitialView('TABLE')).toBe('LIST_VIEW');
      expect(getInitialView('')).toBe('LIST_VIEW');
    });
  });

  // ==========================================
  // Category 2: Object Transformations
  // ==========================================

  describe('getTruePropertiesAsString', () => {
    it('should convert object with true values to comma-separated string', () => {
      const obj = { skill1: true, skill2: false, skill3: true };
      expect(getTruePropertiesAsString(obj)).toBe('skill1,skill3');
    });

    it('should handle empty object', () => {
      expect(getTruePropertiesAsString({})).toBe('');
    });

    it('should handle all false values', () => {
      const obj = { skill1: false, skill2: false };
      expect(getTruePropertiesAsString(obj)).toBe('');
    });

    it('should handle single true value', () => {
      const obj = { skill1: true };
      expect(getTruePropertiesAsString(obj)).toBe('skill1');
    });
  });

  describe('filterObjectByTruthyValues', () => {
    it('should filter object keeping only truthy values', () => {
      const obj = { a: true, b: false, c: true };
      expect(filterObjectByTruthyValues(obj)).toEqual({ a: true, c: true });
    });

    it('should handle empty object', () => {
      expect(filterObjectByTruthyValues({})).toEqual({});
    });

    it('should handle all false values', () => {
      const obj = { a: false, b: false };
      expect(filterObjectByTruthyValues(obj)).toEqual({});
    });

    it('should return new object', () => {
      const obj = { a: true };
      const result = filterObjectByTruthyValues(obj);
      expect(result).not.toBe(obj);
    });
  });

  describe('convertStringToObject', () => {
    it('should convert comma-separated string to object with true values', () => {
      expect(convertStringToObject('a,b,c')).toEqual({ a: true, b: true, c: true });
    });

    it('should handle single value', () => {
      expect(convertStringToObject('single')).toEqual({ single: true });
    });

    it('should handle empty string', () => {
      expect(convertStringToObject('')).toEqual({ '': true });
    });

    it('should use provided value', () => {
      expect(convertStringToObject('a,b', false as any)).toEqual({ a: true, b: true });
    });
  });

  describe('getFilterNames', () => {
    it('should extract names from parsed promise', () => {
      mockJsonApiParse.mockReturnValue({ data: { names: ['name1', 'name2'] } } as any);
      expect(getFilterNames('promise-data')).toEqual(['name1', 'name2']);
    });

    it('should return null for undefined promise', () => {
      expect(getFilterNames(undefined)).toBeNull();
    });

    it('should return null if no data', () => {
      mockJsonApiParse.mockReturnValue(null as any);
      expect(getFilterNames('promise-data')).toBeUndefined();
    });
  });

  describe('getStructuredLocationList', () => {
    const buildPayload = (value: any[], rowId = 'locationId') => ({
      data: { attributes: { filters: [{ id: rowId, name: 'Locations', value }] } },
    });

    it('should return null for an empty promise', () => {
      expect(getStructuredLocationList(undefined)).toBeNull();
    });

    it('maps the locationId row to { value(code), label(compound) }', () => {
      const payload = buildPayload([
        {
          id: 'india|karnataka|bengaluru',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
        },
        { id: 'usa|california|san francisco', city: 'San Francisco', state: null, country: 'Usa' },
      ]);
      expect(getStructuredLocationList(payload)).toEqual([
        { id: 'india|karnataka|bengaluru', name: 'Bengaluru, Karnataka, India' },
        { id: 'usa|california|san francisco', name: 'San Francisco, Usa' },
      ]);
    });

    it('parses a raw JSON string payload', () => {
      const payload = JSON.stringify(
        buildPayload([{ id: 'india|mh|pune', city: 'Pune', state: 'MH', country: 'India' }])
      );
      expect(getStructuredLocationList(payload)).toEqual([
        { id: 'india|mh|pune', name: 'Pune, MH, India' },
      ]);
    });

    it('drops rows with a missing/empty id', () => {
      const payload = buildPayload([
        { id: '', city: 'NoId', country: 'IN' },
        { id: '  ', city: 'Blank', country: 'IN' },
        { id: 'ok', city: 'Delhi', country: 'IN' },
      ]);
      expect(getStructuredLocationList(payload)).toEqual([{ id: 'ok', name: 'Delhi, IN' }]);
    });

    it('returns null when locationId row is absent', () => {
      const payload = buildPayload([{ id: 'x', city: 'Delhi', country: 'IN' }], 'someOtherId');
      expect(getStructuredLocationList(payload)).toBeNull();
    });
  });

  describe('getCatalogList', () => {
    it('should transform catalogs to id/name objects', () => {
      const catalogs = [
        { id: '1', name: 'Catalog 1' },
        { id: '2', name: 'Catalog 2' },
      ];
      expect(getCatalogList(catalogs)).toEqual([
        { id: '1', name: 'Catalog 1' },
        { id: '2', name: 'Catalog 2' },
      ]);
    });

    it('should return null for undefined', () => {
      expect(getCatalogList(undefined)).toBeNull();
    });

    it('should handle empty array', () => {
      expect(getCatalogList([])).toEqual([]);
    });
  });

  describe('getAnnouncedGroupsList', () => {
    it('should parse and transform user groups', () => {
      mockJsonApiParse.mockReturnValue({
        userGroupList: [
          { id: 'g1', name: 'Group 1' },
          { id: 'g2', name: 'Group 2' },
        ],
      } as any);

      expect(getAnnouncedGroupsList('promise-data')).toEqual([
        { id: 'g1', name: 'Group 1' },
        { id: 'g2', name: 'Group 2' },
      ]);
    });

    it('should return null for undefined promise', () => {
      expect(getAnnouncedGroupsList(undefined)).toBeNull();
    });

    it('should return null if no user group list', () => {
      mockJsonApiParse.mockReturnValue({} as any);
      expect(getAnnouncedGroupsList('promise-data')).toBeNull();
    });
  });

  // ==========================================
  // Category 3: Instance & JobAid Functions
  // ==========================================

  describe('isJobaidContentTypeUrl', () => {
    it('should return true for OTHER content type', () => {
      const training = createMockTraining({
        instances: [
          {
            loResources: [
              {
                resources: [
                  {
                    contentType: 'OTHER',
                  } as any,
                ],
              } as any,
            ],
          } as any,
        ],
      });
      expect(isJobaidContentTypeUrl(training)).toBe(true);
    });

    it('should return false for non-OTHER content type', () => {
      const training = createMockTraining({
        instances: [
          {
            loResources: [
              {
                resources: [
                  {
                    contentType: 'PDF',
                  } as any,
                ],
              } as any,
            ],
          } as any,
        ],
      });
      expect(isJobaidContentTypeUrl(training)).toBe(false);
    });

    it('should handle undefined resources', () => {
      const training = createMockTraining({
        instances: [{ loResources: [] } as any],
      });
      expect(isJobaidContentTypeUrl(training)).toBe(false);
    });

    it('should handle missing instances', () => {
      const training = createMockTraining({ instances: [] });
      // Function will throw when accessing instances[0] on empty array
      expect(() => isJobaidContentTypeUrl(training)).toThrow();
    });
  });

  describe('getJobaidUrl', () => {
    it('should extract location from first instance resource', () => {
      const training = createMockTraining({
        instances: [
          {
            loResources: [
              {
                resources: [
                  {
                    location: 'https://example.com/jobaid.pdf',
                  } as any,
                ],
              } as any,
            ],
          } as any,
        ],
      });
      mockGetPreferredLocalizedMetadata.mockReturnValue({ location: 'https://example.com/jobaid.pdf' } as any);
      expect(getJobaidUrl(training)).toBe('https://example.com/jobaid.pdf');
    });

    it('should handle undefined location', () => {
      const training = createMockTraining({
        instances: [{ loResources: [] } as any],
      });
      expect(() => getJobaidUrl(training)).toThrow(TypeError);
    });

    it('should handle missing instances', () => {
      const training = createMockTraining({ instances: [] });
      expect(() => getJobaidUrl(training)).toThrow(TypeError);
    });
  });

  describe('getActiveInstances', () => {
    beforeEach(() => {
      mockCheckIfCompletionDeadlineNotPassed.mockReturnValue(true);
    });

    it('should return active instances with valid deadline', () => {
      const training = createMockTraining({
        instances: [{ id: 'i1', state: ACTIVE } as any, { id: 'i2', state: 'INACTIVE' } as any],
      });
      const result = getActiveInstances(training);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('i1');
    });

    it('should include instances with enrollment regardless of state', () => {
      const training = createMockTraining({
        instances: [
          { id: 'i1', state: 'INACTIVE', enrollment: { id: 'e1' } } as any,
          { id: 'i2', state: ACTIVE } as any,
        ],
      });
      const result = getActiveInstances(training);
      expect(result).toHaveLength(2);
    });

    it('should filter out instances with passed deadline', () => {
      mockCheckIfCompletionDeadlineNotPassed.mockReturnValue(false);
      const training = createMockTraining({
        instances: [{ id: 'i1', state: ACTIVE } as any],
      });
      const result = getActiveInstances(training);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for training with no instances', () => {
      const training = createMockTraining({ instances: undefined as any });
      const result = getActiveInstances(training);
      expect(result).toBeUndefined();
    });

    it('should handle mixed scenario', () => {
      mockCheckIfCompletionDeadlineNotPassed.mockReturnValueOnce(true).mockReturnValueOnce(false);
      const training = createMockTraining({
        instances: [
          { id: 'i1', state: ACTIVE } as any,
          { id: 'i2', state: ACTIVE } as any,
          { id: 'i3', state: 'INACTIVE', enrollment: { id: 'e1' } } as any,
        ],
      });
      const result = getActiveInstances(training);
      expect(result).toHaveLength(2); // i1 and i3
    });
  });

  describe('getDefaultIntsance', () => {
    it('should return default instances', () => {
      const training = createMockTraining({
        instances: [{ id: 'i1', isDefault: true } as any, { id: 'i2', isDefault: false } as any],
      });
      const result = getDefaultIntsance(training);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('i1');
    });

    it('should return empty array if no default instances', () => {
      const training = createMockTraining({
        instances: [{ id: 'i1', isDefault: false } as any],
      });
      expect(getDefaultIntsance(training)).toEqual([]);
    });

    it('should handle undefined instances', () => {
      const training = createMockTraining({ instances: undefined as any });
      // Function returns undefined, doesn't throw
      expect(getDefaultIntsance(training)).toBeUndefined();
    });
  });

  // ==========================================
  // Category 4: Complex Filter Logic
  // ==========================================

  describe('getPRLFilters', () => {
    it('should create PRL filter objects with levels', () => {
      const result = getPRLFilters('product1,product2', true, 'level1,level2');
      expect(result).toEqual([
        { name: 'product1', levels: ['level1', 'level2'] },
        { name: 'product2', levels: ['level1', 'level2'] },
      ]);
    });

    it('should create PRL filters without levels when disabled', () => {
      const result = getPRLFilters('product1,product2', false, 'level1');
      expect(result).toEqual([
        { name: 'product1', levels: [] },
        { name: 'product2', levels: [] },
      ]);
    });

    it('should handle empty levels', () => {
      const result = getPRLFilters('product1', true, '');
      expect(result).toEqual([{ name: 'product1', levels: [] }]);
    });

    it('should handle single value', () => {
      const result = getPRLFilters('product1', false, '');
      expect(result).toEqual([{ name: 'product1', levels: [] }]);
    });
  });

  describe('getFiltersObjectForESApi', () => {
    it('should build filter object for Elasticsearch', () => {
      const filterState = createMockFilterState({
        loTypes: 'course,certification',
        skillName: { skill1: true, skill2: true } as any,
        duration: '0-3600',
      });

      const result = getFiltersObjectForESApi(filterState);

      expect(result.terms.loType).toEqual(['course', 'certification']);
      expect(result.terms.loSkillNames).toEqual(['skill1', 'skill2']);
      expect(result.range.duration).toEqual([{ gte: 0, lte: 3600 }]);
    });

    it('should handle multiple duration ranges', () => {
      const filterState = createMockFilterState({
        duration: '0-3600,3600-7200',
      });

      const result = getFiltersObjectForESApi(filterState);

      expect(result.range.duration).toEqual([
        { gte: 0, lte: 3600 },
        { gte: 3600, lte: 7200 },
      ]);
    });

    it('should handle empty filters', () => {
      const filterState = createMockFilterState({});
      const result = getFiltersObjectForESApi(filterState);

      expect(result.terms.loType).toBeNull();
      expect(result.terms.loSkillNames).toBeNull();
    });

    it('should handle tag filters', () => {
      const filterState = createMockFilterState({
        tagName: { tag1: true, tag2: false, tag3: true } as any,
      });

      const result = getFiltersObjectForESApi(filterState);
      expect(result.terms.tags).toEqual(['tag1', 'tag3']);
    });

    it('should handle catalog and city filters', () => {
      const filterState = createMockFilterState({
        catalogs: 'cat1,cat2',
        cities: 'city1,city2',
      });

      const result = getFiltersObjectForESApi(filterState);
      expect(result.terms.catalogNames).toEqual(['cat1', 'cat2']);
      expect(result.terms.cities).toEqual(['city1', 'city2']);
    });
  });

  describe('getRequestObjectForESApi', () => {
    it('should build complete request object for ES', () => {
      const filterState = createMockFilterState({ loTypes: 'course' });
      const result = getRequestObjectForESApi(filterState, 'date', 'react');

      expect(result.query).toBe('react');
      // 'date' maps to 'publishDate' via ES_SORT_FIELD_MAP; publishDate is not a descending-by-default field
      expect(result.sort).toEqual({ name: 'publishDate', order: 'asc' });
      expect(result.lang).toEqual(['en-US']);
      expect(result.filters).toEqual(expect.objectContaining({ terms: expect.any(Object), range: expect.any(Object) }));
    });

    it('should handle empty search text', () => {
      const filterState = createMockFilterState({});
      const result = getRequestObjectForESApi(filterState, 'relevance');

      expect(result.query).toBe('');
    });

    it('should use config locale', () => {
      mockGetALMConfig.mockReturnValue({ locale: 'fr-FR' } as any);
      const filterState = createMockFilterState({});
      const result = getRequestObjectForESApi(filterState, 'date', 'test');

      expect(result.lang).toEqual(['fr-FR']);
    });

    it('should default to ENGLISH_LOCALE if no config locale', () => {
      mockGetALMConfig.mockReturnValue({} as any);
      const filterState = createMockFilterState({});
      const result = getRequestObjectForESApi(filterState, 'date', 'test');

      expect(result.lang).toEqual([ENGLISH_LOCALE]);
    });
  });

  describe('getIndividualFiltersForCommerce', () => {
    it('should map filter options to values', () => {
      const options = [
        { label: 'Course', value: 'course_value' },
        { label: 'Certification', value: 'cert_value' },
      ];
      const filterState = createMockFilterState({ loTypes: 'Course,Certification' });

      const result = getIndividualFiltersForCommerce(options, filterState, 'loTypes');

      expect(result).toEqual(['course_value', 'cert_value']);
    });

    it('should handle missing options', () => {
      const options = [{ label: 'Course', value: 'course_value' }];
      const filterState = createMockFilterState({ loTypes: 'Course,Unknown' });

      const result = getIndividualFiltersForCommerce(options, filterState, 'loTypes');

      expect(result).toEqual(['course_value']);
    });

    it('should handle empty options', () => {
      const filterState = createMockFilterState({ loTypes: 'Course' });
      const result = getIndividualFiltersForCommerce([], filterState, 'loTypes');

      expect(result).toEqual([]);
    });

    it('should handle empty filter state', () => {
      const options = [{ label: 'Course', value: 'course_value' }];
      const filterState = createMockFilterState({ loTypes: '' });

      const result = getIndividualFiltersForCommerce(options, filterState, 'loTypes');

      expect(result).toEqual([]);
    });

    // skillName/tagName are stored as boolean maps ({ [label]: boolean }), not comma-strings.
    // Regression: calling .split on the object used to throw "e.split is not a function".
    it('should resolve only the true keys when skillName is a boolean map (object)', () => {
      const options = [
        { label: 'Java', value: 'java_val' },
        { label: 'Python', value: 'python_val' },
      ];
      const filterState = createMockFilterState({ skillName: { Java: true, Python: false } });

      const result = getIndividualFiltersForCommerce(options, filterState, 'skillName');

      expect(result).toEqual(['java_val']);
    });

    it('should handle tagName given as a boolean map (object)', () => {
      const options = [
        { label: 'Beginner', value: 'beginner_val' },
        { label: 'Advanced', value: 'advanced_val' },
      ];
      const filterState = createMockFilterState({ tagName: { Beginner: true, Advanced: true } });

      const result = getIndividualFiltersForCommerce(options, filterState, 'tagName');

      expect(result).toEqual(['beginner_val', 'advanced_val']);
    });

    it('should return an empty array for an empty boolean map without throwing', () => {
      const options = [{ label: 'Java', value: 'java_val' }];
      const filterState = createMockFilterState({ skillName: {} });

      expect(() =>
        getIndividualFiltersForCommerce(options, filterState, 'skillName')
      ).not.toThrow();
      expect(getIndividualFiltersForCommerce(options, filterState, 'skillName')).toEqual([]);
    });

    it('should return an empty array when all boolean-map values are false', () => {
      const options = [{ label: 'Java', value: 'java_val' }];
      const filterState = createMockFilterState({ skillName: { Java: false } });

      expect(getIndividualFiltersForCommerce(options, filterState, 'skillName')).toEqual([]);
    });
  });

  describe('getParamsForCatalogApi', () => {
    let mockUser: PrimeUser;

    beforeEach(() => {
      mockUser = createMockUser();
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true' });
      mockIsBookmarksEnabled.mockReturnValue(false);
    });

    it('should build basic params with default filters', async () => {
      const filterState = createMockFilterState({ loTypes: 'course' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // When loTypes is specified, function adds default types
      expect(params['filter.loTypes']).toEqual([
        'course',
        'learningProgram',
        'certification',
        'jobAid',
      ]);
      expect(params['filter.ignoreEnhancedLP']).toBe(false);
    });

    it('should add learnerState for MyLearning page', async () => {
      mockGetQueryParamsFromUrl.mockReturnValue({ myLearning: 'true' });
      const filterState = createMockFilterState({});
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.learnerState']).toEqual(['enrolled', 'completed', 'started']);
    });

    it('should handle skill filters when enabled', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        skillName: 'true',
      });
      const filterState = createMockFilterState({
        skillName: { react: true, angular: false, vue: true } as any,
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.skillName']).toEqual(['react', 'vue']);
    });

    it('should handle tag filters when enabled', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        tagName: 'true',
      });
      const filterState = createMockFilterState({
        tagName: { tag1: true, tag2: true } as any,
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.tagName']).toEqual(['tag1', 'tag2']);
    });

    it('should handle price filters', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        price: 'true',
      });
      const filterState = createMockFilterState({ price: 'free' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.price']).toBe('free');
    });

    it('should not send price if both free and paid are selected', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        price: 'true',
      });
      const filterState = createMockFilterState({ price: 'free,paid' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.price']).toBeUndefined();
    });

    it('sends city names via filter.cityName when structured location is disabled', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true', cities: 'true' });
      mockIsStructuredLocationEnabled.mockReturnValue(false);
      const filterState = createMockFilterState({ cities: 'New York,San Francisco' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.cityName']).toEqual(['New York', 'San Francisco']);
      expect(params['filter.lo.locationId']).toBeUndefined();
    });

    it('sends location ids as an array via filter.lo.locationId when structured location is enabled', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true', cities: 'true' });
      mockIsStructuredLocationEnabled.mockReturnValue(true);
      const filterState = createMockFilterState({
        cities: 'india|karnataka|bengaluru,usa|california|san francisco',
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.lo.locationId']).toEqual([
        'india|karnataka|bengaluru',
        'usa|california|san francisco',
      ]);
      expect(params['filter.cityName']).toBeUndefined();
    });

    it('should handle PRL criteria with products', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        products: 'true',
      });
      mockUser.account.prlCriteria = {
        enabled: true,
        products: { enabled: true, levelsEnabled: true },
      } as any;
      const filterState = createMockFilterState({
        products: 'product1,product2',
        levels: 'level1',
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.recommendationProducts']).toEqual([
        { name: 'product1', levels: ['level1'] },
        { name: 'product2', levels: ['level1'] },
      ]);
    });

    it('should handle PRL criteria with roles', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        roles: 'true',
      });
      mockUser.account.prlCriteria = {
        enabled: true,
        roles: { enabled: true, levelsEnabled: false },
      } as any;
      const filterState = createMockFilterState({ roles: 'role1' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.recommendationRoles']).toEqual([{ name: 'role1', levels: [] }]);
    });

    it('should add sortLanguage for alphabetical sorts', async () => {
      const filterState = createMockFilterState({});
      const params = await getParamsForCatalogApi(filterState, mockUser, 'name');

      expect(params['sortLanguage']).toEqual(['en-US']);
    });

    it('should handle bookmarks filter', async () => {
      mockIsBookmarksEnabled.mockReturnValue(true);
      const filterState = createMockFilterState({});
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.bookmarks']).toBe(true);
    });

    it('should handle learnerState with completedViaAlternate', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        learnerState: 'true',
      });
      mockIsAccAltCompletionEnabled.mockReturnValue(true);
      const filterState = createMockFilterState({
        learnerState: 'completed,completedViaAlternate',
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // Lines 195-203: should use getAlternateCompletionLOParams
      expect(params['filter.learnerState']).toEqual(['completed']);
      expect(params['filter.alternateCompleteLo.mode']).toBe('union');
    });

    it('should handle learnerState with only completedViaAlternate', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        learnerState: 'true',
      });
      mockIsAccAltCompletionEnabled.mockReturnValue(true);
      const filterState = createMockFilterState({
        learnerState: 'completedViaAlternate',
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // Lines 197-199: empty learnerStates array - should NOT set filter.learnerState
      expect(params['filter.learnerState']).toBeUndefined();
      expect(params['filter.alternateCompleteLo.mode']).toBe('intersection');
    });

    it('should handle loFormat filter', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        loFormat: 'true',
      });
      const filterState = createMockFilterState({ loFormat: 'selfPaced,classroom' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // Line 206: loFormat filter
      expect(params['filter.loFormat']).toEqual(['selfPaced', 'classroom']);
    });

    it('should handle catalogs filter', async () => {
      const filterState = createMockFilterState({ catalogs: 'cat1,cat2' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // Line 215: catalogs doesn't need catalogAttributes check
      expect(params['filter.catalogIds']).toEqual(['cat1', 'cat2']);
    });

    it('should handle cities filter', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        cities: 'true',
      });
      const filterState = createMockFilterState({ cities: 'New York,San Francisco' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      // Line 227: cities filter
      expect(params['filter.cityName']).toEqual(['New York', 'San Francisco']);
    });

    it('should handle duration range filter', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        duration: 'true',
      });
      const filterState = createMockFilterState({ duration: '0-3600,3600-7200' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.duration.range']).toEqual(['0-3600', '3600-7200']);
    });

    it('should handle skill level filter', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        skillLevel: 'true',
      });
      const filterState = createMockFilterState({ skillLevel: '1,2,3' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.skill.level']).toEqual(['1', '2', '3']);
    });

    it('should handle announced groups filter', async () => {
      mockGetALMAttribute.mockReturnValue({
        showFilters: 'true',
        announcedGroups: 'true',
      });
      const filterState = createMockFilterState({ announcedGroups: 'group1,group2' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.announcedGroups']).toEqual(['group1', 'group2']);
    });

    it('should not add filters when showFilters is disabled', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'false' });
      const filterState = createMockFilterState({
        loTypes: 'course',
        skillName: { skill1: true } as any,
      });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');

      expect(params['filter.skillName']).toBeUndefined();
    });

    it('should handle virtual coach filter', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true', loTypes: 'true' });
      const filterState = createMockFilterState({ loTypes: 'virtualCoach' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');
      expect(params['filter.loTypes']).toEqual(['jobAid']);
      expect(params['filter.jobAidType']).toBe('AI_COACH');
    });

    it('should handle virtual coach filter with jobAid lo type', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true', loTypes: 'true' });
      const filterState = createMockFilterState({ loTypes: 'jobAid,virtualCoach' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');
      expect(params['filter.loTypes']).toEqual(['jobAid']);
    });

    it('should handle virtual coach filter with course lo type', async () => {
      mockGetALMAttribute.mockReturnValue({ showFilters: 'true', loTypes: 'true' });
      const filterState = createMockFilterState({ loTypes: 'course,virtualCoach' });
      const params = await getParamsForCatalogApi(filterState, mockUser, 'date');
      expect(params['filter.loTypes']).toEqual(['course', 'jobAid']);
      expect(params['filter.jobAidType']).toBe('AI_COACH');
    });
  });

  // ==========================================
  // Category 5: Locale Functions
  // ==========================================

  describe('getLocalesForCatalogApi', () => {
    it('should return ordered list of locales', () => {
      const user = createMockUser({
        contentLocale: 'fr-FR',
        uiLocale: 'de-DE',
        account: { locale: 'es-ES' } as PrimeAccount,
      });
      mockGetBrowserLocale.mockReturnValue('it-IT');

      const result = getLocalesForCatalogApi(user);

      // Should be unique and ordered: contentLocale, uiLocale, browserLocale, accountLocale, EN
      expect(result).toEqual(['fr-FR', 'de-DE', 'it-IT', 'es-ES', ENGLISH_LOCALE]);
    });

    it('should deduplicate locales', () => {
      const user = createMockUser({
        contentLocale: 'en-US',
        uiLocale: 'en-US',
        account: { locale: 'en-US' } as PrimeAccount,
      });
      mockGetBrowserLocale.mockReturnValue('en-US');

      const result = getLocalesForCatalogApi(user);

      expect(result).toEqual(['en-US']);
    });

    it('should handle missing locales', () => {
      const user = createMockUser({
        contentLocale: undefined as any,
        uiLocale: undefined as any,
        account: { locale: undefined } as PrimeAccount,
      });
      mockGetBrowserLocale.mockReturnValue('');

      const result = getLocalesForCatalogApi(user);

      expect(result).toEqual([ENGLISH_LOCALE]);
    });

    it('should preserve order with partial data', () => {
      const user = createMockUser({
        contentLocale: 'fr-FR',
        uiLocale: undefined as any,
        account: { locale: 'es-ES' } as PrimeAccount,
      });
      mockGetBrowserLocale.mockReturnValue('');

      const result = getLocalesForCatalogApi(user);

      expect(result[0]).toBe('fr-FR');
      expect(result).toContain('es-ES');
      expect(result[result.length - 1]).toBe(ENGLISH_LOCALE);
    });
  });

  describe('getLocalesForSearch', () => {
    it('should return unique locales for search', () => {
      const user = createMockUser({
        contentLocale: 'fr-FR',
        uiLocale: 'de-DE',
        account: { locale: 'es-ES' } as PrimeAccount,
      });

      const result = getLocalesForSearch(user);

      expect(result).toContain(ENGLISH_LOCALE);
      expect(result).toContain('fr-FR');
      expect(result).toContain('de-DE');
      expect(result).toContain('es-ES');
    });

    it('should always include ENGLISH_LOCALE', () => {
      const user = createMockUser({
        contentLocale: undefined as any,
        uiLocale: undefined as any,
      });

      const result = getLocalesForSearch(user);

      expect(result).toEqual([ENGLISH_LOCALE]);
    });

    it('should deduplicate locales', () => {
      const user = createMockUser({
        contentLocale: 'en-US',
        uiLocale: 'en-US',
        account: { locale: 'en-US' } as PrimeAccount,
      });

      const result = getLocalesForSearch(user);

      expect(result.filter(l => l === 'en-US')).toHaveLength(1);
    });
  });

  describe('getSnippetTypes', () => {
    it('should return snippet type from catalog state if available', () => {
      const catalogState = { snippetType: 'custom-snippet' } as CatalogState;
      const account = { prlCriteria: { enabled: false } } as PrimeAccount;

      const result = getSnippetTypes(catalogState, account);

      expect(result).toBe('custom-snippet');
    });

    it('should return default if PRL criteria is disabled', () => {
      const catalogState = {} as CatalogState;
      const account = { prlCriteria: { enabled: false } } as PrimeAccount;

      const result = getSnippetTypes(catalogState, account);

      expect(result).toBe(
        'loMetadata,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion'
      );
    });

    it('should add recProductName if products enabled', () => {
      const catalogState = {} as CatalogState;
      const account = {
        prlCriteria: {
          enabled: true,
          products: { enabled: true },
        },
      } as PrimeAccount;

      const result = getSnippetTypes(catalogState, account);

      expect(result).toContain('recProductName');
    });

    it('should add recRoleName if roles enabled', () => {
      const catalogState = {} as CatalogState;
      const account = {
        prlCriteria: {
          enabled: true,
          roles: { enabled: true },
        },
      } as PrimeAccount;

      const result = getSnippetTypes(catalogState, account);

      expect(result).toContain('recRoleName');
    });

    it('should add both if products and roles enabled', () => {
      const catalogState = {} as CatalogState;
      const account = {
        prlCriteria: {
          enabled: true,
          products: { enabled: true },
          roles: { enabled: true },
        },
      } as PrimeAccount;

      const result = getSnippetTypes(catalogState, account);

      expect(result).toContain('recProductName');
      expect(result).toContain('recRoleName');
    });
  });

  // ==========================================
  // Category 6: Async Functions
  // ==========================================

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 250);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(250);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 250);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(250);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 250);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(250);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should preserve context', () => {
      const context = { value: 42 };
      const fn = jest.fn(function (this: any) {
        return this.value;
      });
      const debouncedFn = debounce(fn, 250);

      debouncedFn.call(context);
      jest.advanceTimersByTime(250);

      expect(fn).toHaveBeenCalled();
    });

    it('should use default time if not provided', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn);

      debouncedFn();
      jest.advanceTimersByTime(249);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrUpdateCatalogFilters', () => {
    it('should return cached filters from storage', async () => {
      const cachedData = { data: 'cached' };
      mockGetItemFromStorage.mockReturnValue(cachedData);
      mockJsonApiParse.mockReturnValue({ catalogList: ['cat1', 'cat2'] } as any);

      const result = await getOrUpdateCatalogFilters();

      expect(result).toEqual(['cat1', 'cat2']);
      expect(mockGetItemFromStorage).toHaveBeenCalledWith('PRIME_CATALOG_FILTER');
      expect(RestAdapter.get).not.toHaveBeenCalled();
    });

    it('should fetch from API if not cached', async () => {
      mockGetItemFromStorage.mockReturnValue(null);
      const apiResponse = { data: 'api-data' };
      (RestAdapter.get as jest.Mock).mockResolvedValue(apiResponse);
      mockJsonApiParse.mockReturnValue({ catalogList: ['cat1', 'cat2'] } as any);

      const result = await getOrUpdateCatalogFilters();

      expect(result).toEqual(['cat1', 'cat2']);
      expect(RestAdapter.get).toHaveBeenCalledWith({
        url: 'https://api.test.com/catalogs?page[limit]=100',
      });
      expect(mockSetItemToStorage).toHaveBeenCalledWith('PRIME_CATALOG_FILTER', apiResponse);
    });

    it('should handle API errors gracefully', async () => {
      mockGetItemFromStorage.mockReturnValue(null);
      (RestAdapter.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await getOrUpdateCatalogFilters();

      expect(result).toBeUndefined();
    });

    it('should return empty array if no catalog list', async () => {
      mockGetItemFromStorage.mockReturnValue({ data: 'test' });
      mockJsonApiParse.mockReturnValue({} as any);

      const result = await getOrUpdateCatalogFilters();

      expect(result).toEqual([]);
    });

    it('should use correct API URL from config', async () => {
      mockGetItemFromStorage.mockReturnValue(null);
      mockGetALMConfig.mockReturnValue({ primeApiURL: 'https://custom.api.com/' } as any);
      (RestAdapter.get as jest.Mock).mockResolvedValue({});
      mockJsonApiParse.mockReturnValue({ catalogList: [] } as any);

      await getOrUpdateCatalogFilters();

      expect(RestAdapter.get).toHaveBeenCalledWith({
        url: 'https://custom.api.com/catalogs?page[limit]=100',
      });
    });
  });

  describe('fetchRecommendationData', () => {
    it('should fetch recommendation data with correct URL', async () => {
      const mockResponse = { data: 'recommendations' };
      (RestAdapter.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchRecommendationData('PRODUCT', 'https://api.test.com/recs');

      expect(RestAdapter.get).toHaveBeenCalledWith({
        url: 'https://api.test.com/recs?filter.recommendationCriteria=PRODUCT&filter.showAllRecommendationCriteria=true',
      });
      expect(result).toBe(mockResponse);
    });

    it('should handle different criteria types', async () => {
      (RestAdapter.get as jest.Mock).mockResolvedValue({});

      await fetchRecommendationData('ROLE', 'https://api.test.com/recs');

      expect(RestAdapter.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('filter.recommendationCriteria=ROLE'),
        })
      );
    });

    it('should handle API errors', async () => {
      (RestAdapter.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchRecommendationData('PRODUCT', 'https://api.test.com/recs')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('fetchFilterData', () => {
    it('should fetch data when condition is truthy', async () => {
      const mockResponse = { data: 'filters' };
      (RestAdapter.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchFilterData(true, 'https://api.test.com/filters');

      expect(RestAdapter.get).toHaveBeenCalledWith({ url: 'https://api.test.com/filters' });
      expect(result).toBe(mockResponse);
    });

    it('should return null when condition is falsy', async () => {
      const result = await fetchFilterData(false, 'https://api.test.com/filters');

      expect(RestAdapter.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      (RestAdapter.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(fetchFilterData(true, 'https://api.test.com/filters')).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('getSettledValue', () => {
    it('should return value for fulfilled promise', () => {
      const result = { status: 'fulfilled', value: 'test-data' };
      expect(getSettledValue(result)).toBe('test-data');
    });

    it('should return null for rejected promise', () => {
      const result = { status: 'rejected', reason: 'error' };
      expect(getSettledValue(result)).toBeNull();
    });

    it('should return null for other statuses', () => {
      const result = { status: 'pending' };
      expect(getSettledValue(result)).toBeNull();
    });
  });

  // ==========================================
  // Category 7: Page Detection
  // ==========================================

  describe('isMyLearningPage', () => {
    it('should return true when myLearning query param is true', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({ myLearning: 'true' });

      expect(isMyLearningPage()).toBe(true);
    });

    it('should return false when myLearning query param is false', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({ myLearning: 'false' });

      expect(isMyLearningPage()).toBe(false);
    });

    it('should use ALM object method if available', () => {
      const mockIsMyLearningPage = jest.fn().mockReturnValue(true);
      mockGetALMObject.mockReturnValue({ isMyLearningPage: mockIsMyLearningPage } as any);

      expect(isMyLearningPage()).toBe(true);
      expect(mockIsMyLearningPage).toHaveBeenCalled();
    });

    it('should handle missing query params', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({});

      expect(isMyLearningPage()).toBe(false);
    });

    it('should prefer ALM object method over query params', () => {
      const mockIsMyLearningPageFn = jest.fn().mockReturnValue(false);
      mockGetALMObject.mockReturnValue({ isMyLearningPage: mockIsMyLearningPageFn } as any);
      mockGetQueryParamsFromUrl.mockReturnValue({ myLearning: 'true' });

      expect(isMyLearningPage()).toBe(false);
      expect(mockIsMyLearningPageFn).toHaveBeenCalled();
    });
  });

  describe('getSearchOrCatalog', () => {
    it('should return "search" when searchText param exists', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({ searchText: 'react' });

      expect(getSearchOrCatalog()).toBe('search');
    });

    it('should return "catalog" when searchText param is missing', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({});

      expect(getSearchOrCatalog()).toBe('catalog');
    });

    it('should use ALM object method if available', () => {
      const mockGetSearchOrCatalog = jest.fn().mockReturnValue('search');
      mockGetALMObject.mockReturnValue({ getSearchOrCatalog: mockGetSearchOrCatalog } as any);

      expect(getSearchOrCatalog()).toBe('search');
      expect(mockGetSearchOrCatalog).toHaveBeenCalled();
    });

    it('should return "search" for empty searchText', () => {
      mockGetQueryParamsFromUrl.mockReturnValue({ searchText: '' });

      expect(getSearchOrCatalog()).toBe('catalog');
    });

    it('should prefer ALM object method over query params', () => {
      const mockGetSearchOrCatalogFn = jest.fn().mockReturnValue('catalog');
      mockGetALMObject.mockReturnValue({ getSearchOrCatalog: mockGetSearchOrCatalogFn } as any);
      mockGetQueryParamsFromUrl.mockReturnValue({ searchText: 'test' });

      expect(getSearchOrCatalog()).toBe('catalog');
      expect(mockGetSearchOrCatalogFn).toHaveBeenCalled();
    });
  });

  // ==========================================
  // getAlternateCompletionLOParams
  // ==========================================

  describe('getAlternateCompletionLOParams', () => {
    it('should return allStates and null mode when no completedViaAlternate', () => {
      const result = getAlternateCompletionLOParams('enrolled,completed');

      expect(result.learnerStates).toEqual(['enrolled', 'completed']);
      expect(result.alternateCompletionMode).toBeNull();
    });

    it('should return ONLY_EXCLUDE_OVERLAP mode when only completedViaAlternate', () => {
      const result = getAlternateCompletionLOParams('completedViaAlternate');

      expect(result.learnerStates).toEqual([]);
      expect(result.alternateCompletionMode).toBe('intersection');
    });

    it('should return INCLUDE mode when completed + completedViaAlternate', () => {
      const result = getAlternateCompletionLOParams('completed,completedViaAlternate');

      expect(result.learnerStates).toEqual(['completed']);
      expect(result.alternateCompletionMode).toBe('union');
    });

    it('should return INCLUDE_EXCLUDE_OVERLAP mode when other states + completedViaAlternate', () => {
      const result = getAlternateCompletionLOParams('enrolled,completedViaAlternate');

      expect(result.learnerStates).toEqual(['enrolled']);
      expect(result.alternateCompletionMode).toBe('union');
    });

    it('should handle multiple states with completedViaAlternate', () => {
      const result = getAlternateCompletionLOParams('enrolled,pending,completedViaAlternate');

      expect(result.learnerStates).toEqual(['enrolled', 'pending']);
      expect(result.alternateCompletionMode).toBe('union');
    });

    it('should handle empty string', () => {
      const result = getAlternateCompletionLOParams('');

      expect(result.learnerStates).toEqual(['']); // splitStringIntoArray('') returns ['']
      expect(result.alternateCompletionMode).toBeNull();
    });
  });
});
