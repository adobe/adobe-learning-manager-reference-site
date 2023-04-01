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
import { updateFiltersOnLoad } from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import {
  ActionMap,
  ACTION_MAP,
  filtersDefaultState,
  FilterState,
  FilterType,
  UpdateFiltersEvent,
} from "../../utils/filters";
import { getQueryParamsFromUrl, updateURLParams } from "../../utils/global";

export const useFilter = () => {
  const emptyFilterState = {} as FilterState;
  const [filterState, setFilterState] = useState(() => emptyFilterState);
  const filtersFromState = useSelector(
    (state: State) => state.catalog.filterState
  );
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const setFiltersAndDispatch = (
    data: UpdateFiltersEvent,
    filters: FilterType,
    payload: string
  ) => {
    updateURLParams({ [data.filterType as string]: payload });
    setFilterState({ ...filterState, [data.filterType]: { ...filters } });
    const action = ACTION_MAP[data.filterType as keyof ActionMap];

    if (action && action instanceof Function) dispatch(action(payload));
  };

  const updateFilters = (data: UpdateFiltersEvent, setToFalse?: boolean) => {
    const filters = setToFalse ? filtersDefaultState[data.filterType as keyof FilterState] : filterState[data.filterType as keyof FilterState]!;
    let payload = "";

    filters.list?.forEach((item) => {
      if (item.label === data.label) {
        item.checked = setToFalse ? false : !item.checked;
      }
      if (item.checked) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
      }
    });
    setFiltersAndDispatch(data, filters, payload);
  };

  const updatePriceFilter = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof FilterState]!;
    let payload = `${data.data.start}-${data.data.end}`;
    if (filters.list?.length) {
      filters.list[0].value = data.data.start;
      filters.list[1].value = data.data.end;
    }
    setFiltersAndDispatch(data, filters, payload);
  };

  useEffect(() => {
    const queryParams = getQueryParamsFromUrl();
    const getFilters = async () => {
      try {
        const filters = await APIServiceInstance.getFilters();
        setFilterState(filters);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getFilters();
    //update state merged with filters in url
    const updatedFilters = { ...filtersFromState, ...queryParams };
    dispatch(updateFiltersOnLoad(updatedFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computedFilters = useMemo(() => {
    const queryParams = getQueryParamsFromUrl();
    return { ...filtersFromState, ...queryParams };
  }, [filtersFromState]);

  return {
    filterState,
    updateFilters,
    isLoading,
    filters: computedFilters,
    updatePriceFilter,
    setFilterState,
  };
};
