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
import React, { useRef } from "react";
import { usePosts } from "../../../hooks/community";
import { SOCIAL_SEARCH_SVG } from "../../../utils/inline_svg";
import styles from "./PrimeCommunitySearch.module.css";

const PrimeCommunitySearch = (props: any) => {
  // const { formatMessage } = useIntl();
  const objectId = props.objectId;
  const type = props.type;
  const { searchPostResult } = usePosts();
  const ref = useRef<any>();
  const emptyString = "";
  const MIN_CHAR_LENGTH = 3;
  let searchTimer: any = null;

  const clearTextArea = () => {
    ref.current.value = emptyString;
  };

  const searchHandler = async () => {
    clearTimeout(searchTimer);
    props.searchModeHandler(true);
    props.showLoaderHandler(true);
    const result = await searchPostResult(ref.current.value, objectId, type);
    props.searchCountHandler(result);
    props.showLoaderHandler(false);
  };

  const resetSearch = async () => {
    props.resetSearchHandler();
  };

  const handleKeyPress = async (event?: any) => {
    clearTimeout(searchTimer);
    if (event.key === "Enter") {
      await searchHandler();
      clearTextArea();
    } else {
      if (ref && ref.current.value.trim().length >= MIN_CHAR_LENGTH) {
        searchTimer = setTimeout(() => {
          searchHandler();
        }, 1500);
      } else if (ref.current.value.trim() === emptyString) {
        await resetSearch();
      }
    }
  };

  return (
    <>
      <div className={styles.primeCommunitySearchParent}>
        <input
          ref={ref}
          onKeyUp={handleKeyPress}
          className={styles.primeCommunitySearchInput}
          placeholder={props.placeHolderText}
          ></input>
        <div className={styles.primeSearchButtonWrapper}>
          <button className={styles.primeSearchButton} onClick={searchHandler}>
            {SOCIAL_SEARCH_SVG()}
          </button>
        </div>
      </div>
    </>
  );
};
export default PrimeCommunitySearch;
