import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import APIServiceInstance from "../../common/APIService";
import {
  loadTrainings,
  paginateTrainings,
} from "../../store/actions/catalog/action";
import { PrimeLearningObject } from "../../models/PrimeModels";

export const useCatalog = () => {
  const { trainings, filterState, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchTrainings = useCallback(async () => {
    try {
      const response = await APIServiceInstance.getTrainings(filterState, sort);
      dispatch(loadTrainings(response));
    } catch (e) {
      dispatch(loadTrainings([] as PrimeLearningObject[]));

      console.log("Error while loading trainings " + e);
    }
  }, [dispatch, filterState, sort]);

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
    filterState,
    sort,
    loadMoreTraining,
  };
};
