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
import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import Close from "@spectrum-icons/workflow/Close";
import Filter from "@spectrum-icons/workflow/Filter";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useCatalog } from "../../../hooks/catalog/useCatalog";
import {
  getALMConfig,
  getALMObject,
  getALMUser,
  setTrainingsLayout,
  updateURLParams,
} from "../../../utils/global";
import { CLOSE_SVG } from "../../../utils/inline_svg";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  isTranslated,
} from "../../../utils/translationService";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCatalogFilters } from "../PrimeCatalogFilters";
import PrimeCatalogSearch from "../PrimeCatalogSearch/PrimeCatalogSearch";
import { PrimeTrainingsContainer } from "../PrimeTrainingsContainer";
import styles from "./PrimeCatalogContainer.module.css";
import { closeSuggestionsList } from "../../../store/actions/search/actions";
import { useDispatch } from "react-redux";
import { PrimeAccount, PrimeUser } from "../../../models";
import { LIST_VIEW, TILE_VIEW } from "../../../utils/constants";

import ViewList from "@spectrum-icons/workflow/ViewList";
import ClassicGridView from "@spectrum-icons/workflow/ClassicGridView";
import PrimeSelectedFiltersList from "../PrimeCatalogFilters/PrimeSelectedFiltersList";
import { ALMCustomPicker } from "../../Common/ALMCustomPicker";
import { getAvailableSortOptions } from "../../../utils/sort";
import { updateSortOrder } from "../../../store";
import { ALMGoToTop } from "../../ALMGoToTop";

const PrimeCatalogContainer = (props: any) => {
  const {
    trainings,
    loadMoreTraining,
    query,
    handleSearch,
    resetSearch,
    getSearchSuggestions,
    filterState,
    updateFilters,
    catalogAttributes,
    isLoading,
    hasMoreItems,
    updatePriceRangeFilter,
    updateSnippet,
    enrollmentHandler,
    updateLearningObject,
    resetFilterList,
    metaData,
    areFiltersLoading,
    searchFilters,
    clearFilterSearch,
  } = useCatalog();
  const { formatMessage } = useIntl();
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false);
  const [user, setUser] = useState(null as PrimeUser | null);
  const [account, setAccount] = useState(null as PrimeAccount | null);
  const dispatch = useDispatch();
  const almConfig = getALMConfig();
  const hideSearchInput = almConfig.hideSearchInput;

  const getInitialView = (viewType: string) => {
    const viewFromStorage = getALMObject().storage.getItem(TILE_VIEW);
    if (viewFromStorage) {
      return viewFromStorage;
    }

    let defaultView;

    switch (viewType) {
      case "GRID":
        defaultView = TILE_VIEW;
        break;
      case "LIST":
        defaultView = LIST_VIEW;
        break;
      default:
        defaultView = TILE_VIEW;
    }

    return defaultView;
  };
  const [view, setView] = useState(TILE_VIEW);

  const defaultCatalogHeading = useMemo(() => {
    const catalogHeader = GetTranslation("alm.catalog.header", true);
    return isTranslated(catalogHeader) ? catalogHeader : "";
  }, []);

  const [pageHeader, setPageHeader] = useState(defaultCatalogHeading);

  const socialLearningResultsCount = metaData?.informalCount;
  const formalResultsCount = metaData?.formalCount || 0;
  const contentMarketPlaceResultsCount = metaData?.contentMarketPlaceCount;

  useEffect(() => {
    if (query) {
      setPageHeader(GetTranslation("alm.search.results.text"));
    } else {
      setPageHeader(props.heading ? props.heading : defaultCatalogHeading);
    }
  }, [query, props.heading]);

  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      const user = response?.user;
      const account = user?.account;

      setUser(user || ({} as PrimeUser));
      setAccount(account || ({} as PrimeAccount));

      const viewType = account?.viewType;
      const defaultView = getInitialView(viewType!);
      setView(defaultView);
    })();
  }, []);

  const defaultCatalogDescription = useMemo(() => {
    const catalogSummary = GetTranslation("alm.text.catalog.summary", true);
    return isTranslated(catalogSummary) ? catalogSummary : "";
  }, []);

  const showingSearchHtml = query && (
    <div className={styles.searchAppliedContainer}>
      <div className={styles.searchAppliedLabel} data-automationid="searchResultsText">
        {GetTranslation("alm.text.searchResults")}
        <div className={styles.searchTextContainer}>
          <span className={styles.searchText} data-automationid="searchQuery">
            {query}
          </span>

          <span
            className={styles.searchReset}
            onClick={resetSearch}
            tabIndex={0}
            role="button"
            aria-label={formatMessage(
              { id: "alm.search.results" },
              {
                searchText: query,
              }
            )}
            data-automationid="closeSearch"
          >
            {CLOSE_SVG()}
          </span>
        </div>
      </div>
    </div>
  );

  const listContainerCss = `${styles.listContainer} ${
    catalogAttributes?.showFilters !== "true" && styles.full
  } `;

  const filtersCss = `${styles.filtersContainer} ${
    showFiltersOnMobile ? styles.onMobile : ""
  } ${hideSearchInput ? styles.teamsExtraTopMargin : ""}`;

  const toggleFiltersonMobile = () => {
    setShowFiltersOnMobile(prevState => !prevState);
  };

  const filtersHtml =
    catalogAttributes?.showFilters === "true" && account ? (
      <div className={filtersCss}>
        <Button
          UNSAFE_className={styles.closeIcon}
          variant="primary"
          isQuiet
          onPress={toggleFiltersonMobile}
        >
          <Close aria-label="Close" />
        </Button>
        <PrimeCatalogFilters
          filterState={filterState}
          updateFilters={updateFilters}
          catalogAttributes={catalogAttributes}
          updatePriceRangeFilter={updatePriceRangeFilter}
          account={account}
          resetFilterList={resetFilterList}
          areFiltersLoading={areFiltersLoading}
          user={user}
          searchFilters={searchFilters}
          clearFilterSearch={clearFilterSearch}
        ></PrimeCatalogFilters>
      </div>
    ) : (
      ""
    );

  const filtersButtonForMobileHTML =
    catalogAttributes?.showFilters === "true" ? (
      <Button
        variant="primary"
        UNSAFE_className={styles.button}
        onPress={toggleFiltersonMobile}
        data-automationid="applyFiltersOnMobile"
      >
        {formatMessage({
          id: "alm.catalog.filter",
          defaultMessage: "Filters",
        })}
        <Filter />
      </Button>
    ) : (
      ""
    );
  const searchHtml =
    catalogAttributes?.showSearch === "true" ? (
      <PrimeCatalogSearch
        query={query}
        handleSearch={handleSearch}
        getSearchSuggestions={getSearchSuggestions}
        updateSnippet={updateSnippet}
      />
    ) : (
      ""
    );

  const searchContainerHTML = (
    <div className={styles.searchContainer} data-automationid="catalogSearchContainer">
      {searchHtml}
    </div>
  );

  const handleSelectedOption = (selectedOptionId: string) => {
    dispatch(updateSortOrder(selectedOptionId));
    updateURLParams({ sort: selectedOptionId });
  };

  const renderSortPicker = () => {
    const sortOptions = getAvailableSortOptions(account as PrimeAccount, GetTranslation);
    const defaultSortOption = sortOptions.defaultOption;
    dispatch(updateSortOrder(defaultSortOption));
    return (
      <ALMCustomPicker
        options={sortOptions.availableSortOptions}
        onOptionSelected={handleSelectedOption}
        defaultSelectedOptionId={sortOptions.defaultOption}
      ></ALMCustomPicker>
    );
  };

  const renderSearchResultsDescription = () => (
    <>
      <span>
        {formalResultsCount >= 0 && (
          <span>
            {GetTranslationsReplaced(
              "alm.search.formal.results",
              {
                formalResultsCount: formalResultsCount,
              },
              true
            )}
            <span className={styles.searchQuery}>{query}</span>
          </span>
        )}
        {socialLearningResultsCount > 0 && (
          <>
            {" & "}
            <a
              href="#"
              onClick={() => getALMObject().navigateToSocial(`/search?searchString=${query}`)}
            >
              {GetTranslationReplaced(
                "alm.search.social.results",
                socialLearningResultsCount,
                true
              )}
            </a>
          </>
        )}

        {contentMarketPlaceResultsCount > 0 && (
          <>
            {" & "}
            <a
              href="#"
              onClick={() =>
                getALMObject().navigateToContentMarketplace(`tab=SEARCH&keyword=${query}`)
              }
            >
              {GetTranslationReplaced(
                "alm.search.contentMarketPlace.results",
                contentMarketPlaceResultsCount,
                true
              )}
            </a>
          </>
        )}
      </span>
      {!almConfig.hideSearchClearButton && (
        <button
          className={styles.clearSearch}
          onClick={resetSearch}
          data-automationid="closeSearch"
          aria-label={clearButtonTitle}
        >
          {CLOSE_SVG()}
        </button>
      )}
    </>
  );
  const gridButtonTitle = useMemo(() => GetTranslation("alm.grid.view.aria", true), []);
  const listButtonTitle = useMemo(() => GetTranslation("alm.list.view.aria", true), []);
  const clearButtonTitle = useMemo(
    () => GetTranslation("alm.community.search.clear.label", true),
    []
  );
  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.header}>
              <h1
                className={styles.label}
                tabIndex={0}
                data-automationid="catalogHeading"
                data-skip="skip-target"
              >
                {pageHeader}
              </h1>

              {filtersButtonForMobileHTML}

              {!hideSearchInput && searchContainerHTML}
            </div>

            <div className={styles.descriptionContainer}>
              <div
                className={styles.catalogDescription}
                tabIndex={0}
                data-automationid="catalogDescription"
              >
                {!query
                  ? props.description != null
                    ? props.description
                    : defaultCatalogDescription
                  : renderSearchResultsDescription()}
              </div>
              <div className={styles.sortAndChangeLayoutContainer}>
                <div className={styles.sortText}>{GetTranslation("alm.picker.sortBy")}</div>
                <div className={styles.picker} data-automationid="sortType">
                  {renderSortPicker()}
                </div>
                <div className={styles.changeLayoutContainer}>
                  <button
                    className={`${styles.viewButton} ${
                      view === TILE_VIEW ? styles.selectedView : ""
                    }`}
                    onClick={() => setTrainingsLayout(TILE_VIEW, setView)}
                    data-automationid="trainingsTileView"
                    title={gridButtonTitle}
                    aria-label={gridButtonTitle}
                    aria-pressed={view === TILE_VIEW}
                  >
                    <ClassicGridView />
                  </button>
                  <button
                    className={`${styles.viewButton} ${
                      view === LIST_VIEW ? styles.selectedView : ""
                    }`}
                    onClick={() => setTrainingsLayout(LIST_VIEW, setView)}
                    data-automationid="trainingsListView"
                    title={listButtonTitle}
                    aria-label={listButtonTitle}
                    aria-pressed={view === LIST_VIEW}
                  >
                    <ViewList />
                  </button>
                </div>
              </div>
            </div>

            {/* {catalogAttributes?.showSearch === "true" && showingSearchHtml} */}
          </div>
          <div
            className={styles.filtersAndListConatiner}
            onFocus={() => dispatch(closeSuggestionsList())}
            data-automationid="catalogFiltersAndListContainer"
          >
            {filtersHtml}
            <div
              className={listContainerCss}
              aria-hidden={showFiltersOnMobile ? "true" : "false"}
              data-automationid="catalogTrainingsContainer"
            >
              <PrimeSelectedFiltersList filterState={filterState} updateFilters={updateFilters} />
              {user && view && (
                <PrimeTrainingsContainer
                  trainings={trainings}
                  loadMoreTraining={loadMoreTraining}
                  hasMoreItems={hasMoreItems}
                  guest={props.guest}
                  signUpURL={props.signUpURL}
                  almDomain={props.almDomain}
                  user={user!}
                  account={user!.account}
                  view={view}
                  enrollmentHandler={enrollmentHandler}
                  updateLearningObject={updateLearningObject}
                  isloading={isLoading}
                ></PrimeTrainingsContainer>
              )}
              {isLoading ? <ALMLoader classes={styles.loader} /> : ""}
            </div>
          </div>

          <ALMGoToTop />
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeCatalogContainer;
