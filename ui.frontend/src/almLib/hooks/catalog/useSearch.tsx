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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { PrimeUser } from "../../models";
import { resetSearchText, updateSearchText } from "../../store/actions/catalog/action";
import { user } from "../../store/reducers/user";
import { State } from "../../store/state";
import { debounce } from "../../utils/catalog";
import {
  getALMConfig,
  getALMUser,
  getQueryParamsFromUrl,
  getWindowObject,
  updateURLParams,
} from "../../utils/global";
import { QueryParams, RestAdapter } from "../../utils/restAdapter";
import { MOBILE_SCREEN_WIDTH } from "../../utils/constants";

const DEFAULT_MIN_LENGTH = 1;

export const useSearch = () => {
  const query = useSelector((state: State) => state.catalog.query);
  const dispatch = useDispatch();
  const primeApiURL = getALMConfig().primeApiURL;
  const { locale } = useIntl();
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    setIsMobileScreen(window.innerWidth <= MOBILE_SCREEN_WIDTH);
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= MOBILE_SCREEN_WIDTH);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxSuggestions = isMobileScreen ? 8 : 10;
  const maxUserSuggestions = isMobileScreen ? 5 : 7;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((text: string, autoCorrectMode = true) => {
      let trimmedText = text.trim();
      if (trimmedText.length === 0) return;
      //NEED to check for autoCorrect here
      updateURLParams({ searchText: trimmedText, autoCorrectMode });
      if (trimmedText.length >= DEFAULT_MIN_LENGTH) {
        dispatch(
          updateSearchText({
            query: text,
            autoCorrectMode: autoCorrectMode,
          })
        );
      } else if (trimmedText.length === 0) {
        dispatch(resetSearchText());
      }
    }),
    [dispatch, debounce]
  );

  const resetSearch = useCallback(() => {
    updateURLParams({
      searchText: "",
      snippetType: "",
      autoCorrectMode: "",
    });
    dispatch(resetSearchText());
  }, [dispatch]);

  const getSearchSuggestions = async (searchTerm = "") => {
    const userSearchHistory = await getUsersSearchHistory(searchTerm);
    const popularSearches = await getpopularSearchesSuggestions(searchTerm);

    return processResults(userSearchHistory, popularSearches);
  };

  const getUsersSearchHistory = async (searchTerm = "") => {
    let suggestions: string[] = [];
    const userSearchHistory = getWindowObject().userSearchHistory;
    if (userSearchHistory?.length) {
      suggestions.push(...userSearchHistory);
    } else {
      suggestions = await getSearchSuggestionsFromApi();
      getWindowObject().userSearchHistory = suggestions;
    }
    if (searchTerm) {
      suggestions = suggestions.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return suggestions;
  };

  const getpopularSearchesSuggestions = async (searchTerm = "") => {
    const result = await getSearchSuggestionsFromApi(10, "accountHistory", searchTerm);
    return result;
  };

  const getSearchSuggestionsFromApi = useCallback(
    async (limit = 200, value?: string, query?: string) => {
      const userResponse = await getALMUser();
      const user = userResponse?.user || ({} as PrimeUser);
      try {
        const params: QueryParams = {
          limit: limit,
          lang: locale,
        };
        if (value) {
          params.suggestionType = value;
        }
        if (query) {
          params.query = encodeURIComponent(query);
        }
        let response: any = await RestAdapter.get({
          url: `${primeApiURL}search/suggestions`,
          params: params,
        });
        const returnData: Array<string> = [];
        response = response ? JSON.parse(response) : {};
        if (response?.data?.length) {
          response.data.forEach((element: { attributes: { text: string } }) => {
            if (element?.attributes?.text) {
              returnData.push(element?.attributes?.text);
            }
          });
        }
        return returnData;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    [dispatch, debounce]
  );

  const removeDuplicates = (arr: any[]) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  };

  const fillPopularSuggestions = (suggestions: any, popularHistoryresults: any) => {
    let beginIndex = 0;
    do {
      const endIndex = beginIndex + maxSuggestions - suggestions.results.length;
      suggestions.results = suggestions.results.concat(
        [...popularHistoryresults].slice(beginIndex, endIndex)
      );
      suggestions.results = removeDuplicates(suggestions.results);
      if (
        suggestions.results.length === maxSuggestions ||
        endIndex > popularHistoryresults.length
      ) {
        return;
      }
      beginIndex = endIndex;
      // eslint-disable-next-line no-constant-condition
    } while (true);
  };

  const fillUserSuggestions = (suggestions: any, userHistoryResults: any) => {
    const popularHistoryresultsArray = [...suggestions.results].slice(
      suggestions.userHistoryIndex,
      suggestions.results.length
    );
    let currentUserHistoryResult = [...suggestions.results].slice(0, suggestions.userHistoryIndex);
    let beginIndex = suggestions.userHistoryIndex;
    do {
      const endIndex = beginIndex + maxSuggestions - suggestions.results.length;
      currentUserHistoryResult = currentUserHistoryResult.concat(
        [...userHistoryResults].slice(beginIndex, endIndex)
      );
      suggestions.userHistoryIndex = currentUserHistoryResult.length;

      let mergedResults = currentUserHistoryResult.concat(popularHistoryresultsArray);
      mergedResults = removeDuplicates(mergedResults);
      if (mergedResults.length === maxSuggestions || endIndex > userHistoryResults.length) {
        suggestions.results = mergedResults;
        return;
      }
      beginIndex = endIndex;
      // eslint-disable-next-line no-constant-condition
    } while (true);
  };

  const processResults = (userSearchHistory: string[], popularHistoryresults: string[]) => {
    const suggestions: any = {};
    suggestions.results = userSearchHistory.slice(0, maxUserSuggestions);
    suggestions.userHistoryIndex = suggestions.results.length;
    fillPopularSuggestions(suggestions, popularHistoryresults);

    if (suggestions.results.length < maxSuggestions) {
      fillUserSuggestions(suggestions, userSearchHistory);
    }
    return {
      userSearchHistory: [...suggestions.results].splice(0, suggestions.userHistoryIndex),
      popularSearches: suggestions.results.splice(suggestions.userHistoryIndex),
    };
  };

  const computedQuery = useMemo(() => {
    const queryParams = getQueryParamsFromUrl();
    return queryParams.searchText || query;
  }, [query]);

  useEffect(() => {
    const queryParams = getQueryParamsFromUrl();
    if (queryParams.searchText) {
      dispatch(
        updateSearchText({
          query: queryParams.searchText,
          autoCorrectMode: queryParams.autoCorrectMode,
        })
      );
    }
  }, [dispatch]);

  return {
    query: computedQuery,
    handleSearch,
    resetSearch,
    getSearchSuggestions,
  };
};
