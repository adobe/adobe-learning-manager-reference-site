import { PrimeAccount } from "../models";
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
} from "./constants";
import { getQueryParamsFromUrl } from "./global";

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

//To check - make it work without passing the getTranslation function
export const allSortOptions = (GetTranslation: Function) => {
  return [
    {
      id: SORT_MOST_RECOMMENDED_PARAM,
      name: GetTranslation("alm.picker.sort.mostRecommended"),
    },
    {
      id: SORT_RECENTLY_PUBLISHED_PARAM,
      name: GetTranslation("alm.picker.sort.recentlyPublished"),
    },
    { id: SORT_A_TO_Z_PARAM, name: GetTranslation("alm.picker.sort.nameAZ") },
    { id: SORT_Z_TO_A_PARAM, name: GetTranslation("alm.picker.sort.nameZA") },
    {
      id: SORT_DUE_DATE_PARAM,
      name: GetTranslation("alm.picker.sort.dueDate"),
    },
    {
      id: SORT_EFFECTIVENESS_PARAM,
      name: GetTranslation("alm.picker.sort.effectiveness", true),
    },
    { id: SORT_RATING_PARAM, name: GetTranslation("alm.picker.sort.rating") },
    {
      id: SORT_RELEVANCE_PARAM,
      name: GetTranslation("alm.picker.sort.relevance"),
    },
  ];
};

export const getAvailableSortOptions = (account: PrimeAccount, GetTranslation: Function) => {
  const queryParams = getQueryParamsFromUrl();
  const isPrlEnabled = account?.prlCriteria?.enabled;
  const isCPENew = account?.recommendationAccountType === CPENEW;

  let sortType: string[];
  let defaultOption: string;

  if (queryParams["myLearning"]) {
    ({ options: sortType, defaultOption } = sortConfigs.myLearning);
  } else {
    const searchOrCatalog = queryParams["searchText"] ? "search" : "catalog";
    ({ options: sortType, defaultOption } = sortConfigs[searchOrCatalog]);

    if (isPrlEnabled && searchOrCatalog === "catalog") {
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
  defaultOption = sortTypeFromURL ? sortTypeFromURL : defaultOption;

  const availableSortOptions = allSortOptions(GetTranslation).filter(option =>
    sortType.includes(option.id)
  );

  return { availableSortOptions, defaultOption };
};
