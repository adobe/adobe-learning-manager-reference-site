import { useIntl } from "react-intl";
import styles from "./PrimeDropdown.module.css";
import { useRef, useState, useEffect } from "react";
import {
    ARROW_DOWN_SVG
} from "../../utils/inline_svg"

const PrimeDropdown  = (props: any) => {
    const ref = useRef<any>();
    const { formatMessage } = useIntl();
    const selectedOption = props.selectedOption;
    const optionList = props.optionList;
    const expandDropdown = false;
    const [isExpandDropdown, setisExpandDropdown] = useState(expandDropdown);

    useEffect(() => {
        if(isExpandDropdown) {
            const handleClickOutside = (event: any) => {
                console.log(event.target);
                if (ref.current && !ref.current.contains(event.target)) {
                    toggleDropdownExpand && toggleDropdownExpand();
                }
            };
            document.addEventListener('click', handleClickOutside, true);
            return () => {
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
    });

    const toggleDropdownExpand = () => {
        setisExpandDropdown((isExpandDropdown) => !isExpandDropdown);
    }
    const dropdownClickHandler = () => {
        toggleDropdownExpand();
    }

    const optionClickHandler = (option: any) => {
        if (typeof props.optionClickHandler === 'function') {
            toggleDropdownExpand();
            props.optionClickHandler(option?.target.innerHTML);
        }
    }

    return (
        <>
        <div ref={ref} className={styles.primeDropdown}>
            {formatMessage(props.label)}
            <span className={styles.primeDropdownValue} onClick={dropdownClickHandler}>
                : {selectedOption} <span className={styles.primeDropdownIcon}>{ARROW_DOWN_SVG()}</span>
            </span>
            <div>
                {
                    isExpandDropdown &&
                    <div className={styles.primeDropdownOptionList}>
                        {
                            optionList?.map((option: any) => (
                                <li className={styles.primeDropdownOption} onClick={(option) => optionClickHandler(option)} key={option}>{option}</li>
                            ))
                        }
                    </div>
                }
            </div>
        </div>
        </>
    );
};

export default PrimeDropdown;
