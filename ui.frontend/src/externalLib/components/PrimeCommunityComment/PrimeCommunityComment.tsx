import { PrimeCommunityObjectHeader } from "../PrimeCommunityObjectHeader";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import { PrimeCommunityObjectActions } from "../PrimeCommunityObjectActions";
import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
import { PrimeCommunityReplies } from "../PrimeCommunityReplies";
import { useIntl } from "react-intl";
import { useComment, useReplies } from "../../hooks/community";
import { useRef, useEffect, useState } from "react";
import styles from "./PrimeCommunityComment.module.css";

const PrimeCommunityComment  = (props: any) => {
  const { formatMessage } = useIntl();
  const ref = useRef<any>();
  const comment = props.comment;
  const { voteComment, deleteCommentVote } = useComment();
  const { addReply, fetchReplies} = useReplies(comment.id);
  const myVoteStatus = comment.myVoteStatus ? comment.myVoteStatus : "";
  const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === "UPVOTE");
  const [upVoteCount, setUpVoteCount] = useState(comment.upVote);
  const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === "DOWNVOTE");
  const [downVoteCount, setDownVoteCount] = useState(comment.downVote);
  const firstRunForUpvote = useRef(true);
  const firstRunForDownvote = useRef(true);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const showRepliesLabel = formatMessage({id: "prime.community.comment.showReplies", defaultMessage: "Show Replies",});
  const hideRepliesLabel = formatMessage({id: "prime.community.comment.hideReplies", defaultMessage: "Hide Replies",});
  const [buttonLabel, setButtonLabel] = useState(showRepliesLabel);
  const [replyCount, setReplyCount] = useState(comment.replyCount);

  const viewButtonClickHandler = () => {
    if(!showReplies) {
      if(replyCount > 0) {
        showReplySection();
        fetchReplies(comment.id);
      }
    } else {
      hideReplySection();
    }
  }

  const showReplySection = () => {
    setShowReplies(true);
    setButtonLabel(hideRepliesLabel);
  }

  const hideReplySection = () => {
    setShowReplies(false);
    setButtonLabel(showRepliesLabel);
  }

  useEffect(() => {
    if (firstRunForUpvote.current) {
      firstRunForUpvote.current = false;
      return;
    }
    myUpVoteStatus === true ? setUpVoteCount(upVoteCount + 1) : setUpVoteCount(upVoteCount - 1);
  }, [myUpVoteStatus]);

  useEffect(() => {
    if (firstRunForDownvote.current) {
      firstRunForDownvote.current = false;
      return;
    }
    myDownVoteStatus === true ? setDownVoteCount(downVoteCount + 1) : setDownVoteCount(downVoteCount - 1);
  }, [myDownVoteStatus]);

  useEffect(() => {
    if(replyCount === 0) {
      hideReplySection();
    }
  }, [replyCount]);

  const upVoteButtonClickHandler = () => {
    //if already upVoted, delete vote
    myUpVoteStatus? deleteCommentVote(comment.id, "UP") : voteComment(comment.id, "UP");
    if(!myUpVoteStatus && myDownVoteStatus) {
        setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
    }
    setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
  }

  const downVoteButtonClickHandler = () => {
    //if already downVoted, delete vote
    myDownVoteStatus? deleteCommentVote(comment.id, "DOWN") : voteComment(comment.id, "DOWN");
    if(!myDownVoteStatus && myUpVoteStatus) {
        setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
    }
    setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
  }

  const replyClickHandler = () => {
    setShowReplyInput(true);
  }

  const saveHandler = async (value: any) => {
    try {
      await addReply(comment.id,value);
      setReplyCount(replyCount + 1);
      if(showReplies) {
        fetchReplies(comment.id);
      }
    } catch(exception) {
      console.log("not updating reply count");
    }
  }

  const deleteCommentHandler = () => {
    if(typeof props.deleteCommentHandler === 'function') {
      props.deleteCommentHandler();
    }
  }

  const deleteReplyHandler = () => {
    console.log("ccfc");
    setReplyCount(replyCount - 1);      
  }

  return (
    <>
    <div className={styles.primeCommentWrapper}>
      <PrimeCommunityObjectHeader object={comment} type="comment" deleteCommentHandler={deleteCommentHandler}></PrimeCommunityObjectHeader>
      <PrimeCommunityObjectBody object={comment} type="comment"></PrimeCommunityObjectBody>
      <PrimeCommunityObjectActions
        type="comment"
        actionLabel={formatMessage({id: "prime.community.reply.label", defaultMessage: "Reply",})} 
        actionClickHandler={replyClickHandler}
        buttonLabel={buttonLabel} 
        buttonCount={replyCount} 
        viewButtonClickHandler={viewButtonClickHandler}
        myUpVoteStatus={myUpVoteStatus}
        upVoteCount={upVoteCount}
        upVoteButtonClickHandler={upVoteButtonClickHandler}
        myDownVoteStatus={myDownVoteStatus}
        downVoteCount={downVoteCount}
        downVoteButtonClickHandler={downVoteButtonClickHandler} 
      ></PrimeCommunityObjectActions>
      {
        showReplyInput &&
          <PrimeCommunityObjectInput 
            ref={ref}
            object={comment} 
            inputPlaceholder={formatMessage({id: "prime.community.comment.replyHere", defaultMessage: "Reply here"})}
            saveHandler={(value: any) => saveHandler(value)}
          ></PrimeCommunityObjectInput>
      }
      {showReplies && <PrimeCommunityReplies object={comment} type="reply" deleteReplyHandler={deleteReplyHandler}></PrimeCommunityReplies>}
    </div>
    </>
  );
};

export default PrimeCommunityComment;
