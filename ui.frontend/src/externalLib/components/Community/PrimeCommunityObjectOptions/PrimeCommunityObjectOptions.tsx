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
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { PrimeUser } from "../../../models";
import { getALMUser } from "../../../utils/global";
import styles from "./PrimeCommunityObjectOptions.module.css";

const PrimeCommunityObjectOptions = (props: any) => {
  const ref = useRef<any>();
  const [user, setUser] = useState({} as PrimeUser);
  const { formatMessage } = useIntl();

  useEffect(() => {
    (async () => {
      const response = await getALMUser();
      setUser(response?.user || ({} as PrimeUser));
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      //console.log("userid=" + user.id);   //to-do user_id is empty
      if (ref.current && !ref.current.contains(event.target)) {
        props.toggleOptions && props.toggleOptions();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  const deleteObjectHandler = () => {
    if (typeof props.deleteHandler === "function") {
      props.deleteHandler();
    }
  };

  const reportObjectHandler = () => {
    if (typeof props.reportAbuseHandler === "function") {
      props.reportAbuseHandler();
    }
  };

  const editObjectHandler = () => {
    if (typeof props.editHandler === "function") {
      props.editHandler();
    }
  };

  const updateRightAnswerHandler = (value: any) => {
    if (typeof props.updateRightAnswerHandler === "function") {
      props.updateRightAnswerHandler(value);
    }
  };

  return (
    <>
      <div ref={ref} className={styles.primeObjectOptionsList}>
        {props.object.createdBy.id === user.id &&
          Object.keys(props.object.myPoll).length === 0 && (
            <div
              className={styles.primeObjectRegularOption}
              onClick={editObjectHandler}
            >
              {formatMessage({
                id: "alm.community.board.edit",
                defaultMessage: "Edit",
              })}
            </div>
          )}
        {props.parentPost &&
          props.parentPost.createdBy.id === user.id &&
          props.parentPost.postingType === "QUESTION" &&
          props.object.id !== props.answerCommentId && (
            <div
              className={styles.primeObjectRegularOption}
              onClick={() => {
                updateRightAnswerHandler(true);
              }}
            >
              {formatMessage({
                id: "alm.community.board.markAsRightAnswer",
                defaultMessage: "Mark as Right answer",
              })}
            </div>
          )}

        {props.parentPost &&
          props.parentPost.createdBy.id === user.id &&
          props.parentPost.postingType === "QUESTION" &&
          props.object.id === props.answerCommentId && (
            <div
              className={styles.primeObjectRegularOption}
              onClick={() => {
                updateRightAnswerHandler(false);
              }}
            >
              {formatMessage({
                id: "alm.community.board.unmarkAsRightAnswer",
                defaultMessage: "Unmark as Right answer",
              })}
            </div>
          )}
        <div className={styles.primeSeperator}></div>
        {props.object.createdBy.id === user.id && (
          <div
            className={styles.primeObjectCriticalOption}
            onClick={deleteObjectHandler}
          >
            {formatMessage({
              id: "alm.community.board.delete",
              defaultMessage: "Delete",
            })}
          </div>
        )}
        <div
          className={styles.primeObjectCriticalOption}
          onClick={reportObjectHandler}
        >
          {formatMessage({
            id: "alm.community.board.report",
            defaultMessage: "Report",
          })}
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityObjectOptions;
