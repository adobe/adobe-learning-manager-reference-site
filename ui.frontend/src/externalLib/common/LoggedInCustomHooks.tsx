import { PrimeLearningObject } from "..";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getParamsForCatalogApi } from "../utils/catalog";
import { getALMAttribute, getALMConfig } from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

export const DEFAULT_PAGE_LIMIT = 9;
const DEFUALT_LO_INCLUDE =
  "instances.loResources.resources,instances.badge,supplementaryResources,enrollment.loResourceGrades,skills.skillLevel.skill";
const DEFAULT_SEARCH_SNIPPETTYPE =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion";
const DEFAULT_SEARCH_INCLUDE =
  "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";
export default class LoggedInCustomHooks implements ICustomHooks {
  primeApiURL = getALMConfig().primeApiURL;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    const catalogAttributes = getALMAttribute("catalogAttributes");
    const params: QueryParams = getParamsForCatalogApi(filterState);
    params["sort"] = sort;
    params["page[limit]"] = DEFAULT_PAGE_LIMIT;
    params["include"] = DEFUALT_LO_INCLUDE;

    let url = `${this.primeApiURL}/learningObjects`;
    if (searchText && catalogAttributes?.showSearch === "true") {
      url = `${this.primeApiURL}/search`;
      params["query"] = searchText;
      //TO DO check the include if needed
      params["snippetType"] = DEFAULT_SEARCH_SNIPPETTYPE;
      params["include"] = DEFAULT_SEARCH_INCLUDE;
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
  async loadMoreTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string,
    url: string
  ) {
    const response = await RestAdapter.get({
      url,
    });
    return JsonApiParse(response);
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
    // const INCLUDES_FOR_COURSE =
    //   "authors,enrollment,instances.loResources.resources,skills.skillLevel.skill, instances.badge,supplementaryResources, skills.skillLevel.badge";

    // const INCLUDES_FOR_LP_CERT =
    //   "authors,enrollment,subLOs.instances,instances.badge, skills.skillLevel.badge";
    // params["include"] params.include || INCLUDES_FOR_COURSE;
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${id}`,
      params: params,
    });
    return JsonApiParse(response).learningObject;
  }

  async getTrainingInstanceSummary(trainingId: string, instanceId: string) {
    const response = await RestAdapter.get({
      url: `${this.primeApiURL}learningObjects/${trainingId}/instances/${instanceId}/summary`,
    });
    return JsonApiParse(response);
  }
  async enrollToTraining(params: QueryParams = {}) {
    const response = await RestAdapter.post({
      url: `${this.primeApiURL}enrollments`,
      method: "POST",
      params,
    });
    return JsonApiParse(response);
  }
  async unenrollFromTraining(enrollmentId = "") {
    const response = await RestAdapter.delete({
      url: `${this.primeApiURL}enrollments/${enrollmentId}`,
      method: "DELETE",
    });
    return response;
  }
}

// APIServiceInstance.registerServiceInstance(
//   SERVICEINSTANCE.PRIME,
//   new LoggedInCustomHooks()
// );
