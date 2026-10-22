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
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import APIServiceInstance from '../../common/APIService';
import {
  clearAllFilters,
  loadUserSkills,
  updateAllFilters,
  updateFiltersOnLoad,
} from '../../store/actions/catalog/action';
import { State } from '../../store/state';
import {
  ActionMap,
  ACTION_MAP,
  filtersDefaultState,
  FilterState,
  FilterType,
  UpdateFiltersEvent,
  userSkillsList,
  FilterListObject,
  buildListItem,
} from '../../utils/filters';
import {
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  isBookmarksEnabled,
  needsLearnerDesktopUrlChange,
  updateURLParams,
  getALMAttribute,
  getDefaultFilterValues,
  getSelectedOptionsForMobile,
} from '../../utils/global';
import { convertToReactParams } from '../../utils/urlConv';
import {
  convertStringToObject,
  debounce,
  getFilterNames,
  filterObjectByTruthyValues,
  getTruePropertiesAsString,
  hasKeys,
  isMyLearningPage,
} from '../../utils/catalog';
import { RestAdapter } from '../../utils/restAdapter';
import store from '../../../store/APIStore';
import { GetTranslation } from '../../utils/translationService';
import { FILTER } from '../../utils/constants';
import { useDeviceTypeContext } from '../../contextProviders/DeviceContextProvider';
import { CatalogFilterState } from '../../store/reducers/catalog';
import { JsonApiParse } from '../../utils/jsonAPIAdapter';

// Build the currently selected options map for a given filter type from the Redux store
// - For catalogs, the store keeps a comma-separated string; convert it to { id: true }
// - For other types, the store already has a boolean map; fall back to {}
const getSelectedItemsFromStore = (filterType: string): { [key: string]: boolean } => {
  if (filterType === FILTER.CATALOGS) {
    const catalogsString = (store.getState().catalog.filterState.catalogs as string) || '';
    const map: { [key: string]: boolean } = {};
    catalogsString
      .split(',')
      .filter(Boolean)
      .forEach((id: string) => (map[id] = true));
    return map;
  }
  return (
    (store.getState().catalog.filterState?.[filterType as never] as unknown as {
      [key: string]: boolean;
    }) || {}
  );
};

export const useFilter = (props?: any) => {
  const deviceContext = useDeviceTypeContext();
  const emptyFilterState = {} as FilterState;
  const [learnerDesktopParamsConverted, setLearnerDesktopParamsConverted] = useState(false);
  const [filterState, setFilterState] = useState(() => emptyFilterState);
  const [filterPayload, setFilterPayload] = useState<{ [key: string]: string }>({});
  const filtersFromState = useSelector((state: State) => state.catalog.filterState);
  let selectedSkills = useSelector((state: State) => state.catalog.filterState.skillName);
  const isLearnerDesktopApp = getALMConfig().learnerDesktopApp;
  ///------------ Handling Learner Desktop URI conversion ------------
  var queryParams = getQueryParamsFromUrl();
  if (queryParams.instancePage) {
    window.history.replaceState(null, '', '/catalog/index?');
    getALMObject().navigateToInstancePage(queryParams.instancePage);
  }
  //----------------------------------------------
  const [areFiltersLoading, setAreFiltersLoading] = useState(true);
  const dispatch = useDispatch();

  const setFilters = (
    data: UpdateFiltersEvent,
    filters: FilterType,
    payload: any,
    urlParams?: string,
    isResetFilter?: boolean
  ) => {
    const queryParams = urlParams || (hasKeys(payload) ? payload : '');
    if (!isResetFilter) {
      updateURLParams({ [data.filterType as string]: queryParams });
    }
    setFilterState({ ...filterState, [data.filterType]: { ...filters } });
  };

  const dispatchFilters = (data: UpdateFiltersEvent, payload: any) => {
    const action = ACTION_MAP[data.filterType as keyof ActionMap];
    if (action && action instanceof Function) dispatch(action(payload));
  };

  const setFiltersAndDispatch = (
    data: UpdateFiltersEvent,
    filters: FilterType,
    payload: any,
    urlParams?: string,
    isResetFilter?: boolean
  ) => {
    setFilters(data, filters, payload, urlParams, isResetFilter);
    dispatchFilters(data, payload);
  };

  const selectUserSkills = async (
    data: UpdateFiltersEvent,
    payload: string,
    isMySkillChecked: boolean
  ) => {
    // If bookmarks is enabled and we're selecting My Skills, remove bookmarks from URL
    if (isBookmarksEnabled() && isMySkillChecked) {
      updateURLParams({ bookmarks: '' });
    }
    const {
      catalog: { userSkills },
    } = store.getState();
    const mySkillsLabel = GetTranslation('alm.text.mySkills', true);
    let payloadForSearchableFilters;
    if (isMySkillChecked) {
      payloadForSearchableFilters = deviceContext.isDesktop
        ? { ...userSkills, ...selectedSkills }
        : { ...userSkills };
    } else {
      Object.keys(userSkills).forEach(key => {
        selectedSkills[key] = false;
      });
      payloadForSearchableFilters = { ...selectedSkills };
    }
    payloadForSearchableFilters = filterObjectByTruthyValues(payloadForSearchableFilters);
    payload = getTruePropertiesAsString(payloadForSearchableFilters);

    const updatedSkillList = (filterState.skillName.list || []).map((item: any) => {
      const shouldItemBeChecked =
        (item.label === mySkillsLabel && isMySkillChecked) ||
        (item.value && payload?.includes(item.value));
      const shouldIncludeInPayload = shouldItemBeChecked;

      return {
        ...item,
        checked: shouldIncludeInPayload,
      };
    });
    filterState.skillName.list = updatedSkillList;
    if (deviceContext.isDesktop) {
      setFiltersAndDispatch(data, filterState.skillName, payloadForSearchableFilters, payload);
    } else {
      setFilters(data, filterState.skillName, payloadForSearchableFilters, payload);
    }
  };

  const updateFilters = (data: UpdateFiltersEvent, setToFalse?: boolean, isResetFilter = false) => {
    const filters = setToFalse
      ? filtersDefaultState[data.filterType as keyof FilterState]
      : filterState[data.filterType as keyof FilterState]!;
    let tempPayload = '';
    let payloadForSearchableFilters: { [key: string]: boolean } = {};

    if (data.label === GetTranslation('alm.text.mySkills', true)) {
      selectUserSkills(data, tempPayload, data.checked!);
      return;
    }
    // If bookmarks is enabled and we're selecting a filter, remove bookmarks from URL
    if (isBookmarksEnabled() && !setToFalse) {
      updateURLParams({ bookmarks: '' });
    }
    filters.list?.forEach(item => {
      const isCatalogFilter = data.filterType === FILTER.CATALOGS;
      const matchesLabel = item.label === data.label;
      const matchesValueForCatalog = isCatalogFilter && String(item.value) === String(data.label);
      const isToggledItem = matchesLabel || matchesValueForCatalog;
      if (isToggledItem) {
        item.checked = setToFalse ? false : !item.checked;
      }
      if (item.checked && item.value) {
        tempPayload = tempPayload ? `${tempPayload},${item.value}` : `${item.value}`;
        payloadForSearchableFilters[item.value] = true;
        if (isCatalogFilter && isToggledItem) {
          dispatch({
            type: 'UPDATE_SELECTED_CATALOGS',
            payload: { [String(item.value)]: { id: String(item.value), name: String(item.label) } },
          });
        }
      } else if (filters.canSearch && isToggledItem && item.value) {
        // Only mark the toggled-off item as false instead of every unchecked option
        payloadForSearchableFilters[item.value] = false;
        if (isCatalogFilter) {
          dispatch({
            type: 'UPDATE_SELECTED_CATALOGS',
            payload: { [String(item.value)]: { id: String(item.value) } },
          });
        }
      }
    });

    // For searchable filters, merge with previously selected items
    // (from store on desktop or local state on mobile) to preserve selections across searches.
    if (filters.canSearch) {
      const selectedItems: { [key: string]: boolean } = deviceContext.isDesktop
        ? getSelectedItemsFromStore(data.filterType)
        : getSelectedOptionsForMobile(data.filterType);
      // If attempting to remove an item that is not present in the current list
      // (common for searchable filters like skills/tags when the list shows another search),
      // explicitly mark it as false so it can be removed from the payload
      if (filters.canSearch && data.label) {
        const listValues = new Set(
          (filters.list || []).map((i: FilterListObject) => String(i.value))
        );
        if (!listValues.has(String(data.label))) {
          payloadForSearchableFilters[String(data.label)] = false;
        }
      }
      // Merge previous selections with current toggle updates, then
      // normalize: keep only truthy selections and compute CSV string.
      payloadForSearchableFilters = { ...selectedItems, ...payloadForSearchableFilters };
      payloadForSearchableFilters = filterObjectByTruthyValues(payloadForSearchableFilters);
      tempPayload = getTruePropertiesAsString(payloadForSearchableFilters);
      setFilterPayload({ [data.filterType]: tempPayload });
      if (deviceContext.isDesktop) {
        // For catalogs: dispatch string; for others: dispatch boolean map
        const dispatchPayload =
          data.filterType === FILTER.CATALOGS ? tempPayload : payloadForSearchableFilters;
        setFiltersAndDispatch(data, filters, dispatchPayload, tempPayload);
      } else {
        setFilters(data, filters, payloadForSearchableFilters, tempPayload);
      }
      return;
    }
    setFilterPayload({ [data.filterType]: tempPayload });
    if (deviceContext.isDesktop) {
      setFiltersAndDispatch(data, filters, tempPayload, undefined, isResetFilter);
    } else {
      setFilters(data, filters, tempPayload, undefined, isResetFilter);
    }
  };

  const updatePriceRangeFilter = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof FilterState]!;
    let payload =
      data.data.start === 0 && data.data.end === 0 ? '' : `${data.data.start}-${data.data.end}`;

    // If bookmarks is enabled and we're updating price range, remove bookmarks from URL
    if (isBookmarksEnabled()) {
      updateURLParams({ bookmarks: '' });
    }

    if (filters.list?.length) {
      filters.list[0].value = data.data.start;
      filters.list[1].value = data.data.end;
    }
    if (deviceContext.isDesktop) {
      setFiltersAndDispatch(data, filters, payload);
    } else {
      setFilters(data, filters, payload);
    }
  };

  const getUserSkills = async (isMyLearning: boolean) => {
    const isPrimeUserLoggedIn = getALMObject().isPrimeUserLoggedIn();
    const catalogAttributes = getALMAttribute('catalogAttributes') || {};
    let userSkills: string[] | null = [];
    if (catalogAttributes?.skillName && !isMyLearning && isPrimeUserLoggedIn) {
      userSkills = await userSkillsList();
    }
    return userSkills;
  };

  const getFilters = async () => {
    try {
      const filters = await APIServiceInstance.getFilters();
      setFilterState(filters);
      setAreFiltersLoading(false);
      const isMyLearning = isMyLearningPage();
      const userSkills = await getUserSkills(isMyLearning);
      if (userSkills) {
        const userSkillsObj = userSkills.reduce((obj: any, skill) => {
          obj[skill] = true;
          return obj;
        }, {});
        dispatch(loadUserSkills(userSkillsObj));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //props is only sent when useFilter hook is used to resetFilters
    if (!props || !props.isResetFilters) {
      getFilters();
      queryParams = getQueryParamsFromUrl(); // get updated query params
      const updatedFilters = { ...filtersFromState, ...filterPayload, ...queryParams };
      if (
        updatedFilters.skillName &&
        hasKeys(updatedFilters.skillName) &&
        typeof updatedFilters.skillName === 'string'
      ) {
        updatedFilters.skillName = convertStringToObject(updatedFilters.skillName as any);
      }
      if (
        updatedFilters.tagName &&
        hasKeys(updatedFilters.tagName) &&
        typeof updatedFilters.tagName === 'string'
      ) {
        updatedFilters.tagName = convertStringToObject(updatedFilters.tagName as any);
      }
      dispatch(updateFiltersOnLoad(updatedFilters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilterList = () => {
    queryParams = getQueryParamsFromUrl(); // get updated query params
    const updatedFilters = deviceContext.isDesktop
      ? { ...filtersFromState, ...filterPayload, ...queryParams }
      : { ...getDefaultFilterValues(), ...queryParams };
    if (
      updatedFilters.skillName &&
      hasKeys(updatedFilters.skillName) &&
      typeof updatedFilters.skillName === 'string'
    ) {
      updatedFilters.skillName = convertStringToObject(updatedFilters.skillName as any);
    }
    if (
      updatedFilters.tagName &&
      hasKeys(updatedFilters.tagName) &&
      typeof updatedFilters.tagName === 'string'
    ) {
      updatedFilters.tagName = convertStringToObject(updatedFilters.tagName as any);
    }
    dispatch(updateAllFilters(updatedFilters));
  };

  const resetFilterList = (filterType: string) => {
    updateURLParams({ [filterType as string]: '' });
    const filters = filterState[filterType as keyof FilterState]!;
    filters.list?.forEach(item => (item.checked = false));
    setFilterState({ ...filterState, [filterType]: { ...filters } });
  };

  const resetFilters = (filtersToExclude?: UpdateFiltersEvent[]) => {
    if (isBookmarksEnabled()) {
      updateURLParams({ bookmarks: '' });
    }
    Object.keys(filterState).forEach((filterType: string) => {
      if (filterState[filterType as keyof FilterState]) {
        resetFilterList(filterType);
      }
    });
    dispatch(clearAllFilters());
    dispatch(updateAllFilters(getDefaultFilterValues()));
    if (filtersToExclude && filtersToExclude.length > 0) {
      filtersToExclude.forEach((filter: UpdateFiltersEvent) => {
        updateFilters(filter);
      });
    }
  };

  const getReactQueryParams = (queryParams: any) => {
    queryParams = convertToReactParams(queryParams);
    const url = new URL(window.location.href);
    if (needsLearnerDesktopUrlChange(url.hash)) {
      updateURLParams(queryParams);
      setLearnerDesktopParamsConverted(true);
    }
    return queryParams;
  };

  const computedFilters = useMemo(() => {
    let queryParams = getQueryParamsFromUrl();
    if (isLearnerDesktopApp && !learnerDesktopParamsConverted) {
      queryParams = getReactQueryParams(queryParams);
    }
    if (queryParams.skillName && hasKeys(queryParams.skillName)) {
      queryParams.skillName = convertStringToObject(queryParams.skillName as any);
    }
    if (queryParams.tagName && hasKeys(queryParams.tagName)) {
      queryParams.tagName = convertStringToObject(queryParams.tagName as any);
    }
    return { ...filtersFromState, ...queryParams };
  }, [filtersFromState]);

  const searchFilters = debounce(async (query: string, type: string) => {
    if (query.length === 0) {
      clearFilterSearch(type);
      return;
    }
    if (query.length < 3) {
      return;
    }
    setFilterState({
      ...filterState,
      [type as keyof typeof filterState]: {
        ...filterState[type as keyof typeof filterState],
        isLoading: true,
      },
    });
    const selectedItemsFromStore: { [key: string]: boolean } = deviceContext.isDesktop
      ? getSelectedItemsFromStore(type)
      : getSelectedOptionsForMobile(type);
    const list = await APIServiceInstance.getSearchFilterList(query, type, selectedItemsFromStore);
    setFilterState({
      ...filterState,
      [type as keyof typeof filterState]: {
        ...filterState[type as keyof typeof filterState],
        isLoading: false,
        list,
      },
    });
  });

  const clearFilterSearch = async (filterType: string) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const guest = !getALMObject().isPrimeUserLoggedIn();
    setFilterState({
      ...filterState,
      [filterType as keyof typeof filterState]: {
        ...filterState[filterType as keyof typeof filterState],
        isLoading: true,
        filterType,
      },
    });
    //save in window object else call API
    let allFilterOptions: any = [];
    const optionsFromWindow = getALMAttribute(filterType);
    if (guest || optionsFromWindow) {
      allFilterOptions = optionsFromWindow || [];
    } else {
      // Build API URL for fetching options: catalogs use the catalogs endpoint,
      // other filter types use the generic data endpoint with a filter param.
      let apiUrl: string;
      if (filterType === FILTER.CATALOGS) {
        apiUrl = `${baseApiUrl}catalogs?page[limit]=100`;
      } else {
        apiUrl = `${baseApiUrl}data?filter.${filterType}=true&page[limit]=100`;
      }
      // Retrieve all options for the selected filter type
      const allOptionsResponse = await RestAdapter.get({
        url: apiUrl,
      });
      if (filterType === FILTER.CATALOGS) {
        // Catalogs are JSON:API; normalize to an array of { id, name }
        const parsedResponse = JsonApiParse(allOptionsResponse);
        allFilterOptions =
          parsedResponse?.catalogList?.map((item: any) => ({
            id: item.id,
            name: item.name,
          })) || [];
      } else {
        // Non-catalog filters: extract the list of names directly
        allFilterOptions = getFilterNames(allOptionsResponse) || [];
      }
    }

    let optionsList: any[] = [];
    const selectedOptions: { [key: string]: boolean } = deviceContext.isDesktop
      ? getSelectedItemsFromStore(filterType)
      : getSelectedOptionsForMobile(filterType);
    if (filterType === FILTER.SKILL_NAME && !guest) {
      optionsList = [
        {
          value: '',
          label: GetTranslation('alm.text.mySkills', true),
          checked: false,
        },
      ];
    }
    let list = allFilterOptions?.map((item: any) =>
      buildListItem(filterType, item, selectedOptions)
    );
    list = [...optionsList, ...list];
    setFilterState({
      ...filterState,
      [filterType as keyof typeof filterState]: {
        ...filterState[filterType as keyof typeof filterState],
        isLoading: false,
        list,
      },
    });
  };

  return {
    filterState,
    updateFilters,
    areFiltersLoading,
    filters: computedFilters,
    updatePriceRangeFilter,
    setFilterState,
    resetFilterList,
    resetFilters,
    searchFilters,
    clearFilterSearch,
    updateFilterList,
  };
};
