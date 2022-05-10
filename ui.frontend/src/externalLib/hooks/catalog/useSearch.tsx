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
