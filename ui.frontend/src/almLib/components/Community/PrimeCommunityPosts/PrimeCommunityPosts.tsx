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
import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityPosts.module.css";
import { BOARD, PUBLIC } from "../../../utils/constants";
import { getALMUser } from "../../../utils/global";
import { PrimeUser } from "../../../models";

const PrimeCommunityPosts = (props: any) => {
  const board = props.board;
  const {
    posts,
    fetchPosts,
    loadMorePosts,
    hasMoreItems,
    fetchBoardModerators,
  } = usePosts(board.id);
  const { formatMessage } = useIntl();
  const [showLoader, setShowLoader] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResult, setSearchResult] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [user, setUser] = useState({} as PrimeUser);
  const [boardModerators, setBoardModerators] = useState([] as string[]);
  const showLoaderHandler = (value: any) => {
    setShowLoader(value);
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

  const searchModeHandler = (value: any) => {
    setIsSearchMode(value);
  };

  const resetSearchHandler = async () => {
    setIsSearchMode(false);
    setSearchResult(0);
    getPosts(board.id);
  };
  const sortFilterChangeHandler = async (sortValue: any) => {
    getPosts(board.id, sortValue);
  };

  const getPosts = async (boardId: any, sortValue?: any) => {
    setShowLoader(true);
    await fetchPosts(boardId, sortValue);
    setShowLoader(false);
  };

  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      setUser(response?.user || ({} as PrimeUser));
      const moderators = await fetchBoardModerators(board.id);
      let moderatorIds = [] as string[];
      moderators.userList.forEach((element) => {
        moderatorIds.push(element.id);
      });
      setBoardModerators(moderatorIds);
    })();
  }, []);

  const isNewPostAllowed = () => {
    if (
      board.visibility === PUBLIC ||
      boardModerators?.includes(user.id) ||
      board.postingAllowed
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div className={styles.primeCommunityActionRowContainer}>
        <div className={styles.primeCommunityActionRowWrapper}>
          {isNewPostAllowed() && (
            <PrimeCommunityAddPost boardId={board.id}></PrimeCommunityAddPost>
          )}
          <div className={styles.primeCommunitySearchWrapper}>
            {posts?.length > 0 && (
              <PrimeCommunityPostFilters
                sortFilterChangeHandler={sortFilterChangeHandler}
              ></PrimeCommunityPostFilters>
            )}
            <PrimeCommunitySearch
              objectId={board.id}
              type={BOARD}
              searchCountHandler={(results: any, queryString: string) =>
                searchCountHandler(results, queryString)
              }
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
