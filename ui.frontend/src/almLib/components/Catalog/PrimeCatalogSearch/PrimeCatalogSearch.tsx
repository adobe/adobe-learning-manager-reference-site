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
import { useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { SEARCH_ICON_SVG } from "../../../utils/inline_svg";
import styles from "./PrimeCatalogSearch.module.css";
import { Checkbox, TextField } from "@adobe/react-spectrum";
import TrendInspect from "@spectrum-icons/workflow/TrendInspect";
import History from "@spectrum-icons/workflow/History";
import Properties from "@spectrum-icons/workflow/Properties";
import {
  POPULAR_SUGGESTIONS,
  USERS_SUGGESTIONS,
} from "../../../utils/constants";
import { GetTranslation } from "../../../utils/translationService";
import { getALMObject } from "../../../utils/global";
import { useDispatch, useSelector } from "react-redux";
import {
  closeSuggestionsList,
  searchInput,
  showSuggestionsList,
} from "../../../store/actions/search/actions";
import { debounce } from "../../../utils/catalog";
import store from "../../../../store/APIStore";
import { State } from "../../../store/state";
import { defaultSearchInDropdownList } from "../../../store/reducers/catalog";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
  getSearchSuggestions: (searhTerm: string) => any;
  updateSnippet: (checked: boolean, data: any) => void;
}> = ({ query, handleSearch, getSearchSuggestions, updateSnippet }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const storeState = store.getState();
  const searchState = storeState.search;
  const canAutoComplete = useSelector(
    (state: State) => state.search.autocomplete
  );

  const [state, setState] = useState(query);

  const [showSearchInDropdown, setShowSearchInDropdown] = useState(false);
  
  const searchFilterDropdownRef = useRef<HTMLInputElement>(null);
  const searchAutocompleteDropdownRef = useRef<HTMLInputElement>(null);

  const maxSearchTextCount = 200;
  const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();

  const searchChangedHandler = (event: any) => {
    if (event.key === "Enter") {
      handleSearch(state);
      handleClickOutside(event);
    }
  };

  const beginSearchHandler = () => {
    if (state) {
      handleSearch(state);
    }
  };

  const searchInDropdownTemplate = () => {
    if (showSearchInDropdown && isPrimeUserLoggedIn) {
      return (
        <div
          ref={searchFilterDropdownRef}
          className={[
            styles.searchDropdown,
            styles.searchDropdownContainer,
            styles.searchDropdownFilterContainer,
          ].join(" ")}
        >
          <h4>{GetTranslation("alm.catalog.searchIn")}</h4>
          <ul>
          {defaultSearchInDropdownList.map((item) => {
            return (
              
                <li key={item.label}>
                  <Checkbox
                    onChange={(checked) => updateSnippet(checked, item)}
                    isSelected={item.checked}
                    UNSAFE_className={styles.primeChechbox}
                  >
                    {GetTranslation(item.label, true)}
                  </Checkbox>
                </li>
              
            );
          })}
          </ul>
        </div>
      );
    }
  };

  const searchSuggestionsTemplate = () => {
    if (canAutoComplete && isPrimeUserLoggedIn) {
      return (
        <div ref={searchAutocompleteDropdownRef}>
          {autoComplete(
            searchState.userSearchHistory || [],
            searchState.popularSearches || []
          )}
        </div>
      );
    }
  };

  const autoComplete = (
    userSearchHistory: string[],
    popularSearches: string[]
  ) => {
    if (userSearchHistory?.length === 0 && popularSearches?.length === 0) {
      return "";
    }

    const userSuggestionTemplate = getSuggestionHtml(
      userSearchHistory,
      USERS_SUGGESTIONS
    );
    const popularSuggestionTemplate = getSuggestionHtml(
      popularSearches,
      POPULAR_SUGGESTIONS
    );

    const dividerHtml =
      userSearchHistory?.length === 0 || popularSearches?.length === 0 ? (
        ""
      ) : (
        <hr className={styles.searchSeparator} />
      );
    return (
      <div className={styles.searchDropdown}>
        {userSuggestionTemplate} {dividerHtml}
        {popularSuggestionTemplate}
      </div>
    );
  };

  const getSuggestionHtml = (suggestions: string[], type: string) => {
    if (!suggestions || suggestions.length === 0) {
      return "";
    }
    return (
      <div className={styles.searchDropdownContainer}>
        {type === POPULAR_SUGGESTIONS ? (
          <h4>
            <TrendInspect UNSAFE_className={styles.searchSuggestionIcons} />
            {GetTranslation("alm.search.popularSearchHistory.label")}
          </h4>
        ) : (
          <h4>
            <History UNSAFE_className={styles.searchSuggestionIcons} />
            {GetTranslation("alm.search.userSearchHistory.label")}
          </h4>
        )}
        <ul>
          {suggestions.map((item: string) => getSuggesstionItemHtml(item))}
        </ul>
      </div>
    );
  };

  const getSuggesstionItemHtml = (item: string) => {
    return (
      <li key={item}>
        <a
          href="javascript:void(0)"
          title={item}
          onClick={() => {
            handleSearch(item);
            dispatch(closeSuggestionsList());
          }}
        >
          <p aria-hidden="true">{item}</p>
        </a>
      </li>
    );
  };

  const openSuggestionList = async (e: any) => {
    const target = e?.target as HTMLInputElement;
    let value = target.value || "";
    value = value.trim();
    if (value?.length > 0 && value?.length < 3) {
      dispatch(closeSuggestionsList());
      return;
    }
    ///search should support max 200 characters
    if (value.length > maxSearchTextCount) {
      value = value.substring(0, maxSearchTextCount);
      target.value = value;
    }
    dispatch(searchInput(value));
    const fetchedSuggestions = await getSearchSuggestions(value);
    dispatch(showSuggestionsList(fetchedSuggestions));
  };

  const handleInput = useCallback(
    debounce((e: any) => {
      openSuggestionList(e);
    }),
    [dispatch, debounce]
  );

  const handleClickOutside = (e: any) => {
    if (
      searchAutocompleteDropdownRef &&
      searchAutocompleteDropdownRef.current &&
      !searchAutocompleteDropdownRef.current.contains(e.target)
    ) {
      e.stopPropagation();
      dispatch(closeSuggestionsList());
    }
    if (
      searchFilterDropdownRef &&
      searchFilterDropdownRef.current &&
      !searchFilterDropdownRef.current.contains(e.target)
    ) {
      e.stopPropagation();
      setShowSearchInDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
  }, []);

  useEffect(() => {
    setState(query);
  }, [query]);

  return (
    <div className={styles.searchContainer}>
      <button
        className={
          isPrimeUserLoggedIn ? styles.searchDropdownFilterIcon : styles.hide
        }
        onClick={(e) => {
          setShowSearchInDropdown(true);
        }}
      >
        <Properties size="S" />
      </button>
      <div className={styles.container}>
      {searchInDropdownTemplate()}
      <div
          onFocus={() => setShowSearchInDropdown(false)}
        >
        <TextField
          placeholder={formatMessage({
            id: "alm.catalog.search.placeholder",
            defaultMessage: "Enter text and press enter",
          })}
          onKeyDown={searchChangedHandler}
          onChange={(value) => setState(value)}
          value={state}
          width={"100%"}
          height={"38px"}
          UNSAFE_className={styles.customInput}
          {...(isPrimeUserLoggedIn
            ? {
                onInput: (e) => handleInput(e),
                onFocus: (e) => openSuggestionList(e),
              }
            : {})}
        />
        <span className={styles.searchIcon} onClick={beginSearchHandler}>
          {SEARCH_ICON_SVG()}
        </span>
        
        {searchSuggestionsTemplate()}
        </div>
      </div>
    </div>
  );
};

export default PrimeCatalogSearch;
