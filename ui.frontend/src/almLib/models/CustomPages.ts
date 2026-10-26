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
import { WidgetTypeNew } from '../utils/widgets/common';

export interface BaseWidgetAttributes {
  title?: string;
  description?: string;
  //common Attributes can come Here
  //widgetRef:string; //com.adobe.captivateprime.html
  isVisibleOnMobile?: boolean;
  isMobileOnlyWidget?: boolean;
}

export enum CategorySource {
  CATALOGS = 'CATALOGS',
  PRODUCTS = 'PRODUCTS',
  ROLES = 'ROLES',
}

export interface CategoryWidgetAttributes extends BaseWidgetAttributes {
  showImage?: boolean;
  showDescription?: boolean;
  source?: CategorySource;
  fetchAll?: boolean;
  sourceIds?: string[]; // If fetchAll is true, ignore this
}

export enum CoursesAndPathSource {
  CATALOGS = 'CATALOGS',
  PRODUCTS = 'PRODUCTS',
  ROLES = 'ROLES',
}

export enum CoursesAndPathSourceType {
  CUSTOM = 'CUSTOM',
  ALM_DEFINED = 'ALM_DEFINED',
}

export interface CoursesAndPathWidgetAttributes extends BaseWidgetAttributes {
  sourceType?: CoursesAndPathSourceType;
  source?: CoursesAndPathSource; //If sourceType is ALM_DEFINED, then this is mandatory
  sourceIds?: string[]; //If sourceType is ALM_DEFINED, then this is mandatory
  loIds?: string[]; //If sourceType is Manual, then this is mandatory
  //need to handle PAPI id format here.
  loTypes?: string[]; //Optional filter by learning object type; empty/undefined means no filter
}

export enum ElementAlignmentValues {
  LEFT = 'start',
  RIGHT = 'end',
  CENTER = 'center',
}

export interface CustomContentBoxWidgetAttributes extends BaseWidgetAttributes {
  pageUrl?: string;
  alignment?: ElementAlignmentValues;
  showGradient?: boolean;
  height?: string;
  bgColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

export interface HTMLWidgetAttributes extends BaseWidgetAttributes {
  html?: string;
  css?: string;
  javascript?: string;
}

export interface IframeWidgetAttributes extends BaseWidgetAttributes {
  url?: string;
  height?: string;
}
export type WidgetLayoutAttributes =
  | HTMLWidgetAttributes
  | CategoryWidgetAttributes
  | CoursesAndPathWidgetAttributes
  | CustomContentBoxWidgetAttributes
  | IframeWidgetAttributes;

export interface AssetValue {
  sourceUrl?: string;
  contentUrl: string;
}

export interface Assets {
  [widgetId: string]: {
    [key: string]: AssetValue;
  };
}

export interface WidgetMap {
  [widgetId: string]: CustomWidget;
}

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [key: string]: Record<string, Translation>;
}
export interface Row {
  id: string;
  columns: Column[];
  layoutKey?: string;
  isFullStretchRow?: boolean;
}

export interface Column {
  id: string;
  colSpan: number;
  rows?: Row[];
  widgetId?: string;
}
export interface CustomPageConfig {
  pageId: number;
  assets?: Assets;
  translations?: Translations;
  desktop?: Row[];
  mobile?: Row[];
  widgets?: WidgetMap;
}

export interface CustomWidget {
  id: string;
  widgetRef: string;
  type?: WidgetTypeNew;
  attributes: WidgetLayoutAttributes;
}

/**
 * A Courses and Paths source selection. `sourceDetails` can be one of these or a list of them
 * when several sources are selected.
 */
export interface CoursesAndPathSourceDetails {
  name?: string;
  id?: string | string[];
}

/**
 * Filter parameters for widget training queries
 */
export interface WidgetTrainingFilters {
  loIds?: string[];
  source?: string;
  sourceDetails?: CoursesAndPathSourceDetails | CoursesAndPathSourceDetails[];
  learnerState?: string[];
  sort: string;
  bookmarks?: boolean;
  subLOsLang?: boolean;
  externalCertifications?: boolean;
  enrollmentType?: string[];
  include?: string;
  loTypes?: string[];
  excludeIgnoredRecommendations?: boolean;
  enforcedFieldsLO?: string;
  recommendationConfig?: WidgetRecommendationConfigFilters;
}

export interface WidgetRecommendationFilters {
  sort?: string;
  recommendationType: string;
  strip?: number;
}

export interface WidgetRecommendationConfigFilters {
  products?: WidgetRecommendationConfigLevels[];
  roles?: WidgetRecommendationConfigLevels[];
  skills?: string[];
}

export interface WidgetRecommendationConfigLevels {
  name?: string;
  levels?: string[];
}

/**
 * Pagination parameters for widget training queries
 */
export interface PaginationParams {
  cursor?: string | null;
  offset?: string | null;
  pageLimit: number;
  page?: number;
}

/**
 * Filter parameters for category widget queries
 */
export interface CategoryWidgetFilters {
  sourceIds?: string[];
  source: string;
  fetchAll?: boolean;
}
