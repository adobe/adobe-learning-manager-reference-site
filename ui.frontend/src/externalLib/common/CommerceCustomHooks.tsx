import {
  ADD_PRODUCTS_TO_CART,
  GET_COMMERCE_FILTERS,
  GET_COMMERCE_TRAININGS,
} from "../commerce";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getIndividualFiltersForCommerce } from "../utils/catalog";
import {
  FilterState,
  getDefaultFiltersState,
  updateFilterList,
} from "../utils/filters";
import { getALMConfig, getQueryParamsIObjectFromUrl } from "../utils/global";
import { JsonApiParse, parseCommerceResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import BrowserPersistence from "../utils/storage";
import { DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";

const CART_ID = "CART_ID";
const COMMERCE_FILTERS = "COMMERCE_FILTERS";
interface CommerceTypes {
  almlotype: string;
  almdeliverytype: string;
  almduration: string;
  almcatalog: string;
  almskills: string;
  almskilllevel: string;
  almtags: string;
}

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

const commerceTypesToALMMap = {
  almlotype: "loTypes",
  almdeliverytype: "loFormat",
  almduration: "duration",
  almcatalog: "catalogs",
  almskills: "skillName",
  almskilllevel: "skillLevel",
  almtags: "tagName",
};
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
  let defaultFilters = defaultFiltersState[filterType as keyof FilterState]
    .list!;
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
  return filter;
};

const getOrUpdateFilters = async () => {
  const filterItems = BrowserPersistence.getItem(COMMERCE_FILTERS);
  if (filterItems) {
    return filterItems;
  }
  // const queryParams = getQueryParamsIObjectFromUrl();
  try {
    const response = await apolloClient.query({
      query: GET_COMMERCE_FILTERS,
    });

    const items = response.data.customAttributeMetadata.items;
    BrowserPersistence.setItem(COMMERCE_FILTERS, items);
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
    const queryParams = getQueryParamsIObjectFromUrl();

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
                  (item) => item.value != "jobAid"
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
        return defaultFiltersState;
      }
    } catch (e) {
      return {};
    }
  }

  async addProductToCart(sku: string) {
    try {
      sku = sku.replace("_", ":"); // Magento SKU has a colon; Public API training instance id is of the format course:1234_12345
      const cartId = BrowserPersistence.getItem(CART_ID);
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
      const addProductsToCart = response?.data?.addProductsToCart?.cart;
      const items = addProductsToCart.items;
      const totalQuantity = addProductsToCart.total_quantity;
      const error = addProductsToCart.user_errors;
      return {
        items,
        totalQuantity,
        error,
      };
    } catch (error) {
      console.log(error);
      return { items: [], totalQuantity: 0, error };
    }
  }
}
