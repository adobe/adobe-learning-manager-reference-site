import {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import {
  PrimeFeedbackInfo,
  PrimeFeedbackQuestion,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectInstanceEnrollment,
  PrimeUserNotification,
} from "../../models";
import { PrimeEvent } from "../../utils/widgets/common";
import { SendMessageToParent } from "../../utils/widgets/base/EventHandlingBase";
import { GetTranslation, getPreferredLocalizedMetadata } from "../../utils/translationService";
import styles from "./PrimeFeedback.module.css";
import { L1_QUALITATIVE, LEARNING_PROGRAM, LIKEABILITY, SCALE_TEN } from "../../utils/constants";
import { GetPrimeEmitEventLinks, getALMUser, getWidgetConfig } from "../../utils/global";
import PrimeFeedbackForm from "./PrimeFeedbackForm";
import CrossIcon from "../../assets/images/close_gray_normal.png";
import { useNotifications } from "../../hooks";
import { getUserId } from "../../utils/widgets/utils";

const PrimeFeedbackDialog: React.FC<{
  training: PrimeLearningObject;
  parentLo: PrimeLearningObject;
  userNotification: PrimeUserNotification;
  closeFeedbackPopUp: (parentLoId: string, userNotificationId: string) => void;
  submitL1Feedback: (
    enrollment: PrimeLearningObjectInstanceEnrollment | undefined,
    feedbackBody: any
  ) => Promise<unknown>;
}> = ({ training, parentLo, userNotification, closeFeedbackPopUp, submitL1Feedback }) => {
  const { updateNotification } = useNotifications();
  const showErrorRef = useRef(false);
  const [showError, setShowError] = useState(false);
  const { locale } = useIntl();
  const isMobile = getWidgetConfig().isMobile;
  const [enrolledInstance, setEnrolledInstance] = useState<PrimeLearningObjectInstance>();
  const [enrollment, setEnrollment] = useState<PrimeLearningObjectInstanceEnrollment>();
  const [state, setState] = useState({
    loName: "",
    questions: [] as PrimeFeedbackQuestion[],
    likeabilityQuestionValues: [] as string[],
    scaleTenQuestionValues: [] as number[],
  });
  const [feedbackSubmittedSuccessfully, setFeedbackSubmittedSuccessfully] = useState(false);
  const [feedbackSubmissionFailed, setFeedbackSubmissionFailed] = useState(false);
  const isLp = training.loType === LEARNING_PROGRAM;
  const feedbackSubmitTimer = 2000;
  const isMandatoryAnswerErrorText = GetTranslation("text.mandatory.question.error");
  const l1FeedbackSubmittedSuccessMessage = GetTranslation("succMsg.L1Feedback.submitted");
  const feedbackNotSubmittedErrorMessage = GetTranslation("errMsg.L1feedback");
  const connectedCallback = () => {
    const trainingEnrollment = training.enrollment;
    const enrolledInstance = trainingEnrollment.loInstance;
    const enrollment = enrolledInstance.enrollment
      ? enrolledInstance.enrollment
      : trainingEnrollment;
    setEnrolledInstance(enrolledInstance);
    setEnrollment(enrollment);
    enrolledInstance && launchL1Feedback(training, enrolledInstance.l1FeedbackInfo);
  };

  useEffect(() => {
    connectedCallback();
  }, [training]);

  const userNotificationBody = useMemo(() => {
    const userNotificationData: PrimeUserNotification = {} as PrimeUserNotification;
    userNotificationData.channel = userNotification.channel;
    userNotificationData.modelIds = userNotification.modelIds;
    userNotificationData.dateCreated = userNotification.dateCreated;
    userNotificationData.actionTaken = true;
    userNotificationData.message = userNotification.message;
    userNotificationData.modelNames = userNotification.modelNames;
    userNotificationData.modelTypes = userNotification.modelTypes;
    userNotificationData.read = userNotification.read;
    userNotificationData.role = userNotification.role;
    const notificationData: any = {};
    notificationData["id"] = userNotification.id;
    notificationData["type"] = "userNotification";
    notificationData["attributes"] = userNotificationData;
    const requestBody: any = {};
    requestBody["data"] = notificationData;
    return requestBody;
  }, [userNotification]);

  const launchL1Feedback = (training: PrimeLearningObject, l1FeedbackInfo: PrimeFeedbackInfo) => {
    SendMessageToParent({ type: PrimeEvent.L1_FEEDBACK_DIALOG_LAUNCHED }, GetPrimeEmitEventLinks());
    const localizedData = getPreferredLocalizedMetadata(training.localizedMetadata, locale);
    const scaleTenQuestions: number[] = [];
    const name = localizedData.name;
    const questions = l1FeedbackInfo.questions;
    const likeabilityQuestionValues =
      "text.strongly.disagree,text.disagree,text.ok,text.agree,text.strongly.agree"
        .split(",")
        .map(item => GetTranslation(item));
    for (let i = 1; i <= 10; i++) {
      scaleTenQuestions.push(i);
    }
    setState(prevState => ({
      ...prevState,
      loName: name,
      questions: questions,
      likeabilityQuestionValues: likeabilityQuestionValues,
      scaleTenQuestionValues: scaleTenQuestions,
    }));
  };

  const updateNotificationFunction = async () => {
    const userId = await getUserId();
    userId && updateNotification(userId, userNotification.id, userNotificationBody);
  };

  const getFeedbackSubmissionDetails = () => {
    let showMandatoryError = false;
    let score = 0;
    const answeredQuestions: PrimeFeedbackQuestion[] = [];
    state.questions.forEach((question: PrimeFeedbackQuestion) => {
      const questionId = `${question.questionType}-${question.questionId}`;
      const isMandatory = question.mandatory;
      const questionType = question.questionType;
      let answer = "";
      const answeredQuestion: PrimeFeedbackQuestion = {
        id: "",
        _transient: null,
        answer: "",
        mandatory: false,
        questionId: "",
        questionType: "",
        localizedMetadata: [],
        userResponseLocale: "",
      };

      if (questionType === SCALE_TEN) {
        for (let i = 0; i < state.scaleTenQuestionValues.length; i++) {
          const inputElement = document.getElementById(`${questionId}-${i}`) as HTMLInputElement;
          if (inputElement && inputElement.checked) {
            answer = inputElement.value;
            score = parseInt(answer) * 10;
          }
        }
      } else if (questionType === LIKEABILITY) {
        for (let i = 0; i < state.likeabilityQuestionValues.length; i++) {
          const inputElement = document.getElementById(`${questionId}-${i}`) as HTMLInputElement;
          if (inputElement && inputElement.checked) {
            answer = inputElement.value;
          }
        }
      } else if (questionType === L1_QUALITATIVE) {
        const textAreaElement = document.getElementById(
          `${question.questionId}`
        ) as HTMLTextAreaElement;
        const answerText = textAreaElement.value;
        if (answerText && answerText.length > 0) {
          answer = answerText;
        }
      }
      if (isMandatory && answer.length === 0) {
        showMandatoryError = true;
      }
      answeredQuestion.answer = answer;
      answeredQuestion.questionId = question.questionId;
      answeredQuestion.mandatory = isMandatory;
      answeredQuestion.questionType = questionType;
      answeredQuestion.userResponseLocale = locale.replace("-", "_");
      if (answer.length > 0) {
        answeredQuestions.push(answeredQuestion);
      }
    });
    if (showMandatoryError) {
      setShowError(true);
      return;
    }
    setShowError(false);
    const feedbackInfo: PrimeFeedbackInfo = {
      id: "",
      _transient: null,
      score: 0,
      showAutomatically: false,
      type: "",
      questions: [],
    };
    feedbackInfo.showAutomatically =
      enrollment?.loInstance.l1FeedbackInfo.showAutomatically || false;
    feedbackInfo.questions = answeredQuestions;
    feedbackInfo.score = score;
    const feedbackBody: any = {};
    feedbackBody["id"] = enrollment?.id;
    feedbackBody["type"] = "learningObjectInstanceEnrollment";
    feedbackBody["attributes"] = feedbackInfo;
    return feedbackBody;
  };
  const handleSubmitButton = () => {
    const feedbackBody = getFeedbackSubmissionDetails();
    if (!feedbackBody) {
      return;
    }
    try {
      const response = submitL1Feedback(enrollment, feedbackBody);
      setFeedbackSubmittedSuccessfully(true);
      updateNotificationFunction();
      setTimeout(() => {
        closeFeedbackPopUp(parentLo.id, userNotification.id);
      }, feedbackSubmitTimer);
    } catch (error: any) {
      const errorInfo = JSON.parse(error.responseText).source.info;
      if (errorInfo === "Feedback for the LO is already given.") {
        updateNotificationFunction();
        setFeedbackSubmissionFailed(true);
        setTimeout(() => {
          closeFeedbackPopUp(parentLo.id, userNotification.id);
        }, feedbackSubmitTimer);
      }
    }
  };
  const closeFeedbackDialog = () => {
    closeFeedbackPopUp(parentLo.id, userNotification.id);
  };
  const getHeaderDetails = () => {
    return (
      <div className={styles.feedback_header}>
        <h3 className={styles.feedback_feedbackHeader} data-automationid="modal-heading">
          <button
            aria-label={GetTranslation("text.closeFeedbackModal")}
            className={styles.feedback_close}
            onClick={closeFeedbackDialog}
          >
            <img src={CrossIcon} alt={GetTranslation("text.close")} />
          </button>
          <div>
            {isLp
              ? GetTranslation("text.programFeedback", true)
              : GetTranslation("heading.courseFeedback", true)}
          </div>
          <div className={styles.feedback_smallMarginTop}>
            <div className={styles.feedback_subtleText}>
              {isLp ? GetTranslation("header.program", true) : GetTranslation("text.course", true)}:
              {state.loName}
            </div>
          </div>
        </h3>
      </div>
    );
  };

  return (
    <div tabIndex={-1} className={styles.feedback_overlay}>
      <div className={styles.feedback_dialog} role="dialog" aria-modal="true">
        {getHeaderDetails()}
        <div className={styles.feedback_body}>
          {state.questions.map((questionItem, index) => (
            <PrimeFeedbackForm
              questionItem={questionItem}
              isMandatory={questionItem.mandatory}
              scaleTenQuestionValues={state.scaleTenQuestionValues}
              likeabilityQuestionValues={state.likeabilityQuestionValues}
              index={index}
              key={questionItem.id}
            />
          ))}
          {showError ? (
            <div>
              <span>
                <label
                  role="alert"
                  id="l1-fb-error-msg"
                  aria-live="assertive"
                  aria-label={isMandatoryAnswerErrorText}
                  className={styles.feedback_errorMsg_label}
                >
                  {isMandatoryAnswerErrorText}
                </label>
              </span>
            </div>
          ) : (
            ""
          )}
        </div>
        {feedbackSubmittedSuccessfully && (
          <div
            id="l1-fb-status-success"
            data-automationid="l1-fb-status-success"
            role="alert"
            aria-live="assertive"
            aria-label={l1FeedbackSubmittedSuccessMessage}
            className={` ${styles.feedback_alert} ${styles.feedback_alert_success}   `}
          >
            <p aria-hidden="true">{l1FeedbackSubmittedSuccessMessage}</p>
          </div>
        )}
        {feedbackSubmissionFailed && (
          <div
            id="l1-fb-status-error"
            data-automationId="l1-fb-status-error"
            role="alert"
            aria-live="assertive"
            aria-label={feedbackNotSubmittedErrorMessage}
            className={`${styles.feedback_alert} ${styles.feedback_alert_danger} `}
          >
            <p aria-hidden="true">{feedbackNotSubmittedErrorMessage}</p>
          </div>
        )}
        <div className={styles.feedback_l1feedback_footer}>
          {isMobile ? "" : <div className={styles.feedback_tenCols}> </div>}
          <div className={isMobile ? "" : styles.feedback_twoCols}>
            <button
              type="button"
              id="l1Feedback-submit"
              data-automationid="l1Feedback-submit"
              className={styles.feedback_doneButton}
              onClick={handleSubmitButton}
            >
              {GetTranslation("text.done")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeFeedbackDialog;
