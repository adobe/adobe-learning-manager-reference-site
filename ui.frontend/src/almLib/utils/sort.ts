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
import { PrimeAccount } from '../models';
import { getSearchOrCatalog, isMyLearningPage } from './catalog';
import {
  CPENEW,
  SORT_A_TO_Z_PARAM,
  SORT_DUE_DATE_PARAM,
  SORT_EFFECTIVENESS_PARAM,
  SORT_MOST_RECOMMENDED_PARAM,
  SORT_RATING_PARAM,
  SORT_RECENTLY_PUBLISHED_PARAM,
  SORT_RELEVANCE_PARAM,
  SORT_Z_TO_A_PARAM,
} from './constants';
import { getALMConfig, getALMObject, getQueryParamsFromUrl } from './global';

interface SortOption {
  id: string;
  name: string;
}

interface SortConfig {
  [key: string]: { options: string[]; defaultOption: string };
}

const sortConfigs: SortConfig = {
  default: {
    options: [SORT_A_TO_Z_PARAM, SORT_Z_TO_A_PARAM, SORT_RECENTLY_PUBLISHED_PARAM],
    defaultOption: SORT_RECENTLY_PUBLISHED_PARAM,
  },
  myLearning: {
    options: [SORT_A_TO_Z_PARAM, SORT_Z_TO_A_PARAM, SORT_DUE_DATE_PARAM],
    defaultOption: SORT_DUE_DATE_PARAM,
  },
  catalog: {
    options: [
      SORT_A_TO_Z_PARAM,
      SORT_Z_TO_A_PARAM,
      SORT_RECENTLY_PUBLISHED_PARAM,
      SORT_MOST_RECOMMENDED_PARAM,
      SORT_EFFECTIVENESS_PARAM,
      SORT_RATING_PARAM,
    ],
    defaultOption: SORT_RECENTLY_PUBLISHED_PARAM,
  },
  search: {
    options: [
      SORT_A_TO_Z_PARAM,
      SORT_Z_TO_A_PARAM,
      SORT_RECENTLY_PUBLISHED_PARAM,
      SORT_EFFECTIVENESS_PARAM,
      SORT_RATING_PARAM,
      SORT_RELEVANCE_PARAM,
    ],
    defaultOption: SORT_RELEVANCE_PARAM,
  },
};

const guestSortConfigs: SortConfig = {
  catalog: {
    options: [SORT_A_TO_Z_PARAM, SORT_Z_TO_A_PARAM, SORT_RECENTLY_PUBLISHED_PARAM],
    defaultOption: SORT_RECENTLY_PUBLISHED_PARAM,
  },
  search: {
    options: [
      SORT_A_TO_Z_PARAM,
      SORT_Z_TO_A_PARAM,
      SORT_RECENTLY_PUBLISHED_PARAM,
      SORT_RELEVANCE_PARAM,
    ],
    defaultOption: SORT_RELEVANCE_PARAM,
  },
};

//To check - make it work without passing the getTranslation function
export const allSortOptions = (GetTranslation: Function) => {
  return [
    {
      id: SORT_MOST_RECOMMENDED_PARAM,
      name: GetTranslation('alm.picker.sort.mostRecommended'),
    },
    {
      id: SORT_RECENTLY_PUBLISHED_PARAM,
      name: GetTranslation('alm.picker.sort.recentlyPublished'),
    },
    { id: SORT_A_TO_Z_PARAM, name: GetTranslation('alm.picker.sort.nameAZ') },
    { id: SORT_Z_TO_A_PARAM, name: GetTranslation('alm.picker.sort.nameZA') },
    {
      id: SORT_DUE_DATE_PARAM,
      name: GetTranslation('alm.picker.sort.dueDate'),
    },
    {
      id: SORT_EFFECTIVENESS_PARAM,
      name: GetTranslation('alm.picker.sort.effectiveness', true),
    },
    { id: SORT_RATING_PARAM, name: GetTranslation('alm.picker.sort.rating') },
    {
      id: SORT_RELEVANCE_PARAM,
      name: GetTranslation('alm.picker.sort.relevance'),
    },
  ];
};

export const getAvailableSortOptions = (account: PrimeAccount, GetTranslation: Function) => {
  const isPrlEnabled = account?.prlCriteria?.enabled;
  const isCPENew = account?.recommendationAccountType === CPENEW;
  const immersiveLayout = account.learnerLayout === 'IMMERSIVE';
  const isMostRecommendedDefault = isPrlEnabled || (isCPENew && immersiveLayout);
  const isMyLearning = isMyLearningPage();
  const isGuest = !getALMObject().isPrimeUserLoggedIn();

  let sortType: string[];
  let defaultOption: string;

  if (isMyLearning) {
    ({ options: sortType, defaultOption } = sortConfigs.myLearning);
  } else if (isGuest) {
    const searchOrCatalog = getSearchOrCatalog();
    ({ options: sortType, defaultOption } = guestSortConfigs[searchOrCatalog]);
  } else {
    const searchOrCatalog = getSearchOrCatalog();
    ({ options: sortType, defaultOption } = sortConfigs[searchOrCatalog]);

    if (isMostRecommendedDefault && searchOrCatalog === 'catalog') {
      defaultOption = SORT_MOST_RECOMMENDED_PARAM;
    }

    const shouldKeep = (type: string) => {
      switch (type) {
        case SORT_MOST_RECOMMENDED_PARAM:
          return isPrlEnabled || isCPENew;
        case SORT_EFFECTIVENESS_PARAM:
          return account?.showEffectiveness;
        case SORT_RATING_PARAM:
          return account?.showRating;
        default:
          return true;
      }
    };

    sortType = sortType.filter(shouldKeep);
  }
  const sortTypeFromURL = getQueryParamsFromUrl()?.sort;
  // Only honor the URL sort if it's valid for the current context (e.g. keep catalog-only '-recommendationScore' out of search)
  defaultOption =
    sortTypeFromURL && sortType.includes(sortTypeFromURL) ? sortTypeFromURL : defaultOption;

  const availableSortOptions = allSortOptions(GetTranslation).filter(option =>
    sortType.includes(option.id)
  );

  return { availableSortOptions, defaultOption };
};
