import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APIServiceInstance from "../../common/APIService";
import { updateFiltersOnLoad } from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import { locationUpdate } from "../../utils/catalog";
import {
  ActionMap,
  ACTION_MAP,
  FilterState,
  UpdateFiltersEvent,
} from "../../utils/filters";
import { getQueryParamsIObjectFromUrl } from "../../utils/global";

export const useFilter = () => {
  // const [filterState, setFilterState] = useState(() =>
  //   getDefaultFiltersState()
  // );
  const emptyFilterState = {} as FilterState;
  const [filterState, setFilterState] = useState(() => emptyFilterState);
  const filtersFromState = useSelector(
    (state: State) => state.catalog.filterState
  );
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const updateFilters = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof FilterState]!;
    let payload = "";

    filters.list?.forEach((item) => {
      if (item.label === data.label) {
        item.checked = !item.checked;
      }
      if (item.checked) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
      }
    });

    locationUpdate({ [data.filterType as string]: payload });
    setFilterState({ ...filterState, [data.filterType]: { ...filters } });
    const action = ACTION_MAP[data.filterType as keyof ActionMap];

    if (action && action instanceof Function) dispatch(action(payload));
  };

  useEffect(() => {
    const queryParams = getQueryParamsIObjectFromUrl();
    const getFilters = async () => {
      try {
        const filters = await APIServiceInstance.getFilters();
        setFilterState(filters);
        // setFilterState((prevState) => ({
        //   ...prevState,
        //   skillName: {
        //     ...prevState.skillName,
        //     list: skillsList,
        //   },
        //   tagName: {
        //     ...prevState.tagName,
        //     list: tagsList,
        //   },
        //   catalogs: {
        //     ...prevState.catalogs,
        //     list: catalogList,
        //   },
        // }));
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
    const queryParams = getQueryParamsIObjectFromUrl();
    return { ...filtersFromState, ...queryParams };
  }, [filtersFromState]);

  return {
    filterState,
    updateFilters,
    isLoading,
    filters: computedFilters,
  };
};
