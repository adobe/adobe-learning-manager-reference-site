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
  PrimeUserGroup,
  PRLCriteria,
} from '../models/PrimeModels';
import { CatalogFilterState, CatalogState, DEFUALT_FILTERS_VALUE } from '../store/reducers/catalog';
import {
  ACTIVE,
  ALTERNATE_COMPLETION_LO_MODES,
  CATALOG,
  COMPLETED_LOWERCASE,
  COMPLETED_VIA_ALTERNATE,
  DEFAULT_SEARCH_SNIPPETTYPE,
  ENGLISH_LOCALE,
  LIST_VIEW,
  PROMISE_STATES,
  SEARCH,
  SORT_A_TO_Z_PARAM,
  SORT_Z_TO_A_PARAM,
  TILE_VIEW,
} from './constants';
import {
  getALMAttribute,
  getALMConfig,
  getALMObject,
  getItemFromStorage,
  getQueryParamsFromUrl,
  isAccAltCompletionEnabled,
  isBookmarksEnabled,
  isStructuredLocationEnabled,
  setItemToStorage,
} from './global';
import { formatLocationCompound, StructuredLocationRow } from './locationCompound';
import { checkIfCompletionDeadlineNotPassed } from './instance';
import { JsonApiParse } from './jsonAPIAdapter';
import { RestAdapter } from './restAdapter';
import { getBrowserLocale, getPreferredLocalizedMetadata } from './translationService';

const PRIME_CATALOG_FILTER = 'PRIME_CATALOG_FILTER';

export function isJobaid(training: PrimeLearningObject): boolean {
  return training.loType.toLowerCase() === 'jobaid' ? true : false;
}

export function splitStringIntoArray(input: string, delimiter = ','): Array<string> {
  return input.split(delimiter);
}

export function isJobaidContentTypeUrl(training: PrimeLearningObject): boolean {
  const trainingInstance = training.instances[0];
  const contentType = trainingInstance.loResources?.[0]?.resources?.[0]?.contentType;
  return contentType === 'OTHER' ? true : false;
}

export function getJobaidUrl(training: PrimeLearningObject, contentLocale: string): string {
  return getPreferredLocalizedMetadata(
    training.instances[0].loResources[0].resources,
    contentLocale
  ).location;
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
      return JsonApiParse(filterItems)?.catalogList || [];
    }
    const config = getALMConfig();
    const catalogPromise = await RestAdapter.get({
      url: `${config.primeApiURL}catalogs?page[limit]=100`,
    });
    setItemToStorage(PRIME_CATALOG_FILTER, catalogPromise);
    return JsonApiParse(catalogPromise)?.catalogList || [];
  } catch (e) {}
};

const getCatalogParamsForAPI = async (catalogState: string): Promise<Array<string>> => {
  const catalogFilterFromStorage = await getOrUpdateCatalogFilters();
  const catalogFilterFromState = splitStringIntoArray(catalogState);
  let returnValue = '';
  catalogFilterFromStorage?.forEach(item => {
    if (catalogFilterFromState.indexOf(item.name) > -1) {
      returnValue += returnValue ? ',' + item.id : item.id;
    }
  });

  return splitStringIntoArray(returnValue);
};

export const isAttributeEnabled = (attribute: string) => {
  return attribute === 'true';
};

/**
 * Determines the appropriate filter parameters for learner state and alternate completion LO mode.
 *
 * Logic:
 * 1. No completedViaAlternate selected -> filter.learnerState only + exclude = null
 * 2. Only completedViaAlternate selected -> mode = INTERSECTION + exclude = 'completed'
 * 3. completed + completedViaAlternate -> mode = UNION
 * 4. Other states + completedViaAlternate -> mode = UNION + exclude = 'completed'
 */
export const getAlternateCompletionLOParams = (
  learnerState: string
): {
  learnerStates: string[];
  alternateCompletionMode: string | null;
  alternateCompleteLoExclude: string | null;
} => {
  const allStates = splitStringIntoArray(learnerState);
  const hasCompletedViaAlternate = allStates.includes(COMPLETED_VIA_ALTERNATE);

  if (!hasCompletedViaAlternate) {
    return {
      learnerStates: allStates,
      alternateCompletionMode: null,
      alternateCompleteLoExclude: null,
    };
  }

  const otherStates = allStates.filter(state => state !== COMPLETED_VIA_ALTERNATE);
  const hasCompleted = otherStates.includes(COMPLETED_LOWERCASE);

  const getCompletionMode = () => {
    if (otherStates.length === 0) {
      return ALTERNATE_COMPLETION_LO_MODES.INTERSECTION;
    }
    return ALTERNATE_COMPLETION_LO_MODES.UNION;
  };

  const getExcludeValue = () => {
    if (hasCompleted) {
      return null;
    }
    return COMPLETED_LOWERCASE;
  };

  return {
    learnerStates: otherStates,
    alternateCompletionMode: getCompletionMode(),
    alternateCompleteLoExclude: getExcludeValue(),
  };
};
// Helper to parse Learner Desktop format: ["value1","value2"] -> "value1,value2"
const parseLearnerDesktopParam = (param: string | undefined): string => {
  if (!param) return '';
  // Remove brackets and quotes, then join with commas
  return param.replace(/^\[|\]$/g, '').replace(/"/g, '');
};

export async function getParamsForCatalogApi(
  filterState: CatalogFilterState,
  user: PrimeUser,
  sort: string
) {
  const params: any = {};
  const catalogAttributes = getALMAttribute('catalogAttributes');
  const { prlCriteria } = user.account;
  const queryParams = getQueryParamsFromUrl();

  // Check for Learner Desktop URL params and use them if filter state is empty
  const catalogsFromUrl = queryParams.selectedListableCatalogIds
    ? parseLearnerDesktopParam(queryParams.selectedListableCatalogIds)
    : '';
  const productsFromUrl = queryParams.selectedRecommendationProducts
    ? parseLearnerDesktopParam(queryParams.selectedRecommendationProducts)
    : queryParams.products || '';
  const rolesFromUrl = queryParams.selectedRecommendationRoles
    ? parseLearnerDesktopParam(queryParams.selectedRecommendationRoles)
    : queryParams.roles || '';
  const levelsFromUrl = queryParams.selectedPrlLevels
    ? parseLearnerDesktopParam(queryParams.selectedPrlLevels)
    : queryParams.levels || '';

  const {
    products: productsFromState,
    roles: rolesFromState,
    levels: levelsFromState,
    loTypes,
    skillName,
    tagName,
    learnerState,
    loFormat,
    duration,
    skillLevel,
    catalogs: catalogsFromState,
    price,
    priceRange,
    cities,
    announcedGroups,
  } = filterState;

  // Use URL params if filter state is empty
  const products = productsFromState || productsFromUrl;
  const roles = rolesFromState || rolesFromUrl;
  const levels = levelsFromState || levelsFromUrl;
  const catalogs = catalogsFromState || catalogsFromUrl;

  const bookmarksEnabled = isBookmarksEnabled();
  const isMyLearning = isMyLearningPage();
  if (isMyLearning) {
    params['filter.learnerState'] = ['enrolled', 'completed', 'started'];
  }

  if (isAttributeEnabled(catalogAttributes?.showFilters)) {
    params['filter.loTypes'] = splitStringIntoArray(
      isAttributeEnabled(catalogAttributes?.loTypes) ? loTypes : DEFUALT_FILTERS_VALUE['loTypes']
    );
    if (params['filter.loTypes'].includes('virtualCoach')) {
      params['filter.loTypes'].splice(params['filter.loTypes'].indexOf('virtualCoach'), 1);
      if (!params['filter.loTypes'].includes('jobAid')) {
        params['filter.loTypes'].push('jobAid');
        params['filter.jobAidType'] = 'AI_COACH';
      }
    }
    if (skillName && hasKeys(skillName) && isAttributeEnabled(catalogAttributes?.skillName)) {
      params['filter.skillName'] = splitStringIntoArray(getTruePropertiesAsString(skillName) || '');
    }
    if (tagName && hasKeys(tagName) && isAttributeEnabled(catalogAttributes?.tagName)) {
      params['filter.tagName'] = splitStringIntoArray(getTruePropertiesAsString(tagName) || '');
    }
    if (learnerState && isAttributeEnabled(catalogAttributes?.learnerState)) {
      const alternateCompletionParams = getAlternateCompletionLOParams(learnerState);

      if (alternateCompletionParams.learnerStates.length > 0) {
        params['filter.learnerState'] = alternateCompletionParams.learnerStates;
      }

      // Only send alternate completion filters if account has alternateCompletionEnabled
      if (isAccAltCompletionEnabled(user.account)) {
        if (alternateCompletionParams.alternateCompletionMode) {
          params['filter.alternateCompleteLo.mode'] =
            alternateCompletionParams.alternateCompletionMode;
        }

        if (alternateCompletionParams.alternateCompleteLoExclude !== null) {
          params['filter.alternateCompleteLo.exclude'] =
            alternateCompletionParams.alternateCompleteLoExclude;
        }
      }
    }
    if (loFormat && isAttributeEnabled(catalogAttributes?.loFormat)) {
      params['filter.loFormat'] = splitStringIntoArray(loFormat);
    }
    if (duration && isAttributeEnabled(catalogAttributes?.duration)) {
      params['filter.duration.range'] = splitStringIntoArray(duration);
    }
    if (skillLevel && isAttributeEnabled(catalogAttributes?.skillLevel)) {
      params['filter.skill.level'] = splitStringIntoArray(skillLevel);
    }
    // Apply catalogs filter - works with both component attribute and URL params
    if (catalogs) {
      params['filter.catalogIds'] = splitStringIntoArray(catalogs);
    }
    if (price && isAttributeEnabled(catalogAttributes?.price)) {
      // Don't send anything if free and paid both are applied.
      if (splitStringIntoArray(price).length === 1) {
        params['filter.price'] = price;
      }
    }
    if (priceRange && isAttributeEnabled(catalogAttributes?.priceRange)) {
      params['filter.priceRange'] = splitStringIntoArray(priceRange);
    }
    if (cities && isAttributeEnabled(catalogAttributes?.cities)) {
      // filter.lo.locationId is the public-API key; filter.lo.countryStateCity is BL-internal and rejected.
      if (isStructuredLocationEnabled(user.account)) {
        params['filter.lo.locationId'] = splitStringIntoArray(cities);
      } else {
        params['filter.cityName'] = splitStringIntoArray(cities);
      }
    }

    if (prlCriteria?.enabled) {
      const { products: prlCriteriaProducts, roles: prlCriteriaRoles } = prlCriteria;
      // Apply products filter if prlCriteria products is enabled AND products value exists
      // Works with both catalogAttributes.products or URL params (selectedRecommendationProducts/products)
      if (
        prlCriteriaProducts?.enabled &&
        products &&
        (isAttributeEnabled(catalogAttributes?.products) || productsFromUrl)
      ) {
        params['filter.recommendationProducts'] = getPRLFilters(
          products,
          prlCriteriaProducts.levelsEnabled,
          levels
        );
      }
      // Apply roles filter similarly
      if (
        prlCriteriaRoles?.enabled &&
        roles &&
        (isAttributeEnabled(catalogAttributes?.roles) || rolesFromUrl)
      ) {
        params['filter.recommendationRoles'] = getPRLFilters(
          roles,
          prlCriteriaRoles.levelsEnabled,
          levels
        );
      }
    }

    if (announcedGroups && isAttributeEnabled(catalogAttributes?.announcedGroups)) {
      params['filter.announcedGroups'] = splitStringIntoArray(announcedGroups);
    }
  }

  if (sort === SORT_A_TO_Z_PARAM || sort === SORT_Z_TO_A_PARAM) {
    params['sortLanguage'] = getLocalesForCatalogApi(user);
  }
  if (bookmarksEnabled) {
    params['filter.bookmarks'] = true;
  }
  params['filter.ignoreEnhancedLP'] = false;
  return params;
}

interface DurationFilter {
  lte: number;
  gte: number;
}

// Helper function to split strings but return null if empty or whitespace only
function splitStringOrNull(value: string | undefined | null): string[] | null {
  if (!value || value.trim() === '') {
    return null;
  }
  const result = splitStringIntoArray(value);
  // Filter out empty strings from the array
  const filtered = result.filter(item => item.trim() !== '');
  return filtered.length > 0 ? filtered : null;
}

function getPRLFiltersForESApi(
  products: string,
  roles: string,
  levels: string,
  prlCriteria: PRLCriteria
) {
  const prlEnabled = prlCriteria?.enabled;
  const prlProductsEnabled = prlCriteria?.products?.enabled;
  const prlRolesEnabled = prlCriteria?.roles?.enabled;
  const prlProductsLevelsEnabled = prlCriteria?.products?.levelsEnabled;
  const prlRolesLevelsEnabled = prlCriteria?.roles?.levelsEnabled;

  let prlFilters: any = {};
  if (prlEnabled && prlProductsEnabled && products) {
    prlFilters.recommendationProductNames = splitStringOrNull(products);
    if (prlProductsLevelsEnabled) {
      prlFilters.recommendationProductLevels = splitStringOrNull(levels);
    }
  }
  if (prlEnabled && prlRolesEnabled && roles) {
    prlFilters.recommendationRoleNames = splitStringOrNull(roles);
    if (prlRolesLevelsEnabled) {
      prlFilters.recommendationRoleLevels = splitStringOrNull(levels);
    }
  }
  return prlFilters;
}

export function getFiltersObjectForESApi(
  filterState: CatalogFilterState,
  prlCriteria: PRLCriteria | null = null
) {
  const {
    duration,
    loFormat,
    loTypes,
    skillLevel,
    skillName,
    tagName,
    cities,
    catalogs,
    products,
    roles,
    levels,
  } = filterState;

  const prlFilters = prlCriteria ? getPRLFiltersForESApi(products, roles, levels, prlCriteria) : {};
  const filters: any = {
    terms: {
      loSkillLevels: splitStringOrNull(skillLevel),
      loType: splitStringOrNull(loTypes),
      deliveryType: splitStringOrNull(loFormat),
      loSkillNames: skillName ? splitStringOrNull(getTruePropertiesAsString(skillName)) : null,
      tags: tagName ? splitStringOrNull(getTruePropertiesAsString(tagName)) : null,
      catalogNames: splitStringOrNull(catalogs),
      cities: splitStringOrNull(cities),
      ...prlFilters,
    },
    range: {},
  };
  //range object
  if (duration) {
    const durations = splitStringIntoArray(duration);
    const durationFilter: DurationFilter[] = [];
    durations.forEach(item => {
      const [minValue, maxValue] = splitStringIntoArray(item, '-');
      durationFilter.push({
        lte: parseInt(maxValue),
        gte: parseInt(minValue),
      });
    });
    filters.range.duration = durationFilter;
  }
  return filters;
}

const ES_SORT_FIELD_MAP: Record<string, string> = {
  relevance: '_score',
  date: 'publishDate',
  name: 'name',
};

const ES_DESCENDING_FIELDS = new Set(['_score']);

export function getRequestObjectForESApi(
  filterState: CatalogFilterState,
  sort: string,
  searchText: string = '',
  prlCriteria: PRLCriteria | null = null
) {
  const locale = getALMConfig().locale || ENGLISH_LOCALE;

  const isDescending = sort.startsWith('-');
  const baseSortKey = isDescending ? sort.slice(1) : sort;

  let sortName = ES_SORT_FIELD_MAP[baseSortKey] ?? baseSortKey;

  // Handle locale-specific name sorting for public ES
  if (sortName === 'name') {
    const localePrefix = locale.split('-')[0];
    sortName = `name_${localePrefix}`;
  }

  const sortOrder = isDescending || ES_DESCENDING_FIELDS.has(sortName) ? 'desc' : 'asc';

  const requestObject = {
    query: searchText,
    sort: {
      name: sortName,
      order: sortOrder,
    },
    lang: [locale],
    filters: getFiltersObjectForESApi(filterState, prlCriteria),
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
  // skillName/tagName are boolean maps, not comma-strings — flatten to a string before splitting.
  const rawValue = filterState[type as keyof CatalogFilterState];
  const selectedValues =
    typeof rawValue === 'string'
      ? rawValue
      : getTruePropertiesAsString((rawValue as { [key: string]: boolean }) || {}) || '';
  const loTypes = splitStringIntoArray(selectedValues);
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

export function getPRLFilters(filterValues: string, isLevelsEnabled: boolean, levels: string) {
  const levelsArray = isLevelsEnabled && levels ? splitStringIntoArray(levels) : [];

  return splitStringIntoArray(filterValues).map(item => ({ name: item, levels: levelsArray }));
}

export const getTruePropertiesAsString = (obj: { [key: string]: boolean }) => {
  return Object.entries(obj)
    .filter(([key, value]) => value)
    .map(([key]) => key)
    .join(',');
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
  return str.split(',').reduce((obj: any, key) => {
    obj[key] = true;
    return obj;
  }, {});
};

export const hasKeys = (obj: {}) => {
  return Object.keys(obj).length > 0;
};
export function getLocalesForCatalogApi(user: PrimeUser): Array<string> {
  //NOTE:Order of Languages Content lang -> Interface lang -> Browser lang -> Account lang -> EN (default)
  const { contentLocale, uiLocale, account } = user;
  const locales = [contentLocale, uiLocale, getBrowserLocale(), account?.locale, ENGLISH_LOCALE];
  const localesForSearch = new Set(locales.filter(Boolean));

  return Array.from(localesForSearch);
}
export function getLocalesForSearch(user: PrimeUser): Array<string> {
  const localesForSearch: Set<string> = new Set([ENGLISH_LOCALE]);
  const locales = [user.contentLocale, user.uiLocale, user.account?.locale];

  locales.forEach(locale => {
    locale && localesForSearch.add(locale);
  });

  return Array.from(localesForSearch);
}

export const getSnippetTypes = (catalogState: CatalogState, account: PrimeAccount): string => {
  if (catalogState?.snippetType) {
    return catalogState.snippetType;
  }

  const prlCriteria = account?.prlCriteria;
  let snippetType = DEFAULT_SEARCH_SNIPPETTYPE;
  if (!prlCriteria?.enabled) {
    return snippetType;
  }
  const { products, roles } = prlCriteria;
  if (products?.enabled) {
    snippetType = `${snippetType},recProductName`;
  }
  if (roles?.enabled) {
    snippetType = `${snippetType},recRoleName`;
  }

  return snippetType;
};

export const fetchRecommendationData = async (recommendationCriteria: string, url: string) => {
  return await RestAdapter.get({
    url: `${url}?filter.recommendationCriteria=${recommendationCriteria}&filter.showAllRecommendationCriteria=true`,
  });
};

export const getFilterNames = (promise: any) => {
  return promise ? JsonApiParse(promise)?.data?.names : null;
};
type StructuredLocationFilterPayload = {
  data?: { attributes?: { filters?: Array<{ id?: string; value?: unknown }> } };
};

// Raw-parsed (not JsonApiParse): this endpoint's JSON:API type isn't "data", so the flattening proxy doesn't apply.
export const getStructuredLocationList = (
  raw: string | StructuredLocationFilterPayload | null | undefined
): Array<{ id: string; name: string }> | null => {
  if (!raw) return null;

  let payload: StructuredLocationFilterPayload;
  try {
    payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }

  const row = payload?.data?.attributes?.filters?.find(r => r?.id === 'locationId');
  if (!row || !Array.isArray(row.value)) return null;

  return (row.value as StructuredLocationRow[])
    .filter(item => typeof item?.id === 'string' && item.id.trim() !== '')
    .map(item => ({ id: item.id as string, name: formatLocationCompound(item) }));
};
export const getCatalogList = (catalogs: any) => {
  if (!catalogs) {
    return null;
  }
  return catalogs.map((item: any) => ({ id: item.id, name: item.name })) || null;
};
export const getAnnouncedGroupsList = (
  announcedGroupsPromise: any
): { id: string; name: string }[] | null => {
  if (!announcedGroupsPromise) {
    return null;
  }

  const parsedData = JsonApiParse(announcedGroupsPromise);
  return (
    parsedData?.userGroupList?.map((group: PrimeUserGroup) => ({
      id: group.id,
      name: group.name,
    })) || null
  );
};
export const getSettledValue = (result: any) => {
  return result.status === PROMISE_STATES.FULFILLED ? result.value : null;
};

export const fetchFilterData = (condition: any, url: string) =>
  condition ? RestAdapter.get({ url }) : null;

export const getInitialView = (viewType: string) => {
  if (viewType === 'GRID') {
    return TILE_VIEW;
  }
  return LIST_VIEW;
};

export const isMyLearningPage = () => {
  const queryParams = getQueryParamsFromUrl();
  const almObject = getALMObject();
  if (typeof almObject.isMyLearningPage === 'function') {
    return almObject.isMyLearningPage();
  }
  const isMyLearning = queryParams.myLearning === 'true';
  return isMyLearning;
};

export const getSearchOrCatalog = (): string => {
  const queryParams = getQueryParamsFromUrl();
  const almObject = getALMObject();
  if (typeof almObject.getSearchOrCatalog === 'function') {
    return almObject.getSearchOrCatalog();
  }
  return queryParams['searchText'] ? SEARCH : CATALOG;
};
