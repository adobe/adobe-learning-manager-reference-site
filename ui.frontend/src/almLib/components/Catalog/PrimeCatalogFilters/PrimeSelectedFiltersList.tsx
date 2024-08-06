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

import React, { useEffect, useMemo, useState } from "react";
import { getQueryParamsFromUrl } from "../../../utils/global";
import styles from "./PrimeSelectedFiltersList.module.css"; //change it
import { CLOSE_SVG } from "../../../utils/inline_svg";
import { getFilterLabel } from "../../../utils/filters";
import { GetTranslation } from "../../../utils/translationService";
import { splitStringIntoArray } from "../../../utils/catalog";
import store from "../../../../store/APIStore";
import { FILTER } from "../../../utils/constants";

const maxVisibleFilters = 5;
const PrimeSelectedFiltersList = (props: any) => {
  const { filterState, updateFilters } = props;
  const queryParams = getQueryParamsFromUrl();
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);

  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(prevState => !prevState);
  };

  useEffect(() => {
    getAllSelectedFilters();
  }, [filterState]);

  const getAllSelectedFilters = () => {
    const selectedFilters = [];

    for (let qp in queryParams) {
      if (Object.hasOwnProperty.call(filterState, qp)) {
        const filterType = filterState[qp];
        if (filterType) {
          const filters = queryParams[qp];
          const filtersArr = splitStringIntoArray(filters);
          if (filterType.canSearch) {
            const filterStateFromStore: { [key: string]: boolean } =
              store.getState().catalog.filterState[filterType.type as never];
            let selectedFilterFromState = { ...filterStateFromStore };

            Object.entries(selectedFilterFromState).forEach(([key, value]) => {
              if (value && key) {
                selectedFilters.push({
                  labelToShow: key,
                  label: key,
                  filterType: qp,
                  checked: value,
                });
              }
            });
          } else if (filtersArr?.length) {
            for (let filter of filtersArr) {
              const labelObj = getFilterLabel(filter, filterType);
              if (labelObj.label || labelObj.labelToShow) {
                selectedFilters.push({
                  checked: true,
                  filterType: qp,
                  labelToShow: filterType.isListDynamic ? labelObj.label : labelObj.labelToShow,
                  label: labelObj.label,
                });
              }
            }
          }
        }
      }
    }
    setSelectedFilters(selectedFilters);
  };

  const removeFilter = (filter: any) => {
    filter.checked = false;
    updateFilters(filter);
  };

  // Render the selected filters
  const filtersToRender = useMemo(() => {
    if (showAll) {
      return [...selectedFilters];
    } else {
      return selectedFilters.slice(0, maxVisibleFilters);
    }
  }, [selectedFilters, showAll, maxVisibleFilters]);

  return (
    <div className={styles.selectedFiltersContainer}>
      {filtersToRender.map((filter, filterIndex) => (
        <div key={filterIndex} className={styles.selectedFilter}>
          <span className={styles.selectedFilterText} title={filter.labelToShow}>
            {filter.labelToShow}
          </span>
          <button
            className={styles.removeFilterButton}
            onClick={() => removeFilter(filter)}
            aria-label={filter.labelToShow}
            data-automationid={`removeFilter${filter.labelToShow}`}
          >
            {CLOSE_SVG()}
          </button>
        </div>
      ))}
      {selectedFilters.length > maxVisibleFilters ? (
        <button className={styles.showFiltersButton} onClick={() => toggleShowAll()}>
          {!showAll ? GetTranslation("alm.text.showMore") : GetTranslation("alm.text.showLess")}
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default PrimeSelectedFiltersList;
