import React from "react";
import { UpdateFiltersEvent, useFilter } from "../../hooks/catalog/useFilter";
import AEMLearnCheckbox from "./AEMLearnCheckBox";

const AEMLearnCatalogFilters = (props: any) => {
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
          <ul>
            {filter.list?.map((item) => (
              <AEMLearnCheckbox
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

export default AEMLearnCatalogFilters;
