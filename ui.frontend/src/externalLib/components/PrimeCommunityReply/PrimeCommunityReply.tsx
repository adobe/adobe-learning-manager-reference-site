import { PrimeCommunityObjectHeader } from "../PrimeCommunityObjectHeader";
import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
import { PrimeCommunityObjectActions } from "../PrimeCommunityObjectActions";
import { useReply } from "../../hooks/community";
import { useRef, useEffect, useState } from "react";
import styles from "./PrimeCommunityReply.module.css";

const PrimeCommunityReply  = (props: any) => {
  const reply = props.reply;
  const { voteReply, deleteReplyVote } = useReply();
  const myVoteStatus = reply.myVoteStatus ? reply.myVoteStatus : "";
  const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === "UPVOTE");
  const [upVoteCount, setUpVoteCount] = useState(reply.upVote);
  const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === "DOWNVOTE");
  const [downVoteCount, setDownVoteCount] = useState(reply.downVote);
  const firstRunForUpvote = useRef(true);
  const firstRunForDownvote = useRef(true);

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

  return (
    <>
    <div className={styles.primeReplyWrapper}>
      <PrimeCommunityObjectHeader object={reply} type="reply" deleteReplyHandler={deleteReplyHandler}></PrimeCommunityObjectHeader>
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
    </>
  );
};

export default PrimeCommunityReply;
