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
import { getALMConfig } from "../utils/global";
import { QueryParams } from "../utils/restAdapter";
// import ALMCustomHooksInstance from "./ALMCustomHooks";
import ICustomHooks from "./ICustomHooks";
import { PrimeUserBadge } from "../models";

class APIService {
  customHooks: ICustomHooks | null;
  constructor() {
    this.customHooks = null;
  }

  public registerServiceInstance(
    serviceType: string,
    customHook: ICustomHooks
  ) {
    if (getALMConfig().usageType === serviceType) {
      this.customHooks = customHook;
    }
  }

  public async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    return this.customHooks?.getTrainings(filterState, sort, searchText);
  }
  public async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ) {
    return this.customHooks?.loadMoreTrainings(
      filterState,
      sort,
      searchText,
      url
    );
  }
  public async loadMore(url: string) {
    return this.customHooks?.loadMore(url);
  }

  public async getTraining(id: string, params: QueryParams) {
    return this.customHooks?.getTraining(id, params);
  }

  public async getTrainingInstanceSummary(
    trainingId: string,
    instanceId: string
  ) {
    return this.customHooks?.getTrainingInstanceSummary(trainingId, instanceId);
  }
  public async enrollToTraining(
    params: QueryParams = {},
    headers: Record<string, string> = {}
  ) {
    return this.customHooks?.enrollToTraining(params, headers);
  }
  public async unenrollFromTraining(enrollmentId: string = "") {
    return this.customHooks?.unenrollFromTraining(enrollmentId);
  }
  public async getFilters(): Promise<any> {
    return this.customHooks?.getFilters();
  }

  public async addProductToCart(
    sku: string
  ): Promise<{ items: any; totalQuantity: Number; error: any }> {
    const defaultCartValues = { items: [], totalQuantity: 0, error: null };
    if (!this.customHooks) {
      return { ...defaultCartValues, error: true };
    }
    return this.customHooks.addProductToCart(sku);
  }
  public async getUsersBadges(userId: string, params: QueryParams = {}):Promise< {
      badgeList : PrimeUserBadge[];
      links: {next: any}
  }
  | undefined
> {
    return this.customHooks?.getUsersBadges(userId, params);
  }
  public async loadMoreBadges(url: string){
    return this.customHooks?.loadMoreBadges(url);
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
