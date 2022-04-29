import {
  updateCatalogsFilter,
  updateDurationFilter,
  updateLearnerStateFilter,
  updateLoFormatFilter,
  updateLoTypesFilter,
  updateSkillLevelFilter,
  updateSkillNameFilter,
  updateTagsFilter,
} from "../store/actions/catalog/action";
import { getQueryParamsIObjectFromUrl } from "./global";
export const filtersDefaultState: FilterState = {
  loTypes: {
    type: "loTypes",
    label: "alm.catalog.filter.loType.label",
    list: [
      {
        value: "course",
        label: "alm.catalog.card.course.plural",
        checked: false,
      },
      {
        value: "learningProgram",
        label: "alm.catalog.card.learningProgram.plural",
        checked: false,
      },
      {
        value: "jobAid",
        label: "alm.catalog.card.jobAid.plural",
        checked: false,
      },
      {
        value: "certification",
        label: "alm.catalog.card.certification.plural",
        checked: false,
      },
    ],
  },
  learnerState: {
    type: "learnerState",
    label: "alm.catalog.filter.status.label",
    list: [
      {
        value: "enrolled",
        label: "alm.catalog.filter.enrolled",
        checked: false,
      },
      {
        value: "completed",
        label: "alm.catalog.filter.completed",
        checked: false,
      },
      {
        value: "started",
        label: "alm.catalog.filter.started",
        checked: false,
      },
      {
        value: "notenrolled",
        label: "alm.catalog.filter.notenrolled",
        checked: false,
      },
    ],
  },
  loFormat: {
    type: "loFormat",
    label: "alm.catalog.filter.format.label",
    list: [
      {
        value: "Activity",
        label: "alm.catalog.card.activity",
        checked: false,
      },
      { value: "Blended", label: "alm.catalog.card.blended", checked: false },
      {
        value: "Self Paced",
        label: "alm.catalog.card.self.paced",
        checked: false,
      },
      {
        value: "Virtual Classroom",
        label: "alm.catalog.card.virtual.classroom",
        checked: false,
      },
      {
        value: "Classroom",
        label: "alm.catalog.card.classroom",
        checked: false,
      },
    ],
  },
  //TO-DO : Add pagination for filters
  skillName: {
    type: "skillName",
    label: "alm.catalog.filter.skills.label",
    list: [],
    isListDynamic: true,
  },
  tagName: {
    type: "tagName",
    label: "alm.catalog.filter.tags.label",
    list: [],
    isListDynamic: true,
  },

  catalogs: {
    type: "catalogs",
    label: "alm.catalog.card.catalogs.label.plural",
    list: [],
    isListDynamic: true,
  },
  skillLevel: {
    type: "skillLevel",
    label: "alm.catalog.filter.skills.level.label",
    list: [
      { value: "1", label: "alm.catalog.filter.beginner", checked: false },
      {
        value: "2",
        label: "alm.catalog.filter.intermediate",
        checked: false,
      },
      { value: "3", label: "alm.catalog.filter.advanced", checked: false },
    ],
  },
  duration: {
    type: "duration",
    label: "alm.catalog.filter.duration.label",
    list: [
      {
        value: "0-1800",
        label: "alm.catalog.filter.lessThan30Minutes",
        checked: false,
      },
      {
        value: "1801-7200",
        label: "alm.catalog.filter.30minutesTo2Hours",
        checked: false,
      },
      {
        value: "7201-3600000",
        label: "alm.catalog.filter.moreThan2Hours",
        checked: false,
      },
    ],
  },
  price: {
    type: "price",
    label: "alm.catalog.filter.duration.label",
    list: [
      {
        value: "10",
        label: "alm.catalog.filter.lessThan30Minutes",
        checked: false,
      },
      {
        value: "10-1000",
        label: "alm.catalog.filter.30minutesTo2Hours",
        checked: false,
      },
      {
        value: "1001",
        label: "alm.catalog.filter.moreThan2Hours",
        checked: false,
      },
    ],
  },
};

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

export interface ActionMap {
  loTypes: Function;
}
export const ACTION_MAP = {
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

export interface FilterState {
  loTypes: FilterType;
  learnerState: FilterType;
  skillName: FilterType;
  loFormat: FilterType;
  tagName: FilterType;
  catalogs: FilterType;
  skillLevel: FilterType;
  duration: FilterType;
  price: FilterType;
}

export const updateFilterList = (
  list: any,
  filtersFromUrl: any,
  type: string
) => {
  let filtersFromUrlTypeSplitArray = filtersFromUrl[type]
    ? filtersFromUrl[type].split(",")
    : [];

  list?.forEach((item: any) => {
    if (filtersFromUrlTypeSplitArray?.includes(item.value)) {
      item.checked = true;
    }
  });
  return list || [];
};

export const getDefaultFiltersState = () => {
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
