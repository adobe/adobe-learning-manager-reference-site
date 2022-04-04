import { CatalogFilterState } from "../store/reducers/catalog";
import { getRequestObjectForESApi } from "../utils/catalog";
import { getALMConfig } from "../utils/global";
import { JsonApiParse, parseESResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";
import { DEFAULT_PAGE_LIMIT } from "./LoggedInCustomHooks";

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
export default class NonLoggedInCustomHooks implements ICustomHooks {
  almConfig = getALMConfig();
  primeCdnTrainingBaseEndpoint = this.almConfig.primeCdnTrainingBaseEndpoint;
  esBaseUrl = this.almConfig.esBaseUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = ""
  ) {
    const requestObject = getRequestObjectForESApi(
      filterState,
      sortMap[sort as keyof ISortMap],
      searchText
    );
    let response: any = await RestAdapter.post({
      url: `${this.esBaseUrl}/search?&size=${DEFAULT_PAGE_LIMIT}`,
      method: "POST",
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);
    return {
      trainings: results || [],
      next: response.next || "",
    };
  }

  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = "",
    url: string
  ) {
    const requestObject = getRequestObjectForESApi(
      filterState,
      sortMap[sort as keyof ISortMap],
      searchText
    );
    let response: any = await RestAdapter.post({
      url,
      method: "POST",
      headers,
      body: JSON.stringify(requestObject),
    });
    response = JSON.parse(response);
    const results = parseESResponse(response.results);

    return {
      learningObjectList: results || [],
      links: {
        next: response.next || "",
      },
    };
  }
  async loadMore(url: string) {
    return null;
  }
  async getTraining(id: string) {
    const response = await RestAdapter.get({
      url: `${this.primeCdnTrainingBaseEndpoint}/course/1964741.json`,
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
