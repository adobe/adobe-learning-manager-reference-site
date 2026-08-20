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
import {
  JsonApiResponse,
  MaxPrice,
  PaginationParams,
  PrimeCatalog,
  PrimeLearningObject,
  PrimeUser,
  PrimeUserBadge,
  PRLCriteria,
  PRLCriteriaAttributes,
  WidgetTrainingFilters,
  WidgetRecommendationFilters,
  CategoryWidgetFilters,
} from '..';
import store from '../../store/APIStore';
import { CatalogFilterState } from '../store/reducers/catalog';
import {
  fetchFilterData,
  fetchRecommendationData,
  getAnnouncedGroupsList,
  getCatalogList,
  getFilterNames,
  getLocalesForSearch,
  getOrUpdateCatalogFilters,
  getParamsForCatalogApi,
  getSettledValue,
  getSnippetTypes,
  getStructuredLocationList,
  isAttributeEnabled,
  isMyLearningPage,
} from '../utils/catalog';
import {
  ALM_LEARNER_ADD_TO_SEARCH,
  CERTIFICATION,
  COMPLETED,
  COMPLETED_VIA_ALTERNATE,
  ENGLISH_LOCALE,
  FILTER,
  LEARNING_PROGRAM,
  LEVEL,
  NOT_ENROLLED,
  PERSONALIZED_PATH,
  PERSONALIZED_PATH_INCLUDE,
  PRODUCT,
  ROLE,
  COURSE,
  API_REQUEST_CANCEL_TOKEN,
  INCLUDE_SUBLO_INSTANCES,
  WIDGET_SOURCE,
} from '../utils/constants';
import {
  getDefaultFiltersState,
  updateFilterList,
  getSearchFilterList,
  FilterListObject,
} from '../utils/filters';
import {
  getALMAttribute,
  getALMConfig,
  getALMUser,
  getQueryParamsFromUrl,
  sendEvent,
  getSkuId,
  setALMAttribute,
  isAccAltCompletionEnabled,
  isStructuredLocationEnabled,
} from '../utils/global';
import { JsonApiParse } from '../utils/jsonAPIAdapter';
import { canShowPriceFilter } from '../utils/price';
import { QueryParams, RestAdapter } from '../utils/restAdapter';
import APIServiceInstance from './APIService';
import ICustomHooks from './ICustomHooks';
import { defaultCartValues } from '../utils/lo-utils';
import { GetTranslation } from '../utils/translationService';
import { updateSelectedCatalogs } from '../store/actions/catalog/action';

export const DEFAULT_PAGE_LIMIT = 9;
export const DEFUALT_LO_INCLUDE = 'instances,enrollment.loResourceGrades,skills.skillLevel.skill';
const DEFAULT_SEARCH_INCLUDE =
  'model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill';
const DEFAULT_RECOMMENDATIONS_INCLUDE =
  'learningObject.instances.loResources.resources,learningObject.skills.skillLevel.skill';
const includeParams = 'products,roles,extensionOverrides,effectivenessData';
class ALMCustomHooks implements ICustomHooks {
  primeApiURL = getALMConfig().primeApiURL;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    autoCorrectMode: boolean
  ) {
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);
    const storeState = store.getState();
    const catalogState = storeState.catalog;
    const snippetType = getSnippetTypes(catalogState, user.account);

    const catalogAttributes = getALMAttribute('catalogAttributes');
    const requestBody = await getParamsForCatalogApi(filterState, user, sort);
    const params: QueryParams = {};
    params['page[limit]'] = DEFAULT_PAGE_LIMIT;
    params['sort'] = sort;
    params['enforcedFields[learningObject]'] = includeParams;
    params['include'] = DEFUALT_LO_INCLUDE;

    let response;
    let parsedResponse;
    if (searchText && catalogAttributes?.showSearch === 'true') {
      const searchResponse = await this.handleSearchRequest(
        searchText,
        snippetType,
        filterState,
        params,
        requestBody,
        user,
        sort,
        autoCorrectMode
      );
      parsedResponse = JsonApiParse(searchResponse.response);
      parsedResponse.meta = {
        formalCount: 0,
        informalCount: 0,
        ...parsedResponse.meta,
      };
    } else {
      response = await this.handleNonSearchRequest(params, requestBody);
      parsedResponse = JsonApiParse(response);
    }

    if (searchText && parsedResponse.learningObjectList?.length > 0) {
      sendEvent(ALM_LEARNER_ADD_TO_SEARCH, searchText);
    }
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || '',
      meta: parsedResponse.meta,
    };
  }

  async getTrainingsForAuthor(authorId: string, authorType: string, sort: string, url?: string) {
    const requestBody = {
      'filter.authors': [
        {
          authorId: parseInt(authorId),
          authorType: authorType,
        },
      ],
      'filter.loTypes': [COURSE, LEARNING_PROGRAM, CERTIFICATION],
    };
    const params: QueryParams = {};
    params['page[limit]'] = DEFAULT_PAGE_LIMIT;
    params['sort'] = sort;
    params['include'] = DEFUALT_LO_INCLUDE;
    let response;
    if (url) {
      response = await RestAdapter.post({
        url,
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/vnd.api+json;charset=UTF-8',
        },
      });
    } else {
      response = await this.handleNonSearchRequest(params, requestBody);
    }
    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || '',
      meta: parsedResponse.meta,
    };
  }

  async getCoursePathWidgetTrainings(filters: WidgetTrainingFilters, pagination: PaginationParams) {
    const {
      loIds,
      source,
      sourceDetails,
      learnerState,
      bookmarks,
      sort,
      subLOsLang,
      externalCertifications,
      enrollmentType,
      excludeIgnoredRecommendations,
      enforcedFieldsLO,
      loTypes,
      include,
      recommendationConfig,
    } = filters;
    const { cursor, offset, pageLimit } = pagination;

    const params: QueryParams = {};
    const body: QueryParams = {};

    // Build request body filters
    if (loIds && loIds.length > 0) {
      body['ids'] = loIds;
    } else {
      if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
        body['filter.recommendationProducts'] = [
          {
            name: sourceDetails?.name || sourceDetails,
            levels: [],
          },
        ];
      } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
        body['filter.recommendationRoles'] = [
          {
            name: sourceDetails?.name || sourceDetails,
            levels: [],
          },
        ];
      } else if (source === WIDGET_SOURCE.CATALOG_SOURCE) {
        const catalogIds =
          sourceDetails?.id || sourceDetails ? [sourceDetails.id || sourceDetails] : [];
        body['filter.catalogIds'] = catalogIds;
      } else if (source === WIDGET_SOURCE.SKILL_SOURCE) {
        const skillName = sourceDetails?.name || sourceDetails;
        if (skillName) {
          body['filter.skillName'] = [skillName];
        }
      }
    }

    // Apply standard filters
    body['filter.loTypes'] = loTypes || [COURSE, LEARNING_PROGRAM, CERTIFICATION, 'jobAid'];
    body['filter.ignoreEnhancedLP'] = false;

    // Apply learner state filter if provided
    if (learnerState && learnerState.length > 0) {
      body['filter.learnerState'] = learnerState;
    }
    // Apply additional filters
    if (bookmarks) {
      body['filter.bookmarks'] = bookmarks;
    }
    if (subLOsLang !== undefined) {
      body['filter.lang.subLOs'] = subLOsLang;
    }
    if (externalCertifications !== undefined) {
      body['filter.externalCertifications'] = externalCertifications;
    }
    if (enrollmentType !== undefined) {
      body['filter.enrollmentType'] = enrollmentType;
    }
    if (excludeIgnoredRecommendations !== undefined) {
      body['filter.excludeIgnoredRecommendations'] = excludeIgnoredRecommendations;
    }
    // Apply recommendations config
    if (recommendationConfig?.products) {
      body['filter.recommendationProducts'] = recommendationConfig.products;
    }
    if (recommendationConfig?.roles) {
      body['filter.recommendationRoles'] = recommendationConfig.roles;
    }
    if (recommendationConfig?.skills) {
      body['filter.skillName'] = recommendationConfig.skills;
    }

    // Set up params
    params['enforcedFields[learningObject]'] = enforcedFieldsLO || includeParams;
    params['include'] = include || DEFUALT_LO_INCLUDE;
    params['sort'] = sort;
    params['page[limit]'] = pageLimit;

    // Add pagination params
    if (cursor) {
      params['page[cursor]'] = cursor;
    } else if (offset) {
      params['page[offset]'] = offset;
    }

    const url = `${this.primeApiURL}learningObjects/query`;
    const response = await RestAdapter.post({
      url,
      params,
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json;charset=UTF-8',
      },
    });

    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || '',
      meta: parsedResponse.meta,
    };
  }

  async getCoursePathWidgetRecommendations(
    filters: WidgetRecommendationFilters,
    pagination: PaginationParams
  ) {
    const { sort, recommendationType, strip } = filters;
    const { cursor, offset, pageLimit } = pagination;

    const params: QueryParams = {};

    // Apply standard filters
    params['filter.loTypes'] = [COURSE, LEARNING_PROGRAM, CERTIFICATION, 'jobAid'];
    params['filter.ignoreEnhancedLP'] = false;

    // Apply recommendation type
    params['filter.recType'] = recommendationType;

    // Apply strip number for multi_skill_interest AOI calls
    if (strip) {
      params['strip'] = strip;
    }

    // Set up params
    params['enforcedFields[learningObject]'] = includeParams;
    params['include'] = DEFAULT_RECOMMENDATIONS_INCLUDE;
    if (sort) {
      params['sort'] = sort;
    }
    params['page[limit]'] = pageLimit;

    // Add pagination params
    if (cursor) {
      params['page[cursor]'] = cursor;
    } else if (offset) {
      params['page[offset]'] = offset;
    }

    const url = `${this.primeApiURL}recommendations`;
    const response = await RestAdapter.get({
      url,
      params,
      headers: {
        'Content-Type': 'application/vnd.api+json;charset=UTF-8',
      },
    });

    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.recommendationList || [],
      next: parsedResponse.links?.next || '',
      meta: parsedResponse.meta,
    };
  }

  async getCategoryWidgetData(filters: CategoryWidgetFilters, pagination: PaginationParams) {
    const { sourceIds, source } = filters;
    const { cursor, offset, pageLimit } = pagination;

    const params: QueryParams = {};
    let endpoint = '/recommendations';

    // Determine endpoint and apply source-specific logic
    if (source === WIDGET_SOURCE.CATALOG_SOURCE) {
      endpoint = '/catalogs';
      params['sort'] = '-dateCreated';
    } else if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
      endpoint = '/recommendationProducts';
      params['filter.showAllRecommendationCriteria'] = false;
    } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
      endpoint = '/recommendationRoles';
      params['filter.showAllRecommendationCriteria'] = false;
    }
    let widgetContainsSourceIds = false;
    let formattedIds: string[] = [];
    // Handle sourceIds with appropriate prefixing
    if (sourceIds && sourceIds.length > 0) {
      formattedIds = sourceIds;
      widgetContainsSourceIds = true;
      if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
        formattedIds = sourceIds.map((id: string) => `recommendationProduct:${id}`);
      } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
        formattedIds = sourceIds.map((id: string) => `recommendationRole:${id}`);
      }
      params['ids'] = formattedIds.join(',');
    }

    // Set page limit
    params['page[limit]'] = pageLimit;

    // Add pagination params
    if (cursor) {
      params['page[cursor]'] = cursor;
    } else if (offset) {
      params['page[offset]'] = offset;
    }

    const url = `${this.primeApiURL}${endpoint}`;
    const response = await RestAdapter.get({
      url,
      params,
    });

    const rawResponse = typeof response === 'string' ? JSON.parse(response) : response;

    if (Array.isArray(rawResponse.data)) {
      rawResponse.data.forEach((item: any) => {
        const pageId = item?.relationships?.pages?.data?.[0]?.id;
        if (pageId && item.attributes) {
          item.attributes.pageId = pageId;
        }
      });
    }

    const parsedResponse = JsonApiParse(rawResponse);

    if (widgetContainsSourceIds) {
      const items =
        parsedResponse.recommendationList ||
        parsedResponse.recommendationRoleList ||
        parsedResponse.recommendationProductList ||
        parsedResponse.catalogList ||
        [];
      const itemsMap = new Map<string, any>();
      items.forEach((item: any) => {
        itemsMap.set(item.id, item);
      });
      if (formattedIds && formattedIds.length > 0) {
        const sortedList =
          formattedIds
            .map((id: string) => itemsMap.get(id))
            .filter((item: any) => item !== undefined) || [];
        parsedResponse.recommendationList = sortedList;
      }
    }
    // Determine which list property to use based on response
    const categories =
      parsedResponse.recommendationList ||
      parsedResponse.recommendationRoleList ||
      parsedResponse.recommendationProductList ||
      parsedResponse.catalogList ||
      [];

    return {
      categories,
      next: parsedResponse.links?.next || '',
      meta: parsedResponse.meta,
    };
  }
  async handleSearchRequest(
    searchText: string,
    snippetType: string,
    filterState: CatalogFilterState,
    params: QueryParams,
    requestBody: any,
    user: PrimeUser,
    sort: string,
    autoCorrectMode: boolean
  ) {
    const url = `${this.primeApiURL}search/query`;
    const queryParams = getQueryParamsFromUrl();
    params['include'] = DEFAULT_SEARCH_INCLUDE;
    params['sort'] = sort;
    const snippetsFromUrl = queryParams['filter.snippetTypes'];
    requestBody['language'] = getLocalesForSearch(user);
    requestBody['matchType'] = 'phrase_and_match';
    requestBody['filter.snippetTypes'] = (snippetsFromUrl || snippetType)?.split(',');
    requestBody['query'] = searchText;
    requestBody['stemmed'] = true;
    requestBody['mode'] = 'advanceSearch';
    requestBody['autoCorrectMode'] = autoCorrectMode ?? true;
    requestBody['filter.ignoreHigherOrderLOEnrollment'] =
      user.account?.searchEnrolledChildLo || false;

    const response = await RestAdapter.post({
      url,
      params,
      body: JSON.stringify(requestBody),
      cancelToken: API_REQUEST_CANCEL_TOKEN.GET_TRAININGS,
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json;charset=UTF-8',
      },
    });
    return { response };
  }

  async handleNonSearchRequest(params: QueryParams, requestBody: any) {
    const url = `${this.primeApiURL}learningObjects/query`;
    return await RestAdapter.post({
      url,
      params,
      body: JSON.stringify(requestBody),
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json;charset=UTF-8',
      },
      cancelToken: API_REQUEST_CANCEL_TOKEN.GET_TRAININGS,
    });
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string,
    autoCorrectMode: boolean
  ) {
    let response;
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);
    const requestBody = await getParamsForCatalogApi(filterState, user, sort);
    const cancelToken = API_REQUEST_CANCEL_TOKEN.GET_TRAININGS;
    const headers = {
      'Content-Type': 'application/vnd.api+json;charset=UTF-8',
    };
    if (searchText) {
      const queryParams = getQueryParamsFromUrl();
      const snippetsFromUrl = queryParams['filter.snippetTypes'];
      const storeState = store.getState();
      const catalogState = storeState.catalog;
      const snippetType = getSnippetTypes(catalogState, user?.account);
      requestBody['language'] = getLocalesForSearch(user);
      requestBody['matchType'] = 'phrase_and_match';
      requestBody['filter.snippetTypes'] = (snippetsFromUrl || snippetType)?.split(',');
      requestBody['query'] = searchText;
      requestBody['stemmed'] = true;
      requestBody['autoCorrectMode'] = autoCorrectMode ?? true;
      requestBody['mode'] = 'advanceSearch';
    }
    response = await RestAdapter.post({
      url,
      cancelToken,
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers,
    });
    const parsedResponse = JsonApiParse(response);

    return {
      learningObjectList: parsedResponse.learningObjectList || [],
      links: {
        next: parsedResponse.links?.next || '',
      },
    };
  }
  async loadMore(url: string) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }

  //used in alm-teams
  sendLoNotFoundEvent = () => {
    window.postMessage('almLoNotFound');
  };

  async getTraining(id: string, params: QueryParams): Promise<PrimeLearningObject> {
    if (id.startsWith(`${PERSONALIZED_PATH}:`)) {
      return this.getPersonalizedPath(id);
    }
    let response;
    try {
      params['enforcedFields[learningObject]'] = includeParams;
      params['enforcedFields[sessionRecordingInfo]'] = 'transcriptUrl';
      params['enforcedFields[resource]'] = 'isExternalUrl';
      if (id.includes(CERTIFICATION)) {
        params['enforcedFields[learningObjectInstanceEnrollment]'] =
          'previousState,previousExpiryDate';
      }
      response = await RestAdapter.get({
        url: `${this.primeApiURL}learningObjects/${id}`,
        params: params,
      });
      //to-do: remove below if after PAPI-14919 is fixed
      if (!response || JSON.parse(response as any).data === null) {
        this.sendLoNotFoundEvent();
      }
    } catch (e: any) {
      if (e.status === 400) {
        this.sendLoNotFoundEvent();
      }
    }
    return JsonApiParse(response).learningObject;
  }

  private async getPersonalizedPath(id: string): Promise<PrimeLearningObject> {
    let response;
    try {
      response = await RestAdapter.get({
        url: `${this.primeApiURL}personalizedPaths/${id}`,
        params: { include: PERSONALIZED_PATH_INCLUDE },
      });
    } catch (e: any) {
      if (e.status === 400) {
        this.sendLoNotFoundEvent();
      }
      throw e;
    }
    const parsed = JsonApiParse(response) as any;
    const pp = parsed?.personalizedPath;
    if (!pp) return undefined as unknown as PrimeLearningObject;
    const locale = pp.localizedMetadata?.[0];
    const subLOs: any[] = pp.subLOs || [];
    const completedCount = subLOs.filter(lo => lo.enrollment?.state === COMPLETED).length;
    const progressPercent =
      subLOs.length > 0 ? Math.round((completedCount / subLOs.length) * 100) : 0;
    if (pp.enrollment) {
      pp.enrollment.progressPercent = progressPercent;
    }
    return {
      id: pp.id,
      loType: PERSONALIZED_PATH,
      name: locale?.name || '',
      description: locale?.overview || '',
      localizedMetadata: pp.localizedMetadata || [],
      sections: pp.sections || [],
      subLOs,
      instances: [],
      enrollment: pp.enrollment,
      skills: pp.skills || [],
      tags: [],
      rating: undefined,
      imageUrl: '',
      isExternal: pp.isExternal || false,
      state: pp.state || 'Active',
      loFormat: 'Self Paced',
      dateCreated: pp.dateCreated,
      createdByUserId: pp.createdByUserId,
      enrollmentType: pp.enrollmentType,
      unenrollmentAllowed: pp.unenrollmentAllowed,
      isSubLoOrderEnforced: pp.isSubLoOrderEnforced,
    } as unknown as PrimeLearningObject;
  }

  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${trainingId}/instances/${instanceId}/summary`,
    });
    return JsonApiParse(response);
  }
  async enrollToTraining(params: QueryParams = {}, headers: Record<string, string> = {}) {
    const response = await RestAdapter.post({
      url: `${this.primeApiURL}enrollments`,
      method: 'POST',
      params,
      headers,
    });
    return JsonApiParse(response);
  }
  async unenrollFromTraining(enrollmentId = '') {
    const response = await RestAdapter.delete({
      url: `${this.primeApiURL}enrollments/${enrollmentId}`,
      method: 'DELETE',
    });
    return response;
  }

  async enrollToPersonalizedPath(id: string) {
    const response = await RestAdapter.post({
      url: `${this.primeApiURL}personalizedPaths/${id}/enrollment`,
      method: 'POST',
    });
    return JsonApiParse(response);
  }

  async deletePersonalizedPath(id: string) {
    const response = await RestAdapter.ajax({
      url: `${this.primeApiURL}personalizedPaths/${id}`,
      method: 'DELETE',
    });
    return response;
  }

  async getFilters() {
    const config = getALMConfig();
    const queryParams = getQueryParamsFromUrl();
    const isMyLearning = isMyLearningPage();
    const dataEndpoint = `${config.primeApiURL}data`;

    const response = await getALMUser();
    const user = response?.user;
    const userId = user?.id;
    const account = user?.account!;
    const { products = {} as PRLCriteriaAttributes, roles = {} as PRLCriteriaAttributes } =
      account?.prlCriteria || ({} as PRLCriteria);

    const catalogAttributes = getALMAttribute('catalogAttributes') || {};
    const showPrice = canShowPriceFilter(account);
    const structuredLocationEnabled = isStructuredLocationEnabled(account);
    const promises = [
      fetchFilterData(
        isAttributeEnabled(catalogAttributes.skillName) && !isMyLearning,
        `${dataEndpoint}?filter.skillName=true`
      ),

      fetchFilterData(
        isAttributeEnabled(catalogAttributes.tagName),
        `${dataEndpoint}?filter.tagName=true&page[limit]=100`
      ),

      isAttributeEnabled(catalogAttributes.catalogs) ? getOrUpdateCatalogFilters() : [],

      fetchFilterData(
        isAttributeEnabled(catalogAttributes.cities) && !structuredLocationEnabled,
        `${dataEndpoint}?filter.cityName=true`
      ),

      isAttributeEnabled(catalogAttributes.products) &&
        products.enabled &&
        fetchRecommendationData(PRODUCT, dataEndpoint),

      isAttributeEnabled(catalogAttributes.roles) &&
        roles.enabled &&
        fetchRecommendationData(ROLE, dataEndpoint),

      isAttributeEnabled(catalogAttributes.levels) &&
        (roles.levelsEnabled || products.levelsEnabled) &&
        fetchRecommendationData(LEVEL, dataEndpoint),

      fetchFilterData(
        isAttributeEnabled(catalogAttributes.announcedGroups),
        `${config.primeApiURL}users/${userId}/userGroups?filter.announcedGroupsOnly=true`
      ),
      fetchFilterData(
        showPrice,
        `${config.primeApiURL}ecommerce/maxPrice?filter.loTypes=course%2ClearningProgram%2Ccertification`
      ),

      fetchFilterData(
        isAttributeEnabled(catalogAttributes.skillName) && isMyLearning,
        `${dataEndpoint}?filter.enrolled.skillName=true`
      ),

      fetchFilterData(
        isAttributeEnabled(catalogAttributes.cities) && structuredLocationEnabled,
        `${dataEndpoint}/filters?type=structuredLocations&language=${encodeURIComponent(
          config.locale || ENGLISH_LOCALE
        )}`
      ),
    ];

    const results = await Promise.allSettled(promises);

    const [
      skillsPromise,
      tagsPromise,
      catalogPromise,
      citiesPromise,
      productsPromise,
      rolesPromise,
      levelsPromise,
      announcedGroupsPromise,
      pricePromise,
      userSkillsPromise,
      structuredLocationPromise,
    ] = results.map(getSettledValue);
    const rolesData = getFilterNames(rolesPromise);
    const levelsData = getFilterNames(levelsPromise);
    const productsData = getFilterNames(productsPromise);
    const skillsData = getFilterNames(skillsPromise);
    const tagsData = getFilterNames(tagsPromise);
    const citiesData =
      getStructuredLocationList(structuredLocationPromise) || getFilterNames(citiesPromise);
    const announcedGroupsData = getAnnouncedGroupsList(announcedGroupsPromise);

    let userSkills = getFilterNames(userSkillsPromise);
    userSkills = [...new Set(userSkills)];

    const catalogData = getCatalogList(catalogPromise);

    setALMAttribute(FILTER.SKILL_NAME, skillsData);
    setALMAttribute(FILTER.TAG_NAME, tagsData);

    let maxPrice = 0;
    if (showPrice && pricePromise) {
      const parsedResponse: MaxPrice = JSON.parse(pricePromise);
      maxPrice = Math.ceil(Math.max(...Object.values(parsedResponse)));
    }

    const createAndUpdateFilterList = (data: any, filterType: any) => {
      const list = data?.map((item: any) => ({
        value: item.id || item,
        label: item.name || item,
        checked: false,
      }));
      return updateFilterList(list, queryParams, filterType);
    };

    const skillFilterOptions = isMyLearning ? userSkills : skillsData;
    const rolesList = createAndUpdateFilterList(rolesData, FILTER.ROLES);
    const levelsList = createAndUpdateFilterList(levelsData, FILTER.LEVELS);
    const productsList = createAndUpdateFilterList(productsData, FILTER.PRODUCTS);
    const announcedGroupsList = createAndUpdateFilterList(
      announcedGroupsData,
      FILTER.ANNOUNCED_GROUPS
    );
    const skillsList = createAndUpdateFilterList(skillFilterOptions, FILTER.SKILL_NAME);
    const tagsList = createAndUpdateFilterList(tagsData, FILTER.TAG_NAME);
    const citiesList = createAndUpdateFilterList(citiesData, FILTER.CITIES);
    const catalogList = createAndUpdateFilterList(catalogData, FILTER.CATALOGS);

    const defaultFiltersState = getDefaultFiltersState(account);
    const learnerStateList = defaultFiltersState.learnerState.list || [];
    const enableAlternateCompletion = isAccAltCompletionEnabled(account);

    if (isMyLearning) {
      const excludedFilters = [NOT_ENROLLED, COMPLETED_VIA_ALTERNATE];
      defaultFiltersState.learnerState.list = learnerStateList.filter(
        item => !excludedFilters.includes(item.value as string)
      );
    } else {
      const notEnrolledFilterExists = learnerStateList.some(item => item.value === NOT_ENROLLED);
      const completedViaAlternateExists = learnerStateList.some(
        item => item.value === COMPLETED_VIA_ALTERNATE
      );
      // only add completedViaAlternate if enabled at account level
      if (enableAlternateCompletion && !completedViaAlternateExists) {
        learnerStateList.push({
          value: COMPLETED_VIA_ALTERNATE,
          label: 'alm.catalog.filter.completedViaAlternate',
          checked: false,
        });
      }

      if (!notEnrolledFilterExists) {
        learnerStateList.push({
          value: 'notenrolled',
          label: 'alm.catalog.filter.notenrolled',
          checked: false,
        });
      }

      defaultFiltersState.learnerState.list = learnerStateList;

      skillsList.unshift({
        value: '',
        label: GetTranslation('alm.text.mySkills', true),
        checked: false,
      });
    }

    return {
      ...defaultFiltersState,
      skillName: {
        ...defaultFiltersState.skillName,
        list: skillsList,
        canSearch: !isMyLearning,
      },
      tagName: {
        ...defaultFiltersState.tagName,
        list: tagsList,
      },
      catalogs: {
        ...defaultFiltersState.catalogs,
        list: catalogList,
      },
      priceRange: {
        ...defaultFiltersState.priceRange,
        maxPrice: maxPrice,
      },
      cities: {
        ...defaultFiltersState.cities,
        list: citiesList,
      },
      ...(productsData && {
        products: {
          ...defaultFiltersState.products,
          list: productsList,
        },
      }),
      ...(rolesData && {
        roles: {
          ...defaultFiltersState.roles,
          list: rolesList,
        },
      }),
      ...(levelsData && {
        levels: {
          ...defaultFiltersState.levels,
          list: levelsList,
        },
      }),
      announcedGroups: {
        ...defaultFiltersState.announcedGroups,
        list: announcedGroupsList,
      },
    };
  }
  async addProductToCart(sku: string) {
    const defaultCartValues = { items: [], totalQuantity: 0, error: null };
    return { ...defaultCartValues, error: true };
  }
  async addProductToCartNative(trainingId: string) {
    try {
      // Magento SKU has format loType:loId:loInstanceId ; Public API training instance id is of the format loType:loId_loInstanceId
      // so fetching the magento sku formatId from public api trainingId
      const skuId = getSkuId(trainingId);
      const params: QueryParams = {
        skuId: skuId,
      };
      const response: any = await RestAdapter.post({
        url: `${this.primeApiURL}ecommerce/cart/items`,
        method: 'POST',
        params,
      });
      const redirectionUrl = response;
      return {
        redirectionUrl,
        error: [],
      };
    } catch (error: any) {
      return { ...defaultCartValues };
    }
  }
  async buyNowNative(trainingId: string) {
    try {
      // Magento SKU has format loType:loId:loInstanceId ; Public API trainingId is of the format loType:loId_loInstanceId
      // so fetching the magento sku formatId from public api trainingId
      const skuId = getSkuId(trainingId);
      const params: QueryParams = {
        skuId: skuId,
      };
      const response: any = await RestAdapter.post({
        url: `${this.primeApiURL}ecommerce/orders`,
        method: 'POST',
        params,
      });
      const redirectionUrl = response;
      return {
        redirectionUrl,
        error: [],
      };
    } catch (error: any) {
      return { ...defaultCartValues };
    }
  }
  async getUsersBadges(
    userId: string,
    params: QueryParams
  ): Promise<{
    badgeList: PrimeUserBadge[];
    links: { next: any };
  }> {
    let response;
    try {
      response = await RestAdapter.get({
        url: `${this.primeApiURL}users/${userId}/userBadges`,
        params: params,
      });
    } catch (e: any) {}
    const parsedResponse = JsonApiParse(response);
    return {
      badgeList: parsedResponse.userBadgeList || [],
      links: {
        next: parsedResponse.links?.next || '',
      },
    };
  }
  async getCatalogsByIds(catalogIds: string[]): Promise<PrimeCatalog[] | null> {
    try {
      const primeApiURL = this.primeApiURL;
      const chunkSize = 10;
      const chunks: string[][] = [];
      for (let i = 0; i < catalogIds.length; i += chunkSize) {
        chunks.push(catalogIds.slice(i, i + chunkSize));
      }

      if (!chunks.length) {
        return null;
      }

      const requests = chunks.map(chunk => {
        const queryParams: QueryParams = {
          ids: chunk.join(','),
          'page[limit]': String(chunk.length),
          'page[offset]': '0',
          sort: 'name',
        };
        const apiOptions = {
          url: `${primeApiURL}/catalogs`,
          params: queryParams,
          method: 'GET',
        };
        return RestAdapter.get(apiOptions);
      });

      const results = await Promise.allSettled(requests);
      const aggregated: any[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const parsed = JsonApiParse(result.value).catalogList || [];
          aggregated.push(...parsed);
        }
      });

      if (!aggregated.length) {
        return null;
      }

      const seenIds = new Set<string>();
      const uniqueAggregated = aggregated.filter((item: any) => {
        const key = String(item.id);
        if (seenIds.has(key)) return false;
        seenIds.add(key);
        return true;
      });

      return uniqueAggregated;
    } catch (error) {
      console.error('Error fetching catalog data:', error);
      return null;
    }
  }
  async loadMoreBadges(url: string) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }
  async getAllDiscussions(params: QueryParams, trainingId: string) {
    try {
      const response = await RestAdapter.get({
        url: `${this.primeApiURL}learningObjects/${trainingId}/discussionPosts`,
        headers: { 'content-type': 'application/json' },
        params: params,
      });
      return JsonApiParse(response);
    } catch (e) {
      console.log(e);
    }
  }
  async loadMoreDiscussion(url: string) {
    try {
      const response = await RestAdapter.get({
        url,
        headers: { 'content-type': 'application/json' },
      });
      return JsonApiParse(response);
    } catch (e) {
      console.log(e);
    }
  }
  async postDiscussion(trainingId: string, body: Object) {
    try {
      const response = await RestAdapter.post({
        url: `${this.primeApiURL}learningObjects/${trainingId}/discussionPosts?include=learner`,
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
        },
      });
      return JsonApiParse(response);
    } catch (e) {
      console.log(e);
    }
  }
  async deleteDiscussion(loId: string, discussionPostId: string) {
    try {
      await RestAdapter.delete({
        url: `${this.primeApiURL}learningObjects/${loId}/discussionPosts/${discussionPostId}`,
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
  async fetchCourseInstanceMapping(training: PrimeLearningObject, trainingInstanceId: string) {
    try {
      const params: QueryParams = { include: INCLUDE_SUBLO_INSTANCES };
      const headers = { 'content-type': 'application/json' };
      const response = await RestAdapter.ajax({
        url: `${this.primeApiURL}learningObjects/${training.id}/instances/${trainingInstanceId}`,
        method: 'GET',
        headers,
        params,
      });
      if (response) {
        return JsonApiParse(response);
      }
    } catch (e) {
      console.log(e);
    }
    return;
  }

  async getSearchFilterList(
    query: string,
    type: string,
    selectedItemsFromStore: { [key: string]: boolean }
  ): Promise<FilterListObject[]> {
    return await getSearchFilterList(query, type, selectedItemsFromStore);
  }

  async getExternalLearningSettings(): Promise<any> {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}externalLearningSettings`,
    });
    return JSON.parse(response as string);
  }

  async getExternalLearnings(params: QueryParams): Promise<JsonApiResponse> {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}externalLearnings`,
      params,
    });
    return JsonApiParse(response) as JsonApiResponse;
  }

  async getExternalLearningsByUrl(url: string): Promise<JsonApiResponse> {
    const response = await RestAdapter.get({ url });
    return JsonApiParse(response) as JsonApiResponse;
  }

  async getExternalLearningById(id: string): Promise<JsonApiResponse> {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}externalLearnings/${id}`,
    });
    return JsonApiParse(response) as JsonApiResponse;
  }

  async submitExternalLearning(payload: object): Promise<void> {
    await RestAdapter.ajax({
      url: `${this.primeApiURL}externalLearnings`,
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async updateExternalLearning(id: string, payload: object): Promise<void> {
    await RestAdapter.ajax({
      url: `${this.primeApiURL}externalLearnings/${id}`,
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getUserById(userId: string): Promise<JsonApiResponse> {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}users/${userId}`,
    });
    return JsonApiParse(response) as JsonApiResponse;
  }
}

const ALMCustomHooksInstance = new ALMCustomHooks();

APIServiceInstance.registerServiceInstance('aem-sites', ALMCustomHooksInstance);
export default ALMCustomHooksInstance;
