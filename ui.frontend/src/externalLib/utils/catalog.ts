import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
} from "../models/PrimeModels";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getALMAttribute, getWindowObject } from "./global";
import { QueryParams } from "./restAdapter";

export function isJobaid(training: PrimeLearningObject): boolean {
  return training.loType.toLowerCase() === "jobaid" ? true : false;
}

export function isJobaidContentTypeUrl(training: PrimeLearningObject): boolean {
  const trainingInstance = training.instances[0];
  const contentType =
    trainingInstance.loResources[0]?.resources[0]?.contentType;
  return contentType === "OTHER" ? true : false;
}

export function getJobaidUrl(training: PrimeLearningObject): string {
  //TO-DO : Check with Yogesh on this logic
  return training.instances[0]?.loResources[0]?.resources[0]?.location;
}

export function getActiveInstances(
  training: PrimeLearningObject
): PrimeLearningObjectInstance[] {
  return training.instances?.filter((i) => i && i.state === "Active");
}

export function getDefaultIntsance(
  training: PrimeLearningObject
): PrimeLearningObjectInstance[] {
  return training.instances?.filter((i) => i && i.isDefault);
}

export function locationUpdate(params: any) {
  const location = getWindowObject().location;
  const existingQueryParams = new URLSearchParams(decodeURI(location.search));
  for (let key in params) {
    if (params[key]) {
      existingQueryParams.set(key, params[key]);
    } else {
      existingQueryParams.delete(key);
    }
  }
  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    encodeURI(existingQueryParams.toString()) +
    window.location.hash;
  window.history.replaceState({ path: newurl }, "", newurl);
}

export function getQueryParamsIObjectFromUrl() {
  const location = getWindowObject().location;
  const params: URLSearchParams = new URLSearchParams(
    decodeURI(location.search)
  );
  return Object.fromEntries(params.entries());
}

export function debounce(fn: Function, time = 250) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), time);
  };
}

export function getParamsForCatalogApi(filterState: CatalogFilterState) {
  const params: QueryParams = {};
  const catalogAttributes = getALMAttribute("catalogAttributes");

  if (catalogAttributes?.showFilters === "true") {
    if (catalogAttributes?.loTypes === "true") {
      params["filter.loTypes"] = filterState.loTypes;
    }

    if (filterState.skillName && catalogAttributes?.skillName === "true") {
      params["filter.skillName"] = filterState.skillName;
    }
    if (filterState.tagName && catalogAttributes?.tagName === "true") {
      params["filter.tags"] = filterState.tagName;
    }
    if (
      filterState.learnerState &&
      catalogAttributes?.learnerState === "true"
    ) {
      params["filter.learnerState"] = filterState.learnerState;
    }
    if (filterState.loFormat && catalogAttributes?.loFormat === "true") {
      params["filter.loFormat"] = filterState.loFormat;
    }
    if (filterState.duration && catalogAttributes?.duration === "true") {
      params["filter.duration.range"] = filterState.duration;
    }
    if (filterState.skillLevel && catalogAttributes?.skillLevel === "true") {
      params["filter.skill.level"] = filterState.skillLevel;
    }
    if (filterState.catalogs && catalogAttributes?.catalogs === "true") {
      params["filter.catalogIds"] = filterState.catalogs;
    }
  }
  return params;
}
