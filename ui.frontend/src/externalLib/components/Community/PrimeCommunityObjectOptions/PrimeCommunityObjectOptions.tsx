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
      setUser(response.user);
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
        {props.object.createdBy.id === user.id && Object.keys(props.object.myPoll).length === 0 &&
          <div className={styles.primeObjectRegularOption} onClick={editObjectHandler}>
            {
              formatMessage({
                id: "prime.community.board.edit",
                defaultMessage: "Edit",
              })
            }
          </div> 
        }
        {props.parentPost && props.parentPost.createdBy.id === user.id && props.parentPost.postingType === "QUESTION" && props.object.id !== props.answerCommentId &&
          <div className={styles.primeObjectRegularOption} onClick={() => {updateRightAnswerHandler(true)}}>
            {
              formatMessage({
                id: "prime.community.board.markAsRightAnswer",
                defaultMessage: "Mark as Right answer",
              })
            }
          </div> 
        }

        {props.parentPost && props.parentPost.createdBy.id === user.id && props.parentPost.postingType === "QUESTION" && props.object.id === props.answerCommentId &&
          <div className={styles.primeObjectRegularOption} onClick={() => {updateRightAnswerHandler(false)}}>
            {
              formatMessage({
                id: "prime.community.board.unmarkAsRightAnswer",
                defaultMessage: "Unmark as Right answer",
              })
            }
          </div> 
        }
        <div className={styles.primeSeperator}></div>
        {props.object.createdBy.id === user.id &&
          <div className={styles.primeObjectCriticalOption} onClick={deleteObjectHandler}>
            {
              formatMessage({
                id: "prime.community.board.delete",
                defaultMessage: "Delete",
              })
            }
          </div> 
        }
        <div className={styles.primeObjectCriticalOption} onClick={reportObjectHandler}>
          {
            formatMessage({
              id: "prime.community.board.report",
              defaultMessage: "Report",
            })
          }
        </div>
      </div>
    </>
  );
};

export default PrimeCommunityObjectOptions;