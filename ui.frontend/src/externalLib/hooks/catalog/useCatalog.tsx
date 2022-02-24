import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import APIServiceInstance from "../../common/APIService";
import {
  loadTrainings,
  paginateTrainings,
} from "../../store/actions/catalog/action";
import { PrimeLearningObject } from "../../models/PrimeModels";
import { useSearch } from "./useSearch";
import { useFilter } from "./useFilter";
import { getALMKeyValue, setALMKeyValue } from "../../utils/global";

const setFiltersOptions = () => {
  const config = getALMKeyValue("config");
  if (config) {
    let cssSelector = config.mountingPoints?.catalogContainer;
    let value = document.querySelector(cssSelector)?.dataset;
    setALMKeyValue("catalogAttributes", value);
    return value;
  }
};

export const useCatalog = () => {
  //To Do: need to check a better way of doping this
  const [catalogAttributes] = useState(() => setFiltersOptions());
  const { trainings, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const { query, handleSearch, resetSearch } = useSearch();
  const { filters, filterState, updateFilters } = useFilter();
  const dispatch = useDispatch();

  const fetchTrainings = useCallback(async () => {
    try {
      const response = await APIServiceInstance.getTrainings(
        filters,
        sort,
        query
      );
      dispatch(loadTrainings(response));
    } catch (e) {
      dispatch(loadTrainings([] as PrimeLearningObject[]));

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
  };
};
