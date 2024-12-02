import React, { useState, useEffect } from "react";
import styles from "./StarRatingSubmitDialog.module.css";
import { ALMStarRating } from "../ALMRatings";
import { PrimeLearningObject, PrimeLearningObjectInstance } from "../../models/PrimeModels";
import { GetTranslation } from "../../utils/translationService";
import { ADDED_TICK_SVG } from "../../utils/inline_svg";
import { useIntl } from "react-intl";

interface rating {
  ratingGiven: number;
  updateRating: (rating: any, loInstanceId: any) => Promise<void | undefined>;
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  loType: String;
}

const StarRatingSubmitDialog = (props: rating) => {
  const { ratingGiven, updateRating, trainingInstance, training, loType } = props;
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [showElement, setShowElement] = useState(false);
  const [errorOnSubmit, setErrorOnSubmit] = useState(false);
  const [rating, setRating] = useState(ratingGiven);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (submittedSuccessfully) {
      setTimeout(function () {
        setShowElement(false);
        setSubmittedSuccessfully(false);
      }, 5000);
    }
  }, [submittedSuccessfully]);

  useEffect(() => {
    setRating(ratingGiven);
  }, [ratingGiven]);

  const handleSubmitHelper = async () => {
    if (rating === ratingGiven) {
      return;
    }
    if (rating) {
      await updateRating(rating, trainingInstance.id);
      setSubmittedSuccessfully(true);
      setShowElement(true);
    }
  };

  const handleSubmit = async () => {
    try {
      await handleSubmitHelper();
    } catch (err) {
      console.log("error", err);
      setSubmittedSuccessfully(false);
      setErrorOnSubmit(true);
    }
  };

  return (
    <>
      <div
        className={styles.srOnly}
        aria-live="polite"
        role="region"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {showElement ? GetTranslation("alm.text.ratingSuccess") : ""}
      </div>
      {showElement ? (
        <div className={styles.ratingSubmittedSuccessfullyDialog}>
          <div className={styles.ratingSuccessfullySubmittedSvg}>{ADDED_TICK_SVG()}</div>
          <h3>{GetTranslation("alm.text.ratingSuccess")}</h3>
        </div>
      ) : (
        <div className={[styles.commonContainer, styles.submitRating].join(" ")}>
          <div className={styles.rateTheTrainingBlock}>
            <h3 className={styles.ratingHeading}>
              {formatMessage(
                {
                  id: "alm.text.provideRating",
                },
                { training: GetTranslation(`alm.training.${props.loType}`, true) }
              )}
            </h3>
            <ALMStarRating ratingGiven={rating} submitRating={setRating} />
          </div>
          <div className={` ${styles.ratingSubmitButton} ${styles.submitButton}`}>
            <button
              className={`almButton secondary ${styles.ratingSubmitButton}`}
              type="submit"
              onClick={handleSubmit}
              {...(rating === ratingGiven && { disabled: true })}
            >
              {GetTranslation("alm.text.submit")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StarRatingSubmitDialog;
