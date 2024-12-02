import { useCallback, useEffect, useRef, useState } from "react";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeUserNotification,
} from "../../models/PrimeModels";
import PrimeFeedbackDialog from "./PrimeFeedbackDialog";
import { PrimeEvent } from "../../utils/widgets/common";
import { SendMessageToParent } from "../../utils/widgets/base/EventHandlingBase";
import { GetPrimeEmitEventLinks, getALMObject, getWidgetConfig } from "../../utils/global";
import { LEARNING_PROGRAM } from "../../utils/constants";
import { AlmModalDialog } from "../Common/AlmModalDialog";
import { QueryParams } from "../../utils/restAdapter";
import { GetTranslation } from "../../utils/translationService";
import styles from "./PrimeFeedback.module.css";
import { ALMLoader } from "../Common/ALMLoader";
import { useNotifications } from "../../hooks/notifications/useNotifications";

const PrimeFeedbackWrapper: React.FC<{
  trainingId: string;
  trainingInstanceId: string;
  playerLaunchTimeStamp: number;
  fetchCurrentLo: (
    trainingId: string,
    closeFeedbackPopUp: Function
  ) => Promise<PrimeLearningObject>;
  getFilteredNotificationForFeedback: (
    notificationParams: QueryParams
  ) => Promise<PrimeUserNotification[]>;
  submitL1Feedback: (
    enrollment: PrimeLearningObjectInstanceEnrollment | undefined,
    feedbackBody: any
  ) => Promise<unknown>;
  emailNotificationId?: string;
  closeFeedbackWrapper: Function;
}> = ({
  trainingId,
  trainingInstanceId,
  playerLaunchTimeStamp,
  fetchCurrentLo,
  getFilteredNotificationForFeedback,
  submitL1Feedback,
  emailNotificationId,
  closeFeedbackWrapper,
}) => {
  const COURSE_L1_FEEDBACK_CHANNEL = "course::l1FeedbackPrompt";
  const LP_L1_FEEDBACK_CHANNEL = "learningProgram::l1Feedback";
  const [notificationIds, setNotificationIds] = useState([] as string[]);
  const [learningObject, setLearningObject] = useState({} as PrimeLearningObject);
  const [enrolledInstance, setEnrolledInstance] = useState<PrimeLearningObjectInstance>();
  const [progressPercent, setProgressPercent] = useState(0);
  const [enrollment, setEnrollment] = useState<PrimeLearningObjectInstanceEnrollment>();
  const notificationsReceived = useRef<boolean>(false);
  const numRetries = useRef<number>(0);
  const loNotificationMap = useRef(new Map<string, PrimeUserNotification>());
  const [orderedFeedbackLO, setOrderedFeedbackLO] = useState([] as PrimeLearningObject[]);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [isFeedbackTakingLonger, setIsFeedbackTakingLonger] = useState(false);
  const [launchFeedbackDialog, setLaunchFeedbackDialog] = useState(false);
  const [launchFromEmail, setLaunchFromEmail] = useState(false);
  const { getUserNotification } = useNotifications();
  const feedbackTitle = GetTranslation("text.feedbackRequest");

  const getFeedbackEnabledSubLOs_lxpv = async (
    playerLaunchTimeStamp: number,
    subLOs: PrimeLearningObject[]
  ) => {
    const playerLaunchTimeStampValue =
      playerLaunchTimeStamp || getALMObject().playerLaunchTimeStamp || 0;
    const shouldShowFeedbackPopup = (subLo: PrimeLearningObject) => {
      return (
        subLo.enrollment.progressPercent === 100 &&
        (!subLo.enrollment.dateCompleted ||
          new Date(subLo.enrollment.dateCompleted).getTime() > playerLaunchTimeStampValue) &&
        subLo.enrollment.loInstance.l1FeedbackInfo &&
        subLo.enrollment.loInstance.l1FeedbackInfo.showAutomatically
      );
    };
    const feedbackEnabledSubLOs = [];
    for (const subLo of subLOs) {
      if (shouldShowFeedbackPopup(subLo)) {
        feedbackEnabledSubLOs.push(subLo);
      }
      if (subLo.loType === LEARNING_PROGRAM) {
        const lo = await fetchCurrentLo(subLo.id, closeFeedbackPopUp);
        const fetchedSubLOs = lo.subLOs || [];
        fetchedSubLOs.forEach(fetchedSubLo => {
          if (shouldShowFeedbackPopup(fetchedSubLo)) {
            feedbackEnabledSubLOs.push(fetchedSubLo);
          }
        });
      }
    }
    return feedbackEnabledSubLOs;
  };

  useEffect(() => {
    fetchLoDetails();
  }, []);

  const modalDialogBody = (showLoader: boolean, text1: string, text2: string) => {
    return (
      <div>
        {text1}
        <br />
        <br />
        {text2}
        {showLoader && (
          <div className={styles.modalLoader}>
            <ALMLoader />
          </div>
        )}
      </div>
    );
  };
  const closeAlmModalDialog = () => {
    setGeneratingFeedback(false);
    setIsFeedbackTakingLonger(false);
  };
  const closeFeedbackPopUp = (parentLoId?: string, userNotificationId?: string) => {
    console.log("close feedback popup wrapper function")
    setLaunchFeedbackDialog(false);
    if(launchFromEmail){
      setLaunchFromEmail(false);
      closeFeedbackWrapper();
      return;
    }
    if (parentLoId && userNotificationId) {
      onL1FeedbackClose(parentLoId, userNotificationId);
    } else {
      closeFeedbackWrapper();
    }
  };
  const openAlmModalDialog = (showCrossButton: boolean, showCloseButton: boolean, body: any) => {
    return (
      <AlmModalDialog
        title={feedbackTitle}
        showCrossButton={showCrossButton}
        showCloseButton={showCloseButton}
        body={body}
        closeDialog={() => closeAlmModalDialog()}
      />
    );
  };

  const fetchLoDetails = async () => {
    console.log("Inside fetch lo details");
    const notificationParams: QueryParams = {};
    notificationParams["userSelectedChannels"] = COURSE_L1_FEEDBACK_CHANNEL;
    const learningObject = await fetchCurrentLo(trainingId, closeFeedbackPopUp);
    setLearningObject(learningObject);
    const enrolledInstance = trainingInstanceId
      ? (learningObject.instances || []).find(instance => instance.id === trainingInstanceId)
      : learningObject.enrollment.loInstance;
    setEnrolledInstance(enrolledInstance);
    const enrollment = enrolledInstance?.enrollment
      ? enrolledInstance.enrollment
      : learningObject.enrollment;
    setEnrollment(enrollment);
    setProgressPercent(enrollment.progressPercent);
    if (emailNotificationId) {
      await processL1FeedbackEmailNotification(learningObject);
      return;
    }
    if (
      learningObject.loType === LEARNING_PROGRAM &&
      enrollment.progressPercent != 100 &&
      enrolledInstance?.enabledL1FeedbackForEachCourse
    ) {
      const feedbackEnabledSubLOs = await getFeedbackEnabledSubLOs_lxpv(
        playerLaunchTimeStamp,
        learningObject.subLOs
      );
      notificationParams["userSelectedChannels"] =
        `${LP_L1_FEEDBACK_CHANNEL},${COURSE_L1_FEEDBACK_CHANNEL}`;
      await getNotificationsForLOs(feedbackEnabledSubLOs, notificationParams);
      return;
    }
    const l1FeedbackInfo = enrolledInstance?.l1FeedbackInfo;
    let feedbackEnabledSubLos: PrimeLearningObject[] = [];
    if (learningObject.loType == LEARNING_PROGRAM) {
      notificationParams["userSelectedChannels"] = LP_L1_FEEDBACK_CHANNEL;
    }
    if (enrolledInstance && enrolledInstance.enabledL1FeedbackForEachCourse) {
      notificationParams["userSelectedChannels"] =
        `${LP_L1_FEEDBACK_CHANNEL},${COURSE_L1_FEEDBACK_CHANNEL}`;
      const subLOs = learningObject.subLOs;
      feedbackEnabledSubLos = await getFeedbackEnabledSubLOs_lxpv(playerLaunchTimeStamp, subLOs);
    }
    if (l1FeedbackInfo && l1FeedbackInfo.showAutomatically && enrollment.progressPercent === 100) {
      feedbackEnabledSubLos = [learningObject, ...feedbackEnabledSubLos];
    }
    if (getWidgetConfig().emitL1FeedbackLaunchEvent) {
      SendMessageToParent(
        {
          type: PrimeEvent.HANDLE_L1_FEEDBACK,
          loId: learningObject.id,
          loType: learningObject.loType,
        },
        GetPrimeEmitEventLinks()
      );
    } else {
      await getNotificationsForLOs(feedbackEnabledSubLos, notificationParams);
    }
    return;
  };
  const getNotificationsForLOs = async (
    learningObjects: PrimeLearningObject[],
    notificationParams: QueryParams
  ) => {
    notificationsReceived.current = false;
    numRetries.current = 0;
    if (learningObjects.length === 0) {
      closeFeedbackPopUp();
      return;
    }
    SendMessageToParent({ type: PrimeEvent.L1_FEEDBACK_LAUNCHED }, GetPrimeEmitEventLinks());
    setGeneratingFeedback(true);
    const allNotificationsReceived = await getAndRetryNotificationsForLOs(
      learningObjects,
      notificationParams
    );
    if (allNotificationsReceived) {
      notificationsReceived.current = true;
    }
    console.log("Setting interval for LO");

    if (notificationsReceived.current || loNotificationMap.current.size >= 10) {
      setGeneratingFeedback(false);
      setLaunchFeedbackDialog(true);
      return;
    }
    const interval = setInterval(async () => {
      if (numRetries.current === 2) {
        clearInterval(interval);
        setGeneratingFeedback(false);
        console.log("Max retries done interval for LO");
        numRetries.current = 0;
        if (loNotificationMap.current.size > 0) {
          setLaunchFeedbackDialog(true);
          return;
        }
        setGeneratingFeedback(false);
        setIsFeedbackTakingLonger(true);
      } else {
        numRetries.current = numRetries.current + 1;
        const allNotificationsReceived = await getAndRetryNotificationsForLOs(
          learningObjects,
          notificationParams
        );
        if (allNotificationsReceived || loNotificationMap.current.size >= 10) {
          clearInterval(interval);
          setGeneratingFeedback(false);
          setLaunchFeedbackDialog(true);
          return;
        }
      }
    }, 3000);
  };

  const getAndRetryNotificationsForLOs = async (
    learningObjects: PrimeLearningObject[],
    notificationParams: QueryParams
  ) => {
    if (notificationsReceived.current || loNotificationMap.current.size >= 10) {
      return;
    }
    const notifications = await getFilteredNotificationForFeedback(notificationParams);
    if (!notifications?.length) {
      return false;
    }
    let allNotificationsReceived = true;
    setOrderedFeedbackLO([]);

    learningObjects.forEach((lo: PrimeLearningObject) => {
      const filteredNotification = notifications.filter(notification => {
        return notification.modelIds.indexOf(lo.id) !== -1;
      });

      if (filteredNotification.length > 0) {
        filteredNotification.forEach(filterNotif => {
          if (!filterNotif.actionTaken) {
            loNotificationMap.current = loNotificationMap.current.set(lo.id, filterNotif);
            setOrderedFeedbackLO(prevLOs => [...prevLOs, lo]);
          }
        });
      } else {
        allNotificationsReceived = false;
      }
    });
    return allNotificationsReceived;
  };

  const processL1FeedbackEmailNotification = async (learningObject: PrimeLearningObject) => {
    console.log("Inside email function")
    if (emailNotificationId) {
      const emailNotification = await getUserNotification(emailNotificationId);
      if (emailNotification && !emailNotification.actionTaken) {
        SendMessageToParent({ type: PrimeEvent.L1_FEEDBACK_LAUNCHED }, GetPrimeEmitEventLinks());
        loNotificationMap.current = loNotificationMap.current.set(trainingId, emailNotification);
        notificationsReceived.current = true;
        setOrderedFeedbackLO([learningObject]);
        setGeneratingFeedback(false);
        setLaunchFromEmail(true);
        setLaunchFeedbackDialog(true);
        return;
      }
    }
  };

  const launchL1Feedback = () => {
    const learningObjectForFeedback = launchFromEmail ? orderedFeedbackLO[0] : orderedFeedbackLO.shift();
    if (!learningObjectForFeedback) {
      return;
    }
    const userNotification =
      loNotificationMap.current.get(learningObjectForFeedback.id) || ({} as PrimeUserNotification);
    return (
      <PrimeFeedbackDialog
        training={learningObjectForFeedback}
        parentLo={learningObject}
        userNotification={userNotification}
        closeFeedbackPopUp={closeFeedbackPopUp}
        key={learningObjectForFeedback.id}
        submitL1Feedback={submitL1Feedback}
      ></PrimeFeedbackDialog>
    );
  };
  const onL1FeedbackClose = (parentLoId: string, notificationId: string) => {
    console.log("onL1FeedbackClose function triggered")
    if (notificationId && notificationId.length > 0) {
      setNotificationIds(prevIds => [...prevIds, notificationId]);
    }
    if (
      orderedFeedbackLO.length > 0 &&
      parentLoId === learningObject?.id &&
      learningObject?.loType === LEARNING_PROGRAM
    ) {
      setLaunchFeedbackDialog(true);
    } else {
      closeFeedbackPopUp();
    }
  };

  return (
    <>
      {generatingFeedback &&
        openAlmModalDialog(
          false,
          false,
          modalDialogBody(
            true,
            GetTranslation("text.provideFeedback"),
            GetTranslation("text.generatingFeedback")
          )
        )}
      {isFeedbackTakingLonger &&
        openAlmModalDialog(
          true,
          true,
          modalDialogBody(
            false,
            GetTranslation("text.feedbackTakingLonger"),
            GetTranslation("text.sendNotification")
          )
        )}
      {launchFeedbackDialog && launchL1Feedback()}
    </>
  );
};
export default PrimeFeedbackWrapper;
