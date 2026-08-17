/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import APIServiceInstance from '../common/APIService';
import { QueryParams } from './restAdapter';
import { JsonApiResponse } from '../models/PrimeModels';

export const fetchExternalLearningSettings = async (): Promise<any> => {
  return APIServiceInstance.getExternalLearningSettings();
};

export const fetchExternalLearnings = async (params: QueryParams): Promise<JsonApiResponse> => {
  return APIServiceInstance.getExternalLearnings(params) as Promise<JsonApiResponse>;
};

export const fetchExternalLearningsByUrl = async (url: string): Promise<JsonApiResponse> => {
  return APIServiceInstance.getExternalLearningsByUrl(url) as Promise<JsonApiResponse>;
};

export const fetchExternalLearningById = async (id: string): Promise<JsonApiResponse> => {
  return APIServiceInstance.getExternalLearningById(id) as Promise<JsonApiResponse>;
};

export const updateExternalLearning = async (id: string, payload: object): Promise<void> => {
  await APIServiceInstance.updateExternalLearning(id, payload);
};
