import { CatalogFilterState } from "../store/reducers/catalog";
import { getALMConfig } from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
// import { JsonApiParse } from "../utils/jsonAPIAdapter";
// import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export default class NonLoggedInCustomHooks implements ICustomHooks {
  primeCdnTrainingBaseEndpoint = getALMConfig().primeCdnTrainingBaseEndpoint;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    return null;
  }
  async loadMore(url: string) {
    return null;
  }
  async getTraining(id: string) {
    const response = await RestAdapter.get({
      url: `${this.primeCdnTrainingBaseEndpoint}/course/1958508.json`,
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
