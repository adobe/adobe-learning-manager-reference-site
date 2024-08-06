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
import { RangeSlider, NumberField, SearchField } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import {
  UpdateFiltersEvent,
  canResetLevelsFilter,
  canShowLevelsForProducts,
  canShowLevelsForRoles,
} from "../../../utils/filters";
import { getALMObject, getQueryParamsFromUrl } from "../../../utils/global";
import { canShowPriceFilter } from "../../../utils/price";
import { GetTranslation } from "../../../utils/translationService";
import { ALMLoader } from "../../Common/ALMLoader";
import styles from "./PrimeCatalogFilters.module.css";
import PrimeCheckbox from "./PrimeCheckBox";
import { clearAllFilters, clearLevelsFilter } from "../../../store";
import { useDispatch } from "react-redux";
import { FILTER, LEVELS, PRICE_RANGE } from "../../../utils/constants";
import { CATALOG_FILTERS_LOADER } from "../../../utils/inline_svg";
import store from "../../../../store/APIStore";

const START = "start";
const END = "end";

const PrimeCatalogFilters = (props: any) => {
  const {
    loTypes,
    learnerState,
    skillName,
    loFormat,
    isLoading,
    tagName,
    cities,
    skillLevel,
    duration,
    catalogs,
    priceRange,
    price,
    products,
    roles,
    levels,
    announcedGroups,
  } = props.filterState;

  const {
    filterState,
    updateFilters,
    catalogAttributes,
    updatePriceRangeFilter,
    account,
    resetFilterList,
    areFiltersLoading,
    searchFilters,
    clearFilterSearch,
  } = props;

  useEffect(() => {
    const { levels } = filterState;
    const { prlCriteria } = account;
    if (!prlCriteria || !prlCriteria.enabled || !levels) {
      return;
    }

    if (canResetLevelsFilter(prlCriteria, filterState)) {
      resetFilterList(LEVELS);
      dispatch(clearLevelsFilter());
    }
  }, [filterState.products, filterState.roles]);

  const isLoggedIn = getALMObject().isPrimeUserLoggedIn();

  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  const dispatch = useDispatch();

  const priceChangeHandler = (data: any) => {
    updatePriceRangeFilter({
      filterType: PRICE_RANGE,
      data,
    });
  };

  const INITIAL_START = 0;
  const INITIAL_END = 0;

  type TrainingPrice = { start: number; end: number };

  const [trainingPrice, setTrainingPrice] = useState<TrainingPrice>({
    start: INITIAL_START,
    end: INITIAL_END,
  });

  useEffect(() => {
    if (priceRange) {
      setTrainingPrice({
        start: priceRange.list[0].value,
        end: priceRange.list[1].value || priceRange.maxPrice,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange?.maxPrice]);

  if (isLoading) {
    return <ALMLoader />;
  }

  const renderFilterListItems = (filter: any, showNoResultsText: boolean) => {
    if (
      filter.isLoading &&
      (filter.type === FILTER.SKILL_NAME || filter.type === FILTER.TAG_NAME)
    ) {
      return <ALMLoader classes={styles.loader} />;
    }

    if (showNoResultsText) {
      return <li>{GetTranslation("alm.text.noResultsFound")}</li>;
    }

    return filter.list?.map((item: any) => {
      let isItemChecked = item.checked;
      const filterStateFromStore = store.getState().catalog.filterState || {};

      if (filter.canSearch) {
        const filterType = filter.type;
        const selectedItems: { [key: string]: boolean } = filterStateFromStore[filterType as never];
        isItemChecked = selectedItems[item.value] || false;
        if (
          filterType === FILTER.SKILL_NAME &&
          item.label === GetTranslation("alm.text.mySkills", true)
        ) {
          isItemChecked = item.checked;
        }
      }

      return (
        <li key={item.value} className={styles.item}>
          <PrimeCheckbox
            filterType={filter.type!}
            label={item.label}
            checked={isItemChecked}
            changeHandler={onChangeHandler}
            isListDynamic={filter.isListDynamic}
            automationId={`input-${item.label}:::selected:::${isItemChecked}`}
          />
        </li>
      );
    });
  };

  const renderFilterList = (filter: any, minimumValuesToDisplayFilter = 1) => {
    const isSkillNameFilter = filter?.type === FILTER.SKILL_NAME && skillName.list?.length !== 0;
    const isTagNameFilter = filter?.type === FILTER.TAG_NAME && tagName.list?.length !== 0;
    const isFilterListEmpty = !filter?.list || filter.list?.length === 0;

    const showNoResultsFound =
      filter && (isSkillNameFilter || isTagNameFilter) && isFilterListEmpty;
    //if no skill/tags found on search - still show the skill filter and display no results found

    const isFilterInvalid =
      !filter || !filter.list || (filter.list && filter.list.length < minimumValuesToDisplayFilter);
    const showFilters: boolean = showNoResultsFound ? true : !isFilterInvalid;
    if (!showFilters) {
      return "";
    }

    let classes = "";
    let containerClasses = `${styles.container}`;
    if (filter.type === "levels") {
      classes += ` ${styles.levelsFilter}`;
      containerClasses += ` ${styles.levelsFilterContainer}`;
    }
    const filterContainerId = `filterHeading${filter.type}`;
    return catalogAttributes[filter.type] === "true" ? (
      <div
        key={filter.type}
        className={containerClasses}
        role="group"
        aria-labelledby={`filterText ${filterContainerId}`}
      >
        <div className={classes}>
          <h3 className={styles.typeLabel} data-automationid="filtersText" id={filterContainerId}>
            {GetTranslation(filter?.label, true)}
          </h3>
          {filter.canSearch && (
            <div style={{ marginBottom: "10px" }}>
              <SearchField
                placeholder={GetTranslation(`alm.catalog.${filter.type}.search.placeholder`, true)}
                onChange={query => {
                  searchFilters(query, filter.type);
                }}
                data-automationid={`filterSearchField${filter.type}`}
                onClear={() => {
                  clearFilterSearch(filter.type);
                }}
                width="240px"
                height="30px"
              />
            </div>
          )}
          <ul className={styles.listContainer}>
            {renderFilterListItems(filter, showNoResultsFound)}
          </ul>
        </div>
      </div>
    ) : (
      ""
    );
  };

  const inputEnterKeyHandler = (event: any, type: string) => {
    if (event.key === "Enter") {
      let value = (event.target as HTMLInputElement)?.value;
      value = value.replaceAll(",", "");
      changeTrainingPriceHandle(type, value);
    }
  };
  const changeTrainingPriceHandle = (type: string, value: number | string) => {
    let parsedValue = parseInt((value as string) || "0");
    if (type === START) {
      parsedValue = Math.max(0, Math.min(parsedValue, trainingPrice.end));
    } else {
      parsedValue = Math.min(priceRange.maxPrice, Math.max(parsedValue, trainingPrice.start));
    }

    setTrainingPrice(price => {
      let data = { ...price, [type]: parsedValue };
      updatePriceRangeFilter({
        filterType: PRICE_RANGE,
        data,
      });
      return data;
    });
  };

  const resetAllFilters = () => {
    Object.keys(filterState).forEach((filterType: string) => {
      if (filterState[filterType]) {
        resetFilterList(filterType);
      }
    });
    dispatch(clearAllFilters());
  };
  const showClearFiltersButton = () => {
    const queryParams = getQueryParamsFromUrl();
    for (let qp in queryParams) {
      const filterType = filterState[qp];
      if (filterType) {
        return (
          <button className={styles.clearAllFiltersBtn} onClick={() => resetAllFilters()}>
            {GetTranslation("alm.filter.clearAll")}
          </button>
        );
      }
    }
  };
  if (areFiltersLoading) {
    return (
      <>
        <div className={styles.primeFilterContainer}>
          <div className={styles.filterHeader}>
            <h3 className={styles.filtersLabel}>{GetTranslation("alm.catalog.filters")}</h3>
            {showClearFiltersButton()}
          </div>
          {CATALOG_FILTERS_LOADER()}
        </div>
      </>
    );
  }
  return (
    <>
      <div className={styles.primeFilterContainer}>
        <div className={styles.filterHeader}>
          <h3 className={styles.filtersLabel} id="filterText">
            {GetTranslation("alm.catalog.filters")}
          </h3>
          {showClearFiltersButton()}
        </div>
        {/* Group filter start */}
        {renderFilterList(announcedGroups)}
        {/* Group filter ends */}

        {/* catalog Filter start */}
        {renderFilterList(catalogs, 2)}
        {/* catalog Filter ends */}

        {/* products Filter start */}
        {renderFilterList(products)}

        {canShowLevelsForProducts(account, filterState) && renderFilterList(levels)}
        {/* products Filter ends */}

        {/* roles Filter start */}
        {renderFilterList(roles)}

        {canShowLevelsForRoles(account, filterState) && renderFilterList(levels)}
        {/* roles Filter ends */}

        {/* loTypes Filter start */}
        {renderFilterList(loTypes)}
        {/* loTypes Filter ends */}

        {/* loFormat Filter start */}
        {renderFilterList(loFormat)}
        {/* loFormat Filter ends */}

        {/* duration Filter start */}
        {renderFilterList(duration)}
        {/* duration Filter ends */}

        {/* skillName Filter start */}

        {renderFilterList(skillName)}
        {/* skillName Filter ends */}

        {/* skillLevel Filter start */}
        {renderFilterList(skillLevel)}
        {/* skillLevel Filter ends */}

        {/* tagName Filter start */}
        {renderFilterList(tagName, 1)}
        {/* tagName Filter ends */}

        {/* learnerState Filter start */}
        {isLoggedIn && renderFilterList(learnerState)}
        {/* learnerState Filter ends */}

        {/* cities Filter start */}
        {renderFilterList(cities)}
        {/* cities Filter ends */}

        {canShowPriceFilter(account) && renderFilterList(price)}

        {/* Price Filter start */}
        {canShowPriceFilter(account) &&
        catalogAttributes[PRICE_RANGE] === "true" &&
        priceRange &&
        priceRange.maxPrice ? (
          <div key={PRICE_RANGE} className={styles.container}>
            <h3
              className={`${styles.typeLabel} ${styles.price}`}
              data-automationid="priceRangeFilterLabel"
            >
              {GetTranslation("alm.catalog.filter.priceRange.label", true)}
            </h3>
            <div className={styles.listContainer}>
              <RangeSlider
                label={GetTranslation("alm.catalog.filter.range.label")}
                value={trainingPrice}
                onChange={setTrainingPrice}
                onChangeEnd={priceChangeHandler}
                maxValue={priceRange.maxPrice}
                showValueLabel={false}
                width={"100%"}
                UNSAFE_className={styles.customSlider}
                data-automationid={`input:::selectedprice:::${trainingPrice}`}
              />
              <div className={styles.priceFilterContainer}>
                <div>
                  <NumberField
                    value={trainingPrice.start}
                    onChange={value => changeTrainingPriceHandle(START, value)}
                    minValue={0}
                    maxValue={priceRange.maxPrice}
                    width={"100%"}
                    onKeyUp={event => inputEnterKeyHandler(event, START)}
                    data-automationid={`input::startprice:::${trainingPrice.start}`}
                  ></NumberField>
                </div>
                <div className={styles.priceToLabel}>{GetTranslation("to")}</div>
                <div>
                  <NumberField
                    value={trainingPrice.end}
                    onChange={value => changeTrainingPriceHandle(END, value)}
                    minValue={0}
                    maxValue={priceRange.maxPrice}
                    onKeyUp={event => inputEnterKeyHandler(event, END)}
                    width={"100%"}
                    data-automationid={`input::endprice:::${trainingPrice.end}`}
                  ></NumberField>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default PrimeCatalogFilters;
