import { CatalogFilterState } from "../store/reducers/catalog";
import { getALMObject } from "../utils/global";
import { QueryParams } from "../utils/restAdapter";
import LoggedInCustomHooks from "./LoggedInCustomHooks";
import NonLoggedInCustomHooks from "./NonLoggedInCustomHooks";
class APIService {
  //customHooks: ICustomHooks;
  //services: {key: value[ICustomHooks]};
  // constructor() {
  //   // this.customHooks = this.isUserLoggedIn()
  //   //   ? new LoggedInCustomHooks()
  //   //   : new NonLoggedInCustomHooks();
  // }

  isUserLoggedIn() {
    // add logic to check is logged in user
    return getALMObject().isPrimeUserLoggedIn();
  }

  public async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new LoggedInCustomHooks();
      return new LoggedInCustomHooks().getTrainings(
        filterState,
        sort,
        searchText
      );
    }
    //this.customHooks = new NonLoggedInCustomHooks();
    // return this.customHooks.getTrainings(filterState,sort);
    return new NonLoggedInCustomHooks().getTrainings(
      filterState,
      sort,
      searchText
    );
  }
  public async loadMoreTrainings(filterState: CatalogFilterState,
    sort: string,
    searchText: string, url: string) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new LoggedInCustomHooks();
      return new LoggedInCustomHooks().loadMoreTrainings(filterState,
        sort,
        searchText, url);
    }
    return new NonLoggedInCustomHooks().loadMoreTrainings(
      filterState,
      sort,
      searchText,
      url
    );

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
    } else {
      return new NonLoggedInCustomHooks().getTraining(id);
    }
  }

  // public registerServiceInstance(serviceType: string, customHook: ICustomHooks) {
  //   this.services[serviceType] = customHook;
  // }

  // public initServiceInstance() {

  // }

  // public getApiServiceInstance() {
  //    isMagento = getAlmAttribute().isMagento();

  //    if(isMagento) {
  //     new LoggedInCustomHooks()

  //    }

  // }
  public async getTrainingInstanceSummary(
    trainingId: string,
    instanceId: string
  ) {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().getTrainingInstanceSummary(
        trainingId,
        instanceId
      );
    }
  }
  public async enrollToTraining(params: QueryParams = {}) {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().enrollToTraining(params);
    }
  }
  public async unenrollFromTraining(enrollmentId: string = "") {
    if (this.isUserLoggedIn()) {
      return new LoggedInCustomHooks().unenrollFromTraining(enrollmentId);
    }
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
