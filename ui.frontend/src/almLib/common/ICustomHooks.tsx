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
import { JsonApiResponse, PrimeLearningObject } from "../models";
import { CatalogFilterState } from "../store/reducers/catalog";
import { QueryParams } from "../utils/restAdapter";

export default interface ICustomHooks {
  getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ): Promise<{ trainings: PrimeLearningObject[]; next: any } | undefined>;
  loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ): Promise<
    | {
        learningObjectList: PrimeLearningObject[];
        links: { next: any };
      }
    | undefined
  >;
  loadMore(url: string): Promise<JsonApiResponse | undefined>;
  getTraining(id: string, params: QueryParams): Promise<PrimeLearningObject>;
  getTrainingInstanceSummary(
    trainingId: string,
    instanceId: string
  ): Promise<JsonApiResponse | null>;
  getFilters(): void;
  enrollToTraining(params: QueryParams): Promise<JsonApiResponse | undefined>;
  unenrollFromTraining(enrollmentId: string): Promise<unknown | null>;
  addProductToCart(
    sku: string
  ): Promise<{ items: any; totalQuantity: Number; error: any }>;
}
