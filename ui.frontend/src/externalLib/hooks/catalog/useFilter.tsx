import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFiltersOnLoad } from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import { locationUpdate } from "../../utils/catalog";
import {
  ActionMap,
  ACTION_MAP,
  Filter1State,
  getDefaultFiltersState,
  updateFilterList,
  UpdateFiltersEvent,
} from "../../utils/filters";
import { getALMObject, getQueryParamsIObjectFromUrl } from "../../utils/global";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";

export const useFilter = () => {
  const [filterState, setFilterState] = useState(() =>
    getDefaultFiltersState()
  );
  const filtersFromState = useSelector(
    (state: State) => state.catalog.filterState
  );
  const [isLoading, setIsLoading] = useState(true);

  const config = getALMConfig();
  const dispatch = useDispatch();

  const updateFilters = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof Filter1State]!;
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
        const [skillsPromise, tagsPromise, catalogPromise] = await Promise.all([
          RestAdapter.get({
            url: `${config.primeApiURL}data?filter.skillName=true`,
          }),
          RestAdapter.get({
            url: `${config.primeApiURL}data?filter.tagName=true`,
          }),
          RestAdapter.get({
            url: `${config.primeApiURL}catalogs`,
          }),
        ]);
        const skills = JsonApiParse(skillsPromise)?.data?.names;
        let skillsList = skills?.map((item: string) => ({
          value: item,
          label: item,
          checked: false,
        }));
        skillsList = updateFilterList(skillsList, queryParams, "skillName");

        const tags = JsonApiParse(tagsPromise)?.data?.names;
        let tagsList = tags?.map((item: string) => ({
          value: item,
          label: item,
          checked: false,
        }));
        tagsList = updateFilterList(tagsList, queryParams, "tagName");

        const catalogs = JsonApiParse(catalogPromise)?.catalogList;
        let catalogList = catalogs?.map((item: any) => ({
          value: item.id,
          label: item.name,
          checked: false,
        }));
        catalogList = updateFilterList(catalogList, queryParams, "catalogs");

        setFilterState((prevState) => ({
          ...prevState,
          skillName: {
            ...prevState.skillName,
            list: skillsList,
          },
          tagName: {
            ...prevState.tagName,
            list: tagsList,
          },
          catalogs: {
            ...prevState.catalogs,
            list: catalogList,
          },
        }));
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    if (getALMObject().isPrimeUserLoggedIn()) {
      getFilters();
    }

    //update state merged with filters in url
    const updatedFilters = { ...filtersFromState, ...queryParams };
    dispatch(updateFiltersOnLoad(updatedFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const queryParams = getQueryParamsIObjectFromUrl();
    const esBaseUrl = getALMConfig().esBaseUrl;
    // getFilters();
    const getESFilters = async () => {
      try {
        const response = await RestAdapter.get({
          url: `${esBaseUrl}/filterableData`,
        });
        const data = JSON.parse(response as string);
        if (data) {
          const { terms } = data;
          //generating the skill name list
          let skillsList = terms?.loSkillNames?.map((item: string) => ({
            value: item,
            label: item,
            checked: false,
          }));
          skillsList = updateFilterList(skillsList, queryParams, "skillName");

          //generating the Taglist
          let tagsList = terms?.tags?.map((item: string) => ({
            value: item,
            label: item,
            checked: false,
          }));
          tagsList = updateFilterList(tagsList, queryParams, "tagName");
          setFilterState((prevState) => ({
            ...prevState,
            skillName: {
              ...prevState.skillName,
              list: skillsList,
            },
            tagName: {
              ...prevState.tagName,
              list: tagsList,
            },
          }));
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (!getALMObject().isPrimeUserLoggedIn()) {
      getESFilters();
    }
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
