import { PrimeLearningObject } from "..";
import { CatalogFilterState } from "../store/reducers/catalog";
import { getParamsForCatalogApi } from "../utils/catalog";
import { getALMKeyValue } from "../utils/global";
import { JsonApiParse } from "../utils/jsonAPIAdapter";
import { QueryParams, RestAdapter } from "../utils/restAdapter";
import ICustomHooks from "./ICustomHooks";

const DEFUALT_LO_INCLUDE =
  "instances.loResources.resources,instances.badge,supplementaryResources,enrollment.loResourceGrades,skills.skillLevel.skill";
const DEFAULT_SEARCH_SNIPPETTYPE =
  "courseName,courseOverview,courseDescription,moduleName,certificationName,certificationOverview,certificationDescription,jobAidName,jobAidDescription,lpName,lpDescription,lpOverview,embedLpName,embedLpDesc,embedLpOverview,skillName,skillDescription,note,badgeName,courseTag,moduleTag,jobAidTag,lpTag,certificationTag,embedLpTag,discussion";
const DEFAULT_SEARCH_INCLUDE =
  "model.instances.loResources.resources,model.instances.badge,model.supplementaryResources,model.enrollment.loResourceGrades,model.skills.skillLevel.skill";
export default class LoggedInCustomHooks implements ICustomHooks {
  baseApiUrl = getALMKeyValue("config")?.baseApiUrl;
  async getTrainings(
    filterState: CatalogFilterState,
    sort: string,
    searchText: string
  ) {
    const catalogAttributes = getALMKeyValue("catalogAttributes");
    const params: QueryParams = getParamsForCatalogApi(filterState);
    params["sort"] = sort;
    params["page[limit]"] = 10;
    params["include"] = DEFUALT_LO_INCLUDE;

    let url = `${this.baseApiUrl}/learningObjects`;
    if (searchText && catalogAttributes?.showSearch === "true") {
      url = `${this.baseApiUrl}/search`;
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
