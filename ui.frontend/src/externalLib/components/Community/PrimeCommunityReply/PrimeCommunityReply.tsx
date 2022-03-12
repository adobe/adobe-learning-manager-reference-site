import { PrimeCommunityObjectHeader } from "../PrimeCommunityObjectHeader";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import { PrimeCommunityObjectActions } from "../PrimeCommunityObjectActions";
import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
import { useReply } from "../../../hooks/community";
import { useRef, useEffect, useState } from "react";
import styles from "./PrimeCommunityReply.module.css";
import { useIntl } from "react-intl";

const PrimeCommunityReply  = (props: any) => {
  const { formatMessage } = useIntl();
  const ref = useRef<any>();
  const reply = props.reply;
  const { voteReply, deleteReplyVote } = useReply();
  const myVoteStatus = reply.myVoteStatus ? reply.myVoteStatus : "";
  const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === "UPVOTE");
  const [upVoteCount, setUpVoteCount] = useState(reply.upVote);
  const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === "DOWNVOTE");
  const [downVoteCount, setDownVoteCount] = useState(reply.downVote);
  const firstRunForUpvote = useRef(true);
  const firstRunForDownvote = useRef(true);
  const [ showEditReplyView, setShowEditReplyView ] = useState(false);

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


  const upVoteButtonClickHandler = () => {
    //if already upVoted, delete vote
    myUpVoteStatus? deleteReplyVote(reply.id, "UP") : voteReply(reply.id, "UP");
    if(!myUpVoteStatus && myDownVoteStatus) {
        setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
    }
    setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
  }

  const downVoteButtonClickHandler = () => {
    //if already downVoted, delete vote
    myDownVoteStatus? deleteReplyVote(reply.id, "DOWN") : voteReply(reply.id, "DOWN");
    if(!myDownVoteStatus && myUpVoteStatus) {
        setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
    }
    setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
  }

  const deleteReplyHandler = async() => {
    if(typeof props.deleteReplyHandler === 'function') {
      props.deleteReplyHandler();
    }
  }

  const updateReply = (value: any) => {
    if(typeof props.updateReply === "function") {
      props.updateReply(reply.id, value)
      setShowEditReplyView(false);  
    }
  }

  const updateReplyHandler = () => {
    setShowEditReplyView(true);
  }

  return (
    <>
    {!showEditReplyView &&
      <div className={styles.primeReplyWrapper}>
        <PrimeCommunityObjectHeader object={reply} type="reply" updateObjectHandler={updateReplyHandler} deleteReplyHandler={deleteReplyHandler}></PrimeCommunityObjectHeader>
        <PrimeCommunityObjectBody object={reply} type="reply"></PrimeCommunityObjectBody>
        <PrimeCommunityObjectActions
          type="reply"
          myUpVoteStatus={myUpVoteStatus}
          upVoteCount={upVoteCount}
          upVoteButtonClickHandler={upVoteButtonClickHandler}
          myDownVoteStatus={myDownVoteStatus}
          downVoteCount={downVoteCount}
          downVoteButtonClickHandler={downVoteButtonClickHandler}
          ></PrimeCommunityObjectActions>
      </div>
    }
    {showEditReplyView &&
      <PrimeCommunityObjectInput 
        ref={ref}
        object={reply}
        inputPlaceholder={formatMessage({id: "prime.community.comment.replyHere", defaultMessage: "Reply here"})}
        defaultValue={reply.richText}
        primaryActionHandler={(value: any) => updateReply(value)}
        secondaryActionHandler={() => setShowEditReplyView(false)}
      ></PrimeCommunityObjectInput>
    }
    </>
  );
};

export default PrimeCommunityReply;
