import { useState, useMemo, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store/state";
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
}

const filtersDefault: Filter1State = {
  loTypes: {
    type: "loTypes",
    label: "Type",
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
    label: "Status",
    show: true,
    list: [
      { value: "enrolled", label: "Enrolled", checked: false },
      { value: "completed", label: "Completed", checked: false },
      { value: "started", label: "Started", checked: false },
      { value: "notenrolled", label: "Not Enrolled", checked: false },
    ],
  },
  skillName: {
    type: "skillName",
    label: "Skills",
    show: true,
    list: [],
  },
  loFormat: {
    type: "loFormat",
    label: "Format",
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
};

const getDefualtFiltersState = () => filtersDefault;

export const useFilter = () => {
  const [filterState, setFilterState] = useState(() =>
    getDefualtFiltersState()
  );
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const updateFilters = (data: UpdateFiltersEvent) => {
    const filters = filterState[data.filterType as keyof Filter1State];
    let payload = "";
    filters.list?.forEach((item) => {
      if (item.label === data.label) {
        //just update with the arguments
        item.checked = !item.checked;
      }
      if (item.checked) {
        payload = payload ? `${payload},${item.value}` : `${item.value}`;
      }
    });
    setFilterState({ ...filterState, [data.filterType]: { ...filters } });
    dispatch({
      type: `UPDATE_${data.filterType.toUpperCase()}_FILTERS`,
      payload,
    });
  };

  useEffect(() => {
    const getSkills = async () => {
      const response = await RestAdapter.get({
        url: `${(window as any).baseUrl}data?filter.skillName=true`,
      });
      const skills = JsonApiParse(response)?.data?.names;
      const skillsList = skills.map((item: string) => ({
        value: item,
        label: item,
        checked: false,
      }));
      setFilterState((prevState) => ({
        ...prevState,
        skillName: { ...prevState.skillName, list: skillsList },
      }));
      setIsLoading(false);
    };
    getSkills();
  }, [dispatch]);

  return {
    ...filterState,
    updateFilters,
    isLoading,
  };
};

// useEffect(() => {
//   const loTypes = {
//     type: "loTypes",
//     label: "Type",
//     show: true,
//     list: [
//       { value: "course", label: "course", checked: false },
//       { value: "learningProgram", label: "Learning Program", checked: true },
//       { value: "jonAid", label: "Job Aid", checked: false },
//       { value: "certification", label: "Certification", checked: true },
//     ],
//   };
//   dispatch({
//     type: "LOAD_FILTERS",
//     payload: {
//       loTypes,
//     },
//   });
// }, [dispatch]);

// const filters = useMemo(() => {
//   const loTypeFilters = {
//     type: "loTypes",
//     label: "Type",
//     show: true,
//     list: [
//       { value: "course", label: "course", checked: false },
//       { value: "learningProgram", label: "Learning Program", checked: true },
//       { value: "jonAid", label: "Job Aid", checked: false },
//       { value: "certification", label: "Certification", checked: true },
//     ],
//   };

//   const learnerStateFilters = {
//     type: "learnerState",
//     label: "Status",
//     show: true,
//     list: [
//       { value: "enrolled", label: "Enrolled", checked: true },
//       { value: "completed", label: "Completed", checked: false },
//       { value: "started", label: "Started", checked: false },
//       { value: "notEnrolled", label: "Not Enrolled", checked: true },
//     ],
//   };

//   return {
//     loTypeFilters,
//     learnerStateFilters,
//   };
// }, []);

// return {
//   ...filters,
// };
