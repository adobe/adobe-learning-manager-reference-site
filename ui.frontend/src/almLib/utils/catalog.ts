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
  PrimeCatalog,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../models/PrimeModels";
import { CatalogFilterState } from "../store/reducers/catalog";
import {
  getALMAttribute,
  getALMConfig,
  getItemFromStorage,
  setItemToStorage,
} from "./global";
import { JsonApiParse } from "./jsonAPIAdapter";
import { QueryParams, RestAdapter } from "./restAdapter";

const PRIME_CATALOG_FILTER = "PRIME_CATALOG_FILTER";

export function isJobaid(training: PrimeLearningObject): boolean {
  return training.loType.toLowerCase() === "jobaid" ? true : false;
}

export function isJobaidContentTypeUrl(training: PrimeLearningObject): boolean {
  const trainingInstance = training.instances[0];
  const contentType =
    trainingInstance.loResources[0]?.resources[0]?.contentType;
  return contentType === "OTHER" ? true : false;
}

export function getJobaidUrl(training: PrimeLearningObject): string {
  return training.instances[0]?.loResources[0]?.resources[0]?.location;
}

export function getActiveInstances(
  training: PrimeLearningObject
): PrimeLearningObjectInstance[] {
  return training.instances?.filter((i) => i && i.state === "Active");
}

export function getDefaultIntsance(
  training: PrimeLearningObject
): PrimeLearningObjectInstance[] {
  return training.instances?.filter((i) => i && i.isDefault);
}

export function debounce(fn: Function, time = 250) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), time);
  };
}

export const getOrUpdateCatalogFilters = async (): Promise<
  PrimeCatalog[] | undefined
> => {
  try {
    const filterItems = getItemFromStorage(PRIME_CATALOG_FILTER);
    if (filterItems) {
      return JsonApiParse(filterItems)?.catalogList;
    }
    const config = getALMConfig();
    const catalogPromise = await RestAdapter.get({
      url: `${config.primeApiURL}catalogs`,
    });
    setItemToStorage(PRIME_CATALOG_FILTER, catalogPromise);
    return JsonApiParse(catalogPromise)?.catalogList;
  } catch (e) {}
};

const getCatalogParamsForAPi = async (
  catalogState: string
): Promise<string> => {
  const catalogFilterFromStorage = await getOrUpdateCatalogFilters();
  const catalogFilterFromState = catalogState.split(",");
  let returnValue = "";
  catalogFilterFromStorage?.forEach((item) => {
    if (catalogFilterFromState.indexOf(item.name) > -1) {
      returnValue += returnValue ? "," + item.id : item.id;
    }
  });

  return returnValue;
};

export async function getParamsForCatalogApi(filterState: CatalogFilterState) {
  const params: QueryParams = {};
  const catalogAttributes = getALMAttribute("catalogAttributes");

  if (catalogAttributes?.showFilters === "true") {
    if (catalogAttributes?.loTypes === "true") {
      params["filter.loTypes"] = filterState.loTypes;
    }

    if (filterState.skillName && catalogAttributes?.skillName === "true") {
      params["filter.skillName"] = filterState.skillName;
    }
    if (filterState.tagName && catalogAttributes?.tagName === "true") {
      params["filter.tagName"] = filterState.tagName;
    }
    if (
      filterState.learnerState &&
      catalogAttributes?.learnerState === "true"
    ) {
      params["filter.learnerState"] = filterState.learnerState;
    }
    if (filterState.loFormat && catalogAttributes?.loFormat === "true") {
      params["filter.loFormat"] = filterState.loFormat;
    }
    if (filterState.duration && catalogAttributes?.duration === "true") {
      params["filter.duration.range"] = filterState.duration;
    }
    if (filterState.skillLevel && catalogAttributes?.skillLevel === "true") {
      params["filter.skill.level"] = filterState.skillLevel;
    }
    if (filterState.catalogs && catalogAttributes?.catalogs === "true") {
      params["filter.catalogIds"] = await getCatalogParamsForAPi(
        filterState.catalogs
      );
    }
    if (filterState.price && catalogAttributes?.price === "true") {
      params["filter.priceRange"] = filterState.price;
    }
  }
  return params;
}

interface DurationFilter {
  lte: number;
  gte: number;
}

export function getFiltersObjectForESApi(filterState: CatalogFilterState) {
  const {
    duration,
    loFormat,
    loTypes,
    skillLevel,
    skillName,
    tagName,
    catalogs,
  } = filterState;
  let filters: any = {
    terms: {
      loSkillLevels: skillLevel ? filterState.skillLevel.split(",") : null,
      loType: loTypes ? filterState.loTypes.split(",") : null,
      deliveryType: loFormat ? filterState.loFormat.split(",") : null,
      loSkillNames: skillName ? filterState.skillName.split(",") : null,
      tags: tagName ? filterState.tagName.split(",") : null,
      catalogNames: catalogs ? catalogs.split(",") : null,
    },
    range: {},
  };
  //range object
  if (duration) {
    const durations = duration.split(",");
    let durationFilter: DurationFilter[] = [];
    durations.forEach((item) => {
      const [minValue, maxValue] = item.split("-");
      durationFilter.push({
        lte: parseInt(maxValue),
        gte: parseInt(minValue),
      });
    });
    filters.range.duration = durationFilter;
  }
  return filters;
}

export function getRequestObjectForESApi(
  filterState: CatalogFilterState,
  sort: string,
  searchText: string = ""
) {
  const requestObject = {
    query: searchText,
    sort: {
      name: sort,
      order: "desc",
    },
    filters: getFiltersObjectForESApi(filterState),
  };
  return requestObject;
}

export function getIndividualFiltersForCommerce(
  options: any[],
  filterState: CatalogFilterState,
  type: string
) {
  const optionsMap: any = {};
  options?.forEach((element: { label: any; value: any }) => {
    if (!optionsMap[element.label]) {
      optionsMap[element.label] = element.value;
    }
  });

  const loTypes = filterState[type as keyof CatalogFilterState].split(",");
  let value: any[] = [];
  loTypes.forEach((element) => {
    if (optionsMap[element]) {
      value.push(optionsMap[element]);
    }
  });

  return value;
}
