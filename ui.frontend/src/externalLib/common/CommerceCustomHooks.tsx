import { GET_COMMERCE_FILTERS, GET_COMMERCE_TRAININGS } from "../commerce";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getDefaultFiltersState } from "../utils/filters";
import { getALMConfig, getQueryParamsIObjectFromUrl } from "../utils/global";
import { JsonApiParse, parseCommerceResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import { DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";

interface CommerceTypes {
  almlotype: string;
  almdeliverytype: string;
  almduration: string;
  almcatalog: string;
  almskills: string;
  almskilllevels: string;
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
const ALM_SKILLS = "almskills";
const ALM_SKILL_LEVELS = "almskilllevels";
const ALM_TAGS = "almtags";

const commerceTypesToALMMap = {
  almlotype: "loTypes",
  almdeliverytype: "loFormat",
  almduration: "duration",
  almcatalog: "catalogs",
  almskills: "skillName",
  almskilllevels: "skillLevel",
  almtags: "tagName",
};

const getTransformedFilter = (filterState: CatalogFilterState) => {
  const filter: any = {};
  if (filterState.loTypes) {
    filter["almlotype"] = {
      in: filterState.loTypes.split(","),
    };
  }
  if (filterState.loFormat) {
    filter["almdeliverytype"] = {
      match: filterState.loFormat.split(",")[0],
    };
  }
  // if (filterState.duration) {
  //   filter["almduration"] = {
  //     in: filterState.duration.split(","),
  //   };
  // }
  // TO-DO uncomment once its supported by API
  // if (filterState.catalogs) {
  //   filter["almcatalog"] = {
  //     in: filterState.catalogs.split(","),
  //   };
  // }
  // if (filterState.skillName) {
  //   filter["almskills"] = {
  //     in: filterState.skillName.split(","),
  //   };
  // }
  // if (filterState.skillLevel) {
  //   filter["almskilllevels"] = {
  //     in: filterState.skillLevel.split(","),
  //   };
  // }
  // if (filterState.tagName) {
  //   filter["almtags"] = {
  //     in: filterState.tagName.split(","),
  //   };
  // }
  return filter;
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
      const filter = getTransformedFilter(filterState);
      const response = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS,
        variables: {
          pageSize: DEFAULT_PAGE_LIMIT,
          filter: filter,
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
      const response = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS,
        variables: {
          pageSize: DEFAULT_PAGE_LIMIT,
          filter: {},
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
      const response = await apolloClient.query({
        query: GET_COMMERCE_FILTERS,
      });

      const items = response.data.customAttributeMetadata.items;
      const defaultFiltersState = getDefaultFiltersState();
      if (items) {
        items.forEach(
          (item: {
            attribute_code: string;
            attribute_options: CommerceItem[];
          }) => {
            const attributeCode = item.attribute_code;
            const type =
              commerceTypesToALMMap[attributeCode as keyof CommerceTypes];

            switch (attributeCode) {
              case ALM_LO: {
                let defaultFilters = defaultFiltersState.loTypes.list!;
                defaultFilters = defaultFilters.filter(
                  (defaultFilter) => defaultFilter.value !== "jobAid"
                );
                item.attribute_options.forEach((attributeOption) => {
                  const { value, label } = attributeOption;

                  const index = defaultFilters?.findIndex(
                    (loType) => loType.value == label
                  );
                  if (index !== -1) {
                    defaultFilters[index].value = value;
                  }
                });
                defaultFiltersState.loTypes.list = defaultFilters;
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
}
