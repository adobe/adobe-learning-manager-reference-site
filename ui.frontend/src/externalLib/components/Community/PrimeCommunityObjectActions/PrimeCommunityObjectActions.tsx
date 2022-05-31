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
import {
  SOCIAL_LIKE_SVG,
  SOCIAL_LIKE_FILLED_SVG,
  SOCIAL_DISLIKE_SVG,
  SOCIAL_DISLIKE_FILLED_SVG,
} from "../../../utils/inline_svg";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityObjectActions.module.css";
import { COMMENT, REPLY } from "../../../utils/constants";

const PrimeCommunityObjectActions = (props: any) => {
  const { formatMessage } = useIntl();
  const viewButtonClickHandler = () => {
    if (typeof props.viewButtonClickHandler === "function") {
      props.viewButtonClickHandler();
    }
  };

  const upVoteButtonClickHandler = () => {
    if (typeof props.upVoteButtonClickHandler === "function") {
      props.upVoteButtonClickHandler();
    }
  };

  const downVoteButtonClickHandler = () => {
    if (typeof props.downVoteButtonClickHandler === "function") {
      props.downVoteButtonClickHandler();
    }
  };

  const actionClickHandler = () => {
    if (typeof props.downVoteButtonClickHandler === "function") {
      props.actionClickHandler();
    }
  };

  return (
    <>
      <div className={styles.primeObjectOptions}>
        {props.type === COMMENT && (
          <button
            className={styles.primeObjectCommentsCount}
            onClick={actionClickHandler}
          >
            {props.actionLabel}
          </button>
        )}
        {props.type !== REPLY && (
          <button
            className={styles.primeObjectCommentsCount}
            onClick={viewButtonClickHandler}
          >
            {props.buttonLabel} ({props.buttonCount})
          </button>
        )}
        <button
          className={styles.primeObjectUpVoteIcon}
          onClick={upVoteButtonClickHandler}
        >
          {props.myUpVoteStatus === true
            ? SOCIAL_LIKE_FILLED_SVG()
            : SOCIAL_LIKE_SVG()}
          <span className={styles.primeObjectUpVoteCount}>
            {props.upVoteCount}
          </span>
        </button>
        <button
          className={styles.primeObjectDownVoteIcon}
          onClick={downVoteButtonClickHandler}
        >
          {props.myDownVoteStatus
            ? SOCIAL_DISLIKE_FILLED_SVG()
            : SOCIAL_DISLIKE_SVG()}{" "}
          <span className={styles.primeObjectDownVoteCount}>
            {props.downVoteCount}
          </span>
        </button>
        {props.object && props.object.id === props.answerCommentId && (
          <div className={styles.primeObjectRightAnswer}>
            {formatMessage({
              id: "alm.community.comment.rightAnswer",
              defaultMessage: "RIGHT ANSWER",
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PrimeCommunityObjectActions;
