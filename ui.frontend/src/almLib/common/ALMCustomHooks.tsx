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
import { MaxPrice, PrimeLearningObject, PrimeUser, PrimeUserBadge, PrimeUserGroup } from "..";
import store from "../../store/APIStore";
import { CatalogFilterState } from "../store/reducers/catalog";
import {
  fetchRecommendationData,
  getFilterNames,
  getLocalesForSearch,
  getOrUpdateCatalogFilters,
  getParamsForCatalogApi,
  isAttributeEnabled,
} from "../utils/catalog";
import {
  ALM_LEARNER_ADD_TO_SEARCH,
  CERTIFICATION,
  ENGLISH_LOCALE,
  FILTER,
  LEARNING_PROGRAM,
  LEVEL,
  NOT_ENROLLED,
  PRODUCT,
  ROLE,
  COURSE,
  API_REQUEST_CANCEL_TOKEN,
} from "../utils/constants";
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
import {
  getALMAttribute,
  getALMConfig,
  getALMUser,
  getQueryParamsFromUrl,
  sendEvent,
  getSkuId,
  setALMAttribute,
} from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { canShowPriceFilter } from "../utils/price";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import APIServiceInstance from "./APIService";
import ICustomHooks from "./ICustomHooks";
import { defaultCartValues } from "../utils/lo-utils";
import { GetTranslation } from "../utils/translationService";

export const DEFAULT_PAGE_LIMIT = 9;
const DEFUALT_LO_INCLUDE =
  "instances.loResources.resources,enrollment.loResourceGrades,skills.skillLevel.skill";
const DEFAULT_SEARCH_SNIPPETTYPE =
  "catalogName,catalogDescription,courseName,courseDescription,courseOverview,courseTag,badgeName,skillName,skillDescription,moduleName,moduleDescription,moduleTag,lpName,lpDescription,lpOverview,jobAidName,jobAidDescription,jobAidTag,certificationName,certificationDescription,certificationOverview,note,discussion";
const DEFAULT_SEARCH_INCLUDE =
  "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";
const includeParams = "products,roles,extensionOverrides,effectivenessData";
class ALMCustomHooks implements ICustomHooks {
  primeApiURL = getALMConfig().primeApiURL;
  async getTrainings(filterState: CatalogFilterState, sort: string, searchText: string) {
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);
    const storeState = store.getState();
    const catalogState = storeState.catalog;
    const snippetType = catalogState.snippetType
      ? catalogState.snippetType
      : DEFAULT_SEARCH_SNIPPETTYPE;

    const catalogAttributes = getALMAttribute("catalogAttributes");
    const requestBody = await getParamsForCatalogApi(filterState, user.account);
    const params: QueryParams = {};
    params["page[limit]"] = DEFAULT_PAGE_LIMIT;
    params["sort"] = sort;
    params["enforcedFields[learningObject]"] = includeParams;
    params["include"] = DEFUALT_LO_INCLUDE;

    let response;
    let parsedResponse;
    if (searchText && catalogAttributes?.showSearch === "true") {
      const searchResponse = await this.handleSearchRequest(
        searchText,
        snippetType,
        filterState,
        params,
        requestBody,
        user,
        sort
      );
      parsedResponse = JsonApiParse(searchResponse.response);
      const parsedMarketPlaceCount = JSON.parse(searchResponse.contentMarketPlaceResponse);
      parsedResponse.meta = {
        ...parsedResponse.meta,
        contentMarketPlaceCount: parsedMarketPlaceCount.count,
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
      next: parsedResponse.links?.next || "",
      meta: parsedResponse.meta,
    };
  }

  async getTrainingsForAuthor(authorId: string, authorType: string, sort: string, url?: string) {
    const requestBody = {
      "filter.authors": [
        {
          authorId: parseInt(authorId),
          authorType: authorType,
        },
      ],
      "filter.loTypes": [COURSE, LEARNING_PROGRAM, CERTIFICATION],
    };
    const params: QueryParams = {};
    params["page[limit]"] = DEFAULT_PAGE_LIMIT;
    params["sort"] = sort;
    params["include"] = DEFUALT_LO_INCLUDE;
    let response;
    if (url) {
      response = await RestAdapter.post({
        url,
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/vnd.api+json;charset=UTF-8",
        },
      });
    } else {
      response = await this.handleNonSearchRequest(params, requestBody);
    }
    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || "",
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
    sort: string
  ) {
    const url = `${this.primeApiURL}search/query`;
    const queryParams = getQueryParamsFromUrl();
    params["include"] = DEFAULT_SEARCH_INCLUDE;
    params["sort"] = sort;
    const snippetsFromUrl = queryParams["filter.snippetTypes"];
    requestBody["language"] = getLocalesForSearch(user);
    requestBody["matchType"] = "phrase_and_match";
    requestBody["filter.snippetTypes"] = (snippetsFromUrl || snippetType)?.split(",");
    requestBody["query"] = searchText;
    requestBody["stemmed"] = true;
    requestBody["mode"] = "advanceSearch";

    const contentMarketPlaceUrl = `${this.primeApiURL}search/marketplace/count?query=${searchText}`;
    const [contentMarketPlaceResponse, response]: any = await Promise.all([
      RestAdapter.get({
        url: contentMarketPlaceUrl,
        params: {},
        cancelToken: API_REQUEST_CANCEL_TOKEN.GET_CONTENT_MARKEPLACE_COUNT,
      }),
      RestAdapter.post({
        url,
        params,
        body: JSON.stringify(requestBody),
        cancelToken: API_REQUEST_CANCEL_TOKEN.GET_TRAININGS,
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json;charset=UTF-8",
        },
      }),
    ]);
    return { contentMarketPlaceResponse, response };
  }

  async handleNonSearchRequest(params: QueryParams, requestBody: any) {
    const url = `${this.primeApiURL}learningObjects/query`;
    return await RestAdapter.post({
      url,
      params,
      body: JSON.stringify(requestBody),
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json;charset=UTF-8",
      },
      cancelToken: API_REQUEST_CANCEL_TOKEN.GET_TRAININGS,
    });
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ) {
    let response;
    const userResponse = await getALMUser();
    const requestBody = await getParamsForCatalogApi(filterState, userResponse?.user?.account!);
    const cancelToken = API_REQUEST_CANCEL_TOKEN.GET_TRAININGS;
    const headers = {
      "Content-Type": "application/vnd.api+json;charset=UTF-8",
    };
    if (searchText) {
      const queryParams = getQueryParamsFromUrl();
      const snippetsFromUrl = queryParams["filter.snippetTypes"];
      const storeState = store.getState();
      const catalogState = storeState.catalog;
      const snippetType = catalogState.snippetType
        ? catalogState.snippetType
        : DEFAULT_SEARCH_SNIPPETTYPE;

      requestBody["language"] = getLocalesForSearch(userResponse?.user!);
      requestBody["matchType"] = "phrase_and_match";
      requestBody["filter.snippetTypes"] = (snippetsFromUrl || snippetType)?.split(",");
      requestBody["query"] = searchText;
      requestBody["stemmed"] = true;
    }
    response = await RestAdapter.post({
      url,
      cancelToken,
      method: "POST",
      body: JSON.stringify(requestBody),
      headers,
    });
    const parsedResponse = JsonApiParse(response);

    return {
      learningObjectList: parsedResponse.learningObjectList || [],
      links: {
        next: parsedResponse.links?.next || "",
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
    window.postMessage("almLoNotFound");
  };

  async getTraining(id: string, params: QueryParams): Promise<PrimeLearningObject> {
    let response;
    try {
      params["enforcedFields[learningObject]"] = includeParams;
      params["enforcedFields[sessionRecordingInfo]"] = "transcriptUrl";
      params["enforcedFields[resource]"] = "isExternalUrl";
      if (id.includes(CERTIFICATION)) {
        params["enforcedFields[learningObjectInstanceEnrollment]"] =
          "previousState,previousExpiryDate";
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

  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${trainingId}/instances/${instanceId}/summary`,
    });
    return JsonApiParse(response);
  }
  async enrollToTraining(params: QueryParams = {}, headers: Record<string, string> = {}) {
    const response = await RestAdapter.post({
      url: `${this.primeApiURL}enrollments`,
      method: "POST",
      params,
      headers,
    });
    return JsonApiParse(response);
  }
  async unenrollFromTraining(enrollmentId = "") {
    const response = await RestAdapter.delete({
      url: `${this.primeApiURL}enrollments/${enrollmentId}`,
      method: "DELETE",
    });
    return response;
  }

  async getFilters() {
    const config = getALMConfig();
    const queryParams = getQueryParamsFromUrl();
    const isMyLearning = queryParams.myLearning === "true";

    const dataEndpoint = `${config.primeApiURL}data`;

    const response = await getALMUser();
    const user = response?.user;
    const userId = user?.id;
    const account = user?.account!;
    const prlCriteria = account?.prlCriteria;

    const catalogAttributes = getALMAttribute("catalogAttributes") || {};
    const promises = [];
    //we show user skills as skill filter options on my learning page, thus no need of this API call in that case
    if (catalogAttributes?.skillName === "true" && !isMyLearning) {
      promises.push(
        RestAdapter.get({
          url: `${dataEndpoint}?filter.skillName=true`,
        })
      );
    } else {
      promises.push(null);
    }
    if (catalogAttributes?.tagName === "true") {
      promises.push(
        RestAdapter.get({
          url: `${dataEndpoint}?filter.tagName=true&page[limit]=100`,
        })
      );
    } else {
      promises.push(null);
    }
    if (catalogAttributes?.catalogs === "true") {
      promises.push(getOrUpdateCatalogFilters());
    } else {
      promises.push([]);
    }
    if (catalogAttributes?.cities === "true") {
      promises.push(
        RestAdapter.get({
          url: `${dataEndpoint}?filter.cityName=true`,
        })
      );
    } else {
      promises.push(null);
    }

    if (prlCriteria?.products?.enabled) {
      promises.push(fetchRecommendationData(PRODUCT, dataEndpoint));
    } else {
      promises.push(null);
    }

    if (prlCriteria?.roles?.enabled) {
      promises.push(fetchRecommendationData(ROLE, dataEndpoint));
    } else {
      promises.push(null);
    }

    if (prlCriteria?.roles?.levelsEnabled || prlCriteria?.products?.levelsEnabled) {
      promises.push(fetchRecommendationData(LEVEL, dataEndpoint));
    } else {
      promises.push(null);
    }

    if (isAttributeEnabled(catalogAttributes?.announcedGroups)) {
      promises.push(
        await RestAdapter.get({
          url: `${config.primeApiURL}users/${userId}/userGroups?filter.announcedGroupsOnly=true`,
          headers: { "x-acap-future-response-version": "true" },
        })
      );
    } else {
      promises.push(null);
    }

    if (canShowPriceFilter(account)) {
      promises.push(
        await RestAdapter.get({
          url: `${config.primeApiURL}ecommerce/maxPrice?filter.loTypes=course%2ClearningProgram%2Ccertification`,
        })
      );
    } else {
      promises.push(null);
    }

    if (catalogAttributes?.skillName === "true" && isMyLearning) {
      promises.push(
        RestAdapter.get({
          url: `${dataEndpoint}?filter.enrolled.skillName=true`,
        })
      );
    } else {
      promises.push(null);
    }

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
    ] = await Promise.all(promises);

    const roles = getFilterNames(rolesPromise);
    const levels = getFilterNames(levelsPromise);
    const products = getFilterNames(productsPromise);
    const skills = getFilterNames(skillsPromise);
    const tags = getFilterNames(tagsPromise);
    const cities = getFilterNames(citiesPromise);
    const catalog = (catalogPromise as any).map((item: any) => {
      return { id: item.id, name: item.name };
    });
    let userSkills = getFilterNames(userSkillsPromise);
    userSkills = [...new Set(userSkills)];

    //store skills to render when we clear skill search and avoid API call
    setALMAttribute(FILTER.SKILL_NAME, skills);
    setALMAttribute(FILTER.TAG_NAME, tags);

    const announcedGroups = announcedGroupsPromise
      ? JsonApiParse(announcedGroupsPromise)?.userGroupList?.map((group: PrimeUserGroup) => ({
          id: group.id,
          name: group.name,
        }))
      : null;

    let maxPrice = 0;
    if (canShowPriceFilter(account)) {
      const parsedResponse: MaxPrice = JSON.parse(pricePromise as string);
      maxPrice = Math.ceil(Math.max(...Object.values(parsedResponse)));
    }

    function createAndUpdateFilterList(data: any, filterType: string) {
      let list = data?.map((item: any) => ({
        value: item.id || item,
        label: item.name || item,
        checked: false,
      }));
      return updateFilterList(list, queryParams, filterType);
    }
    const skillFilterOptions = isMyLearning ? userSkills : skills;
    const rolesList = createAndUpdateFilterList(roles, FILTER.ROLES);
    const levelsList = createAndUpdateFilterList(levels, FILTER.LEVELS);
    const productsList = createAndUpdateFilterList(products, FILTER.PRODUCTS);
    const announcedGroupsList = createAndUpdateFilterList(announcedGroups, FILTER.ANNOUNCED_GROUPS);
    const skillsList = createAndUpdateFilterList(skillFilterOptions, FILTER.SKILL_NAME);
    const tagsList = createAndUpdateFilterList(tags, FILTER.TAG_NAME);
    const citiesList = createAndUpdateFilterList(cities, FILTER.CITIES);
    const catalogList = createAndUpdateFilterList(catalog, FILTER.CATALOGS);

    const defaultFiltersState = getDefaultFiltersState();
    const learnerStateList = defaultFiltersState.learnerState.list || [];

    if (isMyLearning) {
      defaultFiltersState.learnerState.list = learnerStateList.filter(
        item => item.value !== NOT_ENROLLED
      );
    } else {
      const notEnrolledFilterExists = learnerStateList.some(item => item.value === NOT_ENROLLED);

      if (!notEnrolledFilterExists) {
        learnerStateList.push({
          value: "notenrolled",
          label: "alm.catalog.filter.notenrolled",
          checked: false,
        });
      }

      defaultFiltersState.learnerState.list = learnerStateList;

      //on catalog page show mySkill filter option
      skillsList.unshift({
        value: "",
        label: GetTranslation("alm.text.mySkills", true),
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
      ...(products && {
        products: {
          ...defaultFiltersState.products,
          list: productsList,
        },
      }),
      ...(roles && {
        roles: {
          ...defaultFiltersState.roles,
          list: rolesList,
        },
      }),
      ...(levels && {
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
    // return { skillsList, tagsList, catalogList };
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
        method: "POST",
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
        method: "POST",
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
        next: parsedResponse.links?.next || "",
      },
    };
  }
  async loadMoreBadges(url: string) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }
}

const ALMCustomHooksInstance = new ALMCustomHooks();

APIServiceInstance.registerServiceInstance("aem-sites", ALMCustomHooksInstance);
export default ALMCustomHooksInstance;
