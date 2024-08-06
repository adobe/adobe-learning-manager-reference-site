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
import { useReply } from "../../../hooks/community";
import { useRef, useEffect, useState } from "react";
import styles from "./PrimeCommunityReply.module.css";
import { useIntl } from "react-intl";
import { DOWN, DOWNVOTE, REPLY, UP, UPVOTE } from "../../../utils/constants";

const PrimeCommunityReply = (props: any) => {
  const { formatMessage } = useIntl();
  const ref = useRef<any>();
  const reply = props.reply;
  const { voteReply, deleteReplyVote } = useReply();
  const myVoteStatus = reply.myVoteStatus ? reply.myVoteStatus : "";
  const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === UPVOTE);
  const [upVoteCount, setUpVoteCount] = useState(reply.upVote);
  const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === DOWNVOTE);
  const [downVoteCount, setDownVoteCount] = useState(reply.downVote);
  const firstRunForUpvote = useRef(true);
  const firstRunForDownvote = useRef(true);
  const [showEditReplyView, setShowEditReplyView] = useState(false);
  const [replyText, setReplyText] = useState(reply.richText);

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
    myDownVoteStatus === true
      ? setDownVoteCount(downVoteCount + 1)
      : setDownVoteCount(downVoteCount - 1);
  }, [myDownVoteStatus]);

  const upVoteButtonClickHandler = () => {
    //if already upVoted, delete vote
    myUpVoteStatus ? deleteReplyVote(reply.id, UP) : voteReply(reply.id, UP);
    if (!myUpVoteStatus && myDownVoteStatus) {
      setMyDownVoteStatus(myDownVoteStatus => !myDownVoteStatus);
    }
    setMyUpVoteStatus(myUpVoteStatus => !myUpVoteStatus);
  };

  const downVoteButtonClickHandler = () => {
    //if already downVoted, delete vote
    myDownVoteStatus ? deleteReplyVote(reply.id, DOWN) : voteReply(reply.id, DOWN);
    if (!myDownVoteStatus && myUpVoteStatus) {
      setMyUpVoteStatus(myUpVoteStatus => !myUpVoteStatus);
    }
    setMyDownVoteStatus(myDownVoteStatus => !myDownVoteStatus);
  };

  const deleteReplyHandler = async () => {
    if (typeof props.deleteReplyHandler === "function") {
      props.deleteReplyHandler();
    }
  };

  const updateReply = (value: any) => {
    if (typeof props.updateReply === "function") {
      props.updateReply(reply.id, value);
      setReplyText(value);
      setShowEditReplyView(false);
    }
  };

  const updateReplyHandler = () => {
    setShowEditReplyView(true);
  };

  return (
    <>
      {!showEditReplyView && (
        <div className={styles.primeReplyWrapper}>
          <PrimeCommunityObjectHeader
            object={reply}
            type={REPLY}
            updateObjectHandler={updateReplyHandler}
            deleteReplyHandler={deleteReplyHandler}
          ></PrimeCommunityObjectHeader>
          <PrimeCommunityObjectBody
            object={reply}
            type={REPLY}
            text={replyText}
          ></PrimeCommunityObjectBody>
          <PrimeCommunityObjectActions
            type={REPLY}
            myUpVoteStatus={myUpVoteStatus}
            upVoteCount={upVoteCount}
            upVoteButtonClickHandler={upVoteButtonClickHandler}
            myDownVoteStatus={myDownVoteStatus}
            downVoteCount={downVoteCount}
            downVoteButtonClickHandler={downVoteButtonClickHandler}
          ></PrimeCommunityObjectActions>
        </div>
      )}
      {showEditReplyView && (
        <PrimeCommunityObjectInput
          ref={ref}
          object={reply}
          inputPlaceholder={formatMessage({
            id: "alm.community.comment.replyHere",
            defaultMessage: "Reply here",
          })}
          defaultValue={reply.richText}
          primaryActionHandler={(value: any) => updateReply(value)}
          secondaryActionHandler={() => setShowEditReplyView(false)}
          concisedToolbarOptions={true}
        ></PrimeCommunityObjectInput>
      )}
    </>
  );
};

export default PrimeCommunityReply;
