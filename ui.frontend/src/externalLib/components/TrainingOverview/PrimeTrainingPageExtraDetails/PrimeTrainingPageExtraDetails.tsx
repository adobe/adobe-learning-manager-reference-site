import { Button } from "@adobe/react-spectrum";
import Send from "@spectrum-icons/workflow/Send";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import Calendar from "@spectrum-icons/workflow/Calendar";
import RemoveCircle from "@spectrum-icons/workflow/RemoveCircle";
import AddCircle from "@spectrum-icons/workflow/AddCircle";
import PinOff from "@spectrum-icons/workflow/PinOff";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { InstanceBadge, Skill } from "../../../models/common";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLoInstanceSummary,
  PrimeResource,
} from "../../../models/PrimeModels";
import { LEARNER_BADGE_SVG } from "../../../utils/inline_svg";
import styles from "./PrimeTrainingPageExtraDetails.module.css";
import { modifyTime } from "../../../utils/dateTime";
import { getALMObject } from "../../../utils/global";

const PrimeTrainingPageExtraDetails: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  enrollmentHandler: () => void;
  launchPlayerHandler: () => void;
  unEnrollmentHandler: Function;
}> = ({
  trainingInstance,
  skills,
  training,
  badge,
  instanceSummary,
  enrollmentHandler,
  launchPlayerHandler,
  unEnrollmentHandler,
}) => {
  const { formatMessage } = useIntl();
  const { locale } = getALMObject().getALMConfig().locale;

  const action: string = useMemo(() => {
    // if(trainingInstance.seatLimit)

    if (trainingInstance.learningObject.enrollment) {
      const { enrollment } = trainingInstance.learningObject;
      if (enrollment.progressPercent === 0) {
        return "start";
      }
      if (enrollment.progressPercent === 100) {
        return "revisit";
      }
      return "continue";
    } else if (trainingInstance.state === "Retired") {
      return "registerInterest";
    } else {
      return "enroll";
    }
  }, [trainingInstance.state, trainingInstance.learningObject]);

  const actionText = useMemo(() => {
    return formatMessage({
      id: `alm.overview.button.${action}`,
    });
  }, [action, formatMessage]);

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

  // const showModulesCompleted = trainingInstance.learningObject.enrollment;

  const showAuthors = training.authors?.length > 0;
  const showCompletionDeadline =
    training.enrollment && trainingInstance.completionDeadline;
  const showEnrollmentDeadline =
    !training.enrollment && trainingInstance.enrollmentDeadline;

  const showJobAids = training.enrollment && training.supplementaryLOs?.length;

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
        {action === "registerInterest" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            {actionText}
          </Button>
        )}
        {action === "enroll" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
            onPress={enrollmentHandler}
          >
            {actionText}
          </Button>
        )}
        {(action === "start" ||
          action === "continue" ||
          action === "revisit") && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
            onPress={launchPlayerHandler}
          >
            {actionText}
          </Button>
        )}
        {action === "pendingApproval" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            {actionText}
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
      {/* Enrollment Deadline container */}
      {showEnrollmentDeadline && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <Calendar />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "alm.overview.enrollment.deadline",
                defaultMessage: "Enrollment Deadline",
              })}
            </label>
            <div>{modifyTime(trainingInstance.enrollmentDeadline, locale)}</div>
          </div>
        </div>
      )}
      {/* Completion Deadline container */}
      {showCompletionDeadline && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <Calendar />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "alm.overview.completion.deadline",
                defaultMessage: "Completion Deadline",
              })}
            </label>
            <div>{modifyTime(trainingInstance.completionDeadline, locale)}</div>
          </div>
        </div>
      )}

      {/* enrollment container */}
      {showEnrollmentCount && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <UserGroup />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage(
                {
                  id: "alm.overview.enrollment.count",
                },
                {
                  0: instanceSummary.enrollmentCount,
                }
              )}
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
      {/* {showModulesCompleted && (
        <div className={styles.commonContainer}>
          <span className={styles.moduleCompleted}>0/1</span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>Course completed</label>
          </div>
        </div>
      )} */}

      {/* Skills Container */}
      <div className={styles.commonContainer}>
        <span aria-hidden="true" className={styles.icon}>
          <Send></Send>
        </span>
        <div className={styles.innerContainer}>
          <label className={styles.label}>
            {formatMessage({
              id: "alm.overview.skills.achieve.level",
            })}
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

      {/* JOB Aid container */}
      {showJobAids && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <PinOff />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "alm.jobaid",
                defaultMessage: "Job Aid",
              })}
            </label>
            <div>
              {training.supplementaryLOs.map((item) => {
                return item.instances[0].loResources.map((loResource) => {
                  return loResource.resources.map((resource) => (
                    <PrimeTrainingPageExtraJobAid
                      resource={resource}
                      training={item}
                      enrollmentHandler={enrollmentHandler}
                      key={item.id}
                      unEnrollmentHandler={unEnrollmentHandler}
                    />
                  ));
                });
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PrimeTrainingPageExtraDetails;

const PrimeTrainingPageExtraJobAid: React.FC<{
  resource: PrimeResource;
  training: PrimeLearningObject;
  enrollmentHandler: Function;
  unEnrollmentHandler: Function;
}> = ({ resource, training, enrollmentHandler, unEnrollmentHandler }) => {
  //on clikc, if not enrolled show popup alert
  const [isEnrolled, setIsEnrolled] = useState(() => {
    return training.enrollment ? true : false;
  });

  const unenroll = () => {
    unEnrollmentHandler({
      enrollmentId: training.enrollment.id,
      isSupplementaryLO: true,
    });
    setIsEnrolled(false);
  };

  const enroll = () => {
    enrollmentHandler({
      id: training.id,
      instanceId: training.instances[0].id,
      isSupplementaryLO: true,
    });
    setIsEnrolled(true);
  };

  return (
    <div className={styles.jobAid}>
      {training.id}
      <span className={styles.name}>{resource.name}</span>
      <span className={styles.jobAidIcon}>
        {isEnrolled ? (
          <span onClick={unenroll}>
            <RemoveCircle />
          </span>
        ) : (
          <span onClick={enroll}>
            <AddCircle />
          </span>
        )}
      </span>
    </div>
  );
};
