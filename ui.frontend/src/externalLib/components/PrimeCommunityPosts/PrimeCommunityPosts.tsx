import { PrimeCommunityPost } from "../PrimeCommunityPost";
import { PrimeCommunityPostFilters } from "../PrimeCommunityPostFilters";
import { usePosts } from "../../hooks/community";
import styles from "./PrimeCommunityPosts.module.css";

const PrimeCommunityPosts = (props: any) => {
    const boardId = props.boardId;
    const { items, fetchPosts } = usePosts(boardId);

    const sortFilterChangeHandler = (sortValue: any) => {
        fetchPosts(boardId, sortValue);
    }
    return (
        <>
        <div className={styles.primePostSectionWrapper}>
            <div className={styles.primePostSection}>
                <PrimeCommunityPostFilters sortFilterChangeHandler={sortFilterChangeHandler}></PrimeCommunityPostFilters>
                {items?.map((post) => (
                    <PrimeCommunityPost post={post} key={post.id}></PrimeCommunityPost>
                ))}
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityPosts;