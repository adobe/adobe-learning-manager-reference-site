import { CatalogFilterState } from "../store/reducers/catalog";
import { QueryParams } from "../utils/restAdapter";
import LoggedInCustomHooks from "./LoggedInCustomHooks";
import NonLoggedInCustomHooks from "./NonLoggedInCustomHooks";
class APIService {
  //customHooks: ICustomHooks;
  //services: {key: value[ICustomHooks]};
  constructor() {
    // this.customHooks = this.isUserLoggedIn()
    //   ? new LoggedInCustomHooks()
    //   : new NonLoggedInCustomHooks();
  }

  isUserLoggedIn() {
    // add logic to check is logged in user
    return true;
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
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
