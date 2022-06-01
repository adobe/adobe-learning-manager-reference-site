/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import styles from "./PrimeCommunityLinkPreview.module.css";
import { getALMConfig } from "../../../utils/global";
import { RestAdapter } from "../../../utils/restAdapter";
import { useEffect, useState } from "react";
import { SOCIAL_NO_PREVIEW } from "../../../utils/inline_svg"

const PrimeCommunityLinkPreview = (props: any) => {
    const [ postPreviewThumbnail, setPostPreviewThumbnail ] = useState("");
    const [ postPreviewUrl, setPostPreviewUrl ] = useState("");
    const [ postPreviewTitle, setPostPreviewTitle ] = useState("");
    const [ postPreviewDescription, setPostPreviewDescription ] = useState("");
    let timers: any[] = [];
    const [ queuedTimers, setQueuedTimers] = useState([] as any); 
    const urlRegex = "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";

    const clearAllTimeouts = () => {
        let timersToClear = queuedTimers;
        if(timersToClear?.length > 0) {
            for(const timer of timersToClear)  {
                clearTimeout(timer);
            }
        }
    }

    const setPreviewData = (response?: any) => {
        setPostPreviewThumbnail(response && JSON.parse(response).thumbnail_url ? JSON.parse(response).thumbnail_url : "");
        setPostPreviewUrl(response && JSON.parse(response).url ? JSON.parse(response).url : "");
        setPostPreviewTitle(response && JSON.parse(response).title ? JSON.parse(response).title : "");
        setPostPreviewDescription(response && JSON.parse(response).description? JSON.parse(response).description : "");
    }

    const clearPreviewData = () => {
        setPreviewData();
    }

    const checkPreview = async () => {
        const primeConfig = getALMConfig();
        const currentInput = props.currentInput;
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

    useEffect(() => {
        if(!props.showLinkPreview) {
            setPreviewData();
        }
        clearAllTimeouts();
        const timer = setTimeout(() => {
            checkPreview();
        }, 1000);
        timers.push(timer);
        setQueuedTimers(timers);
    }, [props.currentInput, props.showLinkPreview]);

    return (
        <>
            {props.showLinkPreview &&
                <div className={styles.primeCommunityLinkPreview}>
                    {postPreviewThumbnail !== "" &&
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
                    {postPreviewThumbnail === "" && postPreviewDescription !== "" &&
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
            }
        </>
    );
};
export default PrimeCommunityLinkPreview;