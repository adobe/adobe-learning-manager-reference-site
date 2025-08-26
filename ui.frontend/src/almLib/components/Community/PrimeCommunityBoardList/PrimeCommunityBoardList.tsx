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
import { SKILL } from "../../../utils/constants";
import { getQueryParamsFromUrl } from "../../../utils/global";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { ALMLoader } from "../../Common/ALMLoader";
import { useDialog } from "../../../contextProviders/ALMDialogContextProvider";
import { PrimeCommunityBoardFilters } from "../PrimeCommunityBoardFilters";
import { PrimeCommunityBoardsContainer } from "../PrimeCommunityBoardsContainer";
import { PrimeCommunityMobileBackBanner } from "../PrimeCommunityMobileBackBanner";
import { PrimeCommunityMobileScrollToTop } from "../PrimeCommunityMobileScrollToTop";
import { PrimeCommunityPost } from "../PrimeCommunityPost";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import { PrimeCommunityFeatureDialog } from "../PrimeCommunityFeatureDialog";
import styles from "./PrimeCommunityBoardList.module.css";

const PrimeCommunityBoardList = () => {
  const queryParams = getQueryParamsFromUrl();
  const DEFAULT_SORT_VALUE = "-dateUpdated";
  const DEFAULT_SKILL = queryParams ? queryParams.skill : "";

  const {
    items,
    fetchBoards,
    loadMoreBoards,
    hasMoreItems,
    skills,
    currentSkill,
    fetchMentionFeaturePopupFlag,
    setSocialMentionFeaturePopupState,
  } = useBoards(DEFAULT_SORT_VALUE, DEFAULT_SKILL);
  const { posts } = usePosts();
  const { formatMessage } = useIntl();
  const { openDialog, closeDialog, isOpen } = useDialog();
  const [selectedSortFilter, setSelectedSortFilter] =
    useState(DEFAULT_SORT_VALUE);
  const [selectedSkill, setSelectedSkill] = useState(currentSkill);
  const [showLoader, setShowLoader] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);
  const [searchString, setSearchString] = useState("");
  
  const FEATURE_DIALOG_ID = "community-feature-dialog";

  useEffect(() => {
    if (items) {
      setShowLoader(false);
    }
  }, [items]);

  useEffect(() => {
    checkAndShowFeatureDialog();
  }, []);

  const showLoaderHandler = (value: boolean) => {
    setShowLoader(value);
  };

  const checkAndShowFeatureDialog = async () => {
    try {
      const socialMentionFeaturePopupFlag = await fetchMentionFeaturePopupFlag();
      if (!socialMentionFeaturePopupFlag) {
        openDialog(FEATURE_DIALOG_ID);
      }
    } catch (error) {
      console.error("Error checking feature dialog flag:", error);
    }
  };

  const searchCountHandler = (results: any, queryString: string) => {
    setSearchResult(
      results
        ? results.length
        : formatMessage({
            id: "alm.community.search.no.label",
            defaultMessage: "No",
          })
    );
    setSearchString(queryString);
  };

  const searchModeHandler = (value: boolean) => {
    setIsSearchMode(value);
  };

  const resetSearchHandler = () => {
    setIsSearchMode(false);
    setSearchResult(0);
    getBoards(selectedSortFilter, selectedSkill);
  };

  const sortFilterChangeHandler = (sortValue: string) => {
    setSelectedSortFilter(sortValue);
    getBoards(sortValue, selectedSkill);
  };

  const skillFilterChangeHandler = (skill: string) => {
    setSelectedSkill(skill);
    getBoards(selectedSortFilter, skill);
  };

  const getBoards = async (sortFilter: string, skillFilter: string) => {
    setShowLoader(true);
    await fetchBoards(sortFilter, skillFilter);
    setShowLoader(false);
  };

  const handleFeatureDialogClose = async () => {
    try {
      const shouldShow = await setSocialMentionFeaturePopupState();
      if(!shouldShow) {
        closeDialog(FEATURE_DIALOG_ID);
      }
    } catch (error) {
      console.error("Error updating feature popup flag:", error);
      // Still close the dialog even if the API call fails
      closeDialog(FEATURE_DIALOG_ID);
    }
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
                type={SKILL}
                searchCountHandler={(results: any, queryString: string) =>
                  searchCountHandler(results, queryString)
                }
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
          <div className={styles.primeCommunitySearchStatusWrapper}>
            <div className={styles.primeCommunitySearchStatus}>
              <div className={styles.primeCommunitySearchCount}>
                {searchResult}{" "}
                {formatMessage({
                  id: "alm.community.search.resultFound",
                  defaultMessage: "result(s) found for",
                })}{" "}
                '{searchString}'
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
          </div>
        )}
        {isSearchMode &&
          posts?.length > 0 &&
          posts.map((post) => (
            <div className={styles.primeCommunitySearchResultContainer}>
              <PrimeCommunityPost
                post={post}
                key={post.id}
                showBorder={true}
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
        
        {/* Feature Dialog */}
        {isOpen(FEATURE_DIALOG_ID) && (
          <PrimeCommunityFeatureDialog
            id={FEATURE_DIALOG_ID}
            onClose={handleFeatureDialogClose}
          />
        )}
      </div>
    </ALMErrorBoundary>
  );
};

export default PrimeCommunityBoardList;
