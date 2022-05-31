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
import { PrimeCommunityPostsContainer } from "../PrimeCommunityPostsContainer";
import { PrimeCommunityPostFilters } from "../PrimeCommunityPostFilters";
import { PrimeCommunityAddPost } from "../PrimeCommunityAddPost";
import { PrimeCommunitySearch } from "../PrimeCommunitySearch";
import { ALMLoader } from "../../Common/ALMLoader";

import { usePosts } from "../../../hooks/community";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityPosts.module.css";

const PrimeCommunityPosts = (props: any) => {
  const boardId = props.boardId;
  const { posts, fetchPosts, loadMorePosts, hasMoreItems } = usePosts(boardId);
  const { formatMessage } = useIntl();
  const [showLoader, setShowLoader] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);

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
    await fetchPosts(boardId);
    setShowLoader(false);
  };
  const sortFilterChangeHandler = async (sortValue: any) => {
    setShowLoader(true);
    await fetchPosts(boardId, sortValue);
    setShowLoader(false);
  };

  return (
    <>
      <div className={styles.primeCommunityActionRowContainer}>
        <div className={styles.primeCommunityActionRowWrapper}>
          <PrimeCommunityAddPost boardId={boardId}></PrimeCommunityAddPost>
          <div className={styles.primeCommunitySearchWrapper}>
            {posts?.length > 0 && (
              <PrimeCommunityPostFilters
                sortFilterChangeHandler={sortFilterChangeHandler}
              ></PrimeCommunityPostFilters>
            )}
            <PrimeCommunitySearch
              objectId={boardId}
              type="board"
              searchCountHandler={(value: any) => searchCountHandler(value)}
              showLoaderHandler={showLoaderHandler}
              searchModeHandler={searchModeHandler}
              resetSearchHandler={resetSearchHandler}
              placeHolderText={formatMessage({
                id: "alm.community.searchInBoard.placeholder",
                defaultMessage: "Search within board",
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
        </div>
      )}
      <div className={styles.primePostSectionWrapper}>
        <div className={styles.primePostSection}>
          {posts?.length > 0 && (
            <PrimeCommunityPostsContainer
              posts={posts}
              loadMorePosts={loadMorePosts}
              hasMoreItems={hasMoreItems}
            ></PrimeCommunityPostsContainer>
          )}
          {posts.length === 0 && (
            <div className={styles.primeCommunityNoPostFound}>
              {formatMessage({
                id: "alm.community.noPostMessage",
                defaultMessage: "No post found",
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default PrimeCommunityPosts;
