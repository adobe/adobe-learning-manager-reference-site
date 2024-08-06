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
import { useComments } from "../../../hooks/community";
import { PrimeCommunityComment } from "../PrimeCommunityComment";
import styles from "./PrimeCommunityComments.module.css";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

const PrimeCommunityComments = (props: any) => {
  const { formatMessage } = useIntl();
  const postId = props.object.id;
  const { items, loadMoreComments, hasMoreItems, patchComment, markCommentAsRightAnswer } =
    useComments();
  const [answerCommentId, setAnswerCommentId] = useState("");

  useEffect(() => {
    items
      ?.filter(comment => comment.parent.id === postId)
      .map(comment => {
        if (comment.isCorrectAnswer) {
          setAnswerCommentId(comment.id);
          return comment.id;
        }
        return null;
      });
  }, [items, postId]);

  const deleteCommentHandler = () => {
    if (typeof props.deleteCommentHandler === "function") {
      props.deleteCommentHandler();
    }
  };

  const updateComment = async (commentId: any, value: any) => {
    try {
      await patchComment(commentId, value);
    } catch (exception) {
      console.log("error while updating comment");
    }
  };

  const updateRightAnswerHandler = async (commentId: any, value: any) => {
    try {
      await markCommentAsRightAnswer(commentId, value);
      setAnswerCommentId(value ? commentId : "");
    } catch (exception) {
      console.log("error while updating comment");
    }
  };

  return (
    <>
      <div className={styles.primeCommentSectionWrapper}>
        <div className={styles.primeCommentSection}>
          {items
            ?.filter(comment => comment.parent.id === postId)
            .map(comment => (
              <PrimeCommunityComment
                comment={comment}
                parentPost={props.object}
                key={comment.id}
                deleteCommentHandler={deleteCommentHandler}
                updateComment={updateComment}
                updateRightAnswerHandler={updateRightAnswerHandler}
                answerCommentId={answerCommentId}
              ></PrimeCommunityComment>
            ))}
          {hasMoreItems && (
            <button className={styles.showMoreCommentsButton} onClick={loadMoreComments}>
              {formatMessage({
                id: "alm.community.showMoreComments",
                defaultMessage: "Show more comments",
              })}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
export default PrimeCommunityComments;
