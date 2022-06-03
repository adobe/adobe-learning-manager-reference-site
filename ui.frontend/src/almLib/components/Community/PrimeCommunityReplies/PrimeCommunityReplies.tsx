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
import { useReplies } from "../../../hooks/community";
import { PrimeCommunityReply } from "../PrimeCommunityReply";
import styles from "./PrimeCommunityReplies.module.css";
import { useIntl } from "react-intl";

const PrimeCommunityReplies = (props: any) => {
  const { formatMessage } = useIntl();
  const commentId = props.object.id;
  const { items, patchReply, loadMoreReplies, hasMoreItems } =
    useReplies(commentId);

  const deleteReplyHandler = async () => {
    if (typeof props.deleteReplyHandler === "function") {
      props.deleteReplyHandler();
    }
  };

  const updateReply = async (replyId: any, value: any) => {
    try {
      await patchReply(replyId, value);
    } catch (exception) {
      console.log("error while updating reply");
    }
  };

  return (
    <>
      <div className={styles.primeReplySectionWrapper}>
        <div className={styles.primeReplySection}>
          {items
            ?.filter((reply) => reply.parent.id === commentId)
            .map((reply) => (
              <PrimeCommunityReply
                reply={reply}
                key={reply.id}
                deleteReplyHandler={deleteReplyHandler}
                updateReply={updateReply}
              ></PrimeCommunityReply>
            ))}
          {hasMoreItems && (
            <button
              className={styles.showMoreRepliesButton}
              onClick={loadMoreReplies}
            >
              {formatMessage({
                id: "alm.community.showMoreReplies",
                defaultMessage: "Show more replies",
              })}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
export default PrimeCommunityReplies;
