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
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Content, ContextualHelp, Text } from "@adobe/react-spectrum";
import Calendar from "@spectrum-icons/workflow/Calendar";
import Clock from "@spectrum-icons/workflow/Clock";
import ClockCheck from "@spectrum-icons/workflow/ClockCheck";
import Download from "@spectrum-icons/workflow/Download";
import Money from "@spectrum-icons/workflow/Money";
import PinOff from "@spectrum-icons/workflow/PinOff";
import Send from "@spectrum-icons/workflow/Send";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useAlert } from "../../../common/Alert/useAlert";
import { InstanceBadge, Skill } from "../../../models/custom";
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLoInstanceSummary,
} from "../../../models/PrimeModels";
import { ADOBE_COMMERCE } from "../../../utils/constants";
import { modifyTime } from "../../../utils/dateTime";
import {
  getALMAccount,
  getALMConfig,
  getALMObject,
} from "../../../utils/global";
import { DEFAULT_USER_SVG, LEARNER_BADGE_SVG } from "../../../utils/inline_svg";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  GetTranslationsReplaced,
} from "../../../utils/translationService";
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
  addToCartHandler: () => Promise<{
    items: any;
    totalQuantity: Number;
    error: any;
  }>;
  unEnrollmentHandler: Function;
  jobAidClickHandler: Function;
  isPreviewEnabled: boolean;
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
  addToCartHandler,
  unEnrollmentHandler,
  jobAidClickHandler,
  isPreviewEnabled,
}) => {
  const [almAlert] = useAlert();
  const { formatMessage } = useIntl();
  const config = getALMConfig();
  const locale = config.locale;
  const enrollment = training.enrollment;
  const loType = training.loType;

  const isPricingEnabled =
    training.price && getALMConfig().usageType === ADOBE_COMMERCE;

  const [isTrainingNotSynced, setIsTrainingNotSynced] = useState(false);
  let showPreviewButton =
    isPreviewEnabled &&
    training.hasPreview &&
    (!enrollment || enrollment.state === PENDING_APPROVAL);

  const showPriceDetails = isPricingEnabled && enrollment;

  const action: string = useMemo(() => {
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
    } else if (isPricingEnabled) {
      return "buyNow";
    } else {
      return "enroll";
    }
  }, [trainingInstance.state, training.price, enrollment]);

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
    if (action === "buyNow") {
      return formatMessage(
        { id: "alm.training.buyNow" },
        { x: training.price }
      );
    }
    return formatMessage({
      id: `alm.overview.button.${action}`,
    });
  }, [action, formatMessage, training.price]);

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
      enrollmentHandler();
      launchPlayerHandler();
    } catch (e) {}
  };

  const addToCart = async () => {
    try {
      const { error, totalQuantity } = await addToCartHandler();
      if (error && error[0]?.message) {
        almAlert(
          true,
          formatMessage({ id: "alm.addToCart.error" }, { loType: loType }),
          AlertType.error
        );
      } else {
        getALMObject().updateCart(totalQuantity);
        almAlert(
          true,
          formatMessage({ id: "alm.addedToCart" }),
          AlertType.success
        );
      }
    } catch (e) {}
  };

  const addProductToCart = async () => {
    await addToCart();
  };

  const minimumCriteria = useMemo(() => {
    let label = "";
    let value = "";
    let completionCount = training.loResourceCompletionCount;

    if (training.loType === "course") {
      let totalCount = trainingInstance?.loResources?.length;
      label = GetTranslationsReplaced(
        "alm.overview.course.minimum.criteria.label",
        {
          x: completionCount,
          y: totalCount,
        },
        true
      );
      value = `${completionCount}/${totalCount}`;
    } else if (training.loType === "certification") {
      let totalCount = training.subLOs.length;
      label = GetTranslationsReplaced(
        "alm.overview.certification.minimum.criteria.label",
        {
          x: completionCount,
          y: totalCount,
        },
        true
      );
      value = `${completionCount}/${totalCount}`;
    }
    return { label, value };
  }, [
    training.loResourceCompletionCount,
    training.loType,
    training.subLOs?.length,
    trainingInstance?.loResources?.length,
  ]);

  //show only if not enrolled
  const showEnrollmentCount =
    !trainingInstance.learningObject.enrollment &&
    instanceSummary.enrollmentCount !== undefined
      ? true
      : false;

  const showBadges =
    !trainingInstance.learningObject.enrollment && badge?.badgeUrl;

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
    training.enrollment &&
    training.unenrollmentAllowed &&
    !(enrollment.progressPercent === 100);
  const showCertificationDeadline =
    training.enrollment && training.enrollment.completionDeadline;
  const isCertification = loType === "certification";

  useEffect(() => {
    const computeIsSynced = async () => {
      const account = await getALMAccount();
      if (
        new Date(training.dateCreated) >
        new Date(account.lastSyncedDateCreatedForMagento)
      ) {
        setIsTrainingNotSynced(true);
      } else {
        setIsTrainingNotSynced(false);
      }
    };
    computeIsSynced();
  }, [training.dateCreated, training.price]);

  const trainingNotAvailableForPurchaseText = isTrainingNotSynced ? (
    <p style={{ textAlign: "center" }} className={styles.label}>
      {formatMessage(
        {
          id: "alm.training.overview.not.available",
        },
        { training: GetTranslation(`alm.training.${loType}`, true) }
      )}
    </p>
  ) : (
    ""
  );

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
            <Button
              variant="primary"
              UNSAFE_className={`${styles.addToCartButton} ${styles.commonButton}`}
              onPress={addProductToCart}
              isDisabled={isTrainingNotSynced}
            >
              {formatMessage(
                {
                  id: `alm.addToCart`,
                },
                { x: getFormattedPrice(training.price) }
              )}
            </Button>
            {/* </div> */}
            {trainingNotAvailableForPurchaseText}
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

      {/* Minimum Completion Criteria container */}

      {showPriceDetails && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <Money />
          </span>
          <div className={styles.innerContainer}>
            <div>
              {formatMessage({
                id: "alm.purchase.details",
                defaultMessage: "Purchase Details",
              })}
            </div>
            <div>
              {formatMessage(
                {
                  id: "alm.training.price",
                  defaultMessage: "Price",
                },
                { amount: getFormattedPrice(training.price) }
              )}
            </div>
            <div>{modifyTime(enrollment.dateEnrolled, locale)}</div>
          </div>
        </div>
      )}

      {training.loResourceCompletionCount !==
        trainingInstance.loResources?.length && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.minimumCriteria}>
            {minimumCriteria.value}
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.minimumCriteriaLabel}>
              {formatMessage({
                id: "alm.overview.minimum.completion.criteria",
                defaultMessage: "Minimum Completion Criteria",
              })}
            </label>
            <ContextualHelp variant="help">
              <Content>
                <Text>{minimumCriteria.label}</Text>
              </Content>
            </ContextualHelp>
          </div>
        </div>
      )}

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
            <div>
              {loType === "certification"
                ? showCertificationDeadline == undefined
                  ? formatMessage(
                      {
                        id: "alm.overview.certification.deadline",
                      },
                      {
                        0: trainingInstance?.completionDeadline?.slice(0, -1),
                      }
                    )
                  : modifyTime(showCertificationDeadline, locale)?.slice(0, -10)
                : modifyTime(trainingInstance.completionDeadline, locale)}
            </div>
          </div>
        </div>
      )}
      {/* Certificate Type container */}
      {isCertification && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <Clock />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "alm.overview.certification.type",
                defaultMessage: "Type",
              })}
            </label>
            <div>
              {trainingInstance?.validity ? "Recurring" : "Non Recurring"}
            </div>
          </div>
        </div>
      )}
      {/* Certificate Validity container */}
      {isCertification && (
        <div className={styles.commonContainer}>
          <span aria-hidden="true" className={styles.icon}>
            <ClockCheck />
          </span>
          <div className={styles.innerContainer}>
            <label className={styles.label}>
              {formatMessage({
                id: "alm.overview.certification.validity",
                defaultMessage: "Validity",
              })}
            </label>
            <div>
              {trainingInstance?.validity
                ? trainingInstance?.validity?.slice(0, -1) + " " + "months"
                : "Perpetual"}
            </div>
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
              `alm.overview.skills.achieve.level.${loType}`,
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
              {GetTranslation("alm.training.jobAid", true)}
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
              {loType === "certification"
                ? "Unenroll from certification"
                : loType === "learningProgram"
                ? "Unenroll from learning Program"
                : "Unenroll from course"}
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
export default PrimeTrainingPageMetaData;
