/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const mockNavigateToCatalogPage = jest.fn();
const mockNavigateToTrainingOverviewPage = jest.fn();
const mockDoesLPHaveActiveInstance = jest.fn(() => true);

jest.mock('@hooks/instance/useInstancePage', () => ({
  useInstancePage: jest.fn(),
}));
jest.mock('@hooks', () => ({
  useTrainingPage: jest.fn(),
}));
jest.mock('@hooks/catalog/useTrainingCard', () => ({
  useTrainingCard: jest.fn(),
}));
jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: jest.fn(),
}));
jest.mock('@contextProviders/DeviceContextProvider', () => ({
  useDeviceTypeContext: jest.fn(),
}));
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMObject: jest.fn(),
  getALMAccount: jest.fn(),
  getPathParams: jest.fn(),
  customEncode: (v: any) => v,
  setTrainingsLayout: jest.fn(),
  getALMUser: jest.fn(),
  getTokenForNativeExtensions: jest.fn(),
  isEnrolled: () => false,
  isExtensionAllowed: jest.fn(),
  isStructuredLocationEnabled: jest.fn(() => false),
  containsElement: () => false,
  containsSubstr: () => false,
}));
jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string) => key,
  getPreferredLocalizedMetadata: () => ({ name: 'Instance Name' }),
}));
jest.mock('@utils/instance', () => ({
  filterInstanceList: (list: any[]) => list,
  getLanguageDropdownObject: () => ({ all: 'All' }),
  getLoInstanceLocales: () => new Set([undefined]),
  getResourceBasedOnLocale: jest.fn(() => ({})),
}));
jest.mock('@utils/breadcrumbUtils', () => ({
  getBreadcrumbPath: jest.fn(),
}));
jest.mock('@utils/inline_svg', () => ({
  SORT_ORDER_SVG: () => null,
}));
jest.mock('@utils/hooks', () => ({
  getEnrollment: () => null,
  getLoId: (v: string) => v,
  getLoName: (v: string) => v,
}));
jest.mock('@utils/native-extensibility', () => ({
  getExtension: jest.fn(),
  getExtensionAppUrl: jest.fn(),
  openExtensionInNewTab: jest.fn(),
  EXTENSION_LAUNCH_TYPE: { IN_APP: 'IN_APP', NEW_TAB: 'NEW_TAB' },
  InvocationType: { LEARNER_INSTANCE_ROW: 'LEARNER_INSTANCE_ROW', LEARNER_ENROLL: 'LEARNER_ENROLL' },
}));
jest.mock('@utils/lo-utils', () => ({
  doesLPHaveActiveInstance: (...args: any[]) => mockDoesLPHaveActiveInstance(...args),
}));
jest.mock('@utils/catalog', () => ({
  getInitialView: (val: string) => val,
}));
jest.mock('@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper', () => ({
  canShowPrice: () => false,
}));
jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ defaultMessage }: any) => defaultMessage }),
}));
jest.mock('@components/Common/ALMLoader', () => ({
  ALMLoader: () => <div data-testid="loader" />,
}));
jest.mock('@components/Common/ALMBackButton', () => ({
  ALMBackButton: () => <button data-testid="back-button" />,
}));
jest.mock('@components/Instance/PrimeInstanceItem', () => ({
  PrimeInstanceItem: ({ name }: any) => <div data-testid="instance-item" data-name={name} />,
}));
jest.mock('@components/Instance/PrimeInstanceCard', () => ({
  PrimeInstanceCard: ({ name }: any) => <div data-testid="instance-card" data-name={name} />,
}));
jest.mock('@components/Instance/PrimeInstanceCardMobile', () => ({
  PrimeInstanceCardMobile: ({ name }: any) => <div data-testid="instance-card-mobile" data-name={name} />,
}));

import { render, screen, wait } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrimeInstancePage from '@components/Instance/PrimeInstancePage/PrimeInstancePage';
import { useInstancePage } from '@hooks/instance/useInstancePage';
import { useTrainingPage } from '@hooks';
import { useTrainingCard } from '@hooks/catalog/useTrainingCard';
import { useUserContext } from '@contextProviders/userContextProvider';
import { useDeviceTypeContext } from '@contextProviders/DeviceContextProvider';
import { getALMConfig, getALMObject, getPathParams, isStructuredLocationEnabled } from '@utils/global';
import { getResourceBasedOnLocale } from '@utils/instance';
import { getBreadcrumbPath } from '@utils/breadcrumbUtils';

const mockUseInstancePage = useInstancePage as jest.MockedFunction<typeof useInstancePage>;
const mockUseTrainingPage = useTrainingPage as jest.MockedFunction<typeof useTrainingPage>;
const mockUseTrainingCard = useTrainingCard as jest.MockedFunction<typeof useTrainingCard>;
const mockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;
const mockUseDeviceTypeContext = useDeviceTypeContext as jest.MockedFunction<typeof useDeviceTypeContext>;
const mockGetALMConfig = getALMConfig as jest.MockedFunction<typeof getALMConfig>;
const mockGetALMObject = getALMObject as jest.MockedFunction<typeof getALMObject>;
const mockGetPathParams = getPathParams as jest.MockedFunction<typeof getPathParams>;
const mockGetBreadcrumbPath = getBreadcrumbPath as jest.MockedFunction<typeof getBreadcrumbPath>;
const mockGetResourceBasedOnLocale = getResourceBasedOnLocale as jest.MockedFunction<any>;
const mockIsStructuredLocationEnabled = isStructuredLocationEnabled as jest.MockedFunction<any>;

const baseCourseTraining = {
  id: 'course:123',
  loType: 'course',
  loFormat: 'Self Paced',
  skills: [],
  enrollment: null,
  instanceSwitchEnabled: false,
  multienrollmentEnabled: false,
};

const baseInstancePageReturn = {
  isLoading: false,
  training: baseCourseTraining,
  name: 'Test Course',
  overview: 'Test overview',
  richTextOverview: '',
  cardBgStyle: {},
  listThumbnailBgStyle: {},
  activeInstances: [],
  selectInstanceHandler: jest.fn(),
  getSummary: jest.fn(),
  extensionLocalizedMetadata: null,
  loFormat: 'Self Paced',
  instanceName: 'Instance Name',
  languageText: 'Language',
  seatsAvailableText: 'Seats Available',
};

const baseUserContext = {
  user: {
    contentLocale: 'en-US',
    account: {
      viewType: 'LIST_VIEW',
      learnerHelpLinks: [],
      contentLocales: [],
    },
  },
};

const baseDeviceContext = { isDesktop: true, isMobile: false, isTablet: false };

describe('PrimeInstancePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoesLPHaveActiveInstance.mockReturnValue(true);
    mockGetALMConfig.mockReturnValue({
      instancePath: '/instances/:trainingId',
      locale: 'en-US',
      hideBackButton: false,
    } as any);
    mockGetALMObject.mockReturnValue({
      getALMConfig: () => ({ locale: 'en-US' }),
      navigateToCatalogPage: mockNavigateToCatalogPage,
      navigateToTrainingOverviewPage: mockNavigateToTrainingOverviewPage,
      handleInstanceNavigationAfterEnroll: null,
    } as any);
    mockGetPathParams.mockReturnValue({ trainingId: 'course:123' } as any);
    mockGetBreadcrumbPath.mockReturnValue({ parentPath: [] } as any);
    mockUseUserContext.mockReturnValue(baseUserContext as any);
    mockUseInstancePage.mockReturnValue(baseInstancePageReturn as any);
    mockUseTrainingPage.mockReturnValue({ waitlistPosition: null } as any);
    mockUseTrainingCard.mockReturnValue({ skillNames: 'JavaScript', type: 'Course' } as any);
    mockUseDeviceTypeContext.mockReturnValue(baseDeviceContext as any);
  });

  it('shows loader when isLoading is true and nothing else', () => {
    mockUseInstancePage.mockReturnValue({ ...baseInstancePageReturn, isLoading: true } as any);
    render(<PrimeInstancePage />);
    expect(screen.getByTestId('loader').tagName.toLowerCase()).toBe('div');
    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
  });

  describe('Back button', () => {
    it('renders back button by default', () => {
      render(<PrimeInstancePage />);
      expect(screen.getByTestId('back-button').tagName.toLowerCase()).toBe('button');
    });

    it('hides back button when hideBackButton is true', () => {
      mockGetALMConfig.mockReturnValue({ instancePath: '/instances/:trainingId', locale: 'en-US', hideBackButton: true } as any);
      render(<PrimeInstancePage />);
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });
  });

  describe('Training info', () => {
    it('renders training name in an h3 element', () => {
      render(<PrimeInstancePage />);
      expect(screen.getByText('Test Course').tagName.toLowerCase()).toBe('h3');
    });

    it('renders overview text when overview is provided', () => {
      const { container } = render(<PrimeInstancePage />);
      expect(container.innerHTML).toContain('Test overview');
    });

    it('omits overview element when both overview and richTextOverview are empty', () => {
      mockUseInstancePage.mockReturnValue({ ...baseInstancePageReturn, overview: '', richTextOverview: '' } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.innerHTML).not.toContain('Test overview');
    });

    it('renders skills when training has skills', () => {
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, skills: [{ skillLevel: { skill: { name: 'JavaScript' } } }] },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.innerHTML).toContain('alm.catalog.filter.skills.label');
    });

    it('omits skills section when training has no skills', () => {
      const { container } = render(<PrimeInstancePage />);
      expect(container.innerHTML).not.toContain('alm.catalog.filter.skills.label');
    });
  });

  describe('Header label', () => {
    it('shows instance-switch enrolled label when instanceSwitchEnabled is true and enrolled', () => {
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, instanceSwitchEnabled: true, enrollment: { id: 'enr-1' } },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.textContent).toContain('alm.instance.switch.header.enrolled.label');
    });

    it('shows instance-switch unenrolled label when instanceSwitchEnabled is true but not enrolled', () => {
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, instanceSwitchEnabled: true, enrollment: null },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.textContent).toContain('alm.instance.switch.header.course.label');
    });

    it('shows multienroll label when multienrollmentEnabled is true and enrolled', () => {
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, multienrollmentEnabled: true, enrollment: { id: 'enr-1' } },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.textContent).toContain('alm.instance.header.course.multienroll.label');
    });

    it('shows default label when neither instanceSwitchEnabled nor multienrollmentEnabled', () => {
      const { container } = render(<PrimeInstancePage />);
      expect(container.textContent).toContain('alm.instance.header.course.label');
    });
  });

  describe('LP no active instance message', () => {
    it('shows alert section instead of header when LP has no active instances', () => {
      mockDoesLPHaveActiveInstance.mockReturnValue(false);
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, loType: 'learningProgram' },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('[data-automationid="Test Course-no-active-instance"]')).not.toBeNull();
      expect(container.querySelector('h2')).toBeNull();
    });

    it('shows header h2 when LP has active instances', () => {
      mockDoesLPHaveActiveInstance.mockReturnValue(true);
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, loType: 'learningProgram' },
      } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('[data-automationid="Test Course-no-active-instance"]')).toBeNull();
      expect(container.querySelector('h2')).not.toBeNull();
    });
  });

  describe('Divider on mobile/tablet', () => {
    it('does not render a divider on desktop', () => {
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('hr')).toBeNull();
    });

    it('renders a divider on mobile', () => {
      mockUseDeviceTypeContext.mockReturnValue({ isDesktop: false, isMobile: true, isTablet: false } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('hr')).not.toBeNull();
    });

    it('renders a divider on tablet', () => {
      mockUseDeviceTypeContext.mockReturnValue({ isDesktop: false, isMobile: false, isTablet: true } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('hr')).not.toBeNull();
    });
  });

  describe('Breadcrumbs', () => {
    it('omits breadcrumbs when parentPath is empty', () => {
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('[data-automationid="breadcrumb-all-instances"]')).toBeNull();
    });

    it('renders breadcrumb links and all-instances label when parentPath is non-empty', () => {
      mockGetBreadcrumbPath.mockReturnValue({ parentPath: ['loId-1/loInstanceId-1'] } as any);
      const { container } = render(<PrimeInstancePage />);
      expect(container.querySelector('[data-automationid="breadcrumb-all-instances"]')).not.toBeNull();
    });
  });

  describe('trainingId resolution', () => {
    it('uses trainingId prop directly without calling getPathParams', () => {
      render(<PrimeInstancePage trainingId="course:456" />);
      expect(mockGetPathParams).not.toHaveBeenCalled();
    });

    it('extracts trainingId from URL via getPathParams and customEncode when no prop given', () => {
      render(<PrimeInstancePage />);
      expect(mockGetPathParams).toHaveBeenCalledWith('/instances/:trainingId', ['trainingId']);
    });
  });

  describe('Instance list rendering', () => {
    const activeInstance = {
      id: 'inst-1',
      localizedMetadata: [{ locale: 'en-US', name: 'Instance 1' }],
      locale: 'en-US',
      enrollmentDeadline: null,
      completionDeadline: null,
      loResources: [],
    };

    it('renders PrimeInstanceItem rows on desktop in list view when instances exist', async () => {
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        activeInstances: [activeInstance],
      } as any);
      render(<PrimeInstancePage />);
      await wait(() => {
        expect(screen.getByTestId('instance-item').tagName.toLowerCase()).toBe('div');
      });
    });

    it('renders PrimeInstanceCard tiles on desktop in grid view when instances exist', async () => {
      mockUseUserContext.mockReturnValue({
        ...baseUserContext,
        user: { ...baseUserContext.user, account: { ...baseUserContext.user.account, viewType: 'TILE_VIEW' } },
      } as any);
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        activeInstances: [activeInstance],
      } as any);
      render(<PrimeInstancePage />);
      await wait(() => {
        expect(screen.getByTestId('instance-card').tagName.toLowerCase()).toBe('div');
      });
    });

    it('renders PrimeInstanceCardMobile on mobile in list view when instances exist', async () => {
      mockUseDeviceTypeContext.mockReturnValue({ isDesktop: false, isMobile: true, isTablet: false } as any);
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        activeInstances: [activeInstance],
      } as any);
      render(<PrimeInstancePage />);
      await wait(() => {
        expect(screen.getByTestId('instance-card-mobile').tagName.toLowerCase()).toBe('div');
      });
    });

    it('builds the structured geography location for classroom instances', async () => {
      // A classroom course triggers showStartDateAndInstructor, which builds the
      // per-instance location string from the (structured) room geography.
      const classroomInstance = {
        ...activeInstance,
        loResources: [{ id: 'r1', resourceType: 'Classroom' }, { id: 'r2', resourceType: 'Classroom' }],
      };
      mockIsStructuredLocationEnabled.mockReturnValue(true);
      mockGetResourceBasedOnLocale.mockImplementation((lo: any) =>
        lo.id === 'r1'
          ? { room: { roomName: 'Berlin Hall', city: 'Munich', countryName: 'Germany', stateName: 'Bavaria' }, instructorNames: ['John Doe'] }
          : { contentType: 'Classroom' } // no room → exercises the null-geography branch
      );
      mockUseInstancePage.mockReturnValue({
        ...baseInstancePageReturn,
        training: { ...baseCourseTraining, loFormat: 'Classroom' },
        activeInstances: [classroomInstance],
      } as any);

      render(<PrimeInstancePage />);

      await wait(() => {
        expect(screen.getByTestId('instance-item')).toBeInTheDocument();
      });
      expect(mockGetResourceBasedOnLocale).toHaveBeenCalled();
    });
  });
});
