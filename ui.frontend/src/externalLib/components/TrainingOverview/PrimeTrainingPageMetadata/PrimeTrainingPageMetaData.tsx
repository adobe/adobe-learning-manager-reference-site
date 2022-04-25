/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button } from "@adobe/react-spectrum";
import Calendar from "@spectrum-icons/workflow/Calendar";
import Download from "@spectrum-icons/workflow/Download";
import PinOff from "@spectrum-icons/workflow/PinOff";
import Send from "@spectrum-icons/workflow/Send";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { InstanceBadge, Skill } from "../../../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLoInstanceSummary,
} from "../../../models/PrimeModels";
import { modifyTime } from "../../../utils/dateTime";
import { getALMConfig, getALMObject } from "../../../utils/global";
import { DEFAULT_USER_SVG, LEARNER_BADGE_SVG } from "../../../utils/inline_svg";
import { GetTranslation } from "../../../utils/translationService";
import { PrimeTrainingPageExtraJobAid } from "../PrimeTrainingPageExtraDetailsJobAids";
import styles from "./PrimeTrainingPageMetadata.module.css";

const PENDING_APPROVAL = "PENDING_APPROVAL";
const PrimeTrainingPageMetaData: React.FC<{
  trainingInstance: PrimeLearningObjectInstance;
  skills: Skill[];
  training: PrimeLearningObject;
  badge: InstanceBadge;
  instanceSummary: PrimeLoInstanceSummary;
  showAuthorInfo: string;
  showEnrollDeadline: string;
  enrollmentHandler: () => void;
  launchPlayerHandler: () => void;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
}> = ({
  trainingInstance,
  skills,
  training,
  badge,
  instanceSummary,
  showAuthorInfo,
  showEnrollDeadline,
  enrollmentHandler,
  launchPlayerHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
}) => {
  const { formatMessage } = useIntl();
  const config = getALMConfig();
  const locale = config.locale;
  const enrollment = training.enrollment;
  let showPreviewButton =
    training.hasPreview &&
    (!enrollment || enrollment.state === PENDING_APPROVAL);

  const action: string = useMemo(() => {
    // if(trainingInstance.seatLimit)

    if (enrollment) {
      if (enrollment.state === PENDING_APPROVAL) {
        return "pendingApproval";
      } else if (enrollment.progressPercent === 0) {
        return "start";
      } else if (enrollment.progressPercent === 100) {
        return "revisit";
      }
      return "continue";
    } else if (trainingInstance.state === "Retired") {
      return "registerInterest";
    } else if (training.price) {
      return "buyNow";
    } else {
      return "enroll";
    }
  }, [trainingInstance.state, trainingInstance.learningObject]);

  const seatsAvailableText =
    trainingInstance.seatLimit > -1 ? (
      <p style={{ textAlign: "center" }} className={styles.label}>
        {formatMessage({
          id: `alm.overview.seatsAvailable`,
        })}
        {trainingInstance.seatLimit}
      </p>
    ) : (
      ""
    );

  const actionText = useMemo(() => {
    if (action == "buyNow") {
      return formatMessage(
        { id: "alm.training.buyNow" },
        { x: training.price }
      );
    }
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

  const unEnrollClickHandler = () => {
    unEnrollmentHandler({ enrollmentId: training.enrollment.id });
  };

  const onPressHandler = async () => {
    try {
      await enrollmentHandler();
      launchPlayerHandler();
    } catch (e) {}
  };

  const buyNowHandler = async () => {
    // try {
    //   await enrollmentHandler();
    //   launchPlayerHandler();
    // } catch (e) {}
  };

  const addToCartHandler = async () => {
    // try {
    //   await enrollmentHandler();
    //   launchPlayerHandler();
    // } catch (e) {}
  };

  //show only if not enrolled
  const showEnrollmentCount =
    !trainingInstance.learningObject.enrollment &&
    instanceSummary.enrollmentCount !== undefined
      ? true
      : false;

  const showBadges =
    !trainingInstance.learningObject.enrollment && badge?.badgeUrl;

  // const showModulesCompleted = trainingInstance.learningObject.enrollment;

  const showAuthors =
    showAuthorInfo === "true" &&
    training.authors?.length > 0 &&
    getALMObject().isPrimeUserLoggedIn();
  var legacyAuthorNames = new Set(training.authorNames);
  training.authors?.forEach((author) => {
    legacyAuthorNames.delete(author.name);
  });
  const showCompletionDeadline =
    showEnrollDeadline === "true" && trainingInstance.completionDeadline;
  const showEnrollmentDeadline =
    !training.enrollment && trainingInstance.enrollmentDeadline;
  const showJobAids = training.enrollment && training.supplementaryLOs?.length;
  const showResource = training.supplementaryResources?.length;
  const showUnenrollButton =
    training.enrollment && training.unenrollmentAllowed;
  return (
    <section className={styles.container}>
      {showPreviewButton && (
        <>
          <Button
            variant="primary"
            UNSAFE_className={`${styles.previewButton} ${styles.commonButton}`}
            onPress={launchPlayerHandler}
          >
            {formatMessage({
              id: `alm.overview.button.preview`,
            })}
          </Button>

          <div className={styles.textOr}>
            {formatMessage({
              id: `alm.overview.text.or`,
            })}
          </div>
        </>
      )}

      <div className={styles.actionContainer}>
        {action === "registerInterest" && (
          <Button
            variant="primary"
            UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
          >
            {actionText}
          </Button>
        )}
        {action === "enroll" && (
          <>
            <Button
              variant="primary"
              UNSAFE_className={`${styles.actionButton} ${styles.commonButton}`}
              onPress={onPressHandler}
            >
              {actionText}
            </Button>
            {seatsAvailableText}
          </>
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
        {action === "buyNow" && (
          <>
            <div className={styles.buyNowContainer}>
              <Button
                variant="primary"
                UNSAFE_className={`${styles.buyNowButton} ${styles.commonButton}`}
                onPress={buyNowHandler}
              >
                {actionText}
              </Button>

              <Button
                variant="primary"
                UNSAFE_className={`${styles.addToCartButton} ${styles.commonButton}`}
                onPress={addToCartHandler}
              >
                {formatMessage({
                  id: `alm.addToCart`,
                })}
              </Button>
            </div>
            {seatsAvailableText}
          </>
        )}
        {action === "pendingApproval" && (
          <>
            <Button
              variant="secondary"
              UNSAFE_className={`${styles.pendingButton} ${styles.commonButton}`}
              isDisabled={true}
            >
              {actionText}
            </Button>
            <div className={styles.mangerPendingApprovalText}>
              {formatMessage({
                id: "alm.overview.manager.approval.pending",
              })}
            </div>
            {seatsAvailableText}
          </>
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
            <label className={styles.label}>
              {GetTranslation("alm.overview.badge", true)}
            </label>
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
            {GetTranslation(
              `alm.overview.skills.achieve.level.${training.loType}`,
              true
            )}
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
          {Array.from(legacyAuthorNames).map((legacyAuthorName) => {
            return (
              <div className={styles.authors}>
                <span className={styles.cpauthorcircle}>
                  {DEFAULT_USER_SVG()}
                </span>
                <div className={styles.innerContainer}>
                  <label className={styles.label}>Author</label>
                  <p className={styles.authorName}>{legacyAuthorName}</p>
                </div>
              </div>
            );
          })}
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
              {GetTranslation("prime.catalog.card.jobAid", true)}
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
                      jobAidClickHandler={jobAidClickHandler}
                    />
                  ));
                });
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resources container */}
      {showResource && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <Download />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "sfdsfs",
                defaultMessage: "Resources",
              })}
            </label>
            <div>
              {training.supplementaryResources.map((item) => {
                return training.enrollment ? (
                  <a
                    href={item.location}
                    download
                    className={styles.supplymentaryLoName}
                    target="_blank"
                    rel="noreferrer"
                    key={item.id}
                  >
                    <span className={styles.resourceName}>{item.name}</span>
                  </a>
                ) : (
                  <span className={styles.resourceName}>{item.name}</span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* UnEnroll button container */}
      {showUnenrollButton && (
        <div className={styles.commonContainer}>
          <span
            aria-hidden="true"
            className={styles.icon}
            style={{ visibility: "hidden" }}
          >
            <Download />
          </span>
          <div className={styles.innerContainer}>
            <a
              href="javascript:void(0)"
              className={styles.supplymentaryLoName}
              onClick={unEnrollClickHandler}
            >
              Unenroll from course
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
export default PrimeTrainingPageMetaData;
