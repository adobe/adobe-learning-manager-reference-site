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

import { useCallback, useState } from 'react';

import { Widget, WidgetType, AOI_VIEW_TYPE_CONSOLIDATED } from '../../utils/widgets/common';
import {
  CoursesAndPathWidgetAttributes,
  PrimeLearningObject,
  PrimeRecommendation,
  PrimeRecommendations,
  WidgetRecommendationConfigFilters,
  WidgetRecommendationFilters,
  WidgetTrainingFilters,
} from '../../models';

import { getALMAccount, getALMConfig } from '../../utils/global';
import { IRestAdapterAjaxOptions, QueryParams, RestAdapter } from '../../utils/restAdapter';
import { enrollTraining, getTraining } from '../../utils/lo-utils';
import { GetTranslation } from '../../utils/translationService';
import {
  getItemIndexFromList,
  getMaxItemsToFetchForWidget,
  getPageLimitForWidget,
  updateLOBookmark,
} from '../../components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper';
import {
  SORT_DATE_ENROLLED_PARAM,
  SORT_MOST_RECOMMENDED_PARAM,
  SORT_A_TO_Z_PARAM,
  WIDGET_SOURCE,
  SELF_ENROLL,
  CPENEW,
  LO_TYPES,
} from '../../utils/constants';
import { DEFUALT_LO_INCLUDE } from '../../common/ALMCustomHooks';
import APIServiceInstance from '../../common/APIService';
import { calculatePaginationState } from '../../utils/widgets/utils';

const sortMap: { [ref: string]: string } = {
  [WidgetType.MYLEARNING]: SORT_DATE_ENROLLED_PARAM,
  [WidgetType.BOOKMARKS]: SORT_A_TO_Z_PARAM,
};
const learnerStateMap: { [ref: string]: string[] } = {
  [WidgetType.MYLEARNING]: ['enrolled', 'started'],
  [WidgetType.DISCOVERY_RECO]: ['notenrolled'],
  [WidgetType.RECOMMENDATIONS_STRIP]: ['notenrolled'],
};
const recommendationTypeMap: { [ref: string]: string } = {
  [WidgetType.ADMIN_RECO]: 'announcement',
  [WidgetType.TRENDING_RECO]: 'peer_group',
  [WidgetType.AOI_RECO]: 'skill_interest',
};
const canHideWidgetList = [
  WidgetType.ADMIN_RECO,
  WidgetType.RECOMMENDATIONS_STRIP,
  WidgetType.BOOKMARKS,
  WidgetType.AOI_RECO,
];

export const useCoursePathWidget = (widget: Widget) => {
  const [state, setState] = useState({
    options: {} as IRestAdapterAjaxOptions,
    currentOffset: null as string | null,
    currentCursor: null as string | null,
    cursorBased: undefined as boolean | undefined,
    pageLimit: getPageLimitForWidget(widget) as number,
    fetchedAll: false,
    callFailed: false,
    maxItemToFetch: getMaxItemsToFetchForWidget(widget) as number | undefined,
    totalFetched: 0,
    fetchingData: false,
    items: [] as PrimeLearningObject[] | PrimeRecommendation[],
    firstFetchDone: false,
    callNumber: 0,
    enableArrows: true,
    searchString: '',
    hideList: false,
    meta: null as any,
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
    firstFetchDone,
    items,
    callNumber,
  } = state;

  const incrementCallNumber = 1;

  const updateState = (newState: Partial<typeof state>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const handleFetchError = (hasMoreSelectedLoIds: boolean, error?: any) => {
    if (error) {
      console.log('Result fetching failed', error);
    }
    setState(prevState => ({ ...prevState, callFailed: true, fetchingData: false }));
    parseResponseFromAPI({ trainings: [], next: '' }, hasMoreSelectedLoIds);
  };

  const fetchMore = async (query: string = '') => {
    if (!hasMoreResults() || fetchingData) {
      return;
    }
    let widgetInfo = widget.attributes as CoursesAndPathWidgetAttributes;
    if (widgetInfo.loIds?.length && widgetInfo.loIds.length <= pageLimit * callNumber) {
      return;
    }

    setState(prevState => ({ ...prevState, fetchingData: true }));

    const { source, loIds, loTypes } = widgetInfo;
    const sourceDetails = (widgetInfo as any).sourceDetails;
    const hasMoreSelectedLoIds = !!loIds?.length && pageLimit * (callNumber + 1) < loIds.length;

    // Prepare filter parameters
    let paginatedLoIds = undefined;
    if (loIds && loIds.length > 0) {
      paginatedLoIds = loIds.slice(pageLimit * callNumber, pageLimit * callNumber + pageLimit);
    }

    const pagination = {
      cursor: currentCursor,
      offset: currentOffset,
      pageLimit,
      page: callNumber,
    };

    // Source-based filters authored for Courses and Paths; other strips keep their fixed values
    const useSourceFilters = widget.widgetRef === WidgetType.COURSES_AND_PATHS && !loIds?.length;
    const authoredSort = useSourceFilters ? widgetInfo.sort : undefined;
    const authoredLearnerState = useSourceFilters ? widgetInfo.learnerState : undefined;
    const authoredTagName = useSourceFilters ? widgetInfo.tagName : undefined;
    const authoredPartitionOrder = useSourceFilters
      ? widgetInfo.preferredSortPartitionOrder
      : undefined;

    let trainingFilters: WidgetTrainingFilters = {
      loIds: paginatedLoIds,
      source,
      sourceDetails,
      learnerState: authoredLearnerState?.length
        ? authoredLearnerState
        : learnerStateMap[widget.widgetRef] || undefined,
      sort: authoredSort || sortMap[widget.widgetRef] || SORT_MOST_RECOMMENDED_PARAM,
      loTypes: loTypes && loTypes.length > 0 ? loTypes : undefined,
      includeEnrolledChildLOs: widget.widgetRef === WidgetType.COURSES_AND_PATHS || undefined,
    };
    if (authoredTagName?.length) {
      trainingFilters.tagName = authoredTagName;
    }
    if (authoredPartitionOrder?.length) {
      trainingFilters.preferredSortPartitionOrder = authoredPartitionOrder;
    }
    let recommendationFilters: WidgetRecommendationFilters = {
      recommendationType: '',
      sort: sortMap[widget.widgetRef] || SORT_MOST_RECOMMENDED_PARAM,
    };
    switch (widget.widgetRef) {
      case WidgetType.ADMIN_RECO:
      case WidgetType.TRENDING_RECO:
        recommendationFilters.recommendationType = recommendationTypeMap[widget.widgetRef] || '';
        break;
      case WidgetType.AOI_RECO: {
        const view = widget.attributes?.view || AOI_VIEW_TYPE_CONSOLIDATED;
        if (view === AOI_VIEW_TYPE_CONSOLIDATED) {
          recommendationFilters.recommendationType = 'skill_interest';
        } else {
          recommendationFilters.recommendationType = 'multi_skill_interest';
          recommendationFilters.strip = widget.attributes?.stripNum || 1;
        }
        break;
      }
      case WidgetType.BOOKMARKS:
        trainingFilters.bookmarks = true;
        break;
      case WidgetType.DISCOVERY_RECO:
      case WidgetType.RECOMMENDATIONS_STRIP:
        const products: PrimeRecommendations[] = widget.attributes?.recommendationConfig?.products;
        const roles: PrimeRecommendations[] = widget.attributes?.recommendationConfig?.roles;
        const skills: PrimeRecommendations[] = widget.attributes?.recommendationConfig?.skills;
        const recommendationConfig: WidgetRecommendationConfigFilters = {};
        if (products?.length) {
          recommendationConfig.products = products.map(product => ({
            name: product.name,
            levels: product.levels,
          }));
        }
        if (roles?.length) {
          recommendationConfig.roles = roles.map(role => ({
            name: role.name,
            levels: role.levels,
          }));
        }
        if (skills?.length) {
          recommendationConfig.skills = skills.map(skill => skill.name);
        }
        trainingFilters.recommendationConfig = recommendationConfig;
        trainingFilters.subLOsLang = false;
        trainingFilters.externalCertifications = false;
        trainingFilters.enrollmentType = ['SELF_ENROLL', 'AUTO_ENROLL'];
        trainingFilters.include = 'instances,instances.loResources.resources';
        const account = await getALMAccount();
        if (account.recommendationAccountType != CPENEW || account.prlCriteria?.enabled) {
          trainingFilters.enforcedFieldsLO = 'products,roles,extensionOverrides,effectivenessData';
          trainingFilters.excludeIgnoredRecommendations = true;
        } else {
          trainingFilters.loTypes = [
            LO_TYPES.COURSE,
            LO_TYPES.LEARNING_PROGRAM,
            LO_TYPES.CERTIFICATION,
          ];
          trainingFilters.include =
            'instances,instances.loResources.resources,skills.skillLevel.skill';
        }
    }

    try {
      let response:
        | {
            trainings: PrimeLearningObject[] | PrimeRecommendation[];
            next: string;
            meta?: any;
          }
        | null
        | undefined;
      switch (widget.widgetRef) {
        case WidgetType.ADMIN_RECO:
        case WidgetType.TRENDING_RECO:
        case WidgetType.AOI_RECO:
          response = await APIServiceInstance.getCoursePathWidgetRecommendations(
            recommendationFilters,
            pagination
          );
          break;
        case WidgetType.BOOKMARKS:
        case WidgetType.MYLEARNING:
        case WidgetType.DISCOVERY_RECO:
        case WidgetType.RECOMMENDATIONS_STRIP:
        case WidgetType.COURSES_AND_PATHS:
        default:
          response = await APIServiceInstance.getCoursePathWidgetTrainings(
            trainingFilters,
            pagination
          );
          break;
      }
      if (response) {
        parseResponseFromAPI(response, hasMoreSelectedLoIds);
      } else {
        handleFetchError(hasMoreSelectedLoIds);
      }
    } catch (reason) {
      handleFetchError(hasMoreSelectedLoIds, reason);
    }
  };

  const parseResponseFromAPI = (
    response: {
      trainings: PrimeLearningObject[] | PrimeRecommendation[];
      next: string;
      meta?: any;
    },
    hasMoreSelectedLoIds: boolean
  ) => {
    const { trainings, next, meta } = response;

    // Handle empty response
    if (!trainings || trainings.length === 0) {
      // No data means we've fetched everything
      setState(prevState => ({
        ...prevState,
        fetchingData: false,
        fetchedAll: true,
        firstFetchDone: true,
        hideList:
          canHideWidgetList.includes(widget.widgetRef as WidgetType) && !prevState.items?.length,
      }));
      return;
    }

    // Calculate pagination state using helper function
    const paginationState = calculatePaginationState(
      next,
      hasMoreSelectedLoIds,
      totalFetched,
      pageLimit,
      maxItemToFetch,
      currentCursor,
      currentOffset,
      cursorBased
    );

    // Update state with new data and pagination info
    setState(prevState => ({
      ...prevState,
      fetchingData: false,
      ...paginationState,
      items: [...prevState.items, ...trainings] as PrimeLearningObject[] | PrimeRecommendation[],
      firstFetchDone: true,
      callNumber: prevState.callNumber + 1,
      meta: meta || prevState.meta,
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
          method: 'POST',
        });

        setState(prevState => {
          const list = updateLOBookmark([...prevState.items], loId, true, true);
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
          method: 'DELETE',
        });

        setState(prevState => {
          const list = updateLOBookmark([...prevState.items], loId, false, true);
          return { ...prevState, items: list };
        });
      } catch {
        throw new Error();
      }
    },
    [items.length]
  );

  const updateLearningObject = async (loId: string): Promise<PrimeLearningObject | Error> => {
    try {
      const response = await getTraining(loId, DEFUALT_LO_INCLUDE);
      setState(prevState => {
        const list = [...prevState.items] as PrimeLearningObject[];
        const index = getItemIndexFromList(list, loId, true);
        (list[index] as PrimeLearningObject) = response!;
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
    async (
      loId: string,
      loInstanceId: string,
      headers: Record<string, string> = {}
    ): Promise<PrimeLearningObject | Error> => {
      try {
        await enrollTraining(loId, loInstanceId, headers);
        return updateLearningObject(loId);
      } catch (error: any) {
        throw new Error(GetTranslation('alm.enrollment.error'));
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
    enrollmentHandler,
    updateLearningObject,
    updateState,
  };
};
