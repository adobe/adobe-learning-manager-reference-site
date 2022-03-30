import { CatalogFilterState } from "../store/reducers/catalog";
import { getRequestObjectForESApi } from "../utils/catalog";
import { getALMConfig } from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export default class NonLoggedInCustomHooks implements ICustomHooks {
  primeCdnTrainingBaseEndpoint = getALMConfig().primeCdnTrainingBaseEndpoint;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string = ""
  ) {
    const requestObject = getRequestObjectForESApi(
      filterState,
      sort,
      searchText
    );
    console.log(requestObject, filterState);
    const response = await RestAdapter.post({
      url: `https://primeapps-stage.adobe.com/almsearch/api/v1/qe/7110/a75477eb-2a4c-4f6e-b897-a6506da18e3f/search`,
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json;charset=UTF-8",
      },
      body: JSON.stringify(requestObject),
    });
    return response;
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
