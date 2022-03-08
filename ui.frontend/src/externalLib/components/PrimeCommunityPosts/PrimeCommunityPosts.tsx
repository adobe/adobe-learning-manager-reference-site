import { PrimeCommunityPost } from "../PrimeCommunityPost";
import { PrimeCommunityPostFilters } from "../PrimeCommunityPostFilters";
import { usePosts } from "../../hooks/community";
import styles from "./PrimeCommunityPosts.module.css";

const PrimeCommunityPosts = (props: any) => {
    const boardId = props.boardId;
    const { posts, fetchPosts } = usePosts(boardId);

    const sortFilterChangeHandler = (sortValue: any) => {
        fetchPosts(boardId, sortValue);
    }

    const reloadPosts = () => {
        fetchPosts(boardId)
    }

    return (
        <>
        <div className={styles.primePostSectionWrapper}>
            <div className={styles.primePostSection}>
                {posts?.length > 0 && 
                    <PrimeCommunityPostFilters sortFilterChangeHandler={sortFilterChangeHandler}></PrimeCommunityPostFilters>}
                {posts?.length > 0 &&
                    posts.map((post) => (
                    <PrimeCommunityPost post={post} key={post.id} reloadPosts={reloadPosts}></PrimeCommunityPost>
                    ))
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityPosts;