import {
  ADD_PRODUCTS_TO_CART,
  GET_COMMERCE_FILTERS,
  GET_COMMERCE_TRAININGS,
} from "../commerce";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getIndividiualtFiltersForCommerce } from "../utils/catalog";
import { getDefaultFiltersState, updateFilterList } from "../utils/filters";
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
  if (filterState.loTypes) {
    const loTypesOptions = filterMap.get(ALMToCommerceTypes["loTypes"]) || [];
    filter[ALM_LO] = {
      in: getIndividiualtFiltersForCommerce(
        loTypesOptions,
        filterState,
        "loTypes"
      ),
    };
  }
  // if (filterState.loFormat) {
  //   const loFormatOptions = filterMap.get(ALMToCommerceTypes["loFormat"]) || [];
  //   filter[ALM_DELIVERY] = {
  //     in: getIndividiualtFiltersForCommerce(
  //       loFormatOptions,
  //       filterState,
  //       "loFormat"
  //     ),
  //   };
  // }
  if (filterState.duration) {
    const durationOptions = filterMap.get(ALMToCommerceTypes["duration"]) || [];
    filter[ALM_DURATION] = {
      in: getIndividiualtFiltersForCommerce(
        durationOptions,
        filterState,
        "duration"
      ),
    };
  }

  if (filterState.skillName) {
    const options = filterMap.get(ALMToCommerceTypes["skillName"]) || [];
    filter[ALM_SKILLS] = {
      in: getIndividiualtFiltersForCommerce(options, filterState, "skillName"),
    };
  }
  if (filterState.skillLevel) {
    const skillLevelOptions =
      filterMap.get(ALMToCommerceTypes["skillLevel"]) || [];
    debugger;
    filter[ALM_SKILL_LEVELS] = {
      in: getIndividiualtFiltersForCommerce(
        skillLevelOptions,
        filterState,
        "skillLevel"
      ),
    };
  }

  // TO-DO uncomment once its supported by API
  if (filterState.catalogs) {
    const catalogOptions = filterMap.get(ALMToCommerceTypes["catalogs"]) || [];
    filter[ALM_CATALOG] = {
      in: getIndividiualtFiltersForCommerce(
        catalogOptions,
        filterState,
        "catalogs"
      ),
    };
  }

  if (filterState.tagName) {
    const tagNameOptions = filterMap.get(ALMToCommerceTypes["tagName"]) || [];
    filter[ALM_TAGS] = {
      in: getIndividiualtFiltersForCommerce(
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
  } catch (e) {}
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
      const products = response?.data?.products;
      const results = parseCommerceResponse(products?.items);
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
      const products = response?.data?.products;
      const results = parseCommerceResponse(products?.items);
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
      const defaultFiltersState = getDefaultFiltersState();
      if (items) {
        items.forEach(
          (item: {
            attribute_code: string;
            attribute_options: CommerceItem[];
          }) => {
            const attributeCode = item.attribute_code;
            switch (attributeCode) {
              case ALM_LO: {
                let defaultFilters = defaultFiltersState.loTypes.list!;
                defaultFilters = defaultFilters.filter(
                  (defaultFilter) => defaultFilter.value !== "jobAid"
                );
                item.attribute_options.forEach((attributeOption) => {
                  const { label } = attributeOption;

                  const index = defaultFilters?.findIndex(
                    (type) => type.value === label
                  );
                  if (index !== -1) {
                    defaultFilters[index].value = label;
                  }
                });
                defaultFiltersState.loTypes.list = defaultFilters;
                break;
              }

              case ALM_DELIVERY: {
                let defaultFilters = defaultFiltersState.loFormat.list!;
                item.attribute_options.forEach((attributeOption) => {
                  const { label } = attributeOption;

                  const index = defaultFilters?.findIndex(
                    (type) => type.value === label
                  );
                  if (index !== -1) {
                    defaultFilters[index].value = label;
                  }
                });
                defaultFiltersState.loFormat.list = defaultFilters;
                break;
              }

              case ALM_DURATION: {
                let defaultFilters = defaultFiltersState.duration.list!;
                item.attribute_options.forEach((attributeOption) => {
                  const { label } = attributeOption;

                  const index = defaultFilters?.findIndex(
                    (type) => type.value === label
                  );
                  if (index !== -1) {
                    defaultFilters[index].value = label;
                  }
                });
                defaultFiltersState.duration.list = defaultFilters;
                break;
              }

              case ALM_SKILL_LEVELS: {
                let defaultFilters = defaultFiltersState.skillLevel.list!;
                item.attribute_options.forEach((attributeOption) => {
                  const { label } = attributeOption;

                  const index = defaultFilters?.findIndex(
                    (type) => type.value === label
                  );
                  if (index !== -1) {
                    defaultFilters[index].value = label;
                  }
                });
                defaultFiltersState.skillLevel.list = defaultFilters;
                break;
              }

              case ALM_SKILLS: {
                let list = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                list = updateFilterList(list, queryParams, "skillName");
                defaultFiltersState.skillName.list = list;
                debugger;
                break;
              }

              case ALM_TAGS: {
                let list = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                list = updateFilterList(list, queryParams, "tagName");
                defaultFiltersState.tagName.list = list;
                break;
              }
              case ALM_CATALOG: {
                let list = item.attribute_options?.map((item) => ({
                  value: item.label,
                  label: item.label,
                  checked: false,
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                list = updateFilterList(list, queryParams, "catalogs");
                defaultFiltersState.catalogs.list = list;
                break;
              }

              // almlotype: "loTypes",
              // almdeliverytype: "loFormat",
              // almduration: "duration",
              // almcatalog: "catalogs",
              // almskills: "skillName",
              // almskilllevels: "skillLevel",
              // almtags: "tagName",
            }
          }
        );
        return defaultFiltersState;
        //   const { terms } = items;
        //   //generating the skill name list
        //   let skillsList = terms?.loSkillNames?.map((item: string) => ({
        //     value: item,
        //     label: item,
        //     checked: false,
        //   }));
        //   skillsList = updateFilterList(skillsList, queryParams, "skillName");

        //   //generating the Taglist
        //   let tagsList = terms?.tags?.map((item: string) => ({
        //     value: item,
        //     label: item,
        //     checked: false,
        //   }));
        //   tagsList = updateFilterList(tagsList, queryParams, "tagName");
        //   let catalogList: any[] = [];

        //   return {
        //     ...defaultFiltersState,
        //     skillName: {
        //       ...defaultFiltersState.skillName,
        //       list: skillsList,
        //     },
        //     tagName: {
        //       ...defaultFiltersState.tagName,
        //       list: tagsList,
        //     },
        //     catalogs: {
        //       ...defaultFiltersState.catalogs,
        //       list: catalogList,
        //     },
        //   };
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
      const addProductsToCart = response?.data?.addProductsToCart!;
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
