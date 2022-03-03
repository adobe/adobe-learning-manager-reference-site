import styles from "./PrimeCommunityBoardFilters.module.css";
import { useRef, useState } from "react";
import { PrimeDropdown } from "../PrimeDropdown";

const PrimeCommunityBoardFilters  = (props: any) => {
    const ref = useRef<any>();

    let defaultSkillFilter = "Gamification";
    const [selectedSkillFilter, setSelectedSkillFilter] = useState(defaultSkillFilter);
    
    //To-do skill_id must be replaced in below object
    const skillFilters:{[key: string]: number} = {
        "Gamification": 1, 
        "General": 2
    };

    const skillFilterLabel = {id: "prime.community.board.skill", defaultMessage: "Skill"}

    let defaultSortFilter = "Date Updated";
    const [selectedSortFilter, setSelectedSortFilter] = useState(defaultSortFilter);
    const sortFilters:{[key: string]: string} = {
        "Date Created": "dateCreated", 
        "Date Updated": "dateUpdated", 
        "Name": "name",
        // "relevance": "Relavance"
    };
    const sortFilterLabel = {id: "prime.community.board.sortBy", defaultMessage: "Sort by"}

    const skillClickHandler = (option: any) => {
        setSelectedSkillFilter(option);
        if (typeof props.sortFilterChangeHandler === 'function') {
            props.skillFilterChangeHandler(skillFilters[option]);
        }
    }

    const sortClickHandler = (option: any) => {
        setSelectedSortFilter(option);
        if (typeof props.sortFilterChangeHandler === 'function') {
            props.sortFilterChangeHandler(sortFilters[option]);
        }   
    }

    return (
        <>
        <div className={styles.primeBoardOptionsWrapper}>
            <div ref={ref} className={styles.primeBoardFilters}>
                <PrimeDropdown label={skillFilterLabel} optionList={skillFilters} selectedOption={selectedSkillFilter} optionClickHandler={skillClickHandler}></PrimeDropdown>
                <PrimeDropdown label={sortFilterLabel} optionList={Object.keys(sortFilters)} selectedOption={selectedSortFilter} optionClickHandler={sortClickHandler}></PrimeDropdown>
            </div>
        </div>
        </>
    );
};

export default PrimeCommunityBoardFilters;
