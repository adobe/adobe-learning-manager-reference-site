import { useCallback, useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
import { updateSearchText } from "../../store/actions/catalog/action";
import {
  getQueryParamsIObjectFromUrl,
  locationUpdate,
} from "../../utils/catalog";

export const useSearch = () => {
  const query = useSelector((state: State) => state.catalog.query);
  const dispatch = useDispatch();

  const handleSearch = useCallback(
    (text: string) => {
      locationUpdate({ searchText: text });
      dispatch(updateSearchText(text));
    },
    [dispatch]
  );

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
  };
};
