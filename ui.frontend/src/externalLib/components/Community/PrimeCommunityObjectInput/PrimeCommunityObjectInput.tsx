import styles from "./PrimeCommunityObjectInput.module.css";
import { useIntl } from "react-intl";
import Send from '@spectrum-icons/workflow/Send'
import Cancel from '@spectrum-icons/workflow/Cancel'
import React, { useState } from "react";
import { getALMConfig } from "../../../utils/global";
import { RestAdapter } from "../../../utils/restAdapter";
import { SOCIAL_NO_PREVIEW } from "../../../utils/inline_svg"

const PrimeCommunityObjectInput = React.forwardRef((props: any, ref: any) => {
    const { formatMessage } = useIntl();
    const objectTextLimit = props.characterLimit ? props.characterLimit : 1000;
    const emptyString = "";
    const [charactersRemaining, setCharactersRemaining] = useState(objectTextLimit);
    const [postPreviewThumbnail, setPostPreviewThumbnail ] = useState("");
    const [postPreviewUrl, setPostPreviewUrl ] = useState("");
    const [postPreviewTitle, setPostPreviewTitle ] = useState("");
    const [postPreviewDescription, setPostPreviewDescription ] = useState("");
    let timers: any[] = [];
    const [ queuedTimers, setQueuedTimers] = useState([] as any); 
    const urlRegex = "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";

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
            clearPreviewData();
        }
    }

    const secondaryActionHandler = () => {
        if(typeof props.secondaryActionHandler === 'function') {
            props.secondaryActionHandler(ref.current.value);
            clearTextArea();
            clearPreviewData();
        }
    }

    const clearAllTimeouts = () => {
        let timersToClear = queuedTimers;
        if(timersToClear?.length > 0) {
            for(const timer of timersToClear)  {
                clearTimeout(timer);
            }
        }
    }

    const processInput = async() => {
        checkTextCount();
        clearAllTimeouts();
        const timer = setTimeout(() => {
            checkPreview();
        }, 1000);
        timers.push(timer);
        setQueuedTimers(timers);
    }

    const checkTextCount = () => {
        const currentInputLength = ref && ref.current ? ref.current.value.length : 0;
        setCharactersRemaining(objectTextLimit < currentInputLength ? 0 : (objectTextLimit - currentInputLength));
    }

    const clearPreviewData = () => {
        setPreviewData();
    }

    const setPreviewData = (response?: any) => {
        setPostPreviewThumbnail(response ? JSON.parse(response).thumbnail_url : "");
        setPostPreviewUrl(response ? JSON.parse(response).url : "");
        setPostPreviewTitle(response ? JSON.parse(response).title : "");
        setPostPreviewDescription(response ? JSON.parse(response).description : "");
    }

    const checkPreview = async () => {
        const primeConfig = getALMConfig();
        const currentInput = ref && ref.current ? ref.current.value : "";
        if (currentInput !== "") {
            try {
                let inputParts = currentInput.split(" ");
                let url = "";
                //checking if any part of input contains url
                for(let input of inputParts) {
                    if(input.match(urlRegex) || input.indexOf(".") > -1) {
                        url = input;
                        break;
                    }
                }
                if(url !== "") {
                    let urlStrings: any = [];
                    //checking if any part of url contains new line before or after
                    if(url.indexOf("\r") > -1) {
                        urlStrings = url.split("\r");
                    } else if(url.indexOf("\n") > -1) {
                        urlStrings = url.split("\n");
                    }
                    if(urlStrings.length > 0) {
                        for(let input of urlStrings) {
                            if(input.match(urlRegex) || input.indexOf(".") > -1) {
                                url = input;
                                break;
                            }
                        }
                    }
                    const response: any = await RestAdapter.ajax({
                        url: `${primeConfig.almBaseURL}/api/iframely/oembed?url=${url}`,
                        method: "GET",
                    });
                    setPreviewData(response);

                } else {
                    clearPreviewData();
                }
            } catch (Exception) {
                setPreviewData();
            }
        }
    }

    return (
        <>
        <div>
            <div className={styles.primePostObjectWrapper}>
                <textarea ref={ref} onKeyUp={processInput} className={styles.primePostObjectInput} defaultValue={props.defaultValue?props.defaultValue : ""} placeholder={props.inputPlaceholder} maxLength={objectTextLimit}>
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
            {postPreviewThumbnail !== "" && postPreviewThumbnail !== undefined &&
                <a href={postPreviewUrl} target="_blank" rel="noreferrer">
                    <div className={styles.primeCommunityThumbnailPreview} style={{background:`url(${postPreviewThumbnail})`}}>
                        <span className={styles.primeCommunityThumbnailDescription}>
                            {postPreviewTitle}
                            <br/>
                            {postPreviewDescription}
                        </span>
                    </div>
                </a>
            }
            {postPreviewThumbnail === undefined && 
                <a href={postPreviewUrl} target="_blank" rel="noreferrer">
                    <div className={styles.primeCommunityThumbnailPreview}>
                        <div className={styles.primeCommunityThumbnailNoPreview}>
                        {SOCIAL_NO_PREVIEW()}
                        <span className={styles.primeCommunityThumbnailDescription}>
                            {postPreviewTitle}
                            <br/>
                            {postPreviewDescription}
                        </span>
                        </div>
                    </div>
                </a>
            }
        </div>
        </>
    );
});
export default PrimeCommunityObjectInput;