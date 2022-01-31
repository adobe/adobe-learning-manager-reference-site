import React from "react";
import { useFilter } from "../../hooks/catalog/useFilter";
import AEMLearnCheckbox from "./AEMLearnCheckBox";

const AEMLearnCatalogFilters = (props: any) => {
  const { loTypes, learnerState, skillName, updateFilters, isLoading } =
    useFilter();

  const onChangeHandler = (data: any) => {
    updateFilters(data);
  };

  if (isLoading)
    return (
      <>
        <span>laoding filters...</span>
      </>
    );

  return (
    <>
      <div>
        <h4>{loTypes?.label}</h4>
        <ul>
          {loTypes.list?.map((item) => (
            <AEMLearnCheckbox
              key={item.value}
              filterType={loTypes.type!}
              label={item.label}
              checked={item.checked}
              changeHandler={onChangeHandler}
            />
          ))}
        </ul>
      </div>

      <div>
        <h4>{learnerState?.label}</h4>
        <ul>
          {learnerState.list?.map((item) => (
            <AEMLearnCheckbox
              key={item.value}
              filterType={learnerState.type!}
              label={item.label}
              checked={item.checked}
              changeHandler={onChangeHandler}
            />
          ))}
        </ul>
      </div>

      <div>
        <h4>{skillName?.label}</h4>
        <ul>
          {skillName.list?.map((item) => (
            <AEMLearnCheckbox
              key={item.value}
              filterType={skillName.type!}
              label={item.label}
              checked={item.checked}
              changeHandler={onChangeHandler}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

export default AEMLearnCatalogFilters;

// const AEMLearnCatalogFilters = (props: any) => {
//   const filterType = props.filterType; // catalog/duration
//   const filterLabels: string[] = props.filters;
//   const listItems = filterLabels.map((filterLabel) => (
//     <li key={filterLabel}>
//       <AEMLearnCheckbox
//         label={filterLabel}
//         filterType={filterType}
//       ></AEMLearnCheckbox>
//     </li>
//   ));
//   return <ul>{listItems}</ul>;
// };

// export default AEMLearnCatalogFilters;
