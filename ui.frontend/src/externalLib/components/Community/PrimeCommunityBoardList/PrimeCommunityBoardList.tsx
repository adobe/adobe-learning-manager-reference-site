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
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useBoards, usePosts } from "../../../hooks/community";
import { getQueryParamsFromUrl } from "../../../utils/global";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCommunityBoardFilters } from "../PrimeCommunityBoardFilters";
import { PrimeCommunityBoardsContainer } from "../PrimeCommunityBoardsContainer";
import { PrimeCommunityMobileBackBanner } from "../PrimeCommunityMobileBackBanner";
import { PrimeCommunityMobileScrollToTop } from "../PrimeCommunityMobileScrollToTop";
import { PrimeCommunityPost } from "../PrimeCommunityPost";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import styles from "./PrimeCommunityBoardList.module.css";

const PrimeCommunityBoardList = () => {
  const queryParams = getQueryParamsFromUrl();
  const DEFAULT_SORT_VALUE = "dateUpdated";
  const DEFAULT_SKILL = queryParams ? queryParams.skill : "";
  const {
    items,
    fetchBoards,
    loadMoreBoards,
    hasMoreItems,
    skills,
    currentSkill,
  } = useBoards(DEFAULT_SORT_VALUE, DEFAULT_SKILL);
  const { posts } = usePosts();
  const { formatMessage } = useIntl();
  const [selectedSortFilter, setSelectedSortFilter] =
    useState(DEFAULT_SORT_VALUE);
  const [selectedSkill, setSelectedSkill] = useState(currentSkill);
  const [showLoader, setShowLoader] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);

  useEffect(() => {
    if (items) {
      setShowLoader(false);
    }
  }, [items]);

  const showLoaderHandler = (value: any) => {
    setShowLoader(value);
  };

  const searchCountHandler = (value: any) => {
    setSearchResult(
      value
        ? value.length
        : formatMessage({
            id: "alm.community.search.no.label",
            defaultMessage: "No",
          })
    );
  };

  const searchModeHandler = (value: any) => {
    setIsSearchMode(value);
  };

  const resetSearchHandler = async () => {
    setIsSearchMode(false);
    setSearchResult(0);
    setShowLoader(true);
    await fetchBoards(selectedSortFilter, selectedSkill);
    setShowLoader(false);
  };

  const sortFilterChangeHandler = async (sortValue: any) => {
    setSelectedSortFilter(sortValue);
    setShowLoader(true);
    await fetchBoards(sortValue, selectedSkill);
    setShowLoader(false);
  };

  const skillFilterChangeHandler = async (skill: any) => {
    setSelectedSkill(skill);
    setShowLoader(true);
    await fetchBoards(selectedSortFilter, skill);
    setShowLoader(false);
  };

  return (
    <ALMErrorBoundary>
      <div>
        {/* Below 2 are seen only in mobile view */}
        <PrimeCommunityMobileBackBanner></PrimeCommunityMobileBackBanner>
        <PrimeCommunityMobileScrollToTop></PrimeCommunityMobileScrollToTop>

        <div className={styles.primeCommunityHeaderRow}>
          <PrimeCommunityBoardFilters
            skills={skills}
            selectedSkill={currentSkill}
            sortFilterChangeHandler={sortFilterChangeHandler}
            skillFilterChangeHandler={skillFilterChangeHandler}
          ></PrimeCommunityBoardFilters>
          <div className={styles.primeCommunitySearchContainer}>
            <div className={styles.primeCommunitySearchWrapper}>
              <PrimeCommunitySearch
                objectId={selectedSkill}
                type="skill"
                searchCountHandler={(value: any) => searchCountHandler(value)}
                showLoaderHandler={showLoaderHandler}
                searchModeHandler={searchModeHandler}
                resetSearchHandler={resetSearchHandler}
                placeHolderText={formatMessage({
                  id: "alm.community.search.placeholder",
                  defaultMessage: "Search within community",
                })}
              ></PrimeCommunitySearch>
            </div>
          </div>
        </div>
        {showLoader && (
          <div className={styles.primeLoaderWrapper}>
            <ALMLoader />
          </div>
        )}
        {isSearchMode && !showLoader && (
          <div className={styles.primeCommunitySearchStatus}>
            <div className={styles.primeCommunitySearchCount}>
              {searchResult}{" "}
              {formatMessage({
                id: "alm.community.search.resultFound",
                defaultMessage: "result(s) found",
              })}
            </div>
            <button
              className={styles.primeCommunitySearchClear}
              onClick={resetSearchHandler}
            >
              (
              {formatMessage({
                id: "alm.community.search.clear.label",
                defaultMessage: "Clear",
              })}
              )
            </button>
          </div>
        )}
        {isSearchMode &&
          posts?.length > 0 &&
          posts.map((post) => (
            <div className={styles.primeCommunitySearchResultContainer}>
              <PrimeCommunityPost
                post={post}
                key={post.id}
              ></PrimeCommunityPost>
            </div>
          ))}
        {!isSearchMode && items?.length > 0 && (
          <PrimeCommunityBoardsContainer
            boards={items}
            loadMoreBoards={loadMoreBoards}
            hasMoreItems={hasMoreItems}
          ></PrimeCommunityBoardsContainer>
        )}
        {!isSearchMode && items?.length === 0 && (
          <div className={styles.primeCommunityNoBoardFound}>
            {formatMessage({
              id: "alm.community.noBoardMessage",
              defaultMessage: "No boards found",
            })}
          </div>
        )}
      </div>
    </ALMErrorBoundary>
  );
};

export default PrimeCommunityBoardList;
