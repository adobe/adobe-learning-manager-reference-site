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
import { MaxPrice, PrimeLearningObject, PrimeUser } from "..";
import { CatalogFilterState } from "../store/reducers/catalog";
import {
  getOrUpdateCatalogFilters,
  getParamsForCatalogApi,
} from "../utils/catalog";
import { ENGLISH_LOCALE } from "../utils/constants";
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
import {
  getALMAttribute,
  getALMConfig,
  getALMUser,
  getQueryParamsFromUrl,
} from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { isCommerceEnabled } from "../utils/price";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import { getBrowserLocale } from "../utils/translationService";
import APIServiceInstance from "./APIService";
import ICustomHooks from "./ICustomHooks";

export const DEFAULT_PAGE_LIMIT = 9;
const DEFUALT_LO_INCLUDE =
  "instances.loResources.resources,instances.badge,supplementaryResources,enrollment.loResourceGrades,skills.skillLevel.skill,instances.loResources.resources.room";
const DEFAULT_SEARCH_SNIPPETTYPE =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion";
const DEFAULT_SEARCH_INCLUDE =
  "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";

class ALMCustomHooks implements ICustomHooks {
  primeApiURL = getALMConfig().primeApiURL;
  isTeamsApp = getALMConfig().isTeamsApp;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    const userResponse = await getALMUser();
    const user = userResponse?.user || ({} as PrimeUser);

    const catalogAttributes = getALMAttribute("catalogAttributes");
    const params: QueryParams = await getParamsForCatalogApi(filterState);
    params["sort"] = sort;
    params["page[limit]"] = DEFAULT_PAGE_LIMIT;
    params["include"] = DEFUALT_LO_INCLUDE;
    params["filter.ignoreEnhancedLP"] = false;

    let url = `${this.primeApiURL}/learningObjects`;
    if (searchText && catalogAttributes?.showSearch === "true") {
      url = `${this.primeApiURL}/search`;
      params["sort"] = "relevance";
      params["query"] = searchText;
      //TO DO check the include if needed
      params["snippetType"] = DEFAULT_SEARCH_SNIPPETTYPE;
      params["include"] = DEFAULT_SEARCH_INCLUDE;
      params["language"] = this.isTeamsApp
        ? getBrowserLocale()
        : user.contentLocale || getALMConfig().locale || ENGLISH_LOCALE;
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

  async getTraining(
    id: string,
    params: QueryParams
  ): Promise<PrimeLearningObject> {
    let response;
    try {
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
    const queryParams = getQueryParamsFromUrl();

    let maxPrice = 0;
    if (isCommerceEnabled()) {
      try {
        const response = await RestAdapter.get({
          url: `${config.primeApiURL}ecommerce/maxPrice?filter.loTypes=course%2ClearningProgram%2Ccertification`,
        });
        const parsedResponse: MaxPrice = JSON.parse(response as string);
        maxPrice = Math.ceil(Math.max(...Object.values(parsedResponse)));
      } catch (e) {
        console.error(e);
      }
    }

    const [skillsPromise, tagsPromise, catalogPromise, citiesPromise] =
      await Promise.all([
        RestAdapter.get({
          url: `${config.primeApiURL}data?filter.skillName=true`,
        }),
        RestAdapter.get({
          url: `${config.primeApiURL}data?filter.tagName=true`,
        }),
        getOrUpdateCatalogFilters(),
        RestAdapter.get({
          url: `${config.primeApiURL}data?filter.cityName=true`,
        }),
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

    const cities = JsonApiParse(citiesPromise)?.data?.names;
    let citiesList = cities?.map((item: string) => ({
      value: item,
      label: item,
      checked: false,
    }));
    citiesList = updateFilterList(citiesList, queryParams, "cities");

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
      price: {
        ...defaultFiltersState.price,
        maxPrice: maxPrice,
      },
      cities: {
        ...defaultFiltersState.cities,
        list: citiesList,
      },
    };
    // return { skillsList, tagsList, catalogList };
  }
  async addProductToCart(sku: string) {
    const defaultCartValues = { items: [], totalQuantity: 0, error: null };
    return { ...defaultCartValues, error: true };
  }
}

const ALMCustomHooksInstance = new ALMCustomHooks();

APIServiceInstance.registerServiceInstance("aem-sites", ALMCustomHooksInstance);
export default ALMCustomHooksInstance;
