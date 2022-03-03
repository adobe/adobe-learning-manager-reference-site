import { useState } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityAddPost.module.css";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger";
import { usePost, usePosts } from "../../hooks/community";
import { PrimeAlertDialog } from "..";

const PrimeCommunityAddPost = (props: any) => {
    const boardId = props.boardId;
    const { formatMessage } = useIntl();
    const { addPost } = usePost();
    const { fetchPosts } = usePosts(boardId);    
    const [ showSuccessConfirmation, setShowSucessConfirmation ] = useState(false);
    const hideModalTimeInMillis = 10000;
    
    const savePostHandler = async(input: any, postingType: any, uploadedFileUrl: any) => {
        try {
            await addPost(boardId, input, postingType, uploadedFileUrl);
            setShowSucessConfirmation(true);
            setTimeout(() => {
                //auto close alert
                if(showSuccessConfirmation) {
                    setShowSucessConfirmation(false)
                }
            }, hideModalTimeInMillis)
            fetchPosts(boardId);
        } catch(exception) {
            console.log("Error in creating Post")
        }
    }

    return (
        <>
        <div className={styles.primeAddPostSectionWrapper}>
            <div className={styles.primeAddPostSection}>
                <div className={styles.primeAddPostMessage}>
                    {formatMessage({
                        id: "prime.community.shareLearningMessage",
                        defaultMessage: "Share your learning with your colleagues",
                    })}
                </div>
                <div className={styles.primeAddPostButtonDiv}>
                    <PrimeCommunityAddPostDialogTrigger
                        className={styles.primeAddPostButton}
                        buttonLabel={formatMessage({id: "prime.community.newPost.label",defaultMessage: "New Post",})}
                        savePostHandler={(input: any, postingType: any, uploadedFileUrl: any) => {savePostHandler(input, postingType, uploadedFileUrl)}}
                    ></PrimeCommunityAddPostDialogTrigger>
                    {showSuccessConfirmation && 
                        <PrimeAlertDialog
                            variant="confirmation"
                            title={formatMessage({id: "prime.community.postPublished.label",defaultMessage: "Post Published"})}
                            primaryActionLabel={formatMessage({id: "prime.community.ok.label",defaultMessage: "Ok"})}
                            body={formatMessage({id: "prime.community.postPublished.successMessage",defaultMessage: "Your post has been published. It may take some time to appear on the board."})}
                        ></PrimeAlertDialog>
                    }
                </div>
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityAddPost;