import { GET_COMMERCE_TRAININGS } from "../commerce";
import { apolloClient } from "../contextProviders";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getRequestObjectForESApi } from "../utils/catalog";
import { getALMConfig } from "../utils/global";
import { JsonApiParse, parseESResponse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
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
    searchText: string = ""
  ) {
    try {
      const response1 = await apolloClient.query({
        query: GET_COMMERCE_TRAININGS as any,
        variables: {},
      });
    } catch (error) {
      console.log(error);
    }

    //const { loading, error, data } = useQuery(GET_COMMERCE_TRAININGS as any);

    //console.log(data);
    return {};
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
