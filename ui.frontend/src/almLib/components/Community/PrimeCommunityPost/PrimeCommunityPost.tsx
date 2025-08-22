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
import { PrimeCommunityObjectHeader } from "../PrimeCommunityObjectHeader";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import { PrimeCommunityObjectActions } from "../PrimeCommunityObjectActions";
import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
import { PrimeCommunityComments } from "../PrimeCommunityComments";
import { useIntl } from "react-intl";
import { useComments, usePost } from "../../../hooks/community";
import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { DOWN, DOWNVOTE, POST, UP, UPVOTE } from "../../../utils/constants";
import styles from "./PrimeCommunityPost.module.css";
import { formatMention, processMention } from "../../../utils/mentionUtils";
import { State } from "../../../store/state";

const PrimeCommunityPost = (props: any) => {
  const { formatMessage } = useIntl();
  const ref = useRef<any>();
  const [post, setPost] = useState(props.post);
  const { items: postItems } = useSelector((state: State) => state.social.posts);
  const { addComment, votePost, deletePostVote, patchPost, submitPollVote } =
    usePost();
  const { fetchComments } = useComments();
  const myVoteStatus = post.myVoteStatus ? post.myVoteStatus : "";
  const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === UPVOTE);
  const [upVoteCount, setUpVoteCount] = useState(post.upVote);
  const [myDownVoteStatus, setMyDownVoteStatus] = useState(
    myVoteStatus === DOWNVOTE
  );
  const [downVoteCount, setDownVoteCount] = useState(post.downVote);
  const firstRunForUpvote = useRef(true);
  const firstRunForDownvote = useRef(true);
  const [showComments, setShowComments] = useState(false);
  const showCommentsLabel = formatMessage({
    id: "alm.community.post.showComments",
    defaultMessage: "Show Comments",
  });
  const hideCommentsLabel = formatMessage({
    id: "alm.community.post.hideComments",
    defaultMessage: "Hide Comments",
  });
  const [buttonLabel, setButtonLabel] = useState(showCommentsLabel);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [postDescription, setPostDescription] = useState(post.richText);
  const [almConfirmationAlert] = useConfirmationAlert();
  const EMPTY = "";

  const viewButtonClickHandler = () => {
    if (!showComments) {
      if (commentCount > 0) {
        showCommentsSection();
        fetchComments(post.id);
      }
    } else {
      hideCommentsSection();
    }
  };

  const showCommentsSection = () => {
    setShowComments(true);
    setButtonLabel(hideCommentsLabel);
  };

  const hideCommentsSection = () => {
    setShowComments(false);
    setButtonLabel(showCommentsLabel);
  };

  useEffect(() => {
    if (firstRunForUpvote.current) {
      firstRunForUpvote.current = false;
      return;
    }
    myUpVoteStatus === true
      ? setUpVoteCount(upVoteCount + 1)
      : setUpVoteCount(upVoteCount - 1);
  }, [myUpVoteStatus]);

  useEffect(() => {
    if (firstRunForDownvote.current) {
      firstRunForDownvote.current = false;
      return;
    }
    myDownVoteStatus === true
      ? setDownVoteCount(downVoteCount + 1)
      : setDownVoteCount(downVoteCount - 1);
  }, [myDownVoteStatus]);

  useEffect(() => {
    if (commentCount === 0) {
      setShowComments(false);
      setButtonLabel(showCommentsLabel);
    }
  }, [commentCount, showCommentsLabel]);

  const upVoteButtonClickHandler = () => {
    //if already upVoted, delete vote
    myUpVoteStatus ? deletePostVote(post.id, UP) : votePost(post.id, UP);
    if (!myUpVoteStatus && myDownVoteStatus) {
      setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
    }
    setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
  };

  const downVoteButtonClickHandler = () => {
    //if already downVoted, delete vote
    myDownVoteStatus ? deletePostVote(post.id, DOWN) : votePost(post.id, DOWN);
    if (!myDownVoteStatus && myUpVoteStatus) {
      setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
    }
    setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
  };

  const saveCommentHandler = async (value: any) => {
    try {
      const formattedValue = formatMention(value);
      await addComment(post.id, formattedValue);
      setCommentCount(commentCount + 1);
      fetchComments(post.id);
      showCommentsSection();
    } catch (exception) {
      console.log("not updating comment count");
    }
  };

  const deleteCommentHandler = () => {
    setCommentCount(commentCount - 1);
  };

  const updatePostHandler = async (
    input: any,
    postingType: any,
    resource: any,
    isResourceModified: any,
    pollOptions: any
  ) => {
    try {
      await patchPost(
        post.id,
        input,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
      showConfirmationDialog(input);
    } catch (exception) {
      console.log("Error in creating Post");
    }
  };

  const showConfirmationDialog = (input: any) => {
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
      () => {
        // Find the post from postItems by post.id
        const foundPost = postItems?.find((item) => item.id === post.id);
        if (foundPost && foundPost.richText && (foundPost as any).userMentions) {
          const processedDescription = processMention(foundPost.richText, (foundPost as any).userMentions);
          setPostText(processedDescription);
          setPost(foundPost);
        } else {
          setPostText(input);
        }
      }
    );
  };

  const setPostText = (input: any) => {
    setPostDescription(input);
  };

  const submitPoll = (optionId: any) => {
    submitPollVote(post.id, optionId);
  };

  return (
    <>
      <div
        className={
          props.showBorder
            ? styles.primePostWrapperWithBorder
            : styles.primePostWrapper
        }
      >
        <PrimeCommunityObjectHeader
          object={post}
          type={POST}
          description={postDescription}
          updateObjectHandler={(
            input: any,
            postingType: any,
            resource: any,
            isResourceModified: any,
            pollOptions: any
          ) => {
            updatePostHandler(
              input,
              postingType,
              resource,
              isResourceModified,
              pollOptions
            );
          }}
        ></PrimeCommunityObjectHeader>
        <PrimeCommunityObjectBody
          object={post}
          type={POST}
          description={postDescription}
          submitPoll={(optionId: any) => {
            submitPoll(optionId);
          }}
        ></PrimeCommunityObjectBody>
        <PrimeCommunityObjectActions
          buttonLabel={buttonLabel}
          buttonCount={commentCount}
          viewButtonClickHandler={viewButtonClickHandler}
          myUpVoteStatus={myUpVoteStatus}
          upVoteCount={upVoteCount}
          upVoteButtonClickHandler={upVoteButtonClickHandler}
          myDownVoteStatus={myDownVoteStatus}
          downVoteCount={downVoteCount}
          downVoteButtonClickHandler={downVoteButtonClickHandler}
          resource={post.resource ? post.resource : null}
        ></PrimeCommunityObjectActions>
        <div className={styles.primeCommentInputWrapper}>
          <PrimeCommunityObjectInput
            ref={ref}
            object={post}
            inputPlaceholder={formatMessage({
              id: "alm.community.post.commentHere",
              defaultMessage: "Comment here",
            })}
            primaryActionHandler={(value: any) => saveCommentHandler(value)}
            concisedToolbarOptions={true}
          ></PrimeCommunityObjectInput>
        </div>
        {showComments && (
          <PrimeCommunityComments
            object={post}
            deleteCommentHandler={deleteCommentHandler}
          ></PrimeCommunityComments>
        )}
      </div>
      {!props.showBorder && <hr className={styles.postSeperator} />}{" "}
    </>
  );
};

export default PrimeCommunityPost;
