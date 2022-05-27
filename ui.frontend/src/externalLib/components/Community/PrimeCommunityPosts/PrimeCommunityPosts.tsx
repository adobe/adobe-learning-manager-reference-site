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
import { usePosts } from "../../../hooks/community";
import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityPosts.module.css";

const PrimeCommunityPosts = (props: any) => {
  const boardId = props.boardId;
  const { posts, fetchPosts, loadMorePosts, hasMoreItems } = usePosts(boardId);
  const { formatMessage } = useIntl();
  const firstRun = useRef(true);

  useEffect(() => {
    //below needed as first update sets posts as []
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setTimeout(() => {
      posts ? props.showLoader(false) : props.showLoader(true);
    }, 700);
  }, [posts, props]);

  const sortFilterChangeHandler = async (sortValue: any) => {
    props.showLoader(true);
    await fetchPosts(boardId, sortValue);
    props.showLoader(false);
  };

  return (
    <>
      <div className={styles.primePostSectionWrapper}>
        <div className={styles.primePostSection}>
          {posts?.length > 0 && (
            <PrimeCommunityPostFilters
              sortFilterChangeHandler={sortFilterChangeHandler}
            ></PrimeCommunityPostFilters>
          )}
          {posts?.length > 0 && (
            <PrimeCommunityPostsContainer
              posts={posts}
              loadMorePosts={loadMorePosts}
              hasMoreItems={hasMoreItems}
            ></PrimeCommunityPostsContainer>
          )}
          {posts.length === 0 && !props.isSearchMode && (
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
