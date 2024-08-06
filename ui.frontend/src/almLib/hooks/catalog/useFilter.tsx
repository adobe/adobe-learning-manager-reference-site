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
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { loadUserSkills, updateFiltersOnLoad } from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import {
  ActionMap,
  ACTION_MAP,
  filtersDefaultState,
  FilterState,
  FilterType,
  UpdateFiltersEvent,
  userSkillsList,
  searchFilterValue,
} from "../../utils/filters";
import {
  getALMConfig,
  getALMObject,
  getQueryParamsFromUrl,
  needsLearnerDesktopUrlChange,
  updateURLParams,
  getALMAttribute,
} from "../../utils/global";
import { convertToReactParams } from "../../utils/urlConv";
import {
  convertStringToObject,
  debounce,
  getFilterNames,
  filterObjectByTruthyValues,
  getTruePropertiesAsString,
  hasKeys,
} from "../../utils/catalog";
import { RestAdapter } from "../../utils/restAdapter";
import store from "../../../store/APIStore";
import { GetTranslation } from "../../utils/translationService";
import { FILTER } from "../../utils/constants";

const FILTER_TYPE_TO_API_PARAM: { [key: string]: string } = {
  skillName: "skill",
  tagName: "tag",
};

export const useFilter = (props?: any) => {
  const emptyFilterState = {} as FilterState;
  const [learnerDesktopParamsConverted, setLearnerDesktopParamsConverted] = useState(false);
  const [filterState, setFilterState] = useState(() => emptyFilterState);
  const filtersFromState = useSelector((state: State) => state.catalog.filterState);
  let selectedSkills = useSelector((state: State) => state.catalog.filterState.skillName);
  const isLearnerDesktopApp = getALMConfig().learnerDesktopApp;
  ///------------ Handling Learner Desktop URI conversion ------------
  var queryParams = getQueryParamsFromUrl();
  if (queryParams.instancePage) {
    window.history.replaceState(null, "", "/catalog/index?");
    getALMObject().navigateToInstancePage(queryParams.instancePage);
  }
  //----------------------------------------------
  const [areFiltersLoading, setAreFiltersLoading] = useState(true);
  const dispatch = useDispatch();

  const setFiltersAndDispatch = (
    data: UpdateFiltersEvent,
    filters: FilterType,
    payload: any,
    urlParams?: string,
    isResetFilter?: boolean
  ) => {
    const queryParams = urlParams || (hasKeys(payload) ? payload : "");
    if (!isResetFilter) {
      updateURLParams({ [data.filterType as string]: queryParams });
    }
    setFilterState({ ...filterState, [data.filterType]: { ...filters } });
    const action = ACTION_MAP[data.filterType as keyof ActionMap];

    if (action && action instanceof Function) dispatch(action(payload));
  };

  const selectUserSkills = async (
    data: UpdateFiltersEvent,
    payload: string,
    isMySkillChecked: boolean
  ) => {
    const {
      catalog: { userSkills },
    } = store.getState();
    const mySkillsLabel = GetTranslation("alm.text.mySkills", true);
    let payloadForSearchableFilters;
    if (isMySkillChecked) {
      payloadForSearchableFilters = { ...userSkills, ...selectedSkills };
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
    setFiltersAndDispatch(data, filterState.skillName, payloadForSearchableFilters, payload);
  };

  const updateFilters = (data: UpdateFiltersEvent, setToFalse?: boolean, isResetFilter = false) => {
    const filters = setToFalse
      ? filtersDefaultState[data.filterType as keyof FilterState]
      : filterState[data.filterType as keyof FilterState]!;
    let payload = "";
    let payloadForSearchableFilters: { [key: string]: boolean } = {};

    if (data.label === GetTranslation("alm.text.mySkills", true)) {
      selectUserSkills(data, payload, data.checked!);
      return;
    }

    filters.list?.forEach(item => {
      if (item.label === data.label) {
        item.checked = setToFalse ? false : !item.checked;
      }
      if (item.checked && item.value) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
        payloadForSearchableFilters[item.value] = true;
      } else if (filters.canSearch && item.value) {
        payloadForSearchableFilters[item.value] = false;
      }
    });

    if (filters.canSearch) {
      const selectedItems: { [key: string]: boolean } =
        store.getState().catalog.filterState?.[data.filterType as never];
      payloadForSearchableFilters = { ...selectedItems, ...payloadForSearchableFilters };
      payloadForSearchableFilters = filterObjectByTruthyValues(payloadForSearchableFilters);
      payload = getTruePropertiesAsString(payloadForSearchableFilters);
      setFiltersAndDispatch(data, filters, payloadForSearchableFilters, payload);
      return;
    }

    setFiltersAndDispatch(data, filters, payload, undefined, isResetFilter);
  };

  const updatePriceRangeFilter = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof FilterState]!;
    let payload = `${data.data.start}-${data.data.end}`;
    if (filters.list?.length) {
      filters.list[0].value = data.data.start;
      filters.list[1].value = data.data.end;
    }
    setFiltersAndDispatch(data, filters, payload);
  };

  const getUserSkills = async (isMyLearning: boolean) => {
    const catalogAttributes = getALMAttribute("catalogAttributes") || {};
    let userSkills: string[] | null = [];
    if (catalogAttributes?.skillName && !isMyLearning) {
      userSkills = await userSkillsList();
    }
    return userSkills;
  };

  useEffect(() => {
    //props is only sent when useFilter hook is used to resetFilters
    if (!props || !props.isResetFilters) {
      const getFilters = async () => {
        try {
          const filters = await APIServiceInstance.getFilters();
          setFilterState(filters);
          setAreFiltersLoading(false);
          const isMyLearning = queryParams.myLearning === "true";
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
      getFilters();
      queryParams = getQueryParamsFromUrl(); // get updated query params
      const updatedFilters = { ...filtersFromState, ...queryParams };
      if (updatedFilters.skillName && hasKeys(updatedFilters.skillName)) {
        updatedFilters.skillName = convertStringToObject(updatedFilters.skillName as any);
      }
      if (updatedFilters.tagName && hasKeys(updatedFilters.tagName)) {
        updatedFilters.tagName = convertStringToObject(updatedFilters.tagName as any);
      }
      dispatch(updateFiltersOnLoad(updatedFilters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilterList = (filterType: string) => {
    updateURLParams({ [filterType as string]: "" });
    const filters = filterState[filterType as keyof FilterState]!;
    filters.list?.forEach(item => (item.checked = false));
    setFilterState({ ...filterState, [filterType]: { ...filters } });
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
    const selectedItemsFromStore: { [key: string]: boolean } =
      store.getState().catalog.filterState[type as never];
    const response = await searchFilterValue(query, FILTER_TYPE_TO_API_PARAM[type]);
    const listType = type === FILTER.SKILL_NAME ? "skillList" : "tagList";
    const list = response
      ? response[listType]?.map((item: any) => {
          return {
            label: item.name,
            value: item.name,
            checked: selectedItemsFromStore[item.name] || false,
          };
        })
      : [];
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
    if (optionsFromWindow) {
      allFilterOptions = optionsFromWindow;
    } else {
      const allOptionsResponse = await RestAdapter.get({
        url: `${baseApiUrl}data?filter.${filterType}=true&page[limit]=100`,
      });
      allFilterOptions = getFilterNames(allOptionsResponse) || [];
    }

    let optionsList: any[] = [];
    const selectedOptions: { [key: string]: boolean } =
      store.getState().catalog.filterState[filterType as never];
    if (filterType === FILTER.SKILL_NAME) {
      optionsList = [
        {
          value: "",
          label: GetTranslation("alm.text.mySkills", true),
          checked: false,
        },
      ];
    }
    let list = allFilterOptions?.map((item: any) => {
      const isOptionSelected = selectedOptions[item] || false;

      return {
        value: item,
        label: item,
        checked: isOptionSelected || false,
      };
    });
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
    searchFilters,
    clearFilterSearch,
  };
};
