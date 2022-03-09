import styles from "./PrimeCommunitySearch.module.css";
import { useIntl } from "react-intl";
import {
    SOCIAL_SEARCH_SVG,
  } from "../../utils/inline_svg"
import React, { useRef } from "react";
import { usePosts } from "../../hooks/community";

const PrimeCommunitySearch = (props: any) => {
    const { formatMessage } = useIntl();
    const objectId = props.objectId;
    const type = props.type;
    const { searchPostResult } = usePosts();
    const ref = useRef<any>();
    const emptyString = "";
    const MIN_CHAR_LENGTH = 3;
    let searchTimer:any = null;
    
    const clearTextArea = () => {
        ref.current.value = emptyString;
    }

    const searchHandler = async() => {
        clearTimeout(searchTimer);
        props.searchModeHandler(true);
        props.showLoaderHandler(true);
        const result = await searchPostResult(ref.current.value, objectId, type);
        props.searchCountHandler(result);
        props.showLoaderHandler(false);
    }

    const resetSearch = async() => {
        props.resetSearchHandler();
    }

    const handleKeyPress = async(event?: any) => {
        clearTimeout(searchTimer);
        if(event.key === 'Enter'){
            await searchHandler();
            clearTextArea();
        } else {
            if(ref && ref.current.value.trim().length >= MIN_CHAR_LENGTH) {
                searchTimer = setTimeout(() => {
                    searchHandler();
                }, 1500)
            } else if(ref.current.value.trim() === emptyString) {
                await resetSearch();
            }
        }
    }

    return (
        <>
            <input 
                ref={ref} 
                onKeyUp={handleKeyPress} 
                className={styles.primeCommunitySearchInput} 
                placeholder={props.placeHolderText}>
            </input>
            <div className={styles.primeSearchButtonWrapper}>
                <button className={styles.primeSearchButton} onClick={searchHandler}>
                    {SOCIAL_SEARCH_SVG()}
                </button>
            </div>
        </>
    );
};
export default PrimeCommunitySearch;