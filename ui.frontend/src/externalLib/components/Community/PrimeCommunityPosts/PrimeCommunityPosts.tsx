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
        if(firstRun.current) {
            firstRun.current = false;
            return;
        }
        posts ? props.showLoader(false) : props.showLoader(true);
    }, [posts])
    
    const sortFilterChangeHandler = (sortValue: any) => {
        fetchPosts(boardId, sortValue);
    }

    return (
        <>
        <div className={styles.primePostSectionWrapper}>
            <div className={styles.primePostSection}>
                {posts?.length > 0 && 
                    <PrimeCommunityPostFilters sortFilterChangeHandler={sortFilterChangeHandler}></PrimeCommunityPostFilters>}
                {posts?.length > 0 &&
                    <PrimeCommunityPostsContainer
                        posts={posts}
                        loadMorePosts={loadMorePosts}
                        hasMoreItems={hasMoreItems}>
                    </PrimeCommunityPostsContainer>
                }
                {posts.length === 0 && !props.isSearchMode &&
                    <div className={styles.primeCommunityNoPostFound}>
                        {formatMessage({
                            id: "prime.community.noPostMessage",
                            defaultMessage: "No post found",
                        })}
                    </div>
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityPosts;