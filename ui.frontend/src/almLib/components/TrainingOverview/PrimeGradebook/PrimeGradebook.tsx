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
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from '../../../models/PrimeModels';
import { usePrimeGradebookDerivedMetrics } from '../../../hooks/training';
import { getGradebookPassingScoreForDisplay } from '../../../utils/gradebookUtils';
import { PrimeGradebookModuleTable } from '../PrimeGradebookModuleTable';
import { PrimeTrainingGradebookSummary } from '../PrimeTrainingGradebookSummary';
import styles from './PrimeGradebook.module.css';

const PrimeGradebook: React.FC<{
  training: PrimeLearningObject;
  trainingInstance: PrimeLearningObjectInstance;
  loResources: PrimeLearningObjectResource[];
}> = props => {
  const { training, trainingInstance } = props;
  const loResources = props.loResources ?? [];

  const { passingCriteriaText, aggregateFormatted, summaryState, progressMetrics, enrollment } =
    usePrimeGradebookDerivedMetrics({
      training,
      trainingInstance,
      loResources,
    });

  return (
    <div data-automationid="prime-gradebook-container" className={styles.root}>
      <PrimeTrainingGradebookSummary
        passingCriteriaText={passingCriteriaText}
        summaryState={summaryState}
        progressMetrics={progressMetrics}
        aggregateFormatted={aggregateFormatted}
        gradebookPassingScore={getGradebookPassingScoreForDisplay(training)}
      />
      <PrimeGradebookModuleTable
        loResources={loResources}
        aggregateFormatted={aggregateFormatted}
        enrollment={enrollment}
        hasOptionalLoResources={training.hasOptionalLoResources === true}
      />
    </div>
  );
};

export default PrimeGradebook;
