import { CatalogFilterState } from "../store/reducers/catalog";
import ICustomHooks from "../common/ICustomHooks";
import LoggedInCustomHooks from "./LoggedInCustomHooks";
import NonLoggedInCustomHooks from "./NonLoggedInCustomHooks";
import { QueryParams } from "../utils/restAdapter";
class APIService {
  //customHooks: ICustomHooks;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    //this.customHooks = this.isUserLoggedIn() ? new LoggedInCustomHooks() : new NonLoggedInCustomHooks();
  }

  isUserLoggedIn() {
    // add logic to check is logged in user
    return true;
  }

  public async getTrainings(filterState: CatalogFilterState, sort: string, searchText: string) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new LoggedInCustomHooks();
      return new LoggedInCustomHooks().getTrainings(filterState, sort, searchText);
    }
    //this.customHooks = new NonLoggedInCustomHooks();
    // return this.customHooks.getTrainings(filterState,sort);
    return new NonLoggedInCustomHooks().getTrainings(filterState, sort, searchText);
  }

  public async loadMore(url: string) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new LoggedInCustomHooks();
      return new LoggedInCustomHooks().loadMore(url);
    }
    //this.customHooks = new NonLoggedInCustomHooks();
    // return this.customHooks.getTrainings(filterState,sort);
    // return new NonLoggedInCustomHooks().loadMore(url);
  }

  public async getTraining(id: string, params: QueryParams) {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().getTraining(id, params);
    }
  }
  public async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().getTrainingInstanceSummary(trainingId, instanceId);
    }
  }
  public async enrollToTraining(params: QueryParams = {}) {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().enrollToTraining(params);
    }
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
