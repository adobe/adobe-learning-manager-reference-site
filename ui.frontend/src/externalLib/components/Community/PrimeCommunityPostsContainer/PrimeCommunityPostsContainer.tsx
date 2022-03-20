import { useRef } from "react";
import { useLoadMore } from "../../../hooks/loadMore";
import { PrimePost } from "../../../models/PrimeModels";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCommunityPost } from "../PrimeCommunityPost";

const PrimeCommunityPostsContainer: React.FC<{
    posts: PrimePost[] | null;
    loadMorePosts: () => void;
    hasMoreItems: boolean;
}> = ({ posts, loadMorePosts, hasMoreItems }) => {
    const elementRef = useRef(null);
    useLoadMore({
        items: posts,
        callback: loadMorePosts,
        elementRef,
    });
    const listHtml = posts?.map((post) => (
        <PrimeCommunityPost post={post} key={post.id}></PrimeCommunityPost>
    ));

    return (
        <div>
            {listHtml}
            <div ref={elementRef} id="load-more-posts">
                {hasMoreItems ? <ALMLoader /> : ""}
            </div>
        </div>
    );
};

export default PrimeCommunityPostsContainer;
