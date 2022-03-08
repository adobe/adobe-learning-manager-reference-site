import styles from "./PrimeCommunityObjectInput.module.css";
import { useIntl } from "react-intl";
import Send from '@spectrum-icons/workflow/Send'
import Cancel from '@spectrum-icons/workflow/Cancel'
import React, { useState } from "react";

const PrimeCommunityObjectInput = React.forwardRef((props: any, ref: any) => {
    const { formatMessage } = useIntl();
    const objectTextLimit = props.characterLimit ? props.characterLimit : 1000;
    const emptyString = "";
    const [charactersRemaining, setCharactersRemaining] = useState(objectTextLimit);

    const clearTextArea = () => {
        ref.current.value = emptyString;
        setCharactersRemaining(objectTextLimit);
    }

    const primaryActionHandler = () => {
        if(ref && ref.current.value.length <= 0) {
            return;
        }
        if(typeof props.primaryActionHandler === 'function') {
            props.primaryActionHandler(ref.current.value);
            clearTextArea();
        }
    }

    const secondaryActionHandler = () => {
        if(typeof props.secondaryActionHandler === 'function') {
            props.secondaryActionHandler(ref.current.value);
            clearTextArea();
        }
    }

    const checkTextCount = () => {
        const currentInputLength = ref && ref.current ? ref.current.value.length : 0;
        setCharactersRemaining(objectTextLimit < currentInputLength ? 0 : (objectTextLimit - currentInputLength));
    }

    return (
        <>
        <div className={styles.primePostObjectWrapper}>
            <textarea ref={ref} onKeyUp={checkTextCount} className={styles.primePostObjectInput} defaultValue={props.defaultValue?props.defaultValue : ""} placeholder={props.inputPlaceholder} maxLength={objectTextLimit}>
            </textarea>
            {props.primaryActionHandler &&
                <button className={styles.primeSaveObjectButton} onClick={primaryActionHandler}>
                    <Send/>
                </button>
            }
            {props.secondaryActionHandler &&
                <button className={styles.primeSaveObjectButton} onClick={secondaryActionHandler}>
                    <Cancel/>
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