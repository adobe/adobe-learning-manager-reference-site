
import { CatalogFilterState } from "../store/reducers/catalog";
// import { JsonApiParse } from "../utils/jsonAPIAdapter";
// import { QueryParams, RestAdapter } from "../utils/restAdapter";
import  ICustomHooks from "./ICustomHooks";

export default class NonLoggedInCustomHooks implements ICustomHooks {

    async getTrainings(filterState: CatalogFilterState , sort: string) {
        // console.log("filterState : ", filterState);
        // const params: QueryParams = {};
        // params["sort"] = sort;
        // params["filter.loTypes"] = filterState.loTypes;
    
        // if (filterState.skillName) {
        //     params["filter.skillName"] = filterState.skillName;
        // }
        // if (filterState.tagName) {
        //     params["filter.tags"] = filterState.tagName;
        // }
        // if (filterState.learnerState) {
        //     params["filter.learnerState"] = filterState.learnerState;
        // }
        // if (filterState.loFormat) {
        //     params["filter.loFormat"] = filterState.loFormat;
        // }
        // if (filterState.duration) {
        //     params["filter.duration.range"] = filterState.duration;
        // }
        // const response = await RestAdapter.get({
        //     url: `https://captivateprimestage1.adobe.com/primeapi/v2/learningObjects?page[limit]=10`,
        //     params: params,
        // });
        // const itemsData = JsonApiParse(response).learningObjectList;
        // return itemsData;
        
        
        // Add logic to fetch data from Magento
        return null;
    }
}

