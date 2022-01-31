import React from "react";
import AEMLearnCheckbox from "./AEMLearnCheckBox";

const AEMLearnCatalogFilters = (props : any) => {

    const filterType = props.filterType; // catalog/duration
    const filterLabels : string[] = props.filters;
    const listItems = filterLabels.map((filterLabel) => <li key={filterLabel}><AEMLearnCheckbox label={filterLabel} filterType={filterType}></AEMLearnCheckbox></li>);
    return (<ul>{listItems}</ul>);

};

export default AEMLearnCatalogFilters;
