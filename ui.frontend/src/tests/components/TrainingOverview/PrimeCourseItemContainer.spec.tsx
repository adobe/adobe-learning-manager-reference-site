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
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum';
import PrimeCourseItemContainer from '@components/TrainingOverview/PrimeCourseItemContainer/PrimeCourseItemContainer';
import { PrimeLearningObject, PrimeLearningObjectInstance } from '@models/PrimeModels';

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({
    user: {
      id: 'user1',
      contentLocale: 'en-US',
      account: {
        id: 'account1',
        shouldPreReqConsiderPassStatus: false,
      },
    },
  }),
}));

jest.mock('@utils/hooks', () => ({
  filterLoReourcesBasedOnResourceType: (instance: any) => instance?.loResources || [],
  filterTrainingInstance: (training: any, instanceId: string) =>
    training.instances?.find((i: any) => i.id === instanceId) || training.instances[0],
  getCourseInstanceMapping: (mapping: any, trainingId: string) => mapping[trainingId],
  getDuration: () => '2h 30m',
  checkIfEntityIsValid: (entity: any) => !!entity,
  getEnrollment: (training: any) => training.enrollment,
}));

jest.mock('@utils/overview', () => ({
  arePrerequisitesEnforcedAndCompleted: () => true,
  checkIsEnrolled: (enrollment: any) =>
    enrollment?.state === 'ENROLLED' || enrollment?.state === 'COMPLETED',
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationReplaced: (key: string) => key,
  getPreferredLocalizedMetadata: (metadata: any) => metadata?.[0] || {},
}));

jest.mock('@utils/instance', () => ({
  checkIfEnrollmentDeadlineNotPassed: () => true,
  checkIfUnenrollmentDeadlinePassed: () => false,
}));

jest.mock('@utils/dateTime', () => ({
  modifyTime: (date: string) => date,
}));

jest.mock('@utils/lo-utils', () => ({
  getInstanceSummary: () => Promise.resolve({ enrollmentCount: 10, seatLimit: 20 }),
  checkIsLockedForDisplay: () => false,
}));

jest.mock('@utils/inline_svg', () => ({
  ERROR_ICON_SVG: () => '<svg>Error</svg>',
}));

jest.mock('@components/TrainingOverview/PrimeTrainingItemContainerHeader', () => ({
  PrimeTrainingItemContainerHeader: ({ name }: any) => (
    <div data-testid="training-header">{name}</div>
  ),
}));

jest.mock('@components/TrainingOverview/PrimeCourseOverview', () => ({
  PrimeCourseOverview: ({ training, showNotes }: any) => (
    <div data-testid="course-overview" data-show-notes={showNotes ? 'true' : 'false'}>
      {training.localizedMetadata[0].name}
    </div>
  ),
}));

const createMockInstance = (id: string, name: string): PrimeLearningObjectInstance =>
  ({
    id,
    state: 'ACTIVE',
    localizedMetadata: [{ locale: 'en-US', name }],
    isFlexible: false,
    loResources: [
      {
        id: `${id}-resource1`,
        localizedMetadata: [{ locale: 'en-US', name: 'Resource 1' }],
        loResourceType: 'Content',
      } as any,
    ],
    enrollmentDeadline: '',
    unenrollmentDeadline: '',
    seatLimit: 0,
  } as any);

const createMockTraining = (overrides: any = {}): PrimeLearningObject =>
  ({
    id: 'training1',
    loType: 'course',
    localizedMetadata: [
      {
        locale: 'en-US',
        name: 'Test Course',
        description: 'Test Description',
        overview: 'Test Overview',
        richTextOverview: '<p>Test Rich Overview</p>',
      },
    ],
    enrollment: null,
    instances: [
      createMockInstance('instance1', 'Instance 1'),
      createMockInstance('instance2', 'Instance 2'),
    ],
    duration: 3600,
    hasPreview: false,
    loFormat: 'Self Paced',
    isExternal: false,
    completionDateSameAsApprovalDate: false,
    dateCreated: '2024-01-01T00:00:00Z',
    isSubLoOrderEnforced: false,
    subLOs: [],
    sections: [],
    prerequisiteLOs: [],
    prequisiteConstraints: [],
    ...overrides,
  } as any);

const defaultProps = {
  training: createMockTraining(),
  launchPlayerHandler: jest.fn(),
  isPartOfLP: false,
  isPartOfCertification: false,
  isParentLOEnrolled: false,
  isRootLOEnrolled: false,
  isRootLoPreviewEnabled: false,
  showMandatoryLabel: false,
  isPreviewEnabled: false,
  isFlexLPValidationEnabled: false,
  updateFileSubmissionUrl: jest.fn(),
  parentLoName: 'Parent LP',
  setTimeBetweenAttemptEnabled: jest.fn(),
  timeBetweenAttemptEnabled: false,
  setSelectedInstanceInfo: jest.fn(),
  isParentFlexLP: false,
  flexLPTraining: false,
  notes: [],
  updateNote: jest.fn(() => Promise.resolve()),
  deleteNote: jest.fn(() => Promise.resolve()),
  downloadNotes: jest.fn(() => Promise.resolve()),
  sendNotesOnMail: jest.fn(() => Promise.resolve()),
  lastPlayingCourseId: '',
  lastPlayingLoResourceId: '',
  parentHasEnforcedPrerequisites: false,
  parentHasSubLoOrderEnforced: false,
  courseInstanceMapping: {},
  showUnselectedLOs: false,
  isTrainingLocked: false,
  updatePlayerLoState: jest.fn(),
  childLpId: '',
  isRootLoCompleted: false,
  setEnrollViaModuleClick: jest.fn(),
  isPartOfFirstChildTraining: false,
  discussionUtils: {},
  courseInstanceMap: {},
};

function renderComponent(props: any = {}) {
  return render(
    <SpectrumProvider theme={defaultTheme}>
      <IntlProvider locale="en" messages={{}}>
        <PrimeCourseItemContainer {...defaultProps} {...props} />
      </IntlProvider>
    </SpectrumProvider>
  );
}

function getCollapseButton(container: HTMLElement) {
  return container.querySelector('button[data-automationid="Test Course-collapse"]') as HTMLElement;
}

describe('PrimeCourseItemContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collapse / expand', () => {
    it('initialState_collapsed_showsModuleCountAndNoOverview', () => {
      const { container } = renderComponent();

      expect(screen.queryByTestId('course-overview')).toBeNull();
      expect(container.textContent).toContain('alm.training.module');
    });

    it('collapseButton_clicked_expandsAndShowsOverview', () => {
      const { container } = renderComponent();

      fireEvent.click(getCollapseButton(container));

      expect(screen.getByTestId('course-overview')).toHaveTextContent('Test Course');
    });

    it('collapseButton_clickedTwice_collapsesAndHidesOverview', () => {
      const { container } = renderComponent();
      const btn = getCollapseButton(container);

      fireEvent.click(btn);
      expect(screen.getByTestId('course-overview')).toHaveTextContent('Test Course');

      fireEvent.click(btn);
      expect(screen.queryByTestId('course-overview')).toBeNull();
    });

    it('courseInstanceMapping_matchingTrainingId_startsExpanded', () => {
      renderComponent({
        courseInstanceMapping: {
          training1: { instanceId: 'instance1', instanceName: 'Instance 1' },
        },
      });

      expect(screen.getByTestId('course-overview')).toHaveTextContent('Test Course');
    });
  });

  describe('module count', () => {
    it('moduleCount_oneModule_showsSingularTranslationKey', () => {
      const training = createMockTraining({
        instances: [
          {
            ...createMockInstance('instance1', 'Instance 1'),
            loResources: [{ id: 'resource1', loResourceType: 'Content' } as any],
          },
        ],
      });

      const { container } = renderComponent({ training });

      expect(container.textContent).toContain('alm.training.module');
      expect(container.textContent).not.toContain('alm.training.modules');
    });

    it('moduleCount_multipleModules_showsPluralTranslationKey', () => {
      const training = createMockTraining({
        instances: [
          {
            ...createMockInstance('instance1', 'Instance 1'),
            loResources: [
              { id: 'resource1', loResourceType: 'Content' } as any,
              { id: 'resource2', loResourceType: 'Content' } as any,
            ],
          },
        ],
      });

      const { container } = renderComponent({ training });

      expect(container.textContent).toContain('alm.training.modules');
    });
  });

  describe('flex LP instance selection', () => {
    it('flexLP_enabled_showsInstanceDropdownLabel', () => {
      const { container } = renderComponent({ isParentFlexLP: true });

      expect(
        container.querySelector('[data-automationid="Test Course-instance-label"]')
      ).not.toBeNull();
    });

    it('flexLP_disabled_hidesInstanceDropdown', () => {
      const { container } = renderComponent({ isParentFlexLP: false });

      expect(
        container.querySelector('[data-automationid="Test Course-instance-label"]')
      ).toBeNull();
    });

    it('flexLP_noInstanceSelected_showsHrSeparator', () => {
      const { container } = renderComponent({ isParentFlexLP: true });

      expect(container.querySelector('hr')).not.toBeNull();
    });

    it('flexLP_instanceSelected_hidesHrSeparatorAndShowsCollapseButton', () => {
      const { container } = renderComponent({
        isParentFlexLP: true,
        courseInstanceMapping: {
          training1: { instanceId: 'instance1', instanceName: 'Instance 1' },
        },
      });

      expect(container.querySelector('hr')).toBeNull();
      expect(getCollapseButton(container)).not.toBeNull();
    });
  });

  describe('Flex LP: collapse button', () => {
    it('does not render the collapse control when no instance is selected', () => {
      const { container } = renderComponent({ isParentFlexLP: true });

      expect(getCollapseButton(container)).toBeNull();
    });
  });

  describe('Initial expand/collapse from lastPlayingCourseId', () => {
    it('renders the course overview expanded when lastPlayingCourseId matches this training', () => {
      renderComponent({ lastPlayingCourseId: 'training1' });

      expect(screen.getByTestId('course-overview')).toHaveTextContent('Test Course');
    });

    it('keeps the course overview collapsed when lastPlayingCourseId is a different training', () => {
      renderComponent({ lastPlayingCourseId: 'other-course' });

      expect(screen.queryByTestId('course-overview')).toBeNull();
    });
  });

  describe('List row visibility with showUnselectedLOs (flex LP)', () => {
    it('does not render the list row when showUnselectedLOs is true and the training is in courseInstanceMapping', () => {
      const { container } = renderComponent({
        isParentFlexLP: true,
        showUnselectedLOs: true,
        courseInstanceMapping: {
          training1: { instanceId: 'instance1', instanceName: 'Instance 1' },
        },
      });

      expect(container.querySelector('li')).toBeNull();
    });

    it('renders the list row when showUnselectedLOs is false, even if courseInstanceMapping includes this training', () => {
      const { container } = renderComponent({
        isParentFlexLP: true,
        showUnselectedLOs: false,
        courseInstanceMapping: {
          training1: { instanceId: 'instance1', instanceName: 'Instance 1' },
        },
      });

      expect(container.querySelector('li')).not.toBeNull();
    });
  });

  describe('Flex LP: enrolled label', () => {
    it('shows the enrolled label when the parent LO is enrolled on the matching instance', () => {
      const training = createMockTraining({
        enrollment: {
          state: 'ENROLLED',
          loInstance: {
            id: 'instance1',
            localizedMetadata: [{ locale: 'en-US', name: 'Instance 1' }],
          },
        },
      });
      const { container } = renderComponent({
        training,
        isParentFlexLP: true,
        isParentLOEnrolled: true,
      });

      expect(
        container.querySelector('[data-automationid="Test Course-enrolled-label"]')
      ).not.toBeNull();
    });

    it('does not show the enrolled label when the parent LO is not enrolled', () => {
      const training = createMockTraining({
        enrollment: {
          state: 'ENROLLED',
          loInstance: {
            id: 'instance1',
            localizedMetadata: [{ locale: 'en-US', name: 'Instance 1' }],
          },
        },
      });
      const { container } = renderComponent({
        training,
        isParentFlexLP: true,
        isParentLOEnrolled: false,
      });

      expect(
        container.querySelector('[data-automationid="Test Course-enrolled-label"]')
      ).toBeNull();
    });
  });
});
