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
import { ProgressBar } from '@adobe/react-spectrum';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTrainingCard } from '../../../hooks/catalog/useTrainingCard';

import MoreVertical from '@spectrum-icons/workflow/MoreVertical';
import { AlertType } from '../../../common/Alert/AlertDialog';
import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeRecommendations,
  PrimeUser,
  PrimeTemplateConfig,
} from '../../../models/PrimeModels';
import { convertSecondsToHourAndMinsText, modifyTimeDDMMYY } from '../../../utils/dateTime';
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
  STANDARD_COMPLETION_ICON,
  ALTERNATE_COMPLETION_ICON,
  DOT_SEPERATOR_ICON,
  VIRTUAL_COACH_JOB_AID_ICON,
} from '../../../utils/inline_svg';
import {
  formatMap,
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  ReplaceAccountTerminology,
} from '../../../utils/translationService';
import styles from './PrimeTrainingCardV2.module.css';
import { PrimeEvent, Widget, WidgetType, WidgetTypeNew } from '../../../utils/widgets/common';
import {
  CONTINUE,
  CPENEW,
  JOBAID,
  LEARNING_PROGRAM,
  PERSONALIZED_PATH,
  OTHER,
  VIEW,
  HUNDERED_PERCENT,
  JAVASCRIPT_VOID_0,
  COMPLETED,
  AI_COACH,
  ENGLISH_LOCALE,
} from '../../../utils/constants';
import { InvocationType, getExtension } from '../../../utils/native-extensibility';
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
} from './PrimeTrainingCardV2.helper';
import { getALMObject, getWidgetConfig, isAccAltCompletionEnabled } from '../../../utils/global';
import {
  fetchJobAidResource,
  getTrainingLink,
  getTrainingTypeLabel,
} from '../../../utils/lo-utils';
import { ALMEffectivenessDialog } from '../../Common/ALMEffectivenessDialog';
import { GetPrimeObj } from '../../../utils/widgets/windowWrapper';
import { getFormattedPrice } from '../../../utils/price';
import { getConflictingSessions, useRatingsTemplate } from '../../../utils/hooks';
import SessionConflictDialog from '../../SessionConflict/SessionConflictDialog';
import { useConfirmationAlert } from '../../../common/Alert/useConfirmationAlert';
import { getActiveInstances, splitStringIntoArray } from '../../../utils/catalog';

import { useJobAids } from '../../../hooks/useJobAids';
import { useAlert } from '../../../common/Alert/useAlert';
import { downloadFile } from '../../../utils/widgets/utils';
import { clearBreadcrumbPathDetails } from '../../../utils/breadcrumbUtils';

const UNDO_ACTIONS = {
  unSaved: 'unSaved',
  dontRecommend: 'dontRecommend',
};

const LOADING_TYPE = {
  saveUnsave: 'saveUnsave',
  enroll: 'enroll',
};

const LEVELS_NAME_MAP: Record<string, string> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

const FORMAT_ICON_MAP: Record<string, JSX.Element | null> = {
  [AI_COACH]: VIRTUAL_COACH_JOB_AID_ICON(),
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
  disableLinks?: boolean;
  isAuthorPage?: boolean;
  showAddToMyLearning?: boolean;
  showSaveAction?: boolean;
}> = ({
  widget,
  training,
  account,
  user,
  showProgressBar,
  showDontRecommend,
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
  disableLinks = false,
  isAuthorPage = false,
  showAddToMyLearning = true,
  showSaveAction: showSaveActionProp,
}) => {
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;
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
  const [undoContainerType, setUndoContainerType] = useState('');
  const [recommendationList, setRecommendationList] = useState(new Set());
  const [recommendationListById, setRecommendationListById] = useState(new Map());
  const [isEnrollExtensionPresent, setIsEnrollExtensionPresent] = useState(false);
  const [unsaveUndoTimeout, setUnsaveUndoTimeout] = useState({} as any);
  const [loadingType, setLoadingType] = useState('');
  const [showEnrolledButton, setShowEnrolledButton] = useState(false);
  const [enrollErrorMssage, setEnrollErrorMssage] = useState('');

  const [showEffectivenessDialog, setShowEffectivenessDialog] = useState<boolean>(false);
  const [showExtraActions, setExtraActions] = useState<boolean>(false);
  const extraActionsContainerRef = useRef<HTMLDivElement>(null);
  const { formatMessage, locale } = useIntl();
  const downloadLabel = GetTranslation('alm.text.download');
  const ratingTemplate = useRatingsTemplate(styles, formatMessage, training);
  const isJobAid = training.loType === JOBAID;
  const classForAddOrRemoveFromList = loadingType === LOADING_TYPE.enroll ? styles.hidden : '';
  const actionButtonId = `actionButton-${name}-${widget?.type || ''}`;
  const isRatingEffectivenessEnabled = showRating || showEffectivenessIndex;
  const templateConfig = JSON.parse(account?.templatesConfig || '{}') as PrimeTemplateConfig;

  const {
    showSkillsInfo = true,
    showRatingInfo = true,
    showFormatInfo = true,
    showDurationInfo = true,
    showEnrollAction = true,
    showAddToMyLearningAction = true,
    showPublishedDueDateInfo = true,
    showDescriptionInfo = true,
    showAuthorNameInfo = true,
    showSaveAction: showSaveActionConfig = true,
    showCompletionStatusInfo = true,
  } = templateConfig?.loCardConfig || {};
  const showSaveAction = showSaveActionProp ?? showSaveActionConfig;

  const formatLabel = useMemo(() => {
    if (widget?.type === WidgetTypeNew.PERSONALIZED_PATH_STRIP) {
      return '';
    }
    if (format) {
      return GetTranslation(`${formatMap[format]}`, true) || '';
    }
    return '';
  }, [format, widget?.type]);
  const formatIcon = useMemo(() => {
    return format ? FORMAT_ICON_MAP[format] : null;
  }, [format]);
  const isTrainingDownloadable = training.downloadable;
  const dueDateorPublishedDate = useMemo(() => {
    let translationKey = 'alm.card.published.date';
    const useUpdatedDate =
      training?.loType === LEARNING_PROGRAM || training?.loType === PERSONALIZED_PATH;
    let dateText = useUpdatedDate
      ? training?.dateUpdated || training?.datePublished
      : training?.datePublished || training?.dateUpdated;
    if (!dateText && (training as any)?.dateCreated) {
      dateText = (training as any).dateCreated;
    }
    let id = 'primelxp-datePublished';

    if (enrollment) {
      const { completionDeadline, loInstance } = enrollment;
      const primeLoInstance = loInstance as PrimeLearningObjectInstance;
      const completionDeadlineText = completionDeadline || primeLoInstance?.completionDeadline;
      if (completionDeadlineText) {
        dateText = completionDeadlineText;
        translationKey = 'alm.card.due.date';
        id = 'primelxp-dateDue';
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
      return '';
    }
    if (widget?.type === WidgetTypeNew.PERSONALIZED_PATH_STRIP) {
      return GetTranslation('lo.strip.view');
    }
    if (isEnrollExtensionPresent && !enrollment) {
      return getActionTextForDisabledLinks(widget!);
    }
    if (isLinkedinLO(training) && getWidgetConfig()?.isLoadedInsideApp) {
      return getActionTextForDisabledLinks(widget!);
    }
    return enrollment
      ? enrollment.state === COMPLETED
        ? GetTranslation('text.revisit')
        : canStart(training, isEnrollExtensionPresent, account)
          ? GetTranslation('text.continue')
          : getActionTextForDisabledLinks(widget!)
      : canStart(training, isEnrollExtensionPresent, account)
        ? GetTranslation('text.start')
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
        console.log('Key pressed outside the container');
        setExtraActions(false);
      }
    };

    document.addEventListener('mousedown', handleKeyDownOutside);

    return () => {
      console.log('removing event');
      document.removeEventListener('mousedown', handleKeyDownOutside);
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
      'alm.lo.effectiveness',
      effectivenessIndex.toString(),
      true
    );
    return (
      <div
        className={styles.ratingsContainer}
        onClick={disableLinks ? () => {} : toggleEffectivenessDialog}
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
      return '';
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
        const label = topRecommendation.template.replace(new RegExp('{{group_name}}'), '');
        return (
          <div className={styles.recoContainer}>
            <span className={styles.recoReason}>
              {label}
              <a
                className={styles.recoReasonGroupLink}
                href="javascript:void(0)"
                title={groupName}
                onClick={() => {
                  disableLinks
                    ? () => {}
                    : getALMObject().navigateToCatalogPage({
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
        return <div className={styles.recoContainer}></div>;
      }
    }
    return recoReason ? getRecoReasonTemplate() : '';
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
          title={value}
          {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        >
          {value}
        </span>
      </>
    );
  };
  const getSkillsOrPRLContainer = () => {
    if (showSkills) {
      const skill = skillNames ? splitStringIntoArray(skillNames)[0] : '';
      const skillLabel = `${GetTranslation('alm.catalog.filter.skills.label', true)}: ${skill}`;
      if (skill) {
        return getSkillsOrPRLElement(SKILL_SVG(), `primelxp-skill-${skill}`, skill, skillLabel);
      }
    }
    if (showPRLInfo && checkIfRecoOrCPENEWDiscoveryStrip(widget!, account)) {
      const [firstParameterId] = recommendationList;
      const { recommendationAccountType, prlCriteria } = account;
      if (recommendationAccountType === CPENEW && !prlCriteria.enabled) {
        let skill = skillNames ? splitStringIntoArray(skillNames)[0] : '';
        if (
          widget?.type === WidgetTypeNew.DISCOVERY_RECO ||
          widget?.type === WidgetTypeNew.RECOMMENDATIONS_STRIP
        ) {
          skill = recommendationListById.get(firstParameterId)?.name;
        } else if (widget?.attributes?.recommendationConfig?.skills?.length) {
          skill = widget.attributes.recommendationConfig.skills[0].name;
          //if skill name present in the skills, then show else show from the skills
          if (skillNames?.includes(skill)) {
            skill = skillNames ? splitStringIntoArray(skillNames)[0] : '';
          }
        }

        return getSkillsOrPRLElement(SKILL_SVG(), `primelxp-skill-${skill}`, skill);
      }
      if (recommendationList.size === 0) {
        return '';
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
              {GetTranslation('text.matchingParameters')}
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
            {GetTranslation('text.matchingParameters')}
          </h4>
          <p className={styles.matchingParams}>{formatedParameterList.join(', ')}</p>
        </>
      );
    }
    return null;
  }, [recommendationList.size, account]);
  const getLoadingIconTemplate = (className = '') => {
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
        className={`${styles.actionIcon} ${showEnrolledButton ? styles.enrolled : ''}`}
      >
        {ADDED_TICK_SVG('white')}
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

  const handleClickWithDisableCheck = (handler: any) => {
    return (event: React.MouseEvent) => {
      if (disableLinks) {
        return;
      }
      handler(event);
    };
  };

  const getJobAidDetails = (
    actionToPerform: () => void,
    titleForIcon: string,
    IconToDisplay: JSX.Element
  ) => {
    return (
      <a
        href="javascript:void(0)"
        role="button"
        onClick={handleClickWithDisableCheck(actionToPerform)}
      >
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
      ? getJobAidDetails(unenroll, 'alm.overview.job.aid.remove.from.list', JOBAID_CARD_REMOVE())
      : getJobAidDetails(
          handleJobAidEnroll,
          'alm.overview.job.aid.add.from.list',
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
    if (actionText === '' && showActionButton) {
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
        title={GetTranslation('locard.enroll', true)}
        className={`${styles.actionIcon} ${classForAddOrRemoveFromList}`}
        onClick={handleClickWithDisableCheck(checkConflictingSessions)}
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
        setUndoContainerType('');
      } else {
        training.isBookmarked = true;
      }
    } catch {
      const translationKey = isUndo ? 'alm.failed.to.undo.bookmark' : 'alm.failed.to.bookmark';
      showToast(GetTranslation(translationKey, true));
    } finally {
      setUnsaveUndoTimeout(null);
      setLoadingType('');
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
          showToast(GetTranslation('savedcourse.removed', true));
        } else {
          setUndoContainerType('');
        }
      }, 3000);
      setUnsaveUndoTimeout(timeout);
    } catch {
      showToast(GetTranslation('savedcourse.remove.failed', true));
    }
    setLoadingType('');
  };

  const blockLORecommendationHandler = async () => {
    try {
      handleBlockLORecommendation && (await handleBlockLORecommendation(training.id));
      setUndoContainerType(UNDO_ACTIONS.dontRecommend);
    } catch {
      showToast(GetTranslation('alm.please.try.again'));
    }
  };
  const unblockLORecommendationHandler = async () => {
    try {
      handleUnblockLORecommendation && (await handleUnblockLORecommendation(training.id));
      setUndoContainerType('');
    } catch {
      showToast(GetTranslation('alm.please.try.again'));
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
      setLoadingType('');
    }
  };
  const handleJobAidEnroll = async () => {
    if (!isEnrolled) {
      try {
        await enroll();
        almAlert(true, GetTranslation('alm.jobaid.added', true), AlertType.success);
      } catch (error) {
        almAlert(true, GetTranslation('alm.enrollment.error'), AlertType.error);
      }
    }
  };
  const jobAidActionHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    //If not enrolled, then enroll and open JobAid
    try {
      if (!getALMObject().isPrimeUserLoggedIn()) {
        handleRedirectionForNonLoggedIn(training, training.instances);
        return;
      }
      await handleJobAidEnroll();
      const resourceLocation = (await fetchJobAidResource(training, false, contentLocale)) || '';
      openJobAid(training, resourceLocation);
      return;
    } catch (error) {
      almAlert(true, GetTranslation('alm.enrollment.error'), AlertType.error);
    }
  };
  const handleClickForJobAidDownload = async () => {
    //If not enrolled, then enroll and download
    try {
      await handleJobAidEnroll();
      const resourceLocation = await fetchJobAidResource(training, true, contentLocale);
      downloadFile(resourceLocation);
    } catch (error) {
      almAlert(true, GetTranslation('alm.enrollment.error'), AlertType.error);
    }
  };
  const actionClickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (widget?.type === WidgetTypeNew.PERSONALIZED_PATH_STRIP) {
      getALMObject().navigateToTrainingOverviewPage(training.id);
      return;
    }
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

    let resourceLocation = '';
    if (training.loType === JOBAID) {
      !enrollment && (await handleJobAidEnroll());
      resourceLocation = (await fetchJobAidResource(training, false, contentLocale)) || '';
      openJobAid(training, resourceLocation);
      return;
    }

    handleRedirectionForLoggedIn(training, activeInstances);
  };

  const authorName = useMemo(() => {
    return getAuthorName(training);
  }, []);

  const completionStatus = useMemo(() => {
    const isStandardCompleted = training.enrollment?.state === COMPLETED;
    const isAlternateCompleted = isAccAltCompletionEnabled(account) && training.isAlternateComplete;
    const hasCompletionStatus = isStandardCompleted || isAlternateCompleted;

    return {
      isStandardCompleted,
      isAlternateCompleted,
      hasCompletionStatus,
    };
  }, [training.enrollment?.state, training.isAlternateComplete]);

  const shouldShowDurationAndStatusBadge = useMemo(() => {
    const showCompletionStatus =
      showCompletionStatusInfo &&
      completionStatus.hasCompletionStatus &&
      training.loType !== JOBAID;
    const showDuration = showDurationInfo && training.duration > 0 && training.loType !== JOBAID;
    return showCompletionStatus || showDuration;
  }, [
    showCompletionStatusInfo,
    showDurationInfo,
    completionStatus.hasCompletionStatus,
    training.duration,
    training.loType,
  ]);

  const toggleEffectivenessDialog = () => {
    setShowEffectivenessDialog(value => !value);
  };

  const toggleExtraActions = () => {
    setExtraActions(value => !value);
  };

  const showBookmarkHTML = () => {
    return (
      <div className={styles.saveUnsaveContainer} data-automationid={`${name}-saveUnsaveContainer`}>
        {loadingType === LOADING_TYPE.saveUnsave && getLoadingIconTemplate(styles.smallLoader)}
        {training.isBookmarked ? (
          <button
            className={`${styles.buttonTransparent} ${
              loadingType === LOADING_TYPE.saveUnsave ? styles.hidden : ''
            }`}
            onClick={handleClickWithDisableCheck(removeBookmarkHandler)}
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
              loadingType === LOADING_TYPE.saveUnsave ? styles.hidden : ''
            }`}
            onClick={handleClickWithDisableCheck(() => addBookmarkHandler(false))}
            data-automationid={`${name}-save`}
            aria-label={saveLabel}
            title={saveLabel}
            disabled={showExtraActions}
          >
            {BOOKMARK_ICON()}
          </button>
        )}
      </div>
    );
  };

  const saveLabel = useMemo(() => GetTranslation('text.save'), []);
  const unSaveLabel = useMemo(() => GetTranslation('text.unsave'), []);
  const trainingTypeLabel = useMemo(() => getTrainingTypeLabel(type), [type]);
  const progressBarClass = showProgressBar && !isJobAid ? styles.enrolled : '';
  const duration = training.duration ? convertSecondsToHourAndMinsText(training.duration) : null;
  return (
    <>
      <div
        className={`${styles.card} ${showExtraActions ? styles.extraActionsOpened : ''}`}
        data-lo-id={training.id}
      >
        <div
          className={`${styles.upper} ${undoContainerType ? styles.hidden : ''}`}
          aria-hidden={undoContainerType ? true : false}
        >
          <div
            className={styles.imageContainer}
            style={{ ...cardBgStyle }}
            data-automationid={`${name}-imageContainer`}
          >
            {enrollment && !showEnrollAction && (
              <div
                className={styles.enrolledTag}
                aria-label={GetTranslation('alm.catalog.filter.enrolled')}
                data-automationid={`${name}-enrolledTag`}
              >
                {GetTranslation('alm.catalog.filter.enrolled')}
              </div>
            )}
            {showFormatInfo && formatLabel && (
              <div className={styles.loFormat} data-automationid={`${name}-format`}>
                {formatIcon}
                {formatLabel}
              </div>
            )}
            {showPrice && (
              <div
                className={`${styles.loFormat} ${showFormatInfo && formatLabel ? styles.price : ''}`}
                data-automationid={`${name}-price`}
              >
                {getFormattedPrice(training.price)}
              </div>
            )}
            {shouldShowDurationAndStatusBadge && (
              <div className={`${styles.cardDurationAndStatusBadge} ${progressBarClass}`}>
                {showCompletionStatusInfo && completionStatus.hasCompletionStatus && (
                  <span className={styles.cardCompletionStatus}>
                    {completionStatus.isStandardCompleted ? (
                      <>
                        {STANDARD_COMPLETION_ICON()}
                        <span className={styles.cardCompletionText}>
                          {GetTranslation('text.completed')}
                        </span>
                      </>
                    ) : completionStatus.isAlternateCompleted ? (
                      <>
                        {ALTERNATE_COMPLETION_ICON()}
                        <span className={styles.cardCompletionText}>
                          {GetTranslation('text.completedViaAlternate')}
                        </span>
                      </>
                    ) : null}
                  </span>
                )}
                {showCompletionStatusInfo &&
                  showDurationInfo &&
                  duration &&
                  completionStatus.hasCompletionStatus && (
                    <span className={styles.cardDurationBadgeSeparator}>
                      {DOT_SEPERATOR_ICON()}
                    </span>
                  )}
                {showDurationInfo && duration && (
                  <div
                    className={styles.duration}
                    data-automationid={`${name}-duration`}
                    aria-label={`${GetTranslation('alm.catalog.filter.duration.label')}: ${duration}`}
                  >
                    {duration}
                  </div>
                )}
              </div>
            )}

            {!isJobAid && showProgressBar && (
              <ProgressBar
                showValueLabel={false}
                value={enrollment.progressPercent}
                UNSAFE_className={styles.progressBar}
                data-automationid={`${name}-progressBar`}
                aria-label={`${GetTranslationsReplaced('alm.catalog.card.lo.progressBar', {
                  name: name,
                })}`}
              />
            )}
          </div>
          <a
            className={styles.imageFlipContainer}
            role="anchor"
            onClick={handleClickWithDisableCheck(cardClickHandler)}
          >
            {/* Matching Parameters starts */}
            {showPRLInfo && getMatchingParametersTemplate()}
            {/* Matching Parameters ends */}

            {/* Description Starts */}
            {showDescriptionInfo && (
              <p
                className={`${styles.description} ${showPRLInfo ? styles.descriptionWithParams : ''}`}
                data-automationid={`${name}-description`}
              >
                {description || overview}
              </p>
            )}
            {/* Description Ends */}

            {/* Due/Published Date Starts */}
            {showPublishedDueDateInfo && dueDateorPublishedDate.translationKey && (
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
          className={`${styles.lower} ${undoContainerType ? styles.hidden : ''}`}
          aria-hidden={undoContainerType ? true : false}
        >
          {/* SKILLS Row starts */}
          {/* To deal with skills appearing in the PRL strip. */}
          {(showSkillsInfo || (showRatingInfo && isRatingEffectivenessEnabled)) && (
            <div
              className={styles.skillsContainer}
              data-automationid={`${name}-skillsRatingContainer`}
            >
              <div className={styles.skills} data-automationid={`${name}-skillsContainer`}>
                {showSkillsInfo && getSkillsOrPRLContainer()}
              </div>
              {showRatingInfo && showRating && ratingTemplate}
              {showRatingInfo && showEffectivenessIndex && getEffectivenessIndexTemplate()}
            </div>
          )}
          {/* SKILLS Row ENDS */}

          {/* Title Row Starts */}
          <div className={styles.titleContainer}>
            {/* Job aids have no dedicated page (they open/download in place), so they
                render as a <button> — this removes the browser's "Open in new tab"
                option that would otherwise navigate to a non-existent job aid route.
                Other LO types keep the <a> with an href for normal navigation. */}
            {isJobAid ? (
              <button
                type="button"
                tabIndex={widget?.attributes?.disableLinks || showExtraActions ? -1 : 0}
                id="title"
                className={`${styles.title} ${styles.titleButton}`}
                data-automationid={`${name}-title`}
                onClick={handleClickWithDisableCheck(cardClickHandler)}
                aria-label={`${trainingTypeLabel}, ${name}`}
              >
                <span title={name}>{name}</span>
              </button>
            ) : (
              <a
                tabIndex={widget?.attributes?.disableLinks || showExtraActions ? -1 : 0}
                id="title"
                href={disableLinks ? JAVASCRIPT_VOID_0 : getTrainingLink(training.id, account.id)}
                className={styles.title}
                data-automationid={`${name}-title`}
                onClick={handleClickWithDisableCheck(cardClickHandler)}
                aria-label={`${trainingTypeLabel}, ${name}`}
              >
                <span title={name}>{name}</span>
              </a>
            )}
            {showAddToMyLearningAction && showAddToMyLearning && isJobAid && jobAidIconTemplate()}
            {showAddToMyLearningAction &&
              showAddToMyLearning &&
              !isJobAid &&
              !enrollment &&
              getIconTemplate()}
            {showSaveAction && showBookmarkHTML()}
          </div>
          {/* Title Row Ends */}
          {/* Author Row Starts */}
          {showAuthorNameInfo && !isAuthorPage && (
            <div className={styles.authorContainer}>
              {!isJobAid && showAuthorInfo && authorName && (
                <span
                  className={styles.authorName}
                  data-automationid={`primelxp-authorName-${authorName}`}
                >
                  {formatMessage(
                    {
                      id: 'alm.card.by.author',
                    },
                    { 0: authorName }
                  )}
                </span>
              )}
            </div>
          )}
          {/* Author Row Ends */}
          {/* Recommend reason row starts */}
          {showRecommendedReason && getRecoReasonTemplate()}
          {/* Recommend reason row ends */}
          {/* Action Button starts */}
          {showEnrollAction && (
            <>
              <div
                className={`${styles.actionContainer} ${styles.justifyContentEnd}`}
                data-automationid={`${name}-actionContainer`}
              >
                {!isJobAid && actionText && (
                  <button
                    className={styles.actionButton}
                    onClick={handleClickWithDisableCheck(actionClickHandler)}
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
                    onClick={handleClickWithDisableCheck(jobAidActionHandler)}
                    data-automationid={`jobAid- ${name}`}
                    id={actionButtonId}
                    disabled={showExtraActions}
                  >
                    {format === AI_COACH
                      ? GetTranslation('text.start')
                      : GetTranslation('alm.jobAid.view.button')}
                  </button>
                )}
                {(isTrainingDownloadable || showDontRecommend) && (
                  <button
                    className={styles.showExtraOptions}
                    onClick={handleClickWithDisableCheck(toggleExtraActions)}
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
                <div
                  className={styles.extraActionsDummyContainer}
                  data-automationid={`${name}-extraActionsDummyContainer`}
                >
                  <div className={styles.blurContainer}></div>
                  <div className={styles.extraActionsContainer} ref={extraActionsContainerRef}>
                    {showDontRecommend && (
                      <button
                        onClick={handleClickWithDisableCheck(blockLORecommendationHandler)}
                        data-automationid={`${name}-dontRecommend`}
                        className={styles.extraActions}
                      >
                        {JOBAID_ICON_REMOVE('--prime-color-link')}
                        <span className={styles.extraActionsText}>
                          {GetTranslation('text.dontRecommendThis')}
                        </span>
                      </button>
                    )}
                    {isTrainingDownloadable && (
                      <button
                        title={downloadLabel}
                        onClick={handleClickWithDisableCheck(handleClickForJobAidDownload)}
                        className={styles.extraActions}
                      >
                        {DOWNLOAD_ICON_ROUNDED()}
                        <span className={styles.extraActionsText}>
                          {GetTranslation('alm.text.download')}
                        </span>
                      </button>
                    )}
                  </div>
                  <button
                    className={styles.showExtraOptions}
                    onClick={handleClickWithDisableCheck(toggleExtraActions)}
                    data-automationid={`${name}-extraOptions`}
                  >
                    {<MoreVertical />}
                  </button>
                </div>
              )}
            </>
          )}
          {/* Extra Action ends */}
        </div>
        {/* Undo section starts */}
        <div className={`${styles.undoContainer} ${undoContainerType ? styles.show : ''}`}>
          <div className={styles.upperUndoContainer}>
            <h2>"{name}"</h2>
            <span>
              {formatMessage({
                id: undoContainerType === UNDO_ACTIONS.unSaved ? 'text.unsaved' : 'text.removed',
              })}
            </span>
          </div>
          <div className={styles.lowerUndoContainer}>
            <p>
              {formatMessage({
                id:
                  undoContainerType === UNDO_ACTIONS.unSaved
                    ? 'text.unsaveByMistake'
                    : 'text.removedByMistake',
              })}
              <a
                className={styles.undo}
                tabIndex={0}
                onClick={handleClickWithDisableCheck(() => {
                  undoContainerType === UNDO_ACTIONS.dontRecommend
                    ? unblockLORecommendationHandler()
                    : addBookmarkHandler(true);
                })}
              >
                {formatMessage({ id: 'action.undo' })}
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
