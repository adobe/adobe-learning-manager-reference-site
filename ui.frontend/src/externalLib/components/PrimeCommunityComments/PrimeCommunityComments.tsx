import { useComments } from "../../hooks/community";
import { PrimeCommunityComment } from "../PrimeCommunityComment";
import styles from "./PrimeCommunityComments.module.css";

const PrimeCommunityComments = (props: any) => {
    const postId = props.object.id;
    console.log(postId)
    const { items } = useComments(postId);

    const deleteCommentHandler = () => {
        if(typeof props.deleteCommentHandler === 'function') {
            props.deleteCommentHandler();
        }
    }

    return (
        <>
        <div className={styles.primeCommentSectionWrapper}>
            <div className={styles.primeCommentSection}>
                {
                    items?.filter((comment) => comment.parent.id === postId).map((comment) => (
                        <PrimeCommunityComment comment={comment} key={comment.id} deleteCommentHandler={deleteCommentHandler}></PrimeCommunityComment>
                    ))
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityComments;