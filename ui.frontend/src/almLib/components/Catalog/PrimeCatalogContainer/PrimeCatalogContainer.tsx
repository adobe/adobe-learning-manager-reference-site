/* eslint-disable jsx-a11y/anchor-is-valid */
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
import { Divider, Heading, Item, lightTheme, ListBox, Provider, View } from '@adobe/react-spectrum';
import Filter from '@spectrum-icons/workflow/Filter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useCatalog } from '../../../hooks/catalog/useCatalog';
import {
  canShowExternalLearning,
  getALMConfig,
  getALMObject,
  getALMUser,
  getQueryParamsFromUrl,
  getSelectedOptionsForMobile,
  setTrainingsLayout,
  updateURLParams,
} from '../../../utils/global';
import { CLOSE_SVG, EXTERNAL_LEARNING_ICON } from '../../../utils/inline_svg';
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  isTranslated,
} from '../../../utils/translationService';
import { ALMErrorBoundary } from '../../Common/ALMErrorBoundary';
import { ALMLoader } from '../../Common/ALMLoader';
import { PrimeCatalogFilters } from '../PrimeCatalogFilters';
import PrimeCatalogSearch from '../PrimeCatalogSearch/PrimeCatalogSearch';
import { PrimeTrainingsContainer } from '../PrimeTrainingsContainer';
import styles from './PrimeCatalogContainer.module.css';
import { closeSuggestionsList } from '../../../store/actions/search/actions';
import { useDispatch } from 'react-redux';
import { PrimeAccount, PrimeCatalog, PrimeLearningObject, PrimeUser } from '../../../models';
import { FILTER, JOB_AID_ID, JOBAID, LIST_VIEW, TILE_VIEW } from '../../../utils/constants';

import ViewList from '@spectrum-icons/workflow/ViewList';
import ClassicGridView from '@spectrum-icons/workflow/ClassicGridView';
import PrimeSelectedFiltersList from '../PrimeCatalogFilters/PrimeSelectedFiltersList';
import SortOrderDown from '@spectrum-icons/workflow/SortOrderDown';
import { ALMCustomPicker } from '../../Common/ALMCustomPicker';
import { getAvailableSortOptions } from '../../../utils/sort';
import { updateSortOrder } from '../../../store';
import { ALMGoToTop } from '../../ALMGoToTop';
import { useDeviceTypeContext } from '../../../contextProviders/DeviceContextProvider';
import { useDialog } from '../../../contextProviders/ALMDialogContextProvider';
import { ALMDialog, ALMDialogHeader } from '../../ALMDialog';
import store from '../../../../store/APIStore';
import { State } from '../../../store/state';
import { useUserContext } from '../../../contextProviders/userContextProvider';
import { getInitialView, isMyLearningPage, splitStringIntoArray } from '../../../utils/catalog';
import { getFilterLabel } from '../../../utils/filters';
import { useJobAids } from '../../../hooks/useJobAids';
import { PrimeEvent } from '../../../utils/widgets/common';
import {
  sendCatalogSkipLinks,
  CATALOG_MAIN_CONTENT_WIDGET_REF,
} from './PrimeCatalogContainer.utils';

const PrimeCatalogContainer = (props: any) => {
  const { user } = useUserContext() || {};
  const account = user?.account as PrimeAccount;
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
    resetFilters,
    metaData,
    areFiltersLoading,
    searchFilters,
    clearFilterSearch,
    autoCorrectMode,
    removeTrainingFromListById,
    updateFilterList,
    addBookmarkHandler,
    removeBookmarkHandler,
    hydrateSelectedCatalogs,
  } = useCatalog();
  const { formatMessage } = useIntl();

  const dispatch = useDispatch();
  const almConfig = getALMConfig();
  const hideSearchInput = almConfig.hideSearchInput;
  const params = getQueryParamsFromUrl();

  const { launchJobAid } = useJobAids({} as PrimeLearningObject);

  const deviceContext = useDeviceTypeContext();
  const { openDialog, closeDialog, isOpen } = useDialog();

  const [view, setView] = useState(getInitialView(account?.viewType || LIST_VIEW));

  const defaultCatalogHeading = useMemo(() => {
    const catalogHeader = GetTranslation('alm.catalog.header', true);
    return isTranslated(catalogHeader) ? catalogHeader : '';
  }, []);

  const [pageHeader, setPageHeader] = useState(defaultCatalogHeading);

  const {
    informalCount: socialLearningResultsCount,
    formalCount: formalResultsCount,
    contentMarketPlaceCount: contentMarketPlaceResultsCount,
    correctedQuery,
  } = metaData || {};
  const searchQuery = correctedQuery || query || '';

  const storeState = store.getState();
  const currentSelectedSortFromStore = storeState.catalog.sort;
  const sortOptions = getAvailableSortOptions(user?.account as PrimeAccount, GetTranslation);

  const hideSocialLearningResults = getALMConfig().learnerMobileApp;

  useEffect(() => {
    let pageHeaderTitle = '';
    if (query) {
      pageHeaderTitle = GetTranslation('alm.search.results.text');
      if (formalResultsCount !== undefined) {
        pageHeaderTitle += `: ${GetTranslationReplaced('alm.search.query.results.text', formalResultsCount || 0)}`;
      }
    } else {
      pageHeaderTitle = props.heading ? props.heading : defaultCatalogHeading;
    }
    setPageHeader(pageHeaderTitle);
  }, [query, props.heading, formalResultsCount]);

  useEffect(() => {
    const defaultSortOption = sortOptions?.defaultOption;
    dispatch(updateSortOrder(defaultSortOption));
    if (params && params[JOB_AID_ID] && getALMObject().isPrimeUserLoggedIn()) {
      document.addEventListener(PrimeEvent.ALM_TRAININGS_LOADED, handleJobAidParam);
    }
    // Hydrate selected catalog names (IDs not present in initial list)
    hydrateSelectedCatalogs();
  }, []);

  // On catalog<->search switch, reset the stored sort if it isn't valid for the new context (e.g. relevance in catalog, recommendationScore in search)
  useEffect(() => {
    const isCurrentSortValid = sortOptions.availableSortOptions.some(
      option => option.id === currentSelectedSortFromStore
    );
    if (!isCurrentSortValid) {
      dispatch(updateSortOrder(sortOptions.defaultOption));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleJobAidParam = () => {
    launchJobAid(`${JOBAID}:${params[JOB_AID_ID]}`);
    document.removeEventListener(PrimeEvent.ALM_TRAININGS_LOADED, handleJobAidParam);
  };

  const defaultCatalogDescription = useMemo(() => {
    const catalogSummary = GetTranslation('alm.text.catalog.summary', true);
    return isTranslated(catalogSummary) ? catalogSummary : '';
  }, []);

  const defaultMyLearningDescription = useMemo(() => {
    const myLearningSummary = GetTranslation('alm.text.myLearning.summary', true);
    return isTranslated(myLearningSummary) ? myLearningSummary : '';
  }, []);

  const listContainerCss = `${styles.listContainer} ${
    catalogAttributes?.showFilters !== 'true' && styles.full
  } `;

  const filtersCss = `${styles.filtersContainer} ${hideSearchInput ? styles.teamsExtraTopMargin : ''}`;

  const queryParams = getQueryParamsFromUrl();

  const getSelectedFilters = useMemo(() => {
    return (filterState: any) => {
      const selectedFilters = [];
      for (let qp in queryParams) {
        if (Object.hasOwnProperty.call(filterState, qp)) {
          const filterType = filterState[qp];
          if (filterType) {
            const filters = queryParams[qp];
            const filtersArr = splitStringIntoArray(filters);
            if (filterType.canSearch && filterType.type !== FILTER.CATALOGS) {
              const filterStateFromStore: { [key: string]: boolean } =
                storeState.catalog.filterState[filterType.type as never];
              let selectedFilterFromState = deviceContext.isDesktop
                ? { ...filterStateFromStore }
                : {
                    ...filterStateFromStore,
                    ...getSelectedOptionsForMobile(
                      filterType.type === FILTER.SKILL_NAME ? FILTER.SKILL_NAME : FILTER.TAG_NAME
                    ),
                  };
              Object.entries(selectedFilterFromState).forEach(([key, value]) => {
                if (value && key) {
                  selectedFilters.push({
                    labelToShow: key,
                    label: key,
                    filterType: qp,
                    checked: value,
                  });
                }
              });
            } else if (filterType.type === FILTER.CATALOGS) {
              // For desktop, derive selected catalog IDs from the store (Redux CSV string)
              // For mobile/tablet, derive from URL via getSelectedOptionsForMobile(FILTER.CATALOGS)
              let selectedCatalogIds: string[] = [];
              if (deviceContext.isDesktop) {
                const catalogsCsv = storeState.catalog.filterState.catalogs;
                selectedCatalogIds = catalogsCsv ? splitStringIntoArray(catalogsCsv) : [];
              } else {
                const mobileSelectedMap = getSelectedOptionsForMobile(FILTER.CATALOGS) || {};
                selectedCatalogIds = Object.keys(mobileSelectedMap);
              }
              const persistentCatalogs = storeState.catalog.selectedCatalogs || {};
              selectedCatalogIds.forEach((id: string) => {
                const persisted = persistentCatalogs[id];
                if (persisted && (persisted.name || persisted.id)) {
                  // Use catalog name when available; fall back to ID
                  selectedFilters.push({
                    checked: true,
                    filterType: qp,
                    labelToShow: persisted.name || persisted.id,
                    label: persisted.name || persisted.id,
                    data: { id },
                  });
                }
              });
            } else if (filterType.type === FILTER.PRICE_RANGE) {
              const labelObj = getFilterLabel(filters, filterType);
              const priceArr = filters.split('-');
              if (labelObj.label || labelObj.labelToShow) {
                selectedFilters.push({
                  checked: true,
                  filterType: qp,
                  labelToShow: labelObj.labelToShow,
                  label: labelObj.label,
                  data: {
                    start: priceArr[0],
                    end: priceArr[1],
                  },
                });
              }
            } else if (filtersArr?.length) {
              for (let filter of filtersArr) {
                const labelObj = getFilterLabel(filter, filterType);
                if (labelObj.label || labelObj.labelToShow) {
                  selectedFilters.push({
                    checked: true,
                    filterType: qp,
                    labelToShow: filterType.isListDynamic ? labelObj.label : labelObj.labelToShow,
                    label: labelObj.label,
                  });
                }
              }
            }
          }
        }
      }
      return selectedFilters;
    };
  }, [queryParams]);

  const filtersHtml =
    catalogAttributes?.showFilters === 'true' && account ? (
      <div className={filtersCss} id="alm-catalog-filters">
        <PrimeCatalogFilters
          filterState={filterState}
          updateFilters={updateFilters}
          catalogAttributes={catalogAttributes}
          updatePriceRangeFilter={updatePriceRangeFilter}
          account={account}
          resetFilterList={resetFilterList}
          resetFilters={resetFilters}
          areFiltersLoading={areFiltersLoading}
          user={user}
          searchFilters={searchFilters}
          clearFilterSearch={clearFilterSearch}
          updateFilterList={updateFilterList}
          getSelectedFilters={getSelectedFilters}
        ></PrimeCatalogFilters>
      </div>
    ) : (
      <></>
    );

  const filtersButtonForMobileHTML =
    catalogAttributes?.showFilters === 'true' ? (
      <>
        <button
          className={styles.filterAndSortButton}
          onClick={() => openDialog('alm-filters-dialog')}
          data-automationid="applyFiltersOnMobile"
          aria-label={formatMessage({
            id: 'alm.catalog.filter',
            defaultMessage: 'Filters',
          })}
        >
          <>
            <Filter />
            {getSelectedFilters(filterState).length > 0 && (
              <View UNSAFE_className={styles.filterCount}>
                {getSelectedFilters(filterState).length}
              </View>
            )}
          </>
        </button>
      </>
    ) : null;

  const sortButtonForMobileHTML = useMemo(() => {
    return (
      <button
        className={styles.filterAndSortButton}
        onClick={() => openDialog('alm-sort-dialog')}
        data-automationid="applyFiltersOnMobile"
        aria-label={GetTranslation('alm.picker.sortBy')}
      >
        <SortOrderDown />
      </button>
    );
  }, []);

  const gridButtonTitle = useMemo(() => GetTranslation('alm.grid.view.aria', true), []);
  const listButtonTitle = useMemo(() => GetTranslation('alm.list.view.aria', true), []);
  const clearButtonTitle = useMemo(
    () => GetTranslation('alm.community.search.clear.label', true),
    []
  );

  const renderChangeLayoutHTML = () => {
    return (
      <div className={styles.changeLayoutContainer}>
        <button
          className={`${styles.viewButton} ${view === TILE_VIEW ? styles.selectedView : ''}`}
          onClick={() => setTrainingsLayout(TILE_VIEW, setView)}
          data-automationid="trainingsTileView"
          title={gridButtonTitle}
          aria-label={gridButtonTitle}
          aria-pressed={view === TILE_VIEW}
        >
          <ClassicGridView />
        </button>
        <button
          className={`${styles.viewButton} ${view === LIST_VIEW ? styles.selectedView : ''}`}
          onClick={() => setTrainingsLayout(LIST_VIEW, setView)}
          data-automationid="trainingsListView"
          title={listButtonTitle}
          aria-label={listButtonTitle}
          aria-pressed={view === LIST_VIEW}
        >
          <ViewList />
        </button>
      </div>
    );
  };

  const searchHtml =
    catalogAttributes?.showSearch === 'true' ? (
      <PrimeCatalogSearch
        query={query}
        handleSearch={handleSearch}
        getSearchSuggestions={getSearchSuggestions}
        updateSnippet={updateSnippet}
        autoCorrectMode={autoCorrectMode}
      />
    ) : (
      ''
    );

  const searchContainerHTML = (
    <div className={styles.searchContainer} data-automationid="catalogSearchContainer">
      {searchHtml}
    </div>
  );

  const handleSelectedOption = useCallback(
    (selectedOptionId: string) => {
      dispatch(updateSortOrder(selectedOptionId));
      updateURLParams({ sort: selectedOptionId });
    },
    [dispatch]
  );

  const renderSortPickerHTML = () => {
    return deviceContext.isDesktop ? (
      <ALMCustomPicker
        options={sortOptions.availableSortOptions}
        onOptionSelected={handleSelectedOption}
        defaultSelectedOptionId={sortOptions.defaultOption}
      ></ALMCustomPicker>
    ) : (
      <ListBox
        selectionMode="single"
        items={sortOptions.availableSortOptions}
        selectedKeys={new Set([currentSelectedSortFromStore])}
        onSelectionChange={selected => {
          const selectedSort = Array.from(selected);
          if (selectedSort.length === 0) {
            closeDialog('alm-sort-dialog');
            return;
          }
          handleSelectedOption(selectedSort[0].toString());
          closeDialog('alm-sort-dialog');
        }}
      >
        {item => <Item key={item.id}>{item.name}</Item>}
      </ListBox>
    );
  };

  const canShowClearButton = formalResultsCount !== undefined && !almConfig.hideSearchClearButton;
  const clearButtonPlacement = canShowClearButton
    ? socialLearningResultsCount > 0 && !hideSocialLearningResults
      ? 'withSocial'
      : 'withQuery'
    : null;

  const renderClearSearchButton = () => (
    <button
      className={`${styles.clearSearch} ${clearButtonPlacement === 'withQuery' ? styles.withQuery : ''}`}
      onClick={resetSearch}
      data-automationid="closeSearch"
      aria-label={clearButtonTitle}
    >
      {CLOSE_SVG()}
    </button>
  );

  const renderSearchResultsDescription = () => (
    <>
      <div>
        {!hideSocialLearningResults && socialLearningResultsCount > 0 && (
          <>
            <span className={styles.searchLink}>
              <a
                href="#"
                onClick={() => getALMObject().navigateToSocial(`/search?searchString=${query}`)}
                data-automationid="search-social-link"
              >
                {GetTranslationReplaced(
                  'alm.search.social.results',
                  socialLearningResultsCount,
                  true
                )}
              </a>
            </span>
          </>
        )}
        {clearButtonPlacement === 'withSocial' && renderClearSearchButton()}
      </div>
      <div>
        {correctedQuery && (
          <span className={styles.searchLink}>
            {GetTranslation('alm.search.instead.for.text')}"
            <a href="javascript:void(0)" onClick={() => handleSearch(query, false)}>
              {query}
            </a>
            "
          </span>
        )}
      </div>
    </>
  );

  const isMyLearning = isMyLearningPage();
  const isQueryPresent = Boolean(query);
  const defaultDescription =
    isMyLearning && canShowExternalLearning(account)
      ? defaultMyLearningDescription
      : defaultCatalogDescription;
  const description = isQueryPresent ? null : (props.description ?? defaultDescription);
  const searchDescription = isQueryPresent ? renderSearchResultsDescription() : null;
  const headerCssForSearch = isQueryPresent ? styles.searchHeader : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      sendCatalogSkipLinks();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={'light'}>
        <div className={styles.pageContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.header}>
              <div
                data-skip-link-target={CATALOG_MAIN_CONTENT_WIDGET_REF}
                tabIndex={-1}
                data-skip="skip-target"
              >
                <Heading
                  level={1}
                  UNSAFE_className={`${styles.label} ${headerCssForSearch}`}
                  data-automationid="catalogHeading"
                >
                  {pageHeader}

                  {formalResultsCount !== undefined && searchQuery && (
                    <span className={styles.queryText}>
                      "{searchQuery}"
                      {clearButtonPlacement === 'withQuery' && renderClearSearchButton()}
                    </span>
                  )}
                </Heading>
              </div>
              {!hideSearchInput && searchContainerHTML}
            </div>

            <div className={styles.descriptionContainer}>
              <div className={styles.catalogDescription} data-automationid="catalogDescription">
                <span dangerouslySetInnerHTML={{ __html: description }} />
                {searchDescription}
              </div>
              {deviceContext.isDesktop && isMyLearning && canShowExternalLearning(account) && (
                <button
                  className={styles.externalLearningBtn}
                  onClick={() => getALMObject().navigateToExternalLearningPage()}
                >
                  {EXTERNAL_LEARNING_ICON()}
                  {GetTranslation('alm.text.externalLearning', true)}
                </button>
              )}
            </div>
            {(deviceContext.isMobile || deviceContext.isTablet) &&
              isMyLearning &&
              canShowExternalLearning(account) && (
                <div className={styles.mobileExternalLearning}>
                  <button
                    className={styles.externalLearningBtn}
                    onClick={() => getALMObject().navigateToExternalLearningPage()}
                  >
                    {EXTERNAL_LEARNING_ICON()}
                    {GetTranslation('alm.text.externalLearning', true)}
                  </button>
                </div>
              )}
            {deviceContext.isMobile || deviceContext.isTablet ? (
              <>
                <div className={styles.mobileButtonsContainer}>
                  {renderChangeLayoutHTML()}
                  <div className={styles.filterAndSortContainer}>
                    {sortButtonForMobileHTML} {filtersButtonForMobileHTML}
                    {isOpen('alm-sort-dialog') && (
                      <ALMDialog
                        id="alm-sort-dialog"
                        height={30}
                        stickyPosition={true}
                        overlayClose={true}
                        borderRadius={deviceContext.isMobile ? 'top' : 'all'}
                      >
                        <ALMDialogHeader>
                          <Heading level={3} UNSAFE_className={styles.almDialogTitle}>
                            {GetTranslation('alm.community.board.sortBy')}
                          </Heading>
                        </ALMDialogHeader>
                        {renderSortPickerHTML()}
                      </ALMDialog>
                    )}
                  </div>
                </div>
                <Divider size="M" />
              </>
            ) : null}

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
              aria-hidden={isOpen('alm-filters-dialog') ? 'true' : 'false'}
              data-automationid="catalogTrainingsContainer"
            >
              {deviceContext.isDesktop && (
                <div className={styles.sortAndChangeLayoutContainer}>
                  <div className={styles.sortContainer}>
                    <div className={styles.sortText}>{GetTranslation('alm.picker.sortBy')}</div>
                    <div className={styles.picker} data-automationid="sortType">
                      {renderSortPickerHTML()}
                    </div>
                  </div>
                  {renderChangeLayoutHTML()}
                </div>
              )}
              {deviceContext.isDesktop && (
                <PrimeSelectedFiltersList
                  updateFilters={updateFilters}
                  updatePriceRangeFilter={updatePriceRangeFilter}
                  selectedFilters={getSelectedFilters(filterState)}
                />
              )}
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
                  removeTrainingFromListById={removeTrainingFromListById}
                  addBookmarkHandler={addBookmarkHandler}
                  removeBookmarkHandler={removeBookmarkHandler}
                ></PrimeTrainingsContainer>
              )}
              {isLoading ? <ALMLoader classes={styles.loader} /> : ''}
            </div>
          </div>

          <ALMGoToTop />
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeCatalogContainer;
