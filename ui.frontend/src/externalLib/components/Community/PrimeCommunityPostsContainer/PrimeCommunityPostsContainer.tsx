import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { PrimePost } from "../../../models/PrimeModels";
import { PrimeCommunityPost } from "../PrimeCommunityPost";
import styles from "./PrimeCommunityPostsContainer.module.css";
const PrimeCommunityPostsContainer: React.FC<{
  posts: PrimePost[] | null;
  loadMorePosts: () => void;
  hasMoreItems: boolean;
}> = ({ posts, loadMorePosts, hasMoreItems }) => {
  const listHtml = posts?.map((post) => (
    <PrimeCommunityPost post={post} key={post.id}></PrimeCommunityPost>
  ));

  return (
    <div>
      {listHtml}
      <div id="load-more-posts" className={styles.loadMoreContainer}>
        {hasMoreItems ? (
          <Provider theme={lightTheme} colorScheme={"light"}>
            <Button
              variant="cta"
              isQuiet
              onPress={loadMorePosts}
              UNSAFE_className={styles.loadMoreButton}
            >
              Load more
            </Button>
          </Provider>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PrimeCommunityPostsContainer;
