import { useIntl } from "react-intl";
import { PrimeFeedbackQuestion } from "../../models";
import { GetTranslation, GetTranslationReplaced } from "../../utils/translationService";
import styles from "./PrimeFeedback.module.css";
import { KeyboardEventHandler, useCallback } from "react";
import { LIKEABILITY, SCALE_TEN } from "../../utils/constants";
const PrimeFeedbackForm: React.FC<{
  questionItem: PrimeFeedbackQuestion;
  isMandatory: boolean;
  scaleTenQuestionValues: number[];
  likeabilityQuestionValues: string[];
  index: number;
}> = ({ questionItem, scaleTenQuestionValues, likeabilityQuestionValues, index, isMandatory }) => {
  const { locale } = useIntl();
  const characterLimitValue = 500;
  const questionValue = (questionItem: PrimeFeedbackQuestion, locale: string) => {
    return questionItem?.localizedMetadata.find(text => text.locale == locale)?.name;
  };
  const getQuestionText = useCallback(
    (questionItem: PrimeFeedbackQuestion) => {
      let questionText = questionValue(questionItem, locale);
      if (!questionText) {
        questionText = questionValue(questionItem, "en-US");
      }
      return questionText;
    },
    [questionItem]
  );
  const mandatoryClass = isMandatory ? styles.feedback_mandatory : "";
  const isMandatoryQuestion = isMandatory ? "isMandatory-true" : "isMandatory-false";
  const isScaleTenQuestion = questionItem.questionType == SCALE_TEN;
  const isLikeabilityQuestion = questionItem.questionType == LIKEABILITY;
  const questionText = getQuestionText(questionItem);
  const getRadioOptions = (questionValues: any) => {
    return questionValues.map((item: any, index: number) => {
      return (
        <span className={styles.feedback_l1_radio_button_container}>
          <label className={styles.feedback_radioLabel}>
            <input
              className={styles.feedback_input_radio}
              type="radio"
              name={questionItem.questionId}
              id={`${questionItem.questionType}-${questionItem.questionId}-${index}`}
              data-automationid={`${questionItem.questionType}-${questionItem.questionId}-${index}`}
              value={item}
            />
            <label
              className={styles.feedback_radio}
              htmlFor="${questionItem.questionType}-${questionItem.questionId}-${index}"
            ></label>
          </label>
          <span className={styles.feedback_radio_item}>{item}</span>
        </span>
      );
    });
  };
  const getScaleTenQuestionData = () => {
    return (
      <>
        <div className={styles.feedback_l1_rating}>
          <span className={` ${styles.feedback_l1_rating_text} ${styles.feedback_subtleText}`}>
            {GetTranslation("text.notAtAllLikely")}
          </span>
          <span className={` ${styles.feedback_l1_rating_text} ${styles.feedback_subtleText}`}>
            {GetTranslation("text.extremelyLikely")}
          </span>
        </div>
        <form>
          <div className={styles.feedback_l1_radio_buttons_group}>
            {getRadioOptions(scaleTenQuestionValues)}
          </div>
        </form>
      </>
    );
  };
  const getLikeabilityQuestionData = () => {
    return (
      <form>
        <div className={styles.feedback_l1_radio_buttons_group}>
          {getRadioOptions(likeabilityQuestionValues)}
        </div>
      </form>
    );
  };
  const countChar: KeyboardEventHandler<HTMLTextAreaElement> = e => {
    const eventTarget = e.target as HTMLTextAreaElement;
    const id = eventTarget?.id;
    const textAreaElement = document.getElementById(id) as HTMLTextAreaElement;
    if (!textAreaElement) return;
    const len = Math.min(textAreaElement.value.length, characterLimitValue);
    const divElement = document.getElementById(`${id}-charCount`) as HTMLDivElement;
    if (divElement) {
      divElement.innerText = GetTranslationReplaced(
        "text.numCharsLeft",
        (characterLimitValue - len).toString()
      );
    }
  };
  const textAreaQuestionData = () => {
    return (
      <div className={styles.feedback_textAreaContainer}>
        <textarea
          id={questionItem.questionId}
          data-automationid={questionItem.questionId}
          className={styles.feedback_textArea}
          maxLength={characterLimitValue}
          onKeyUp={countChar}
        ></textarea>
        <div
          className={`${styles.characterLimit} ${styles.feedback_subtleText} `}
          id={`${questionItem.questionId}-charCount`}
          data-automationid={`${questionItem.questionId}-charCount`}
        >
          {GetTranslationReplaced("text.numCharsLeft", characterLimitValue.toString())}
        </div>
      </div>
    );
  };
  return (
    <>
      <div className={`${styles.feedback_l1_question} ${mandatoryClass}`}>
        {GetTranslationReplaced("text.sNo.fullstop", (index + 1).toString())}
        <span>
          <label data-automationid={`${questionText}- ${isMandatoryQuestion}`}>
            {questionText}
          </label>
        </span>
      </div>
      <div className={`${styles.feedback_l1_answer} ${styles.feedback_clearfix}`}>
        {isScaleTenQuestion && getScaleTenQuestionData()}
        {isLikeabilityQuestion && getLikeabilityQuestionData()}
        {!isScaleTenQuestion && !isLikeabilityQuestion && textAreaQuestionData()}
      </div>
    </>
  );
};

export default PrimeFeedbackForm;
