import { CatalogFilterState } from "../store/reducers/catalog";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export default class LoggedInCustomHooks implements ICustomHooks {
  async getTrainings(filterState: CatalogFilterState, sort: string) {
    const baseApiUrl = (window as any).primeConfig.baseApiUrl;
    const params: QueryParams = {};
    params["sort"] = sort;
    params["filter.loTypes"] = filterState.loTypes;

    if (filterState.skillName) {
      params["filter.skillName"] = filterState.skillName;
    }
    if (filterState.tagName) {
      params["filter.tags"] = filterState.tagName;
    }
    if (filterState.learnerState) {
      params["filter.learnerState"] = filterState.learnerState;
    }
    if (filterState.loFormat) {
      params["filter.loFormat"] = filterState.loFormat;
    }
    if (filterState.duration) {
      params["filter.duration.range"] = filterState.duration;
    }
    params["page[limit]"] = 10;
    params["include"] =
      "enrollment,instances.loResources.resources,subLOs.instances.loResources,skills.skillLevel.skill";
    const response = await RestAdapter.get({
      url: `${baseApiUrl}/learningObjects?`,
      params: params,
    });
    const parsedResponse = JsonApiParse(response);
    return {
      trainings: parsedResponse.learningObjectList || [],
      next: parsedResponse.links?.next || "",
    };
  }

  async loadMore(url: string) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
  }
}
