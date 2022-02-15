import { useState, useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useConfigContext } from "../../contextProviders";
import {
  updateFiltersOnLoad,
  updateLearnerStateFilter,
  updateLoFormatFilter,
  updateLoTypesFilter,
  updateSkillNameFilter,
  updateTagsFilter,
} from "../../store/actions/catalog/action";
import { JsonApiParse } from "../../utils/jsonAPIAdapter";
import { RestAdapter } from "../../utils/restAdapter";
import {
  getQueryParamsIObjectFromUrl,
  locationUpdate,
} from "../../utils/catalog";
import { State } from "../../store/state";

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
}

const filtersDefaultState: Filter1State = {
  loTypes: {
    type: "loTypes",
    label: "prime.catalog.filter.loType.label",
    show: true,
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
    show: true,
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
    show: true,
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
    show: true,
    list: [],
  },
  tagName: {
    type: "tagName",
    label: "prime.catalog.filter.tags.label",
    show: true,
    list: [],
  },
};

const updateFilterList = (list: any, filtersFromUrl: any, type: string) => {
  list?.forEach((item: any) => {
    if (filtersFromUrl[type]?.includes(item.value)) {
      item.checked = true;
    }
  });
  return list;
};

const getDefualtFiltersState = () => {
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
  return filtersDefault;
};

export const useFilter = () => {
  const [filterState, setFilterState] = useState(() =>
    getDefualtFiltersState()
  );
  const filtersFromState = useSelector(
    (state: State) => state.catalog.filterState
  );
  const [isLoading, setIsLoading] = useState(true);

  const config = useConfigContext();
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
    const getSkills = async () => {
      let skillsPromise = await RestAdapter.get({
        url: `${config.baseApiUrl}data?filter.skillName=true`,
      });

      const skills = JsonApiParse(skillsPromise)?.data?.names;
      let skillsList = skills.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      skillsList = updateFilterList(skillsList, queryParams, "skillName");

      setFilterState((prevState) => ({
        ...prevState,
        skillName: { ...prevState.skillName, list: skillsList },
      }));
      setIsLoading(false);
    };
    getSkills();
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
//   url: `${config.baseApiUrl}data?filter.tagName=true`,
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
