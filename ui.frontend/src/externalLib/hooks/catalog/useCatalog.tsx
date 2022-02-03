import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import APIServiceInstance from "../../common/APIService";
import {
  loadTrainings,
  paginateTrainings,
} from "../../store/actions/catalog/action";
import { AEMLearnLearningObject } from "../../models/AEMLearnModels";

export const useCatalog = () => {
  const { items, filterState, sort, next } = useSelector(
    (state: State) => state.catalog
  );
  const dispatch = useDispatch();
  //Fort any page load or filterchanges
  const fetchTrainings = useCallback(async () => {
    try {
      //TO-DO fix this any
      const response = await APIServiceInstance.getTrainings(filterState, sort);

      dispatch(loadTrainings(response));
    } catch (e) {
      dispatch(loadTrainings([] as AEMLearnLearningObject[]));

      // console.log("Error while calling user " + e);
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
        items: parsedResponse!.learningObjectList,
        next: parsedResponse!.links?.next || "",
      })
    );
  }, [dispatch, next]);

  return {
    items,
    filterState,
    sort,
    loadMoreTraining,
  };
};
