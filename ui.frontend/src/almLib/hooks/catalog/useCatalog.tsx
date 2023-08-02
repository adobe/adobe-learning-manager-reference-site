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

import { useFilter } from "./useFilter";
import { useSearch } from "./useSearch";

export const useCatalog = () => {
  //To Do: need to check a better way of doing this
  const [catalogAttributes, setCatalogAttributes] = useState(() =>
    getPageAttributes("catalogContainer", "catalogAttributes")
  );
  const updatedCatalogAttributed = getPageAttributes(
    "catalogContainer",
    "catalogAttributes"
  );
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

  useEffect(() => {
    const queryParams = getQueryParamsFromUrl();
    if (queryParams.snippetType) {
      const updatedSnippetType = queryParams.snippetType;
      dispatch(updateSnippetOnLoad(updatedSnippetType));
    }
  }, [dispatch]);

  const updateSnippet = (checked: boolean, data: any) => {
    let payload = "";

    defaultSearchInDropdownList.forEach((item) => {
      if (item.label === data.label) {
        item.checked = checked;
      }
      if (item.checked) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
      }
    });
    dispatch(updateSnippetType(payload));
  };

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
  }, [
    dispatch,
    filters.duration,
    filters.learnerState,
    filters.loFormat,
    filters.loTypes,
    filters.skillName,
    filters.tagName,
    filters.cities,
    filters.skillLevel,
    filters.duration,
    filters.catalogs,
    filters.price,
    query,
    sort,
  ]);

  useEffect(() => {
    fetchTrainings();
    setCatalogAttributes(updatedCatalogAttributed);
  }, [fetchTrainings, catalogAttributes]);

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
    [
      dispatch,
      next,
      filters.duration,
      filters.learnerState,
      filters.loFormat,
      filters.loTypes,
      filters.skillName,
      filters.tagName,
      filters.skillLevel,
      filters.duration,
      filters.catalogs,
      filters.cities,
      query,
      sort,
    ]
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
    catalogAttributes,
    isLoading,
    errorCode,
    hasMoreItems: Boolean(next),
    updatePriceFilter,
    updateSnippet,
  };
};
