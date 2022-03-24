import styles from "./PrimeCommunityObjectHeader.module.css";
import { formatDate } from "../../../utils/dateTime";
import {
  SOCIAL_MORE_OPTIONS_SVG
} from "../../../utils/inline_svg"
import { useState } from "react";
import { PrimeAlertDialog } from "../PrimeAlertDialog";
import { useCommunityObjectOptions } from "../../../hooks/community"
import { PrimeCommunityObjectOptions } from "../PrimeCommunityObjectOptions";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger"
import { useIntl } from "react-intl";

const PrimeCommunityObjectHeader = (props: any) => {
  const { formatMessage } = useIntl();
  const object = props.object;
  const parentPost = props.parentPost;
  const [ showOptions, setShowOptions ] = useState(false);
  const [ showConfirmation, setShowConfirmation ] = useState(false);
  const [ confirmationMessage, setConfirmationMessage] = useState("");
  const { 
    deletePostFromServer, 
    reportPostAbuse, 
    deleteCommentFromServer, 
    reportCommentAbuse,
    deleteReplyFromServer,
    reportReplyAbuse
    } = useCommunityObjectOptions();
  const [ primaryAction, setPrimaryAction ] = useState("");
  const [ showUpdatePostModal, setShowUpdatePostModal] = useState(false);

  const optionsClickHandler = () => {
    toggleOptions();
  }

  const toggleOptions = () => {
    setShowOptions((state) => !state);
  }

  const deleteHandler = () => {
    switch(props.type) {
      case "post":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.post.deleteConfirmation",
            defaultMessage: "Are you sure you want to delete this post?"
          })
        );
        break;
      case "comment":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.comment.deleteConfirmation",
            defaultMessage: "Are you sure you want to delete this comment?"
          })
        );
        break;
      case "reply":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.reply.deleteConfirmation",
            defaultMessage: "Are you sure you want to delete this reply?"
          })
        );
        break;
      default:
        console.log("object type is missing");
    }
    setPrimaryAction("delete");
    showConfirmationDialog();
  }

  const reportAbuseHandler = () => {
    switch(props.type) {
      case "post":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.post.reportConfirmation",
            defaultMessage: "Are you sure you want to report this post?"
          })
        );
        break;
      case "comment":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.comment.reportConfirmation",
            defaultMessage: "Are you sure you want to report this comment?"
          })
        );
        break;
      case "reply":
        setConfirmationMessage(
          formatMessage({
            id: "prime.community.reply.reportConfirmation",
            defaultMessage: "Are you sure you want to report this reply?"
          })
        );
        break;
      default:
        console.log("object type is missing");
    }
    setPrimaryAction("report");
    showConfirmationDialog();
  }

  const deletePost = async() => {
    await deletePostFromServer(object.id);
  }

  const reportPost = async() => {
    await reportPostAbuse(object.id);
    hideConfirmationDialog();
  }

  const deleteComment = async() => {
    await deleteCommentFromServer(object.id);
    if(typeof props.deleteObjectHandler === 'function') {
      props.deleteObjectHandler();
    }
  }

  const reportComment = async() => {
    await reportCommentAbuse(object.id);
    hideConfirmationDialog();
  }

  const deleteReply = async() => {
    await deleteReplyFromServer(object.id);
    if(typeof props.deleteObjectHandler === 'function') {
      props.deleteObjectHandler();
    }
  }

  const reportReply = async() => {
    await reportReplyAbuse(object.id);
    hideConfirmationDialog();
  }

  const showConfirmationDialog = () => {
    setShowConfirmation(true);
  }

  const hideConfirmationDialog = () => {
    setShowConfirmation(false);
  }

  const editHandler = () => {
    switch(props.type) {
      case "post":
        setShowUpdatePostModal(true);
        break;
      default:
        props.updateObjectHandler();
        break;
    }
  }

  const updateObjectHandler = (input: any, postingType: any, resource: any, isResourceModified: any) => {
    if(typeof props.updateObjectHandler === 'function') {
        props.updateObjectHandler(input, postingType, resource, isResourceModified);
    }
    setShowUpdatePostModal(false);
  }

  const updateRightAnswerHandler = (value: any) => {
    if(typeof props.updateRightAnswerHandler === 'function') {
        props.updateRightAnswerHandler(value);
    }
  }

  const closeDialogHandler = () => {
    setShowUpdatePostModal(false);
  }

  return (
      <>
      <div className={styles.primePostHeader}>
        <img className={styles.primePostOwnerImage} aria-hidden="true" alt="user-image" src={object.createdBy.avatarUrl}></img>
        <span className={styles.primePostOwnerName}>{object.createdBy.name}</span>
        <span className={styles.primePostDateSeperator}></span>
        <span className={styles.primePostDateCreated}>{formatDate(object.dateCreated)}</span>
        <button className={styles.primeCommunityOptionsIcon} onClick={optionsClickHandler}>
          {SOCIAL_MORE_OPTIONS_SVG()}
          {showOptions &&
            <PrimeCommunityObjectOptions 
              object={object} 
              type={props.type}
              parentPost={parentPost}
              toggleOptions={toggleOptions} 
              editHandler={editHandler} 
              updateRightAnswerHandler={updateRightAnswerHandler}
              answerCommentId={props.answerCommentId}
              deleteHandler={deleteHandler} 
              reportAbuseHandler={reportAbuseHandler}>
            </PrimeCommunityObjectOptions>
          }
        </button>
        {showConfirmation &&
          <PrimeAlertDialog
            variant="confirmation"
            title="Confirmation Required"
            primaryActionLabel="Continue"
            onPrimaryAction={
              props.type === "comment" ? 
                primaryAction === "delete" ? deleteComment : reportComment
              : 
                props.type === "reply" ? 
                  primaryAction === "delete" ? deleteReply : reportReply
                :
                  primaryAction === "delete" ? deletePost : reportPost
            }
            secondaryActionLabel="Cancel"
            onSecondaryAction={hideConfirmationDialog}
            body={confirmationMessage}
          ></PrimeAlertDialog>
        }
        {showUpdatePostModal &&
          <PrimeCommunityAddPostDialogTrigger
          className={styles.primeAddPostButton}
          openDialog={true}
          post={object}
          mode="update"
          savePostHandler={(input: any, postingType: any, resource: any, isResourceModified: any) => {updateObjectHandler(input, postingType, resource, isResourceModified)}}
          closeDialogHandler={closeDialogHandler}
      ></PrimeCommunityAddPostDialogTrigger>
        }
      </div>
      </>
  );
};
export default PrimeCommunityObjectHeader;