  import { PrimeCommunityObjectHeader } from "../PrimeCommunityObjectHeader";
  import { PrimeCommunityObjectBody } from "../PrimeCommunityObjectBody";
  import { PrimeCommunityObjectActions } from "../PrimeCommunityObjectActions";
  import { PrimeCommunityObjectInput } from "../PrimeCommunityObjectInput";
  import { PrimeCommunityComments } from "../PrimeCommunityComments";
  import { useIntl } from "react-intl";
  import { useComments, usePost } from "../../hooks/community";
  import { useRef, useEffect, useState } from "react";
  import styles from "./PrimeCommunityPost.module.css";

  const PrimeCommunityPost  = (props: any) => {
    const { formatMessage } = useIntl();
    const ref = useRef<any>();
    const post = props.post;
    const { addComment, votePost, deletePostVote } = usePost();
    const { fetchComments } = useComments(post.id);
    const myVoteStatus = post.myVoteStatus ? post.myVoteStatus : "";
    const [myUpVoteStatus, setMyUpVoteStatus] = useState(myVoteStatus === "UPVOTE");
    const [upVoteCount, setUpVoteCount] = useState(post.upVote);
    const [myDownVoteStatus, setMyDownVoteStatus] = useState(myVoteStatus === "DOWNVOTE");
    const [downVoteCount, setDownVoteCount] = useState(post.downVote);
    const firstRunForUpvote = useRef(true);
    const firstRunForDownvote = useRef(true);
    const [showComments, setShowComments] = useState(false);
    const showCommentsLabel = formatMessage({id: "prime.community.post.showComments", defaultMessage: "Show Comments",});
    const hideCommentsLabel = formatMessage({id: "prime.community.post.hideComments", defaultMessage: "Hide Comments",});
    const [buttonLabel, setButtonLabel] = useState(showCommentsLabel);
    const [commentCount, setCommentCount] = useState(post.commentCount);

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
        hideCommentsSection();
      }
    }, [commentCount]);
    

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

    const saveHandler = async (value: any) => {
      try {
        await addComment(post.id,value);
        setCommentCount(commentCount + 1);
        if(showComments) {
          fetchComments(post.id);
        }
      } catch(exception) {
        console.log("not updating comment count");
      }
    }

    const deleteCommentHandler = () => {
      setCommentCount(commentCount - 1);      
    }

    return (
      <>
      <div className={styles.primePostWrapper}>
        <PrimeCommunityObjectHeader object={post} type="post"></PrimeCommunityObjectHeader>
        <PrimeCommunityObjectBody object={post} type="post"></PrimeCommunityObjectBody>
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
        <PrimeCommunityObjectInput 
          ref={ref}
          object={post} 
          inputPlaceholder={formatMessage({id: "prime.community.post.commentHere", defaultMessage: "Comment here"})}
          saveHandler={(value: any) => saveHandler(value)}
        ></PrimeCommunityObjectInput>
        {
          showComments && 
            <PrimeCommunityComments object={post} type="comment" deleteCommentHandler={deleteCommentHandler}></PrimeCommunityComments>
        }
      </div>
      </>
    );
  };
  
  export default PrimeCommunityPost;
  