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
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import '@testing-library/jest-dom';
import PrimeModuleItem from '@components/TrainingOverview/PrimeModuleItem/PrimeModuleItem';
import { ELEARNING } from '@utils/constants';

// Module-level mocks — all wrapped so resetMocks:true is neutralized via beforeEach restoration
const mockUseAlert = jest.fn();
const mockUseConfirmationAlert = jest.fn();
const mockUseUserContext = jest.fn();
const mockUseResource = jest.fn();
const mockGetALMObject = jest.fn();
const mockGetALMConfig = jest.fn();
const mockGetEnrollment = jest.fn();
const mockCheckIsEnrolled = jest.fn();
const mockGetPreferredLocalizedMetadata = jest.fn();
const mockGetTranslation = jest.fn();
const mockGetEnrolledInstancesCount = jest.fn();
const mockArePrereqsEnforcedAndCompleted = jest.fn();
const mockShouldResetAttempt = jest.fn();
const mockExtractTrainingIdNum = jest.fn();
const mockNavigateToLoggedInLO = jest.fn();
const mockLaunchContentUrlInNewWindow = jest.fn();
const mockCheckIfLinkedIn = jest.fn();
const mockStoreActionInNonLoggedMode = jest.fn();
const mockDisplayPendingRequirements = jest.fn();
const mockIsReattemptAllowed = jest.fn();
const mockIsRevisitAllowed = jest.fn();
const mockAlmAlert = jest.fn();
const mockIsStructuredLocationEnabled = jest.fn();

jest.mock('@common/Alert/useAlert', () => ({
  useAlert: () => mockUseAlert(),
}));

jest.mock('@common/Alert/useConfirmationAlert', () => ({
  useConfirmationAlert: () => mockUseConfirmationAlert(),
}));

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => mockUseUserContext(),
}));

jest.mock('@utils/hooks', () => ({
  useResource: (loResource: any, locale: string) => mockUseResource(loResource, locale),
  getEnrollment: (training: any, instance: any) => mockGetEnrollment(training, instance),
  getEnrolledInstancesCount: (training: any) => mockGetEnrolledInstancesCount(training),
}));

jest.mock('@utils/global', () => ({
  getALMObject: () => mockGetALMObject(),
  getALMConfig: () => mockGetALMConfig(),
  checkIfLinkedInLearningCourse: (...args: any[]) => mockCheckIfLinkedIn(...args),
  launchContentUrlInNewWindow: (...args: any[]) => mockLaunchContentUrlInNewWindow(...args),
  navigateToLoggedInLO: (...args: any[]) => mockNavigateToLoggedInLO(...args),
  isStructuredLocationEnabled: (...args: any[]) => mockIsStructuredLocationEnabled(...args),
}));

jest.mock('@utils/overview', () => ({
  checkIsEnrolled: (enrollment: any) => mockCheckIsEnrolled(enrollment),
  arePrerequisitesEnforcedAndCompleted: (...args: any[]) =>
    mockArePrereqsEnforcedAndCompleted(...args),
  storeActionInNonLoggedMode: (...args: any[]) => mockStoreActionInNonLoggedMode(...args),
  notifyParentToCleanModuleParams: jest.fn(),
}));

jest.mock('@utils/translationService', () => ({
  getPreferredLocalizedMetadata: (metadata: any, locale: string) =>
    mockGetPreferredLocalizedMetadata(metadata, locale),
  GetTranslation: (key: string, returnKey?: boolean) => mockGetTranslation(key, returnKey),
  GetTranslationReplaced: (key: string, value: any) => `${key}: ${value}`,
  GetTranslationsReplaced: (key: string, params: any) => `${key}: ${JSON.stringify(params)}`,
  formatMap: {
    Classroom: 'alm.catalog.card.classroom',
    VirtualClassroom: 'alm.catalog.card.virtual.classroom',
    Elearning: 'alm.text.elearning',
    Activity: 'alm.catalog.card.activity',
  },
}));

jest.mock('@utils/uploadUtils', () => ({
  getUploadInfo: jest.fn().mockResolvedValue({}),
  uploadFile: jest.fn().mockResolvedValue('https://example.com/file.pdf'),
  cancelUploadFile: jest.fn(),
}));

jest.mock('@utils/lo-utils', () => ({
  displayPendingRequirements: (...args: any[]) => mockDisplayPendingRequirements(...args),
  extractTrainingIdNum: (...args: any[]) => mockExtractTrainingIdNum(...args),
  isReattemptAllowed: (...args: any[]) => mockIsReattemptAllowed(...args),
  isRevisitAllowed: (...args: any[]) => mockIsRevisitAllowed(...args),
  shouldResetAttempt: (...args: any[]) => mockShouldResetAttempt(...args),
  // Pure boolean gate — inlined rather than jest.requireActual'd, since lo-utils.ts
  // transitively imports ESCustomHooks (which calls getALMConfig at module-eval time),
  // and requireActual would eagerly evaluate that before this file's own
  // mockGetALMConfig const has initialized.
  shouldShowCreditDuration: (account: any, loResource: any) =>
    !!account?.enableCreditDuration && loResource.creditDuration != null,
}));

jest.mock('@utils/dateTime', () => ({
  convertSecondsToHourAndMinsText: jest.fn((s: number) => `${s}s`),
  GetFormattedDate: jest.fn((date: string) => date || '2024-01-01'),
}));

jest.mock('@utils/timezoneUtils', () => ({
  formatTimeRangeWithTimezone: () => ({ timeRange: '10:00 AM - 11:00 AM', timezoneDisplay: 'PST' }),
  getUserTimezoneInfo: jest.fn(),
  getFormattedTimezoneDisplay: jest.fn(),
  formatDateWithTimezone: (date: string) => date || '2024-01-01',
  isSameDayInTimezone: () => true,
}));

jest.mock('../../../store/APIStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({ fileUpload: { uploadProgress: 0, fileName: 'test.pdf' } }),
  },
}));

jest.mock('@adobe/react-spectrum', () => ({
  ProgressBar: ({ label, value }: any) => (
    <div data-testid="progress-bar">
      {label}: {value}%
    </div>
  ),
}));

jest.mock('@spectrum-icons/workflow/Asterisk', () => ({
  __esModule: true,
  default: () => <span data-testid="asterisk-icon" />,
}));

jest.mock('@spectrum-icons/workflow/CheckmarkCircle', () => ({
  __esModule: true,
  default: () => <span data-testid="checkmark-icon" />,
}));

jest.mock('@spectrum-icons/workflow/LockClosed', () => ({
  __esModule: true,
  default: () => <span data-testid="lock-icon" />,
}));

jest.mock('@spectrum-icons/workflow/Visibility', () => ({
  __esModule: true,
  default: () => <span data-testid="visibility-icon" />,
}));

jest.mock('@spectrum-icons/workflow/Refresh', () => ({
  __esModule: true,
  default: () => <span data-testid="refresh-icon" />,
}));

jest.mock('@spectrum-icons/workflow/Info', () => ({
  __esModule: true,
  default: () => <span data-testid="info-icon" />,
}));

const makeInlineSvgMock = (testId: string) => () =>
  React.createElement('svg', { 'data-testid': testId });

jest.mock('@utils/inline_svg', () => ({
  CLASSROOM_SVG: makeInlineSvgMock('classroom-svg'),
  VIRTUAL_CLASSROOM_SVG: makeInlineSvgMock('vc-svg'),
  SCORM_SVG: makeInlineSvgMock('scorm-svg'),
  ACTIVITY_SVG: makeInlineSvgMock('activity-svg'),
  ERROR_ICON_SVG: makeInlineSvgMock('error-icon'),
  SOCIAL_CANCEL_SVG: makeInlineSvgMock('cancel-svg'),
  CALENDAR_SVG: makeInlineSvgMock('calendar-svg'),
  CLOCK_SVG: makeInlineSvgMock('clock-svg'),
  INSTRUCTOR_SVG: makeInlineSvgMock('instructor-svg'),
  VENUE_SVG: makeInlineSvgMock('venue-svg'),
  SEATS_SVG: makeInlineSvgMock('seats-svg'),
  LINK_SVG: makeInlineSvgMock('link-svg'),
  MOVIE_CAMERA_SVG: makeInlineSvgMock('camera-svg'),
  CREDIT_DURATION_SVG: makeInlineSvgMock('credit-duration-svg'),
  TRANSCRIPT_SVG: makeInlineSvgMock('transcript-svg'),
  NOTICE_ICON: makeInlineSvgMock('notice-icon'),
  VIDEO_SVG: makeInlineSvgMock('video-svg'),
  PDF_SVG: makeInlineSvgMock('pdf-svg'),
  DOC_SVG: makeInlineSvgMock('doc-svg'),
  PPT_SVG: makeInlineSvgMock('ppt-svg'),
  XLS_SVG: makeInlineSvgMock('xls-svg'),
  AUDIO_SVG: makeInlineSvgMock('audio-svg'),
  CAPTIVATE_SVG: makeInlineSvgMock('captivate-svg'),
  PRESENTER_SVG: makeInlineSvgMock('presenter-svg'),
  QUIZ_SVG: makeInlineSvgMock('quiz-svg'),
  HTML_SVG: makeInlineSvgMock('html-svg'),
  LTI_ICON: makeInlineSvgMock('lti-icon'),
  MODULE_PASSED_ICON: makeInlineSvgMock('module-passed'),
  MODULE_FAILED_ICON: makeInlineSvgMock('module-failed'),
  MODULE_IN_PROGRESS: makeInlineSvgMock('module-progress'),
  VIRTUAL_COACH_MODULE_ICON: makeInlineSvgMock('virtual-coach-module-icon'),
}));

jest.mock('@components/Common/ALMTooltip', () => ({
  ALMTooltip: ({ message }: any) => <span data-testid="tooltip">{message}</span>,
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockTraining = {
  id: 'training-1',
  loType: 'course',
  hasPreview: false,
} as any;

const mockTrainingInstance = { id: 'instance-1', state: 'ACTIVE' } as any;

const mockLoResource = {
  id: 'resource-1',
  resourceType: 'Elearning',
  resourceSubType: '',
  loResourceType: 'content',
  mandatory: false,
  previewEnabled: false,
  submissionEnabled: false,
  submissionState: 'PENDING_SUBMISSION',
  submissionUrl: '',
  multipleAttemptEnabled: false,
  hasContentDrivenAttemptTracking: false,
  timeSlot: null,
  localizedMetadata: [{ locale: 'en-US', name: 'Test Module', description: 'Desc', overview: '' }],
} as any;

const mockResource = {
  contentType: 'SCORM2004',
  authorDesiredDuration: 3600,
  desiredDuration: 3600,
  dateStart: null,
  completionDeadline: null,
  instructorNames: ['John Doe'],
  seatLimit: 20,
  location: 'Building A',
  roomLocation: 'Room 101',
  room: null,
  hasQuiz: false,
  allowLaunch: true,
};

const mockUser = {
  id: 'user-1',
  contentLocale: 'en-US',
  account: { id: 'account-1', expireSubmissionDuration: 30 },
};

const defaultProps = {
  training: mockTraining,
  trainingInstance: mockTrainingInstance,
  launchPlayerHandler: jest.fn(),
  loResource: mockLoResource,
  isPreviewEnabled: false,
  canPlay: true,
  updateFileSubmissionUrl: jest.fn(),
  isPartOfLP: false,
  isParentLOEnrolled: false,
  isRootLOEnrolled: false,
  isRootLoPreviewEnabled: false,
  isParentFlexLP: false,
  parentHasEnforcedPrerequisites: false,
  parentHasSubLoOrderEnforced: false,
  lastPlayingLoResourceId: '',
  setTimeBetweenAttemptEnabled: jest.fn(),
  timeBetweenAttemptEnabled: false,
  updatePlayerLoState: jest.fn(),
  isRootLoCompleted: false,
  setEnrollViaModuleClick: jest.fn(),
};

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      {ui}
    </IntlProvider>
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PrimeModuleItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetTranslation.mockImplementation((key: string) => key);
    mockGetPreferredLocalizedMetadata.mockReturnValue({
      name: 'Test Module',
      description: 'Test Description',
      overview: '',
    });
    mockUseAlert.mockReturnValue([mockAlmAlert]);
    mockUseConfirmationAlert.mockReturnValue([jest.fn()]);
    mockUseUserContext.mockReturnValue({ user: mockUser });
    mockUseResource.mockReturnValue(mockResource);
    mockGetALMObject.mockReturnValue({ isPrimeUserLoggedIn: jest.fn(() => true) });
    mockGetALMConfig.mockReturnValue({ handleLinkedInContentExternally: false, guest: false });
    mockGetEnrollment.mockReturnValue({ state: 'ACTIVE', loResourceGrades: [] });
    mockCheckIsEnrolled.mockReturnValue(true);
    mockGetEnrolledInstancesCount.mockReturnValue(1);
    mockArePrereqsEnforcedAndCompleted.mockReturnValue(true);
    mockShouldResetAttempt.mockReturnValue(false);
    mockExtractTrainingIdNum.mockImplementation((id: string) => id);
    mockCheckIfLinkedIn.mockReturnValue(false);
    mockIsReattemptAllowed.mockReturnValue(true);
    mockIsRevisitAllowed.mockReturnValue(true);
    mockIsStructuredLocationEnabled.mockReturnValue(false);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Module name', () => {
    it('displaysLocalizedName', () => {
      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });
  });

  describe('Mandatory asterisk', () => {
    it('mandatoryModule_asteriskShown', () => {
      renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={{ ...mockLoResource, mandatory: true }} />
      );

      expect(screen.getByTestId('asterisk-icon')).toBeInTheDocument();
    });

    it('nonMandatoryModule_asteriskHidden', () => {
      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.queryByTestId('asterisk-icon')).not.toBeInTheDocument();
    });
  });

  describe('Module type icon', () => {
    it('classroomContentType_showsClassroomIcon', () => {
      mockUseResource.mockReturnValue({ ...mockResource, contentType: 'Classroom' });

      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.getByTestId('classroom-svg')).toBeInTheDocument();
      expect(screen.queryByTestId('scorm-svg')).not.toBeInTheDocument();
    });

    it('elearningContentType_showsScormIcon', () => {
      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.getByTestId('scorm-svg')).toBeInTheDocument();
    });
  });

  describe('Module state icons', () => {
    it('canPlayFalse_lockIconShown', () => {
      renderWithIntl(<PrimeModuleItem {...defaultProps} canPlay={false} />);

      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('checkmark-icon')).not.toBeInTheDocument();
    });

    it('passedAndCompletedGrade_checkmarkShown_noLock', () => {
      mockGetEnrollment.mockReturnValue({
        state: 'COMPLETED',
        loResourceGrades: [
          { id: 'resource-1_grade', hasPassed: true, completed: true, dateStarted: '2024-01-01' },
        ],
      });

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} isRootLOEnrolled={true} isParentLOEnrolled={true} />
      );

      expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();
    });

    it('passedGrade_parentLPNotEnrolled_checkmarkHidden', () => {
      // isParentEnrollmentValid = (isPartOfParentLO && isParentLOEnrolled) || !isPartOfParentLO
      // when isPartOfLP=true and isParentLOEnrolled=false → false → checkmark suppressed
      mockGetEnrollment.mockReturnValue({
        state: 'COMPLETED',
        loResourceGrades: [
          { id: 'resource-1_grade', hasPassed: true, completed: true, dateStarted: '2024-01-01' },
        ],
      });

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} isPartOfLP={true} isParentLOEnrolled={false} />
      );

      expect(screen.queryByTestId('checkmark-icon')).not.toBeInTheDocument();
    });

  });

  describe('Preview indicator', () => {
    it('unenrolledAndPreviewEnabled_visibilityIconShown', () => {
      mockCheckIsEnrolled.mockReturnValue(false);

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isPreviewEnabled={true}
          loResource={{ ...mockLoResource, previewEnabled: true }}
        />
      );

      expect(screen.getByTestId('visibility-icon')).toBeInTheDocument();
    });

    it('enrolledOrPreviewDisabled_visibilityIconHidden', () => {
      // enrolled user: isRootLoUnenrolled=false → isModulePreviewAble=false
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isPreviewEnabled={true}
          loResource={{ ...mockLoResource, previewEnabled: true }}
        />
      );

      expect(screen.queryByTestId('visibility-icon')).not.toBeInTheDocument();
    });
  });

  describe('Prework label', () => {
    it('preworkModuleInLP_preworkLabelShown', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.module.prework') return '(Prework)';
        return key;
      });

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isPartOfLP={true}
          isParentLOEnrolled={true}
          loResource={{ ...mockLoResource, loResourceType: 'Pre Work' }}
        />
      );

      expect(screen.getByText(/\(Prework\)/)).toBeInTheDocument();
    });

    it('preworkModuleNotInLP_preworkLabelHidden', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isPartOfLP={false}
          loResource={{ ...mockLoResource, loResourceType: 'Pre Work' }}
        />
      );

      expect(screen.queryByText(/\(Prework\)/)).not.toBeInTheDocument();
    });
  });

  describe('Last played indicator', () => {
    it('matchingResourceId_lastVisitedIndicatorShown', () => {
      renderWithIntl(<PrimeModuleItem {...defaultProps} lastPlayingLoResourceId="resource-1" />);

      // IntlProvider with no messages falls back to the message ID
      expect(screen.getByText('alm.module.lastVisited')).toBeInTheDocument();
    });

    it('noEnrollment_lastVisitedIndicatorHidden', () => {
      // isLastPlayedModule requires a truthy enrollment — without it the indicator never shows
      mockGetEnrollment.mockReturnValue(null);
      mockCheckIsEnrolled.mockReturnValue(false);

      renderWithIntl(<PrimeModuleItem {...defaultProps} lastPlayingLoResourceId="resource-1" />);

      expect(screen.queryByText('alm.module.lastVisited')).not.toBeInTheDocument();
    });
  });

  describe('Click interactions', () => {
    it('enrolledElearningModule_launchPlayerCalledWithCorrectArgs', () => {
      const launchPlayerHandler = jest.fn();
      renderWithIntl(
        <PrimeModuleItem {...defaultProps} launchPlayerHandler={launchPlayerHandler} />
      );

      userEvent.click(screen.getByRole('button'));

      expect(launchPlayerHandler).toHaveBeenCalledTimes(1);
      expect(launchPlayerHandler).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'resource-1',
        trainingInstanceId: 'instance-1',
        isMultienrolled: false,
        isResetRequired: false,
        isAutoPlay: false,
      });
    });

    it('partOfLP_rootEnrolled_immediateParentNotEnrolled_launchPlayerNotCalled', () => {
      const launchPlayerHandler = jest.fn();
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          launchPlayerHandler={launchPlayerHandler}
          isPartOfLP={true}
          isRootLOEnrolled={true}
          isParentLOEnrolled={false}
          isPreviewEnabled={false}
        />
      );

      userEvent.click(screen.getByRole('button'));

      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('unenrolledStandaloneCourse_enrollOnModuleClickCalled', () => {
      mockCheckIsEnrolled.mockReturnValue(false);
      const setEnrollViaModuleClick = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
          isPartOfLP={false}
        />
      );

      userEvent.click(screen.getByRole('button'));

      expect(setEnrollViaModuleClick).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'resource-1',
        instanceId: 'instance-1',
        isMultienrolled: false,
        isAutoPlay: false,
        skipPlayerLaunch: false,
      });
    });

    it('keydownEnter_triggersClickHandler', () => {
      const launchPlayerHandler = jest.fn();
      renderWithIntl(
        <PrimeModuleItem {...defaultProps} launchPlayerHandler={launchPlayerHandler} />
      );

      // fireEvent used because keydown on a non-input div is not covered by userEvent
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', code: 'Enter' });

      expect(launchPlayerHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('resourceClickHandler', () => {
    it('guestMode_navigateToLoggedInLOCalled_launchPlayerNotCalled', () => {
      mockGetALMConfig.mockReturnValue({ guest: true });
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} launchPlayerHandler={launchPlayerHandler} />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockNavigateToLoggedInLO).toHaveBeenCalledTimes(1);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('unenrolled_rootPreviewEnabled_moduleNotPreviewable_alertShown', () => {
      mockCheckIsEnrolled.mockReturnValue(false);
      // isRootLoPreviewEnabled=true but loResource.previewEnabled=false → isModulePreviewAble=false

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isRootLoPreviewEnabled={true}
          loResource={{ ...mockLoResource, previewEnabled: false }}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockAlmAlert).toHaveBeenCalledWith(
        true,
        'alm.overview.error.module.no.preview',
        expect.any(String)
      );
    });

    it('unenrolled_retiredInstance_enrollOnModuleClickNotCalled', () => {
      mockCheckIsEnrolled.mockReturnValue(false);
      const setEnrollViaModuleClick = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          trainingInstance={{ id: 'instance-1', state: 'Retired' } as any}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(setEnrollViaModuleClick).not.toHaveBeenCalled();
    });

    it('canLaunchFalse_moduleLockedAlertShown', () => {
      // allowLaunch=false when both reattempt and revisit are disallowed
      mockIsReattemptAllowed.mockReturnValue(false);
      mockIsRevisitAllowed.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue({
        state: 'ACTIVE',
        loResourceGrades: [
          { id: 'resource-1', dateStarted: '2024-01-01', hasPassed: false, completed: false },
        ],
      });

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={{
            ...mockLoResource,
            multipleAttemptEnabled: true,
            multipleAttempt: {
              timeBetweenAttempts: 0,
              maxAttemptCount: 3,
              infiniteAttempts: false,
            },
            learnerAttemptInfo: { attemptsFinishedCount: 2, currentAttemptNumber: 2 },
          }}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockAlmAlert).toHaveBeenCalledWith(
        true,
        'alm.mqa.module.locked.message',
        expect.any(String)
      );
    });

    it('linkedInCourse_handleExternally_launchContentUrlInNewWindow_playerNotCalled', () => {
      mockCheckIfLinkedIn.mockReturnValue(true);
      mockGetALMConfig.mockReturnValue({ handleLinkedInContentExternally: true, guest: false });
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} launchPlayerHandler={launchPlayerHandler} />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockLaunchContentUrlInNewWindow).toHaveBeenCalledTimes(1);
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });
  });

  describe('itemClickHandler — pending prerequisites', () => {
    it('enrolledWithPendingPrereqs_displayPendingRequirementsCalled', () => {
      // arePrerequisitesEnforcedAndCompleted returning false → isEnforcedPrerequisiteIncomplete=true
      mockArePrereqsEnforcedAndCompleted.mockReturnValue(false);

      renderWithIntl(<PrimeModuleItem {...defaultProps} />);
      // Wrap in act() to flush the setShowDialog(true) state update and its resulting useEffect
      act(() => {
        userEvent.click(screen.getByRole('button'));
      });

      expect(mockDisplayPendingRequirements).toHaveBeenCalledTimes(1);
      expect(mockDisplayPendingRequirements).toHaveBeenCalledWith(
        true, // hasPendingPrerequisites
        false, // parentHasEnforcedPrerequisites (defaultProps)
        false, // parentHasSubLoOrderEnforced (defaultProps)
        false, // isPartOfLP (defaultProps)
        false, // isPartOfCertification
        mockAlmAlert
      );
    });
  });

  describe('itemClickHandler — preview not logged in', () => {
    it('previewableModule_notLoggedIn_storeActionCalledAndPlayerLaunchedNoArgs', () => {
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetALMObject.mockReturnValue({ isPrimeUserLoggedIn: jest.fn(() => false) });
      // training.hasPreview=true so unenrolled branch does NOT call enrollOnModuleClick
      const training = { ...mockTraining, hasPreview: true };
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={training}
          launchPlayerHandler={launchPlayerHandler}
          isPreviewEnabled={true}
          loResource={{ ...mockLoResource, previewEnabled: true }}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockStoreActionInNonLoggedMode).toHaveBeenCalledTimes(1);
      expect(launchPlayerHandler).toHaveBeenCalledWith();
    });

    it('previewableModule_loggedIn_playerLaunchedWithArgs_storeActionNotCalled', () => {
      mockCheckIsEnrolled.mockReturnValue(false);
      // isPrimeUserLoggedIn=true (default)
      const training = { ...mockTraining, hasPreview: true };
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={training}
          launchPlayerHandler={launchPlayerHandler}
          isPreviewEnabled={true}
          loResource={{ ...mockLoResource, previewEnabled: true }}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(mockStoreActionInNonLoggedMode).not.toHaveBeenCalled();
      expect(launchPlayerHandler).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'training-1' })
      );
    });
  });

  describe('updatePlayerLoState', () => {
    it('partOfLP_click_updatePlayerLoStateCalled', () => {
      const updatePlayerLoState = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isPartOfLP={true}
          isParentLOEnrolled={true}
          updatePlayerLoState={updatePlayerLoState}
        />
      );
      userEvent.click(screen.getByRole('button'));

      expect(updatePlayerLoState).toHaveBeenCalledTimes(1);
      expect(updatePlayerLoState).toHaveBeenCalledWith({
        body: { lastPlayingChildLp: '', lastPlayingCourse: 'training-1' },
      });
    });
  });

  describe('File submission states', () => {
    const submissionProps = {
      ...defaultProps,
      loResource: { ...mockLoResource, submissionEnabled: true },
    };

    it('submissionRejected_showsRejectedLabel', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...submissionProps}
          loResource={{ ...submissionProps.loResource, submissionState: 'REJECTED' }}
        />
      );

      // Text node contains trailing ' : ', so match with regex
      expect(screen.getByText(/Submission Rejected/)).toBeInTheDocument();
    });

    it('submissionPendingApproval_showsAwaitingApprovalLabel', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...submissionProps}
          loResource={{ ...submissionProps.loResource, submissionState: 'PENDING_APPROVAL' }}
        />
      );

      expect(screen.getByText(/Submission Awaiting Approval/)).toBeInTheDocument();
    });

    it('submissionApproved_showsApprovedLabel', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...submissionProps}
          loResource={{ ...submissionProps.loResource, submissionState: 'APPROVED' }}
        />
      );

      expect(screen.getByText('Submission Approved')).toBeInTheDocument();
    });

    it('submissionPending_showsPendingLabel', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...submissionProps}
          loResource={{ ...submissionProps.loResource, submissionState: 'PENDING_SUBMISSION' }}
        />
      );

      expect(screen.getByText('Submission Pending')).toBeInTheDocument();
    });
  });

  describe('Checklist status', () => {
    const checklistProps = {
      ...defaultProps,
      isRootLOEnrolled: true,
    };

    it('checklistPending_showsReviewerEvaluationPendingMessage', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...checklistProps}
          loResource={{ ...mockLoResource, checklistEvaluationStatus: 'PENDING' }}
        />
      );

      expect(screen.getByText('Reviewer evaluation is pending')).toBeInTheDocument();
    });

    it('checklistPassed_showsPassedStatus', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.overview.checklistReview.passed') return 'Passed';
        return key;
      });

      renderWithIntl(
        <PrimeModuleItem
          {...checklistProps}
          loResource={{ ...mockLoResource, checklistEvaluationStatus: 'PASSED' }}
        />
      );

      expect(screen.getByText('Passed')).toBeInTheDocument();
    });

    it('checklistFailed_showsFailedStatus', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.overview.checklistReview.failed') return 'Failed';
        return key;
      });

      renderWithIntl(
        <PrimeModuleItem
          {...checklistProps}
          loResource={{ ...mockLoResource, checklistEvaluationStatus: 'FAILED' }}
        />
      );

      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('noChecklistStatus_checklistTextNotShown', () => {
      renderWithIntl(<PrimeModuleItem {...checklistProps} />);

      expect(screen.queryByText('Reviewer evaluation is pending')).not.toBeInTheDocument();
    });

    it('checklistMandatoryFailed_rootEnrolled_failInfoShown', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.overview.checklistFailInfo') return 'Checklist fail info';
        return key;
      });

      renderWithIntl(
        <PrimeModuleItem
          {...checklistProps}
          loResource={{
            ...mockLoResource,
            isChecklistMandatory: true,
            checklistEvaluationStatus: 'failed',
          }}
        />
      );

      expect(screen.getByText('Checklist fail info')).toBeInTheDocument();
    });

    it('checklistMandatoryFailed_rootNotEnrolled_failInfoHidden', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          isRootLOEnrolled={false}
          loResource={{
            ...mockLoResource,
            isChecklistMandatory: true,
            checklistEvaluationStatus: 'failed',
          }}
        />
      );

      expect(screen.queryByText('alm.overview.checklistFailInfo')).not.toBeInTheDocument();
    });
  });

  describe('LTI banner', () => {
    it('ltiModule_startedNotPassed_bannerShown', () => {
      mockUseResource.mockReturnValue({ ...mockResource, contentType: 'LTI' });
      mockGetEnrollment.mockReturnValue({
        state: 'ACTIVE',
        loResourceGrades: [
          { id: 'resource-1', dateStarted: '2024-01-01', hasPassed: false, completed: false },
        ],
      });
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'lti.grades.banner.header') return 'LTI Banner Header';
        return key;
      });

      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.getByText('LTI Banner Header')).toBeInTheDocument();
    });

    it('ltiModule_passed_bannerHidden', () => {
      mockUseResource.mockReturnValue({ ...mockResource, contentType: 'LTI' });
      mockGetEnrollment.mockReturnValue({
        state: 'COMPLETED',
        loResourceGrades: [
          { id: 'resource-1', dateStarted: '2024-01-01', hasPassed: true, completed: true },
        ],
      });

      renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      expect(screen.queryByText('lti.grades.banner.header')).not.toBeInTheDocument();
    });
  });

  describe('Access time section', () => {
    it('timeSlotPresent_accessTimeSectionRendered', () => {
      const loResourceWithTimeSlot = {
        ...mockLoResource,
        timeSlot: { startTime: '2024-01-01T10:00:00Z', endTime: '2024-01-01T11:00:00Z' },
      };

      renderWithIntl(<PrimeModuleItem {...defaultProps} loResource={loResourceWithTimeSlot} />);

      // The access limit section has id="access-limit-resource-1" and contains the Info icon
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  describe('Reviewer block', () => {
    it('showChecklistComment_reviewerRemarksSectionShown', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.module.reviewerRemarks') return 'Reviewer Remarks';
        return key;
      });

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={{
            ...mockLoResource,
            showChecklistComment: true,
            checklistComment: 'Good work',
          }}
        />
      );

      expect(screen.getByText('Reviewer Remarks')).toBeInTheDocument();
      expect(screen.getByText('Good work')).toBeInTheDocument();
    });
  });

  describe('attemptDescription', () => {
    const multipleAttemptLoResource = (overrides: any = {}) => ({
      ...mockLoResource,
      multipleAttemptEnabled: true,
      hasContentDrivenAttemptTracking: false,
      multipleAttempt: {
        timeBetweenAttempts: 0,
        maxAttemptCount: 3,
        infiniteAttempts: false,
        stopAttemptOnSuccessfulComplete: false,
        attemptEndCriteria: 'COMPLETION',
        attemptDuration: 0,
        ...overrides,
      },
    });

    it('multipleAttempt_noQuiz_attemptDescriptionNotShown', () => {
      mockUseResource.mockReturnValue({ ...mockResource, hasQuiz: false });

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={multipleAttemptLoResource()} />
      );

      expect(screen.queryByText('alm.mqa.attempt')).not.toBeInTheDocument();
    });

    it('multipleAttempt_hasQuiz_finite_notStarted_showsMaxAttemptCount', () => {
      mockUseResource.mockReturnValue({ ...mockResource, hasQuiz: true });

      renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={multipleAttemptLoResource()} />
      );

      // getAttemptInfo renders with data-automationid="Test Module-mqa-maxAttemptCount"
      const el = document.querySelector('[data-automationid="Test Module-mqa-maxAttemptCount"]');
      expect(el).not.toBeNull();
      expect(el!.textContent).toBe('3');
    });

    it('multipleAttempt_hasQuiz_infinite_notStarted_showsInfiniteAttemptText', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.mqa.infiniteAttempt') return 'Unlimited';
        return key;
      });
      mockUseResource.mockReturnValue({ ...mockResource, hasQuiz: true });

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={multipleAttemptLoResource({ infiniteAttempts: true })}
        />
      );

      expect(screen.getByText('Unlimited')).toBeInTheDocument();
    });

    it('multipleAttempt_hasQuiz_gradePassed_stopOnComplete_showsModuleCompletedText', () => {
      mockGetTranslation.mockImplementation((key: string) => {
        if (key === 'alm.mqa.moduleCompletes') return 'Module Completed';
        return key;
      });
      mockUseResource.mockReturnValue({ ...mockResource, hasQuiz: true });
      mockGetEnrollment.mockReturnValue({
        state: 'COMPLETED',
        loResourceGrades: [
          { id: 'resource-1', dateStarted: '2024-01-01', hasPassed: true, completed: true },
        ],
      });

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={multipleAttemptLoResource({ stopAttemptOnSuccessfulComplete: true })}
        />
      );

      expect(screen.getByText('Module Completed')).toBeInTheDocument();
    });
  });

  describe('reattemptHandler', () => {
    const reattemptSetup = (timeBetweenAttempts: number, lastAttemptEndTime: string) => {
      mockUseResource.mockReturnValue({ ...mockResource, hasQuiz: true });
      mockGetEnrollment.mockReturnValue({
        state: 'ACTIVE',
        loResourceGrades: [
          { id: 'resource-1', dateStarted: '2024-01-01', hasPassed: false, completed: false },
        ],
      });
      return {
        ...mockLoResource,
        multipleAttemptEnabled: true,
        hasContentDrivenAttemptTracking: false,
        multipleAttempt: {
          timeBetweenAttempts,
          maxAttemptCount: 3,
          infiniteAttempts: false,
          stopAttemptOnSuccessfulComplete: false,
          attemptEndCriteria: 'COMPLETION',
          attemptDuration: 0,
        },
        learnerAttemptInfo: {
          attemptsFinishedCount: 1,
          currentAttemptNumber: 1,
          lastAttemptEndTime,
          currentAttemptStartTime: '2024-01-01T09:00:00Z',
          currentAttemptEndTime: lastAttemptEndTime,
        },
      };
    };

    it('reattemptButton_lockedBetweenAttempts_alertShown_playerNotLaunched', () => {
      const loResource = reattemptSetup(60, '2099-01-01T00:00:00Z');
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={loResource}
          launchPlayerHandler={launchPlayerHandler}
        />
      );

      const reattemptBtn = screen.getByText('alm.mqa.reattempt').closest('button')!;
      userEvent.click(reattemptBtn);

      expect(mockAlmAlert).toHaveBeenCalledWith(
        true,
        'alm.mqa.module.locked.message',
        expect.any(String)
      );
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('reattemptButton_notLocked_launchPlayerCalled', () => {
      const loResource = reattemptSetup(0, '2024-01-01T10:00:00Z');
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={loResource}
          launchPlayerHandler={launchPlayerHandler}
        />
      );

      const reattemptBtn = screen.getByText('alm.mqa.reattempt').closest('button')!;
      userEvent.click(reattemptBtn);

      expect(mockAlmAlert).not.toHaveBeenCalled();
      expect(launchPlayerHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeBetweenAttempt lockout effect', () => {
    it('futureLockoutTime_setTimeBetweenAttemptEnabledTrue', () => {
      const setTimeBetweenAttemptEnabled = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
          loResource={{
            ...mockLoResource,
            multipleAttemptEnabled: true,
            multipleAttempt: {
              timeBetweenAttempts: 60,
              maxAttemptCount: 3,
              infiniteAttempts: false,
            },
            learnerAttemptInfo: {
              attemptsFinishedCount: 1,
              lastAttemptEndTime: '2099-01-01T00:00:00Z',
              currentAttemptNumber: 1,
            },
          }}
        />
      );

      expect(setTimeBetweenAttemptEnabled).toHaveBeenCalledWith(true);
    });

    it('noLearnerAttemptInfo_setTimeBetweenAttemptEnabledFalse', () => {
      const setTimeBetweenAttemptEnabled = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          setTimeBetweenAttemptEnabled={setTimeBetweenAttemptEnabled}
          loResource={{ ...mockLoResource, multipleAttemptEnabled: true }}
        />
      );

      expect(setTimeBetweenAttemptEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('Resize listener cleanup', () => {
    it('unmount_removesResizeEventListener', () => {
      const removeListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderWithIntl(<PrimeModuleItem {...defaultProps} />);

      unmount();

      expect(removeListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeListenerSpy.mockRestore();
    });
  });

  describe('Deep Link Auto-Play', () => {
    const deepLinkLoResource = {
      ...mockLoResource,
      id: 'course:12345_67890_13549656_0',
    };

    afterEach(() => {
      act(() => cleanup());
      window.location.hash = '';
    });

    it('deepLinkModuleIdMatch_notEnrolled_enrollOnModuleClickCalled', () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue(null);
      const setEnrollViaModuleClick = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
        />
      );

      expect(setEnrollViaModuleClick).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'course:12345_67890_13549656_0',
        instanceId: 'instance-1',
        isMultienrolled: false,
        isAutoPlay: true,
        skipPlayerLaunch: false,
      });
    });

    it('deepLinkModuleIdMatch_enrolled_playerLaunchedWithoutEnroll', () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';
      const launchPlayerHandler = jest.fn();
      const setEnrollViaModuleClick = jest.fn();
      const overview = require('@utils/overview');

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          launchPlayerHandler={launchPlayerHandler}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
        />
      );

      expect(setEnrollViaModuleClick).not.toHaveBeenCalled();
      expect(launchPlayerHandler).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'course:12345_67890_13549656_0',
        trainingInstanceId: 'instance-1',
        isMultienrolled: false,
        isResetRequired: false,
        isAutoPlay: true,
      });
      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('deepLinkModuleInPathFormat_enrolled_urlCleanedAndPostMessageSent', () => {
      window.location.hash = '#/course/12345/instance/67890/module/13549656_0';
      const overview = require('@utils/overview');

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
        />
      );

      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('deepLinkModuleIdMatch_moduleLocked_alertShownAndNoUrlCleanup', () => {
      // allowLaunch is false when multipleAttemptEnabled=true, attempts exhausted (reattempt+revisit both false)
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';
      const lockedLoResource = {
        ...deepLinkLoResource,
        multipleAttemptEnabled: true,
        multipleAttempt: { maxAttemptCount: 3, infiniteAttempts: false, timeBetweenAttempts: 0 },
      };
      mockGetEnrollment.mockReturnValue({
        state: 'ACTIVE',
        loResourceGrades: [{ id: 'course:12345_67890_13549656_0', dateStarted: '2024-01-01', completed: false }],
      });
      mockIsReattemptAllowed.mockReturnValue(false);
      mockIsRevisitAllowed.mockReturnValue(false);
      const overview = require('@utils/overview');

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={lockedLoResource}
        />
      );

      expect(mockAlmAlert).toHaveBeenCalledWith(true, expect.anything(), expect.anything());
      expect(overview.notifyParentToCleanModuleParams).not.toHaveBeenCalled();
    });

    it('deepLinkModuleIdMismatch_autoPlayNotTriggered', () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=99999_0';
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue(null);
      const setEnrollViaModuleClick = jest.fn();
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
          launchPlayerHandler={launchPlayerHandler}
        />
      );

      expect(setEnrollViaModuleClick).not.toHaveBeenCalled();
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('noModuleIdInUrl_autoPlayNotTriggered', () => {
      window.location.hash = '#/course/12345/instance/67890';
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          launchPlayerHandler={launchPlayerHandler}
        />
      );

      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('retiredInstance_deepLinkModuleIdMatch_autoPlayNotTriggered', () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue(null);
      const setEnrollViaModuleClick = jest.fn();
      const launchPlayerHandler = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          trainingInstance={{ ...mockTrainingInstance, state: 'Retired' }}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
          launchPlayerHandler={launchPlayerHandler}
        />
      );

      expect(setEnrollViaModuleClick).not.toHaveBeenCalled();
      expect(launchPlayerHandler).not.toHaveBeenCalled();
    });

    it('deepLinkModuleIdWithoutSuffix_normalized_enrollOnModuleClickCalled', () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656';
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue(null);
      const setEnrollViaModuleClick = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
        />
      );

      expect(setEnrollViaModuleClick).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'course:12345_67890_13549656_0',
        instanceId: 'instance-1',
        isMultienrolled: false,
        isAutoPlay: true,
        skipPlayerLaunch: false,
      });
    });

    it('deepLinkModuleInPathFormat_enrollOnModuleClickCalled', () => {
      window.location.hash = '#/course/12345/instance/67890/module/13549656_0';
      mockCheckIsEnrolled.mockReturnValue(false);
      mockGetEnrollment.mockReturnValue(null);
      const setEnrollViaModuleClick = jest.fn();

      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={deepLinkLoResource}
          setEnrollViaModuleClick={setEnrollViaModuleClick}
        />
      );

      expect(setEnrollViaModuleClick).toHaveBeenCalledWith({
        id: 'training-1',
        moduleId: 'course:12345_67890_13549656_0',
        instanceId: 'instance-1',
        isMultienrolled: false,
        isAutoPlay: true,
        skipPlayerLaunch: false,
      });
    });

    it('deepLinkModuleIdMatch_errorCase_notifyParentCalledOnUnmount', async () => {
      // Error case (locked module): notifyParentToCleanModuleParams is never called by resourceClickHandler.
      // Unmount cleanup is the fallback — calls it so back navigation doesn't re-trigger autoplay.
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';
      const lockedLoResource = {
        ...deepLinkLoResource,
        multipleAttemptEnabled: true,
        multipleAttempt: { maxAttemptCount: 3, infiniteAttempts: false, timeBetweenAttempts: 0 },
      };
      mockGetEnrollment.mockReturnValue({
        state: 'ACTIVE',
        loResourceGrades: [{ id: 'course:12345_67890_13549656_0', dateStarted: '2024-01-01', completed: false }],
      });
      mockIsReattemptAllowed.mockReturnValue(false);
      mockIsRevisitAllowed.mockReturnValue(false);

      const overview = require('@utils/overview');
      const { unmount } = renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={lockedLoResource} />
      );

      await act(async () => {});
      overview.notifyParentToCleanModuleParams.mockClear();
      act(() => {
        unmount();
      });

      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalledTimes(1);
    });

    it('deepLinkModuleIdMatch_playerLaunched_notifyParentCalledOnUnmount', async () => {
      // Success case: notifyParentToCleanModuleParams was called by resourceClickHandler on player launch.
      // Unmount cleanup calls it again — idempotent because notifyParentToCleanModuleParams only
      // calls replaceState when hash is still dirty.
      window.location.hash = '#/course/12345/instance/67890?moduleId=13549656_0';

      const overview = require('@utils/overview');
      const { unmount } = renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={deepLinkLoResource} />
      );

      await act(async () => {});
      overview.notifyParentToCleanModuleParams.mockClear();
      act(() => { unmount(); });

      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalledTimes(1);
    });

    it('noDeepLink_noCleanupOnUnmount', () => {
      // Normal navigation — no moduleId, autoPlayTriggered stays false, unmount does nothing.
      window.location.hash = '#/course/12345/instance/67890';

      const overview = require('@utils/overview');
      const { unmount } = renderWithIntl(
        <PrimeModuleItem {...defaultProps} loResource={deepLinkLoResource} />
      );

      act(() => {
        unmount();
      });

      expect(overview.notifyParentToCleanModuleParams).not.toHaveBeenCalled();
    });
  });

  describe('Weightage badge', () => {
    beforeEach(() => {
      mockUseUserContext.mockReturnValue({
        user: { ...mockUser, account: { ...mockUser.account, gradebookVisibleLearner: true } },
      });
    });

    it('shows the weight percent label when the gradebook is enabled and the module has positive weight', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={{ ...mockTraining, gradebookEnabled: true, gradebookVisibleLearner: true }}
          loResource={{
            ...mockLoResource,
            weight: 40,
            resources: [{ contentType: 'SCORM2004' }],
          }}
        />
      );
      const badge = document.querySelector('[data-automationid="Test Module-weightage"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toContain('alm.overview.weightage.percent');
    });

    it('shows the weight percent label when the gradebook is enabled and the module has positive weight for Video', () => {
      mockUseResource.mockReturnValue({ ...mockResource, contentType: 'VIDEO' });
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={{ ...mockTraining, gradebookEnabled: true, gradebookVisibleLearner: true }}
          loResource={{
            ...mockLoResource,
            resourceType: ELEARNING,
            weight: 40,
            resources: [{ contentType: 'SCORM2004' }],
          }}
        />
      );
      const badge = document.querySelector('[data-automationid="Test Module-weightage"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toContain('alm.overview.weightage.percent');
    });

    it('shows the no-weightage label when the gradebook is enabled and module weight is unset', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={{ ...mockTraining, gradebookEnabled: true, gradebookVisibleLearner: true }}
          loResource={{ ...mockLoResource, weight: undefined }}
        />
      );
      const badge = document.querySelector('[data-automationid="Test Module-weightage"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toBe('alm.overview.weightage.none');
    });

    it('shows the zero percent label when the gradebook is enabled and module weight is zero', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={{ ...mockTraining, gradebookEnabled: true, gradebookVisibleLearner: true }}
          loResource={{
            ...mockLoResource,
            resourceType: ELEARNING,
            weight: 0,
            resources: [{ contentType: 'SCORM2004' }],
          }}
        />
      );
      const badge = document.querySelector('[data-automationid="Test Module-weightage"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toBe('alm.overview.weightage.none');
    });

    it.each(['Pre Work', 'Test Out'])(
      'does not render the weightage badge for %s modules',
      loResourceType => {
        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            training={{ ...mockTraining, gradebookEnabled: true, gradebookVisibleLearner: true }}
            loResource={{ ...mockLoResource, loResourceType, weight: 40 }}
          />
        );
        expect(document.querySelector('[data-automationid="Test Module-weightage"]')).toBeNull();
      }
    );

    it('does not render the weightage badge when the gradebook is disabled', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          training={{ ...mockTraining, gradebookEnabled: false, gradebookVisibleLearner: true }}
          loResource={{
            ...mockLoResource,
            weight: 40,
            resources: [{ contentType: 'SCORM2004' }],
          }}
        />
      );
      expect(document.querySelector('[data-automationid="Test Module-weightage"]')).toBeNull();
    });
  });

  describe('Module scoring label', () => {
    it.each([
      ['HIGHEST', 'alm.overview.moduleScoring.highest'],
      ['LATEST', 'alm.overview.moduleScoring.latest'],
    ])(
      'shows %s scoring label when multipleAttemptEnabled and moduleScoring is set',
      (moduleScoring, expectedKey) => {
        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{
              ...mockLoResource,
              multipleAttemptEnabled: true,
              multipleAttempt: {
                moduleScoring,
                maxAttemptCount: 3,
                infiniteAttempts: false,
              },
            }}
          />
        );
        expect(screen.getByText(expectedKey)).toBeInTheDocument();
      }
    );

    it('hides scoring label when multipleAttemptEnabled is false even if moduleScoring is set', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={{
            ...mockLoResource,
            multipleAttemptEnabled: false,
            multipleAttempt: {
              moduleScoring: 'LATEST',
              maxAttemptCount: 3,
              infiniteAttempts: false,
            },
          }}
        />
      );
      expect(screen.queryByText('alm.overview.moduleScoring.highest')).not.toBeInTheDocument();
      expect(screen.queryByText('alm.overview.moduleScoring.latest')).not.toBeInTheDocument();
    });

    it('does not load highest or latest scoring labels when module scoring is not defined', () => {
      renderWithIntl(
        <PrimeModuleItem
          {...defaultProps}
          loResource={{
            ...mockLoResource,
            multipleAttemptEnabled: true,
            multipleAttempt: { maxAttemptCount: 3, infiniteAttempts: false },
          }}
        />
      );
      expect(screen.queryByText('alm.overview.moduleScoring.highest')).not.toBeInTheDocument();
      expect(screen.queryByText('alm.overview.moduleScoring.latest')).not.toBeInTheDocument();
    });
  });

  describe('Session location geography (line 3)', () => {
    // A classroom module with session details renders the location block.
    const classroomResource = {
      ...mockResource,
      contentType: 'Classroom',
      dateStart: '2024-01-01T10:00:00Z',
      completionDeadline: '2024-01-01T11:00:00Z',
      room: {
        roomName: 'Berlin Workshop Hall',
        roomInfo: 'Main workshop space',
        city: 'Munich',
        countryName: 'Germany',
        stateName: 'Bavaria',
        url: 'https://rooms.example.com/berlin',
      },
    };
    const classroomLoResource = { ...mockLoResource, resourceType: 'Classroom' };

    const renderClassroom = () => {
      mockUseResource.mockReturnValue(classroomResource);
      renderWithIntl(<PrimeModuleItem {...defaultProps} loResource={classroomLoResource} />);
    };

    it('renders the country > state > city breadcrumb when structured location is enabled', () => {
      mockIsStructuredLocationEnabled.mockReturnValue(true);
      renderClassroom();
      expect(screen.getByText('Germany > Bavaria > Munich')).toBeInTheDocument();
    });

    it('renders only the city when structured location is disabled', () => {
      mockIsStructuredLocationEnabled.mockReturnValue(false);
      renderClassroom();
      expect(screen.getByText('Munich')).toBeInTheDocument();
      expect(screen.queryByText(/Germany >/)).not.toBeInTheDocument();
    });

    it('hides the geography line when there is no location data', () => {
      mockIsStructuredLocationEnabled.mockReturnValue(true);
      mockUseResource.mockReturnValue({
        ...classroomResource,
        room: { roomName: 'Berlin Workshop Hall', roomInfo: '', city: '', url: '' },
      });
      renderWithIntl(<PrimeModuleItem {...defaultProps} loResource={classroomLoResource} />);
      // Room block still renders (room name shown) but no geography row.
      expect(screen.getByText('Berlin Workshop Hall')).toBeInTheDocument();
      expect(screen.queryByText(/Munich|Germany/)).not.toBeInTheDocument();
    });

    it('renders the room block without crashing when structured location is off and no city', () => {
      // Legacy account, room has no city → geography row hidden, no error.
      mockIsStructuredLocationEnabled.mockReturnValue(false);
      mockUseResource.mockReturnValue({
        ...classroomResource,
        room: { roomName: 'Berlin Workshop Hall', roomInfo: 'Main space', city: '', url: '' },
      });
      renderWithIntl(<PrimeModuleItem {...defaultProps} loResource={classroomLoResource} />);
      expect(screen.getByText('Berlin Workshop Hall')).toBeInTheDocument();
      expect(screen.queryByText(/Germany >/)).not.toBeInTheDocument();
    });
  });

  describe('Credit duration', () => {
    // Credit duration is gated by the account-level enableCreditDuration flag.
    // For a classroom/VC module with session details it renders inside the sessions
    // metadata template (with the credit-duration icon); for every other module type
    // it renders as a compact line (no icon) beside the module duration.
    const withCreditDurationFlag = (enabled: boolean) =>
      mockUseUserContext.mockReturnValue({
        user: { ...mockUser, account: { ...mockUser.account, enableCreditDuration: enabled } },
      });

    const classroomResource = {
      ...mockResource,
      contentType: 'Classroom',
      dateStart: '2024-01-01T10:00:00Z',
      completionDeadline: '2024-01-01T11:00:00Z',
    };
    const classroomLoResource = { ...mockLoResource, resourceType: 'Classroom' };

    describe('when enableCreditDuration is on', () => {
      beforeEach(() => withCreditDurationFlag(true));

      it('renders the session credit duration block when creditDuration is greater than zero', () => {
        mockUseResource.mockReturnValue(classroomResource);

        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...classroomLoResource, creditDuration: 60 }}
          />
        );

        expect(screen.getByTestId('credit-duration-svg')).toBeInTheDocument();
        expect(screen.getByText('alm.overview.session.creditDuration.header')).toBeInTheDocument();
        expect(screen.getByText('60')).toBeInTheDocument();
      });

      it('renders the credit duration when creditDuration is zero (zero is a valid value)', () => {
        mockUseResource.mockReturnValue(classroomResource);

        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...classroomLoResource, creditDuration: 0 }}
          />
        );

        expect(screen.getByTestId('credit-duration-svg')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });

      it('renders the compact credit duration for a self-paced (elearning) module', () => {
        // Elearning has no sessions metadata template, so credit duration appears as
        // the compact line beside the duration — without the session icon.
        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...mockLoResource, resourceType: ELEARNING, creditDuration: 45 }}
          />
        );

        const compact = document.querySelector('[data-automationid="Test Module-creditDuration"]');
        expect(compact).not.toBeNull();
        expect(compact!.textContent).toContain('45');
        expect(screen.queryByTestId('credit-duration-svg')).not.toBeInTheDocument();
      });

      it('does not render the credit duration when creditDuration is not set', () => {
        mockUseResource.mockReturnValue(classroomResource);

        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...classroomLoResource, creditDuration: undefined }}
          />
        );

        expect(screen.queryByTestId('credit-duration-svg')).not.toBeInTheDocument();
        expect(
          document.querySelector('[data-automationid="Test Module-creditDuration"]')
        ).toBeNull();
      });

      it('renders the compact credit duration for a classroom/VC module without session details', () => {
        // isClassroomOrVC && !hasSessionDetails: getSessionsTemplate bails out early and
        // renders '', so the compact block (guarded on the inverse condition) must be
        // the one to fill in here — the trickiest edge of the two mutually exclusive
        // render paths.
        mockUseResource.mockReturnValue({
          ...classroomResource,
          dateStart: null,
          completionDeadline: null,
        });

        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...classroomLoResource, creditDuration: 45 }}
          />
        );

        const compact = document.querySelector('[data-automationid="Test Module-creditDuration"]');
        expect(compact).not.toBeNull();
        expect(compact!.textContent).toContain('45');
        expect(screen.queryByTestId('credit-duration-svg')).not.toBeInTheDocument();
      });
    });

    describe('when enableCreditDuration is off', () => {
      beforeEach(() => withCreditDurationFlag(false));

      it('does not render the session credit duration even when creditDuration is set', () => {
        mockUseResource.mockReturnValue(classroomResource);

        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...classroomLoResource, creditDuration: 60 }}
          />
        );

        expect(screen.queryByTestId('credit-duration-svg')).not.toBeInTheDocument();
      });

      it('does not render the compact credit duration for a self-paced module even when creditDuration is set', () => {
        renderWithIntl(
          <PrimeModuleItem
            {...defaultProps}
            loResource={{ ...mockLoResource, resourceType: ELEARNING, creditDuration: 45 }}
          />
        );

        expect(
          document.querySelector('[data-automationid="Test Module-creditDuration"]')
        ).toBeNull();
      });
    });
  });
});
