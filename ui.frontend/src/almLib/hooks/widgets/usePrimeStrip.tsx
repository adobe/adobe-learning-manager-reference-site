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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { useCallback, useState } from "react";

import {
  AOI_VIEW_TYPE_CONSOLIDATED,
  JsonApiDataRef,
  Widget,
  WidgetType,
} from "../../utils/widgets/common";
import {
  JsonApiResponse,
  PrimeAccount,
  PrimeLearningObject,
  PrimeRecommendation,
  PrimeRecommendations,
} from "../../models";
import { GetTrimmedValues } from "../../utils/widgets/utils";
import { JsonApiParse, JsonApiRelationshipUpdate } from "../../utils/jsonAPIAdapter";

import { getALMAccount, getALMConfig, getWidgetConfig } from "../../utils/global";
import { IRestAdapterAjaxOptions, QueryParams, RestAdapter } from "../../utils/restAdapter";
import { CPENEW } from "../../utils/constants";
import { enrollTraining, getTraining } from "../../utils/lo-utils";
import { GetTranslation } from "../../utils/translationService";
import {
  getItemIndexFromList,
  getMaxItemsToFetchForWidget,
  getPageLimitForWidget,
  shouldShuffleResults,
  showActionElement,
  shuffleResults,
  updateLOBookmark,
} from "../../components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper";

export interface IJsonApiPaginatee {
  consumeResults(results: JsonApiResponse): void;
}

const getApiOptions = async (query: string, widget: Widget) => {
  let params: QueryParams = {};
  let body: QueryParams = {};
  let method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET";
  params["filter.loTypes"] = ["course", "learningProgram", "certification", "jobAid"];
  params["include"] = [
    "learningObject.instances.loResources.resources",
    "learningObject.skills.skillLevel.skill",
  ];
  params["useCache"] = true;
  params["filter.ignoreEnhancedLP"] = false;
  if (widget.widgetRef === WidgetType.BOOKMARKS) {
    params["filter.bookmarks"] = true;
  }
  const loEndPoint = "/learningObjects";
  let endpoint = "/recommendations";
  let maxItemToFetch = undefined;
  let pageLimit = 10;
  params["enforcedFields[learningObject]"] = "extensionOverrides,effectivenessData";
  switch (widget.widgetRef) {
    case WidgetType.BOOKMARKS:
      params["include"] = [
        "enrollment",
        "skills.skillLevel.skill",
        "instances.enrollment",
        "instances.loResources.resources",
      ];
      // params["filter.learnerState"] = "enrolled,started";
      params["sort"] = "name";
      endpoint = loEndPoint;
      break;
    case WidgetType.MYLEARNING: {
      params["include"] = [
        "enrollment.loInstance",
        "skills.skillLevel.skill",
        "instances.enrollment",
        "instances.loResources.resources",
      ];
      params["filter.learnerState"] = ["enrolled", "started"];
      params["sort"] = "-dateEnrolled";
      endpoint = loEndPoint;
      break;
    }
    case WidgetType.ADMIN_RECO:
      params["filter.recType"] = "announcement";
      break;
    case WidgetType.TRENDING_RECO:
      params["filter.recType"] = "peer_group";
      break;
    case WidgetType.AOI_RECO:
      const view = widget.attributes?.view || AOI_VIEW_TYPE_CONSOLIDATED;
      if (view == AOI_VIEW_TYPE_CONSOLIDATED) {
        params["filter.recType"] = "skill_interest";
      } else {
        params["filter.recType"] = "multi_skill_interest";
        params["strip"] = widget.attributes?.stripNum || 1;
      }
      break;
    case WidgetType.CATALOG_BROWSER:
      const catalogIds = widget.attributes!.catalogIds;
      const sortToUse = widget.attributes?.sort || "name";
      const skillName = widget.attributes?.skillName;
      const tagName = widget.attributes?.tagName;
      const loTypes = widget.attributes?.loTypes;
      const sortPartition = widget.attributes?.preferredSortPartitionOrder;
      const learnerState = widget.attributes?.learnerState || [
        "enrolled",
        "started",
        "notenrolled",
      ];
      endpoint = "/catalogs";
      params["include"] = [
        "enrollment",
        "instances.enrollment",
        "skills.skillLevel.skill",
        "instances.loResources.resources",
      ];
      params["filter.ignoreHigherOrderLOEnrollment"] =
        getWidgetConfig()?.ignoreHigherOrderLOEnrollment || false;
      if (catalogIds) {
        params["filter.catalogIds"] = Array.isArray(catalogIds)
          ? catalogIds.toString()
          : GetTrimmedValues(catalogIds);
      }
      if (skillName) {
        params["filter.skillName"] = Array.isArray(skillName)
          ? skillName.toString()
          : GetTrimmedValues(skillName);
      }
      if (tagName) {
        params["filter.tagName"] = Array.isArray(tagName)
          ? tagName.toString()
          : GetTrimmedValues(tagName);
      }
      if (loTypes) {
        params["filter.loTypes"] = Array.isArray(loTypes)
          ? loTypes.toString()
          : GetTrimmedValues(loTypes);
      }
      if (sortToUse == "progress" && sortPartition) {
        params["preferredSortPartitionOrder"] = Array.isArray(sortPartition)
          ? sortPartition.toString()
          : GetTrimmedValues(sortPartition);
      } else {
        params["sort"] = sortToUse;
      }
      params["filter.learnerState"] = Array.isArray(learnerState)
        ? learnerState.toString()
        : GetTrimmedValues(learnerState);
      break;
    case WidgetType.SEARCH:
      params["filter.ignoreHigherOrderLOEnrollment"] = true; //for CPRIME-55584
      if (query) {
        endpoint = "/search";
        params["include"] = [
          "model.instances.loResources.resources",
          "model.enrollment",
          "model.skills.skillLevel.skill",
        ];
        params["query"] = query;
      } else {
        params["include"] = [
          "enrollment",
          "instances.loResources.resources",
          "skills.skillLevel.skill",
        ];
        params["sort"] = "-date";
        endpoint = loEndPoint;
      }
      break;
    case WidgetType.DISCOVERY_RECO:
    case WidgetType.RECOMMENDATIONS_STRIP:
      endpoint = "/learningObjects/query";
      maxItemToFetch = 15;
      pageLimit = 5;
      body = {
        ...params,
      };
      delete body["include"];
      params = {};
      const products = widget.attributes?.recommendationConfig?.products;
      const roles = widget.attributes?.recommendationConfig?.roles;
      const skills = widget.attributes?.recommendationConfig?.skills;
      if (products) {
        body["filter.recommendationProducts"] = products.map((product: PrimeRecommendations) => {
          return {
            name: product.name,
            levels: product.levels,
          };
        });
      }
      if (roles) {
        body["filter.recommendationRoles"] = roles.map((role: PrimeRecommendations) => {
          return {
            name: role.name,
            levels: role.levels,
          };
        });
      }
      if (skills) {
        body["filter.skillName"] = skills.map((skill: PrimeRecommendations) => {
          return skill.name;
        });
      }

      params["sort"] = "-recommendationScore";
      body["filter.lang.subLOs"] = false;
      body["filter.learnerState"] = ["notenrolled"];
      body["filter.externalCertifications"] = false;
      body["filter.enrollmentType"] = ["SELF_ENROLL", "AUTO_ENROLL"];
      params["include"] = "instances.loResources.resources";
      const account = await getALMAccount();
      if (account.recommendationAccountType != CPENEW || account.prlCriteria?.enabled) {
        params["enforcedFields[learningObject]"] =
          "products,roles,extensionOverrides,effectivenessData";
        body["filter.excludeIgnoredRecommendations"] = true;
      } else {
        body["filter.loTypes"] = ["course", "learningProgram", "certification"];
        params["include"] = "instances.loResources.resources,skills.skillLevel.skill";
      }
      method = "POST";
      break;

    default:
      break;
  }

  return {
    url: `${getALMConfig().primeApiURL}${endpoint}`,
    params: params,
    body: JSON.stringify(body),
    method,
    pageLimit,
    maxItemToFetch,
  };
};
export const usePrimeStrip = (widget: Widget, account: PrimeAccount) => {
  const [state, setState] = useState({
    options: {} as IRestAdapterAjaxOptions,
    currentOffset: null as string | null,
    currentCursor: null as string | null,
    pageLimit: getPageLimitForWidget(widget) as number,
    cursorBased: undefined as boolean | undefined,
    fetchedAll: false,
    callFailed: false,
    callee: {} as IJsonApiPaginatee,
    maxItemToFetch: getMaxItemsToFetchForWidget(widget) as number | undefined,
    totalFetched: 0,
    fetchingData: false,
    items: [] as PrimeLearningObject[] | PrimeRecommendation[],
    maxStripCount: 5,
    skillName: "",
    firstFetchDone: false,
    isPrimeLearningObjectList: false,
  });
  const {
    options,
    currentOffset,
    currentCursor,
    pageLimit,
    cursorBased,
    fetchedAll,
    maxItemToFetch,
    totalFetched,
    fetchingData,
    maxStripCount,
    firstFetchDone,
    items,
    isPrimeLearningObjectList,
  } = state;

  const fetchMore = async () => {
    if (!hasMoreResults() || fetchingData) {
      return;
    }
    let apiOptions = await getApiOptions("", widget);
    let tempOptions = { ...options, ...apiOptions };

    if (currentCursor) {
      tempOptions.params["page[cursor]"] = currentCursor;
    } else if (currentOffset) {
      tempOptions.params["page[offset]"] = currentOffset;
    }

    tempOptions.params["page[limit]"] = tempOptions.pageLimit;

    let runningPromise;
    setState(prevState => ({ ...prevState, fetchingData: true }));
    if (tempOptions.method == "POST") {
      runningPromise = RestAdapter.ajax({
        ...tempOptions,
        headers: { "content-type": "application/vnd.api+json" },
      });
    } else {
      runningPromise = RestAdapter.get(tempOptions);
    }

    runningPromise
      .then(response => {
        parseResponse(response, tempOptions);
      })
      .catch(reason => {
        console.log("Result fetching failed", reason);
        setState(prevState => ({ ...prevState, callFailed: true })); //failure case, end further fetching
        const dummyResponse = { data: [] };
        parseResponse(dummyResponse, tempOptions);
      });
  };

  const parseResponse = (response: any, options: IRestAdapterAjaxOptions) => {
    const parsedResponse: JsonApiResponse = JsonApiParse(response);
    const links = parsedResponse.links;
    const nextLink = links?.next;
    let tempTotalFetched = totalFetched + pageLimit;
    let tempFetchedAll = fetchedAll;
    let tempCurrentCursor = currentCursor;
    let tempCurrentOffset = currentOffset;
    let tempCursorBased = cursorBased;
    let tempMaxStripCount = maxStripCount;

    if (!nextLink || (maxItemToFetch && tempTotalFetched >= maxItemToFetch)) {
      tempFetchedAll = true;
    } else {
      const url = new URL(nextLink);

      if (tempCursorBased === undefined) {
        tempCursorBased = url.searchParams.get("page[cursor]") ? true : false;
      }

      if (tempCursorBased) {
        tempCurrentCursor = url.searchParams.get("page[cursor]");
      } else {
        tempCurrentOffset = url.searchParams.get("page[offset]")!;
      }
    }
    const meta = (parsedResponse as any)?.meta || {};
    tempMaxStripCount = meta.stripCount || 5;
    const skillName = meta.skillName || "";
    let items =
      parsedResponse.learningObjectList ||
      parsedResponse.recommendationList ||
      parsedResponse.catalogList?.filter(item => !item.isDefault) ||
      [];

    if (shouldShuffleResults(widget, account)) {
      items = [...shuffleResults(items)];
    }
    //Need extra item to show the emtry card with action at the end of the strip
    if (tempFetchedAll && showActionElement(widget, account)) {
      items.push({ actionElement: true } as never);
    }
    setState(prevState => ({
      ...prevState,
      fetchingData: false,
      options: { ...options },
      totalFetched: tempTotalFetched,
      fetchedAll: tempFetchedAll,
      currentCursor: tempCurrentCursor,
      currentOffset: tempCurrentOffset,
      cursorBased: tempCursorBased,
      items: [...prevState.items, ...items] as PrimeLearningObject[] | PrimeRecommendation[],
      maxStripCount: tempMaxStripCount,
      skillName: skillName,
      firstFetchDone: !firstFetchDone || true,
      isPrimeLearningObjectList: !!parsedResponse.learningObjectList,
    }));
  };
  const hasMoreResults = (): boolean => {
    return !fetchedAll;
  };

  const addBookmarkHandler = useCallback(
    async (loId: string) => {
      try {
        await RestAdapter.post({
          url: `${getALMConfig().primeApiURL}/learningObjects/${loId}/bookmark`,
          method: "POST",
        });
        const list = updateLOBookmark([...items], loId, true, isPrimeLearningObjectList);

        setState(prevState => {
          return { ...prevState, items: list };
        });
      } catch {
        throw new Error();
      }
    },
    [items.length]
  );

  const removeBookmarkHandler = useCallback(
    async (loId: string) => {
      try {
        await RestAdapter.delete({
          url: `${getALMConfig().primeApiURL}/learningObjects/${loId}/bookmark`,
          method: "DELETE",
        });
        const list = updateLOBookmark([...items], loId, false, isPrimeLearningObjectList);

        setState(prevState => {
          return { ...prevState, items: list };
        });
      } catch {
        throw new Error();
      }
    },
    [items.length]
  );

  const removeItemFromList = useCallback(
    (id: string) => {
      setState((prevState: any) => {
        return {
          ...prevState,
          items: prevState.items.filter((item: PrimeLearningObject) => item.id !== id),
        };
      });
    },
    [items.length]
  );

  const blockLORecommendationHandler = async (loId: string) => {
    try {
      await RestAdapter.post({
        url: `${
          getALMConfig().primeApiURL
        }/recommendationPreferences/learningObjects/${loId}/ignore`,
        method: "POST",
      });
    } catch {
      throw new Error();
    }
  };
  const unblockLORecommendationHandler = async (loId: string) => {
    try {
      await RestAdapter.delete({
        url: `${
          getALMConfig().primeApiURL
        }/recommendationPreferences/learningObjects/${loId}/ignore`,
        method: "DELETE",
      });
    } catch {
      throw new Error();
    }
  };

  const updateLearningObject = async (loId: string): Promise<PrimeLearningObject | Error> => {
    try {
      const response = await getTraining(loId);
      setState(prevState => {
        const list = [...prevState.items] as PrimeLearningObject[] | PrimeRecommendation[];
        const index = getItemIndexFromList(list, loId, isPrimeLearningObjectList);
        if (isPrimeLearningObjectList) {
          (list[index] as PrimeLearningObject) = response!;
        } else {
          //if it a recommnedations object then update the relationship for LO enrollment
          const training = (list[index] as PrimeRecommendation).learningObject;
          JsonApiRelationshipUpdate(
            new JsonApiDataRef("learningObject", training.id),
            new JsonApiDataRef("learningObjectInstanceEnrollment", response?.enrollment?.id!),
            "enrollment"
          );
        }
        return {
          ...prevState,
          items: list,
        };
      });
      return response!;
    } catch (error) {
      throw new Error();
    }
  };

  const enrollmentHandler = useCallback(
    async (loId, loInstanceId, headers = {}): Promise<PrimeLearningObject | Error> => {
      try {
        await enrollTraining(loId, loInstanceId, headers);
        return updateLearningObject(loId);
      } catch (error: any) {
        throw new Error(GetTranslation("alm.enrollment.error"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );
  return {
    ...state,
    fetchMore,
    hasMoreResults,
    addBookmarkHandler,
    removeBookmarkHandler,
    removeItemFromList,
    blockLORecommendationHandler,
    unblockLORecommendationHandler,
    enrollmentHandler,
    updateLearningObject,
  };
};
