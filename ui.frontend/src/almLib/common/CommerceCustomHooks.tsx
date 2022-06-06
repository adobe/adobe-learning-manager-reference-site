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
  ADD_PRODUCTS_TO_CART,
  GET_COMMERCE_FILTERS,
  GET_COMMERCE_TRAININGS,
} from "../commerce";
import { GET_MAX_PRICE } from "../commerce/commerce.gql";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getIndividualFiltersForCommerce } from "../utils/catalog";
import {
  FilterState,
  getDefaultFiltersState,
  updateFilterList,
} from "../utils/filters";
import {
  getALMConfig,
  getItemFromStorage,
  getQueryParamsFromUrl,
  setItemToStorage,
} from "../utils/global";
import { JsonApiParse, parseCommerceResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import { DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";

const CART_ID = "CART_ID";
const COMMERCE_FILTERS = "COMMERCE_FILTERS";

interface CommerceItem {
  value: string;
  label: string;
}

const ALM_LO = "almlotype";
const ALM_DELIVERY = "almdeliverytype";
const ALM_DURATION = "almduration";
const ALM_CATALOG = "almcatalog";
const ALM_SKILLS = "almskill";
const ALM_SKILL_LEVELS = "almskilllevel";
const ALM_TAGS = "almtags";
const ALM_PRICE = "price";

export const ALMToCommerceTypes = {
  loTypes: "almlotype",
  loFormat: "almdeliverytype",
  duration: "almduration",
  catalogs: "almcatalog",
  skillName: "almskill",
  skillLevel: "almskilllevel",
  tagName: "almtags",
};
interface FilterItem {
  attribute_code: string;
  attribute_options: CommerceItem[];
}

const transformFilters = (
  defaultFiltersState: FilterState,
  item: FilterItem,
  filterType: string
) => {
  let defaultFilters =
    defaultFiltersState[filterType as keyof FilterState].list!;
  item.attribute_options.forEach((attributeOption) => {
    const { label } = attributeOption;
    const index = defaultFilters?.findIndex((type) => type.value === label);
    if (index !== -1) {
      defaultFilters[index].value = label;
    }
  });
  defaultFiltersState[filterType as keyof FilterState].list = defaultFilters;
};

const getTransformedFilter = async (filterState: CatalogFilterState) => {
  let filters = await getOrUpdateFilters();
  const filterMap = new Map();
  filters.forEach(
    (filter: { attribute_code: string | number; attribute_options: any }) => {
      if (!filterMap.has(filter.attribute_code)) {
        filterMap.set(filter.attribute_code, filter.attribute_options);
      }
    }
  );
  const filter: any = {};

  if (filterState.catalogs) {
    const catalogOptions = filterMap.get(ALMToCommerceTypes["catalogs"]) || [];
    filter[ALM_CATALOG] = {
      in: getIndividualFiltersForCommerce(
        catalogOptions,
        filterState,
        "catalogs"
      ),
    };
  }

  if (filterState.loTypes) {
    const loTypesOptions = filterMap.get(ALMToCommerceTypes["loTypes"]) || [];
    filter[ALM_LO] = {
      in: getIndividualFiltersForCommerce(
        loTypesOptions,
        filterState,
        "loTypes"
      ),
    };
  }
  if (filterState.loFormat) {
    const loFormatOptions = filterMap.get(ALMToCommerceTypes["loFormat"]) || [];
    filter[ALM_DELIVERY] = {
      in: getIndividualFiltersForCommerce(
        loFormatOptions,
        filterState,
        "loFormat"
      ),
    };
  }
  if (filterState.duration) {
    const durationOptions = filterMap.get(ALMToCommerceTypes["duration"]) || [];
    filter[ALM_DURATION] = {
      in: getIndividualFiltersForCommerce(
        durationOptions,
        filterState,
        "duration"
      ),
    };
  }

  if (filterState.skillName) {
    const options = filterMap.get(ALMToCommerceTypes["skillName"]) || [];
    filter[ALM_SKILLS] = {
      in: getIndividualFiltersForCommerce(options, filterState, "skillName"),
    };
  }
  if (filterState.skillLevel) {
    const skillLevelOptions =
      filterMap.get(ALMToCommerceTypes["skillLevel"]) || [];
    filter[ALM_SKILL_LEVELS] = {
      in: getIndividualFiltersForCommerce(
        skillLevelOptions,
        filterState,
        "skillLevel"
      ),
    };
  }

  // TO-DO uncomment once its supported by API

  if (filterState.tagName) {
    const tagNameOptions = filterMap.get(ALMToCommerceTypes["tagName"]) || [];
    filter[ALM_TAGS] = {
      in: getIndividualFiltersForCommerce(
        tagNameOptions,
        filterState,
        "tagName"
      ),
    };
  }

  if (filterState.price) {
    const pricesArray = filterState.price.split("-");
    filter[ALM_PRICE] = {
      from: pricesArray[0],
      to: pricesArray[1],
    };
  }
  return filter;
};

const getOrUpdateFilters = async () => {
  const filterItems = getItemFromStorage(COMMERCE_FILTERS);
  if (filterItems) {
    return filterItems;
  }
  // const queryParams = getQueryParamsFromUrl();
  try {
    const response = await apolloClient.query({
      query: GET_COMMERCE_FILTERS,
    });

    const items = response.data.customAttributeMetadata.items;
    setItemToStorage(COMMERCE_FILTERS, items);
    return items;
  } catch (e) {
    console.error(e);
  }
};

export default class CommerceCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCdnBaseUrl = this.almConfig.almCdnBaseUrl;

  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    search: string = ""
  ) {
    try {
      const filter = await getTransformedFilter(filterState);
      const response = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS,
        variables: {
          pageSize: DEFAULT_PAGE_LIMIT,
          filter,
          search,
        },
      });
      const filtersFromStorage = await getOrUpdateFilters();
      const products = response?.data?.products;
      const results = parseCommerceResponse(
        products?.items,
        filtersFromStorage
      );
      const page_info = products?.page_info;
      return {
        trainings: results || [],
        next:
          page_info?.current_page < page_info?.total_pages
            ? page_info?.current_page
            : "",
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    search: string = "",
    currentPage: string
  ) {
    try {
      const filter = await getTransformedFilter(filterState);

      const response = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS,
        variables: {
          pageSize: DEFAULT_PAGE_LIMIT,
          filter,
          currentPage: parseInt(currentPage) + 1,
          search,
        },
      });
      const filtersFromStorage = await getOrUpdateFilters();

      const products = response?.data?.products;
      const results = parseCommerceResponse(
        products?.items,
        filtersFromStorage
      );
      const page_info = products?.page_info;
      return {
        learningObjectList: results || [],
        links: {
          next:
            page_info?.current_page < page_info?.total_pages
              ? page_info?.current_page
              : "",
        },
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  async loadMore(url: string) {
    return null;
  }
  async getTraining(id: string) {
    const loPath = id.replace(":", "/");
    const response = await RestAdapter.get({
      url: `${this.almCdnBaseUrl}/${loPath}/.json`,
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

    try {
      const items = await getOrUpdateFilters();
      let defaultFiltersState = getDefaultFiltersState();
      if (items) {
        items.forEach(
          (item: {
            attribute_code: string;
            attribute_options: CommerceItem[];
          }) => {
            const attributeCode = item.attribute_code;

            switch (attributeCode) {
              case ALM_LO: {
                let defaultFilters = defaultFiltersState["loTypes"].list;
                defaultFiltersState["loTypes"].list = defaultFilters?.filter(
                  (item) => item.value !== "jobAid"
                );
                transformFilters(defaultFiltersState, item, "loTypes");
                break;
              }

              case ALM_DELIVERY: {
                transformFilters(defaultFiltersState, item, "loFormat");
                break;
              }

              case ALM_DURATION: {
                transformFilters(defaultFiltersState, item, "duration");
                break;
              }

              case ALM_SKILL_LEVELS: {
                transformFilters(defaultFiltersState, item, "skillLevel");
                break;
              }

              case ALM_SKILLS: {
                let skillsList = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                skillsList = updateFilterList(
                  skillsList,
                  queryParams,
                  "skillName"
                );
                defaultFiltersState.skillName.list = skillsList;
                break;
              }

              case ALM_TAGS: {
                let tagsList = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                tagsList = updateFilterList(tagsList, queryParams, "tagName");
                defaultFiltersState.tagName.list = tagsList;
                break;
              }
              case ALM_CATALOG: {
                let catalogList = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                catalogList = updateFilterList(
                  catalogList,
                  queryParams,
                  "catalogs"
                );
                defaultFiltersState.catalogs.list = catalogList;
                break;
              }
            }
          }
        );
        const response = await apolloClient.query({
          query: GET_MAX_PRICE,
        });
        let maxPrice =
          response.data?.products?.items[0]?.price_range?.maximum_price
            ?.regular_price?.value || 0;
        if (defaultFiltersState.price.list) {
          defaultFiltersState.price.maxPrice = Math.ceil(maxPrice);
        }
        return defaultFiltersState;
      }
    } catch (e) {
      return {};
    }
  }

  async addProductToCart(sku: string) {
    try {
      sku = sku.replace("_", ":"); // Magento SKU has a colon; Public API training instance id is of the format course:1234_12345
      const cartId = getItemFromStorage(CART_ID);
      if (!cartId) {
        //TO-DO redirect to sign in or fetch cart id
      }
      const response = await apolloClient.mutate({
        mutation: ADD_PRODUCTS_TO_CART,
        variables: {
          sku: sku,
          cartId: cartId,
        },
      });
      const addProductsToCart = response?.data?.addProductsToCart;
      const error = addProductsToCart?.user_errors;
      const items = addProductsToCart?.cart?.items;
      const totalQuantity = addProductsToCart?.cart?.total_quantity;
      return {
        items,
        totalQuantity,
        error,
      };
    } catch (error: any) {
      return {
        items: [],
        totalQuantity: 0,
        error: [error?.message],
      };
    }
  }
}
