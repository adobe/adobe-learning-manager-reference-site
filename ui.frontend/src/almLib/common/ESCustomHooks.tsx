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
import { CatalogFilterState } from '../store/reducers/catalog';
import { getRequestObjectForESApi } from '../utils/catalog';
import { FILTER, JOBAID, WIDGET_SOURCE } from '../utils/constants';
import {
  FilterListObject,
  getDefaultFiltersState,
  getESSearchFilterList,
  updateFilterList,
} from '../utils/filters';
import {
  getALMConfig,
  getALMUser,
  getQueryParamsFromUrl,
  isUserLoggedIn,
  redirectToLoginAndAbort,
  setALMAttribute,
} from '../utils/global';
import { parseESResponse } from '../utils/jsonAPIAdapter';
import { QueryParams, RestAdapter } from '../utils/restAdapter';
import AkamaiCustomHooksInstance from './AkamaiCustomHooks';
import { default as ALMCustomHooksInstance, DEFAULT_PAGE_LIMIT } from './ALMCustomHooks';
import APIServiceInstance from './APIService';
import ICustomHooks from './ICustomHooks';
import {
  PrimeCatalog,
  PrimeUserBadge,
  PrimeLearningObject,
  PaginationParams,
  WidgetTrainingFilters,
  CategoryWidgetFilters,
  PrimeUser,
  WidgetRecommendationFilters,
} from '../models';
import { defaultCartValues } from '../utils/lo-utils';

const headers = {
  'Content-Type': 'application/json',
};
class ESCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCdnBaseUrl = this.almConfig.almCdnBaseUrl;

  setConfigUrls(): void {
    this.almConfig = getALMConfig();
    this.primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
    this.esBaseUrl = this.almConfig.esBaseUrl;
    this.almCdnBaseUrl = this.almConfig.almCdnBaseUrl;
  }

  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = '',
    autoCorrectMode: boolean
  ) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getTrainings(filterState, sort, searchText, autoCorrectMode);
    }
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);
    const requestObject = getRequestObjectForESApi(
      filterState,
      sort,
      searchText,
      user?.account?.prlCriteria
    );
    //below if needed for alm-non-logged-in
    if (!this.esBaseUrl) {
      this.almConfig = getALMConfig();
      this.primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
      this.esBaseUrl = this.almConfig.esBaseUrl;
      this.almCdnBaseUrl = this.almConfig.almCdnBaseUrl;
    }

    let response: any = await RestAdapter.post({
      url: `${this.esBaseUrl}/search?size=${DEFAULT_PAGE_LIMIT}`,
      method: 'POST',
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);
    return {
      trainings: results || [],
      next: response.next || '',
      meta: {
        formalCount: response?.count,
      },
    };
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = '',
    url: string,
    autoCorrectMode: boolean
  ) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.loadMoreTrainings(
        filterState,
        sort,
        searchText,
        url,
        autoCorrectMode
      );
    }
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);
    const requestObject = getRequestObjectForESApi(
      filterState,
      sort,
      searchText,
      user?.account?.prlCriteria
    );
    let response: any = await RestAdapter.post({
      url,
      method: 'POST',
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);

    return {
      learningObjectList: results || [],
      links: {
        next: response.next || '',
      },
    };
  }
  async loadMore(url: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.loadMore(url);
    }
  }

  async getTraining(id: string, params: QueryParams = {} as QueryParams) {
    return AkamaiCustomHooksInstance.getTraining(id, params);
  }

  async getTrainingsForAuthor(authorId: string, authorType: string, sort: string, url?: string) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getTrainingsForAuthor(authorId, authorType, sort, url);
    }
  }
  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getTrainingInstanceSummary(trainingId, instanceId);
    }
    return null;
  }
  async enrollToTraining(params: QueryParams = {}, headers: Record<string, string> = {}) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.enrollToTraining(params, headers);
    }
  }
  async unenrollFromTraining(enrollmentId: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.unenrollFromTraining(enrollmentId);
    }
  }

  async enrollToPersonalizedPath(id: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.enrollToPersonalizedPath(id);
    }
  }

  async deletePersonalizedPath(id: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.deletePersonalizedPath(id);
    }
  }

  async getFilters() {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getFilters();
    }
    const queryParams = getQueryParamsFromUrl();
    const esBaseUrl = getALMConfig().esBaseUrl;
    const response = await RestAdapter.get({
      url: `${esBaseUrl}/filterableData`,
    });
    const data = JSON.parse(response as string);
    if (data) {
      const { terms } = data;
      //generating the skill name list
      let skillsList = terms?.loSkillNames?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      skillsList = updateFilterList(skillsList, queryParams, 'skillName');

      //generating the Taglist
      let tagsList = terms?.tags?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      tagsList = updateFilterList(tagsList, queryParams, 'tagName');

      let citiesList = terms?.cities?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      citiesList = updateFilterList(citiesList, queryParams, 'cities');

      let catalogList: any[] = terms?.catalogNames?.map((item: string) => ({
        value: item,
        label: item,
        id: item,
        name: item,
        checked: false,
      }));
      catalogList = updateFilterList(catalogList, queryParams, 'catalogs');

      //generating the products list
      let productsList: any[] = terms.recommendationProductNames?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      productsList = updateFilterList(productsList, queryParams, 'products');

      //generating the roles list
      let rolesList: any[] = terms.recommendationRoleNames?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      rolesList = updateFilterList(rolesList, queryParams, 'roles');

      let recommendationLevels =
        terms.recommendationRoleLevels || terms.recommendationProductLevels;
      let levelsList: any[] = recommendationLevels?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      levelsList = updateFilterList(levelsList, queryParams, 'levels');

      // Store filter data for guest mode client-side search
      setALMAttribute(FILTER.SKILL_NAME, terms?.loSkillNames || []);
      setALMAttribute(FILTER.TAG_NAME, terms?.tags || []);
      setALMAttribute(FILTER.CATALOGS, catalogList || []);
      setALMAttribute(FILTER.CITIES, terms?.cities || []);
      if (terms?.recommendationProductNames) {
        setALMAttribute(FILTER.PRODUCTS, terms.recommendationProductNames || []);
      }
      if (terms?.recommendationRoleNames) {
        setALMAttribute(FILTER.ROLES, terms.recommendationRoleNames || []);
      }
      if (terms?.recommendationLevels) {
        setALMAttribute(FILTER.LEVELS, terms.recommendationLevels || []);
      }

      const defaultFiltersState: any = getDefaultFiltersState();

      return {
        ...defaultFiltersState,
        skillName: {
          ...defaultFiltersState.skillName,
          list: skillsList,
        },
        tagName: {
          ...defaultFiltersState.tagName,
          list: tagsList,
        },
        catalogs: {
          ...defaultFiltersState.catalogs,
          list: catalogList,
        },
        cities: {
          ...defaultFiltersState.cities,
          list: citiesList,
        },
        ...(productsList && {
          products: {
            ...defaultFiltersState.products,
            list: productsList,
          },
        }),
        ...(rolesList && {
          roles: {
            ...defaultFiltersState.roles,
            list: rolesList,
          },
        }),
        ...(levelsList && {
          levels: {
            ...defaultFiltersState.levels,
            list: levelsList,
          },
        }),
      };
    }
  }
  async addProductToCart(sku: string) {
    const defaultCartValues = { items: [], totalQuantity: 0, error: null };
    return { ...defaultCartValues, error: true };
  }
  async addProductToCartNative(
    trainingId: string
  ): Promise<{ redirectionUrl: string; error: Array<string> }> {
    return { ...defaultCartValues };
  }
  async buyNowNative(
    trainingId: string
  ): Promise<{ redirectionUrl: string; error: Array<string> }> {
    return { ...defaultCartValues };
  }
  async getUsersBadges(
    userId: string,
    params: QueryParams
  ): Promise<
    | {
        badgeList: PrimeUserBadge[];
        links: { next: any };
      }
    | undefined
  > {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getUsersBadges(userId, params);
    }
    return;
  }
  async loadMoreBadges(url: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.loadMoreBadges(url);
    }
  }
  async getAllDiscussions(params: QueryParams, trainingId: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getAllDiscussions(params, trainingId);
    }
  }
  async loadMoreDiscussion(url: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.loadMoreDiscussion(url);
    }
  }
  async postDiscussion(trainingId: string, body: Object) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.postDiscussion(trainingId, body);
    }
  }
  async deleteDiscussion(loId: string, discussionPostId: string) {
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.deleteDiscussion(loId, discussionPostId);
    }
  }
  async getCatalogsByIds(catalogIds: string[]): Promise<PrimeCatalog[] | null> {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getCatalogsByIds(catalogIds);
    }
    return null;
  }
  async fetchCourseInstanceMapping(training: PrimeLearningObject, trainingInstanceId: string) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.fetchCourseInstanceMapping(training, trainingInstanceId);
    }
    return;
  }

  async getCoursePathWidgetTrainings(filters: WidgetTrainingFilters, pagination: PaginationParams) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getCoursePathWidgetTrainings(filters, pagination);
    }

    const { loIds, source, sourceDetails } = filters;
    const { page = 0, pageLimit } = pagination;

    if (!this.esBaseUrl) {
      this.setConfigUrls();
    }

    // Build ES query request object
    const requestObject: any = {
      query: '',
      lang: [this.almConfig.locale || 'en-US'],
      filters: {
        terms: {},
        range: {},
      },
    };

    // Build filters - loIds takes precedence
    if (loIds && loIds.length > 0) {
      requestObject.filters.terms.loId = loIds;
    } else {
      // Apply source-based filtering when loIds is not provided
      if (source === WIDGET_SOURCE.PRODUCT_SOURCE && sourceDetails?.name) {
        requestObject.filters.terms.recommendationProductNames = [sourceDetails.name];
      } else if (source === WIDGET_SOURCE.ROLE_SOURCE && sourceDetails?.name) {
        requestObject.filters.terms.recommendationRoleNames = [sourceDetails.name];
      } else if (source === WIDGET_SOURCE.CATALOG_SOURCE && sourceDetails?.name) {
        requestObject.filters.terms.catalogNames = [sourceDetails.name];
      }
    }

    const response: any = await RestAdapter.post({
      url: `${this.esBaseUrl}/search?page=${page}&size=${pageLimit}`,
      method: 'POST',
      headers,
      body: JSON.stringify(requestObject),
    });

    const parsedResponse = JSON.parse(response);
    const results = parseESResponse(parsedResponse.results);

    return {
      trainings: results || [],
      next: parsedResponse.next || '',
      meta: {},
    };
  }

  async getCoursePathWidgetRecommendations(
    filters: WidgetRecommendationFilters,
    pagination: PaginationParams
  ) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getCoursePathWidgetRecommendations(filters, pagination);
    }
    return null;
  }

  async getCategoryWidgetData(filters: CategoryWidgetFilters, pagination: PaginationParams) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getCategoryWidgetData(filters, pagination);
    }

    const { sourceIds, source } = filters;
    const { pageLimit, page } = pagination;

    if (!this.esBaseUrl) {
      this.setConfigUrls();
    }

    try {
      const requestedSize = pageLimit ?? DEFAULT_PAGE_LIMIT;
      const requestBody: any = {
        lang: this.almConfig.locale || 'en-US',
        size: requestedSize,
        page: page ?? 0,
      };

      // Set the appropriate flag based on source
      if (source === WIDGET_SOURCE.CATALOG_SOURCE) {
        requestBody.includeCatalogInfo = true;
      } else if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
        requestBody.includeRecommendationProducts = true;
      } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
        requestBody.includeRecommendationRoles = true;
      }

      if (sourceIds && sourceIds.length > 0) {
        if (source === WIDGET_SOURCE.CATALOG_SOURCE) {
          requestBody.catalogIds = sourceIds.map((id: string) => `catalog:${id}`);
        } else if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
          requestBody.productIds = sourceIds.map((id: string) => `recommendationProduct:${id}`);
        } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
          requestBody.roleIds = sourceIds.map((id: string) => `recommendationRole:${id}`);
        }
      }

      // Fetch filterable data with POST request
      const response = await RestAdapter.post({
        url: `${this.esBaseUrl}/categories`,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = JSON.parse(response as string);

      let allItems: any[] = [];

      // Determine which array to use based on source
      if (source === WIDGET_SOURCE.CATALOG_SOURCE) {
        allItems = data.catalogInfo || [];
      } else if (source === WIDGET_SOURCE.PRODUCT_SOURCE) {
        allItems = data.recommendationProducts || [];
      } else if (source === WIDGET_SOURCE.ROLE_SOURCE) {
        allItems = data.recommendationRoles || [];
      }

      // Transform to minimal structure matching widget expectations
      const categories = allItems.map(item => ({
        ...item,
        ...(item.contentImageUrl && { imageUrl: item.contentImageUrl }),
      })) as any[];

      return {
        categories,
        next: categories.length >= requestedSize ? 'has_more' : '',
        meta: {},
      };
    } catch (error) {
      console.error('Error fetching category data from ES:', error);
      return {
        categories: [],
        next: '',
        meta: {},
      };
    }
  }

  async getSearchFilterList(
    query: string,
    type: string,
    selectedItemsFromStore: { [key: string]: boolean }
  ): Promise<FilterListObject[]> {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getSearchFilterList(query, type, selectedItemsFromStore);
    }
    return await getESSearchFilterList(query, type, selectedItemsFromStore);
  }

  async getExternalLearningSettings() {
    return ALMCustomHooksInstance.getExternalLearningSettings();
  }

  async getExternalLearnings(params: QueryParams) {
    return ALMCustomHooksInstance.getExternalLearnings(params);
  }

  async getExternalLearningsByUrl(url: string) {
    return ALMCustomHooksInstance.getExternalLearningsByUrl(url);
  }

  async getExternalLearningById(id: string) {
    return ALMCustomHooksInstance.getExternalLearningById(id);
  }

  async submitExternalLearning(payload: object) {
    return ALMCustomHooksInstance.submitExternalLearning(payload);
  }

  async updateExternalLearning(id: string, payload: object) {
    return ALMCustomHooksInstance.updateExternalLearning(id, payload);
  }

  async getUserById(userId: string) {
    return ALMCustomHooksInstance.getUserById(userId);
  }
}

const ESCustomHooksInstance = new ESCustomHooks();

APIServiceInstance.registerServiceInstance('aem-es', ESCustomHooksInstance);
export default ESCustomHooksInstance;
