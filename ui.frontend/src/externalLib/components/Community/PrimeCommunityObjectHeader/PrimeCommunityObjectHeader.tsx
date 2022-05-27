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
import styles from "./PrimeCommunityObjectHeader.module.css";
import { formatDate } from "../../../utils/dateTime";
import { SOCIAL_MORE_OPTIONS_SVG } from "../../../utils/inline_svg";
import { useState } from "react";
import { useCommunityObjectOptions } from "../../../hooks/community";
import { PrimeCommunityObjectOptions } from "../PrimeCommunityObjectOptions";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { useIntl } from "react-intl";

const PrimeCommunityObjectHeader = (props: any) => {
  const { formatMessage } = useIntl();
  const object = props.object;
  const parentPost = props.parentPost;
  const [showOptions, setShowOptions] = useState(false);
  const {
    deletePostFromServer,
    reportPostAbuse,
    deleteCommentFromServer,
    reportCommentAbuse,
    deleteReplyFromServer,
    reportReplyAbuse,
  } = useCommunityObjectOptions();
  const [showUpdatePostModal, setShowUpdatePostModal] = useState(false);
  const [almConfirmationAlert] = useConfirmationAlert();

  const optionsClickHandler = () => {
    toggleOptions();
  };

  const toggleOptions = () => {
    setShowOptions((state) => !state);
  };

  const getDeleteConfirmationString = () => {
    switch (props.type) {
      case "post":
        return formatMessage({
          id: "alm.community.post.deleteConfirmation",
          defaultMessage: "Are you sure you want to delete this post?",
        });
      case "comment":
        return formatMessage({
          id: "alm.community.comment.deleteConfirmation",
          defaultMessage: "Are you sure you want to delete this comment?",
        });
      case "reply":
        return formatMessage({
          id: "alm.community.reply.deleteConfirmation",
          defaultMessage: "Are you sure you want to delete this reply?",
        });
      default:
        console.log("object type is missing");
        return "";
    }
  };

  const deleteHandler = () => {
    showConfirmationDialog(getDeleteConfirmationString(), "delete");
  };

  const getReportConfirmationString = () => {
    switch (props.type) {
      case "post":
        return formatMessage({
          id: "alm.community.post.reportConfirmation",
          defaultMessage: "Are you sure you want to report this post?",
        });
      case "comment":
        return formatMessage({
          id: "alm.community.comment.reportConfirmation",
          defaultMessage: "Are you sure you want to report this comment?",
        });
      case "reply":
        return formatMessage({
          id: "alm.community.reply.reportConfirmation",
          defaultMessage: "Are you sure you want to report this reply?",
        });
      default:
        console.log("object type is missing");
        return "";
    }
  };
  const reportAbuseHandler = () => {
    showConfirmationDialog(getReportConfirmationString(), "report");
  };

  const deletePost = async () => {
    await deletePostFromServer(object.id);
  };

  const reportPost = async () => {
    await reportPostAbuse(object.id);
  };

  const deleteComment = async () => {
    await deleteCommentFromServer(object.id);
    if (typeof props.deleteObjectHandler === "function") {
      props.deleteObjectHandler();
    }
  };

  const reportComment = async () => {
    await reportCommentAbuse(object.id);
  };

  const deleteReply = async () => {
    await deleteReplyFromServer(object.id);
    if (typeof props.deleteObjectHandler === "function") {
      props.deleteObjectHandler();
    }
  };

  const reportReply = async () => {
    await reportReplyAbuse(object.id);
  };

  const showConfirmationDialog = (
    confirmationMessage: String,
    primaryAction: String
  ) => {
    almConfirmationAlert(
      formatMessage({
        id: "alm.community.board.confirmationRequired",
        defaultMessage: "Confirmation Required",
      }),
      confirmationMessage,
      formatMessage({
        id: "alm.overview.button.continue",
        defaultMessage: "Continue",
      }),
      formatMessage({
        id: "alm.community.cancel.label",
        defaultMessage: "Cancel",
      }),
      props.type === "comment"
        ? primaryAction === "delete"
          ? deleteComment
          : reportComment
        : props.type === "reply"
        ? primaryAction === "delete"
          ? deleteReply
          : reportReply
        : primaryAction === "delete"
        ? deletePost
        : reportPost
    );
  };

  const editHandler = () => {
    switch (props.type) {
      case "post":
        setShowUpdatePostModal(true);
        break;
      default:
        props.updateObjectHandler();
        break;
    }
  };

  const updateObjectHandler = (
    input: any,
    postingType: any,
    resource: any,
    isResourceModified: any,
    pollOptions: any
  ) => {
    if (typeof props.updateObjectHandler === "function") {
      props.updateObjectHandler(
        input,
        postingType,
        resource,
        isResourceModified,
        pollOptions
      );
    }
    setShowUpdatePostModal(false);
  };

  const updateRightAnswerHandler = (value: any) => {
    if (typeof props.updateRightAnswerHandler === "function") {
      props.updateRightAnswerHandler(value);
    }
  };

  const closeDialogHandler = () => {
    setShowUpdatePostModal(false);
  };

  return (
    <>
      <div className={styles.primePostHeader}>
        <img
          className={styles.primePostOwnerImage}
          aria-hidden="true"
          alt="user-image"
          src={object.createdBy.avatarUrl}
        ></img>
        <span className={styles.primePostOwnerName}>
          {object.createdBy.name}
        </span>
        <span className={styles.primePostDateSeperator}></span>
        <span className={styles.primePostDateCreated}>
          {formatDate(object.dateCreated)}
        </span>
        <button
          className={styles.primeCommunityOptionsIcon}
          onClick={optionsClickHandler}
        >
          {SOCIAL_MORE_OPTIONS_SVG()}
          {showOptions && (
            <PrimeCommunityObjectOptions
              object={object}
              type={props.type}
              parentPost={parentPost}
              toggleOptions={toggleOptions}
              editHandler={editHandler}
              updateRightAnswerHandler={updateRightAnswerHandler}
              answerCommentId={props.answerCommentId}
              deleteHandler={deleteHandler}
              reportAbuseHandler={reportAbuseHandler}
            ></PrimeCommunityObjectOptions>
          )}
        </button>
        {showUpdatePostModal && (
          <PrimeCommunityAddPostDialogTrigger
            className={styles.primeAddPostButton}
            openDialog={true}
            post={object}
            mode="update"
            savePostHandler={(
              input: any,
              postingType: any,
              resource: any,
              isResourceModified: any,
              pollOptions: any
            ) => {
              updateObjectHandler(
                input,
                postingType,
                resource,
                isResourceModified,
                pollOptions
              );
            }}
            closeDialogHandler={closeDialogHandler}
          ></PrimeCommunityAddPostDialogTrigger>
        )}
      </div>
    </>
  );
};
export default PrimeCommunityObjectHeader;
