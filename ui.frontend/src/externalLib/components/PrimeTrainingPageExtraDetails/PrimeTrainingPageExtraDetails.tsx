import { Button } from "@adobe/react-spectrum";
import Send from "@spectrum-icons/workflow/Send";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import { useEffect, useMemo, useState } from "react";
import { InstanceBadge, Skill } from "../../models/common";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLoInstanceSummary,
} from "../../models/PrimeModels";
import { LEARNER_BADGE_SVG } from "../../utils/inline_svg";
import styles from "./PrimeTrainingPageExtraDetails.module.css";

const PrimeTrainingPageExtraDetails: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  enrollmentHandler: () => void;
  launchPlayerHandler: () => void;
}> = ({
  trainingInstance,
  skills,
  training,
  badge,
  instanceSummary,
  enrollmentHandler,
  launchPlayerHandler,
}) => {
  let [actionText, setActionText] = useState("");

  let translatedText = "";
  const action: string = useMemo(() => {
    // if(trainingInstance.seatLimit)

    if (trainingInstance.learningObject.enrollment) {
      const { enrollment } = trainingInstance.learningObject;
      if (enrollment.progressPercent === 0) {
        translatedText = "Start";
        return "Start";
      }
      if (enrollment.progressPercent === 100) {
        translatedText = "Revisit";
        return "Revisit";
      }
      translatedText = "Continue";
      return "Continue";
    } else if (trainingInstance.state === "Retired") {
      translatedText = "RegisterInterest";
      return "RegisterInterest";
    } else {
      translatedText = "Enroll";
      return "Enroll";
    }
    // return "preview";
  }, [trainingInstance.state, trainingInstance.learningObject]);

  useEffect(() => {
    setActionText(translatedText);
  }, [action]);

  const filteredSkills: Skill[] = useMemo(() => {
    let map: any = {};
    let filteredSkills = skills.filter((item) => {
      if (!map[item.name]) {
        map[item.name] = true;
        return true;
      }
      return false;
    });
    return filteredSkills;
  }, [skills]);
  //show only if not enrolled
  const showEnrollmentCount =
    !trainingInstance.learningObject.enrollment &&
    instanceSummary.enrollmentCount !== undefined
      ? true
      : false;

  const showBadges =
    !trainingInstance.learningObject.enrollment && badge?.badgeUrl;

  const showModulesCompleted = trainingInstance.learningObject.enrollment;

  const showAuthors = training.authors?.length > 0;
  return (
    <>
      <div className={styles.actionContainer}>
        {/* {action === "preview" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            Preview
          </Button>
        )} */}
        {action === "RegisterInterest" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            Register interest
          </Button>
        )}
        {action === "Enroll" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
            onPress={enrollmentHandler}
          >
            Enroll
          </Button>
        )}
        {(action === "Start" ||
          action === "Continue" ||
          action === "Revisit") && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
            onPress={launchPlayerHandler}
          >
            {actionText}
          </Button>
        )}
        {action === "PendingApproval" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            Pending mgr approval
          </Button>
        )}
      </div>
      {/* <div className={styles.buyNowContainer}>
        <Button
          variant="primary"
          UNSAFE_className={`${styles.buyNowButton} ${styles.commonButton}`}
        >
          Buy Now for $99
        </Button>

        <Button
          variant="primary"
          UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
        >
          Add to cart
        </Button>
      </div> */}
      {/* enrollment container */}
      {showEnrollmentCount && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <UserGroup />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {instanceSummary.enrollmentCount} enrollment(s)
            </label>
          </div>
        </div>
      )}

      {/* Badge Container */}
      {showBadges && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={`${styles.icon} ${styles.badge}`}>
            {LEARNER_BADGE_SVG()}
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>Badges</label>
            {
              <img
                src={badge.badgeUrl}
                alt="badge"
                width={"50px"}
                height={"50px"}
              />
            }
          </div>
        </div>
      )}

      {/* Modules Completed container */}
      {showModulesCompleted && (
        <div className={styles.commonContainer}>
          <span className={styles.moduleCompleted}>0/1</span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>Course completed</label>
          </div>
        </div>
      )}

      {/* Skills Container */}
      <div className={styles.commonContainer}>
        <span aria-hidden="true" className={styles.icon}>
          <Send></Send>
        </span>
        <div className={styles.innerContainer}>
          <label className={styles.label}>
            What levels will I achieve after the Mod Learning Path?
          </label>
          {filteredSkills.map((skill) => {
            return (
              <div key={skill.name}>
                {skill.name} - {skill.levelName}
              </div>
            );
          })}
        </div>
      </div>

      {/* Author */}
      {showAuthors && (
        <div className={styles.authorContainer}>
          {training.authors?.map((author) => {
            return (
              <div key={author.id}>
                <div className={styles.authors}>
                  <span aria-hidden="true">
                    <img src={author.avatarUrl} aria-hidden="true" alt="" />
                  </span>
                  <div className={styles.innerContainer}>
                    <label className={styles.label}>Author</label>
                    <p className={styles.authorName}>{author.name}</p>
                  </div>
                </div>
                <p className={styles.authorName}>{author.bio}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
export default PrimeTrainingPageExtraDetails;