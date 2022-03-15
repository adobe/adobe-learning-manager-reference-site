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
  isListDynamic?: boolean;
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
      {
        value: "course",
        label: "prime.catalog.card.course.plural",
        checked: false,
      },
      {
        value: "learningProgram",
        label: "prime.catalog.card.learningProgram.plural",
        checked: false,
      },
      {
        value: "jobAid",
        label: "prime.catalog.card.jobAid.plural",
        checked: false,
      },
      {
        value: "certification",
        label: "prime.catalog.card.certification.plural",
        checked: false,
      },
    ],
  },
  learnerState: {
    type: "learnerState",
    label: "prime.catalog.filter.status.label",
    list: [
      {
        value: "enrolled",
        label: "prime.catalog.filter.enrolled",
        checked: false,
      },
      {
        value: "completed",
        label: "prime.catalog.filter.completed",
        checked: false,
      },
      {
        value: "started",
        label: "prime.catalog.filter.started",
        checked: false,
      },
      {
        value: "notenrolled",
        label: "prime.catalog.filter.notenrolled",
        checked: false,
      },
    ],
  },
  loFormat: {
    type: "loFormat",
    label: "prime.catalog.filter.format.label",
    list: [
      {
        value: "ACTIVITY",
        label: "prime.catalog.card.activity",
        checked: false,
      },
      { value: "BLENDED", label: "prime.catalog.card.blended", checked: false },
      {
        value: "SELF PACED",
        label: "prime.catalog.card.self.paced",
        checked: false,
      },
      {
        value: "VIRTUAL CLASSROOM",
        label: "prime.catalog.card.virtual.classroom",
        checked: false,
      },
      {
        value: "CLASSROOM",
        label: "prime.catalog.card.classroom",
        checked: false,
      },
    ],
  },
  //TO-DO : Add pagination for filters
  skillName: {
    type: "skillName",
    label: "prime.catalog.filter.skills.label",
    list: [],
    isListDynamic: true,
  },
  tagName: {
    type: "tagName",
    label: "prime.catalog.filter.tags.label",
    list: [],
    isListDynamic: true,
  },

  catalogs: {
    type: "catalogs",
    label: "prime.catalog.card.catalogs.label.plural",
    list: [],
    isListDynamic: true,
  },
  skillLevel: {
    type: "skillLevel",
    label: "prime.catalog.filter.skills.level.label",
    list: [
      { value: "1", label: "prime.catalog.filter.beginner", checked: false },
      {
        value: "2",
        label: "prime.catalog.filter.intermediate",
        checked: false,
      },
      { value: "3", label: "prime.catalog.filter.advanced", checked: false },
    ],
  },
  duration: {
    type: "duration",
    label: "prime.catalog.filter.duration.label",
    list: [
      {
        value: "0-1800",
        label: "prime.catalog.filter.lessThan30Minutes",
        checked: false,
      },
      {
        value: "1801-7200",
        label: "prime.catalog.filter.31minutesTo2Hours",
        checked: false,
      },
      {
        value: "7201-3600000",
        label: "prime.catalog.filter.moreThan2Hours",
        checked: false,
      },
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
