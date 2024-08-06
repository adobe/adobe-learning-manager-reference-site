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
  PrimeAccount,
  PrimeCatalog,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeUser,
} from "../models/PrimeModels";
import { CatalogFilterState } from "../store/reducers/catalog";
import { ACTIVE, ENGLISH_LOCALE } from "./constants";
import {
  getALMAttribute,
  getALMConfig,
  getItemFromStorage,
  getQueryParamsFromUrl,
  setItemToStorage,
} from "./global";
import { checkIfCompletionDeadlineNotPassed } from "./instance";
import { JsonApiParse } from "./jsonAPIAdapter";
import { RestAdapter } from "./restAdapter";

const PRIME_CATALOG_FILTER = "PRIME_CATALOG_FILTER";

export function isJobaid(training: PrimeLearningObject): boolean {
  return training.loType.toLowerCase() === "jobaid" ? true : false;
}

export function isJobaidContentTypeUrl(training: PrimeLearningObject): boolean {
  const trainingInstance = training.instances[0];
  const contentType = trainingInstance.loResources?.[0]?.resources?.[0]?.contentType;
  return contentType === "OTHER" ? true : false;
}

export function getJobaidUrl(training: PrimeLearningObject): string {
  return training.instances[0]?.loResources?.[0]?.resources?.[0]?.location;
}

export function getActiveInstances(training: PrimeLearningObject): PrimeLearningObjectInstance[] {
  // Instances which are active and have not passed the completion deadline
  return training.instances?.filter(
    instance =>
      (instance.state === ACTIVE && checkIfCompletionDeadlineNotPassed(instance)) ||
      instance.enrollment
  );
}

export function getDefaultIntsance(training: PrimeLearningObject): PrimeLearningObjectInstance[] {
  return training.instances?.filter(i => i && i.isDefault);
}

export function debounce(fn: Function, time = 250) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), time);
  };
}

export const getOrUpdateCatalogFilters = async (): Promise<PrimeCatalog[] | undefined> => {
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

const getCatalogParamsForAPI = async (catalogState: string): Promise<Array<string>> => {
  const catalogFilterFromStorage = await getOrUpdateCatalogFilters();
  const catalogFilterFromState = splitStringIntoArray(catalogState);
  let returnValue = "";
  catalogFilterFromStorage?.forEach(item => {
    if (catalogFilterFromState.indexOf(item.name) > -1) {
      returnValue += returnValue ? "," + item.id : item.id;
    }
  });

  return splitStringIntoArray(returnValue);
};

export const isAttributeEnabled = (attribute: string) => {
  return attribute === "true";
};

export async function getParamsForCatalogApi(
  filterState: CatalogFilterState,
  account: PrimeAccount
) {
  const params: any = {};
  const catalogAttributes = getALMAttribute("catalogAttributes");
  const { prlCriteria } = account;
  const queryParams = getQueryParamsFromUrl();
  const {
    products,
    roles,
    levels,
    loTypes,
    skillName,
    tagName,
    learnerState,
    loFormat,
    duration,
    skillLevel,
    catalogs,
    price,
    priceRange,
    cities,
    announcedGroups,
  } = filterState;
  if (isAttributeEnabled(queryParams.myLearning)) {
    params["filter.learnerState"] = ["enrolled", "completed", "started"];
  }

  if (isAttributeEnabled(catalogAttributes?.showFilters)) {
    if (isAttributeEnabled(catalogAttributes?.loTypes)) {
      params["filter.loTypes"] = splitStringIntoArray(loTypes);
    }

    if (skillName && hasKeys(skillName) && isAttributeEnabled(catalogAttributes?.skillName)) {
      params["filter.skillName"] = splitStringIntoArray(getTruePropertiesAsString(skillName) || "");
    }
    if (tagName && hasKeys(tagName) && isAttributeEnabled(catalogAttributes?.tagName)) {
      params["filter.tagName"] = splitStringIntoArray(getTruePropertiesAsString(tagName) || "");
    }
    if (learnerState && isAttributeEnabled(catalogAttributes?.learnerState)) {
      params["filter.learnerState"] = splitStringIntoArray(learnerState);
    }
    if (loFormat && isAttributeEnabled(catalogAttributes?.loFormat)) {
      params["filter.loFormat"] = splitStringIntoArray(loFormat);
    }
    if (duration && isAttributeEnabled(catalogAttributes?.duration)) {
      params["filter.duration.range"] = splitStringIntoArray(duration);
    }
    if (skillLevel && isAttributeEnabled(catalogAttributes?.skillLevel)) {
      params["filter.skill.level"] = splitStringIntoArray(skillLevel);
    }
    if (catalogs && isAttributeEnabled(catalogAttributes?.catalogs)) {
      params["filter.catalogIds"] = splitStringIntoArray(catalogs);
    }
    if (price && isAttributeEnabled(catalogAttributes?.price)) {
      // Don't send anything if free and paid both are applied.
      if (splitStringIntoArray(price).length === 1) {
        params["filter.price"] = price;
      }
    }
    if (priceRange && isAttributeEnabled(catalogAttributes?.priceRange)) {
      params["filter.priceRange"] = splitStringIntoArray(priceRange);
    }
    if (cities && isAttributeEnabled(catalogAttributes?.cities)) {
      params["filter.cityName"] = splitStringIntoArray(cities);
    }

    if (prlCriteria?.enabled) {
      const { products: prlCriteriaProducts, roles: prlCriteriaRoles } = prlCriteria;
      if (
        prlCriteriaProducts?.enabled &&
        products &&
        isAttributeEnabled(catalogAttributes?.products)
      ) {
        params["filter.recommendationProducts"] = getPRLFilters(
          products,
          prlCriteriaProducts.levelsEnabled,
          levels
        );
      }
      if (prlCriteriaRoles?.enabled && roles && isAttributeEnabled(catalogAttributes?.roles)) {
        params["filter.recommendationRoles"] = getPRLFilters(
          roles,
          prlCriteriaRoles.levelsEnabled,
          levels
        );
      }
    }

    if (announcedGroups && isAttributeEnabled(catalogAttributes?.announcedGroups)) {
      params["filter.announcedGroups"] = splitStringIntoArray(announcedGroups);
    }
  }
  params["filter.ignoreEnhancedLP"] = false;
  return params;
}

interface DurationFilter {
  lte: number;
  gte: number;
}

export function getFiltersObjectForESApi(filterState: CatalogFilterState) {
  const { duration, loFormat, loTypes, skillLevel, skillName, tagName, cities, catalogs } =
    filterState;
  const filters: any = {
    terms: {
      loSkillLevels: skillLevel ? splitStringIntoArray(filterState.skillLevel) : null,
      loType: loTypes ? splitStringIntoArray(filterState.loTypes) : null,
      deliveryType: loFormat ? splitStringIntoArray(filterState.loFormat) : null,
      loSkillNames: skillName ? splitStringIntoArray(getTruePropertiesAsString(skillName)) : null,
      tags: tagName ? splitStringIntoArray(getTruePropertiesAsString(tagName)) : null,
      catalogNames: catalogs ? splitStringIntoArray(catalogs) : null,
      cities: cities ? splitStringIntoArray(cities) : null,
    },
    range: {},
  };
  //range object
  if (duration) {
    const durations = splitStringIntoArray(duration);
    const durationFilter: DurationFilter[] = [];
    durations.forEach(item => {
      const [minValue, maxValue] = splitStringIntoArray(item, "-");
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
    lang: [getALMConfig().locale || ENGLISH_LOCALE],
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
  //  add if condition for skill and tags
  const loTypes = splitStringIntoArray(filterState[type as keyof CatalogFilterState] as string);
  let value: any[] = [];
  loTypes.forEach(element => {
    if (optionsMap[element]) {
      value.push(optionsMap[element]);
    }
  });

  return value;
}

export function sortList(list: Array<any>, paramName: string) {
  return [...list].sort((a, b) => a[paramName]?.trim().localeCompare(b[paramName]?.trim()));
}

export function splitStringIntoArray(input: string, delimiter = ","): Array<string> {
  return input.split(delimiter);
}

export async function fetchRecommendationData(recommendationCriteria: string, url: string) {
  return await RestAdapter.get({
    url: `${url}?filter.recommendationCriteria=${recommendationCriteria}&filter.showAllRecommendationCriteria=true`,
  });
}

export function getFilterNames(promise: any) {
  return promise ? JsonApiParse(promise)?.data?.names : null;
}

export function getPRLFilters(filterValues: string, isLevelsEnabled: boolean, levels: string) {
  const levelsArray = isLevelsEnabled && levels ? splitStringIntoArray(levels) : [];

  return splitStringIntoArray(filterValues).map(item => ({ name: item, levels: levelsArray }));
}

export const getTruePropertiesAsString = (obj: { [key: string]: boolean }) => {
  return Object.entries(obj)
    .filter(([key, value]) => value)
    .map(([key]) => key)
    .join(",");
};

export const filterObjectByTruthyValues = (obj: { [key: string]: boolean }) => {
  return Object.entries(obj)
    .filter(([key, value]) => value)
    .reduce((acc: any, [key]) => {
      acc[key] = true;
      return acc;
    }, {});
};

export const convertStringToObject = (str: string, value = true) => {
  return str.split(",").reduce((obj: any, key) => {
    obj[key] = true;
    return obj;
  }, {});
};

export const hasKeys = (obj: {}) => {
  return Object.keys(obj).length > 0;
};
export function getLocalesForSearch(user: PrimeUser): Array<string> {
  const localesForSearch: Set<string> = new Set([ENGLISH_LOCALE]);
  const locales = [user.contentLocale, user.uiLocale, user.account?.locale];

  locales.forEach(locale => {
    locale && localesForSearch.add(locale);
  });

  return Array.from(localesForSearch);
}
