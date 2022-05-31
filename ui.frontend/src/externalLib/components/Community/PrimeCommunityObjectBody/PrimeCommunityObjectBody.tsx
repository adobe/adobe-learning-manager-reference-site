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
import { useState } from "react";
import { useIntl } from "react-intl";
import Question from "@spectrum-icons/workflow/Question";
import { PrimeCommunityLinkPreview } from "../PrimeCommunityLinkPreview";
import { PrimeCommunityPoll } from "../PrimeCommunityPoll";
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

const PrimeCommunityObjectBody = (props: any) => {
  const { formatMessage } = useIntl();
  const object = props.object;
  const isQuestionType = object.postingType === QUESTION;
  const entityType = props.type;
  const getDescription = () => {
    switch (entityType) {
      case BOARD:
        return object.richTextdescription;
      case POST:
        return object.richText;
      case COMMENT:
        return props.text;
      case REPLY:
        return props.text;
    }
  };
  const description = getDescription();
  const primeConfig = getALMConfig();
  const iframeSrc = `${
    primeConfig.almBaseURL
  }/app/player?entity_type=${entityType}&entity_id=${
    object.id
  }&access_token=${getALMObject().getAccessToken()}&player_type=inline`;

  const MAX_CHAR_SHOWN = 450;
  const DEFAULT_INDEX_VALUE = 2;
  const [viewIndex, setViewIndex] = useState(DEFAULT_INDEX_VALUE);
  const [viewMore, setViewMore] = useState(description.length > MAX_CHAR_SHOWN);
  const [currentDescription, setCurrentDescription] = useState(
    description.length > MAX_CHAR_SHOWN
      ? description.substring(0, MAX_CHAR_SHOWN)
      : description
  );

  const getTruncatedDescription = () => {
    const supportedCharacterLength = MAX_CHAR_SHOWN * viewIndex;
    if (description.length <= supportedCharacterLength) {
      setViewMore(false);
      setCurrentDescription(description);
      setViewIndex(DEFAULT_INDEX_VALUE);
    } else
      setCurrentDescription(description.substring(0, supportedCharacterLength));
    setViewIndex(viewIndex + 1);
  };

  const submitPoll = (optionId: any) => {
    props.submitPoll(optionId);
  };

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
          className={styles.primePostDescriptionText}
          dangerouslySetInnerHTML={{ __html: currentDescription }}
        ></div>
      </div>
      {viewMore && (
        <button
          className={styles.primeCommunityViewMoreButton}
          onClick={getTruncatedDescription}
        >
          {formatMessage({
            id: "alm.community.viewMore",
            defaultMessage: "View more",
          })}
        </button>
      )}
      {props.type !== BOARD && (
        <PrimeCommunityLinkPreview
          currentInput={currentDescription}
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
            <div className={styles.primeCommunityImageBox}>
              <div className={styles.primeCommunityImageContainer}>
                <img
                  src={object.resource.data!}
                  loading="lazy"
                  className={styles.primePostImage}
                  alt="primePostImage"
                />
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
