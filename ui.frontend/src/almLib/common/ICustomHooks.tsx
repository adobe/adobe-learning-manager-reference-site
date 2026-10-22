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
import {
  JsonApiResponse,
  PrimeCatalog,
  PrimeLearningObject,
  PrimeUserBadge,
  WidgetTrainingFilters,
  WidgetRecommendationFilters,
  PaginationParams,
  PrimeRecommendation,
} from '../models';
import { FilterListObject } from '../utils/filters';
import { CatalogFilterState } from '../store/reducers/catalog';
import { QueryParams } from '../utils/restAdapter';

export default interface ICustomHooks {
  getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    autoCorrectMode: boolean
  ): Promise<{ trainings: PrimeLearningObject[]; next: any; meta?: object } | undefined>;
  loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string,
    autoCorrectMode: boolean
  ): Promise<
    | {
        learningObjectList: PrimeLearningObject[];
        links: { next: any };
      }
    | undefined
  >;
  getTrainingsForAuthor(
    authorId: string,
    authorType: string,
    sort: string,
    url?: string
  ): Promise<{ trainings: PrimeLearningObject[]; next: any; meta?: object } | undefined>;
  loadMore(url: string): Promise<JsonApiResponse | undefined>;
  getTraining(id: string, params: QueryParams): Promise<PrimeLearningObject>;
  getTrainingInstanceSummary(
    trainingId: string,
    instanceId: string
  ): Promise<JsonApiResponse | null>;
  getFilters(): void;
  enrollToTraining(
    params: QueryParams,
    headers: Record<string, string>
  ): Promise<JsonApiResponse | undefined>;
  unenrollFromTraining(enrollmentId: string): Promise<unknown | null>;
  enrollToPersonalizedPath(id: string): Promise<JsonApiResponse | undefined>;
  deletePersonalizedPath(id: string): Promise<unknown>;
  addProductToCart(sku: string): Promise<{ items: any; totalQuantity: Number; error: any }>;
  addProductToCartNative(
    trainingId: string
  ): Promise<{ redirectionUrl: string; error: Array<string> }>;
  buyNowNative(trainingId: string): Promise<{ redirectionUrl: string; error: Array<string> }>;
  getUsersBadges(
    userId: string,
    params: QueryParams
  ): Promise<
    | {
        badgeList: PrimeUserBadge[];
        links: { next: any };
      }
    | undefined
  >;
  loadMoreBadges(url: string): Promise<JsonApiResponse | undefined>;
  getAllDiscussions(params: QueryParams, trainingId: string): Promise<JsonApiResponse | undefined>;
  loadMoreDiscussion(url: string): Promise<JsonApiResponse | undefined>;
  postDiscussion(trainingId: string, body: Object): Promise<JsonApiResponse | undefined>;
  deleteDiscussion(loId: string, discussionPostId: string): Promise<unknown | null>;
  getCatalogsByIds(catalogIds: string[]): Promise<PrimeCatalog[] | null>;
  fetchCourseInstanceMapping(
    training: PrimeLearningObject,
    trainingInstanceId: string
  ): Promise<JsonApiResponse | undefined>;
  getCoursePathWidgetTrainings(
    filters: WidgetTrainingFilters,
    pagination: PaginationParams
  ): Promise<{ trainings: PrimeLearningObject[]; next: string; meta?: any } | null>;
  getCoursePathWidgetRecommendations(
    filters: WidgetRecommendationFilters,
    pagination: PaginationParams
  ): Promise<{ trainings: PrimeRecommendation[]; next: string; meta?: any } | null>;
  getCategoryWidgetData(
    filters: any,
    pagination: PaginationParams
  ): Promise<{ categories: any[]; next: string; meta?: any } | null>;
  getSearchFilterList(
    query: string,
    type: string,
    selectedItemsFromStore: { [key: string]: boolean }
  ): Promise<FilterListObject[]>;
  getExternalLearningSettings(): Promise<any>;
  getExternalLearnings(params: QueryParams): Promise<JsonApiResponse>;
  getExternalLearningsByUrl(url: string): Promise<JsonApiResponse>;
  getExternalLearningById(id: string): Promise<JsonApiResponse>;
  submitExternalLearning(payload: object): Promise<void>;
  updateExternalLearning(id: string, payload: object): Promise<void>;
  getUserById(userId: string): Promise<JsonApiResponse>;
}
