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
import { SOCIAL_NO_PREVIEW } from "../../../utils/inline_svg";
import { GetTranslation } from "../../../utils/translationService";
import { JsonApiParse } from "../../../utils/jsonAPIAdapter";
import { themesMap } from "../../../utils/themes";
import { getLocalizedData, setHttp } from "../../../utils/hooks";
import * as linkify from 'linkifyjs';

const PrimeCommunityLinkPreview = (props: any) => {
  const [postPreviewThumbnail, setPostPreviewThumbnail] = useState("");
  const [postPreviewUrl, setPostPreviewUrl] = useState("");
  const [postPreviewTitle, setPostPreviewTitle] = useState("");
  const [postPreviewDescription, setPostPreviewDescription] = useState("");
  const [postLoType, setPostLoType] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [backgroundPropObj, setBackgroundPropObj] = useState({});
  let timers: any[] = [];
  const [queuedTimers, setQueuedTimers] = useState([] as any);

  const clearAllTimeouts = () => {
    let timersToClear = queuedTimers;
    if (timersToClear?.length > 0) {
      for (const timer of timersToClear) {
        clearTimeout(timer);
      }
    }
  };

  const setPreviewData = (
    response?: any,
    url: string = "",
    loId?: string,
    sharedUrl = false
  ) => {
    if (sharedUrl) {
      const lo = JsonApiParse(response).learningObject;

      // Training description
      const descriptionData = lo.localizedMetadata[0].description;
      const description =
        descriptionData &&
        descriptionData !== "" &&
        lo.localizedMetadata.length != 0
          ? getLocalizedData(lo.localizedMetadata, getALMConfig().locale)
              .description
          : GetTranslation("alm.no.description.available", true);

      // Training title
      const title = getLocalizedData(
        lo.localizedMetadata,
        getALMConfig().locale
      ).name;

      // Training Thumbnail
      if (lo.imageUrl) {
        setBackgroundPropObj({
          "backgroundImage": `url(${lo.imageUrl})`,
        });
      } else {
        const theme = getALMConfig().themeData;
        const themeColors = theme
          ? themesMap[theme.name]
          : themesMap["Prime Default"];

        const id = loId!.split(":")[1];
        const colorCode = parseInt(id, 10) % 12;

        setBackgroundPropObj({
          background: `${themeColors[colorCode]} url(${
            "https://cpcontentsdev.adobe.com/public/images/default_card_icons/" +
            colorCode +
            ".svg"
          }) center center no-repeat`,
          "backgroundSize": "80%",
        });
      }

      setPostPreviewUrl(url);
      setPostPreviewTitle(title);
      setPostPreviewDescription(description);
      setPostLoType(lo.loType);
    } else {
      setPostPreviewThumbnail(
        response && JSON.parse(response).thumbnail_url
          ? JSON.parse(response).thumbnail_url
          : ""
      );
      setPostPreviewUrl(
        response && JSON.parse(response).url ? JSON.parse(response).url : ""
      );
      setPostPreviewTitle(
        response && JSON.parse(response).title ? JSON.parse(response).title : ""
      );
      setPostPreviewDescription(
        response && JSON.parse(response).description
          ? JSON.parse(response).description
          : ""
      );
    }
  };

  const clearPreviewData = () => {
    setPostPreviewThumbnail("");
    setPostPreviewUrl("");
    setPostPreviewTitle("");
    setPostPreviewDescription("");
    setPostLoType("");
    setCopiedUrl(false);
    setBackgroundPropObj({});
    setPreviewData();
  };

  const checkPreview = async () => {
    const currentInput = props.currentInput;
  
    if (!currentInput || currentInput === "") {
      clearPreviewData();
      return;
    }
  
    let links = linkify.find(currentInput, 'url');
    links = links.map(link => {
      const value = link.value;
      const href = link.href;
      if (value.indexOf('<') !== -1) {
        link.value = value.slice(0, value.indexOf('<'));
      }
      if (href.indexOf('<') !== -1) {
        link.href = href.slice(0, href.indexOf('<'));
      }
      return link;
    });
  
    if (!links || links.length === 0) {
      clearPreviewData();
      return;
    }
  
    const firstLink = new URL(setHttp(links[0].value));
  
    let url = "";
    if (props.viewMode && currentInput.indexOf('href="') > -1) {
      url = currentInput
        .split('href="')[1]
        .substring(0, currentInput.split('href="')[1].indexOf('"'));
    } else {
      url = firstLink.href;
    }
  
    if (url === "") {
      clearPreviewData();
      return;
    }
  
    if (postPreviewUrl !== "" && url === postPreviewUrl) return;
  
    let iframelyApi;
    let loId = "";
    let sharedUrl = false;
    const endPoint = new URL(getALMConfig().primeApiURL);
  
    if (endPoint.host.indexOf(firstLink.host) == 0 && firstLink.href.indexOf('app/learner')) {
          // For certification link
      if (url.indexOf("certificationId") !== -1) {
        const regex = "/certificationId=(\d+)/";
        const match = url.match(regex); 
        loId = `certification:${match![1]}`;
      } else {
        // For Course and LP link
        const index = url.indexOf("#");
        const idString = url.substring(index + 1);
        loId = `${idString.split("/")[1]}:${idString.split("/")[2]}`;
      }
      iframelyApi = `${getALMConfig().primeApiURL}/learningObjects/${loId}`;
      sharedUrl = true;
    } else if (url.indexOf(getALMConfig().trainingOverviewPath) !== -1) {
      // For AEM training links
      loId = url.split("trainingId/")[1];
      iframelyApi = `${getALMConfig().primeApiURL}/learningObjects/${loId}`;
      sharedUrl = true;
    } else {
      iframelyApi = `${getALMConfig().almBaseURL}/api/iframely/oembed?url=${url}`;
    }
  
    try {
      const response = await RestAdapter.ajax({
        url: iframelyApi,
        method: "GET",
      });
      setPreviewData(response, url, loId, sharedUrl);
      setCopiedUrl(sharedUrl);
    } catch (Exception) {
      setPreviewData();
    }
  };
  

  useEffect(() => {
    if (!props.showLinkPreview) {
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
      {props.showLinkPreview && (
        <div className={styles.primeCommunityLinkPreview}>
          {copiedUrl ? (
            <a
              className={styles.copiedUrlPreviewContainer}
              href={postPreviewUrl}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={styles.primeCommunityTrainingThumbnailPreview}
                style={backgroundPropObj}
              >
                <div
                  className={styles.primeCommunityTrainingThumbnailDescription}
                >
                  <span>{postPreviewTitle}</span>
                  <span>
                    {GetTranslation(
                      `alm.community.post.thumbnail.description.${postLoType}`,
                      true
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.primeCommunityTrainingDescription}>
                <span>
                  {postPreviewTitle} -{" "}
                  {GetTranslation(
                    `alm.community.post.thumbnail.description.${postLoType}`,
                    true
                  )}
                </span>
                <span>{postPreviewDescription}</span>
              </div>
            </a>
          ) : postPreviewThumbnail !== "" ? (
            <a href={postPreviewUrl} target="_blank" rel="noreferrer">
              <div
                className={styles.primeCommunityThumbnailPreview}
                style={{ backgroundImage: `url(${postPreviewThumbnail})` }}
              >
                <span className={styles.primeCommunityThumbnailDescription}>
                  {postPreviewTitle}
                  <br />
                  {postPreviewDescription}
                </span>
              </div>
            </a>
          ) : (
            postPreviewThumbnail === "" &&
            (postPreviewDescription !== "" || postPreviewUrl !== "") && (
              <a href={postPreviewUrl} target="_blank" rel="noreferrer">
                <div className={styles.primeCommunityThumbnailPreview}>
                  <div className={styles.primeCommunityThumbnailNoPreview}>
                    {SOCIAL_NO_PREVIEW()}
                    <span className={styles.primeCommunityThumbnailDescription}>
                      {postPreviewTitle}
                      <br />
                      {postPreviewDescription !== "" ? (
                        postPreviewDescription
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: GetTranslation(
                              "alm.no.preview.available",
                              true
                            ),
                          }}
                        />
                      )}
                    </span>
                  </div>
                </div>
              </a>
            )
          )}
        </div>
      )}
    </>
  );
};
export default PrimeCommunityLinkPreview;
