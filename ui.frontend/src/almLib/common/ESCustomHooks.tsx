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
import { CatalogFilterState } from "../store/reducers/catalog";
import { getRequestObjectForESApi } from "../utils/catalog";
import { JOBAID } from "../utils/constants";
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
import {
  getALMConfig,
  getQueryParamsFromUrl,
  isUserLoggedIn,
  redirectToLoginAndAbort,
} from "../utils/global";
import { parseESResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import AkamaiCustomHooksInstance from "./AkamaiCustomHooks";
import { default as ALMCustomHooksInstance, DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import APIServiceInstance from "./APIService";
import ICustomHooks from "./ICustomHooks";
import { PrimeUserBadge } from "../models";
import { defaultCartValues } from "../utils/lo-utils";

interface ISortMap {
  date: string;
  "-date": string;
}
const sortMap: any = {
  date: "publishDate",
  "-date": "publishDate",
};

const headers = {
  "Content-Type": "application/json",
};
class ESCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCdnBaseUrl = this.almConfig.almCdnBaseUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = "",
    autoCorrectMode: boolean
  ) {
    if (isUserLoggedIn()) {
      return ALMCustomHooksInstance.getTrainings(filterState, sort, searchText, autoCorrectMode);
    }
    const requestObject = getRequestObjectForESApi(
      filterState,
      sortMap[sort as keyof ISortMap],
      searchText
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
      method: "POST",
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);
    return {
      trainings: results || [],
      next: response.next || "",
    };
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = "",
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
    const requestObject = getRequestObjectForESApi(
      filterState,
      sortMap[sort as keyof ISortMap],
      searchText
    );
    let response: any = await RestAdapter.post({
      url,
      method: "POST",
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);

    return {
      learningObjectList: results || [],
      links: {
        next: response.next || "",
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
      skillsList = updateFilterList(skillsList, queryParams, "skillName");

      //generating the Taglist
      let tagsList = terms?.tags?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      tagsList = updateFilterList(tagsList, queryParams, "tagName");

      let citiesList = terms?.cities?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      citiesList = updateFilterList(citiesList, queryParams, "cities");

      let catalogList: any[] = terms?.catalogNames?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      catalogList = updateFilterList(catalogList, queryParams, "catalogs");
      const defaultFiltersState: any = getDefaultFiltersState();
      defaultFiltersState["loTypes"].list = defaultFiltersState["loTypes"].list?.filter(
        (item: any) => item.value !== JOBAID
      );

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
}

const ESCustomHooksInstance = new ESCustomHooks();

APIServiceInstance.registerServiceInstance("aem-es", ESCustomHooksInstance);
export default ESCustomHooksInstance;
