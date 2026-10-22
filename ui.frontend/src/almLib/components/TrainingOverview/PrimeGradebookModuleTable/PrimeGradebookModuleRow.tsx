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
import React from 'react';
import {
  PrimeLocalizationMetadata,
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
} from '../../../models/PrimeModels';
import { MODULE_SCORING_TYPES } from '../../../utils/constants';
import {
  formatGradebookPercent,
  getGradeFormLoResource,
  getModuleGradebookWeight,
  getModuleScorePercent,
  getWeightedContributionPercent,
  getModuleStatusPill,
  getModuleFormatLabel,
  toGradebookPercentDisplay,
} from '../../../utils/gradebookUtils';
import {
  getPreferredLocalizedMetadata,
  GetTranslation,
  GetTranslationsReplaced,
} from '../../../utils/translationService';
import styles from './PrimeGradebookModuleTable.module.css';

export type PrimeGradebookModuleRowProps = {
  loResource: PrimeLearningObjectResource;
  contentLocale: string;
  enrollment: PrimeLearningObjectInstanceEnrollment | null | undefined;
};

const PrimeGradebookModuleRow: React.FC<PrimeGradebookModuleRowProps> = ({
  loResource,
  contentLocale,
  enrollment,
}) => {
  const meta = getPreferredLocalizedMetadata(
    loResource.localizedMetadata,
    contentLocale
  ) as PrimeLocalizationMetadata;

  const loResourceGrade = getGradeFormLoResource(loResource.id, enrollment?.loResourceGrades);

  const numericWeight = getModuleGradebookWeight(loResource);
  const weightLabel =
    numericWeight !== null && numericWeight > 0
      ? GetTranslationsReplaced(
          'alm.overview.weightage.percentValue',
          { percent: numericWeight },
          true
        )
      : GetTranslation('alm.overview.weightage.none', true);

  const { statusLabel, statusPillClass } = getModuleStatusPill(loResourceGrade, {
    statusPillNeutral: styles.statusPillNeutral,
    statusPillSuccess: styles.statusPillSuccess,
    statusPillDanger: styles.statusPillDanger,
    statusPillInProgress: styles.statusPillInProgress,
  });

  const moduleScoring = loResource.multipleAttemptEnabled
    ? loResource.multipleAttempt?.moduleScoring
    : null;

  const scorePercent = getModuleScorePercent(loResourceGrade, moduleScoring);
  const maxScore = loResourceGrade?.maxScore || 0;

  const scorePrimary =
    scorePercent !== null
      ? GetTranslationsReplaced(
          'alm.overview.gradebook.scorePercentLine',
          {
            percent: toGradebookPercentDisplay(scorePercent),
          },
          true
        )
      : null;

  const displayScore = loResourceGrade?.score;
  const scoreSecondary =
    loResourceGrade && displayScore != null && maxScore > 0
      ? GetTranslationsReplaced(
          'alm.overview.gradebook.scoreFraction',
          { score: toGradebookPercentDisplay(displayScore), max: maxScore },
          true
        )
      : null;

  const contribution =
    numericWeight !== null && numericWeight > 0 && scorePercent !== null
      ? getWeightedContributionPercent(numericWeight, scorePercent)
      : null;
  const contributionLabel =
    contribution !== null
      ? formatGradebookPercent(contribution)
      : GetTranslation('alm.overview.gradebook.scoreDash', true);

  const title = meta?.name ?? '';
  const typeSubtitle = getModuleFormatLabel(loResource);

  const isMandatory = loResource.mandatory === true;
  return (
    <tr className={styles.row} data-automationid={`gradebook-row-${loResource.id}`}>
      <td className={styles.cellModule}>
        <div className={styles.moduleTitle} title={title}>
          {title}
        </div>
        <div className={styles.moduleMeta}>
          {typeSubtitle ? <span className={styles.moduleType}>{typeSubtitle}</span> : null}
          {typeSubtitle && isMandatory && (
            <span className={styles.moduleMetaSep} aria-hidden="true">
              ·
            </span>
          )}
          {isMandatory && (
            <span
              className={styles.pillRequired}
              data-automationid={`gradebook-required-${loResource.id}`}
            >
              {GetTranslation('alm.overview.section.required', true)}
            </span>
          )}
          {(typeSubtitle || isMandatory) && moduleScoring && (
            <span className={styles.moduleMetaSep} aria-hidden="true">
              ·
            </span>
          )}
          {moduleScoring ? (
            <span
              className={styles.moduleScoringLabel}
              data-automationid={`gradebook-scoring-${loResource.id}`}
            >
              {moduleScoring === MODULE_SCORING_TYPES.HIGHEST
                ? GetTranslation('alm.overview.moduleScoring.highest', true)
                : GetTranslation('alm.overview.moduleScoring.latest', true)}
            </span>
          ) : null}
        </div>
      </td>
      <td className={styles.cellStatus}>
        <span
          className={`${styles.statusPill} ${statusPillClass}`}
          data-automationid={`gradebook-status-${loResource.id}`}
        >
          {statusLabel}
        </span>
      </td>
      <td className={`${styles.cellWeight} ${styles.cellNumeric}`}>
        <span data-automationid={`gradebook-weight-${loResource.id}`}>{weightLabel}</span>
      </td>
      <td className={`${styles.cellScore} ${styles.cellNumeric}`}>
        {scorePrimary !== null ? (
          <div className={styles.scoreStack}>
            <span
              className={styles.scorePrimary}
              data-automationid={`gradebook-score-${loResource.id}`}
            >
              {scorePrimary}
            </span>
            {scoreSecondary ? (
              <span className={styles.scoreSecondary}>{scoreSecondary}</span>
            ) : null}
          </div>
        ) : (
          <span className={styles.scoreDash} data-automationid={`gradebook-score-${loResource.id}`}>
            {GetTranslation('alm.overview.gradebook.scoreDash', true)}
          </span>
        )}
      </td>
      <td className={`${styles.cellContribution} ${styles.cellNumeric}`}>
        <span data-automationid={`gradebook-contribution-${loResource.id}`}>
          {contributionLabel}
        </span>
      </td>
    </tr>
  );
};

export default PrimeGradebookModuleRow;
