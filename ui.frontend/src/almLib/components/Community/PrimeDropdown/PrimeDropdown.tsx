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
import styles from "./PrimeDropdown.module.css";
import { useRef, useState, useEffect } from "react";
import { ARROW_DOWN_SVG } from "../../../utils/inline_svg";

const PrimeDropdown = (props: any) => {
  const ref = useRef<any>();
  const selectedOption = props.selectedOption;
  const optionList = props.optionList;
  const expandDropdown = false;
  const [isExpandDropdown, setisExpandDropdown] = useState(expandDropdown);

  useEffect(() => {
    if (isExpandDropdown) {
      const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
          toggleDropdownExpand && toggleDropdownExpand();
        }
      };
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
      };
    }
  });

  const toggleDropdownExpand = () => {
    setisExpandDropdown((isExpandDropdown) => !isExpandDropdown);
  };
  const dropdownClickHandler = () => {
    toggleDropdownExpand();
  };

  const optionClickHandler = (option: any) => {
    if (typeof props.optionClickHandler === "function") {
      toggleDropdownExpand();
      props.optionClickHandler(option?.target.innerHTML);
    }
  };

  return (
    <>
      <div ref={ref} className={styles.primeDropdown}>
        {props.label}
        <span
          className={styles.primeDropdownValue}
          onClick={dropdownClickHandler}
        >
          : {selectedOption}{" "}
          <span className={styles.primeDropdownIcon}>{ARROW_DOWN_SVG()}</span>
        </span>
        <div>
          {isExpandDropdown && (
            <div className={styles.primeDropdownOptionList}>
              {optionList?.map((option: any) => (
                <li
                  className={styles.primeDropdownOption}
                  onClick={(option) => optionClickHandler(option)}
                  key={option}
                >
                  {option}
                </li>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrimeDropdown;
