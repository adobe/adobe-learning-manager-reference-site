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
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
import { getALMConfig, getQueryParamsFromUrl } from "../utils/global";
import { JsonApiParse, parseESResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import { DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";

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
export default class ESCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCdnBaseUrl = this.almConfig.almCdnBaseUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = ""
  ) {
    const requestObject = getRequestObjectForESApi(
      filterState,
      sortMap[sort as keyof ISortMap],
      searchText
    );
    let response: any = await RestAdapter.post({
      url: `${this.esBaseUrl}/search?&size=${DEFAULT_PAGE_LIMIT}`,
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
    url: string
  ) {
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
    return null;
  }
  async getTraining(id: string) {
    const loPath = id.replace(":", "/");
    const response = await RestAdapter.get({
      url: `${this.almCdnBaseUrl}/${loPath}.json`,
    });
    return JsonApiParse(response).learningObject;
  }
  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    return null;
  }
  async enrollToTraining(params: QueryParams = {}) {
    return null;
  }
  async unenrollFromTraining(params: QueryParams = {}) {
    return null;
  }

  async getFilters() {
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
      let catalogList: any[] = terms?.catalogNames?.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      catalogList = updateFilterList(catalogList, queryParams, "catalogs");
      const defaultFiltersState = getDefaultFiltersState();

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
      };
    }
  }
}
