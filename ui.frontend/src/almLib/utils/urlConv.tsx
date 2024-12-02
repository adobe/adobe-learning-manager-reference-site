import { LEARNER_DESKTOP_MANDATORY_PARAMS, SELECTED_SORT_OPTION, SORT } from "./constants";
import { containsElement, containsSubstr, getALMConfig } from "./global";
const LEARNER_SEARCH_PARAM = "searchString";
const REACT_SEARCH_PARAM = "searchText";

const LEARNER_DESKTOP_PARAMS_MAP = {
  skillLevel: {
    "1": "beginnerSelected=true",
    "2": "intermediateSelected=true",
    "3": "advancedSelected=true",
  },
  learnerState: {
    enrolled: "enrolledSelected=true",
    completed: "completedSelected=true",
    started: "notenrolledSelected=true",
    notenrolled: "notenrolled=true",
  },
  loFormat: {
    Activity: "activitySelected=true",
    Blended: "blendedSelected=true",
    "Self+Paced": "selfPacedSelected=true",
    "Virtual+Classroom": "virtualClassroomSelected=true",
    Classroom: "classroomSelected=true",
  },
  loTypes: {
    course: "courseSelected=true",
    learningProgram: "lpsSelected=true",
    jobAid: "jobAidsSelected=true",
    certification: "certificationsSelected=true",
  },
  duration: {
    "0-1800": "shortDurationSelected=true",
    "1801-7200": "mediumDurationSelected=true",
    "7201-3600000": "longDurationSelected=true",
  },
  tagName: "selectedTags",
  searchText: "searchString",
  skillName: "selectedCategories",
  cities: "selectedCities",
  catalogs: "selectedListableCatalogIds",
  products: "selectedRecommendationProducts",
  roles: "selectedRecommendationRoles",
  levels: "selectedPrlLevels",
  announcedGroups: "selectedGroups",
  sort: "selectedSortOption",
  price: {
    free: "freeSelected=true",
    paid: "paidSelected=true",
  },
  "filter.snippetTypes": "snippetType",
} as any;

const REACT_PARAMS_MAP = {
  skillLevel: {
    "1": "beginnerSelected",
    "2": "intermediateSelected",
    "3": "advancedSelected",
  },
  learnerState: {
    enrolled: "enrolledSelected",
    completed: "completedSelected",
    started: "notenrolledSelected",
    notenrolled: "notenrolled",
  },
  loFormat: {
    Activity: "activitySelected",
    Blended: "blendedSelected",
    "Self Paced": "selfPacedSelected",
    "Virtual Classroom": "virtualClassroomSelected",
    Classroom: "classroomSelected",
  },
  loTypes: {
    course: "courseSelected",
    learningProgram: "lpsSelected",
    jobAid: "jobAidsSelected",
    certification: "certificationsSelected",
  },
  duration: {
    "0-1800": "shortDurationSelected",
    "1801-7200": "mediumDurationSelected",
    "7201-3600000": "longDurationSelected",
  },
  selectedTags: "tagName",
  selectedCategories: "skillName",
  selectedCities: "cities",
  selectedListableCatalogIds: "catalogs",
  selectedRecommendationProducts: "products",
  selectedRecommendationRoles: "roles",
  selectedPrlLevels: "levels",
  selectedGroups: "announcedGroups",
  selectedSortOption: "sort",
  price: {
    free: "freeSelected",
    paid: "paidSelected",
  },
  searchString: "searchText",
  snippetType: "filter.snippetTypes",
} as any;

const LEARNER_DESKTOP_PARAMS = [
  "allGroupsSelected",
  "mode",
  "myLearning",
  "authorName",
  "isLegacyAuthor",
  "autoCorrectMode",
];

const LEARNER_DESKTOP_SORT_PARAMS_MAP = {
  dueDate: "dueDate",
  name: "alpha",
  "-name": "-alpha",
  "-recommendationScore": "-recommendationScore",
  "-date": "-date",
  "-rating": "-loRating",
  effectiveness: "effectiveness",
  relevance: "relevance",
} as any;

const REACT_DESKTOP_SORT_PARAMS_MAP = {
  dueDate: "dueDate",
  alpha: "name",
  "-alpha": "-name",
  "-recommendationScore": "-recommendationScore",
  "-date": "-date",
  "-loRating": "-rating",
  effectiveness: "effectiveness",
  relevance: "relevance",
} as any;

const REACT_DYNAMIC_FILTERS = [
  "tagName",
  "skillName",
  "cities",
  "catalogs",
  "products",
  "roles",
  "levels",
  "announcedGroups",
  "sort",
  "searchText",
  "filter.snippetTypes",
];

const LEARNER_DESKTOP_DYNAMIC_FITLERS = [
  "selectedTags",
  "selectedCategories",
  "selectedCities",
  "selectedListableCatalogIds",
  "selectedRecommendationProducts",
  "selectedRecommendationRoles",
  "selectedPrlLevels",
  "selectedGroups",
  "selectedSortOption",
  "searchString",
  "snippetType",
];
const EMPTY_STR = "";

function formatSearchString(str: string) {
  return str.replace('["', "").replace('"]', "");
}
function formatString(str: string) {
  // function to create the format of params from '["a","b","c"]' to 'a,b,c'
  return str.replace(/"/g, "").replace("[", "").replace("]", "");
}

function formatParam(str: String) {
  return str.replace(/\?/g, "").toString();
}

function getFormattedQp(key: string, value: string) {
  return `${key}=${value}&`;
}

function encodeSearchParam(params: string) {
  // Search Param can contain reserved symbols like "+"
  // which are not encoded by encodeURI
  // hence need to decode it and reencode using encodeURIComponent
  let paramsArr = params.split("&");
  for (let i = 0; i < paramsArr.length; i++) {
    let [key, value] = paramsArr[i].split("=");
    if (isSearchParam(key)) {
      paramsArr[i] = `${key}=${encodeURIComponent(decodeURIComponent(value))}`;
      return paramsArr.join("&");
    }
  }
}

function isSearchParam(param: string) {
  return param === LEARNER_SEARCH_PARAM;
}

export function convertToLearnerDesktopParams() {
  const url = new URL(window.location.href);
  const paramsList = url.search.substring(1).split("&");
  const dataMap = {} as any;
  if (paramsList.length === 0) {
    return EMPTY_STR;
  }
  for (const params of paramsList) {
    const currentParam = decodeURIComponent(decodeURIComponent(params));
    const [key, value] = currentParam.split("=");
    if (value) {
      dataMap[key] = value.split(",");
    }
  }

  let learnerDesktopQueryParams = EMPTY_STR;
  for (const key in dataMap) {
    const currentParam = formatParam(key);
    if (containsElement(REACT_DYNAMIC_FILTERS, currentParam)) {
      const paramValue = [];
      if (currentParam === SORT) {
        learnerDesktopQueryParams += getFormattedQp(
          LEARNER_DESKTOP_PARAMS_MAP[currentParam],
          LEARNER_DESKTOP_SORT_PARAMS_MAP[dataMap[key]]
        );
      } else {
        for (let value of dataMap[key]) {
          if (key === REACT_SEARCH_PARAM) {
            const searchValue = formatSearchString(url.searchParams.get(REACT_SEARCH_PARAM) || "");
            value = decodeURIComponent(searchValue);
          }
          paramValue.push('"' + value.toString() + '"');
        }
        learnerDesktopQueryParams += getFormattedQp(
          LEARNER_DESKTOP_PARAMS_MAP[currentParam],
          `[${paramValue.toString()}]`
        );
      }
    } else if (
      containsElement(LEARNER_DESKTOP_PARAMS, currentParam) &&
      !containsSubstr(learnerDesktopQueryParams, currentParam)
    ) {
      learnerDesktopQueryParams += getFormattedQp(currentParam, dataMap[key]);
    } else {
      for (const value of dataMap[key]) {
        learnerDesktopQueryParams +=
          LEARNER_DESKTOP_PARAMS_MAP[currentParam] &&
          LEARNER_DESKTOP_PARAMS_MAP[currentParam][value]
            ? `${LEARNER_DESKTOP_PARAMS_MAP[currentParam][value]}&`
            : ``;
      }
    }
  }
  let encodedParams = encodeURI(learnerDesktopQueryParams.slice(0, -1));
  if (containsSubstr(encodedParams, LEARNER_SEARCH_PARAM)) {
    return encodeSearchParam(encodedParams);
  }
  return encodedParams;
}
export function convertJsonToUri(obj: any) {
  let str = "";
  for (const key in obj) {
    str += key + "=" + obj[key] + "&";
  }
  return str;
}
export function convertToReactParams(params: any) {
  const keys = Object.keys(params);
  const dataMap = {} as any;
  for (const key of keys) {
    if (containsElement(LEARNER_DESKTOP_DYNAMIC_FITLERS, key)) {
      // Dynamic Param
      // Needs formatting
      const sortOption = params[key] || getALMConfig().defaultCatalogSort;
      dataMap[REACT_PARAMS_MAP[key]] = isSearchParam(key)
        ? formatSearchString(params[key])
        : new URLSearchParams(
            `param=${formatString(
              key === SELECTED_SORT_OPTION ? REACT_DESKTOP_SORT_PARAMS_MAP[sortOption] : params[key]
            )}`
          ).get("param");
    } else if (containsElement(REACT_DYNAMIC_FILTERS, key)) {
      //Already converted, retain the param
      //Needs formatting
      dataMap[key] =
        key === REACT_SEARCH_PARAM ? formatSearchString(params[key]) : formatString(params[key]);
    } else if (key in REACT_PARAMS_MAP) {
      // Already converted, retain the param
      dataMap[key] = params[key].toString();
    } else if (
      containsElement(LEARNER_DESKTOP_PARAMS, key) ||
      containsElement(LEARNER_DESKTOP_MANDATORY_PARAMS, key)
    ) {
      // Only in learner desktop app, retain the param
      dataMap[key] = params[key].toString();
    } else {
      //Static Param, search in Map
      const reactQueryParam = findKeysByValue(REACT_PARAMS_MAP, key)[0];
      if (reactQueryParam !== undefined) {
        const [param, value] = reactQueryParam.split(".");
        if (dataMap[param] === undefined) {
          dataMap[param] = [];
        }
        dataMap[param].push(value.toString());
      }
    }
  }
  return dataMap;
}

function findKeysByValue(obj: any, value: any): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];

      if (val === value) {
        keys.push(key);
      } else if (typeof val === "object") {
        const nestedKeys = findKeysByValue(val as any, value);
        keys.push(...nestedKeys.map(nestedKey => `${key}.${nestedKey}`));
      }
    }
  }

  return keys;
}
