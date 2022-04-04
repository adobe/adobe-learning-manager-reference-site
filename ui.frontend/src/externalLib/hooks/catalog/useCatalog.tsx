import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObject } from "../../models/PrimeModels";
import {
  loadTrainings,
  paginateTrainings,
} from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import {
  getALMConfig,
  getConfigurableAttributes,
  setALMAttribute,
} from "../../utils/global";
import { useFilter } from "./useFilter";
import { useSearch } from "./useSearch";

const setFiltersOptions = () => {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints.catalogContainer;
    let value = getConfigurableAttributes(cssSelector) || {};
    setALMAttribute("catalogAttributes", value);
    return value;
  }
};

export const useCatalog = () => {
  //To Do: need to check a better way of doping this
  const [catalogAttributes] = useState(() => setFiltersOptions());
  const [state, setState] = useState<{
    isLoading: boolean;
    errorCode: string;
  }>({ isLoading: false, errorCode: "" });
  const { isLoading, errorCode } = state;
  const { trainings, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const { query, handleSearch, resetSearch } = useSearch();
  const { filters, filterState, updateFilters } = useFilter();
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
      setState({ isLoading: false, errorCode: error });
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
    filters.skillLevel,
    filters.duration,
    filters.catalogs,
    query,
    sort,
  ]);

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
            trainings: parsedResponse!.learningObjectList,
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
    filters,
    filterState,
    updateFilters,
    sort,
    catalogAttributes,
    isLoading,
    errorCode,
    hasMoreItems: Boolean(next),
  };
};
