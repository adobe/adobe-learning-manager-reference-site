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
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PrimeTrainingPageMetaData from '@components/TrainingOverview/PrimeTrainingPageMetadata/PrimeTrainingPageMetaData';

// ─── Redux store ─────────────────────────────────────────────────────────────

const mockStore = createStore((state: any = {}) => state, {
  appState: { downloadProgress: [], appMode: 'ONLINE' },
});

// ─── window.ALM (must be set before component import resolution) ──────────────

const mockALMConfig = {
  guest: false,
  trainingOverviewPath: '/training',
  instancePath: '/instance',
  usageType: 'SELF',
  learnerDesktopApp: false,
  learnerMobileApp: false,
  handleLinkedInContentExternally: false,
  handleShareExternally: false,
  accountId: 'test-account-id',
  baseUrl: 'https://test.example.com',
  locale: 'en-US',
  accessToken: 'test-token',
  csrfToken: 'test-csrf',
  almBaseURL: 'https://test.example.com',
  primeApiURL: 'https://test.example.com/primeapi/v2',
};

// Referenced by the delete-personalized-path success flow (setTimeout(() =>
// getALMObject().navigateToHomePage(), 300)); declared here so the "delete path" test
// below can flush and assert on it deterministically instead of leaking a real timer.
const mockNavigateToHomePage = jest.fn();

Object.defineProperty(window, 'ALM', {
  value: {
    getALMConfig: () => mockALMConfig,
    getAccessToken: () => 'test-token',
    getCsrfToken: () => 'test-csrf',
    isPrimeUserLoggedIn: () => true,
    handleLogOut: () => {},
    storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    ALMConfig: mockALMConfig,
    navigateToHomePage: mockNavigateToHomePage,
  },
  writable: true,
  configurable: true,
});

// ─── Child component stubs ────────────────────────────────────────────────────

jest.mock('@components/StarRatingSubmitDialog', () => ({
  StarRatingSubmitDialog: () => <div data-testid="star-rating-dialog" />,
}));

jest.mock('@components/Common/ALMTooltip', () => ({
  ALMTooltip: ({ message }: any) => <span data-testid="tooltip">{message}</span>,
}));

jest.mock('@components/ALMPopup', () => ({
  ALMPopup: ({ children, isOpen }: any) =>
    isOpen ? <div data-testid="popup">{children}</div> : null,
  ALMPopupContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@components/TrainingOverview/PrimeTrainingPageExtraDetailsJobAids', () => ({
  PrimeTrainingPageExtraJobAid: () => <div data-testid="job-aid" />,
}));

jest.mock('@components/TrainingOverview/PrimeTrainingRelatedLoList', () => ({
  PrimeTrainingRelatedLoList: () => <div data-testid="related-lo-list" />,
}));

jest.mock('@components/ALMLpLeaderBoard', () => ({
  PrimeLoLeaderBoard: () => <div data-testid="leaderboard" />,
}));

jest.mock('@components/SessionConflict/SessionConflictDialog', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ─── Context mocks ────────────────────────────────────────────────────────────

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({
    user: {
      id: 'user123',
      contentLocale: 'en-US',
      enrollOnClick: false,
      account: {
        id: 'account123',
        shouldPreReqConsiderPassStatus: false,
        enableECommerce: false,
        multiItemCartEnabled: false,
        enableOffline: false,
      },
    },
  }),
}));

jest.mock('@contextProviders/DeviceContextProvider', () => ({
  useDeviceTypeContext: () => ({ isDesktop: true, isTablet: false, isMobile: false }),
}));

// ─── Hook / utility mocks ─────────────────────────────────────────────────────

jest.mock('@hooks', () => ({
  ...jest.requireActual('@hooks'),
  useProfile: () => ({ updateProfileSettings: jest.fn() }),
}));

jest.mock('@common/Alert/useAlert', () => ({
  useAlert: () => [jest.fn()],
}));

const mockConfirmationAlert = jest.fn();
jest.mock('@common/Alert/useConfirmationAlert', () => ({
  useConfirmationAlert: () => [mockConfirmationAlert],
  VariantType: { WARNING: 'warning', ERROR: 'error' },
}));

jest.mock('@utils/hooks', () => ({
  useCanShowRating: () => false,
  filterLoReourcesBasedOnResourceType: () => [],
  hasSingleActiveInstance: jest.fn(() => true),
  getEnrolledInstancesCount: () => 0,
  getEnrollment: jest.fn(() => null),
  isEnrolledInAutoInstance: () => false,
  getCoursesInsideFlexLP: () => [],
  getCourseInstanceMapping: () => ({}),
  checkIfEntityIsValid: () => false,
  getConflictingSessions: jest.fn(() => Promise.resolve([])),
  isValidSubLoForFlexLpToLaunch: () => false,
  isEnrolledInstanceAutoInstance: () => false,
  getTrainingUrl: (url: string) => url,
}));

jest.mock('@utils/global', () => {
  const actual = jest.requireActual('@utils/global');
  return {
    ...actual,
    getALMAccount: () =>
      Promise.resolve({
        id: 'account123',
        multiItemCartEnabled: false,
        enableECommerce: false,
        enableOffline: false,
        contentLocales: [],
        extensions: [],
      }),
    sendEvent: jest.fn(),
  };
});

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationReplaced: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
  getPreferredLocalizedMetadata: (items: any[]) => items?.[0] || {},
}));

jest.mock('@utils/overview', () => ({
  arePrerequisitesEnforcedAndCompleted: () => true,
  checkIsEnrolled: jest.fn(() => false),
  storeActionInNonLoggedMode: jest.fn(),
  notifyParentToCleanModuleParams: jest.fn(),
}));

jest.mock('@utils/lo-utils', () => ({
  getTrainingTypeLabel: () => 'Course',
  shouldResetAttempt: () => false,
  shouldShowContinueButton: () => false,
  shouldShowOnlyExternalAuthor: () => false,
  subLoHasResources: () => false,
  getTrainingLink: () => 'https://test.com',
  doesFirstTrainingHavePrerequisites: () => ({ hasPrerequisites: false, trainingType: 'course' }),
  getAllCoreContentModulesOfTraining: () => [],
  getAllCoursesOfTraining: () => [],
  getAllJobAidsInTraining: () => [],
  getAllPreviewableModules: () => [],
  getSectionLOsOrder: () => [],
  courseIsNotCrVcOrTimingEnabled: () => true,
  disableStart: () => false,
  findSubLoToLaunchForFlexLp: () => ({}),
  getFirstSubLoOfParentLo: (lo: any) => lo,
  isReattemptAllowed: () => true,
  isRevisitAllowed: () => true,
  getCourseIdAndInstanceIdFromResourceId: () => ({ courseId: '', instanceId: '' }),
  getInstanceIdToLaunch: () => '',
  getModuleIdToLaunch: jest.fn().mockReturnValue(''),
}));

jest.mock('@utils/instance', () => ({
  checkIfEnrollmentDeadlineNotPassed: () => true,
  checkIfUnenrollmentDeadlinePassed: () => false,
}));

jest.mock('@utils/native-extensibility', () => ({
  InvocationType: { LEARNER_OVERVIEW: 'LEARNER_OVERVIEW', LEARNER_ENROLL: 'LEARNER_ENROLL' },
  getExtension: () => null,
  isExtensionAllowedForLO: () => false,
}));

jest.mock('@utils/price', () => ({
  getFormattedPrice: (price: any) => `$${price}`,
}));

jest.mock('@utils/dateTime', () => ({
  modifyTime: () => '01/01/2024',
  modifyTimeDDMMYY: () => '01/01/2024',
}));

jest.mock('@utils/catalog', () => ({ debounce: (fn: any) => fn }));

jest.mock('@utils/mobileAppUtils/downloadUtils', () => ({
  getDownloadLinks: () => Promise.resolve([]),
  sendDownloadContentEvent: jest.fn(),
  showDownloadButton: () => false,
}));

jest.mock('@utils/widgets/utils', () => ({ downloadFile: jest.fn() }));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeInstance = (overrides: any = {}): any => ({
  id: 'instance1',
  state: 'ACTIVE',
  localizedMetadata: [{ name: 'Default Instance', locale: 'en-US' }],
  loResources: [],
  isFlexible: false,
  seatLimit: 0,
  enrollmentDeadline: null,
  unenrollmentDeadline: null,
  completionDeadline: null,
  ...overrides,
});

const makeTraining = (overrides: any = {}): any => ({
  id: 'course1',
  loType: 'course',
  localizedMetadata: [{ name: 'Test Course', description: 'Test Desc', locale: 'en-US' }],
  enrollment: null,
  instances: [{ id: 'instance1', state: 'ACTIVE', localizedMetadata: [{ name: 'Instance 1' }] }],
  subLOs: [],
  sections: [],
  isBookmarked: false,
  hasPreview: false,
  price: 0,
  unenrollmentAllowed: true,
  instanceSwitchEnabled: false,
  multienrollmentEnabled: false,
  enrollmentType: 'SELF',
  isExternal: false,
  authorNames: [],
  supplementaryLOs: [],
  supplementaryResources: [],
  products: [],
  roles: [],
  hasOptionalLoResources: false,
  loResourceCompletionCount: 0,
  isSubLoOrderEnforced: false,
  extensionOverrides: [],
  dateCreated: '2024-01-01',
  showAggregatedResources: false,
  ...overrides,
});

const defaultProps = {
  trainingInstance: makeInstance(),
  skills: [],
  training: makeTraining(),
  badge: { badgeUrl: '' } as any,
  instanceSummary: { enrollmentCount: 0, seatLimit: 0 } as any,
  showAuthorInfo: 'true',
  showEnrollDeadline: 'true',
  enrollmentHandler: jest.fn(() => Promise.resolve({ id: 'enrollment1' })),
  flexLpEnrollHandler: jest.fn(),
  updateRating: jest.fn(() => Promise.resolve()),
  updateLearningObject: jest.fn(() => Promise.resolve({} as any)),
  updateBookMark: jest.fn(() => Promise.resolve()),
  alternateLanguages: Promise.resolve([]),
  launchPlayerHandler: jest.fn(),
  addToCartHandler: jest.fn(() => Promise.resolve({ items: [], totalQuantity: 0, error: null })),
  addToCartNativeHandler: jest.fn(() => Promise.resolve({ redirectionUrl: '', error: null })),
  buyNowNativeHandler: jest.fn(() => Promise.resolve({ redirectionUrl: '', error: null })),
  updateEnrollmentHandler: jest.fn(),
  unEnrollmentHandler: jest.fn(() => Promise.resolve()),
  jobAidClickHandler: jest.fn(),
  isPreviewEnabled: false,
  waitlistPosition: '',
  setActiveExtension: jest.fn(),
  timeBetweenAttemptEnabled: false,
  courseInstanceMapping: {},
  isFlexLPOrContainsFlexLP: false,
  areAllInstancesSelected: jest.fn(() => true),
  lastPlayingLoResourceId: '',
  lastPlayingCourseId: '',
  lastPlayingCourseInstanceId: '',
  relatedCoursesList: [],
  relatedLpList: [],
  sourceAlternateLOs: [],
  sourceAlternateLoCount: 0,
  loadAllSourceAlternateLOs: jest.fn(),
  setCourseInstanceMapping: jest.fn(),
  enrollViaModuleClick: {},
  setEnrollViaModuleClick: jest.fn(),
  isRegisterInterestEnabled: false,
  registerInterestHandler: jest.fn(),
  isCourseEnrollable: true,
  isCourseEnrolled: false,
};

const renderComponent = (props: any = {}) =>
  render(
    <Provider store={mockStore}>
      <IntlProvider locale="en-US">
        <PrimeTrainingPageMetaData {...defaultProps} {...props} />
      </IntlProvider>
    </Provider>
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PrimeTrainingPageMetaData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore jest.fn() implementations cleared by resetMocks:true
    const hooks = require('@utils/hooks');
    hooks.getEnrollment.mockReturnValue(null);
    hooks.hasSingleActiveInstance.mockReturnValue(true);

    const overview = require('@utils/overview');
    overview.checkIsEnrolled.mockReturnValue(false);

    const almHooks = require('../../../almLib/hooks');
  });

  describe('Skills Section', () => {
    it('skills_nonEmpty_skillsSectionShown', () => {
      const skills = [
        { name: 'React', levelName: 'Intermediate', level: 'INTERMEDIATE', credits: 10 },
      ];
      const { container } = renderComponent({ skills });
      expect(container.querySelector('[data-automationid="skills-achieved"]')).toBeInTheDocument();
      expect(container.querySelector('[data-automationid="React"]')).toBeInTheDocument();
    });

    it('skills_empty_skillsSectionHidden', () => {
      const { container } = renderComponent({ skills: [] });
      expect(container.querySelector('[data-automationid="skills-achieved"]')).toBeNull();
    });
  });

  describe('Badge Section', () => {
    it('badge_withBadgeUrl_badgeSectionShown', () => {
      const { container } = renderComponent({
        badge: { badgeUrl: 'https://example.com/badge.png' },
      });
      expect(container.querySelector('[data-automationid="badgeUrl"]')).toBeInTheDocument();
    });

    it('badge_noBadgeUrl_badgeSectionHidden', () => {
      const { container } = renderComponent({ badge: { badgeUrl: '' } });
      expect(container.querySelector('[data-automationid="badgeUrl"]')).toBeNull();
    });
  });

  describe('Certification Sections', () => {
    it('certification_showsCertificationTypeSections', () => {
      renderComponent({ training: makeTraining({ loType: 'certification' }) });
      expect(screen.getByText('alm.overview.certification.type')).toBeInTheDocument();
      expect(screen.getByText('alm.overview.certification.validity')).toBeInTheDocument();
    });

    it('notCertification_certificationSectionsHidden', () => {
      renderComponent({ training: makeTraining({ loType: 'course' }) });
      expect(screen.queryByText('alm.overview.certification.type')).toBeNull();
      expect(screen.queryByText('alm.overview.certification.validity')).toBeNull();
    });
  });

  describe('Author Section', () => {
    it('showAuthorInfo_true_withAuthors_authorsShown', () => {
      renderComponent({
        training: makeTraining({ authorNames: ['John Doe'] }),
        showAuthorInfo: 'true',
      });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('showAuthorInfo_false_authorsSectionHidden', () => {
      renderComponent({
        training: makeTraining({ authorNames: ['John Doe'] }),
        showAuthorInfo: 'false',
      });
      expect(screen.queryByText('John Doe')).toBeNull();
    });

    it('showAuthorInfo_true_noAuthorNames_authorsSectionHidden', () => {
      renderComponent({
        training: makeTraining({ authorNames: [] }),
        showAuthorInfo: 'true',
      });
      expect(screen.queryByText('alm.text.author(s)')).toBeNull();
    });
  });

  describe('Action Button', () => {
    it('notEnrolled_enrollable_enrollButtonShown', () => {
      renderComponent();
      // action=ENROLL_ACTION → button with actionText = formatMessage id
      expect(screen.getByText('alm.overview.button.enroll')).toBeInTheDocument();
    });

    it('courseNotEnrollable_notEnrolled_noEnrollButton', () => {
      // isCourse && !isCourseEnrollable && !isCourseEnrolled → action='' → no button
      renderComponent({ isCourseEnrollable: false, isCourseEnrolled: false });
      expect(screen.queryByText('alm.overview.button.enroll')).toBeNull();
    });
  });

  describe('Preview Button', () => {
    it('previewEnabled_hasPreview_notEnrolled_previewButtonShown', () => {
      const { container } = renderComponent({
        isPreviewEnabled: true,
        training: makeTraining({ hasPreview: true }),
      });
      expect(container.querySelector('[data-automationid="preview"]')).toBeInTheDocument();
    });

    it('previewDisabled_previewButtonHidden', () => {
      const { container } = renderComponent({ isPreviewEnabled: false });
      expect(container.querySelector('[data-automationid="preview"]')).toBeNull();
    });

    it('previewEnabled_courseEnrolled_previewButtonHidden', () => {
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);
      const { container } = renderComponent({
        isPreviewEnabled: true,
        training: makeTraining({ hasPreview: true, enrollment: { id: 'e1', state: 'STARTED' } }),
      });
      expect(container.querySelector('[data-automationid="preview"]')).toBeNull();
    });
  });

  describe('Bookmark Button', () => {
    it('enrollable_bookmarkButtonShown', () => {
      const { container } = renderComponent();
      expect(container.querySelector('[data-automationid="bookmark-status"]')).toBeInTheDocument();
    });

    it('courseNotEnrollable_bookmarkButtonHidden', () => {
      const { container } = renderComponent({
        isCourseEnrollable: false,
        isCourseEnrolled: false,
      });
      expect(container.querySelector('[data-automationid="bookmark-status"]')).toBeNull();
    });

    it('bookmarkClick_callsUpdateBookMarkWithToggledValue', () => {
      const updateBookMark = jest.fn(() => Promise.resolve());
      const { container } = renderComponent({ updateBookMark });
      const bookmarkButton = container
        .querySelector('[data-automationid="bookmark-status"]')
        ?.closest('button') as HTMLElement;
      fireEvent.click(bookmarkButton);
      // training.isBookmarked = false → toggles to true
      expect(updateBookMark).toHaveBeenCalledWith(true, 'course1');
    });
  });

  describe('Unenroll Button', () => {
    it('enrolled_unenrollAllowed_notCompleted_unenrollButtonShown', () => {
      const hooks = require('@utils/hooks');
      hooks.getEnrollment.mockReturnValue({ id: 'e1', state: 'STARTED', progressPercent: 50 });
      renderComponent({ training: makeTraining({ unenrollmentAllowed: true }) });
      expect(screen.getByText('alm.text.unenroll.course')).toBeInTheDocument();
    });

    it('notEnrolled_unenrollButtonHidden', () => {
      // getEnrollment returns null by default → canUnenroll=false
      renderComponent();
      expect(screen.queryByText('alm.text.unenroll.course')).toBeNull();
    });

    it('enrolled_completed_unenrollButtonHidden', () => {
      const hooks = require('@utils/hooks');
      hooks.getEnrollment.mockReturnValue({ id: 'e1', state: 'COMPLETED', progressPercent: 100 });
      renderComponent({ training: makeTraining({ unenrollmentAllowed: true }) });
      expect(screen.queryByText('alm.text.unenroll.course')).toBeNull();
    });
  });

  describe('Completion Deadline', () => {
    it('completionDeadline_present_deadlineSectionShown', () => {
      const { container } = renderComponent({
        trainingInstance: makeInstance({ completionDeadline: '2025-12-31T23:59:59Z' }),
      });
      expect(
        container.querySelector('[data-automationid^="completion-deadline-info"]')
      ).toBeInTheDocument();
    });

    it('completionDeadline_absent_deadlineSectionHidden', () => {
      const { container } = renderComponent({
        trainingInstance: makeInstance({ completionDeadline: null }),
      });
      expect(container.querySelector('[data-automationid^="completion-deadline-info"]')).toBeNull();
    });
  });

  describe('Who Should Attend', () => {
    it('whoShouldTake_nonEmpty_sectionShown', () => {
      renderComponent({
        training: makeTraining({ whoShouldTake: ['Developers', 'Designers'] }),
      });
      expect(screen.getByText('Developers, Designers')).toBeInTheDocument();
    });

    it('whoShouldTake_absent_sectionHidden', () => {
      renderComponent({ training: makeTraining({ whoShouldTake: undefined }) });
      expect(screen.queryByText('alm.overview.who.should.attend')).toBeNull();
    });
  });

  describe('Deep Link Auto-Play (enrollViaModuleClick with isAutoPlay)', () => {
    it('isAutoPlay_enrollOnClickFalse_enrollmentCalledWithoutDialog', async () => {
      const mockSetEnrollViaModuleClick = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        setEnrollViaModuleClick: mockSetEnrollViaModuleClick,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});
      expect(mockEnrollHandler).toHaveBeenCalled();
    });

    it('isAutoPlay_courseNotEnrollable_enrollmentNotCalled', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: false,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });

    it('enrollViaModuleClickNoId_enrollmentNotCalled', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {},
        enrollmentHandler: mockEnrollHandler,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });

    it('isAutoPlay_enrollmentError_enrollViaModuleClickCleared', async () => {
      const mockSetEnrollViaModuleClick = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.reject(new Error('enrollment_failed')));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        setEnrollViaModuleClick: mockSetEnrollViaModuleClick,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});
      expect(mockSetEnrollViaModuleClick).toHaveBeenCalledWith([]);
    });

    it('retiredInstance_isAutoPlay_enrollmentNotCalled', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        trainingInstance: {
          ...defaultProps.trainingInstance,
          state: 'Retired',
        },
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: false,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });
  });

  describe('Deep Link URL cleanup after enrollment (enrollViaModuleClick)', () => {
    afterEach(() => {
      window.location.hash = '';
    });

    it('isAutoPlay_enrollmentSuccess_playerLaunchedAndUrlCleaned', async () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=resource1';
      const mockLaunchPlayerHandler = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        launchPlayerHandler: mockLaunchPlayerHandler,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(mockLaunchPlayerHandler).toHaveBeenCalledWith({
        id: 'course1',
        moduleId: 'resource1',
        trainingInstanceId: 'instance1',
        isMultienrolled: false,
        isAutoPlay: true,
      });
      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('isAutoPlay_noModuleIdInHash_notifyParentCalled', async () => {
      // notifyParentToCleanModuleParams always fires when isAutoPlay=true, even if iframe hash has no moduleId.
      // The outer Ember URL may still have moduleId and needs to be cleaned.
      window.location.hash = '#/course/12345/instance/67890';
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });
  });

  describe('Deep Link Auto-Play (enrollViaModuleClick with isAutoPlay)', () => {
    it('should skip confirmation dialog when isAutoPlay is true and enrollOnClick is false', async () => {
      const mockSetEnrollViaModuleClick = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        setEnrollViaModuleClick: mockSetEnrollViaModuleClick,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});
      expect(mockEnrollHandler).toHaveBeenCalled();
    });

    it('should not auto-enroll when course is not enrollable', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: false,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });

    it('should not auto-enroll when enrollViaModuleClick has no id', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        enrollViaModuleClick: {},
        enrollmentHandler: mockEnrollHandler,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });

    it('should clear enrollViaModuleClick state on enrollment error', async () => {
      const mockSetEnrollViaModuleClick = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.reject(new Error('enrollment_failed')));

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        setEnrollViaModuleClick: mockSetEnrollViaModuleClick,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});
      expect(mockSetEnrollViaModuleClick).toHaveBeenCalledWith([]);
    });

    it('should not trigger enrollment when instance is retired', () => {
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));

      renderComponent({
        trainingInstance: {
          ...defaultProps.trainingInstance,
          state: 'Retired',
        },
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: false,
      });

      expect(mockEnrollHandler).not.toHaveBeenCalled();
    });
  });

  describe('Deep Link URL cleanup after enrollment (enrollViaModuleClick)', () => {
    afterEach(() => {
      window.location.hash = '';
    });

    it('should launch player and clean URL on successful auto-play enrollment', async () => {
      window.location.hash = '#/course/12345/instance/67890?moduleId=resource1';
      const mockLaunchPlayer = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        launchPlayerHandler: mockLaunchPlayer,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(mockLaunchPlayer).toHaveBeenCalledWith({
        id: 'course1',
        moduleId: 'resource1',
        trainingInstanceId: 'instance1',
        isMultienrolled: false,
        isAutoPlay: true,
      });
      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('should call notifyParentToCleanModuleParams even when no moduleId in hash', async () => {
      window.location.hash = '#/course/12345/instance/67890';
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
        },
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('should not launch player but clean URL when skipPlayerLaunch=true and isAutoPlay=true', async () => {
      const mockLaunchPlayer = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: true,
          skipPlayerLaunch: true,
        },
        launchPlayerHandler: mockLaunchPlayer,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(mockLaunchPlayer).not.toHaveBeenCalled();
      expect(overview.notifyParentToCleanModuleParams).toHaveBeenCalled();
    });

    it('should not launch player and not clean URL when skipPlayerLaunch=true and isAutoPlay=false', async () => {
      const mockLaunchPlayer = jest.fn();
      const mockEnrollHandler = jest.fn(() => Promise.resolve({ id: 'enrollment1' }));
      const overview = require('@utils/overview');
      overview.checkIsEnrolled.mockReturnValue(true);
      overview.notifyParentToCleanModuleParams.mockClear();

      renderComponent({
        enrollViaModuleClick: {
          id: 'course1',
          moduleId: 'resource1',
          instanceId: 'instance1',
          isMultienrolled: false,
          isAutoPlay: false,
          skipPlayerLaunch: true,
        },
        launchPlayerHandler: mockLaunchPlayer,
        enrollmentHandler: mockEnrollHandler,
        isCourseEnrollable: true,
      });

      await act(async () => {});

      expect(mockLaunchPlayer).not.toHaveBeenCalled();
      expect(overview.notifyParentToCleanModuleParams).not.toHaveBeenCalled();
    });
  });

  describe('Personalized Path (PLP)', () => {
    const loUtils = require('@utils/lo-utils');

    const makePlpTraining = (subLOs: any[]) => ({
      ...defaultProps.training,
      loType: 'personalizedPath',
      createdByUserId: 'user123',
      subLOs,
    });

    const subLoWith = (id: string, state: string, instanceId: string) => ({
      id,
      loType: 'course',
      enrollment: { state, loInstance: null },
      instances: [{ id: instanceId }],
    });

    beforeEach(() => {
      loUtils.getModuleIdToLaunch.mockReturnValue('module1');
    });

    describe('launchFirstIncompleteSubLoForPersonalizedPath', () => {
      beforeEach(() => {
        // PLP must be enrolled (action === CONTINUE) for the Continue button to render.
        // action is driven by getEnrollment(), not training.enrollment.
        require('@utils/hooks').getEnrollment.mockReturnValue({ id: 'plp-enroll', state: 'STARTED' });
      });

      it('launches the first incomplete sub-LO when Continue is clicked', () => {
        const mockLaunchPlayer = jest.fn();
        const training = makePlpTraining([
          subLoWith('lo1', 'COMPLETED', 'inst1'),
          subLoWith('lo2', 'STARTED', 'inst2'),
        ]);

        const { container } = renderComponent({ training, launchPlayerHandler: mockLaunchPlayer });
        const continueBtn = container.querySelector(
          '[data-automationid="alm.overview.button.continue"]'
        );
        expect(continueBtn).toBeTruthy();
        fireEvent.click(continueBtn!);

        expect(mockLaunchPlayer).toHaveBeenCalledWith({
          id: 'lo2',
          moduleId: 'module1',
          trainingInstanceId: 'inst2',
        });
      });

      it('falls back to the first sub-LO when all are completed', () => {
        const mockLaunchPlayer = jest.fn();
        const training = makePlpTraining([
          subLoWith('lo1', 'COMPLETED', 'inst1'),
          subLoWith('lo2', 'COMPLETED', 'inst2'),
        ]);

        const { container } = renderComponent({ training, launchPlayerHandler: mockLaunchPlayer });
        fireEvent.click(
          container.querySelector('[data-automationid="alm.overview.button.continue"]')!
        );

        expect(mockLaunchPlayer).toHaveBeenCalledWith({
          id: 'lo1',
          moduleId: 'module1',
          trainingInstanceId: 'inst1',
        });
      });

      it('does not call launchPlayerHandler when there are no sub-LOs', () => {
        const mockLaunchPlayer = jest.fn();
        const { container } = renderComponent({
          training: makePlpTraining([]),
          launchPlayerHandler: mockLaunchPlayer,
        });

        fireEvent.click(
          container.querySelector('[data-automationid="alm.overview.button.continue"]')!
        );
        expect(mockLaunchPlayer).not.toHaveBeenCalled();
      });

      it('does not call launchPlayerHandler when instanceId cannot be resolved', () => {
        const mockLaunchPlayer = jest.fn();
        const training = makePlpTraining([
          { id: 'lo1', loType: 'course', enrollment: null, instances: [] },
        ]);

        const { container } = renderComponent({ training, launchPlayerHandler: mockLaunchPlayer });
        fireEvent.click(
          container.querySelector('[data-automationid="alm.overview.button.continue"]')!
        );

        expect(mockLaunchPlayer).not.toHaveBeenCalled();
      });

      it('does not call launchPlayerHandler when moduleId cannot be resolved', () => {
        loUtils.getModuleIdToLaunch.mockReturnValue('');
        const mockLaunchPlayer = jest.fn();

        const { container } = renderComponent({
          training: makePlpTraining([subLoWith('lo1', 'STARTED', 'inst1')]),
          launchPlayerHandler: mockLaunchPlayer,
        });

        fireEvent.click(
          container.querySelector('[data-automationid="alm.overview.button.continue"]')!
        );
        expect(mockLaunchPlayer).not.toHaveBeenCalled();
      });
    });

    describe('Delete Path button', () => {
      it('shows Delete Path button instead of bookmark for PLPs', () => {
        const { container } = renderComponent({ training: makePlpTraining([]) });

        expect(container.querySelector('[data-automationid="delete-path"]')).toBeTruthy();
        expect(container.querySelector('[data-automationid="bookmark"]')).toBeFalsy();
      });

      it('calls deletePersonalizedPathHandler after confirmation', async () => {
        // Fake timers so the post-success setTimeout(..., 300) that navigates home is
        // flushed and asserted on here, instead of firing as a real background timer
        // that can land on — and crash — whatever test happens to run 300ms later.
        // try/finally ensures real timers are restored even if an assertion throws.
        jest.useFakeTimers();
        try {
          const mockDeleteHandler = jest.fn(() => Promise.resolve());
          mockConfirmationAlert.mockImplementation((_title, _msg, _confirm, _cancel, onConfirm) =>
            onConfirm()
          );

          const { container } = renderComponent({
            training: makePlpTraining([]),
            deletePersonalizedPathHandler: mockDeleteHandler,
          });

          const deleteBtn = container.querySelector('[data-automationid="delete-path"]');
          expect(deleteBtn).toBeTruthy();
          await act(async () => {
            fireEvent.click(deleteBtn!);
          });

          expect(mockDeleteHandler).toHaveBeenCalledWith(defaultProps.training.id);

          act(() => {
            jest.runOnlyPendingTimers();
          });
          expect(mockNavigateToHomePage).toHaveBeenCalledTimes(1);
        } finally {
          jest.useRealTimers();
        }
      });
    });

    describe('Enroll button', () => {
      const { storeActionInNonLoggedMode } = require('@utils/overview');
      const { getConflictingSessions } = require('@utils/hooks');

      it('shows Enroll button for unenrolled PLP recipient', () => {
        const training = { ...makePlpTraining([]), enrollment: null };
        const { container } = renderComponent({ training });

        const enrollBtn = container.querySelector(
          '[data-automationid="alm.overview.button.enroll"]'
        );
        expect(enrollBtn).toBeTruthy();
      });

      it('calls personalizedPathEnrollmentHandler when Enroll is clicked', async () => {
        const mockEnroll = jest.fn(() => Promise.resolve());
        const training = { ...makePlpTraining([]), enrollment: null };

        const { container } = renderComponent({
          training,
          personalizedPathEnrollmentHandler: mockEnroll,
        });

        const enrollBtn = container.querySelector(
          '[data-automationid="alm.overview.button.enroll"]'
        );
        expect(enrollBtn).toBeTruthy();
        await act(async () => {
          fireEvent.click(enrollBtn!);
        });

        expect(mockEnroll).toHaveBeenCalledWith(defaultProps.training.id);
      });

      it('calls storeActionInNonLoggedMode before enrolling', async () => {
        const mockEnroll = jest.fn(() => Promise.resolve());
        const training = { ...makePlpTraining([]), enrollment: null };

        const { container } = renderComponent({
          training,
          personalizedPathEnrollmentHandler: mockEnroll,
        });

        await act(async () => {
          fireEvent.click(
            container.querySelector('[data-automationid="alm.overview.button.enroll"]')!
          );
        });

        expect(storeActionInNonLoggedMode).toHaveBeenCalledWith('ENROLL');
      });

      it('does not call getConflictingSessions when Enroll is clicked on a PLP', async () => {
        const mockEnroll = jest.fn(() => Promise.resolve());
        const training = { ...makePlpTraining([]), enrollment: null };

        const { container } = renderComponent({
          training,
          personalizedPathEnrollmentHandler: mockEnroll,
        });

        await act(async () => {
          fireEvent.click(
            container.querySelector('[data-automationid="alm.overview.button.enroll"]')!
          );
        });

        expect(getConflictingSessions).not.toHaveBeenCalled();
      });
    });
  });
});
