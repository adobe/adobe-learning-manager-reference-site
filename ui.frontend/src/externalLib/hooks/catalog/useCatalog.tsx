import { useCallback, useEffect } from "react";
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

export const useCatalog = () => {
  const { trainings, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const { query } = useSearch();
  const { filters } = useFilter();
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
  }, [dispatch, filters, query, sort]);

  useEffect(() => {
    console.log("inside fetchTraining useeffect");
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
    filters,
    sort,
    loadMoreTraining,
  };
};
