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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObject } from "../../models/PrimeModels";
import {
  loadTrainings,
  paginateTrainings,
  updateSnippetOnLoad,
  updateSnippetType,
} from "../../store/actions/catalog/action";
import { defaultSearchInDropdownList } from "../../store/reducers/catalog";
import { State } from "../../store/state";
import { getPageAttributes, getQueryParamsFromUrl } from "../../utils/global";

import { useFilter } from "../catalog/useFilter";
import { useSearch } from "../catalog/useSearch";

export const useAuthor = () => {
  //To Do: need to check a better way of doing this
  const [state, setState] = useState<{
    isLoading: boolean;
    errorCode: string;
  }>({ isLoading: false, errorCode: "" });
  const { isLoading, errorCode } = state;

  const { trainings, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const { query, handleSearch, resetSearch, getSearchSuggestions } =
    useSearch();
  const { filters, filterState, updateFilters, updatePriceFilter } =
    useFilter();
  const dispatch = useDispatch();

  const fetchTrainings = useCallback(async () => {
    try {
      setState({ isLoading: true, errorCode: "" });
      const response = await APIServiceInstance.getTrainings(
        filters,
        sort,
        query
      );
      dispatch(loadTrainings(response));
      setState({ isLoading: false, errorCode: "" });
    } catch (error: any) {
      dispatch(loadTrainings([] as PrimeLearningObject[]));
      setState({ isLoading: false, errorCode: error.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, query, sort]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  //for pagination
  const loadMoreTraining = useCallback(
    async () => {
      if (!next) return;
      try {
        const parsedResponse = await APIServiceInstance.loadMoreTrainings(
          filters,
          sort,
          query,
          next
        );
        dispatch(
          paginateTrainings({
            trainings: parsedResponse!.learningObjectList || [],
            next: parsedResponse!.links?.next || "",
          })
        );
      } catch (error: any) {
        setState({ isLoading: false, errorCode: error.status });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, next, query, sort]
  );

  return {
    trainings,
    loadMoreTraining,
    query,
    handleSearch,
    resetSearch,
    getSearchSuggestions,
    filters,
    filterState,
    updateFilters,
    sort,
    isLoading,
    errorCode,
    hasMoreItems: Boolean(next),
    updatePriceFilter,
  };
};
