/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useState } from 'react';
import { CategoryWidgetAttributes, PrimeRecommendation } from '../../models';
import { Widget } from '../../utils/widgets/common';
import { JsonApiParse } from '../../utils/jsonAPIAdapter';
import { getALMConfig } from '../../utils/global';
import { GET_REQUEST } from '../../utils/constants';
import { IRestAdapterAjaxOptions, QueryParams, RestAdapter } from '../../utils/restAdapter';
import {
  getMaxItemsToFetchForWidget,
  getPageLimitForWidget,
} from '../../components/Widgets/ALMPrimeStrip/ALMPrimeStrip.helper';
import APIServiceInstance from '../../common/APIService';
import { calculatePaginationState } from '../../utils/widgets/utils';

export const useALMCategoryWidget = (widget: Widget) => {
  const [state, setState] = useState({
    options: {} as IRestAdapterAjaxOptions,
    currentOffset: null as string | null,
    currentCursor: null as string | null,
    pageLimit: getPageLimitForWidget(widget) as number,
    cursorBased: undefined as boolean | undefined,
    fetchedAll: false,
    callFailed: false,
    maxItemToFetch: getMaxItemsToFetchForWidget(widget) as number | undefined,
    totalFetched: 0,
    fetchingData: false,
    items: [] as PrimeRecommendation[],
    firstFetchDone: false,
    numberOfResults: 0,
    callNumber: 0,
    itemsPerPage: 4,
    enableArrows: true,
    searchString: '',
    hideList: false,
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
    callNumber,
  } = state;

  const updateState = (newState: Partial<typeof state>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const incrementCallNumber = 1;

  const fetchMore = async (query: string = '') => {
    if (!hasMoreResults() || fetchingData) {
      return;
    }
    let widgetInfo = widget.attributes as CategoryWidgetAttributes;
    if (widgetInfo.sourceIds?.length && widgetInfo.sourceIds.length <= pageLimit * callNumber) {
      return;
    }

    setState(prevState => ({ ...prevState, fetchingData: true }));

    const { source, sourceIds } = widgetInfo;
    const isSelectedSourceIds = sourceIds ? true : false;
    const hasMoreSelectedSourceIds =
      !!sourceIds?.length && pageLimit * (callNumber + 1) < sourceIds.length;

    // Prepare filter parameters
    let paginatedSourceIds = undefined;
    if (sourceIds && sourceIds.length > 0) {
      paginatedSourceIds = sourceIds.slice(
        pageLimit * callNumber,
        pageLimit * callNumber + pageLimit
      );
    }

    const filters = {
      sourceIds: paginatedSourceIds,
      source: source || '',
      fetchAll: widgetInfo.fetchAll,
    };

    const pagination = {
      cursor: currentCursor,
      offset: currentOffset,
      pageLimit,
      page: callNumber,
    };

    try {
      const response = await APIServiceInstance.getCategoryWidgetData(filters, pagination);
      if (response) {
        parseResponseFromAPI(response, isSelectedSourceIds, hasMoreSelectedSourceIds);
      } else {
        setState(prevState => ({ ...prevState, callFailed: true, fetchingData: false }));
        const dummyResponse = { categories: [], next: '' };
        parseResponseFromAPI(dummyResponse, isSelectedSourceIds, hasMoreSelectedSourceIds);
      }
    } catch (reason) {
      console.log('Result fetching failed', reason);
      setState(prevState => ({ ...prevState, callFailed: true, fetchingData: false }));
      const dummyResponse = { categories: [], next: '' };
      parseResponseFromAPI(dummyResponse, isSelectedSourceIds, hasMoreSelectedSourceIds);
    }
  };

  const parseResponseFromAPI = (
    response: { categories: PrimeRecommendation[]; next: string; meta?: any },
    isSelectedSourceIds: boolean,
    hasMoreSelectedSourceIds: boolean
  ) => {
    const { categories, next, meta } = response;

    if (!categories || (categories.length === 0 && isSelectedSourceIds)) {
      // No data returned
      setState(prevState => ({
        ...prevState,
        fetchingData: false,
        fetchedAll: true,
        firstFetchDone: true,
      }));
      return;
    }

    // Continue with response processing - calculate pagination state using utility function
    const {
      totalFetched: tempTotalFetched,
      fetchedAll: tempFetchedAll,
      currentCursor: tempCurrentCursor,
      currentOffset: tempCurrentOffset,
      cursorBased: tempCursorBased,
    } = calculatePaginationState(
      next,
      hasMoreSelectedSourceIds,
      totalFetched,
      pageLimit,
      maxItemToFetch,
      currentCursor,
      currentOffset,
      cursorBased
    );

    const numberOfResults = meta?.formalCount || 0;

    setState(prevState => ({
      ...prevState,
      fetchingData: false,
      totalFetched: tempTotalFetched,
      fetchedAll: tempFetchedAll,
      currentCursor: tempCurrentCursor,
      currentOffset: tempCurrentOffset,
      cursorBased: tempCursorBased,
      items: [...prevState.items, ...categories],
      firstFetchDone: true,
      numberOfResults,
      callNumber: prevState.callNumber + incrementCallNumber,
    }));
  };

  const hasMoreResults = (): boolean => {
    return !fetchedAll;
  };

  return {
    ...state,
    fetchMore,
    updateState,
  };
};
