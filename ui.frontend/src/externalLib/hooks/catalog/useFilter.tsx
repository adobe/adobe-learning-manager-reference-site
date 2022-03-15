import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { useConfigContext } from "../../contextProviders";
import {
  updateCatalogsFilter,
  updateDurationFilter,
  updateFiltersOnLoad,
  updateLearnerStateFilter,
  updateLoFormatFilter,
  updateLoTypesFilter,
  updateSkillLevelFilter,
  updateSkillNameFilter,
  updateTagsFilter,
} from "../../store/actions/catalog/action";
import { State } from "../../store/state";
import {
  getQueryParamsIObjectFromUrl,
  locationUpdate,
} from "../../utils/catalog";
import { getALMConfig } from "../../utils/global";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";

export interface FilterListObject {
  value: string;
  label: string;
  checked: boolean;
}
export interface FilterType {
  type?: string;
  label?: string;
  show?: boolean;
  list?: Array<FilterListObject>;
}

interface ActionMap {
  loTypes: Function;
}
const ACTION_MAP = {
  loTypes: updateLoTypesFilter,
  learnerState: updateLearnerStateFilter,
  skillName: updateSkillNameFilter,
  loFormat: updateLoFormatFilter,
  tagName: updateTagsFilter,
  skillLevel: updateSkillLevelFilter,
  duration: updateDurationFilter,
  catalogs: updateCatalogsFilter,
  //price
};

export interface UpdateFiltersEvent {
  filterType: string;
  checked: boolean;
  label: string;
}

export interface Filter1State {
  loTypes: FilterType;
  learnerState: FilterType;
  skillName: FilterType;
  loFormat: FilterType;
  tagName: FilterType;
  catalogs: FilterType;
  skillLevel: FilterType;
  duration: FilterType;
}

const filtersDefaultState: Filter1State = {
  loTypes: {
    type: "loTypes",
    label: "prime.catalog.filter.loType.label",
    list: [
      { value: "course", label: "course", checked: false },
      { value: "learningProgram", label: "Learning Program", checked: false },
      { value: "jobAid", label: "Job Aid", checked: false },
      { value: "certification", label: "Certification", checked: false },
    ],
  },
  learnerState: {
    type: "learnerState",
    label: "prime.catalog.filter.status.label",
    list: [
      { value: "enrolled", label: "Enrolled", checked: false },
      { value: "completed", label: "Completed", checked: false },
      { value: "started", label: "Started", checked: false },
      { value: "notenrolled", label: "Not Enrolled", checked: false },
    ],
  },
  loFormat: {
    type: "loFormat",
    label: "prime.catalog.filter.format.label",
    list: [
      { value: "ACTIVITY", label: "Activity", checked: false },
      { value: "BLENDED", label: "Blended", checked: false },
      { value: "SELF PACED", label: "Self Paced", checked: false },
      {
        value: "VIRTUAL CLASSROOM",
        label: "Virtual Classroom",
        checked: false,
      },
    ],
  },
  //TO-DO : Add pagination for filters
  skillName: {
    type: "skillName",
    label: "prime.catalog.filter.skills.label",
    list: [],
  },
  tagName: {
    type: "tagName",
    label: "prime.catalog.filter.tags.label",
    list: [],
  },
  catalogs: {
    type: "catalogs",
    label: "prime.catalog.card.catalogs.label",
    list: [],
  },
  skillLevel: {
    type: "skillLevel",
    label: "prime.catalog.filter.skills.level.label",
    list: [
      { value: "1", label: "Beginner", checked: false },
      { value: "2", label: "Intermediate", checked: false },
      { value: "3", label: "Advanced", checked: false },
    ],
  },
  duration: {
    type: "duration",
    label: "prime.catalog.filter.duration.label",
    list: [
      { value: "0-1800", label: "30 mins or less", checked: false },
      { value: "1801-7200", label: "31 mins to 2 hours", checked: false },
      { value: "7201-3600000", label: "2 hours +", checked: false },
    ],
  },
};

const updateFilterList = (list: any, filtersFromUrl: any, type: string) => {
  let filtersFromUrlTypeSplitArray = filtersFromUrl[type]
    ? filtersFromUrl[type].split(",")
    : [];

  list?.forEach((item: any) => {
    if (filtersFromUrlTypeSplitArray?.includes(item.value)) {
      item.checked = true;
    }
  });
  return list;
};

const getDefaultFiltersState = () => {
  const filtersFromUrl = getQueryParamsIObjectFromUrl();
  let filtersDefault = filtersDefaultState;
  filtersDefault.loTypes.list = updateFilterList(
    filtersDefault.loTypes.list,
    filtersFromUrl,
    "loTypes"
  );
  filtersDefault.learnerState.list = updateFilterList(
    filtersDefault.learnerState.list,
    filtersFromUrl,
    "learnerState"
  );
  filtersDefault.loFormat.list = updateFilterList(
    filtersDefault.loFormat.list,
    filtersFromUrl,
    "loFormat"
  );

  filtersDefault.skillLevel.list = updateFilterList(
    filtersDefault.skillLevel.list,
    filtersFromUrl,
    "skillLevel"
  );

  filtersDefault.duration.list = updateFilterList(
    filtersDefault.duration.list,
    filtersFromUrl,
    "duration"
  );
  return filtersDefault;
};

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

// let tagPromise = RestAdapter.get({
//   url: `${config.primeApiURL}data?filter.tagName=true`,
// });

// let [skillsResponse, tagResponse] = await Promise.all([
//   skillsPromise,
//   tagPromise,
// ]);
// const tags = JsonApiParse(tagResponse)?.data?.names;

// let tagsList = tags.map((item: string) => ({
//   value: item,
//   label: item,
//   checked: false,
// }));
// tagsList = updateFilterList(tagsList, filtersFromUrl, "skillName");

// tagName: { ...prevState.tagName, list: tagsList },

/**
 * for (let i = 0; i < filters.list!?.length; i++) {
      let item = filters.list![i];

      if (item.label === data.label) {
        item.checked = !item.checked;
        if (item.checked) {
          let previousValue =
            filtersFromState[data.filterType as keyof Filter1State];
          payload = previousValue
            ? `${previousValue},${item.value}`
            : `${item.value}`;
        }
        break;
      }
    }
 */
