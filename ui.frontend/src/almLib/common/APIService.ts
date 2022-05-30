/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { CatalogFilterState } from "../store/reducers/catalog";
import { ADOBE_COMMERCE } from "../utils/constants";
import {
  getALMConfig,
  getALMObject,
  redirectToLoginAndAbort,
} from "../utils/global";
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
      return new ALMCustomHooks().getTrainings(filterState, sort, searchText);
    }

    if (getALMConfig().usageType === ADOBE_COMMERCE) {
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
    if (getALMConfig().usageType === ADOBE_COMMERCE) {
      return new CommerceCustomHooks().loadMoreTrainings(
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
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().loadMore(url);
    }
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
    if (redirectToLoginAndAbort()) {
      return;
    }
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().enrollToTraining(params);
    }
  }
  public async unenrollFromTraining(enrollmentId: string = "") {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().unenrollFromTraining(enrollmentId);
    }
  }

  public async getFilters(): Promise<any> {
    if (this.isUserLoggedIn()) {
      return new ALMCustomHooks().getFilters();
    }
    if (getALMConfig().usageType === ADOBE_COMMERCE) {
      return new CommerceCustomHooks().getFilters();
    }

    return new ESCustomHooks().getFilters();
  }

  public async addProductToCart(
    sku: string
  ): Promise<{ items: any; totalQuantity: Number; error: any }> {
    const defaultCartValues = { items: [], totalQuantity: 0, error: null };
    if (redirectToLoginAndAbort()) {
      return { ...defaultCartValues, error: true };
    }
    if (this.isUserLoggedIn() && getALMConfig().usageType === ADOBE_COMMERCE) {
      return new CommerceCustomHooks().addProductToCart(sku);
    }
    return defaultCartValues;
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
