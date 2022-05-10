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
import styles from "./PrimeCommunityBoardFilters.module.css";
import { useEffect, useRef, useState } from "react";
import { PrimeDropdown } from "../PrimeDropdown";

const PrimeCommunityBoardFilters = (props: any) => {
  const ref = useRef<any>();

  let defaultSkillFilter = props.selectedSkill;
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(defaultSkillFilter);
  const [showSkillFilter, setShowSkillFilter] = useState(false);

  const isSkillEmpty = (value: any) => {
    return !value || value === "";
  }

  //populate skill list
  let skills = props.skills?.split(",");
  const [skillList, setSkillList ] = useState({});
  const firstRun = useRef(true);
  
  useEffect(() => {
    if (firstRun.current) {
      let index = 1;
      const skillFilters: { [key: string]: number } = {};
      if(!skills || skills.length === 0) {
        setShowSkillFilter(false);
      } else {
        skills?.forEach((skill: any) => {
          if(!isSkillEmpty(skill))
          skillFilters[skill] = index++;
        });
        setSkillList(skillFilters);
        setShowSkillFilter(true);
      }
      firstRun.current = false;
    }
  },[skills]);

  const skillFilterLabel = {
    id: "alm.community.board.skill",
    defaultMessage: "Skill",
  };

  let defaultSortFilter = "Date Updated";
  const [selectedSortFilter, setSelectedSortFilter] =
    useState(defaultSortFilter);
  const sortFilters: { [key: string]: string } = {
    "Date Created": "dateCreated",
    "Date Updated": "dateUpdated",
    Name: "name",
    // "relevance": "Relavance"
  };
  const sortFilterLabel = {
    id: "alm.community.board.sortBy",
    defaultMessage: "Sort by",
  };

  const skillClickHandler = (option: any) => {
    setSelectedSkillFilter(option);
    if (typeof props.skillFilterChangeHandler === "function") {
      props.skillFilterChangeHandler(option);
    }
  };

  const sortClickHandler = (option: any) => {
    setSelectedSortFilter(option);
    if (typeof props.sortFilterChangeHandler === "function") {
      props.sortFilterChangeHandler(sortFilters[option]);
    }
  };

  return (
    <>
      <div className={styles.primeBoardOptionsWrapper}>
        <div ref={ref} className={styles.primeBoardFilters}>
          {showSkillFilter &&
            <PrimeDropdown
              label={skillFilterLabel}
              optionList={Object.keys(skillList)}
              selectedOption={selectedSkillFilter}
              optionClickHandler={skillClickHandler}
            ></PrimeDropdown>
          }
          <PrimeDropdown
            label={sortFilterLabel}
            optionList={Object.keys(sortFilters)}
            selectedOption={selectedSortFilter}
            optionClickHandler={sortClickHandler}
          ></PrimeDropdown>
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityBoardFilters;
