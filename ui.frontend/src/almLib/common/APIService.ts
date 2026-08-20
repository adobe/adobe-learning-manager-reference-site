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
import { CatalogFilterState } from '../store/reducers/catalog';
import { getALMConfig, getItemFromStorage } from '../utils/global';
import { QueryParams } from '../utils/restAdapter';
// import ALMCustomHooksInstance from "./ALMCustomHooks";
import ICustomHooks from './ICustomHooks';
import {
  PrimeLearningObject,
  PrimeUserBadge,
  WidgetTrainingFilters,
  PaginationParams,
  CategoryWidgetFilters,
  WidgetRecommendationFilters,
} from '../models';
import { CART_DATA, ERROR_ALREADY_ADDED } from '../utils/constants';
import { defaultCartValues } from '../utils/lo-utils';
import { FilterListObject } from '../utils/filters';

class APIService {
  customHooks: ICustomHooks | null;
  constructor() {
    this.customHooks = null;
  }

  public registerServiceInstance(serviceType: string, customHook: ICustomHooks) {
    if (getALMConfig().usageType === serviceType) {
      this.customHooks = customHook;
    }
  }

  public async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    autoCorrectMode: boolean
  ) {
    return this.customHooks?.getTrainings(filterState, sort, searchText, autoCorrectMode);
  }
  public async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string,
    autoCorrectMode: boolean
  ) {
    return this.customHooks?.loadMoreTrainings(filterState, sort, searchText, url, autoCorrectMode);
  }
  public async getTrainingsForAuthor(
    authorId: string,
    authorType: string,
    sort: string,
    url?: string
  ) {
    return this.customHooks?.getTrainingsForAuthor(authorId, authorType, sort, url);
  }
  public async loadMore(url: string) {
    return this.customHooks?.loadMore(url);
  }

  public async getTraining(id: string, params: QueryParams) {
    return this.customHooks?.getTraining(id, params);
  }

  public async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    return this.customHooks?.getTrainingInstanceSummary(trainingId, instanceId);
  }
  public async enrollToTraining(params: QueryParams = {}, headers: Record<string, string> = {}) {
    return this.customHooks?.enrollToTraining(params, headers);
  }
  public async unenrollFromTraining(enrollmentId: string = '') {
    return this.customHooks?.unenrollFromTraining(enrollmentId);
  }

  public async enrollToPersonalizedPath(id: string) {
    return this.customHooks?.enrollToPersonalizedPath(id);
  }

  public async deletePersonalizedPath(id: string) {
    return this.customHooks?.deletePersonalizedPath(id);
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
  public async addProductToCartNative(
    trainingId: string
  ): Promise<{ redirectionUrl: string; error: Array<string> }> {
    // checking if training is already added in cart
    const cartItems = getItemFromStorage(CART_DATA);
    if (cartItems) {
      const loId = trainingId.split(':')[1].split('_')[0];
      const trainingAlreadyAdded = cartItems.find((item: any) => {
        let trainingIdAddedInCommerceCart = item.sku.split(':')[1];
        return trainingIdAddedInCommerceCart === loId;
      });
      if (trainingAlreadyAdded) {
        return { ...defaultCartValues, error: [ERROR_ALREADY_ADDED] };
      }
    }
    if (!this.customHooks) {
      return { ...defaultCartValues };
    }
    return this.customHooks.addProductToCartNative(trainingId);
  }
  public async buyNowNative(
    trainingId: string
  ): Promise<{ redirectionUrl: string; error: Array<string> }> {
    if (!this.customHooks) {
      return { ...defaultCartValues };
    }
    return this.customHooks.buyNowNative(trainingId);
  }
  public async getUsersBadges(
    userId: string,
    params: QueryParams = {}
  ): Promise<
    | {
        badgeList: PrimeUserBadge[];
        links: { next: any };
      }
    | undefined
  > {
    return this.customHooks?.getUsersBadges(userId, params);
  }
  public async loadMoreBadges(url: string) {
    return this.customHooks?.loadMoreBadges(url);
  }
  public async getAllDiscussions(params: QueryParams, trainingId: string) {
    return this.customHooks?.getAllDiscussions(params, trainingId);
  }
  public async loadMoreDiscussion(url: string) {
    return this.customHooks?.loadMoreDiscussion(url);
  }
  public async postDiscussion(trainingId: string, body: Object) {
    return this.customHooks?.postDiscussion(trainingId, body);
  }
  public async deleteDiscussion(loId: string, discussionPostId: string) {
    return this.customHooks?.deleteDiscussion(loId, discussionPostId);
  }
  public async getCatalogsByIds(catalogIds: string[]) {
    return this.customHooks?.getCatalogsByIds(catalogIds);
  }
  public async fetchCourseInstanceMapping(
    training: PrimeLearningObject,
    trainingInstanceId: string
  ) {
    return this.customHooks?.fetchCourseInstanceMapping(training, trainingInstanceId);
  }
  public async getCoursePathWidgetTrainings(
    filters: WidgetTrainingFilters,
    pagination: PaginationParams
  ) {
    return this.customHooks?.getCoursePathWidgetTrainings(filters, pagination);
  }
  public async getCoursePathWidgetRecommendations(
    filters: WidgetRecommendationFilters,
    pagination: PaginationParams
  ) {
    return this.customHooks?.getCoursePathWidgetRecommendations(filters, pagination);
  }
  public async getCategoryWidgetData(filters: CategoryWidgetFilters, pagination: PaginationParams) {
    return this.customHooks?.getCategoryWidgetData(filters, pagination);
  }
  public async getSearchFilterList(
    query: string,
    type: string,
    selectedItemsFromStore: { [key: string]: boolean }
  ) {
    return this.customHooks?.getSearchFilterList(query, type, selectedItemsFromStore);
  }
  public async getExternalLearningSettings() {
    return this.customHooks?.getExternalLearningSettings();
  }
  public async getExternalLearnings(params: QueryParams) {
    return this.customHooks?.getExternalLearnings(params);
  }
  public async getExternalLearningsByUrl(url: string) {
    return this.customHooks?.getExternalLearningsByUrl(url);
  }
  public async getExternalLearningById(id: string) {
    return this.customHooks?.getExternalLearningById(id);
  }
  public async submitExternalLearning(payload: object) {
    return this.customHooks?.submitExternalLearning(payload);
  }
  public async updateExternalLearning(id: string, payload: object) {
    return this.customHooks?.updateExternalLearning(id, payload);
  }
  public async getUserById(userId: string) {
    return this.customHooks?.getUserById(userId);
  }
}

const APIServiceInstance = new APIService();
export default APIServiceInstance;
