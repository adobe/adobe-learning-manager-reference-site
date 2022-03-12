import { useState } from "react";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityAddPost.module.css";
import { PrimeCommunityAddPostDialogTrigger } from "../PrimeCommunityAddPostDialogTrigger";
import { usePost, } from "../../hooks/community";
import { PrimeAlertDialog } from "../PrimeAlertDialog";

const PrimeCommunityAddPost = (props: any) => {
    const boardId = props.boardId;
    const { formatMessage } = useIntl();
    const { addPost } = usePost();
    const [ showSuccessConfirmation, setShowSucessConfirmation ] = useState(false);
    const hideModalTimeInMillis = 10000;
    
    const savePostHandler = async(input: any, postingType: any, uploadedFileUrl: any) => {
        try {
            await addPost(boardId, input, postingType, uploadedFileUrl);
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
                            onPrimaryAction={hideConfirmationDialog}
                        ></PrimeAlertDialog>
                    }
                </div>
            </div>
        </div>
        </>
    );
};
export default PrimeCommunityAddPost;