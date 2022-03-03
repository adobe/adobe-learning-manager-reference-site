import { CatalogFilterState } from "../store/reducers/catalog";
import { QueryParams } from "../utils/restAdapter";
// import { JsonApiParse } from "../utils/jsonAPIAdapter";
// import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export default class NonLoggedInCustomHooks implements ICustomHooks {
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
  async getTraining(id: string, params: QueryParams) {
    return null;
  }
  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    return null;
  }
  async enrollToTraining(params: QueryParams = {}) {
    return null;
  }
}
