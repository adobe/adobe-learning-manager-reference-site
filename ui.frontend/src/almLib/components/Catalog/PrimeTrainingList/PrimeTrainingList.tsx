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
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useTrainingCard } from "../../../hooks/catalog/useTrainingCard";

import {
  PrimeAccount,
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeSearchSnippet,
} from "../../../models/PrimeModels";
import { JOBAID, LEARNING_PROGRAM, OTHER } from "../../../utils/constants";
import { modifyTimeDDMMYY } from "../../../utils/dateTime";
import { navigateToLogin } from "../../../utils/global";
import { getFormattedPrice } from "../../../utils/price";
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
  formatMap,
} from "../../../utils/translationService";
import styles from "./PrimeTrainingList.module.css";
import { canAddSnippet } from "../../../utils/lo-utils";
import { splitStringIntoArray } from "../../../utils/catalog";
import { ALMEffectivenessDialog } from "../../Common/ALMEffectivenessDialog";
import { ADD_ICON, DOWNLOAD_ICON_WITHOUT_CIRCLE, REMOVE_ICON } from "../../../utils/inline_svg";
import { useJobAids } from "../../../hooks/useJobAids";
import { downloadFile } from "../../../utils/widgets/utils";
import { useAlert } from "../../../common/Alert/useAlert";
import { AlertType } from "../../../common/Alert/AlertDialog";
import { useRatingsTemplate } from "../../../utils/hooks";
import { canShowPrice } from "../PrimeTrainingCardV2/PrimeTrainingCardV2.helper";

interface SnippetTranslations {
  note: string;
  badgeName: string;
  moduleName: string;
  skillName: string;
  skillDescription: string;
  jobAidName: string;
  jobAidDescription: string;
  certificationName: string;
  certificationDescription: string;
  certificationOverview: string;
  lpName: string;
  lpDescription: string;
  lpOverview: string;
  courseName: string;
  courseDescription: string;
  courseOverview: string;
  courseTag: string;
  moduleTag: string;
  jobAidTag: string;
  lpTag: string;
  embedLpTag: string;
  discussion: string;
  embedLpName: string;
  embedLpDesc: string;
  embedLpOverview: string;
  recRoleName: string;
  recProductName: string;
}

const snippetTranslations: SnippetTranslations = {
  note: "alm.text.notes",
  badgeName: "alm.text.badges.header",
  moduleName: "alm.training.modules",
  skillName: "alm.catalog.card.skills.label",
  skillDescription: "alm.catalog.card.skills.label",
  jobAidName: "alm.catalog.card.jobAid.plural",
  jobAidDescription: "alm.text.snippetType.description",
  certificationName: "alm.training.certification",
  certificationDescription: "alm.text.snippetType.description",
  certificationOverview: "alm.text.overview",
  lpName: "alm.training.learningProgram",
  lpDescription: "alm.text.snippetType.description",
  lpOverview: "alm.text.overview",
  courseName: "alm.catalog.card.course.plural",
  courseDescription: "alm.text.snippetType.description",
  courseOverview: "alm.text.overview",
  courseTag: "alm.catalog.filter.tags.label",
  moduleTag: "alm.catalog.filter.tags.label",
  jobAidTag: "alm.catalog.filter.tags.label",
  lpTag: "alm.catalog.filter.tags.label",
  embedLpTag: "alm.catalog.filter.tags.label",
  discussion: "alm.text.discussion",
  embedLpName: "alm.training.learningProgram",
  embedLpDesc: "alm.text.snippetType.description",
  embedLpOverview: "alm.text.overview",
  recRoleName: "alm.catalog.filter.roles.label",
  recProductName: "alm.catalog.filter.products.label",
};
const PrimeTrainingList: React.FC<{
  training: PrimeLearningObject;
  guest?: boolean;
  signUpURL?: string;
  almDomain?: string;
  account: PrimeAccount;
  showRating?: boolean;
  showEffectivenessIndex?: boolean;
  handleLoEnrollment?: Function;
  updateLearningObject?: Function;
  removeTrainingFromListById?: Function;
}> = ({
  training,
  guest,
  signUpURL,
  almDomain,
  account,
  showEffectivenessIndex,
  showRating,
  handleLoEnrollment,
  updateLearningObject,
  removeTrainingFromListById,
}) => {
  const {
    format,
    type,
    skillNames,
    name,
    description,
    listThumbnailBgStyle,
    enrollment,
    cardClickHandler,
    overview,
  } = useTrainingCard(training);
  const { enroll, unenroll, handleJobAidClick } = useJobAids(
    training,
    handleLoEnrollment,
    updateLearningObject,
    undefined,
    removeTrainingFromListById
  );
  const { formatMessage, locale } = useIntl();
  const [showEffectivenessDialog, setShowEffectivenessDialog] = useState<boolean>(false);
  const [jobAidDownloadUrl, setJobAidDownloadUrl] = useState("");
  const [almAlert] = useAlert();
  const ratingTemplate = useRatingsTemplate(styles, formatMessage, training);
  const renderSnippets = () => {
    const snippetsArr = training.snippets;
    return snippetsArr.map((snippet: PrimeSearchSnippet) => {
      const snippetType = snippet.snippetType;
      const snippetName = GetTranslation(
        snippetTranslations[snippetType as keyof SnippetTranslations],
        true
      );
      //don't add snippet if it's not a valid snippet type eg- moduleDescription shouldn't be displayed as a snippet
      const addSnippet = snippetName ? canAddSnippet(snippetType, training) : false;
      const snippetHtml = `<div class="${styles.snippet}">${snippet.snippet}</div>`;
      return addSnippet ? (
        <div className={styles.snippetContainer}>
          <span className={styles.snippetType}>
            {snippetName}
            <span aria-hidden="true">:</span>
          </span>
          <div dangerouslySetInnerHTML={{ __html: snippetHtml }} />
        </div>
      ) : (
        ""
      );
    });
  };

  const skillsAsString = skillNames;

  const formatLabel = useMemo(() => {
    return format ? GetTranslation(`${formatMap[format]}`, true) : "";
  }, [format]);
  const trainingTypeLabel = useMemo(() => {
    return type ? GetTranslation(`alm.training.${type}`, true) : "";
  }, [type]);

  const priceHtml = useMemo(() => {
    if (canShowPrice(training, account)) {
      return (
        <div className={`${styles.loFormat} ${styles.price}`}>
          {getFormattedPrice(training.price)}
        </div>
      );
    }
    return null;
  }, [account, training.price]);

  const showStateButton = () => {
    let buttonText = formatMessage({
      id: "alm.text.explore",
    });

    if (type === JOBAID) {
      return (
        <button className={styles.exploreButton} onClick={exploreClickHandler} title={buttonText}>
          {buttonText}
        </button>
      );
    }

    if (enrollment) {
      buttonText = formatMessage({
        id: "alm.text.visit",
      });
    }
    return (
      <button className={styles.exploreButton} onClick={handleNavigation} title={buttonText}>
        {buttonText}
      </button>
    );
  };

  const publishedDate = useMemo(() => {
    const translationKey = "alm.card.published.date";
    const dateText =
      training?.loType === LEARNING_PROGRAM ? training?.dateUpdated : training?.datePublished;
    const id = "primelxp-datePublished";
    return dateText
      ? {
          translationKey,
          value: modifyTimeDDMMYY(dateText, locale),
          id,
        }
      : {};
  }, [training?.loType, training?.dateUpdated, training?.datePublished, locale]);

  const dueDate = useMemo(() => {
    const translationKey = "alm.card.due.date";
    const id = "primelxp-dateDue";
    let dateText = "";
    if (enrollment) {
      const { completionDeadline, loInstance } = enrollment;
      const primeLoInstance = loInstance as PrimeLearningObjectInstance;
      const completionDeadlineText = completionDeadline || primeLoInstance?.completionDeadline;
      if (completionDeadlineText) {
        dateText = completionDeadlineText;
      }
    }
    return dateText
      ? {
          translationKey,
          value: modifyTimeDDMMYY(dateText, locale),
          id,
        }
      : {};
  }, [enrollment, locale]);

  const skillValue = skillsAsString
    ? splitStringIntoArray(skillsAsString)[0]
    : GetTranslation("alm.not.applicable");
  const descriptionValue = description || overview;

  const progressPercentTitle = useMemo(() => {
    if (!enrollment) {
      return "";
    }
    return formatMessage(
      {
        id: "alm.catalog.card.progress.percent",
        defaultMessage: `${enrollment?.progressPercent}% complete`,
      },
      { "0": enrollment?.progressPercent }
    );
  }, [enrollment, formatMessage]);

  const toggleEffectivenessDialog = () => {
    setShowEffectivenessDialog(value => !value);
  };
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
    const uiLabel = GetTranslationReplaced(
      "alm.lo.effectiveness",
      effectivenessIndex.toString(),
      true
    );
    return (
      <a
        className={styles.ratingsContainer}
        onClick={toggleEffectivenessDialog}
        aria-label={label}
        title={label}
        href="javascript:void(0)"
      >
        <span className={`${styles.rating} ${styles.effectiveness}`}>{uiLabel}</span>
      </a>
    );
  };
  const handleNavigation = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    guest ? navigateToLogin(signUpURL, training.id, almDomain) : cardClickHandler();
  };

  const showDownloadButtonForJobAid = useMemo(() => {
    const isJobAid = type === JOBAID;
    if (isJobAid) {
      const trainingJobAidResource = training.instances[0]?.loResources?.[0]?.resources?.[0];
      if (trainingJobAidResource) {
        const downloadUrl = trainingJobAidResource.downloadUrl;
        const jobAidContentType = trainingJobAidResource.contentType;
        setJobAidDownloadUrl(downloadUrl);
        return isJobAid && jobAidContentType !== OTHER && downloadUrl;
      }
    }
  }, [training?.instances?.length, type]);

  const getMetaDataHtml = () => {
    return (
      <>
        {/* Due Date starts */}
        <div className={styles.dueDateContainer}>
          {dueDate.translationKey && (
            <>
              <span
                className={styles.dueDateLabel}
                id={dueDate.id}
                data-automationid={`${name}-${dueDate.id}`}
              >
                {formatMessage({ id: dueDate.translationKey })}
                <span className={styles.separator} aria-hidden="true">
                  :
                </span>
              </span>
              <span title={dueDate.value}>{dueDate.value}</span>
            </>
          )}
        </div>
        {/* Due Date ends */}
        {/* Progess Bar starts */}
        <div className={styles.progressContainer}>
          <ProgressBar
            showValueLabel={false}
            value={enrollment.progressPercent}
            UNSAFE_className={styles.progressBar}
          />
          <span className={styles.progressValueText} title={progressPercentTitle}>
            {progressPercentTitle}
          </span>
        </div>
        {/* Progess Bar ends */}
      </>
    );
  };

  const addToMyListClickHandler = async () => {
    try {
      await enroll();
      almAlert(true, GetTranslation("alm.jobaid.added", true), AlertType.success);
    } catch (error) {
      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  };

  const exploreClickHandler = useCallback(async () => {
    try {
      await enroll();
      handleJobAidClick(training);
    } catch (error) {
      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  }, [almAlert, enroll, handleJobAidClick, training]);

  const downloadClickHandler = useCallback(async () => {
    try {
      if (!enrollment) {
        await enroll();
        almAlert(true, GetTranslation("alm.jobaid.added", true), AlertType.success);
      }

      if (jobAidDownloadUrl) {
        downloadFile(jobAidDownloadUrl);
      }
    } catch (error) {
      almAlert(true, GetTranslation("alm.enrollment.error"), AlertType.error);
    }
  }, [enrollment, jobAidDownloadUrl, enroll, almAlert]);

  const getMetaDataHtmlForJobAid = () => {
    const addLabel = GetTranslation("alm.overview.job.aid.add.from.list");
    const removeLabel = GetTranslation("alm.overview.job.aid.remove.from.list");
    const downloadLabel = GetTranslation("alm.text.download");
    const addRemoveLinkHtml = enrollment ? (
      <div className={styles.dueDateContainer}>
        <button className={styles.iconActionButton} onClick={unenroll}>
          {REMOVE_ICON()}
          <span className={styles.iconActionButtonLabel}>{removeLabel}</span>
        </button>
      </div>
    ) : (
      <div className={styles.dueDateContainer}>
        <button className={styles.iconActionButton} onClick={addToMyListClickHandler}>
          {ADD_ICON()}
          <span className={styles.iconActionButtonLabel}>{addLabel}</span>
        </button>
      </div>
    );

    const downlodLinkHtml = showDownloadButtonForJobAid ? (
      <div className={`${styles.progressContainer} ${styles.block}`}>
        <button className={styles.iconActionButton} onClick={downloadClickHandler}>
          {DOWNLOAD_ICON_WITHOUT_CIRCLE()}
          <span className={styles.iconActionButtonLabel}>{downloadLabel}</span>
        </button>
      </div>
    ) : null;
    return (
      <>
        {/* Add/Remove my learning  starts */}
        {addRemoveLinkHtml}
        {/* Add/Remove my learning ends */}
        {/* Download starts */}
        {downlodLinkHtml}
        {/* Download ends */}
      </>
    );
  };

  const getMetadataTemplate = () => {
    if (enrollment && type !== JOBAID) {
      return getMetaDataHtml();
    }
    if (type === JOBAID) {
      return getMetaDataHtmlForJobAid();
    }
    return null;
  };
  const getNameHtml = useMemo(() => {
    const isJobAid = type === JOBAID;
    const action = isJobAid ? exploreClickHandler : handleNavigation;
    return (
      <a className={styles.title} href="javascript:void(0)" onClick={action}>
        {name}
      </a>
    );
  }, [exploreClickHandler, handleNavigation, name, type]);
  const publishedDateLabel = publishedDate.translationKey
    ? formatMessage({ id: publishedDate.translationKey })
    : "";
  return (
    <>
      <li className={styles.listItem}>
        <div className={styles.detailsContainer}>
          <div className={styles.imageContainer} style={{ ...listThumbnailBgStyle }}>
            {priceHtml}
          </div>
          <div className={styles.loDetailsContainer}>
            {getNameHtml}
            <div className={styles.extraDetails}>
              <span className={styles.details} title={trainingTypeLabel}>
                {trainingTypeLabel}
              </span>
              {formatLabel && (
                <>
                  <span className={styles.dot}></span>
                  <span className={styles.details} title={formatLabel}>
                    {formatLabel}
                  </span>
                </>
              )}
              {/* Due/Published Date Starts */}
              {publishedDate.translationKey && (
                <>
                  <span className={styles.dot}></span>
                  <span
                    className={styles.details}
                    id={publishedDate.id}
                    data-automationid={`${name}-${publishedDate.id}`}
                    title={`${publishedDateLabel} ${publishedDate.value}`}
                  >
                    {publishedDateLabel}
                    <span>{publishedDate.value}</span>
                  </span>
                </>
              )}
              {/* Due/Published Date Ends */}
            </div>
            {training.snippets?.length ? (
              <p className={styles.description}>{renderSnippets()}</p>
            ) : (
              <p className={styles.description} title={descriptionValue}>
                {descriptionValue}
              </p>
            )}

            <div className={styles.skillsContainer}>
              <div className={styles.loSkillsData}>
                {
                  <>
                    <span className={styles.skillsLabel}>
                      {GetTranslation("alm.catalog.card.skills.label", true)}:
                    </span>
                    <span className={styles.skills} title={skillValue}>
                      {skillValue}
                    </span>
                  </>
                }
              </div>
              {getMetadataTemplate()}
            </div>
          </div>
        </div>
        <div className={styles.actionsContainer}>
          <div className={styles.scoreContainer}>
            {showRating && ratingTemplate}
            {showEffectivenessIndex && getEffectivenessIndexTemplate()}
          </div>
          <div>{showStateButton()}</div>
        </div>
      </li>
      {showEffectivenessDialog && (
        <ALMEffectivenessDialog training={training} onClose={toggleEffectivenessDialog} />
      )}
    </>
  );
};

export default PrimeTrainingList;
