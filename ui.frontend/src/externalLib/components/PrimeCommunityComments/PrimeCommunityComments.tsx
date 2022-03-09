import { useComments } from "../../hooks/community";
import { PrimeCommunityComment } from "../PrimeCommunityComment";
import styles from "./PrimeCommunityComments.module.css";

const PrimeCommunityComments = (props: any) => {
    const postId = props.object.id;
    const { items, fetchComments, patchComment } = useComments();

    const deleteCommentHandler = () => {
        if(typeof props.deleteCommentHandler === 'function') {
            props.deleteCommentHandler();
        }
    }

    const updateComment = async (commentId: any, value: any) => {
        try {
          await patchComment(commentId, value); 
          await fetchComments(postId);  //to-do state was not updating second time in above line...need to check why   
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
                            key={comment.id} 
                            deleteCommentHandler={deleteCommentHandler} 
                            updateComment={updateComment}>
                        </PrimeCommunityComment>
                    ))
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityComments;