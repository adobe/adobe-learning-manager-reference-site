import { JsonApiResponse } from "../models";

let store : APIWidgetStore | undefined;
export function GetStore(): APIWidgetStore {
    if (!store) {
        store = new APIWidgetStore();
    }
    return store;
}

export class APIWidgetStore {
    private cache_lxpv: any = {};

    public put(obj: any): void {
        if (!this.cache_lxpv[obj["type"]]) {
            this.cache_lxpv[obj["type"]] = {};
        }
        this.cache_lxpv[obj["type"]][obj["id"]] = obj;
    }
    public get(type: string, id: string): any {
        if (!this.cache_lxpv[type]) {
            this.cache_lxpv[type] = {};
        }
        return this.cache_lxpv[type][id];
    }
}

export function JsonApiParse(jsonApiResponse: any): JsonApiResponse {
    const storeToUse: APIWidgetStore = GetStore();
    if (typeof jsonApiResponse == "string") jsonApiResponse = JSON.parse(jsonApiResponse);

    if (Array.isArray(jsonApiResponse.included)) {
        for (let j = 0; j < jsonApiResponse.included.length; ++j) {
            storeToUse.put(jsonApiResponse.included[j]);
        }
    }
    let dataType = undefined;
    let isList = false;

    let result;
    let data = jsonApiResponse["data"];
    if (Array.isArray(data)) {
        if (data.length && data[0]["type"] == "searchResult") {
            data = jsonApiResponse.included.filter((item: { type: any }) => item.type == "learningObject");
        }
        result = [];
        let oneObj;
        for (let j = 0; j < data.length; ++j) {
            oneObj = data[j];
            storeToUse.put(oneObj);
            result.push(ObjectWrapper.GetWrapper(oneObj["type"], oneObj["id"],storeToUse, oneObj));
            if (!dataType) {
                dataType = oneObj["type"];
                isList = true;
            }
        }
    } else {
        if (data["type"] == "searchResult") {
            data = jsonApiResponse.included.filter((item: { type: any }) => item.type == "learningObject");
        }
        dataType = data["type"];
        storeToUse.put(data);
        result = ObjectWrapper.GetWrapper(data["type"], data["id"],storeToUse);
    }
    const retval: any = {};
    if (dataType) {
        retval[`${dataType == "searchResult" ? "learningObject" : dataType}${isList ? "List" : ""}`] = result;
    }
    retval.links = jsonApiResponse["links"];
    retval.meta = jsonApiResponse["meta"];
    return retval;
}

// export function JsonApiRelationshipUpdate(baseObj: JsonApiDataRef, relationRefToUpdate: JsonApiDataRef, relName: string, storeType: WidgetType) {
//     const storeToUse: APIWidgetStore = GetStore(storeType);
//     const obj = storeToUse.get(baseObj.type, baseObj.id);
//     //Add relationship - For now going with simple update
//     //This might require a refactor if we need lot more functionality
//     //like array, or deletes or no rel exists etc
//     obj["relationships"][relName] = { data: relationRefToUpdate };
// }

export class ObjectWrapper {
    private id_lxpv: string;
    private type_lxpv: string;
    private dataObj_lxpv: any;
    private storeToUse_lxpv: APIWidgetStore;

    constructor(type: string, id: string, storeToUse: APIWidgetStore, dataObj: any) {
        this.id_lxpv = id;
        this.type_lxpv = type;
        this.storeToUse_lxpv = storeToUse;
        //We can think of falling back to COMMON store - might be helpful in cases like user account
        //not sideloaded in widget specific api calls, but can be accessed through fallback
        this.dataObj_lxpv = dataObj ? dataObj : storeToUse.get(type, id);
        //this.dataObj_lxpv = dataObj;
        if (this.dataObj_lxpv !== undefined && !this.dataObj_lxpv._transient) {
            this.dataObj_lxpv._transient = {};
        }
    }
    public get(attr: string) {
        if (attr == "id") return this.id_lxpv;
        if (attr == "type") return this.type_lxpv;
        if (attr == "__storedataobj") return this.dataObj_lxpv;
        if (attr == "_transient") return this.dataObj_lxpv._transient;

        if (this.dataObj_lxpv === undefined) return;

        let retval;
        if (this.dataObj_lxpv.hasOwnProperty("attributes")) {
            //check in attributes
            retval = this.dataObj_lxpv["attributes"].hasOwnProperty(attr) ? this.dataObj_lxpv["attributes"][attr] : undefined;
        }
        if (retval === undefined && this.dataObj_lxpv.hasOwnProperty("relationships")) {
            //check in relationships
            retval = this.dataObj_lxpv["relationships"][attr];
            if (retval !== undefined) {
                const relData = retval["data"];
                if (Array.isArray(relData)) {
                    retval = [];
                    let oneObj;
                    for (let ii = 0; ii < relData.length; ++ii) {
                        oneObj = relData[ii];
                        retval.push(ObjectWrapper.GetWrapper(oneObj["type"], oneObj["id"],this.storeToUse_lxpv));
                    }
                } else retval = relData ? ObjectWrapper.GetWrapper(relData["type"], relData["id"],this.storeToUse_lxpv) : undefined;
            }
        }
        return retval;
    }

    public static GetWrapper(type: string, id: string,storeToUse: APIWidgetStore,dataObj?: any): ObjectWrapper {
        let objWrapper = new ObjectWrapper(type, id, storeToUse, dataObj);
        objWrapper = new Proxy(objWrapper, {
            get: function (target: any, attr: string) {
                return target.get(attr);
            },
        });
        return objWrapper;
    }
}

// export interface IJsonApiPaginatee {
//     consumeResults(results: JsonApiResponse): void;
// }
// export class JsonApiPaginator {
//     private options_lxpv: IRestAdapterGetOptions;
//     private currentOffset_lxpv: number | null = null;
//     private currentCursor_lxpv: string | null = null;
//     private pageLimit_lxpv: number;
//     private cursorBased_lxpv: boolean | undefined = undefined;
//     private storeToUse_lxpv: WidgetType;
//     private fetchedAll_lxpv = false;
//     private callFailed_lxpv = false;
//     private callee_lxpv: IJsonApiPaginatee;

//     private runningPromise_lxpv: Promise<unknown> | null = null;
//     constructor(options: IRestAdapterGetOptions, pageLimit: number, storeToUse: WidgetType, callee: IJsonApiPaginatee) {
//         this.options_lxpv = options;
//         this.pageLimit_lxpv = pageLimit;
//         this.storeToUse_lxpv = storeToUse;
//         this.callee_lxpv = callee;
//     }

//     public fetchMore(): void {
//         if (!this.hasMoreResults() || this.isFetching()) {
//             return;
//         }
//         this.options_lxpv.params = this.options_lxpv.params || {};
//         if (this.currentCursor_lxpv) {
//             this.options_lxpv.params["page[cursor]"] = this.currentCursor_lxpv;
//         } else if (this.currentOffset_lxpv) {
//             this.options_lxpv.params["page[offset]"] = this.currentOffset_lxpv;
//         }

//         this.options_lxpv.params["page[limit]"] = this.pageLimit_lxpv;

//         const options = this.options_lxpv;
//         // //TODO:r temp
//         // this.runningPromise = SleepPromise(1000).then(function() {
//         // 	return RestAdapter.get(options);
//         // })
//         this.runningPromise_lxpv = RestAdapter.get(options);
//         const that = this;
//         this.runningPromise_lxpv
//             .then(function (response: unknown) {
//                 that.parseResonse_lxpv(response);
//             })
//             .catch(function (reason: any) {
//                 console.log("Result fetching failed", reason);
//                 that.callFailed_lxpv = true; //failure case, end further fetching
//                 const dummResponse = { data: [] };
//                 that.parseResonse_lxpv(dummResponse);
//             });
//     }

//     private parseResonse_lxpv(response: any) {
//         this.runningPromise_lxpv = null;
//         const parsedResponse = JsonApiParse(response, this.storeToUse_lxpv);
//         const links = parsedResponse.links;
//         const nextLink = links?.next;
//         if (!nextLink) {
//             this.fetchedAll_lxpv = true;
//         } else {
//             const url = new URL(nextLink);

//             if (this.cursorBased_lxpv === undefined) {
//                 this.cursorBased_lxpv = url.searchParams.get("page[cursor]") ? true : false;
//             }

//             if (this.cursorBased_lxpv) {
//                 this.currentCursor_lxpv = url.searchParams.get("page[cursor]");
//             } else {
//                 this.currentOffset_lxpv = <any>url.searchParams.get("page[offset]");
//             }
//         }
//         return this.callee_lxpv.consumeResults(parsedResponse);
//     }

//     public hasMoreResults(): boolean {
//         return !this.fetchedAll_lxpv;
//     }

//     public isFetching(): boolean {
//         return this.runningPromise_lxpv != null;
//     }

//     public hasCallFailed(): boolean {
//         return this.callFailed_lxpv;
//     }
// }
export {};