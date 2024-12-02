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
import { AnyAction } from "redux";
import { PRLCriteria, PrimeAccount, PrimeUser } from "../models";
import {
  updateCatalogsFilter,
  updateDurationFilter,
  updateLearnerStateFilter,
  updateLoFormatFilter,
  updateLoTypesFilter,
  updatePriceRangeFilter,
  updateSkillLevelFilter,
  updateSkillNameFilter,
  updateTagsFilter,
  updateCitiesFilter,
  updateProductsFilter,
  updateRolesFilter,
  updateLevelsFilter,
  updatePriceFilter,
  updateAnnouncedGroupsFilter,
} from "../store/actions/catalog/action";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getFilterNames } from "./catalog";
import { API_REQUEST_CANCEL_TOKEN, FILTER, PRICE_RANGE } from "./constants";
import { getALMConfig, getQueryParamsFromUrl } from "./global";
import { JsonApiParse } from "./jsonAPIAdapter";
import { QueryParams, RestAdapter } from "./restAdapter";
import { GetTranslation } from "./translationService";
export const filtersDefaultState: FilterState = {
  loTypes: {
    type: "loTypes",
    label: "alm.catalog.filter.loType.label",
    list: [
      {
        value: "course",
        label: "alm.catalog.card.course.plural",
        checked: false,
      },
      {
        value: "learningProgram",
        label: "alm.catalog.card.learningProgram.plural",
        checked: false,
      },
      {
        value: "jobAid",
        label: "alm.catalog.card.jobAid.plural",
        checked: false,
      },
      {
        value: "certification",
        label: "alm.catalog.card.certification.plural",
        checked: false,
      },
    ],
  },
  learnerState: {
    type: "learnerState",
    label: "alm.catalog.filter.status.label",
    list: [
      {
        value: "enrolled",
        label: "alm.catalog.filter.yetToStart",
        checked: false,
      },
      {
        value: "started",
        label: "alm.catalog.filter.inProgress",
        checked: false,
      },
      {
        value: "completed",
        label: "alm.catalog.filter.completed",
        checked: false,
      },
      {
        value: "notenrolled",
        label: "alm.catalog.filter.notenrolled",
        checked: false,
      },
    ],
  },
  loFormat: {
    type: "loFormat",
    label: "alm.catalog.filter.format.label",
    list: [
      {
        value: "Activity",
        label: "alm.catalog.card.activity",
        checked: false,
      },
      { value: "Blended", label: "alm.catalog.card.blended", checked: false },
      {
        value: "Self Paced",
        label: "alm.catalog.card.self.paced",
        checked: false,
      },
      {
        value: "Virtual Classroom",
        label: "alm.catalog.card.virtual.classroom",
        checked: false,
      },
      {
        value: "Classroom",
        label: "alm.catalog.card.classroom",
        checked: false,
      },
    ],
  },
  //TO-DO : Add pagination for filters
  skillName: {
    type: FILTER.SKILL_NAME,
    label: "alm.catalog.filter.skills.label",
    list: [],
    isListDynamic: true,
    canSearch: true,
    searchText: "",
    isLoading: false,
  },
  products: {
    type: "products",
    label: "alm.catalog.filter.products.label",
    list: [],
    isListDynamic: true,
  },
  roles: {
    type: "roles",
    label: "alm.catalog.filter.roles.label",
    list: [],
    isListDynamic: true,
  },
  levels: {
    type: "levels",
    label: "alm.catalog.filter.levels.label",
    list: [],
    isListDynamic: true,
  },
  announcedGroups: {
    type: "announcedGroups",
    label: "alm.catalog.filter.announcedGroups.label",
    list: [],
    isListDynamic: true,
  },
  tagName: {
    type: FILTER.TAG_NAME,
    label: "alm.catalog.filter.tags.label",
    list: [],
    isListDynamic: true,
    canSearch: true,
    searchText: "",
    isLoading: false,
  },
  cities: {
    type: "cities",
    label: "alm.catalog.filter.cities.label",
    list: [],
    isListDynamic: true,
  },

  catalogs: {
    type: "catalogs",
    label: "alm.catalog.card.catalogs.label.plural",
    list: [],
    isListDynamic: true,
  },
  skillLevel: {
    type: "skillLevel",
    label: "alm.catalog.filter.skills.level.label",
    list: [
      { value: "1", label: "alm.catalog.filter.beginner", checked: false },
      {
        value: "2",
        label: "alm.catalog.filter.intermediate",
        checked: false,
      },
      { value: "3", label: "alm.catalog.filter.advanced", checked: false },
    ],
  },
  duration: {
    type: "duration",
    label: "alm.catalog.filter.duration.label",
    list: [
      {
        value: "0-1800",
        label: "alm.catalog.filter.lessThan30Minutes",
        checked: false,
      },
      {
        value: "1801-7200",
        label: "alm.catalog.filter.30minutesTo2Hours",
        checked: false,
      },
      {
        value: "7201-3600000",
        label: "alm.catalog.filter.moreThan2Hours",
        checked: false,
      },
    ],
  },
  priceRange: {
    type: "priceRange",
    label: "alm.catalog.filter.priceRange.label",
    list: [
      {
        value: 0,
        label: "",
        checked: false,
      },
      {
        value: 0,
        label: "",
        checked: false,
      },
    ],
  },
  price: {
    type: "price",
    label: "alm.catalog.filter.price.label",
    list: [
      {
        value: "free",
        label: "alm.catalog.filter.price.free",
        checked: false,
      },
      {
        value: "paid",
        label: "alm.catalog.filter.price.paid",
        checked: false,
      },
    ],
  },
};

export interface FilterListObject {
  value: string | number;
  label: string;
  checked: boolean;
}
export interface FilterType {
  type?: string;
  label?: string;
  show?: boolean;
  list?: Array<FilterListObject>;
  isListDynamic?: boolean;
  maxPrice?: number;
  canSearch?: boolean;
  searchText?: string;
  isLoading?: boolean;
}

// export interface PriceFilterType {
//   maxPrice: number;
//   minPrice: number;
//   label?: string;
//   type?: string;
// }

export interface ActionMap {
  loTypes: Function;
  skillName: (
    payload:
      | string
      | {
          [key: string]: string;
        }
  ) => AnyAction;
}
export const ACTION_MAP = {
  loTypes: updateLoTypesFilter,
  learnerState: updateLearnerStateFilter,
  skillName: updateSkillNameFilter,
  loFormat: updateLoFormatFilter,
  tagName: updateTagsFilter,
  skillLevel: updateSkillLevelFilter,
  duration: updateDurationFilter,
  catalogs: updateCatalogsFilter,
  priceRange: updatePriceRangeFilter,
  cities: updateCitiesFilter,
  products: updateProductsFilter,
  roles: updateRolesFilter,
  levels: updateLevelsFilter,
  price: updatePriceFilter,
  announcedGroups: updateAnnouncedGroupsFilter,
};

export interface UpdateFiltersEvent {
  filterType: string;
  checked?: boolean;
  label?: string;
  data?: any;
  resetLevels?: boolean;
}

export interface FilterState {
  loTypes: FilterType;
  learnerState: FilterType;
  skillName: FilterType;
  loFormat: FilterType;
  tagName: FilterType;
  cities: FilterType;
  catalogs: FilterType;
  skillLevel: FilterType;
  duration: FilterType;
  price: FilterType;
  priceRange: FilterType;
  products: FilterType;
  roles: FilterType;
  levels: FilterType;
  announcedGroups: FilterType;
}

export const updateFilterList = (list: any, filtersFromUrl: any, type: string) => {
  let filtersFromUrlTypeSplitArray = filtersFromUrl[type] ? filtersFromUrl[type].split(",") : [];

  list?.forEach((item: any) => {
    if (filtersFromUrlTypeSplitArray?.includes(item.value)) {
      item.checked = true;
    }
  });
  return list || [];
};

export const updatePriceRangeFilterList = (list: any, filtersFromUrl: any, type: string) => {
  let filtersFromUrlTypeSplitArray = filtersFromUrl[type] ? filtersFromUrl[type].split("-") : [];

  if (list.length && filtersFromUrlTypeSplitArray.length) {
    list[0].value = filtersFromUrlTypeSplitArray[0];
    list[1].value = filtersFromUrlTypeSplitArray[1];
  }
  return list || [];
};

export const getDefaultFiltersState = () => {
  const filtersFromUrl = getQueryParamsFromUrl();
  let filtersDefault = filtersDefaultState;
  filtersDefault.loTypes.list = updateFilterList(
    filtersDefault.loTypes.list,
    filtersFromUrl,
    "loTypes"
  );
  filtersDefault.learnerState.list = updateFilterList(
    filtersDefault.learnerState.list,
    filtersFromUrl,
    "learnerState"
  );
  filtersDefault.loFormat.list = updateFilterList(
    filtersDefault.loFormat.list,
    filtersFromUrl,
    "loFormat"
  );

  filtersDefault.skillLevel.list = updateFilterList(
    filtersDefault.skillLevel.list,
    filtersFromUrl,
    "skillLevel"
  );

  filtersDefault.duration.list = updateFilterList(
    filtersDefault.duration.list,
    filtersFromUrl,
    "duration"
  );

  filtersDefault.priceRange.list = updatePriceRangeFilterList(
    filtersDefault.priceRange.list,
    filtersFromUrl,
    "priceRange"
  );
  return filtersDefault;
};

export const getFilterLabel = (value: any, filter: FilterType) => {
  const item = filter?.list?.filter((item: any) => item.value === value);
  if (filter.type === PRICE_RANGE) {
    return {
      labelToShow: value,
      label: value,
    };
  }
  return item && item.length
    ? {
        labelToShow: GetTranslation(item[0]?.label, true),
        label: item[0]?.label,
      }
    : { label: "", labelToShow: "" };
};

export const canShowLevelsForProducts = (
  account: PrimeAccount,
  filterState: CatalogFilterState
): boolean => {
  const { filterPanelSetting, prlCriteria = {} as PRLCriteria } = account;
  const isPRLCriteriaEnabled = prlCriteria.enabled;
  const isAnyProductSelected = isAnyItemSelected(filterState.products);
  return (
    isPRLCriteriaEnabled &&
    filterPanelSetting.recommendationLevel &&
    prlCriteria.products?.levelsEnabled &&
    isAnyProductSelected
  );
};
export const canShowLevelsForRoles = (
  account: PrimeAccount,
  filterState: CatalogFilterState
): boolean => {
  const { filterPanelSetting, prlCriteria = {} as PRLCriteria } = account;
  const isPRLCriteriaEnabled = prlCriteria.enabled;
  const isAnyRoleSelected = isAnyItemSelected(filterState.roles);
  return (
    isPRLCriteriaEnabled &&
    filterPanelSetting.recommendationLevel &&
    prlCriteria.roles?.levelsEnabled &&
    isAnyRoleSelected
  );
};

function isAnyItemSelected(items: any) {
  return items?.list?.some((item: { checked: boolean }) => item.checked);
}

export const canResetLevelsFilter = (prlCriteria: PRLCriteria, filterState: any): boolean => {
  const { products, roles } = filterState;

  const isAnyProductSelected = isAnyItemSelected(products);
  const isAnyRoleSelected = isAnyItemSelected(roles);

  return (
    (prlCriteria.products?.levelsEnabled && !isAnyProductSelected) ||
    (prlCriteria.roles?.levelsEnabled && !isAnyRoleSelected)
  );
};

const FILTER_SEARCH_PAGE_LIMIT = 10;
export const searchFilterValue = async (query: string, type: string) => {
  const baseApiUrl = getALMConfig().primeApiURL;
  const params: QueryParams = {
    "page[limit]": FILTER_SEARCH_PAGE_LIMIT,
    autoCompleteMode: true,
    sort: "relevance",
    "filter.loTypes": type,
    matchType: "phrase",
    persistSearchHistory: true,
    highlightResults: false,
  };
  params.query = query;
  const cancelToken =
    type === FILTER.SKILL_NAME
      ? API_REQUEST_CANCEL_TOKEN.SKILL_FILTER_SEARCH
      : API_REQUEST_CANCEL_TOKEN.TAG_FILTER_SEARCH;
  let response: any = await RestAdapter.get({
    url: `${baseApiUrl}/search`,
    params: params,
    cancelToken,
  });
  const parsedResponse = JsonApiParse(response);
  return parsedResponse;
};

export const getMySkills = async () => {
  const baseApiUrl = getALMConfig().primeApiURL;
  const response: any = await RestAdapter.get({
    url: `${baseApiUrl}data?filter.enrolled.skillName=true`,
  });

  return response;
};
export const userSkillsList = async () => {
  const userSkillsResponse = await getMySkills();
  const userSkills = getFilterNames(userSkillsResponse);
  return userSkills;
};
