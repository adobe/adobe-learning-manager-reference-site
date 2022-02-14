import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import {
  resetSearchText,
  updateSearchText,
} from "../../store/actions/catalog/action";
import {
  debounce,
  getQueryParamsIObjectFromUrl,
  locationUpdate,
} from "../../utils/catalog";

const DEFAULT_MIN_LENGTH = 3;

export const useSearch = () => {
  const query = useSelector((state: State) => state.catalog.query);
  const dispatch = useDispatch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((text: string) => {
      if (text.length >= DEFAULT_MIN_LENGTH) {
        locationUpdate({ searchText: text });
        dispatch(updateSearchText(text));
      }
    }),
    [dispatch, debounce]
  );

  const resetSearch = useCallback(() => {
    locationUpdate({ searchText: "" });
    dispatch(resetSearchText());
  }, [dispatch]);

  const computedQuery = useMemo(() => {
    const queryParams = getQueryParamsIObjectFromUrl();
    return queryParams.searchText || query;
  }, [query]);

  useEffect(() => {
    const queryParams = getQueryParamsIObjectFromUrl();
    if (queryParams.searchText) {
      dispatch(updateSearchText(queryParams.searchText));
    }
  }, [dispatch]);

  return {
    query: computedQuery,
    handleSearch,
    resetSearch,
  };
};
