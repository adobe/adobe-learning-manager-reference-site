import { useReplies } from "../../hooks/community";
import { PrimeCommunityReply } from "../PrimeCommunityReply";
import styles from "./PrimeCommunityReplies.module.css";

const PrimeCommunityReplies = (props: any) => {
    const commentId = props.object.id;
    console.log(commentId)
    const { items, fetchReplies, patchReply } = useReplies(commentId);

    const deleteReplyHandler = async() => {
        if(typeof props.deleteReplyHandler === 'function') {
          props.deleteReplyHandler();
        }
    }

    const updateReply = async (replyId: any, value: any) => {
        try {
          await patchReply(replyId, value); 
          await fetchReplies(replyId);  //to-do state was not updating second time in above line...need to check why   
        } catch(exception) {
          console.log("error while updating reply");
        }
    }

    return (
        <>
        <div className={styles.primeReplySectionWrapper}>
            <div className={styles.primeReplySection}>
                {
                    items?.map((reply) => (
                        <PrimeCommunityReply 
                            reply={reply} 
                            key={reply.id} 
                            deleteReplyHandler={deleteReplyHandler}
                            updateReply={updateReply}
                        ></PrimeCommunityReply>
                    ))
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityReplies;