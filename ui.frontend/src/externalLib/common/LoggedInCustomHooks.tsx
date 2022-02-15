import { PrimeLearningObject } from "..";
import { CatalogFilterState } from "../store/reducers/catalog";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export default class LoggedInCustomHooks implements ICustomHooks {
  baseApiUrl = (window as any).primeConfig.baseApiUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
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
      "instances.loResources.resources,instances.badge,supplementaryResources,enrollment.loResourceGrades,skills.skillLevel.skill";
    let url = `${this.baseApiUrl}/learningObjects`;
    if (searchText) {
      url = `${this.baseApiUrl}/search`;
      params["query"] = searchText;
      params["snippetType"] =
        "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion";
      params["include"] =
        "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";
    }
    const response = await RestAdapter.get({
      url,
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
  async getTraining(
    id: string,
    params: QueryParams
  ): Promise<PrimeLearningObject> {
    const response = await RestAdapter.get({
      url: `${this.baseApiUrl}learningObjects/${id}`,
      params: params,
    });
    return JsonApiParse(response).learningObject;
  }
}
