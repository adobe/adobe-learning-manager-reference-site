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

import ALMCustomHooksInstance from '@common/ALMCustomHooks';

const mockGetALMConfig = jest.fn().mockReturnValue({ primeApiURL: 'https://api.example.com/' });
const mockGetALMUser = jest.fn();
const mockGetALMAttribute = jest.fn();
const mockSetALMAttribute = jest.fn();
const mockGetQueryParamsFromUrl = jest.fn();
const mockJsonApiParse = jest.fn();
const mockRestAdapterGet = jest.fn();
const mockRestAdapterPost = jest.fn();
const mockRestAdapterDelete = jest.fn();
const mockRestAdapterAjax = jest.fn();
const mockGetSkuId = jest.fn();
const mockSendEvent = jest.fn();
const mockStoreGetState = jest.fn();

jest.mock('../../store/APIStore', () => ({
  __esModule: true,
  default: { getState: () => mockStoreGetState() },
}));

jest.mock('@utils/global', () => ({
  getALMConfig: () => mockGetALMConfig(),
  getALMUser: () => mockGetALMUser(),
  getALMAttribute: (attr: string) => mockGetALMAttribute(attr),
  setALMAttribute: (key: string, value: unknown) => mockSetALMAttribute(key, value),
  getQueryParamsFromUrl: () => mockGetQueryParamsFromUrl(),
  getSkuId: (id: string) => mockGetSkuId(id),
  sendEvent: (...args: unknown[]) => mockSendEvent(...args),
  isAccAltCompletionEnabled: jest.fn(() => false),
  isStructuredLocationEnabled: jest.fn(() => false),
}));

jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: (response: unknown) => mockJsonApiParse(response),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: {
    get: (params: unknown) => mockRestAdapterGet(params),
    post: (params: unknown) => mockRestAdapterPost(params),
    delete: (params: unknown) => mockRestAdapterDelete(params),
    ajax: (params: unknown) => mockRestAdapterAjax(params),
  },
}));

jest.mock('@utils/catalog', () => ({
  fetchFilterData: jest.fn(() => Promise.resolve('{}')),
  fetchRecommendationData: jest.fn(() => Promise.resolve('{}')),
  getAnnouncedGroupsList: jest.fn(() => []),
  getCatalogList: jest.fn(() => []),
  getFilterNames: jest.fn(() => []),
  getLocalesForSearch: jest.fn(() => 'en-US'),
  getOrUpdateCatalogFilters: jest.fn(() => Promise.resolve([])),
  getParamsForCatalogApi: jest.fn(() => Promise.resolve({})),
  getSettledValue: jest.fn((result: { status: string; value: unknown }) =>
    result.status === 'fulfilled' ? result.value : null
  ),
  getSnippetTypes: jest.fn(() => 'course'),
  getStructuredLocationList: jest.fn(() => []),
  isAttributeEnabled: jest.fn(() => true),
  isMyLearningPage: jest.fn(() => false),
}));

jest.mock('@utils/filters', () => ({
  getDefaultFiltersState: jest.fn(() => ({
    loTypes: { list: [] },
    loFormat: { list: [] },
    duration: { list: [] },
    learnerState: { list: [] },
    skillName: { list: [] },
    tagName: { list: [] },
    catalogs: { list: [] },
    priceRange: { maxPrice: 0 },
    cities: { list: [] },
    products: { list: [] },
    roles: { list: [] },
    levels: { list: [] },
    announcedGroups: { list: [] },
  })),
  updateFilterList: jest.fn((list: unknown) => list),
  getSearchFilterList: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@utils/price', () => ({
  canShowPriceFilter: jest.fn(() => false),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: { registerServiceInstance: jest.fn() },
}));

const PRIME_API_URL = 'https://api.example.com/';

describe('ALMCustomHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue({ primeApiURL: PRIME_API_URL });
    mockGetALMUser.mockResolvedValue({
      user: {
        id: 'user123',
        account: {
          id: 'acc123',
          prlCriteria: { products: { enabled: false }, roles: { enabled: false } },
          searchEnrolledChildLo: false,
        },
      },
    });
    mockGetALMAttribute.mockReturnValue({});
    mockGetQueryParamsFromUrl.mockReturnValue({});
    mockStoreGetState.mockReturnValue({ catalog: { selectedCatalogs: [] } });
    mockJsonApiParse.mockReturnValue({ learningObjectList: [], links: {}, meta: {} });
    mockRestAdapterGet.mockResolvedValue('{}');
    mockRestAdapterPost.mockResolvedValue('{}');
    mockRestAdapterDelete.mockResolvedValue('{}');
    mockRestAdapterAjax.mockResolvedValue('{}');
    window.postMessage = jest.fn();
  });

  describe('getTraining', () => {
    it('getTraining_callsCorrectUrlWithEnforcedFields', async () => {
      mockJsonApiParse.mockReturnValue({ learningObject: { id: 'course:123' } });

      await ALMCustomHooksInstance.getTraining('course:123', {});

      expect(mockRestAdapterGet).toHaveBeenCalledTimes(1);
      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123`,
        params: expect.objectContaining({
          'enforcedFields[learningObject]': 'products,roles,extensionOverrides,effectivenessData',
          'enforcedFields[sessionRecordingInfo]': 'transcriptUrl',
          'enforcedFields[resource]': 'isExternalUrl',
        }),
      });
    });

    it('getTraining_certificationId_addsEnrollmentEnforcedField', async () => {
      mockJsonApiParse.mockReturnValue({ learningObject: { id: 'certification:456' } });

      await ALMCustomHooksInstance.getTraining('certification:456', {});

      expect(mockRestAdapterGet).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            'enforcedFields[learningObjectInstanceEnrollment]': 'previousState,previousExpiryDate',
          }),
        })
      );
    });

    it('getTraining_nonCertificationId_omitsEnrollmentEnforcedField', async () => {
      mockJsonApiParse.mockReturnValue({ learningObject: { id: 'course:123' } });

      await ALMCustomHooksInstance.getTraining('course:123', {});

      const params = mockRestAdapterGet.mock.calls[0][0].params;
      expect(params).not.toHaveProperty('enforcedFields[learningObjectInstanceEnrollment]');
    });

    it('getTraining_returnsLearningObjectFromParsedResponse', async () => {
      const mockLO = { id: 'course:123', name: 'Test Course' };
      mockJsonApiParse.mockReturnValue({ learningObject: mockLO });

      const result = await ALMCustomHooksInstance.getTraining('course:123', {});

      expect(result).toEqual(mockLO);
    });

    it('getTraining_400Error_callsSendLoNotFoundEvent', async () => {
      mockRestAdapterGet.mockRejectedValue({ status: 400 });

      await ALMCustomHooksInstance.getTraining('course:123', {});

      expect(window.postMessage).toHaveBeenCalledWith('almLoNotFound');
    });

    it('getTraining_nullResponse_callsSendLoNotFoundEvent', async () => {
      mockRestAdapterGet.mockResolvedValue(null);

      await ALMCustomHooksInstance.getTraining('course:123', {});

      expect(window.postMessage).toHaveBeenCalledWith('almLoNotFound');
    });

    it('should propagate errors for personalized paths instead of swallowing them', async () => {
      mockRestAdapterGet.mockRejectedValue({ status: 403 });

      await expect(ALMCustomHooksInstance.getTraining('personalizedPath:123', {})).rejects.toEqual({
        status: 403,
      });
    });

    it('should send LoNotFound event and still propagate a 400 for personalized paths', async () => {
      mockRestAdapterGet.mockRejectedValue({ status: 400 });
      window.postMessage = jest.fn();

      await expect(ALMCustomHooksInstance.getTraining('personalizedPath:123', {})).rejects.toEqual({
        status: 400,
      });

      expect(window.postMessage).toHaveBeenCalledWith('almLoNotFound');
    });
  });

  describe('getTrainingInstanceSummary', () => {
    it('getTrainingInstanceSummary_callsCorrectUrl_returnsParseResult', async () => {
      const mockSummary = { enrollmentCount: 10 };
      mockJsonApiParse.mockReturnValue(mockSummary);

      const result = await ALMCustomHooksInstance.getTrainingInstanceSummary('course:123', 'inst456');

      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123/instances/inst456/summary`,
      });
      expect(result).toEqual(mockSummary);
    });
  });

  describe('enrollToTraining', () => {
    it('enrollToTraining_callsEnrollmentsEndpoint_withCorrectParamsAndHeaders', async () => {
      const params = { loId: 'course:123' };
      const headers = { 'X-Custom': 'header' };
      const mockEnrollment = { id: 'enroll1' };
      mockJsonApiParse.mockReturnValue(mockEnrollment);

      const result = await ALMCustomHooksInstance.enrollToTraining(params, headers);

      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}enrollments`,
        method: 'POST',
        params,
        headers,
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('unenrollFromTraining', () => {
    it('unenrollFromTraining_callsDeleteWithCorrectUrl', async () => {
      await ALMCustomHooksInstance.unenrollFromTraining('enroll123');

      expect(mockRestAdapterDelete).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}enrollments/enroll123`,
        method: 'DELETE',
      });
    });

    it('unenrollFromTraining_emptyEnrollmentId_usesEmptyString', async () => {
      await ALMCustomHooksInstance.unenrollFromTraining();

      expect(mockRestAdapterDelete).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}enrollments/`,
        method: 'DELETE',
      });
    });
  });

  describe('enrollToPersonalizedPath', () => {
    it('should call POST /personalizedPaths/{id}/enrollment', async () => {
      const pathId = 'path123';

      await ALMCustomHooksInstance.enrollToPersonalizedPath(pathId);

      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}personalizedPaths/${pathId}/enrollment`,
        method: 'POST',
      });
    });

    it('should parse and return the response', async () => {
      const pathId = 'path123';
      const raw = { data: { id: 'enrollment1', type: 'learningObjectEnrollment' } };
      mockRestAdapterPost.mockResolvedValueOnce(raw);

      const result = await ALMCustomHooksInstance.enrollToPersonalizedPath(pathId);

      expect(mockJsonApiParse).toHaveBeenCalledWith(raw);
      expect(result).toBeDefined();
    });
  });

  describe('loadMore', () => {
    it('loadMore_fetchesUrl_returnsParseResult', async () => {
      const mockData = { learningObjectList: [{ id: 'course:1' }] };
      mockJsonApiParse.mockReturnValue(mockData);

      const result = await ALMCustomHooksInstance.loadMore('https://api.example.com/next');

      expect(mockRestAdapterGet).toHaveBeenCalledWith({ url: 'https://api.example.com/next' });
      expect(result).toEqual(mockData);
    });
  });

  describe('getUsersBadges', () => {
    it('getUsersBadges_callsCorrectUrl_returnsParsedBadgeListAndNextLink', async () => {
      const params = { 'page[limit]': 10 };
      mockJsonApiParse.mockReturnValue({
        userBadgeList: [{ id: 'badge1' }],
        links: { next: 'https://next' },
      });

      const result = await ALMCustomHooksInstance.getUsersBadges('user123', params);

      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}users/user123/userBadges`,
        params,
      });
      expect(result.badgeList).toEqual([{ id: 'badge1' }]);
      expect(result.links.next).toBe('https://next');
    });

    it('getUsersBadges_onError_returnsEmptyBadgeListAndEmptyNextLink', async () => {
      mockRestAdapterGet.mockRejectedValue(new Error('API Error'));

      const result = await ALMCustomHooksInstance.getUsersBadges('user123', {});

      expect(result.badgeList).toEqual([]);
      expect(result.links.next).toBe('');
    });
  });

  describe('getCatalogsByIds', () => {
    it('getCatalogsByIds_emptyArray_returnsNull', async () => {
      const result = await ALMCustomHooksInstance.getCatalogsByIds([]);

      expect(result).toBeNull();
      expect(mockRestAdapterGet).not.toHaveBeenCalled();
    });

    it('getCatalogsByIds_25Ids_makesThreeChunkedRequests', async () => {
      const catalogIds = Array.from({ length: 25 }, (_, i) => `cat${i}`);
      mockJsonApiParse.mockReturnValue({ catalogList: [] });

      await ALMCustomHooksInstance.getCatalogsByIds(catalogIds);

      expect(mockRestAdapterGet).toHaveBeenCalledTimes(3);
    });

    it('getCatalogsByIds_deduplicatesResults', async () => {
      mockJsonApiParse.mockReturnValue({
        catalogList: [
          { id: 'cat1', name: 'Catalog 1' },
          { id: 'cat1', name: 'Catalog 1 Duplicate' },
        ],
      });

      const result = await ALMCustomHooksInstance.getCatalogsByIds(['cat1', 'cat2']);

      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('cat1');
    });

    it('getCatalogsByIds_allRequestsFail_returnsNull', async () => {
      mockRestAdapterGet.mockRejectedValue(new Error('Request failed'));

      const result = await ALMCustomHooksInstance.getCatalogsByIds(['cat1']);

      expect(result).toBeNull();
    });
  });

  describe('loadMoreBadges', () => {
    it('loadMoreBadges_callsGetWithUrl_returnsParseResult', async () => {
      const mockData = { userBadgeList: [{ id: 'badge2' }] };
      mockJsonApiParse.mockReturnValue(mockData);

      const result = await ALMCustomHooksInstance.loadMoreBadges('https://api.example.com/badges/next');

      expect(mockRestAdapterGet).toHaveBeenCalledWith({ url: 'https://api.example.com/badges/next' });
      expect(result).toEqual(mockData);
    });
  });

  describe('sendLoNotFoundEvent', () => {
    it('sendLoNotFoundEvent_postsAlmLoNotFoundToWindow', () => {
      ALMCustomHooksInstance.sendLoNotFoundEvent();

      expect(window.postMessage).toHaveBeenCalledWith('almLoNotFound');
    });
  });

  describe('addProductToCart', () => {
    it('addProductToCart_alwaysReturnsErrorTrue', async () => {
      const result = await ALMCustomHooksInstance.addProductToCart('sku123');

      expect(result.error).toBe(true);
    });
  });

  describe('addProductToCartNative', () => {
    it('addProductToCartNative_callsCartEndpoint_withSkuId_returnsRedirectionUrl', async () => {
      mockGetSkuId.mockReturnValue('course:123:inst456');
      mockRestAdapterPost.mockResolvedValue('https://checkout.example.com');

      const result = await ALMCustomHooksInstance.addProductToCartNative('course:123_inst456');

      expect(mockGetSkuId).toHaveBeenCalledWith('course:123_inst456');
      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}ecommerce/cart/items`,
        method: 'POST',
        params: { skuId: 'course:123:inst456' },
      });
      expect(result.redirectionUrl).toBe('https://checkout.example.com');
    });

    it('addProductToCartNative_onError_returnsDefaultCartValues', async () => {
      mockGetSkuId.mockReturnValue('course:123:inst456');
      mockRestAdapterPost.mockRejectedValue(new Error('Cart error'));

      const result = await ALMCustomHooksInstance.addProductToCartNative('course:123_inst456');

      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });
  });

  describe('buyNowNative', () => {
    it('buyNowNative_callsOrdersEndpoint_withSkuId_returnsRedirectionUrl', async () => {
      mockGetSkuId.mockReturnValue('course:123:inst456');
      mockRestAdapterPost.mockResolvedValue('https://checkout.example.com');

      const result = await ALMCustomHooksInstance.buyNowNative('course:123_inst456');

      expect(mockGetSkuId).toHaveBeenCalledWith('course:123_inst456');
      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}ecommerce/orders`,
        method: 'POST',
        params: { skuId: 'course:123:inst456' },
      });
      expect(result.redirectionUrl).toBe('https://checkout.example.com');
    });

    it('buyNowNative_onError_returnsDefaultCartValues', async () => {
      mockGetSkuId.mockReturnValue('course:123:inst456');
      mockRestAdapterPost.mockRejectedValue(new Error('Order error'));

      const result = await ALMCustomHooksInstance.buyNowNative('course:123_inst456');

      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });
  });

  describe('getAllDiscussions', () => {
    it('getAllDiscussions_callsDiscussionPostsEndpointWithCorrectArgs', async () => {
      const params = { 'page[limit]': 20 };
      const mockDiscussions = { discussionPostList: [{ id: 'post1' }] };
      mockJsonApiParse.mockReturnValue(mockDiscussions);

      const result = await ALMCustomHooksInstance.getAllDiscussions(params, 'course:123');

      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123/discussionPosts`,
        headers: { 'content-type': 'application/json' },
        params,
      });
      expect(result).toEqual(mockDiscussions);
    });

    it('getAllDiscussions_onError_returnsUndefinedWithoutThrowing', async () => {
      mockRestAdapterGet.mockRejectedValue(new Error('API error'));

      const result = await ALMCustomHooksInstance.getAllDiscussions({}, 'course:123');

      expect(result).toBeUndefined();
    });
  });

  describe('loadMoreDiscussion', () => {
    it('loadMoreDiscussion_callsGetWithUrl', async () => {
      const mockData = { discussionPostList: [] };
      mockJsonApiParse.mockReturnValue(mockData);

      const result = await ALMCustomHooksInstance.loadMoreDiscussion('https://api.example.com/discussions/next');

      expect(mockRestAdapterGet).toHaveBeenCalledWith({
        url: 'https://api.example.com/discussions/next',
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toEqual(mockData);
    });

    it('loadMoreDiscussion_onError_returnsUndefinedWithoutThrowing', async () => {
      mockRestAdapterGet.mockRejectedValue(new Error('API error'));

      const result = await ALMCustomHooksInstance.loadMoreDiscussion('https://api.example.com/discussions/next');

      expect(result).toBeUndefined();
    });
  });

  describe('postDiscussion', () => {
    it('postDiscussion_callsPostWithCorrectUrlAndBody', async () => {
      const body = { content: 'Test discussion' };
      const mockPost = { id: 'post1' };
      mockJsonApiParse.mockReturnValue(mockPost);

      const result = await ALMCustomHooksInstance.postDiscussion('course:123', body);

      expect(mockRestAdapterPost).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123/discussionPosts?include=learner`,
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      });
      expect(result).toEqual(mockPost);
    });
  });

  describe('deleteDiscussion', () => {
    it('deleteDiscussion_callsDeleteWithCorrectUrl', async () => {
      await ALMCustomHooksInstance.deleteDiscussion('course:123', 'post456');

      expect(mockRestAdapterDelete).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123/discussionPosts/post456`,
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
      });
    });
  });

  describe('getCoursePathWidgetTrainings', () => {
    const basePagination = { cursor: null, offset: null, pageLimit: 10 };

    const getPostedBody = () => {
      const call = mockRestAdapterPost.mock.calls[0][0];
      return JSON.parse(call.body);
    };

    it('SKILLS_source_withStringSourceDetails_setsFilterSkillName', async () => {
      await ALMCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: 'SKILLS', sourceDetails: 'Sales', sort: '-date' } as any,
        basePagination as any
      );

      expect(mockRestAdapterPost).toHaveBeenCalledTimes(1);
      expect(mockRestAdapterPost.mock.calls[0][0].url).toBe(`${PRIME_API_URL}learningObjects/query`);
      expect(getPostedBody()['filter.skillName']).toEqual(['Sales']);
    });

    it('SKILLS_source_withObjectSourceDetails_usesName', async () => {
      await ALMCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: 'SKILLS', sourceDetails: { name: 'E-Learning' }, sort: '-date' } as any,
        basePagination as any
      );

      expect(getPostedBody()['filter.skillName']).toEqual(['E-Learning']);
    });

    it('SKILLS_source_emptySourceDetails_omitsFilterSkillName', async () => {
      await ALMCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: 'SKILLS', sourceDetails: '', sort: '-date' } as any,
        basePagination as any
      );

      expect(getPostedBody()).not.toHaveProperty('filter.skillName');
    });

    it('SKILLS_source_doesNotSetProductOrRoleOrCatalogFilters', async () => {
      await ALMCustomHooksInstance.getCoursePathWidgetTrainings(
        { source: 'SKILLS', sourceDetails: 'Sales', sort: '-date' } as any,
        basePagination as any
      );

      const body = getPostedBody();
      expect(body).not.toHaveProperty('filter.recommendationProducts');
      expect(body).not.toHaveProperty('filter.recommendationRoles');
      expect(body).not.toHaveProperty('filter.catalogIds');
    });

    it('loIds_takesPriority_overSkillsSource', async () => {
      await ALMCustomHooksInstance.getCoursePathWidgetTrainings(
        {
          loIds: ['course:1'],
          source: 'SKILLS',
          sourceDetails: 'Sales',
          sort: '-date',
        } as any,
        basePagination as any
      );

      const body = getPostedBody();
      expect(body.ids).toEqual(['course:1']);
      expect(body).not.toHaveProperty('filter.skillName');
    });
  });

  describe('fetchCourseInstanceMapping', () => {
    it('fetchCourseInstanceMapping_callsAjaxWithCorrectUrl_returnsParseResult', async () => {
      const training = { id: 'course:123' } as any;
      const mockMapping = { instanceId: 'inst456' };
      mockRestAdapterAjax.mockResolvedValue({ data: {} });
      mockJsonApiParse.mockReturnValue(mockMapping);

      const result = await ALMCustomHooksInstance.fetchCourseInstanceMapping(training, 'inst456');

      expect(mockRestAdapterAjax).toHaveBeenCalledWith({
        url: `${PRIME_API_URL}learningObjects/course:123/instances/inst456`,
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        params: expect.objectContaining({ include: expect.any(String) }),
      });
      expect(result).toEqual(mockMapping);
    });

    it('fetchCourseInstanceMapping_onError_returnsUndefined', async () => {
      mockRestAdapterAjax.mockRejectedValue(new Error('Mapping error'));

      const result = await ALMCustomHooksInstance.fetchCourseInstanceMapping({ id: 'course:123' } as any, 'inst456');

      expect(result).toBeUndefined();
    });
  });
});
