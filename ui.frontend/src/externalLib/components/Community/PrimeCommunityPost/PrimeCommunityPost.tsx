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
  import { PrimeAlertDialog } from "../PrimeAlertDialog";
  import { useIntl } from "react-intl";
  import { useComments, usePost } from "../../../hooks/community";
  import { useRef, useEffect, useState } from "react";
  import styles from "./PrimeCommunityPost.module.css";

  const PrimeCommunityPost  = (props: any) => {
    const { formatMessage } = useIntl();
    const ref = useRef<any>();
    const post = props.post;
    const { addComment, votePost, deletePostVote, patchPost, submitPollVote } = usePost();
    const { fetchComments } = useComments();
    const myVoteStatus = post.myVoteStatus ? post.myVoteStatus : "";
    const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === "UPVOTE");
    const [upVoteCount, setUpVoteCount] = useState(post.upVote);
    const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === "DOWNVOTE");
    const [downVoteCount, setDownVoteCount] = useState(post.downVote);
    const firstRunForUpvote = useRef(true);
    const firstRunForDownvote = useRef(true);
    const [showComments, setShowComments] = useState(false);
    const showCommentsLabel = formatMessage({id: "alm.community.post.showComments", defaultMessage: "Show Comments",});
    const hideCommentsLabel = formatMessage({id: "alm.community.post.hideComments", defaultMessage: "Hide Comments",});
    const [buttonLabel, setButtonLabel] = useState(showCommentsLabel);
    const [commentCount, setCommentCount] = useState(post.commentCount);
    const [ showSuccessConfirmation, setShowSucessConfirmation ] = useState(false);
    const hideModalTimeInMillis = 10000;

    const viewButtonClickHandler = () => {
      if(!showComments) {
        if(commentCount > 0) {
          showCommentsSection();
          fetchComments(post.id);
        }
      } else {
        hideCommentsSection();
      }
    }

    const showCommentsSection = () => {
      setShowComments(true);
      setButtonLabel(hideCommentsLabel);
    }

    const hideCommentsSection = () => {
      setShowComments(false);
      setButtonLabel(showCommentsLabel);
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
      if(commentCount === 0) {
        setShowComments(false);
        setButtonLabel(showCommentsLabel);
      }
    }, [commentCount, showCommentsLabel]);
    

    const upVoteButtonClickHandler = () => {
      //if already upVoted, delete vote
      myUpVoteStatus? deletePostVote(post.id, "UP") : votePost(post.id, "UP");
      if(!myUpVoteStatus && myDownVoteStatus) {
          setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
      }
      setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
    }
  
    const downVoteButtonClickHandler = () => {
      //if already downVoted, delete vote
      myDownVoteStatus? deletePostVote(post.id, "DOWN") : votePost(post.id, "DOWN");
      if(!myDownVoteStatus && myUpVoteStatus) {
          setMyUpVoteStatus((myUpVoteStatus) => !myUpVoteStatus);
      }
      setMyDownVoteStatus((myDownVoteStatus) => !myDownVoteStatus);
    }

    const saveCommentHandler = async (value: any) => {
      try {
        await addComment(post.id,value);
        setCommentCount(commentCount + 1);
        fetchComments(post.id);
        showCommentsSection();
      } catch(exception) {
        console.log("not updating comment count");
      }
    }

    const deleteCommentHandler = () => {
      setCommentCount(commentCount - 1);      
    }

    const updatePostHandler = async(input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any) => {
      try {
        await patchPost(post.id, input, postingType, resource, isResourceModified, pollOptions);
        showConfirmationDialog();
        setTimeout(() => {
          //auto close alert
          if(showSuccessConfirmation) {
              hideConfirmationDialog();
          }
        }, hideModalTimeInMillis)
      } catch(exception) {
        console.log("Error in creating Post")
      }
    }

    const hideConfirmationDialog  = () => {
      setShowSucessConfirmation(false)
    }

    const showConfirmationDialog  = () => {
        setShowSucessConfirmation(true)
    }
 
    const submitPoll = (optionId: any) => {
      submitPollVote(post.id, optionId);
    }

    return (
      <>
      <div className={styles.primePostWrapper}>
        <PrimeCommunityObjectHeader object={post} type="post" updateObjectHandler={(input: any, postingType: any, resource: any, isResourceModified: any, pollOptions: any) => {updatePostHandler(input, postingType, resource, isResourceModified, pollOptions)}}></PrimeCommunityObjectHeader>
        <PrimeCommunityObjectBody object={post} type="post" submitPoll={(optionId: any) => {submitPoll(optionId)}}></PrimeCommunityObjectBody>
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
        ></PrimeCommunityObjectActions>
        <div className={styles.primeCommentInputWrapper}>
          <PrimeCommunityObjectInput 
            ref={ref}
            object={post} 
            inputPlaceholder={formatMessage({id: "alm.community.post.commentHere", defaultMessage: "Comment here"})}
            primaryActionHandler={(value: any) => saveCommentHandler(value)}
          ></PrimeCommunityObjectInput>
        </div>
        {
          showComments && 
            <PrimeCommunityComments object={post} deleteCommentHandler={deleteCommentHandler}></PrimeCommunityComments>
        }
        {showSuccessConfirmation && 
          <PrimeAlertDialog
              variant="confirmation"
              title={formatMessage({id: "alm.community.postPublished.label",defaultMessage: "Post Published"})}
              primaryActionLabel={formatMessage({id: "alm.community.ok.label",defaultMessage: "Ok"})}
              body={formatMessage({id: "alm.community.postPublished.successMessage", defaultMessage: "Your post has been published. It may take some time to appear on the board."})}
              onPrimaryAction={hideConfirmationDialog}
          ></PrimeAlertDialog>
        }
      </div>
      </>
    );
  };
  
  export default PrimeCommunityPost;
  