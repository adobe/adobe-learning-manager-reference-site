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
import {
  PrimeLearningObject,
  PrimeLearningObjectInstanceEnrollment,
} from "../../models/PrimeModels";
import {
  loadTrainings,
  paginateTrainings,
  updateSnippetOnLoad,
  updateSnippetType,
  updateTrainings,
} from "../../store/actions/catalog/action";
import { defaultSearchInDropdownList } from "../../store/reducers/catalog";
import { State } from "../../store/state";
import { getPageAttributes, getQueryParamsFromUrl } from "../../utils/global";

import { useFilter } from "./useFilter";
import { useSearch } from "./useSearch";
import { QueryParams } from "../../utils/restAdapter";
import { getTraining } from "../../utils/lo-utils";
import { GetTranslation } from "../../utils/translationService";
import { debounce } from "../../utils/catalog";

export const useCatalog = () => {
  //To Do: need to check a better way of doing this
  const [catalogAttributes, setCatalogAttributes] = useState(() =>
    getPageAttributes("catalogContainer", "catalogAttributes")
  );
  const updatedCatalogAttributed = getPageAttributes("catalogContainer", "catalogAttributes");
  const [state, setState] = useState<{
    isLoading: boolean;
    errorCode: string;
  }>({ isLoading: true, errorCode: "" });
  const { isLoading, errorCode } = state;
  const { sort, next } = useSelector((state: State) => state.catalog);
  let { trainings } = useSelector((state: State) => state.catalog);
  const [metaData, setMetaData] = useState({} as any);
  const { query, handleSearch, resetSearch, getSearchSuggestions } = useSearch();
  const {
    filters,
    filterState,
    updateFilters,
    updatePriceRangeFilter,
    resetFilterList,
    areFiltersLoading,
    searchFilters,
    clearFilterSearch,
  } = useFilter();
  const dispatch = useDispatch();
  //Not there in ember app anymore
  // useEffect(() => {
  //   const queryParams = getQueryParamsFromUrl();
  //   if (queryParams.snippetType) {
  //     const updatedSnippetType = queryParams.snippetType;
  //     dispatch(updateSnippetOnLoad(updatedSnippetType));
  //   }
  // }, [dispatch]);

  const updateSnippet = (checked: boolean, data: any) => {
    let payload = "";

    defaultSearchInDropdownList.forEach(item => {
      if (item.label === data.label) {
        item.checked = checked;
      }
      if (item.checked) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
      }
    });
    dispatch(updateSnippetType(payload));
  };

  const fetchTrainings = useCallback(
    debounce(async () => {
      try {
        setState({ isLoading: true, errorCode: "" });
        dispatch(loadTrainings([]));
        const response = await APIServiceInstance.getTrainings(filters, sort, query);
        dispatch(loadTrainings(response));
        const meta = response?.meta || {};
        setMetaData(meta);
        setState({ isLoading: false, errorCode: "" });
      } catch (error: any) {
        dispatch(loadTrainings([] as PrimeLearningObject[]));
        setState({ isLoading: false, errorCode: error.status });
        setMetaData({});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [
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
      filters.priceRange,
      filters.products,
      filters.roles,
      filters.levels,
      filters.announcedGroups,
      //on checking with learner app this should be userGroupsByRecommendation
      query,
      sort,
    ]
  );

  useEffect(() => {
    const loadData = setTimeout(() => {
      fetchTrainings();
      setCatalogAttributes(updatedCatalogAttributed);
    }, 100);
    return () => clearTimeout(loadData);
  }, [fetchTrainings, catalogAttributes]);

  //for pagination
  const loadMoreTraining = useCallback(
    async () => {
      if (!next || isLoading) {
        return;
      }
      setState({ isLoading: true, errorCode: "" });
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
        setState({ isLoading: false, errorCode: "" });
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
      filters.products,
      filters.roles,
      filters.levels,
      filters.announcedGroups,
      query,
      sort,
      isLoading,
    ]
  );
  const updateLearningObject = useCallback(
    async (loId: string): Promise<PrimeLearningObject | Error> => {
      try {
        const response = await getTraining(loId);

        const list = [...trainings!];
        const index = list.findIndex(item => item.id === loId);
        list[index] = response!;

        const updatedTrainingList = [...list];
        dispatch(updateTrainings({ trainings: updatedTrainingList }));

        return response!;
      } catch (error) {
        throw new Error();
      }
    },
    [trainings, dispatch]
  );

  //check for multi-enrollment
  const enrollmentHandler = useCallback(
    async (
      loId,
      instanceId
      // allowMultiEnrollment = false,
      // headers = {},
    ): Promise<PrimeLearningObjectInstanceEnrollment> => {
      const queryParam: QueryParams = {
        loId: loId,
        loInstanceId: instanceId,
        // allowMultiEnrollment: allowMultiEnrollment,
      };
      const emptyResponse = {} as PrimeLearningObjectInstanceEnrollment;
      try {
        const response = await APIServiceInstance.enrollToTraining(
          queryParam
          // headers
        );
        await updateLearningObject(loId);
        if (response) {
          return response.learningObjectInstanceEnrollment;
        }
        return emptyResponse;
      } catch (error) {
        throw new Error(GetTranslation("alm.enrollment.error"));
      }
    },

    [updateLearningObject]
  );

  return {
    trainings,
    updateLearningObject,
    enrollmentHandler,
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
    updatePriceRangeFilter,
    updateSnippet,
    resetFilterList,
    metaData,
    areFiltersLoading,
    searchFilters,
    clearFilterSearch,
  };
};
