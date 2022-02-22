import React from "react";
import { useIntl } from "react-intl";
import { UpdateFiltersEvent } from "../../hooks/catalog/useFilter";
import PrimeCheckbox from "./PrimeCheckBox";
import styles from "./PrimeCatalogFilters.module.css";

const PrimeCatalogFilters = (props: any) => {
  const { formatMessage } = useIntl();
  const { loTypes, learnerState, skillName, loFormat, isLoading, tagName } =
    props.filterState;
  const { updateFilters } = props;

  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  if (isLoading)
    return (
      <>
        <span>laoding filters...</span>
      </>
    );

  const filterList = [loTypes, learnerState, loFormat, skillName, tagName].map(
    (filter) =>
      filter.show ? (
        <div key={filter.type} className={styles.container}>
          <h3 className={styles.label}>
            {formatMessage({
              id: filter?.label,
            })}
          </h3>
          <ul className={styles.listContainer}>
            {filter.list?.map((item: any) => (
              <PrimeCheckbox
                key={item.value}
                filterType={filter.type!}
                label={item.label}
                checked={item.checked}
                changeHandler={onChangeHandler}
              />
            ))}
          </ul>
        </div>
      ) : (
        ""
      )
  );

  return (
    <>
      <div className={styles.primeFilterContainer}>{filterList}</div>
    </>
  );
};

export default PrimeCatalogFilters;
