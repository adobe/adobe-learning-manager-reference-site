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
import { PrimeLearningObject } from "..";
import { CatalogFilterState } from "../store/reducers/catalog";
import {
  getOrUpdateCatalogFilters,
  getParamsForCatalogApi,
} from "../utils/catalog";
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
import {
  getALMAttribute,
  getALMConfig,
  getQueryParamsIObjectFromUrl,
} from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export const DEFAULT_PAGE_LIMIT = 9;
const DEFUALT_LO_INCLUDE =
  "instances.loResources.resources,instances.badge,supplementaryResources,enrollment.loResourceGrades,skills.skillLevel.skill";
const DEFAULT_SEARCH_SNIPPETTYPE =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion";
const DEFAULT_SEARCH_INCLUDE =
  "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";

export default class ALMCustomHooks implements ICustomHooks {
  primeApiURL = getALMConfig().primeApiURL;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    const catalogAttributes = getALMAttribute("catalogAttributes");
    const params: QueryParams = await getParamsForCatalogApi(filterState);
    params["sort"] = sort;
    params["page[limit]"] = DEFAULT_PAGE_LIMIT;
    params["include"] = DEFUALT_LO_INCLUDE;
    params["filter.ignoreEnhancedLP"] = false;

    let url = `${this.primeApiURL}/learningObjects`;
    if (searchText && catalogAttributes?.showSearch === "true") {
      url = `${this.primeApiURL}/search`;
      params["query"] = searchText;
      //TO DO check the include if needed
      params["snippetType"] = DEFAULT_SEARCH_SNIPPETTYPE;
      params["include"] = DEFAULT_SEARCH_INCLUDE;
    }
    const response = await RestAdapter.get({
      url,
      params: params,
    });
    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || "",
    };
  }
  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }
  async loadMore(url: string) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }
  async getTraining(
    id: string,
    params: QueryParams
  ): Promise<PrimeLearningObject> {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${id}`,
      params: params,
    });
    return JsonApiParse(response).learningObject;
  }

  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${trainingId}/instances/${instanceId}/summary`,
    });
    return JsonApiParse(response);
  }
  async enrollToTraining(params: QueryParams = {}) {
    const response = await RestAdapter.post({
      url: `${this.primeApiURL}enrollments`,
      method: "POST",
      params,
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
    const queryParams = getQueryParamsIObjectFromUrl();

    const [skillsPromise, tagsPromise, catalogPromise] = await Promise.all([
      RestAdapter.get({
        url: `${config.primeApiURL}data?filter.skillName=true`,
      }),
      RestAdapter.get({
        url: `${config.primeApiURL}data?filter.tagName=true`,
      }),
      getOrUpdateCatalogFilters(),
    ]);
    const skills = JsonApiParse(skillsPromise)?.data?.names;
    let skillsList = skills?.map((item: string) => ({
      value: item,
      label: item,
      checked: false,
    }));
    skillsList = updateFilterList(skillsList, queryParams, "skillName");

    const tags = JsonApiParse(tagsPromise)?.data?.names;
    let tagsList = tags?.map((item: string) => ({
      value: item,
      label: item,
      checked: false,
    }));
    tagsList = updateFilterList(tagsList, queryParams, "tagName");

    let catalogList = catalogPromise?.map((item: any) => ({
      value: item.name,
      label: item.name,
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
    // return { skillsList, tagsList, catalogList };
  }
}

// APIServiceInstance.registerServiceInstance(
//   SERVICEINSTANCE.PRIME,
//   new ALMCustomHooks()
// );
