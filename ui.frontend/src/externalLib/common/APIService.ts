import { CatalogFilterState } from "../store/reducers/catalog";
import { getALMConfig, getALMObject } from "../utils/global";
import { QueryParams } from "../utils/restAdapter";
import ALMCustomHooks from "./ALMCustomHooks";
import CommerceCustomHooks from "./CommerceCustomHooks";
import ESCustomHooks from "./ESCustomHooks";
class APIService {
  //customHooks: ICustomHooks;
  //services: {key: value[ICustomHooks]};
  // constructor() {
  //   // this.customHooks = this.isUserLoggedIn()
  //   //   ? new ALMCustomHooks()
  //   //   : new ESCustomHooks();
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
      //this.customHooks = new ALMCustomHooks();
      return new ALMCustomHooks().getTrainings(filterState, sort, searchText);
    }

    if (getALMConfig().usageType == "aem-commerce") {
      return new CommerceCustomHooks().getTrainings(
        filterState,
        sort,
        searchText
      );
    }

    return new ESCustomHooks().getTrainings(filterState, sort, searchText);
  }
  public async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new ALMCustomHooks();
      return new ALMCustomHooks().loadMoreTrainings(
        filterState,
        sort,
        searchText,
        url
      );
    }
    return new ESCustomHooks().loadMoreTrainings(
      filterState,
      sort,
      searchText,
      url
    );
  }
  public async loadMore(url: string) {
    if (this.isUserLoggedIn()) {
      //this.customHooks = new ALMCustomHooks();
      return new ALMCustomHooks().loadMore(url);
    }
    //this.customHooks = new ESCustomHooks();
    // return this.customHooks.getTrainings(filterState,sort);
    // return new ESCustomHooks().loadMore(url);
  }

  public async getTraining(id: string, params: QueryParams) {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().getTraining(id, params);
    } else {
      return new ESCustomHooks().getTraining(id);
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
  //     new ALMCustomHooks()

  //    }

  // }
  public async getTrainingInstanceSummary(
    trainingId: string,
    instanceId: string
  ) {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().getTrainingInstanceSummary(
        trainingId,
        instanceId
      );
    }
  }
  public async enrollToTraining(params: QueryParams = {}) {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().enrollToTraining(params);
    }
  }
  public async unenrollFromTraining(enrollmentId: string = "") {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().unenrollFromTraining(enrollmentId);
    }
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
