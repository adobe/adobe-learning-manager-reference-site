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
import PrimeTrainingItemContainerHeader from '../../../almLib/components/TrainingOverview/PrimeTrainingItemContainerHeader/PrimeTrainingItemContainerHeader';
import { PrimeLearningObject, PrimeLearningObjectInstance } from '../../../almLib/models';

const mockUser = {
  id: 'user123',
  account: { shouldPreReqConsiderPassStatus: false },
  contentLocale: 'en-US',
};

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: any) => {
      if (id === 'alm.overview.label.completed') return 'Completed';
      if (id === 'alm.overview.label.inProgress') return 'In Progress';
      if (id === 'alm.overview.section.required') return 'Required';
      if (id === 'alm.module.session.preview') return 'Preview';
      return defaultMessage || id;
    },
    locale: 'en-US',
  }),
}));

jest.mock('@spectrum-icons/workflow/Visibility', () => ({
  __esModule: true,
  default: () => <span data-testid="visibility-icon">Visibility</span>,
}));

jest.mock('@spectrum-icons/workflow/CheckmarkCircle', () => ({
  __esModule: true,
  default: ({ ...props }) => <span data-testid="checkmark-circle" {...props}>✓</span>,
}));

jest.mock('@spectrum-icons/workflow/LockClosed', () => ({
  __esModule: true,
  default: ({ ...props }) => <span data-testid="lock-closed" {...props}>🔒</span>,
}));

jest.mock('../../../almLib/contextProviders/userContextProvider', () => ({
  useUserContext: () => ({ user: mockUser }),
}));

jest.mock('../../../almLib/utils/global', () => ({
  getALMObject: jest.fn(),
  getTrimmedText: (text: string) => text,
  isAccAltCompletionEnabled: jest.fn(),
}));

jest.mock('../../../almLib/utils/hooks', () => ({
  getEnrolledInstancesCount: jest.fn(),
  hasSingleActiveInstance: jest.fn(),
  useCanShowRating: () => true,
  useCardIcon: () => ({
    listThumbnailBgStyle: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  }),
}));

jest.mock('../../../almLib/utils/dateTime', () => ({
  calculateSecondsToTime: (seconds: number) => `${Math.floor(seconds / 60)} min`,
}));

jest.mock('../../../almLib/utils/catalog', () => ({
  debounce: (fn: Function) => fn,
  splitStringIntoArray: (str: string, separator: string) => str.split(separator),
}));

jest.mock('../../../almLib/utils/translationService', () => ({
  GetTranslation: (key: string) => {
    const map: Record<string, string> = {
      'text.completedViaAlternate': 'Completed via Alternate',
      'cpw.loType.course': 'Course',
      'alm.overview.complete.prerequisite.message.course': 'Complete prerequisite',
    };
    return map[key] ?? key;
  },
  GetTranslationReplaced: (key: string, value: any) => `Duration: ${value}`,
  formatMap: {},
}));

jest.mock('../../../almLib/utils/inline_svg', () => ({
  ALTERNATE_COMPLETION_ICON: () => <span data-testid="alternate-icon">Alt</span>,
}));

jest.mock('../../../almLib/components/ALMRatings', () => ({
  ALMStarRating: () => <div data-testid="star-rating">★★★★☆</div>,
}));

jest.mock('../../../almLib/common/Alert/useAlert', () => ({
  useAlert: () => [jest.fn()],
}));

jest.mock('../../../almLib/utils/overview', () => ({
  arePrerequisitesEnforcedAndCompleted: jest.fn(),
  storeActionInNonLoggedMode: jest.fn(),
}));

jest.mock('../../../almLib/utils/lo-utils', () => ({
  checkIsLockedForDisplay: jest.fn(),
  displayPendingRequirements: jest.fn(),
  isTrainingCompleted: (enrollment: any) => enrollment?.state === 'COMPLETED',
  shouldShowOnlyExternalAuthor: jest.fn(),
}));

jest.mock('../../../almLib/utils/breadcrumbUtils', () => ({
  pushToBreadcrumbPath: jest.fn(),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeTraining = (overrides: any = {}): PrimeLearningObject =>
  ({
    id: 'course123',
    loType: 'course',
    loFormat: 'self-paced',
    authorNames: ['John Doe'],
    duration: 3600,
    hasPreview: false,
    rating: { averageRating: 4.5, ratingsCount: 100 },
    enrollment: null,
    isAlternateComplete: false,
    ...overrides,
  } as any);

const makeInstance = (): PrimeLearningObjectInstance =>
  ({ id: 'instance123', isFlexible: false } as any);

const defaultProps = {
  name: 'Test Course',
  description: 'Test description',
  overview: 'Test overview',
  richTextOverview: '',
  training: makeTraining(),
  trainingInstance: makeInstance(),
  launchPlayerHandler: jest.fn(),
  isParentFlexLP: false,
  flexLPTraining: false,
  isRootLOEnrolled: false,
  isPartOfLP: false,
  isPartOfCertification: false,
  showMandatoryLabel: false,
  isprerequisiteLO: false,
  isPreviewEnabled: false,
  isParentLOEnrolled: false,
  parentLoName: '',
  parentHasEnforcedPrerequisites: false,
  parentHasSubLoOrderEnforced: false,
  isPartOfFirstChildTraining: false,
  isTrainingLocked: false,
};

const renderComponent = (props: any = {}) =>
  render(<PrimeTrainingItemContainerHeader {...defaultProps} {...props} />);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PrimeTrainingItemContainerHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore jest.fn() implementations cleared by resetMocks:true in jest config
    const { checkIsLockedForDisplay, shouldShowOnlyExternalAuthor } = require('../../../almLib/utils/lo-utils');
    const { arePrerequisitesEnforcedAndCompleted } = require('../../../almLib/utils/overview');
    const { hasSingleActiveInstance, getEnrolledInstancesCount } = require('../../../almLib/utils/hooks');
    const { isAccAltCompletionEnabled, getALMObject } = require('../../../almLib/utils/global');

    checkIsLockedForDisplay.mockReturnValue(false);
    arePrerequisitesEnforcedAndCompleted.mockReturnValue(true);
    hasSingleActiveInstance.mockReturnValue(true);
    getEnrolledInstancesCount.mockReturnValue(1);
    isAccAltCompletionEnabled.mockReturnValue(false);
    shouldShowOnlyExternalAuthor.mockReturnValue(false);
    getALMObject.mockReturnValue({
      navigateToInstancePage: jest.fn(),
      navigateToTrainingOverviewPage: jest.fn(),
    });
    mockUser.account.shouldPreReqConsiderPassStatus = false;
  });

  describe('Duration Display', () => {
    it('durationPresent_notPrerequisiteLO_durationShown', () => {
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Course-duration"]')).not.toBeNull();
    });

    it('isprerequisiteLO_true_durationHidden', () => {
      const { container } = renderComponent({ isprerequisiteLO: true });
      expect(container.querySelector('[data-automationid="Test Course-duration"]')).toBeNull();
    });

    it('durationZero_durationHidden', () => {
      const { container } = renderComponent({ training: makeTraining({ duration: 0 }) });
      expect(container.querySelector('[data-automationid="Test Course-duration"]')).toBeNull();
    });
  });

  describe('Mandatory Label', () => {
    it('showMandatoryLabel_true_requiredLabelShown', () => {
      renderComponent({ showMandatoryLabel: true });
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('showMandatoryLabel_false_requiredLabelHidden', () => {
      renderComponent();
      expect(screen.queryByText('Required')).toBeNull();
    });
  });

  describe('Lock State', () => {
    it('locked_headerHasLockedClass', () => {
      const { checkIsLockedForDisplay } = require('../../../almLib/utils/lo-utils');
      checkIsLockedForDisplay.mockReturnValue(true);

      const { container } = renderComponent({ isTrainingLocked: true });
      const header = container.querySelector('[data-automationid="Test Course-header"]');
      expect(header?.className).toContain('locked');
    });

    it('locked_lockIconShown', () => {
      const { checkIsLockedForDisplay } = require('../../../almLib/utils/lo-utils');
      checkIsLockedForDisplay.mockReturnValue(true);

      renderComponent({ isTrainingLocked: true });
      expect(screen.getAllByTestId('lock-closed').length).toBeGreaterThanOrEqual(1);
    });

    it('isParentFlexLP_lockedTraining_headerNotDisabled', () => {
      const { checkIsLockedForDisplay } = require('../../../almLib/utils/lo-utils');
      checkIsLockedForDisplay.mockReturnValue(true);

      const { container } = renderComponent({ isTrainingLocked: true, isParentFlexLP: true });
      const header = container.querySelector('[data-automationid="Test Course-header"]');
      expect(header?.className).not.toContain('locked');
    });
  });

  describe('Rating Display', () => {
    it('avgRatingNonZero_starRatingShown', () => {
      renderComponent();
      expect(screen.getByTestId('star-rating')).toBeInTheDocument();
    });

    it('avgRatingZero_starRatingHidden', () => {
      renderComponent({ training: makeTraining({ rating: { averageRating: 0, ratingsCount: 0 } }) });
      expect(screen.queryByTestId('star-rating')).toBeNull();
    });
  });

  describe('Status Display', () => {
    it('enrollmentCompleted_isParentLOEnrolled_completedStatusShown', () => {
      const training = makeTraining({ enrollment: { id: 'e1', state: 'COMPLETED', hasPassed: true } });
      renderComponent({ training, isParentLOEnrolled: true });
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByTestId('checkmark-circle')).toBeInTheDocument();
    });

    it('enrollmentStarted_isParentLOEnrolled_inProgressStatusShown', () => {
      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training, isParentLOEnrolled: true });
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('enrollmentStarted_isParentLOEnrolledFalse_statusNotShown', () => {
      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training, isParentLOEnrolled: false });
      expect(screen.queryByText('In Progress')).toBeNull();
    });
  });

  describe('Preview Functionality', () => {
    it('isPreviewEnabled_hasPreview_notParentLOEnrolled_previewShown', () => {
      renderComponent({ training: makeTraining({ hasPreview: true }), isPreviewEnabled: true });
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('previewEnabled_parentLOEnrolled_previewHidden', () => {
      renderComponent({
        training: makeTraining({ hasPreview: true }),
        isPreviewEnabled: true,
        isParentLOEnrolled: true,
      });
      expect(screen.queryByText('Preview')).toBeNull();
    });

    it('previewClick_callsLaunchPlayerHandler', () => {
      const launchPlayerHandler = jest.fn();
      renderComponent({
        training: makeTraining({ hasPreview: true }),
        isPreviewEnabled: true,
        launchPlayerHandler,
      });
      fireEvent.click(screen.getByText('Preview'));
      expect(launchPlayerHandler).toHaveBeenCalled();
    });
  });

  describe('Header Click — Player Launch', () => {
    it('enrolledCourse_rootLOEnrolled_launchesPlayer', () => {
      const launchPlayerHandler = jest.fn();
      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      const { container } = renderComponent({ training, isRootLOEnrolled: true, launchPlayerHandler });

      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);

      expect(launchPlayerHandler).toHaveBeenCalledWith({
        id: 'course123',
        trainingInstanceId: 'instance123',
      });
    });

    it('noEnrollment_rootLOEnrolled_playerNotLaunched', () => {
      const launchPlayerHandler = jest.fn();
      const { container } = renderComponent({ isRootLOEnrolled: true, launchPlayerHandler });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('nonCourseType_playerNotLaunched', () => {
      const launchPlayerHandler = jest.fn();
      const training = makeTraining({ loType: 'learningProgram', enrollment: { id: 'e1', state: 'STARTED' } });
      const { container } = renderComponent({ training, isRootLOEnrolled: true, launchPlayerHandler });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('isRootLOEnrolledFalse_playerNotLaunched', () => {
      const launchPlayerHandler = jest.fn();
      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      const { container } = renderComponent({ training, isRootLOEnrolled: false, launchPlayerHandler });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('flexLPTraining_playerNotLaunched', () => {
      const launchPlayerHandler = jest.fn();
      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      const { container } = renderComponent({ training, isRootLOEnrolled: true, flexLPTraining: true, launchPlayerHandler });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });
  });

  describe('Locked Training Click', () => {
    it('lockedCourse_click_callsDisplayPendingRequirements', () => {
      const { checkIsLockedForDisplay, displayPendingRequirements } = require('../../../almLib/utils/lo-utils');
      checkIsLockedForDisplay.mockReturnValue(true);

      const { container } = renderComponent({ isTrainingLocked: true });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);

      expect(displayPendingRequirements).toHaveBeenCalled();
    });

    it('lockedNonCourse_click_doesNotCallDisplayPendingRequirements', () => {
      const { checkIsLockedForDisplay, displayPendingRequirements } = require('../../../almLib/utils/lo-utils');
      checkIsLockedForDisplay.mockReturnValue(true);

      const training = makeTraining({ loType: 'learningProgram' });
      const { container } = renderComponent({ training, isTrainingLocked: true });
      fireEvent.click(container.querySelector('[data-automationid="Test Course-header"]')!);

      expect(displayPendingRequirements).not.toHaveBeenCalled();
    });
  });

  describe('Navigation — Title Button Click', () => {
    it('titleClick_withParentLoName_callsPushToBreadcrumbPath', () => {
      const { pushToBreadcrumbPath } = require('../../../almLib/utils/breadcrumbUtils');
      (window as any).location.href = 'http://localhost/learningProgram/lp123';

      renderComponent({ parentLoName: 'Parent LP' });
      fireEvent.click(screen.getByLabelText('Test Course'));

      expect(pushToBreadcrumbPath).toHaveBeenCalled();
    });

    it('singleInstance_singleEnrollment_navigatesToOverviewPage', () => {
      const { getALMObject } = require('../../../almLib/utils/global');
      const mockNavigateToOverview = jest.fn();
      getALMObject.mockReturnValue({
        navigateToInstancePage: jest.fn(),
        navigateToTrainingOverviewPage: mockNavigateToOverview,
      });

      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training });
      fireEvent.click(screen.getByLabelText('Test Course'));

      expect(mockNavigateToOverview).toHaveBeenCalledWith('course123', 'instance123');
    });

    it('multipleInstances_noEnrollment_navigatesToInstancePage', () => {
      const { getALMObject } = require('../../../almLib/utils/global');
      const { hasSingleActiveInstance } = require('../../../almLib/utils/hooks');
      hasSingleActiveInstance.mockReturnValue(false);
      const mockNavigateToInstance = jest.fn();
      getALMObject.mockReturnValue({
        navigateToInstancePage: mockNavigateToInstance,
        navigateToTrainingOverviewPage: jest.fn(),
      });

      renderComponent();
      fireEvent.click(screen.getByLabelText('Test Course'));

      expect(mockNavigateToInstance).toHaveBeenCalledWith('course123');
    });

    it('multienrollmentEnabled_multipleEnrolled_navigatesToInstancePage', () => {
      const { getALMObject } = require('../../../almLib/utils/global');
      const { hasSingleActiveInstance, getEnrolledInstancesCount } = require('../../../almLib/utils/hooks');
      hasSingleActiveInstance.mockReturnValue(false);
      getEnrolledInstancesCount.mockReturnValue(2);
      const mockNavigateToInstance = jest.fn();
      getALMObject.mockReturnValue({
        navigateToInstancePage: mockNavigateToInstance,
        navigateToTrainingOverviewPage: jest.fn(),
      });

      const training = makeTraining({ multienrollmentEnabled: true, enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training });
      fireEvent.click(screen.getByLabelText('Test Course'));

      expect(mockNavigateToInstance).toHaveBeenCalledWith('course123');
    });
  });

  describe('Prerequisite Message', () => {
    it('prereqsNotCompleted_partOfLP_parentEnrolled_prereqLabelShown', () => {
      const { arePrerequisitesEnforcedAndCompleted } = require('../../../almLib/utils/overview');
      arePrerequisitesEnforcedAndCompleted.mockReturnValue(false);

      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training, isPartOfLP: true, isParentLOEnrolled: true });

      expect(screen.getByText('Complete prerequisite')).toBeInTheDocument();
    });

    it('enrollmentCompleted_prereqLabelNotShown', () => {
      const { arePrerequisitesEnforcedAndCompleted } = require('../../../almLib/utils/overview');
      arePrerequisitesEnforcedAndCompleted.mockReturnValue(false);

      const training = makeTraining({ enrollment: { id: 'e1', state: 'COMPLETED' } });
      renderComponent({ training, isPartOfLP: true, isParentLOEnrolled: true });

      expect(screen.queryByText('Complete prerequisite')).toBeNull();
    });

    it('isOrderLocked_true_prevCourseNotPassed_prereqLinkHidden', () => {
      const { arePrerequisitesEnforcedAndCompleted } = require('../../../almLib/utils/overview');
      const { checkIsLockedForDisplay } = require('../../../almLib/utils/lo-utils');
      arePrerequisitesEnforcedAndCompleted.mockReturnValue(false);
      checkIsLockedForDisplay.mockReturnValue(true);
      mockUser.account.shouldPreReqConsiderPassStatus = true;

      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED', progressPercent: 0 } });
      renderComponent({
        training,
        isPartOfCertification: true,
        isParentLOEnrolled: true,
        parentHasSubLoOrderEnforced: true,
        isTrainingLocked: true,
        isOrderLocked: true,
      });

      expect(screen.queryByText('Complete prerequisite')).toBeNull();
    });

    it('isOrderLocked_false_prevCoursePassed_prereqLinkShown', () => {
      const { arePrerequisitesEnforcedAndCompleted } = require('../../../almLib/utils/overview');
      const { checkIsLockedForDisplay } = require('../../../almLib/utils/lo-utils');
      arePrerequisitesEnforcedAndCompleted.mockReturnValue(false);
      checkIsLockedForDisplay.mockReturnValue(true);
      mockUser.account.shouldPreReqConsiderPassStatus = true;

      const training = makeTraining({ enrollment: { id: 'e1', state: 'STARTED', progressPercent: 0 } });
      renderComponent({
        training,
        isPartOfCertification: true,
        isParentLOEnrolled: true,
        parentHasSubLoOrderEnforced: true,
        isTrainingLocked: true,
        isOrderLocked: false,
      });

      expect(screen.getByText('Complete prerequisite')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('titleButton_hasAriaLabel', () => {
      renderComponent();
      expect(screen.getByLabelText('Test Course')).toBeInTheDocument();
    });
  });

  describe('Author Names', () => {
    it('authorNamesPresent_authorNamesShown', () => {
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Course-author-names"]')).not.toBeNull();
    });

    it('authorNamesEmpty_authorNamesHidden', () => {
      const { container } = renderComponent({ training: makeTraining({ authorNames: [] }) });
      expect(container.querySelector('[data-automationid="Test Course-author-names"]')).toBeNull();
    });
  });

  describe('Alternate Completion', () => {
    it('altCompletionEnabled_isAlternateComplete_altStatusShown', () => {
      const { isAccAltCompletionEnabled } = require('../../../almLib/utils/global');
      isAccAltCompletionEnabled.mockReturnValue(true);

      const training = makeTraining({ isAlternateComplete: true, enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training, isParentLOEnrolled: true });

      expect(screen.getByText('Completed via Alternate')).toBeInTheDocument();
      expect(screen.getByTestId('alternate-icon')).toBeInTheDocument();
    });

    it('altCompletionDisabled_isAlternateComplete_altStatusNotShown', () => {
      const { isAccAltCompletionEnabled } = require('../../../almLib/utils/global');
      isAccAltCompletionEnabled.mockReturnValue(false);

      const training = makeTraining({ isAlternateComplete: true, enrollment: { id: 'e1', state: 'STARTED' } });
      renderComponent({ training, isParentLOEnrolled: true });

      expect(screen.queryByText('Completed via Alternate')).toBeNull();
    });
  });
});
