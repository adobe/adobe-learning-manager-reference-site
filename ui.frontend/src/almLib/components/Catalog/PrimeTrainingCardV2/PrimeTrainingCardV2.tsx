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
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/aria-role */
import { ProgressBar } from "@adobe/react-spectrum";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";

import MoreVertical from "@spectrum-icons/workflow/MoreVertical";
import { AlertType } from "../../../common/Alert/AlertDialog";
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeRecommendations,
  PrimeUser,
} from "../../../models/PrimeModels";
import { convertSecondsToHourAndMinsText, modifyTimeDDMMYY } from "../../../utils/dateTime";
import {
  ADDED_TICK_SVG,
  ADD_BUTTON_SVG,
  BOOKMARK_ICON,
  BOOKMARKED_ICON,
  ERROR_ICON_SVG,
  HEART_IN_CIRCLE,
  SKILL_SVG,
  JOBAID_CARD_REMOVE,
  JOBAID_ICON_REMOVE,
  DOWNLOAD_ICON_ROUNDED,
} from "../../../utils/inline_svg";
import {
  formatMap,
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  ReplaceAccountTerminology,
} from "../../../utils/translationService";
import styles from "./PrimeTrainingCardV2.module.css";
import { PrimeEvent, Widget, WidgetTypeNew } from "../../../utils/widgets/common";
import {
  CONTINUE,
  CPENEW,
  JOBAID,
  LEARNING_PROGRAM,
  OTHER,
  VIEW,
  HUNDERED_PERCENT,
} from "../../../utils/constants";
import { InvocationType, getExtension } from "../../../utils/native-extensibility";
import {
  canStart,
  checkIfRecoOrCPENEWDiscoveryStrip,
  getActionTextForDisabledLinks,
  getActiveInstance,
  getAuthorName,
  handleRedirectionForLoggedIn,
  handleRedirectionForNonLoggedIn,
  hasSingleActiveInstance,
  isExtensionAllowed,
  isLinkedinLO,
  canShowPrice,
  openJobAid,
  showToast,
} from "./PrimeTrainingCardV2.helper";
import { getALMObject, getWidgetConfig } from "../../../utils/global";
import { fetchJobAidResource } from "../../../utils/lo-utils";
import { ALMEffectivenessDialog } from "../../Common/ALMEffectivenessDialog";
import { GetPrimeObj } from "../../../utils/widgets/windowWrapper";
import { getFormattedPrice } from "../../../utils/price";
import { getConflictingSessions, useRatingsTemplate } from "../../../utils/hooks";
import SessionConflictDialog from "../../SessionConflict/SessionConflictDialog";
import { useConfirmationAlert } from "../../../common/Alert/useConfirmationAlert";
import { getActiveInstances, splitStringIntoArray } from "../../../utils/catalog";

import { useJobAids } from "../../../hooks/useJobAids";
import { useAlert } from "../../../common/Alert/useAlert";
import { downloadFile } from "../../../utils/widgets/utils";
import { clearBreadcrumbPathDetails } from "../../../utils/breadcrumbUtils";

const UNDO_ACTIONS = {
  unSaved: "unSaved",
  dontRecommend: "dontRecommend",
};

const LOADING_TYPE = {
  saveUnsave: "saveUnsave",
  enroll: "enroll",
};

const LEVELS_NAME_MAP: Record<string, string> = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

const PrimeTrainingCardV2: React.FC<{
  widget?: Widget;
  training: PrimeLearningObject;
  account: PrimeAccount;
  user: PrimeUser;
  guest?: boolean;
  signUpURL?: string;
  almDomain?: string;
  showProgressBar?: boolean;
  showDontRecommend?: boolean;
  showBookmark?: boolean;
  showSkills?: boolean;
  showPRLInfo?: boolean;
  showRating?: boolean;
  showEffectivenessIndex?: boolean;
  showActionButton?: boolean;
  showRecommendedReason?: boolean;
  showAuthorInfo?: boolean;
  showPrice?: boolean;
  enableAnnouncementRecoUGWLink?: boolean;
  recoReason?: any;
  recoReasonModel?: any;
  handleAddBookmark?: Function;
  handleRemoveBookmark?: Function;
  removeItemFromList?: Function;
  handleBlockLORecommendation?: Function;
  handleUnblockLORecommendation?: Function;
  handleLoEnrollment: Function;
  updateLearningObject?: Function;
  handleLoNameClick?: Function;
  handleActionClick?: Function;
  handlePlayerLaunch?: Function;
  handleL1FeedbackLaunch: Function;
  removeTrainingFromListById?: Function;
}> = ({
  widget,
  training,
  account,
  showProgressBar,
  showDontRecommend,
  showBookmark,
  showSkills,
  showPRLInfo,
  showRating,
  showEffectivenessIndex,
  showActionButton = true,
  showRecommendedReason,
  showAuthorInfo,
  showPrice,
  enableAnnouncementRecoUGWLink,
  recoReason,
  recoReasonModel,
  handleAddBookmark,
  handleRemoveBookmark,
  removeItemFromList,
  handleBlockLORecommendation,
  handleUnblockLORecommendation,
  handleLoEnrollment,
  updateLearningObject,
  handleLoNameClick,
  handleActionClick,
  handlePlayerLaunch,
  handleL1FeedbackLaunch,
  removeTrainingFromListById,
}) => {
  const { format, type, skillNames, name, description, cardBgStyle, enrollment, overview } =
    useTrainingCard(training);
  const { enroll, unenroll, isEnrolled } = useJobAids(
    training,
    handleLoEnrollment,
    updateLearningObject,
    undefined,
    removeTrainingFromListById
  );
  const [almConfirmationAlert] = useConfirmationAlert();
  const [almAlert] = useAlert();
  const [undoContainerType, setUndoContainerType] = useState("");
  const [recommendationList, setRecommendationList] = useState(new Set());
  const [recommendationListById, setRecommendationListById] = useState(new Map());
  const [isEnrollExtensionPresent, setIsEnrollExtensionPresent] = useState(false);
  const [unsaveUndoTimeout, setUnsaveUndoTimeout] = useState({} as any);
  const [loadingType, setLoadingType] = useState("");
  const [showEnrolledButton, setShowEnrolledButton] = useState(false);
  const [enrollErrorMssage, setEnrollErrorMssage] = useState("");
  const [jobAidDownloadUrl, setJobAidDownloadUrl] = useState("");

  const [showEffectivenessDialog, setShowEffectivenessDialog] = useState<boolean>(false);
  const [showExtraActions, setExtraActions] = useState<boolean>(false);
  const extraActionsContainerRef = useRef<HTMLDivElement>(null);
  const { formatMessage, locale } = useIntl();
  const downloadLabel = GetTranslation("alm.text.download");
  const ratingTemplate = useRatingsTemplate(styles, formatMessage, training);
  const isJobAid = training.loType === JOBAID;
  const classForAddOrRemoveFromList = loadingType === LOADING_TYPE.enroll ? styles.hidden : "";
  const actionButtonId = `actionButton-${name}-${widget?.type}`;

  const formatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);

  const showDownloadButtonForJobAid = useMemo(() => {
    if (isJobAid) {
      const trainingJobAidResource = training.instances[0]?.loResources[0]?.resources?.[0];
      if (trainingJobAidResource) {
        const downloadUrl = trainingJobAidResource.downloadUrl;
        const jobAidContentType = trainingJobAidResource.contentType;
        setJobAidDownloadUrl(downloadUrl);
        return isJobAid && jobAidContentType !== OTHER && downloadUrl;
      }
    }
  }, [training]);
  const dueDateorPublishedDate = useMemo(() => {
    let translationKey = "alm.card.published.date";
    let dateText =
      training?.loType === LEARNING_PROGRAM ? training?.dateUpdated : training?.datePublished;
    let id = "primelxp-datePublished";

    if (enrollment) {
      const { completionDeadline, loInstance } = enrollment;
      const primeLoInstance = loInstance as PrimeLearningObjectInstance;
      const completionDeadlineText = completionDeadline || primeLoInstance?.completionDeadline;
      if (completionDeadlineText) {
        dateText = completionDeadlineText;
        translationKey = "alm.card.due.date";
        id = "primelxp-dateDue";
      }
    }

    return dateText
      ? {
          translationKey,
          value: modifyTimeDDMMYY(dateText, locale),
          id,
        }
      : {};
  }, [training, enrollment]);

  const actionText = useMemo(() => {
    if (!showActionButton) {
      return "";
    }
    if (isEnrollExtensionPresent && !enrollment) {
      return getActionTextForDisabledLinks(widget!);
    }
    if (isLinkedinLO(training) && getWidgetConfig()?.isLoadedInsideApp) {
      return getActionTextForDisabledLinks(widget!);
    }
    return enrollment
      ? enrollment.progressPercent == 100
        ? GetTranslation("locard.revisit")
        : canStart(training, isEnrollExtensionPresent, account)
          ? GetTranslation("continueCaps")
          : getActionTextForDisabledLinks(widget!)
      : canStart(training, isEnrollExtensionPresent, account)
        ? GetTranslation("locard.start")
        : getActionTextForDisabledLinks(widget!);
  }, [training, enrollment, widget]);

  useEffect(() => {
    if (
      widget?.type === WidgetTypeNew.RECOMMENDATIONS_STRIP ||
      (widget?.type === WidgetTypeNew.DISCOVERY_RECO &&
        account.recommendationAccountType === CPENEW)
    ) {
      let recommendations = [];
      let parametersList = new Set();
      let parametersById: any;
      if (account.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
        const skills = training.skills || [];
        const tempSkills = skills.map(skill => {
          return {
            name: skill.skillLevel.skill.name,
            id: skill.skillLevel.skill.id,
          };
        });
        recommendations = [...tempSkills];
        parametersById = new Map(
          recommendations.map(recommendation => [recommendation.id, recommendation])
        );
      } else {
        const products = training.products || [];
        const roles = training.roles || [];
        recommendations = [...products, ...roles];
        parametersById = new Map(
          recommendations.map(recommendation => [recommendation.id, recommendation])
        );
      }
      if (account.recommendationAccountType === CPENEW && !account.prlCriteria.enabled) {
        widget?.attributes?.recommendationConfig?.skills?.forEach((skill: { id: any }) => {
          if (parametersById.has(skill.id)) {
            parametersList.add(skill.id);
          }
        });
      } else {
        widget?.attributes?.recommendationConfig?.products?.forEach((product: { id: any }) => {
          if (parametersById.has(product.id)) {
            parametersList.add(product.id);
          }
        });
        widget?.attributes?.recommendationConfig?.roles?.forEach((role: { id: any }) => {
          if (parametersById.has(role.id)) {
            parametersList.add(role.id);
          }
        });
        recommendations.forEach(recommendation => {
          if (!parametersList.has(recommendation.id)) {
            parametersList.add(recommendation.id);
          }
        });
      }

      setRecommendationList(parametersList);
      setRecommendationListById(parametersById);
    }
  }, [account]);

  useEffect(() => {
    if (isExtensionAllowed(training, getActiveInstance(training))) {
      const extension = getExtension(
        account.extensions,
        training.extensionOverrides,
        InvocationType.LEARNER_ENROLL
      );
      setIsEnrollExtensionPresent(!!extension);
    }
  }, [account, training, enrollment]);

  useEffect(() => {
    document.addEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
    return () => {
      document.removeEventListener(PrimeEvent.PLAYER_CLOSE, handlePlayerClose);
    };
  }, []);
  useEffect(() => {
    if (!showExtraActions) {
      return;
    }
    const handleKeyDownOutside = (event: MouseEvent) => {
      if (
        extraActionsContainerRef.current &&
        !extraActionsContainerRef.current.contains(event.target as Node)
      ) {
        console.log("Key pressed outside the container");
        setExtraActions(false);
      }
    };

    document.addEventListener("mousedown", handleKeyDownOutside);

    return () => {
      console.log("removing event");
      document.removeEventListener("mousedown", handleKeyDownOutside);
    };
  }, [extraActionsContainerRef?.current, showExtraActions]);
  const getEffectivenessIndexTemplate = () => {
    const effectivenessIndex = training.effectivenessIndex;
    if (!effectivenessIndex || effectivenessIndex === 0) {
      return null;
    }
    const label = GetTranslationsReplaced(
      `alm.title.effectiveness.rated.${training.loType}`,
      {
        loName: name,
        effectiveness: effectivenessIndex,
      },
      true
    );
    const effectivenessLabel = GetTranslationReplaced(
      "alm.lo.effectiveness",
      effectivenessIndex.toString(),
      true
    );
    return (
      <div
        className={styles.ratingsContainer}
        onClick={toggleEffectivenessDialog}
        aria-label={label}
        title={label}
      >
        <span className={`${styles.rating} ${styles.effectiveness}`}>{effectivenessLabel}</span>
      </div>
    );
  };

  const getRecoReasonTemplate = () => {
    if (
      widget?.type === WidgetTypeNew.CATALOG ||
      widget?.type === WidgetTypeNew.SEARCH ||
      widget?.type === WidgetTypeNew.BOOKMARKS
    ) {
      return "";
    }
    const getRecoReasonTemplate = () => {
      return (
        <div className={styles.recoContainer}>
          <span className={styles.recoReason}>{ReplaceAccountTerminology(recoReason[0])}</span>
        </div>
      );
    };

    if (widget?.type === WidgetTypeNew.ADMIN_RECO) {
      if (recoReasonModel && enableAnnouncementRecoUGWLink) {
        const topRecommendation = recoReasonModel[0];
        const modelId = topRecommendation.modelId;
        const groupName = topRecommendation.modelValues.group_name;
        const label = topRecommendation.template.replace(new RegExp("{{group_name}}"), "");
        return (
          <div className={styles.recoContainer}>
            <span className={styles.recoReason}>
              {label}
              <a
                className={styles.recoReasonGroupLink}
                href="javascript:void(0)"
                title={groupName}
                onClick={() => {
                  getALMObject().navigateToCatalogPage({
                    selectedGroups: modelId,
                  });
                }}
              >
                {groupName}
              </a>
            </span>
          </div>
        );
      } else if (recoReason && !enableAnnouncementRecoUGWLink) {
        return getRecoReasonTemplate();
      } else {
        return null;
      }
    }
    return recoReason ? getRecoReasonTemplate() : "";
  };

  const getSkillsOrPRLElement = (
    icon: JSX.Element,
    id: string,
    value: string,
    ariaLabel?: string
  ) => {
    return (
      <>
        {icon}
        <span
          className={styles.skillName}
          id={id}
          data-automationid={id}
          {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
        >
          {value}
        </span>
      </>
    );
  };
  const getSkillsOrPRLContainer = () => {
    if (showSkills) {
      const skill = skillNames ? splitStringIntoArray(skillNames)[0] : "";
      const skillLabel = `${GetTranslation("alm.catalog.filter.skills.label", true)}: ${skill}`;
      if (skill) {
        return getSkillsOrPRLElement(SKILL_SVG(), `primelxp-skill-${skill}`, skill, skillLabel);
      }
    }
    if (showPRLInfo && checkIfRecoOrCPENEWDiscoveryStrip(widget!, account)) {
      const [firstParameterId] = recommendationList;
      const { recommendationAccountType, prlCriteria } = account;
      if (recommendationAccountType === CPENEW && !prlCriteria.enabled) {
        let skill = skillNames ? splitStringIntoArray(skillNames)[0] : "";
        if (widget?.type === WidgetTypeNew.DISCOVERY_RECO) {
          skill = recommendationListById.get(firstParameterId)?.name;
        } else if (widget?.attributes?.recommendationConfig?.skills?.length) {
          skill = widget.attributes.recommendationConfig.skills[0].name;
          //if skill name present in the skills, then show else show from the skills
          if (skillNames?.includes(skill)) {
            skill = skillNames ? splitStringIntoArray(skillNames)[0] : "";
          }
        }

        return getSkillsOrPRLElement(SKILL_SVG(), `primelxp-skill-${skill}`, skill);
      }
      if (recommendationList.size === 0) {
        return "";
      }
      const skill = recommendationListById.get(firstParameterId)?.name;
      return getSkillsOrPRLElement(HEART_IN_CIRCLE(), `primelxp-skill-${skill}`, skill);
    }
    return null;
  };
  const getMatchingParametersTemplate = useCallback(() => {
    if (checkIfRecoOrCPENEWDiscoveryStrip(widget!, account)) {
      const { recommendationAccountType, prlCriteria } = account;
      //if there is norecommendation and prl is enabled
      if (recommendationList.size === 0 && prlCriteria.enabled) {
        return null;
      }
      if (recommendationAccountType === CPENEW && !prlCriteria.enabled) {
        return (
          <>
            <h4 className={styles.matchingParamsHeader}>
              {GetTranslation("text.matchingParameters")}
            </h4>
            <p className={styles.matchingParams}>{skillNames}</p>
          </>
        );
      }
      const formatedParameterList: string[] = [];
      recommendationList.forEach(id => {
        const parameter: PrimeRecommendations | undefined = recommendationListById.get(id);
        const level = parameter?.levels?.[0];
        if (level) {
          return formatedParameterList.push(
            `${parameter?.name} (${GetTranslation(LEVELS_NAME_MAP[level])})`
          );
        }
        return formatedParameterList.push(`${parameter?.name}`);
      });
      return (
        <>
          <h4 className={styles.matchingParamsHeader}>
            {GetTranslation("text.matchingParameters")}
          </h4>
          <p className={styles.matchingParams}>{formatedParameterList.join(", ")}</p>
        </>
      );
    }
    return null;
  }, [recommendationList.size, account]);
  const getLoadingIconTemplate = (className = "") => {
    return (
      <span
        id="loader"
        data-automationid={`${name}-loader`}
        className={`${styles.loader} ${className}`}
      ></span>
    );
  };

  const getEnrolledIconTemplate = () => {
    return (
      <span
        id="enrolled"
        data-automationid={`${name}-enrolled`}
        className={`${styles.actionIcon} ${showEnrolledButton ? styles.enrolled : ""}`}
      >
        {ADDED_TICK_SVG("white")}
      </span>
    );
  };
  const getErrorIconTemplate = (message: string) => {
    return (
      <span
        id="errorIcon"
        data-automationid={`${name}-errorIcon`}
        className={`${styles.actionIcon} ${styles.errorIcon}`}
        title={message}
        aria-label={message}
      >
        {ERROR_ICON_SVG()}
      </span>
    );
  };

  const checkConflictingSessions = async () => {
    const activeInstance = getActiveInstance(training);
    const conflictingSessions = await getConflictingSessions(training.id, activeInstance?.id!);
    if (!conflictingSessions || conflictingSessions.length === 0) {
      handleEnroll(activeInstance);
      return;
    }

    SessionConflictDialog({
      conflictingSessionsList: conflictingSessions,
      locale: locale,
      handleEnrollment: handleEnroll,
      confirmationDialog: almConfirmationAlert,
      delay: 0,
    });
  };
  const getJobAidDetails = (
    actionToPerform: () => void,
    titleForIcon: string,
    IconToDisplay: JSX.Element
  ) => {
    return (
      <a href="javascript:void(0)" role="button" onClick={actionToPerform}>
        <div
          className={`${styles.actionIcon} ${classForAddOrRemoveFromList}`}
          title={GetTranslation(titleForIcon)}
        >
          {IconToDisplay}
        </div>
      </a>
    );
  };
  const jobAidIconTemplate = () => {
    return isEnrolled
      ? getJobAidDetails(unenroll, "alm.overview.job.aid.remove.from.list", JOBAID_CARD_REMOVE())
      : getJobAidDetails(
          handleJobAidEnroll,
          "alm.overview.job.aid.add.from.list",
          ADD_BUTTON_SVG()
        );
  };
  const getIconTemplate = () => {
    const hasSingleInstance = hasSingleActiveInstance(training);
    if (
      !hasSingleInstance ||
      (hasSingleInstance && getActiveInstance(training)?.isFlexible) ||
      canShowPrice(training, account)
    ) {
      return false;
    }
    if (actionText === "" && showActionButton) {
      return null;
    }
    if (showEnrolledButton) {
      return getEnrolledIconTemplate();
    }
    if (loadingType === LOADING_TYPE.enroll) {
      return getLoadingIconTemplate();
    }
    if (enrollErrorMssage) {
      return getErrorIconTemplate(enrollErrorMssage);
    }
    return (
      <button
        id="enroll"
        data-automationid={`${name}-enroll`}
        title={GetTranslation("locard.enroll", true)}
        className={`${styles.actionIcon} ${classForAddOrRemoveFromList}`}
        onClick={checkConflictingSessions}
        disabled={showExtraActions}
      >
        {ADD_BUTTON_SVG()}
      </button>
    );
  };

  const addBookmarkHandler = async (isUndo: boolean) => {
    if (isUndo && unsaveUndoTimeout) {
      clearTimeout(unsaveUndoTimeout);
    }
    const loId = training.id;
    setLoadingType(LOADING_TYPE.saveUnsave);
    try {
      handleAddBookmark && (await handleAddBookmark(loId));
      if (isUndo) {
        setUndoContainerType("");
      } else {
        training.isBookmarked = true;
      }
    } catch {
      const translationKey = isUndo ? "alm.failed.to.undo.bookmark" : "alm.failed.to.bookmark";
      showToast(GetTranslation(translationKey, true));
    } finally {
      setUnsaveUndoTimeout(null);
      setLoadingType("");
    }
  };
  const removeBookmarkHandler = async () => {
    const loId = training.id;
    try {
      setLoadingType(LOADING_TYPE.saveUnsave);
      handleRemoveBookmark && (await handleRemoveBookmark(loId));
      setUndoContainerType(UNDO_ACTIONS.unSaved);
      let timeout = setTimeout(() => {
        if (widget?.type === WidgetTypeNew.BOOKMARKS) {
          removeItemFromList && removeItemFromList(training.id);
          showToast(GetTranslation("savedcourse.removed", true));
        } else {
          setUndoContainerType("");
        }
      }, 3000);
      setUnsaveUndoTimeout(timeout);
    } catch {
      showToast(GetTranslation("savedcourse.remove.failed", true));
    }
    setLoadingType("");
  };

  const blockLORecommendationHandler = async () => {
    try {
      handleBlockLORecommendation && (await handleBlockLORecommendation(training.id));
      setUndoContainerType(UNDO_ACTIONS.dontRecommend);
    } catch {
      showToast(GetTranslation("alm.please.try.again"));
    }
  };
  const unblockLORecommendationHandler = async () => {
    try {
      handleUnblockLORecommendation && (await handleUnblockLORecommendation(training.id));
      setUndoContainerType("");
    } catch {
      showToast(GetTranslation("alm.please.try.again"));
    }
  };

  const handleEnroll = async (instance?: PrimeLearningObjectInstance) => {
    const instanceId = instance?.id || getActiveInstance(training)?.id;
    if (handleLoEnrollment) {
      try {
        setLoadingType(LOADING_TYPE.enroll);
        await handleLoEnrollment(training.id, instanceId);
        setShowEnrolledButton(true);
      } catch (reason: any) {
        setEnrollErrorMssage(reason.message);
      }
      setLoadingType("");
    }
  };
  const handleJobAidEnroll = async () => {
    if (!isEnrolled) {
      try {
        await enroll();
        almAlert(true, GetTranslation("alm.jobaid.added", true), AlertType.success);
      } catch (error) {
        almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
      }
    }
  };
  const jobAidActionHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    //If not enrolled, then enroll and open JobAid
    try {
      await handleJobAidEnroll();
      const resourceLocation = (await fetchJobAidResource(training)) || "";
      openJobAid(training, resourceLocation);
      return;
    } catch (error) {
      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  };
  const handleClickForJobAidDownload = async () => {
    //If not enrolled, then enroll and download
    try {
      await handleJobAidEnroll();
      if (jobAidDownloadUrl) {
        downloadFile(jobAidDownloadUrl);
      }
    } catch (error) {
      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  };
  const actionClickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const alm = getALMObject();
    const activeInstances = getActiveInstances(training);
    if (!alm.isPrimeUserLoggedIn()) {
      handleRedirectionForNonLoggedIn(training, activeInstances);
      return;
    }
    if (canStart(training, isEnrollExtensionPresent, account)) {
      try {
        //if Already enrolled, then Launch Player directly, else Enroll and launch player
        if (!enrollment) {
          await checkConflictingSessions();
        }
        handlePlayerLaunch && handlePlayerLaunch(training);
      } catch (error) {}
    } else {
      clearBreadcrumbPathDetails(training.id);
      handleRedirectionForLoggedIn(training, activeInstances);
    }
  };

  const handlePlayerClose = async (event: any) => {
    const trainingId = event?.detail?.loId;
    if (!trainingId || trainingId !== training.id) {
      return;
    }
    const response = updateLearningObject && (await updateLearningObject(trainingId));
    const actionButton = document.getElementById(actionButtonId);
    actionButton?.focus();
    if (HUNDERED_PERCENT !== response?.enrollment?.progressPercent) {
      return;
    } else {
      handleL1FeedbackLaunch(
        response?.id,
        response?.enrollment?.loInstance.id,
        GetPrimeObj()._playerLaunchTimeStamp
      );
    }
  };

  const cardClickHandler = async (event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (widget?.attributes?.disableLinks) {
      return;
    }

    const alm = getALMObject();
    clearBreadcrumbPathDetails(training.id);
    const activeInstances = getActiveInstances(training);
    if (!alm.isPrimeUserLoggedIn()) {
      handleRedirectionForNonLoggedIn(training, activeInstances);
      return;
    }

    let resourceLocation = "";
    if (training.loType === JOBAID) {
      !enrollment && (await handleEnroll());
      resourceLocation = (await fetchJobAidResource(training)) || "";
      openJobAid(training, resourceLocation);
      return;
    }

    handleRedirectionForLoggedIn(training, activeInstances);
  };

  const authorName = useMemo(() => {
    return getAuthorName(training);
  }, []);

  const toggleEffectivenessDialog = () => {
    setShowEffectivenessDialog(value => !value);
  };

  const toggleExtraActions = () => {
    setExtraActions(value => !value);
  };

  const saveLabel = useMemo(() => GetTranslation("text.save"), []);
  const unSaveLabel = useMemo(() => GetTranslation("text.unsave"), []);
  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`alm.training.${type}`, true) : "";
  }, [type]);
  const progressBarClass = showProgressBar && !isJobAid ? styles.enrolled : "";
  const duration = training.duration ? convertSecondsToHourAndMinsText(training.duration) : null;
  return (
    <>
      <div className={`${styles.card} ${showExtraActions ? styles.extraActionsOpened : ""}`}>
        <div
          className={`${styles.upper} ${undoContainerType ? styles.hidden : ""}`}
          aria-hidden={undoContainerType ? true : false}
        >
          <div className={styles.imageContainer} style={{ ...cardBgStyle }}>
            {formatLabel && <div className={styles.loFormat}>{formatLabel}</div>}
            {showPrice && (
              <div className={`${styles.loFormat} ${formatLabel ? styles.price : ""}`}>
                {getFormattedPrice(training.price)}
              </div>
            )}
            {duration ? (
              <div
                className={`${styles.duration} ${progressBarClass}`}
                data-automationid={`${name}-duration`}
                aria-label={`${GetTranslation("alm.catalog.filter.duration.label")}: ${duration}`}
              >
                {duration}
              </div>
            ) : null}

            {!isJobAid && showProgressBar && (
              <ProgressBar
                showValueLabel={false}
                value={enrollment.progressPercent}
                UNSAFE_className={styles.progressBar}
                data-automationid={`${name}-progressBar`}
              />
            )}
          </div>
          <a className={styles.imageFlipContainer} role="anchor" onClick={cardClickHandler}>
            {/* Matching Parameters starts */}
            {showPRLInfo && getMatchingParametersTemplate()}
            {/* Matching Parameters ends */}

            {/* Description Starts */}
            <p
              className={`${styles.description} ${showPRLInfo ? styles.descriptionWithParams : ""}`}
            >
              {/* ${styles.descriptionWithParam */}
              {description || overview}
            </p>
            {/* Description Ends */}

            {/* Due/Published Date Starts */}
            {dueDateorPublishedDate.translationKey && (
              <p
                className={styles.dateText}
                id={dueDateorPublishedDate.id}
                data-automationid={`${name}-${dueDateorPublishedDate.id}`}
              >
                {formatMessage({ id: dueDateorPublishedDate.translationKey })}
                <span>{dueDateorPublishedDate.value}</span>
              </p>
            )}
            {/* Due/Published Date Ends */}
          </a>
        </div>
        <div
          className={`${styles.lower} ${undoContainerType ? styles.hidden : ""}`}
          aria-hidden={undoContainerType ? true : false}
        >
          {/* SKILLS Row starts */}
          <div className={styles.skillsContainer}>
            <div className={styles.skills}>{getSkillsOrPRLContainer()}</div>
            {showRating && ratingTemplate}
            {showEffectivenessIndex && getEffectivenessIndexTemplate()}
          </div>
          {/* SKILLS Row ENDS */}

          {/* Title Row Starts */}
          <div className={styles.titleContainer}>
            <a
              tabIndex={widget?.attributes?.disableLinks || showExtraActions ? -1 : 0}
              id="title"
              href="javascript:void(0)"
              className={styles.title}
              data-automationid={`${name}-title`}
              onClick={cardClickHandler}
              aria-label={`${trainingTypeLabel}, ${name}`}
            >
              {name}
            </a>
            {isJobAid && jobAidIconTemplate()}
            {!isJobAid && !enrollment && getIconTemplate()}
            {showBookmark && (
              <div className={styles.saveUnsaveContainer}>
                {loadingType === LOADING_TYPE.saveUnsave &&
                  getLoadingIconTemplate(styles.smallLoader)}
                {training.isBookmarked ? (
                  <button
                    className={`${styles.buttonTransparent} ${
                      loadingType === LOADING_TYPE.saveUnsave ? styles.hidden : ""
                    }`}
                    onClick={removeBookmarkHandler}
                    data-automationid={`${name}-unsave`}
                    aria-label={unSaveLabel}
                    title={unSaveLabel}
                    disabled={showExtraActions}
                  >
                    {BOOKMARKED_ICON()}
                  </button>
                ) : (
                  <button
                    className={`${styles.buttonTransparent} ${
                      loadingType === LOADING_TYPE.saveUnsave ? styles.hidden : ""
                    }`}
                    onClick={() => addBookmarkHandler(false)}
                    data-automationid={`${name}-save`}
                    aria-label={saveLabel}
                    title={saveLabel}
                    disabled={showExtraActions}
                  >
                    {BOOKMARK_ICON()}
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Title Row Ends */}
          {/* Author Row Starts */}
          {!isJobAid && showAuthorInfo && authorName && (
            <div className={styles.authorContainer}>
              <span
                className={styles.authorName}
                data-automationid={`primelxp-authorName-${authorName}`}
              >
                {formatMessage(
                  {
                    id: "alm.card.by.author",
                  },
                  { 0: authorName }
                )}
              </span>
            </div>
          )}
          {/* Author Row Ends */}
          {/* Recommend reason row starts */}
          {showRecommendedReason && getRecoReasonTemplate()}
          {/* Recommend reason row ends */}
          {/* Action Button starts */}
          <div className={`${styles.actionContainer} ${styles.justifyContentEnd}`}>
            {!isJobAid && actionText && (
              <button
                className={styles.actionButton}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => actionClickHandler(event)}
                data-automationid={
                  widget?.type === WidgetTypeNew.MYLEARNING
                    ? `${name}-${CONTINUE}`
                    : `${name}-${VIEW}`
                }
                id={actionButtonId}
                aria-label={`${actionText} ${trainingTypeLabel} ${name}`}
                disabled={showExtraActions}
              >
                {actionText}
              </button>
            )}
            {isJobAid && (
              <button
                className={styles.actionButton}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => jobAidActionHandler(event)}
                data-automationid={`jobAid- ${name}`}
                id={actionButtonId}
                disabled={showExtraActions}
              >
                {GetTranslation("alm.jobAid.view.button")}
              </button>
            )}
            {(showDownloadButtonForJobAid || showDontRecommend) && (
              <button
                className={styles.showExtraOptions}
                onClick={toggleExtraActions}
                data-automationid={`${name}-extraOptions`}
                disabled={showExtraActions}
              >
                {<MoreVertical />}
              </button>
            )}
          </div>

          {/* Action Button ends */}
          {/* Extra Action starts */}

          {showExtraActions && (
            <div className={styles.extraActionsDummyContainer}>
              <div className={styles.blurContainer}></div>
              <div className={styles.extraActionsContainer} ref={extraActionsContainerRef}>
                {showDontRecommend && (
                  <button
                    onClick={blockLORecommendationHandler}
                    data-automationid={`${name}-dontRecommend`}
                    className={styles.extraActions}
                  >
                    {JOBAID_ICON_REMOVE("--prime-color-link")}
                    <span className={styles.extraActionsText}>
                      {GetTranslation("text.dontRecommendThis")}
                    </span>
                  </button>
                )}
                {showDownloadButtonForJobAid && (
                  <button
                    title={downloadLabel}
                    onClick={handleClickForJobAidDownload}
                    className={styles.extraActions}
                  >
                    {DOWNLOAD_ICON_ROUNDED()}
                    <span className={styles.extraActionsText}>
                      {GetTranslation("alm.text.download")}
                    </span>
                  </button>
                )}
              </div>
              <button
                className={styles.showExtraOptions}
                onClick={toggleExtraActions}
                data-automationid={`${name}-extraOptions`}
              >
                {<MoreVertical />}
              </button>
            </div>
          )}
          {/* Extra Action ends */}
        </div>
        {/* Undo section starts */}
        <div className={`${styles.undoContainer} ${undoContainerType ? styles.show : ""}`}>
          <div className={styles.upperUndoContainer}>
            <h2>"{name}"</h2>
            <span>
              {formatMessage({
                id: undoContainerType === UNDO_ACTIONS.unSaved ? "text.unsaved" : "text.removed",
              })}
            </span>
          </div>
          <div className={styles.lowerUndoContainer}>
            <p>
              {formatMessage({
                id:
                  undoContainerType === UNDO_ACTIONS.unSaved
                    ? "text.unsaveByMistake"
                    : "text.removedByMistake",
              })}
              <a
                className={styles.undo}
                tabIndex={0}
                onClick={() => {
                  undoContainerType === UNDO_ACTIONS.dontRecommend
                    ? unblockLORecommendationHandler()
                    : addBookmarkHandler(true);
                }}
              >
                {formatMessage({ id: "action.undo" })}
              </a>
            </p>
          </div>
        </div>
        {/* Undo section ends */}
      </div>
      {showEffectivenessDialog && (
        <ALMEffectivenessDialog training={training} onClose={toggleEffectivenessDialog} />
      )}
    </>
  );
};

export default PrimeTrainingCardV2;
