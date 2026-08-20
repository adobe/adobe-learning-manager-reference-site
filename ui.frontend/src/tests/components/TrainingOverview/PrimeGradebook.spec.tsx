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
import { render } from '@testing-library/react';
import PrimeGradebook from '@almLib/components/TrainingOverview/PrimeGradebook/PrimeGradebook';
import {
  PrimeLearningObject,
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
} from '@models/PrimeModels';
import { getEnrollment } from '@utils/hooks';
import {
  GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES,
  GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY,
} from '@utils/gradebookUtils';

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({ user: { contentLocale: 'en_US' } }),
}));

jest.mock('@utils/hooks', () => ({
  getEnrollment: jest.fn(() => null),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
}));

jest.mock('@components/TrainingOverview/PrimeGradebookModuleTable', () => ({
  PrimeGradebookModuleTable: ({ loResources, aggregateFormatted, contributionHeaderTooltip }: any) => (
    <div
      data-testid="mock-module-table"
      data-count={loResources.length}
      data-aggregate={aggregateFormatted}
      data-contribution-tooltip={contributionHeaderTooltip}
    />
  ),
}));

jest.mock('@components/TrainingOverview/PrimeTrainingGradebookSummary', () => ({
  PrimeTrainingGradebookSummary: ({
    passingCriteriaText,
    summaryState,
    gradebookPassingScore,
    progressMetrics,
    aggregateFormatted,
  }: any) => (
    <div
      data-testid="mock-summary-banner"
      data-criteria={passingCriteriaText}
      data-summary-state={summaryState}
      data-passing-score={gradebookPassingScore ?? ''}
      data-progress-metrics={JSON.stringify(progressMetrics)}
      data-aggregate={aggregateFormatted}
    />
  ),
}));

const makeTraining = (overrides: Partial<PrimeLearningObject> = {}): PrimeLearningObject =>
  ({
    hasOptionalLoResources: false,
    loResourceCompletionCount: 0,
    ...overrides,
  } as PrimeLearningObject);

const makeInstance = (): PrimeLearningObjectInstance =>
  ({ id: 'instance-1' } as PrimeLearningObjectInstance);

const makeResource = (
  id: string,
  overrides: Partial<PrimeLearningObjectResource> = {}
): PrimeLearningObjectResource => ({ id, mandatory: false, ...overrides } as PrimeLearningObjectResource);

describe('PrimeGradebook', () => {
  const instance = makeInstance();

  beforeEach(() => {
    (getEnrollment as jest.Mock).mockReturnValue(null);
  });

  describe('with modules', () => {
    it('renders the gradebook container with the correct automation id', () => {
      const { container } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(container.querySelector('[data-automationid="prime-gradebook-container"]')).not.toBeNull();
    });

    it('renders PrimeTrainingGradebookSummary', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner')).not.toBeNull();
    });

    it('renders PrimeGradebookModuleTable with all resources', () => {
      const resources = [makeResource('r1'), makeResource('r2')];
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={resources}
        />
      );
      expect(getByTestId('mock-module-table').dataset.count).toBe('2');
    });

    it('sets summaryState to NOT_STARTED when there is no enrollment activity and the course is not passed', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.summaryState).toBe('NOT_STARTED');
    });

    it('sets summaryState to PASSED when the course is passed and mandatory modules are complete', () => {
      (getEnrollment as jest.Mock).mockReturnValue({
        hasPassed: true,
        loResourceGrades: [{ id: 'lo-r1', completed: true }],
      });
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1', { mandatory: true })]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.summaryState).toBe('PASSED');
    });

    it('uses the score dash translation for aggregate when there is no gradebook contribution yet', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1', { weight: 100 })]}
        />
      );
      const dashKey = 'alm.overview.gradebook.scoreDash';
      expect(getByTestId('mock-summary-banner').dataset.aggregate).toBe(dashKey);
      expect(getByTestId('mock-module-table').dataset.aggregate).toBe(dashKey);
    });

    it('passes progressMetrics to the summary banner', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={[makeResource('r1', { mandatory: true })]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.progressMetrics).toBe(
        JSON.stringify({ completed: 0, total: 1 })
      );
    });

    it('uses all-modules passing criteria copy when loResourceCompletionCount equals module count', () => {
      const resources = [makeResource('r1', { mandatory: true })];
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({
            hasOptionalLoResources: false,
            loResourceCompletionCount: resources.length,
          })}
          trainingInstance={instance}
          loResources={resources}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.criteria).toBe(
        GRADEBOOK_BANNER_CRITERIA_IN_PROGRESS_ALL_MODULES
      );
    });

    it('uses complete-any passing criteria key when loResourceCompletionCount is below table size', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({
            loResourceCompletionCount: 1,
          })}
          trainingInstance={instance}
          loResources={[
            makeResource('r1'),
            makeResource('r2'),
          ]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.criteria).toBe(
        GRADEBOOK_PASSING_CRITERIA_COMPLETE_ANY
      );
    });

    it('passes gradebookPassingScore from training to the banner when set and gradebook is enabled', () => {
      (getEnrollment as jest.Mock).mockReturnValue({ hasPassed: false, loResourceGrades: [] });
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({
            hasOptionalLoResources: true,
            loResourceCompletionCount: 1,
            gradebookEnabled: true,
            gradebookPassingScore: 70,
          })}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.passingScore).toBe('70');
    });

    it('does not pass gradebookPassingScore when gradebook is disabled', () => {
      (getEnrollment as jest.Mock).mockReturnValue({ hasPassed: false, loResourceGrades: [] });
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({
            hasOptionalLoResources: true,
            loResourceCompletionCount: 1,
            gradebookEnabled: false,
            gradebookPassingScore: 70,
          })}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.passingScore).toBe('');
    });

    it('does not pass gradebookPassingScore when minimum aggregate score is zero', () => {
      (getEnrollment as jest.Mock).mockReturnValue({ hasPassed: false, loResourceGrades: [] });
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({
            hasOptionalLoResources: true,
            loResourceCompletionCount: 1,
            gradebookEnabled: true,
            gradebookPassingScore: 0,
          })}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.passingScore).toBe('');
    });

    it('passes undefined gradebookPassingScore to the banner when training has none', () => {
      (getEnrollment as jest.Mock).mockReturnValue({ hasPassed: false, loResourceGrades: [] });
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining({ hasOptionalLoResources: false, loResourceCompletionCount: 0 })}
          trainingInstance={instance}
          loResources={[makeResource('r1')]}
        />
      );
      expect(getByTestId('mock-summary-banner').dataset.passingScore).toBe('');
    });
  });

  describe('without loResources prop', () => {
    it('defaults to an empty module list when loResources is not provided', () => {
      const { getByTestId } = render(
        <PrimeGradebook
          training={makeTraining()}
          trainingInstance={instance}
          loResources={undefined as unknown as PrimeLearningObjectResource[]}
        />
      );
      expect(getByTestId('mock-module-table').dataset.count).toBe('0');
    });
  });
});
