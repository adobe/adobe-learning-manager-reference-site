import React from "react";
import { useIntl } from "react-intl";
import { UpdateFiltersEvent, useFilter } from "../../hooks/catalog/useFilter";
import PrimeCheckbox from "./PrimeCheckBox";

const PrimeCatalogFilters = (props: any) => {
  const { formatMessage } = useIntl();
  const data = props.data;
  const {
    loTypes,
    learnerState,
    skillName,
    loFormat,
    updateFilters,
    isLoading,
  } = useFilter();

  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  if (isLoading)
    return (
      <>
        <span>laoding filters...</span>
      </>
    );

  const filterList = [loTypes, learnerState, skillName, loFormat].map(
    (filter) =>
      filter.show ? (
        <div key={filter.type}>
          <h4>{filter?.label}</h4>
          <span>
            {formatMessage({
              id: "prime.catalog.label",
              defaultMessage: "Edit Payment Information",
            })}
          </span>
          <ul>
            {filter.list?.map((item) => (
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
      <div style={{ display: "flex" }}>{filterList}</div>
    </>
  );
};

export default PrimeCatalogFilters;
