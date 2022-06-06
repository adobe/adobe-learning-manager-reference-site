/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { ALMToCommerceTypes } from "../common/CommerceCustomHooks";
import {
  CommercePrimeLearningObject,
  ESPrimeLearningObject,
  ESPrimeLearningObjectInstance,
  JsonApiResponse,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLocalizationMetadata,
  PrimeRating,
} from "../models";
import { getALMConfig } from "./global";

let store: Store | undefined;
export function GetStore(): Store {
  if (!store) {
    store = new Store();
  }
  return store;
}

export class Store {
  private cache: any = {};

  public put(obj: any): void {
    if (!this.cache[obj["type"]]) {
      this.cache[obj["type"]] = {};
    }
    this.cache[obj["type"]][obj["id"]] = obj;
  }
  public get(type: string, id: string): any {
    if (!this.cache[type]) {
      this.cache[type] = {};
    }
    return this.cache[type][id];
  }
}

function filterResponse(data: any, type: string) {
  return data.included?.filter((item: { type: any }) => item.type === type);
}

export function JsonApiParse(jsonApiResponse: any): JsonApiResponse {
  const storeToUse: Store = GetStore();
  if (typeof jsonApiResponse === "string")
    jsonApiResponse = JSON.parse(jsonApiResponse);

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
    if (data.length && data[0]["type"] === "searchResult") {
      data = filterResponse(jsonApiResponse, "learningObject");
      if (data?.length === 0) {
        data = filterResponse(jsonApiResponse, "post");
      }
    }
    result = [];
    let oneObj;
    for (let j = 0; j < data.length; ++j) {
      oneObj = data[j];
      storeToUse.put(oneObj);
      result.push(
        ObjectWrapper.GetWrapper(
          oneObj["type"],
          oneObj["id"],
          storeToUse,
          oneObj
        )
      );
      if (!dataType) {
        dataType = oneObj["type"];
        isList = true;
      }
    }
  } else {
    if (data["type"] === "searchResult") {
      data = jsonApiResponse.included.filter(
        (item: { type: any }) => item.type === "learningObject"
      );
    }
    dataType = data["type"];
    storeToUse.put(data);
    result = ObjectWrapper.GetWrapper(data["type"], data["id"], storeToUse);
  }
  const retval: any = {};
  if (dataType) {
    retval[
      `${dataType === "searchResult" ? "learningObject" : dataType}${isList ? "List" : ""
      }`
    ] = result;
  }
  retval.links = jsonApiResponse["links"];
  retval.meta = jsonApiResponse["meta"];
  return retval;
}

// export function JsonApiRelationshipUpdate(baseObj: JsonApiDataRef, relationRefToUpdate: JsonApiDataRef, relName: string, storeType: WidgetType) {
//     const storeToUse: Store = GetStore(storeType);
//     const obj = storeToUse.get(baseObj.type, baseObj.id);
//     //Add relationship - For now going with simple update
//     //This might require a refactor if we need lot more functionality
//     //like array, or deletes or no rel exists etc
//     obj["relationships"][relName] = { data: relationRefToUpdate };
// }

export class ObjectWrapper {
  private id_lxpv: string;
  private type_lxpv: string;
  private dataObject: any;
  private ALMStore: Store;

  constructor(type: string, id: string, storeToUse: Store, dataObj: any) {
    this.id_lxpv = id;
    this.type_lxpv = type;
    this.ALMStore = storeToUse;
    //We can think of falling back to COMMON store - might be helpful in cases like user account
    //not sideloaded in widget specific api calls, but can be accessed through fallback
    this.dataObject = dataObj ? dataObj : storeToUse.get(type, id);
    //this.dataObject = dataObj;
    if (this.dataObject !== undefined && !this.dataObject._transient) {
      this.dataObject._transient = {};
    }
  }
  public get(attr: string) {
    if (attr === "id") return this.id_lxpv;
    if (attr === "type") return this.type_lxpv;
    if (attr === "__storedataobj") return this.dataObject;
    if (attr === "_transient") return this.dataObject._transient;

    if (this.dataObject === undefined) return;

    let retval;
    if (this.dataObject.hasOwnProperty("attributes")) {
      //check in attributes
      retval = this.dataObject["attributes"].hasOwnProperty(attr)
        ? this.dataObject["attributes"][attr]
        : undefined;
    }
    if (
      retval === undefined &&
      this.dataObject.hasOwnProperty("relationships")
    ) {
      //check in relationships
      retval = this.dataObject["relationships"][attr];
      if (retval !== undefined) {
        const relData = retval["data"];
        if (Array.isArray(relData)) {
          retval = [];
          let oneObj;
          for (let ii = 0; ii < relData.length; ++ii) {
            oneObj = relData[ii];
            retval.push(
              ObjectWrapper.GetWrapper(
                oneObj["type"],
                oneObj["id"],
                this.ALMStore
              )
            );
          }
        } else
          retval = relData
            ? ObjectWrapper.GetWrapper(
              relData["type"],
              relData["id"],
              this.ALMStore
            )
            : undefined;
      }
    }
    return retval;
  }

  public set(attr: string, value: any) {
    if (this.dataObject === undefined) return;
    if (this.dataObject.hasOwnProperty("attributes")) {
      //check in attributes
      if (this.dataObject["attributes"].hasOwnProperty(attr)) {
        this.dataObject["attributes"][attr] = value;
        return;
      }
    }
    if (this.dataObject.hasOwnProperty("relationships")) {
      //check in relationships
      let propToUpdate = this.dataObject["relationships"][attr];
      if (propToUpdate) {
        this.dataObject["relationships"][attr] = value;
      }
    }
  }

  public static GetWrapper(
    type: string,
    id: string,
    storeToUse: Store,
    dataObj?: any
  ): ObjectWrapper {
    let objWrapper = new ObjectWrapper(type, id, storeToUse, dataObj);
    objWrapper = new Proxy(objWrapper, {
      get: function (target: any, attr: string) {
        return target.get(attr);
      },
      set: function (target, attr, value, receiver) {
        target.set(attr, value);
        return true;
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
//     private ALMStore: WidgetType;
//     private fetchedAll_lxpv = false;
//     private callFailed_lxpv = false;
//     private callee_lxpv: IJsonApiPaginatee;

//     private runningPromise_lxpv: Promise<unknown> | null = null;
//     constructor(options: IRestAdapterGetOptions, pageLimit: number, storeToUse: WidgetType, callee: IJsonApiPaginatee) {
//         this.options_lxpv = options;
//         this.pageLimit_lxpv = pageLimit;
//         this.ALMStore = storeToUse;
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
//         const parsedResponse = JsonApiParse(response, this.ALMStore);
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

export function parseESResponse(
  response: ESPrimeLearningObject[]
): PrimeLearningObject[] {
  let loResponse: PrimeLearningObject[] = [];
  response.forEach((item) => {
    const locale = getALMConfig().locale;
    let lo: Partial<PrimeLearningObject> = {};
    let rating: PrimeRating;
    let localizedData: PrimeLocalizationMetadata;

    lo.id = item.loId;
    lo.loFormat = item.deliveryType;
    lo.loType = item.loType;
    lo.duration = item.duration;
    lo.authorNames = item.authors;
    lo.dateCreated = item.dateCreated;
    lo.datePublished = item.publishDate;
    lo.tags = item.tags;
    lo.imageUrl = item.thumbnailImageUrl;
    localizedData = {
      _transient: "",
      description: item.description,
      id: "",
      locale,
      name: item.name,
      overview: "",
      richTextOverview: "",
      type: "",
    };
    lo.localizedMetadata = [localizedData];

    rating = {
      averageRating: item.averageRating,
      ratingsCount: item.ratingsCount,
      id: "",
      _transient: "",
    };
    lo.rating = rating;
    lo.skills = [];
    lo.skillNames = item.loSkillNames;
    lo.instances = [];
    item.loInstances?.forEach((instanceItem: ESPrimeLearningObjectInstance) => {
      let localizedMetadata: PrimeLocalizationMetadata;
      localizedMetadata = {
        _transient: "",
        description: "",
        id: "",
        locale,
        name: instanceItem.name,
        overview: "",
        richTextOverview: "",
        type: "",
      };
      let instance: Partial<PrimeLearningObjectInstance> = {
        localizedMetadata: [localizedMetadata],
        state: instanceItem.status,
        completionDeadline: instanceItem.completionDeadline,
        id: instanceItem.id,
      };
      lo.instances?.push(instance as PrimeLearningObjectInstance);
    });

    loResponse.push(lo as PrimeLearningObject);
  });
  return loResponse;
}

export function parseCommerceResponse(
  response: CommercePrimeLearningObject[],
  filtersFromStorage: any = []
): PrimeLearningObject[] {
  let loResponse: PrimeLearningObject[] = [];

  const filterMap = new Map();
  filtersFromStorage.forEach(
    (filter: { attribute_code: string | number; attribute_options: any }) => {
      if (!filterMap.has(filter.attribute_code)) {
        filterMap.set(filter.attribute_code, filter.attribute_options);
      }
    }
  );

  response.forEach((item) => {
    let lo: Partial<PrimeLearningObject> = {};
    let rating: PrimeRating;
    let localizedData: PrimeLocalizationMetadata;

    lo.id = item.sku;
    lo.duration = item.almduration;
    lo.authorNames = item.almauthor;
    lo.datePublished = item.almpublishdate;
    lo.tags = item.almtags;
    lo.imageUrl = item.almthumbnailurl;
    localizedData = {
      _transient: "",
      description: item.description.html,
      id: "",
      locale: getALMConfig().locale, //need to get from locale
      name: item.name,
      overview: "",
      richTextOverview: "",
      type: "",
    };
    lo.localizedMetadata = [localizedData];

    rating = {
      averageRating: item.almavgrating,
      ratingsCount: item.almratingscount,
      id: "",
      _transient: "",
    };
    lo.rating = rating;
    lo.skills = [];
    let skillValues = item.almskill?.split(",");
    lo.skillNames = [];
    if (skillValues?.length) {
      const options = filterMap.get(ALMToCommerceTypes["skillName"]) || [];
      const optionsMap: any = {};
      options?.forEach((element: { label: any; value: any }) => {
        if (!optionsMap[element.value]) {
          optionsMap[element.value] = element.label;
        }
      });
      skillValues.forEach((skill) => {
        if (optionsMap[skill]) {
          lo.skillNames?.push(optionsMap[skill]);
        }
      });
    }
    if (item.almdeliverytype) {
      const loFormatOptions =
        filterMap.get(ALMToCommerceTypes["loFormat"]) || [];
      loFormatOptions?.forEach((element: { label: any; value: any }) => {
        if (element.value == item.almdeliverytype) {
          lo.loFormat = element.label;
        }
      });
    }
    if (item.almlotype) {
      const loTypesOptions = filterMap.get(ALMToCommerceTypes["loTypes"]) || [];
      loTypesOptions?.forEach((element: { label: any; value: any }) => {
        if (element.value == item.almlotype) {
          lo.loType = element.label;
        }
      });
    }
    // lo.price = {
    //   value: item.price_range?.maximum_price?.final_price?.value,
    //   currency: item.price_range?.maximum_price?.final_price?.currency,
    // };

    lo.price = item.price_range?.maximum_price?.final_price?.value || lo.price;

    loResponse.push(lo as PrimeLearningObject);
  });
  return loResponse;
}
export { };
