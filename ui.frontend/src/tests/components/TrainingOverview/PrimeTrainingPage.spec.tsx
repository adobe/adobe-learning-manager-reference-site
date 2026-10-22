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
import PrimeTrainingPage from '@components/TrainingOverview/PrimeTrainingPage/PrimeTrainingPage';
import { PrimeLearningObject, PrimeLearningObjectInstance } from '@models/PrimeModels';

// ─── Store mock ──────────────────────────────────────────────────────────────

jest.mock('../../../store/APIStore', () => ({
  __esModule: true,
  default: {
    getState() {
      return { fileUpload: { uploadProgress: 0, fileName: '' }, appState: { downloadProgress: {}, appMode: 'normal' } };
    },
  },
}));

// ─── Hook mocks ──────────────────────────────────────────────────────────────

jest.mock('@hooks/catalog/useTrainingPage', () => ({
  useTrainingPage: jest.fn(),
}));

jest.mock('@hooks/feedback/useFeedback', () => ({
  useFeedback: jest.fn(() => ({
    feedbackTrainingId: '',
    playerLaunchTimeStamp: 0,
    shouldLaunchFeedback: false,
    handleL1FeedbackLaunch: jest.fn(),
    notificationId: '',
    fetchCurrentLo: jest.fn(),
    getFilteredNotificationForFeedback: jest.fn(),
    submitL1Feedback: jest.fn(),
    closeFeedbackWrapper: jest.fn(),
  })),
}));

jest.mock('@hooks/profile/useProfile', () => ({
  useProfile: () => ({ updateProfileSettings: jest.fn() }),
}));

// ─── Utility mocks ───────────────────────────────────────────────────────────

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    trainingOverviewPath: '/training-overview',
    instancePath: '/instance',
    hideBackButton: false,
  })),
  getALMObject: jest.fn(() => ({
    navigateToInstancePage: jest.fn(),
    navigateToTrainingOverviewPage: jest.fn(),
    storage: { getItem: jest.fn(() => ({})), setItem: jest.fn(), removeItem: jest.fn() },
  })),
  getALMUser: jest.fn(() => Promise.resolve({ user: { id: 'user1' } })),
  getItemFromStorage: jest.fn(),
  removeItemFromStorage: jest.fn(),
  getPathParams: jest.fn(() => ({ trainingId: 'training1', trainingInstanceId: 'instance1' })),
  getQueryParamsFromUrl: jest.fn(() => ({})),
  getTokenForNativeExtensions: jest.fn(() => 'token123'),
  sendEvent: jest.fn(),
  customEncode: (str: string) => str || 'default-id',
}));

jest.mock('@utils/hooks', () => ({
  getCoursesInsideFlexLP: jest.fn(() => []),
  getEnrolledInstancesCount: jest.fn(() => 0),
  getEnrollment: jest.fn(() => null),
  hasFlexibleChildLP: jest.fn(() => false),
  hasSingleActiveInstance: jest.fn(() => true),
  isEnrolledInAutoInstance: jest.fn(() => false),
  useLocalizedMetaData: jest.fn(),
}));

jest.mock('@utils/overview', () => ({
  getPreferredLocalizedMetadata: (metadata: any, locale: string) => metadata[0] || {},
  checkIsEnrolled: jest.fn(() => false),
  arePrerequisitesEnforcedAndCompleted: jest.fn(() => true),
}));

jest.mock('@utils/translationService', () => ({
  getPreferredLocalizedMetadata: (metadata: any) => metadata[0] || {},
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
  GetTranslationReplaced: (key: string) => key,
}));

jest.mock('@utils/lo-utils', () => ({
  getTrainingTypeLabel: () => 'Course',
  doesFirstTrainingHavePrerequisites: () => ({ hasPrerequisites: false, trainingType: 'course' }),
  doesLPHaveActiveInstance: jest.fn(() => true),
  areAllMandatoryCoursesCompleted: jest.fn(() => true),
  getTrainingLink: jest.fn(() => 'https://example.com/training/training1'),
}));

jest.mock('@utils/dateTime', () => ({
  calculateSecondsToTime: jest.fn(() => '2h 0m'),
  modifyTimeDDMMYY: jest.fn(() => '01-01-2024'),
}));

jest.mock('@utils/inline_svg', () => ({
  CLOCK_SVG: () => <span data-testid="clock-svg" />,
  FILE_UPLOADED_ICON: () => <span data-testid="file-uploaded-icon" />,
  SOCIAL_CANCEL_SVG: () => <span data-testid="cancel-svg" />,
  ALTERNATE_COMPLETION_ICON: () => <span data-testid="alternate-completion-icon" />,
  ALTERNATE_LO_SECTION_ICON: () => <span data-testid="alternate-lo-section-icon" />,
}));

jest.mock('@utils/native-extensibility', () => ({
  EXTENSION_LAUNCH_TYPE: { IN_APP: 'IN_APP', SAME_TAB: 'SAME_TAB', NEW_TAB: 'NEW_TAB' },
  getExtensionAppUrl: jest.fn(),
  getParsedJwt: jest.fn(),
  InvocationType: { LEARNER_ENROLL: 'LEARNER_ENROLL' },
  openExtensionInNewTab: jest.fn(),
  openExtensionInSameTab: jest.fn(),
  removeExtraQPFromExtension: jest.fn(),
}));

jest.mock('@utils/uploadUtils', () => ({
  cancelUploadFile: jest.fn(),
  getUploadInfo: jest.fn(() => Promise.resolve()),
  uploadFile: jest.fn(() => Promise.resolve('https://example.com/uploaded-file.pdf')),
}));

jest.mock('@utils/catalog', () => ({
  splitStringIntoArray: jest.fn((str: string, sep: string) => str.split(sep)),
}));

jest.mock('@utils/widgets/windowWrapper', () => ({
  GetPrimeObj: jest.fn(() => ({ _playerLaunchTimeStamp: 0 })),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
    locale: 'en-US',
  }),
}));

// ─── Context mocks ────────────────────────────────────────────────────────────

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({
    user: {
      id: 'user1',
      name: 'Test User',
      account: { id: 'account1', name: 'Test Account', enableECommerce: false },
      contentLocale: 'en-US',
    },
  }),
}));

jest.mock('@contextProviders/DeviceContextProvider', () => ({
  useDeviceTypeContext: () => ({ isDesktop: true, isMobile: false, isTablet: false }),
}));

jest.mock('@common/Alert/useAlert', () => ({
  useAlert: () => [jest.fn()],
}));

// ─── Child component stubs ────────────────────────────────────────────────────

jest.mock('@components/Common/ALMLoader', () => ({
  ALMLoader: () => <div data-testid="alm-loader" />,
}));

jest.mock('@components/Common/ALMErrorBoundary', () => ({
  ALMErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock('@components/TrainingOverview/PrimeTrainingOverviewHeader', () => ({
  PrimeTrainingOverviewHeader: ({ title }: any) => (
    <div data-testid="training-overview-header">{title}</div>
  ),
}));

jest.mock('@components/TrainingOverview/PrimeCourseOverview', () => ({
  PrimeCourseOverview: () => <div data-testid="prime-course-overview" />,
}));

jest.mock('@components/TrainingOverview/PrimeTrainingItemContainerHeader', () => ({
  PrimeTrainingItemContainerHeader: ({ name }: any) => (
    <div data-testid={`prerequisite-item-${name}`}>{name}</div>
  ),
}));

jest.mock('../../../almLib/components/TrainingOverview/PrimeTrainingPageMetadata/PrimeTrainingPageMetaData', () => ({
  __esModule: true,
  default: () => <div data-testid="training-page-metadata" />,
}));

jest.mock('../../../almLib/components/TrainingOverview/PrimeTrainingOverview/PrimeTrainingOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="training-overview" />,
}));

jest.mock('../../../almLib/components/Common/ALMBackButton', () => ({
  ALMBackButton: () => <button data-testid="alm-back-button">Back</button>,
}));

jest.mock('../../../almLib/components/GamificationModal/GamificationModal', () => ({
  __esModule: true,
  default: ({ awardedPoints }: any) => (
    <div data-testid="gamification-modal">{awardedPoints} points</div>
  ),
}));

jest.mock('../../../almLib/components/ALMFeedback', () => ({
  PrimeFeedbackWrapper: () => <div data-testid="feedback-wrapper" />,
}));

jest.mock('../../../almLib/components/Common/ALMExtensionIframeDialog', () => ({
  ALMExtensionIframeDialog: () => <div data-testid="extension-iframe-dialog" />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeCourse = (overrides: any = {}): PrimeLearningObject =>
  ({
    id: 'training1',
    loType: 'course',
    localizedMetadata: [{ locale: 'en-US', name: 'Test Training', description: 'Test Desc', overview: 'Test Overview' }],
    enrollment: null,
    instances: [{ id: 'instance1', state: 'ACTIVE', localizedMetadata: [{ locale: 'en-US', name: 'Instance 1' }] }],
    duration: 7200,
    hasPreview: true,
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

const makeInstance = (overrides: any = {}): PrimeLearningObjectInstance =>
  ({
    id: 'instance1',
    state: 'ACTIVE',
    localizedMetadata: [{ locale: 'en-US', name: 'Instance 1' }],
    isFlexible: false,
    loResources: [],
    ...overrides,
  } as any);

const createMockHookReturn = (overrides: any = {}) => ({
  name: 'Test Training',
  description: 'Test Description',
  overview: 'Test Overview',
  richTextOverview: '<p>Rich Text Overview</p>',
  color: '#007bff',
  bannerUrl: '',
  skills: [],
  training: makeCourse(),
  trainingInstance: makeInstance(),
  isLoading: false,
  instanceBadge: {},
  instanceSummary: {},
  enrollmentHandler: jest.fn(() => Promise.resolve()),
  launchPlayerHandler: jest.fn(),
  updateEnrollmentHandler: jest.fn(),
  unEnrollmentHandler: jest.fn(() => Promise.resolve()),
  jobAidClickHandler: jest.fn(),
  addToCartHandler: jest.fn(() => Promise.resolve()),
  addToCartNativeHandler: jest.fn(() => Promise.resolve()),
  buyNowNativeHandler: jest.fn(() => Promise.resolve()),
  isPreviewEnabled: true,
  isFlexLPValidationEnabled: false,
  alternateLanguages: Promise.resolve([]),
  updateFileSubmissionUrl: jest.fn(),
  updateRating: jest.fn(),
  updateBookMark: jest.fn(() => Promise.resolve()),
  notes: [],
  relatedCourses: [],
  relatedLPs: [],
  sourceAlternateLOs: [],
  sourceAlternateLoCount: 0,
  loadAllSourceAlternateLOs: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  trainingOverviewAttributes: { showDescription: 'true', showAuthorInfo: 'true', showEnrollDeadline: 'true' },
  updateCertificationProofUrl: jest.fn(() => Promise.resolve('https://example.com/proof.pdf')),
  downloadNotes: jest.fn(),
  sendNotesOnMail: jest.fn(),
  lastPlayingLoResourceId: '',
  lastPlayingCourseId: '',
  lastPlayingCourseInstanceId: '',
  waitlistPosition: '',
  setSelectedInstanceInfo: jest.fn(),
  courseInstanceMapping: {},
  flexLpEnrollHandler: jest.fn(),
  setInstancesForFlexLPOnLoad: jest.fn(),
  setSelectedLoList: jest.fn(),
  selectedLoList: {},
  setCourseInstanceMapping: jest.fn(),
  updatePlayerLoState: jest.fn(),
  enrollViaModuleClick: [],
  setEnrollViaModuleClick: jest.fn(),
  isRegisterInterestEnabled: false,
  registerInterestHandler: jest.fn(),
  awardedPoints: 0,
  updateLearningObject: jest.fn(() => Promise.resolve({ enrollment: { progressPercent: 100 } })),
  isCourseEnrollable: true,
  isCourseEnrolled: false,
  discussionUtils: {},
  courseInstanceMap: {},
  shouldShowAlternateCompletionBanner: false,
  alternateLo: null,
  alternateLoName: '',
  getNotes: jest.fn(),
  isLoadingNotes: false,
  ...overrides,
});

const renderComponent = (props: any = {}) =>
  render(
    <SpectrumProvider theme={defaultTheme}>
      <IntlProvider locale="en" messages={{}}>
        <PrimeTrainingPage trainingId="training1" trainingInstanceId="instance1" {...props} />
      </IntlProvider>
    </SpectrumProvider>
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PrimeTrainingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Restore @utils/hooks jest.fn() implementations (cleared by resetMocks:true)
    const hooks = require('@utils/hooks');
    hooks.hasSingleActiveInstance.mockReturnValue(true);
    hooks.getEnrolledInstancesCount.mockReturnValue(0);
    hooks.getEnrollment.mockReturnValue(null);
    hooks.hasFlexibleChildLP.mockReturnValue(false);
    hooks.getCoursesInsideFlexLP.mockReturnValue([]);
    hooks.isEnrolledInAutoInstance.mockReturnValue(false);

    // Restore @utils/overview
    const overview = require('@utils/overview');
    overview.checkIsEnrolled.mockReturnValue(false);
    overview.arePrerequisitesEnforcedAndCompleted.mockReturnValue(true);

    // Restore @utils/lo-utils
    const loUtils = require('@utils/lo-utils');
    loUtils.doesLPHaveActiveInstance.mockReturnValue(true);
    loUtils.areAllMandatoryCoursesCompleted.mockReturnValue(true);

    // Restore @utils/global
    const global = require('@utils/global');
    global.getALMConfig.mockReturnValue({
      trainingOverviewPath: '/training-overview',
      instancePath: '/instance',
      hideBackButton: false,
    });
    global.getALMObject.mockReturnValue({
      navigateToInstancePage: jest.fn(),
      navigateToTrainingOverviewPage: jest.fn(),
      storage: { getItem: jest.fn(() => ({})), setItem: jest.fn(), removeItem: jest.fn() },
    });

    // Restore @hooks/feedback/useFeedback
    const { useFeedback } = require('@hooks/feedback/useFeedback');
    useFeedback.mockReturnValue({
      feedbackTrainingId: '',
      playerLaunchTimeStamp: 0,
      shouldLaunchFeedback: false,
      handleL1FeedbackLaunch: jest.fn(),
      notificationId: '',
      fetchCurrentLo: jest.fn(),
      getFilteredNotificationForFeedback: jest.fn(),
      submitL1Feedback: jest.fn(),
      closeFeedbackWrapper: jest.fn(),
    });

    // Restore useTrainingPage
    const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
    useTrainingPage.mockReturnValue(createMockHookReturn());
  });

  describe('Loading State', () => {
    it('isLoading_true_loaderShownContentHidden', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ isLoading: true }));
      renderComponent();
      expect(screen.getByTestId('alm-loader')).toBeInTheDocument();
      expect(screen.queryByTestId('alm-back-button')).toBeNull();
    });
  });

  describe('Back Button', () => {
    it('backButton_hideBackButtonFalse_shown', () => {
      renderComponent();
      expect(screen.getByTestId('alm-back-button')).toBeInTheDocument();
    });

    it('backButton_hideBackButtonTrue_hidden', () => {
      const global = require('@utils/global');
      global.getALMConfig.mockReturnValue({
        trainingOverviewPath: '/training-overview',
        hideBackButton: true,
      });
      renderComponent();
      expect(screen.queryByTestId('alm-back-button')).toBeNull();
    });
  });

  describe('Description', () => {
    it('description_showDescriptionTrue_overviewRendered', () => {
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Training-overview"]')).toBeInTheDocument();
    });

    it('description_showDescriptionFalse_overviewHidden', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(
        createMockHookReturn({ trainingOverviewAttributes: { showDescription: 'false' } })
      );
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Training-overview"]')).toBeNull();
    });

    it('description_noRichTextOrOverview_fallbackShown', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(
        createMockHookReturn({ richTextOverview: '', overview: '' })
      );
      const { container } = renderComponent();
      const overviewEl = container.querySelector('[data-automationid="Test Training-overview"]');
      expect(overviewEl?.innerHTML).toContain('alm.no.description.available');
    });
  });

  describe('Duration', () => {
    it('duration_learningProgram_durationSectionShown', () => {
      // sections must be non-null with valid loIds (sections.map is called without optional chaining for LP)
      const lpTraining = makeCourse({
        loType: 'learningProgram',
        sections: [{ loIds: ['sub1'], localizedMetadata: [], mandatory: true, mandatoryLOCount: 1 }],
        subLOs: [makeCourse({ id: 'sub1' })],
      });
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training: lpTraining }));
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Training-duration"]')).toBeInTheDocument();
    });

    it('duration_course_durationSectionHidden', () => {
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="Test Training-duration"]')).toBeNull();
    });

    it('should strip moduleId query param from trainingId when path param contains it', () => {
      const mockGlobal = jest.requireMock('@utils/global');
      const origGetPathParams = mockGlobal.getPathParams;
      mockGlobal.getPathParams = () => ({
        trainingId: 'training1?moduleId=12345',
        trainingInstanceId: 'instance1',
      });

      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      renderComponent({ trainingId: undefined, trainingInstanceId: undefined });

      const lastCallArgs = (useTrainingPage as jest.Mock).mock.calls.slice(-1)[0];
      expect(lastCallArgs[0]).toBe('training1');

      mockGlobal.getPathParams = origGetPathParams;
    });
  });

  describe('Gamification', () => {
    it('gamification_awardedPointsZero_modalHidden', () => {
      renderComponent();
      expect(screen.queryByTestId('gamification-modal')).toBeNull();
    });

    it('gamification_awardedPointsGreaterThanZero_modalShown', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ awardedPoints: 100 }));
      renderComponent();
      expect(screen.getByTestId('gamification-modal')).toBeInTheDocument();
    });
  });

  describe('Feedback Wrapper', () => {
    it('shouldLaunchFeedback_false_wrapperNotShown', () => {
      renderComponent();
      expect(screen.queryByTestId('feedback-wrapper')).toBeNull();
    });

    it('shouldLaunchFeedback_true_wrapperShown', () => {
      const { useFeedback } = require('@hooks/feedback/useFeedback');
      useFeedback.mockReturnValue({
        feedbackTrainingId: 'training1',
        playerLaunchTimeStamp: 1000,
        shouldLaunchFeedback: true,
        handleL1FeedbackLaunch: jest.fn(),
        notificationId: '',
        fetchCurrentLo: jest.fn(),
        getFilteredNotificationForFeedback: jest.fn(),
        submitL1Feedback: jest.fn(),
        closeFeedbackWrapper: jest.fn(),
      });
      renderComponent();
      expect(screen.getByTestId('feedback-wrapper')).toBeInTheDocument();
    });
  });

  describe('Alternate Completion Banner', () => {
    it('alternateCompletionBanner_disabled_bannerHidden', () => {
      renderComponent();
      expect(screen.queryByTestId('alternate-completion-icon')).toBeNull();
    });

    it('alternateCompletionBanner_enabled_bannerShown', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(
        createMockHookReturn({ shouldShowAlternateCompletionBanner: true })
      );
      renderComponent();
      expect(screen.getByTestId('alternate-completion-icon')).toBeInTheDocument();
      expect(screen.getByText('text.completedViaAlternate')).toBeInTheDocument();
    });

    it('alternateCompletionBanner_moreInfoToggle_changesButtonLabel', () => {
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(
        createMockHookReturn({ shouldShowAlternateCompletionBanner: true })
      );
      renderComponent();
      const toggleButton = screen.getByText('text.moreInformation');
      fireEvent.click(toggleButton);
      expect(screen.getByText('text.showLess')).toBeInTheDocument();
      expect(screen.queryByText('text.moreInformation')).toBeNull();
    });
  });

  describe('Certificate Proof Upload', () => {
    it('externalCert_enrolled_fileUploadSectionShown', () => {
      const externalCert = makeCourse({
        loType: 'certification',
        isExternal: true,
        completionDateSameAsApprovalDate: true,
        sections: undefined, // avoids getFirstChildId crash on empty sections[]
        subLOs: undefined,
      });
      const enrollment = { state: 'ENROLLED', url: null, progressPercent: 0 } as any;
      const hooks = require('@utils/hooks');
      hooks.getEnrollment.mockReturnValue(enrollment);
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training: externalCert }));
      const { container } = renderComponent();
      expect(
        container.querySelector('[data-automationid="Test Training-file-submission"]')
      ).toBeInTheDocument();
    });

    it('externalCert_pendingApproval_awaitingApprovalSectionShown', () => {
      const externalCert = makeCourse({
        loType: 'certification',
        isExternal: true,
        completionDateSameAsApprovalDate: true,
        sections: undefined, // avoids getFirstChildId crash on empty sections[]
        subLOs: undefined,
      });
      const enrollment = { state: 'PENDING_APPROVAL', url: 'https://example.com/proof.pdf', progressPercent: 0 } as any;
      const hooks = require('@utils/hooks');
      hooks.getEnrollment.mockReturnValue(enrollment);
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training: externalCert }));
      const { container } = renderComponent();
      expect(
        container.querySelector('[data-automationid="Test Training-awaiting-approval"]')
      ).toBeInTheDocument();
    });
  });

  describe('Prerequisite Label', () => {
    it('prerequisiteLOs_null_labelHidden', () => {
      const training = makeCourse({ prerequisiteLOs: null });
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training }));
      renderComponent();
      expect(screen.queryByText('alm.training.overviewPrequisite.courses.label')).toBeNull();
    });

    it('prerequisiteLOs_course_coursePrerequisiteLabelShown', () => {
      const prereqLO = makeCourse({
        id: 'prereq1',
        localizedMetadata: [{ locale: 'en-US', name: 'Prereq Course', description: '', overview: '' }],
        instances: [{ id: 'prereq-inst1', state: 'ACTIVE', localizedMetadata: [] }],
      });
      const training = makeCourse({ loType: 'course', prerequisiteLOs: [prereqLO] });
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training }));
      renderComponent();
      expect(screen.getByText('alm.training.overviewPrequisite.courses.label')).toBeInTheDocument();
    });

    it('prerequisiteLOs_expired_filteredOut', () => {
      const expiredPrereq = makeCourse({
        id: 'prereq1',
        state: 'Expired', // EXPIRED constant value from constants.ts
        localizedMetadata: [{ locale: 'en-US', name: 'Expired Course', description: '', overview: '' }],
        instances: [{ id: 'prereq-inst1', state: 'ACTIVE', localizedMetadata: [] }],
      });
      const training = makeCourse({ prerequisiteLOs: [expiredPrereq] });
      const { useTrainingPage } = require('@hooks/catalog/useTrainingPage');
      useTrainingPage.mockReturnValue(createMockHookReturn({ training }));
      renderComponent();
      expect(screen.queryByTestId('prerequisite-item-Expired Course')).toBeNull();
    });
  });
});
