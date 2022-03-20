import { useState } from "react";
import { PrimeDropdown } from "../PrimeDropdown";

const PrimeCommunityPostFilters  = (props: any) => {
    let defaultSortFilter = "Date Created";
    const [selectedSortFilter, setSelectedSortFilter] = useState(defaultSortFilter);
    const sortFilters:{[key: string]: string} = {
        "Date Created": "-dateCreated", 
        "Date Updated": "-dateUpdated", 
    };
    const sortFilterLabel = {id: "prime.community.board.sortBy", defaultMessage: "Sort by"}

    const sortClickHandler = (option: any) => {
        setSelectedSortFilter(option);
        if (typeof props.sortFilterChangeHandler === 'function') {
            props.sortFilterChangeHandler(sortFilters[option]);
        }   
    }

    return (
        <>
            <PrimeDropdown label={sortFilterLabel} optionList={Object.keys(sortFilters)} selectedOption={selectedSortFilter} optionClickHandler={sortClickHandler}></PrimeDropdown>
        </>
    );
};

export default PrimeCommunityPostFilters;
