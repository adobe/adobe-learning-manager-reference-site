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
import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { useIntl } from "react-intl";
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
  const { formatMessage } = useIntl();

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
              {formatMessage({
                id: "alm.community.loadMore",
                defaultMessage: "Load more",
              })}
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
