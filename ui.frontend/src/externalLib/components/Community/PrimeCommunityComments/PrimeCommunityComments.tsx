import { useComments } from "../../../hooks/community";
import { PrimeCommunityComment } from "../PrimeCommunityComment";
import styles from "./PrimeCommunityComments.module.css";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

const PrimeCommunityComments = (props: any) => {
    const { formatMessage } = useIntl();
    const postId = props.object.id;
    const { items, loadMoreComments, hasMoreItems, patchComment, markCommentAsRightAnswer } = useComments();
    const [ answerCommentId, setAnswerCommentId ] = useState("");

    useEffect(() => {
        items?.filter((comment) => comment.parent.id === postId).map((comment) => {
            if(comment.isCorrectAnswer) {
                setAnswerCommentId(comment.id);
                return comment.id;
            }
            return null;
        })
    }, [items, postId]);

    const deleteCommentHandler = () => {
        if(typeof props.deleteCommentHandler === 'function') {
            props.deleteCommentHandler();
        }
    }

    const updateComment = async (commentId: any, value: any) => {
        try {
          await patchComment(commentId, value); 
        } catch(exception) {
          console.log("error while updating comment");
        }
    }

    const updateRightAnswerHandler = async (commentId: any, value: any) => {
        try {
          await markCommentAsRightAnswer(commentId, value);
          setAnswerCommentId(value ? commentId : "");
        } catch(exception) {
          console.log("error while updating comment");
        }
    }

    return (
        <>
        <div className={styles.primeCommentSectionWrapper}>
            <div className={styles.primeCommentSection}>
                {
                    items?.filter((comment) => comment.parent.id === postId).map((comment) => (
                        <PrimeCommunityComment 
                            comment={comment} 
                            parentPost={props.object}
                            key={comment.id} 
                            deleteCommentHandler={deleteCommentHandler} 
                            updateComment={updateComment}
                            updateRightAnswerHandler={updateRightAnswerHandler}
                            answerCommentId={answerCommentId}>
                        </PrimeCommunityComment>
                    ))
                }
                {hasMoreItems &&
                    <button className={styles.showMoreCommentsButton} onClick={loadMoreComments}>
                        {formatMessage({
                            id: "prime.community.showMoreComments",
                            defaultMessage: "Show more comments",
                        })}
                    </button>
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityComments;