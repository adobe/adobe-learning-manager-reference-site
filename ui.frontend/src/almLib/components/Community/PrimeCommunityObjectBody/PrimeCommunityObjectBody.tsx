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
import { getALMConfig, getALMObject } from "../../../utils/global";
import styles from "./PrimeCommunityObjectBody.module.css";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Question from "@spectrum-icons/workflow/Question";
import { PrimeCommunityLinkPreview } from "../PrimeCommunityLinkPreview";
import { PrimeCommunityPoll } from "../PrimeCommunityPoll";
import linkifyHtml from "linkify-html";

import {
  AUDIO,
  BOARD,
  COMMENT,
  IMAGE,
  POLL,
  POST,
  QUESTION,
  REPLY,
  VIDEO,
} from "../../../utils/constants";
import { FULLSCREEN_SVG, FULLSCREEN_EXIT_SVG } from "../../../utils/inline_svg";

const PrimeCommunityObjectBody = (props: any) => {
  const { formatMessage } = useIntl();
  const object = props.object;
  const isQuestionType = object.postingType === QUESTION;
  const entityType = props.type;
  const urlRegex =
    "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";

  const formatUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    return url;
  };

  const isValidUrl = (input: string) => {
    return (
      input.match(urlRegex) || (input.indexOf(".") > -1 && !input.endsWith("."))
    );
  };

  const getFormattedDescription = (description: string) => {
    if (description && description !== "") {
      description = linkifyHtml(description);
      description = description.replace(
        /<a\b/g,
        `<a class="${styles.objectbodyLink}" target="_blank" rel="noopener noreferrer"`
      );
    }
    return description;
  };
  const getDescription = () => {
    switch (entityType) {
      case BOARD:
        return getFormattedDescription(object.richTextdescription);
      case POST:
        return getFormattedDescription(props.description);
      case COMMENT:
        return getFormattedDescription(props.text);
      case REPLY:
        return getFormattedDescription(props.text);
      default:
        return "";
    }
  };
  const [fullDescription, setFullDescription] = useState(getDescription());
  const primeConfig = getALMConfig();
  const iframeSrc = `${
    primeConfig.almBaseURL
  }/app/player?entity_type=${entityType}&entity_id=${
    object.id
  }&access_token=${getALMObject().getAccessToken()}&player_type=inline`;

  const MAX_CHAR_SHOWN = 450;
  const DEFAULT_INDEX_VALUE = 2;
  const [viewIndex, setViewIndex] = useState(DEFAULT_INDEX_VALUE);
  const [viewMore, setViewMore] = useState(
    fullDescription?.length > MAX_CHAR_SHOWN
  );
  const [currentDescription, setCurrentDescription] = useState(
    fullDescription?.length > MAX_CHAR_SHOWN
      ? fullDescription.substring(0, MAX_CHAR_SHOWN)
      : fullDescription
  );

  const getTruncatedDescription = () => {
    const supportedCharacterLength = MAX_CHAR_SHOWN * viewIndex;
    if (fullDescription?.length <= supportedCharacterLength) {
      setViewMore(false);
      setCurrentDescription(fullDescription);
      setViewIndex(DEFAULT_INDEX_VALUE);
    } else
      setCurrentDescription(
        fullDescription.substring(0, supportedCharacterLength)
      );
    setViewIndex(viewIndex + 1);
  };

  const submitPoll = (optionId: any) => {
    props.submitPoll(optionId);
  };

  useEffect(() => {
    if (props.description) {
      const fullDesc = getDescription();
      setFullDescription(fullDesc);
      setCurrentDescription(
        fullDesc.length > MAX_CHAR_SHOWN
          ? fullDesc.substring(0, MAX_CHAR_SHOWN)
          : fullDesc
      );
      setViewMore(props.description?.length > MAX_CHAR_SHOWN);
    }
  }, [props.description]);

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleExpandButtonClick = () => {
    if (!isFullScreen) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      document.body.style.overflow = "hidden";
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
      document.body.style.overflow = "";
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
      document.body.style.overflow = "";
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <>
      <div
        className={
          props.type === BOARD
            ? styles.primeBoardDescription
            : isQuestionType
            ? styles.primeQuestionPostDescription
            : styles.primePostDescription
        }
      >
        {isQuestionType && (
          <div className={styles.primeCommunityQuestionIcon}>
            <Question />
          </div>
        )}
        <div
          className={`${styles.primePostDescriptionText} ql-editor`}
          dangerouslySetInnerHTML={{ __html: currentDescription }}
        ></div>
      </div>
      {viewMore && (
        <div className={styles.viewMoreDiv}>
          <button
            className={styles.primeCommunityViewMoreButton}
            onClick={getTruncatedDescription}
          >
            {formatMessage({
              id: "alm.community.viewMore",
              defaultMessage: "View more",
            })}
          </button>
        </div>
      )}
      {props.type !== BOARD && (
        <PrimeCommunityLinkPreview
          currentInput={currentDescription}
          viewMode={true}
          showLinkPreview={true}
        ></PrimeCommunityLinkPreview>
      )}
      {props.type !== BOARD && props.object.postingType === POLL && (
        <PrimeCommunityPoll
          post={props.object}
          submitPoll={(optionId: any) => {
            submitPoll(optionId);
          }}
        ></PrimeCommunityPoll>
      )}
      {props.type !== BOARD && (
        <div className={styles.primePostPreview}>
          {object.resource && object.resource.contentType === VIDEO && (
            <div className="image-box">
              <div className="image-container">
                <iframe
                  className={styles.primePostVideoIframe}
                  src={iframeSrc}
                  allowFullScreen={true}
                  allow="autoplay"
                  frameBorder="0"
                  loading="lazy"
                  title="primePostVideo"
                ></iframe>
              </div>
            </div>
          )}

          {object.resource && object.resource.contentType === IMAGE && (
            <div
              className={
                isFullScreen
                  ? styles.fullScreenImageBox
                  : styles.primeCommunityImageBox
              }
            >
              <div className={styles.primeCommunityImageContainer}>
                <img
                  src={object.resource.data!}
                  loading="lazy"
                  className={
                    isFullScreen
                      ? styles.fullScreenImage
                      : styles.primePostImage
                  }
                  alt="primePostImage"
                />
              </div>
              <div
                className={isFullScreen ? "" : styles.primeCommunityResourceExpand}
              >
                <button
                  className={styles.primeCommunityResourceExpandButton}
                  onClick={handleExpandButtonClick}
                >
                  {isFullScreen ? FULLSCREEN_EXIT_SVG() : FULLSCREEN_SVG()}
                </button>
              </div>
            </div>
          )}

          {object.resource && object.resource.contentType === AUDIO && (
            <div className="image-box">
              <div className="image-container">
                <iframe
                  className={styles.primePostVideoIframe}
                  src={iframeSrc}
                  allowFullScreen={true}
                  allow="autoplay"
                  loading="lazy"
                  title="primePostAudio"
                ></iframe>
              </div>
            </div>
          )}

          {object.resource &&
            ["PDF", "XLS", "PPTX", "DOC"].includes(
              object.resource.contentType
            ) && (
              <div className="image-box">
                <div className="image-container">
                  <iframe
                    className={styles.primePostVideoIframe}
                    src={iframeSrc}
                    allow="autoplay"
                    allowFullScreen={true}
                    loading="lazy"
                    title="primePostStatic"
                  ></iframe>
                </div>
              </div>
            )}
        </div>
      )}
    </>
  );
};
export default PrimeCommunityObjectBody;
