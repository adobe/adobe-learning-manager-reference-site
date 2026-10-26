/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { WIDGET_SOURCE } from '@utils/constants';

// jest.mock factories are hoisted before const declarations, so variables
// referenced inside factories must be defined inline. Use jest.requireMock()
// after the mock declarations to get references for use in tests.

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn().mockReturnValue({
    primeCdnTrainingBaseEndpoint: 'https://cdn.example.com/training',
    esBaseUrl: 'https://es.example.com',
    almCdnBaseUrl: 'https://cdn.alm.example.com',
    locale: 'en-US',
  }),
  isUserLoggedIn: jest.fn(),
  redirectToLoginAndAbort: jest.fn(),
  getQueryParamsFromUrl: jest.fn(),
  setALMAttribute: jest.fn(),
  getALMUser: jest.fn(),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGlobal = jest.requireMock('@utils/global');
const mockGetALMConfig: jest.Mock = mockGlobal.getALMConfig;
const mockIsUserLoggedIn: jest.Mock = mockGlobal.isUserLoggedIn;
const mockRedirectToLoginAndAbort: jest.Mock = mockGlobal.redirectToLoginAndAbort;
const mockGetQueryParamsFromUrl: jest.Mock = mockGlobal.getQueryParamsFromUrl;
const mockSetALMAttribute: jest.Mock = mockGlobal.setALMAttribute;
const mockGetALMUser: jest.Mock = mockGlobal.getALMUser;

const mockRestAdapter = jest.requireMock('@utils/restAdapter').RestAdapter;
const mockRestAdapterGet: jest.Mock = mockRestAdapter.get;
const mockRestAdapterPost: jest.Mock = mockRestAdapter.post;

const mockParseESResponse = jest.fn((results: unknown) => results || []);

const mockAkamaiGetTraining = jest.fn();

jest.mock('@utils/catalog', () => ({
  getRequestObjectForESApi: jest.fn(() => ({ query: '', filters: {} })),
}));

jest.mock('@utils/filters', () => ({
  getDefaultFiltersState: jest.fn(() => ({
    skillName: { list: [] },
    tagName: { list: [] },
    catalogs: { list: [] },
    cities: { list: [] },
    products: { list: [] },
    roles: { list: [] },
    levels: { list: [] },
  })),
  updateFilterList: jest.fn((list: unknown) => list),
  getESSearchFilterList: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@utils/jsonAPIAdapter', () => ({
  parseESResponse: (results: unknown) => mockParseESResponse(results),
}));

jest.mock('@utils/lo-utils', () => ({
  defaultCartValues: { redirectionUrl: '', error: [''] },
}));

jest.mock('@common/ALMCustomHooks', () => ({
  __esModule: true,
  default: {
    getTraining: jest.fn(),
    getTrainings: jest.fn(),
    loadMoreTrainings: jest.fn(),
    getTrainingsForAuthor: jest.fn(),
    loadMore: jest.fn(),
    getTrainingInstanceSummary: jest.fn(),
    enrollToTraining: jest.fn(),
    unenrollFromTraining: jest.fn(),
    getFilters: jest.fn(),
    getUsersBadges: jest.fn(),
    loadMoreBadges: jest.fn(),
    getAllDiscussions: jest.fn(),
    loadMoreDiscussion: jest.fn(),
    postDiscussion: jest.fn(),
    deleteDiscussion: jest.fn(),
    getCatalogsByIds: jest.fn(),
    fetchCourseInstanceMapping: jest.fn(),
    getCoursePathWidgetTrainings: jest.fn(),
    getCategoryWidgetData: jest.fn(),
    getSearchFilterList: jest.fn(),
  },
  DEFAULT_PAGE_LIMIT: 9,
}));

const mockALM = jest.requireMock('@common/ALMCustomHooks').default;

jest.mock('@common/AkamaiCustomHooks', () => ({
  __esModule: true,
  default: { getTraining: (id: string, params: unknown) => mockAkamaiGetTraining(id, params) },
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: { registerServiceInstance: jest.fn() },
}));

import ESCustomHooksInstance from '@common/ESCustomHooks';

const ES_BASE_URL = 'https://es.example.com';
const mockConfig = {
  primeCdnTrainingBaseEndpoint: 'https://cdn.example.com/training',
  esBaseUrl: ES_BASE_URL,
  almCdnBaseUrl: 'https://cdn.alm.example.com',
  locale: 'en-US',
};

describe('ESCustomHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue(mockConfig);
    mockIsUserLoggedIn.mockReturnValue(false);
    mockRedirectToLoginAndAbort.mockReturnValue(false);
    mockGetQueryParamsFromUrl.mockReturnValue({});
    mockGetALMUser.mockResolvedValue({ user: {} });
    mockRestAdapterGet.mockResolvedValue(JSON.stringify({ terms: {} }));
    mockRestAdapterPost.mockResolvedValue(JSON.stringify({ results: [], next: '' }));
    mockParseESResponse.mockImplementation((results: unknown) => results || []);
    const mockFilters = jest.requireMock('@utils/filters');
    mockFilters.getDefaultFiltersState.mockReturnValue({
      skillName: { list: [] },
      tagName: { list: [] },
      catalogs: { list: [] },
      cities: { list: [] },
      products: { list: [] },
      roles: { list: [] },
      levels: { list: [] },
    });
    mockFilters.updateFilterList.mockImplementation((list: unknown) => list);
    mockFilters.getESSearchFilterList.mockResolvedValue([]);
    jest.requireMock('@utils/catalog').getRequestObjectForESApi.mockReturnValue({ query: '', filters: {} });
    ESCustomHooksInstance.setConfigUrls();
  });

  describe('setConfigUrls', () => {
    it('setConfigUrls_updatesEsBaseUrlFromNewConfig', () => {
      mockGetALMConfig.mockReturnValue({ ...mockConfig, esBaseUrl: 'https://new-es.example.com' });

      ESCustomHooksInstance.setConfigUrls();

      expect(ESCustomHooksInstance.esBaseUrl).toBe('https://new-es.example.com');
    });
  });

  describe('getTraining', () => {
    it('getTraining_alwaysDelegatesToAkamai_withCorrectArgs', async () => {
      const mockLO = { id: 'course:123' };
      mockAkamaiGetTraining.mockResolvedValue(mockLO);

      const result = await ESCustomHooksInstance.getTraining('course:123', { include: 'instances' });

      expect(mockAkamaiGetTraining).toHaveBeenCalledWith('course:123', { include: 'instances' });
      expect(result).toEqual(mockLO);
    });

    it('getTraining_loggedIn_stillDelegatesToAkamai', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);

      await ESCustomHooksInstance.getTraining('course:123', {});

      expect(mockAkamaiGetTraining).toHaveBeenCalledWith('course:123', {});
      expect(mockALM.getTraining).not.toHaveBeenCalled();
    });
  });

  describe('getTrainings', () => {
    it('getTrainings_loggedIn_delegatesToALMWithCorrectArgs', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const mockResult = { trainings: [], next: '', meta: {} };
      mockALM.getTrainings.mockResolvedValue(mockResult);
      const filterState = {} as any;

      const result = await ESCustomHooksInstance.getTrainings(filterState, 'date', 'test', true);

      expect(mockALM.getTrainings).toHaveBeenCalledWith(filterState, 'date', 'test', true);
      expect(result).toEqual(mockResult);
      expect(mockRestAdapterPost).not.toHaveBeenCalled();
    });

    it('getTrainings_notLoggedIn_postsToEsSearchEndpoint', async () => {
      mockRestAdapterPost.mockResolvedValue(JSON.stringify({ results: [{ id: 'course:1' }], next: 'next-cursor', count: 42 }));

      const result = await ESCustomHooksInstance.getTrainings({} as any, 'date', '', false);

      expect(mockRestAdapterPost).toHaveBeenCalledWith(
        expect.objectContaining({ url: `${ES_BASE_URL}/search?size=9` })
      );
      expect(result.trainings).toEqual([{ id: 'course:1' }]);
      expect(result.next).toBe('next-cursor');
      expect(result.meta).toEqual({ formalCount: 42 });
    });

    it('getTrainings_nullEsBaseUrl_refreshesConfigBeforePost', async () => {
      (ESCustomHooksInstance as any).esBaseUrl = null;

      await ESCustomHooksInstance.getTrainings({} as any, 'date', '', false);

      expect(mockRestAdapterPost).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining(ES_BASE_URL) })
      );
    });
  });

  describe('loadMoreTrainings', () => {
    it('loadMoreTrainings_loggedIn_delegatesToALM', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);

      await ESCustomHooksInstance.loadMoreTrainings({} as any, 'date', '', 'https://next', false);

      expect(mockALM.loadMoreTrainings).toHaveBeenCalledWith({}, 'date', '', 'https://next', false);
      expect(mockRestAdapterPost).not.toHaveBeenCalled();
    });

    it('loadMoreTrainings_notLoggedIn_postsToProvidedUrl_returnsLearningObjectListAndNext', async () => {
      const url = 'https://es.example.com/search?page=1';
      mockRestAdapterPost.mockResolvedValue(JSON.stringify({ results: [{ id: 'course:1' }], next: 'page-2' }));

      const result = await ESCustomHooksInstance.loadMoreTrainings({} as any, 'date', '', url, false);

      expect(mockRestAdapterPost).toHaveBeenCalledWith(expect.objectContaining({ url }));
      expect(result!.learningObjectList).toEqual([{ id: 'course:1' }]);
      expect(result!.links.next).toBe('page-2');
    });
  });

  describe('loadMore', () => {
    it('loadMore_redirectTrue_returnsUndefined', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await ESCustomHooksInstance.loadMore('https://next');

      expect(result).toBeUndefined();
      expect(mockALM.loadMore).not.toHaveBeenCalled();
    });

    it('loadMore_loggedIn_delegatesToALM', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const mockData = { learningObjectList: [] };
      mockALM.loadMore.mockResolvedValue(mockData);

      const result = await ESCustomHooksInstance.loadMore('https://next');

      expect(mockALM.loadMore).toHaveBeenCalledWith('https://next');
      expect(result).toEqual(mockData);
    });

    it('loadMore_notLoggedIn_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.loadMore('https://next');

      expect(result).toBeUndefined();
    });
  });

  describe('auth-gated methods — redirectToLoginAndAbort returns true', () => {
    beforeEach(() => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);
    });

    it('enrollToTraining_redirectTrue_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.enrollToTraining({});
      expect(result).toBeUndefined();
      expect(mockALM.enrollToTraining).not.toHaveBeenCalled();
    });

    it('unenrollFromTraining_redirectTrue_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.unenrollFromTraining('enroll123');
      expect(result).toBeUndefined();
      expect(mockALM.unenrollFromTraining).not.toHaveBeenCalled();
    });

    it('getAllDiscussions_redirectTrue_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.getAllDiscussions({}, 'course:123');
      expect(result).toBeUndefined();
      expect(mockALM.getAllDiscussions).not.toHaveBeenCalled();
    });
  });

  describe('not-logged-in guard', () => {
    it('getTrainingsForAuthor_notLoggedIn_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.getTrainingsForAuthor('author1', 'internal', 'date');
      expect(result).toBeUndefined();
      expect(mockALM.getTrainingsForAuthor).not.toHaveBeenCalled();
    });

    it('getTrainingInstanceSummary_notLoggedIn_returnsNull', async () => {
      const result = await ESCustomHooksInstance.getTrainingInstanceSummary('course:123', 'inst456');
      expect(result).toBeNull();
    });

    it('getUsersBadges_notLoggedIn_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.getUsersBadges('user123', {});
      expect(result).toBeUndefined();
    });

    it('getCatalogsByIds_notLoggedIn_returnsNull', async () => {
      const result = await ESCustomHooksInstance.getCatalogsByIds(['cat1']);
      expect(result).toBeNull();
    });

    it('fetchCourseInstanceMapping_notLoggedIn_returnsUndefined', async () => {
      const result = await ESCustomHooksInstance.fetchCourseInstanceMapping({} as any, 'inst456');
      expect(result).toBeUndefined();
    });
  });

  describe('getFilters', () => {
    it('getFilters_loggedIn_delegatesToALM', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const mockFilters = { skillName: { list: [] } };
      mockALM.getFilters.mockResolvedValue(mockFilters);

      const result = await ESCustomHooksInstance.getFilters();

      expect(mockALM.getFilters).toHaveBeenCalled();
      expect(result).toEqual(mockFilters);
      expect(mockRestAdapterGet).not.toHaveBeenCalled();
    });

    it('getFilters_notLoggedIn_getsFilterableDataFromEsEndpoint', async () => {
      mockRestAdapterGet.mockResolvedValue(
        JSON.stringify({ terms: { loSkillNames: ['JavaScript'], tags: ['web'] } })
      );

      await ESCustomHooksInstance.getFilters();

      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: `${ES_BASE_URL}/filterableData`,
      });
    });
  });

  describe('getCoursePathWidgetTrainings', () => {
    beforeEach(() => {
      mockRestAdapterPost.mockResolvedValue(
        JSON.stringify({ results: [{ id: 'course:1' }], next: 'next-cursor' })
      );
    });

    it('getCoursePathWidgetTrainings_loggedIn_delegatesToALM', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const mockResult = { trainings: [], next: '', meta: {} };
      mockALM.getCoursePathWidgetTrainings.mockResolvedValue(mockResult);
      const filters = { loIds: ['course:1'] } as any;
      const pagination = { page: 0, pageLimit: 10 };

      const result = await ESCustomHooksInstance.getCoursePathWidgetTrainings(filters, pagination);

      expect(mockALM.getCoursePathWidgetTrainings).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
      expect(mockRestAdapterPost).not.toHaveBeenCalled();
    });

    it('getCoursePathWidgetTrainings_withLoIds_includesLoIdsInRequestBody', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1', 'course:2'] } as any,
        { page: 0, pageLimit: 10 }
      );

      const call = mockRestAdapterPost.mock.calls[0][0];
      const body = JSON.parse(call.body);
      expect(body.filters.terms.loId).toEqual(['course:1', 'course:2']);
    });

    it('getCoursePathWidgetTrainings_productSource_setsRecommendationProductNamesFilter', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: WIDGET_SOURCE.PRODUCT_SOURCE, sourceDetails: { name: 'TestProduct' } } as any,
        { page: 0, pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.filters.terms.recommendationProductNames).toEqual(['TestProduct']);
    });

    it('getCoursePathWidgetTrainings_roleSource_setsRecommendationRoleNamesFilter', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: WIDGET_SOURCE.ROLE_SOURCE, sourceDetails: { name: 'TestRole' } } as any,
        { page: 0, pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.filters.terms.recommendationRoleNames).toEqual(['TestRole']);
    });

    it('getCoursePathWidgetTrainings_catalogSource_setsCatalogNamesFilter', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: WIDGET_SOURCE.CATALOG_SOURCE, sourceDetails: { name: 'TestCatalog' } } as any,
        { page: 0, pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.filters.terms.catalogNames).toEqual(['TestCatalog']);
    });

    it('getCoursePathWidgetTrainings_urlIncludesPageAndSize', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1'] } as any,
        { page: 2, pageLimit: 15 }
      );

      expect(mockRestAdapterPost).toHaveBeenCalledWith(
        expect.objectContaining({ url: `${ES_BASE_URL}/search?page=2&size=15` })
      );
    });

    it('getCoursePathWidgetTrainings_returnsTrainingsNextAndEmptyMeta', async () => {
      const result = await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1'] } as any,
        { page: 0, pageLimit: 10 }
      );

      expect(Array.isArray(result!.trainings)).toBe(true);
      expect(result!.next).toBe('next-cursor');
      expect(result!.meta).toEqual({});
    });

    it('getCoursePathWidgetTrainings_nullEsBaseUrl_refreshesConfigBeforePost', async () => {
      (ESCustomHooksInstance as any).esBaseUrl = null;

      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1'] } as any,
        { page: 0, pageLimit: 10 }
      );

      expect(mockRestAdapterPost).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining(ES_BASE_URL) })
      );
    });

    it('getCoursePathWidgetTrainings_withLoTypes_includesLoTypeInRequestBody', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1'], loTypes: ['course', 'learningPath'] } as any,
        { page: 0, pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.filters.terms.loType).toEqual(['course', 'learningPath']);
    });

    it('getCoursePathWidgetTrainings_withEmptyLoTypes_omitsLoTypeFromRequestBody', async () => {
      await ESCustomHooksInstance.getCoursePathWidgetTrainings(
        { loIds: ['course:1'], loTypes: [] } as any,
        { page: 0, pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.filters.terms.loType).toBeUndefined();
    });
  });

  describe('getCategoryWidgetData', () => {
    it('getCategoryWidgetData_loggedIn_delegatesToALM', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const mockResult = { categories: [], next: '', meta: {} };
      mockALM.getCategoryWidgetData.mockResolvedValue(mockResult);
      const filters = { source: WIDGET_SOURCE.CATALOG_SOURCE } as any;
      const pagination = { pageLimit: 10 };

      const result = await ESCustomHooksInstance.getCategoryWidgetData(filters, pagination);

      expect(mockALM.getCategoryWidgetData).toHaveBeenCalledWith(filters, pagination);
      expect(result).toEqual(mockResult);
    });

    it('getCategoryWidgetData_catalogSource_setsFlagAndPrefixesIds_usesCatalogInfo', async () => {
      mockRestAdapterPost.mockResolvedValue(
        JSON.stringify({ catalogInfo: [{ id: 'catalog:cat1', name: 'Cat 1' }] })
      );

      const result = await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.CATALOG_SOURCE, sourceIds: ['cat1'] } as any,
        { pageLimit: 10 }
      );

      const call = mockRestAdapterPost.mock.calls[0][0];
      const body = JSON.parse(call.body);
      expect(body.includeCatalogInfo).toBe(true);
      expect(body.catalogIds).toEqual(['catalog:cat1']);
      expect(result!.categories).toEqual([{ id: 'catalog:cat1', name: 'Cat 1' }]);
    });

    it('getCategoryWidgetData_productSource_setsFlagAndPrefixesIds_usesRecommendationProducts', async () => {
      mockRestAdapterPost.mockResolvedValue(
        JSON.stringify({ recommendationProducts: [{ id: 'recommendationProduct:1', name: 'Prod 1' }] })
      );

      const result = await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.PRODUCT_SOURCE, sourceIds: ['1'] } as any,
        { pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.includeRecommendationProducts).toBe(true);
      expect(body.productIds).toEqual(['recommendationProduct:1']);
      expect(result!.categories).toEqual([{ id: 'recommendationProduct:1', name: 'Prod 1' }]);
    });

    it('getCategoryWidgetData_roleSource_setsFlagAndPrefixesIds_usesRecommendationRoles', async () => {
      mockRestAdapterPost.mockResolvedValue(
        JSON.stringify({ recommendationRoles: [{ id: 'recommendationRole:1', name: 'Role 1' }] })
      );

      const result = await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.ROLE_SOURCE, sourceIds: ['1'] } as any,
        { pageLimit: 10 }
      );

      const body = JSON.parse(mockRestAdapterPost.mock.calls[0][0].body);
      expect(body.includeRecommendationRoles).toBe(true);
      expect(body.roleIds).toEqual(['recommendationRole:1']);
      expect(result!.categories).toEqual([{ id: 'recommendationRole:1', name: 'Role 1' }]);
    });

    it('getCategoryWidgetData_categoriesAtPageLimit_setsNextToHasMore', async () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: `cat${i}` }));
      mockRestAdapterPost.mockResolvedValue(JSON.stringify({ catalogInfo: items }));

      const result = await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.CATALOG_SOURCE } as any,
        { pageLimit: 5 }
      );

      expect(result!.next).toBe('has_more');
    });

    it('getCategoryWidgetData_onError_returnsEmptyCategoriesAndEmptyNext', async () => {
      mockRestAdapterPost.mockRejectedValue(new Error('ES error'));

      const result = await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.CATALOG_SOURCE } as any,
        { pageLimit: 10 }
      );

      expect(result!.categories).toEqual([]);
      expect(result!.next).toBe('');
      expect(result!.meta).toEqual({});
    });

    it('getCategoryWidgetData_nullEsBaseUrl_refreshesConfigBeforePost', async () => {
      (ESCustomHooksInstance as any).esBaseUrl = null;
      mockRestAdapterPost.mockResolvedValue(JSON.stringify({ catalogInfo: [] }));

      await ESCustomHooksInstance.getCategoryWidgetData(
        { source: WIDGET_SOURCE.CATALOG_SOURCE } as any,
        { pageLimit: 10 }
      );

      expect(mockRestAdapterPost).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining(ES_BASE_URL) })
      );
    });
  });

  describe('stub cart methods', () => {
    it('addProductToCart_alwaysReturnsErrorTrue', async () => {
      const result = await ESCustomHooksInstance.addProductToCart('sku123');
      expect(result.error).toBe(true);
    });

    it('addProductToCartNative_returnsDefaultCartValues', async () => {
      const result = await ESCustomHooksInstance.addProductToCartNative('course:123');
      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });

    it('buyNowNative_returnsDefaultCartValues', async () => {
      const result = await ESCustomHooksInstance.buyNowNative('course:123');
      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });
  });
});
