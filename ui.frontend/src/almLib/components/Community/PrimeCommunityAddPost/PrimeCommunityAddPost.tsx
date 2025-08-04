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
import { useIntl } from "react-intl";
import { usePost } from "../../../hooks/community";
import { PrimeCommunityAddPostButton } from "../PrimeCommunityAddPostButton";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import styles from "./PrimeCommunityAddPost.module.css";

const PrimeCommunityAddPost = (props: any) => {
  const boardId = props.boardId;
  const { formatMessage } = useIntl();
  const { addPost } = usePost();
  const [almConfirmationAlert] = useConfirmationAlert();
  const EMPTY = "";
  const savePostHandler = async (
    input: any,
    postingType: any,
    resource: any,
    isResourceModified: any,
    pollOptions: any
  ) => {
    try {
      await addPost(
        boardId,
        input,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
      // below setTimeout is needed to fix spetrum dialog breaking scroll issue
      setTimeout(() => {
        showConfirmationDialog();
      }, 1000);
    } catch (exception) {
      console.log("Error in creating Post");
    }
  };

  const showConfirmationDialog = () => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.postPublished.label",
        defaultMessage: "Post Published",
      }),
      formatMessage({
        id: "alm.community.postPublished.successMessage",
        defaultMessage:
          "Your post has been published. It may take some time to appear on the board.",
      }),
      formatMessage({
        id: "alm.community.ok.label",
        defaultMessage: "Ok",
      }),
      EMPTY,
      props.reloadPosts
    );
  };

  return (
    <>
      <div className={styles.primeAddPostSectionWrapper}>
        <div className={styles.primeAddPostSection}>
          <div className={styles.primeAddPostButtonDiv}>
            <PrimeCommunityAddPostButton
              savePostHandler={(
                input: any,
                postingType: any,
                resource: any,
                isResourceModified: any,
                pollOptions: any
              ) =>
                savePostHandler(
                  input,
                  postingType,
                  resource,
                  isResourceModified,
                  pollOptions
                )
              }
              boardId={boardId}
            ></PrimeCommunityAddPostButton>
          </div>
        </div>
      </div>
      {/* below is for mobile only */}
      <div className={styles.primeAddPostButtonMobile}>
        <PrimeCommunityAddPostButton
          savePostHandler={(
            input: any,
            postingType: any,
            resource: any,
            isResourceModified: any,
            pollOptions: any
          ) =>
            savePostHandler(
              input,
              postingType,
              resource,
              isResourceModified,
              pollOptions
            )
          }
          inMobileView={true}
        ></PrimeCommunityAddPostButton>
      </div>
    </>
  );
};
export default PrimeCommunityAddPost;
