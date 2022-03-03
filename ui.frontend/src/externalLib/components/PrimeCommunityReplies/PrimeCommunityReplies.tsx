import { useReplies } from "../../hooks/community";
import { PrimeCommunityReply } from "../PrimeCommunityReply";
import styles from "./PrimeCommunityReplies.module.css";

const PrimeCommunityReplies = (props: any) => {
    const commentId = props.object.id;
    console.log(commentId)
    const { items } = useReplies(commentId);

    const deleteReplyHandler = async() => {
        if(typeof props.deleteReplyHandler === 'function') {
          props.deleteReplyHandler();
        }
    }

    return (
        <>
        <div className={styles.primeCommentSectionWrapper}>
            <div className={styles.primeCommentSection}>
                {
                    items?.map((reply) => (
                        <PrimeCommunityReply reply={reply} key={reply.id} deleteReplyHandler={deleteReplyHandler}></PrimeCommunityReply>
                    ))
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityReplies;