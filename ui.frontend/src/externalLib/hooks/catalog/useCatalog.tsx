import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { PrimeLearningObject } from "../../models/PrimeModels";
import {
  loadTrainings,
  paginateTrainings,
} from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import { getALMConfig, setALMAttribute } from "../../utils/global";
import { useFilter } from "./useFilter";
import { useSearch } from "./useSearch";

const setFiltersOptions = () => {
  const config = getALMConfig();
  if (config) {
    let cssSelector = config.mountingPoints.catalogContainer;
    let value = (document.querySelector(cssSelector) as any)?.dataset;
    setALMAttribute("catalogAttributes", value);
    return value;
  }
};

export const useCatalog = () => {
  //To Do: need to check a better way of doping this
  const [catalogAttributes] = useState(() => setFiltersOptions());
  const [isLoading, setIsLoading] = useState(true);
  const { trainings, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const { query, handleSearch, resetSearch } = useSearch();
  const { filters, filterState, updateFilters } = useFilter();
  const dispatch = useDispatch();

  const fetchTrainings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await APIServiceInstance.getTrainings(
        filters,
        sort,
        query
      );
      dispatch(loadTrainings(response));
      setIsLoading(false);
    } catch (e) {
      dispatch(loadTrainings([] as PrimeLearningObject[]));
      setIsLoading(false);

      console.log("Error while loading trainings " + e);
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
  const loadMoreTraining = useCallback(async () => {
    if (!next) return;
    const parsedResponse = await APIServiceInstance.loadMore(next);
    dispatch(
      paginateTrainings({
        trainings: parsedResponse!.learningObjectList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

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
    hasMoreItems: Boolean(next),
  };
};
