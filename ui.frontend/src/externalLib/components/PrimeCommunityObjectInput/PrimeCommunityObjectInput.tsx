import styles from "./PrimeCommunityObjectInput.module.css";
import { useIntl } from "react-intl";
import {
    SAVE_COMMENT_SVG,
  } from "../../utils/inline_svg"
import React, { useState } from "react";

const PrimeCommunityObjectInput = React.forwardRef((props: any, ref: any) => {
    const { formatMessage } = useIntl();
    const commentTextLimit = props.characterLimit ? props.characterLimit : 1000;
    const emptyString = "";
    const [charactersRemaining, setCharactersRemaining] = useState(commentTextLimit);

    const clearTextArea = () => {
        ref.current.value = emptyString;
        setCharactersRemaining(commentTextLimit);
    }

    const saveCommentHandler = () => {
        if(typeof props.saveHandler === 'function') {
            if(ref && ref.current.value.length > 0) {
                props.saveHandler(ref.current.value);
                clearTextArea();
            }
        }
    }

    const checkTextCount = () => {
        const currentInputLength = ref && ref.current ? ref.current.value.length : 0;
        setCharactersRemaining(commentTextLimit < currentInputLength ? 0 : (commentTextLimit - currentInputLength));
    }

    return (
        <>
        <div className={styles.primePostCommentWrapper}>
            <textarea ref={ref} onKeyUp={checkTextCount} className={styles.primePostCommentInput} placeholder={props.inputPlaceholder} maxLength={charactersRemaining}>
            </textarea>
            {props.saveHandler &&
                <button className={styles.primeSaveCommentButton} onClick={saveCommentHandler}>
                    {SAVE_COMMENT_SVG()}
                </button>
            }
            <div className={styles.primeTextAreaCountRemaining}>
                {charactersRemaining} {formatMessage({id: "prime.community.post.charactersLeft", defaultMessage: "characters left"})}
            </div>
        </div>
        </>
    );
});
export default PrimeCommunityObjectInput;