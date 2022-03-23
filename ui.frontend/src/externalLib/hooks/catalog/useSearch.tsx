import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import {
  resetSearchText,
  updateSearchText,
} from "../../store/actions/catalog/action";
import { debounce, locationUpdate } from "../../utils/catalog";
import { getQueryParamsIObjectFromUrl } from "../../utils/global";

const DEFAULT_MIN_LENGTH = 1;

export const useSearch = () => {
  const query = useSelector((state: State) => state.catalog.query);
  const dispatch = useDispatch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((text: string) => {
      let trimmedText = text.trim();

      if (trimmedText.length === 0) return;

      locationUpdate({ searchText: trimmedText });
      if (trimmedText.length >= DEFAULT_MIN_LENGTH) {
        dispatch(updateSearchText(text));
      } else if (trimmedText.length === 0) {
        dispatch(resetSearchText());
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
