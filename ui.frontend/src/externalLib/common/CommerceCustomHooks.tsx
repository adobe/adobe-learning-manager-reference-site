import { GET_COMMERCE_TRAININGS } from "../commerce";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getALMConfig } from "../utils/global";
import {
  JsonApiParse,
  parseCommerceResponse,
} from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import { DEFAULT_PAGE_LIMIT } from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";

interface ISortMap {
  date: string;
  "-date": string;
}
const sortMap: any = {
  date: "publishDate",
  "-date": "publishDate",
};

const headers = {
  "Content-Type": "application/json",
};
export default class CommerceCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  almCommerceCdnBaseUrl = this.almConfig.almCommerceCdnBaseUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    search: string = ""
  ) {
    try {
      const response = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS,
        variables: {
          pageSize: DEFAULT_PAGE_LIMIT,
          filter: {},
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
      url: `${this.almCommerceCdnBaseUrl}/${loPath}/.json`,
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
}
