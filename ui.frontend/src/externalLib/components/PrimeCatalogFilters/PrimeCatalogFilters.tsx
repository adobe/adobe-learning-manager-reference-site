import React from "react";
import { useIntl } from "react-intl";
import { UpdateFiltersEvent } from "../../hooks/catalog/useFilter";
import PrimeCheckbox from "./PrimeCheckBox";
import styles from "./PrimeCatalogFilters.module.css";

const PrimeCatalogFilters = (props: any) => {
  const { formatMessage } = useIntl();
  const { loTypes, learnerState, skillName, loFormat, isLoading, tagName } =
    props.filterState;
  const { updateFilters, catalogAttributes } = props;

  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  if (isLoading)
    return (
      <>
        <span>loading filters...</span>
      </>
    );

  const filterList = [loTypes, learnerState, loFormat, skillName, tagName].map(
    (filter) => {
      return catalogAttributes[filter.type] !== "false" ? (
        <div key={filter.type} className={styles.container}>
          <h3 className={styles.typeLabel}>
            {formatMessage({
              id: filter?.label,
            })}
          </h3>
          <ul className={styles.listContainer}>
            {filter.list?.map((item: any) => (
              <li key={item.value}>
                <PrimeCheckbox
                  filterType={filter.type!}
                  label={item.label}
                  checked={item.checked}
                  changeHandler={onChangeHandler}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        ""
      );
    }
  );

  return (
    <>
      <div className={styles.primeFilterContainer}>
        <h3 className={styles.filtersLabel}>Filters</h3>
        {filterList}
      </div>
    </>
  );
};

export default PrimeCatalogFilters;
