import { useReplies } from "../../../hooks/community";
import { PrimeCommunityReply } from "../PrimeCommunityReply";
import styles from "./PrimeCommunityReplies.module.css";
import { useIntl } from "react-intl";

const PrimeCommunityReplies = (props: any) => {
    const { formatMessage } = useIntl();
    const commentId = props.object.id;
    const { items, patchReply, loadMoreReplies, hasMoreItems } = useReplies(commentId);

    const deleteReplyHandler = async() => {
        if(typeof props.deleteReplyHandler === 'function') {
          props.deleteReplyHandler();
        }
    }

    const updateReply = async (replyId: any, value: any) => {
        try {
          await patchReply(replyId, value); 
        } catch(exception) {
          console.log("error while updating reply");
        }
    }

    return (
        <>
        <div className={styles.primeReplySectionWrapper}>
            <div className={styles.primeReplySection}>
                {
                    items?.filter((reply) => reply.parent.id === commentId).map((reply) => (
                        <PrimeCommunityReply 
                            reply={reply} 
                            key={reply.id} 
                            deleteReplyHandler={deleteReplyHandler}
                            updateReply={updateReply}
                        ></PrimeCommunityReply>
                    ))
                }
                {hasMoreItems &&
                    <button className={styles.showMoreRepliesButton} onClick={loadMoreReplies}>
                        {formatMessage({
                            id: "alm.community.showMoreReplies",
                            defaultMessage: "Show more replies",
                        })}
                    </button>
                }
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityReplies;