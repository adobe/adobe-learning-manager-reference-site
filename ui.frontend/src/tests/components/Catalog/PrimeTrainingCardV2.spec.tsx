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
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import PrimeTrainingCardV2 from '@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2';
import type { PrimeAccount, PrimeLearningObject, PrimeUser } from '@models/PrimeModels';

jest.mock('../../../almLib/hooks/catalog/useTrainingCard', () => ({
  useTrainingCard: jest.fn(),
}));

jest.mock('../../../almLib/hooks/useJobAids', () => ({
  useJobAids: jest.fn(),
}));

jest.mock('../../../almLib/common/Alert/useConfirmationAlert', () => ({
  useConfirmationAlert: jest.fn(),
}));

jest.mock('../../../almLib/common/Alert/useAlert', () => ({
  useAlert: jest.fn(),
}));

jest.mock('../../../almLib/utils/global', () => ({
  getALMObject: jest.fn(),
  getWidgetConfig: jest.fn(),
  isAccAltCompletionEnabled: jest.fn(),
}));

jest.mock('../../../almLib/utils/lo-utils', () => ({
  getTrainingLink: jest.fn(() => '#'),
  fetchJobAidResource: jest.fn(),
  getTrainingTypeLabel: jest.fn(() => 'Course'),
}));

jest.mock('../../../almLib/utils/catalog', () => ({
  getActiveInstances: jest.fn(),
  splitStringIntoArray: jest.fn(),
}));

jest.mock('../../../almLib/utils/hooks', () => ({
  useRatingsTemplate: jest.fn(),
  getConflictingSessions: jest.fn(),
}));

jest.mock('../../../almLib/utils/breadcrumbUtils', () => ({
  clearBreadcrumbPathDetails: jest.fn(),
}));

jest.mock('../../../almLib/components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper', () => ({
  canStart: jest.fn(),
  checkIfRecoOrCPENEWDiscoveryStrip: jest.fn(),
  getActionTextForDisabledLinks: jest.fn(),
  getActiveInstance: jest.fn(),
  getAuthorName: jest.fn(),
  handleRedirectionForLoggedIn: jest.fn(),
  handleRedirectionForNonLoggedIn: jest.fn(),
  hasSingleActiveInstance: jest.fn(),
  isExtensionAllowed: jest.fn(),
  isLinkedinLO: jest.fn(),
  canShowPrice: jest.fn(),
  openJobAid: jest.fn(),
  showToast: jest.fn(),
}));

jest.mock('../../../almLib/utils/dateTime', () => ({
  convertSecondsToHourAndMinsText: jest.fn(() => '1h'),
  modifyTimeDDMMYY: jest.fn(() => '01/01/2024'),
}));

jest.mock('../../../almLib/utils/translationService', () => ({
  formatMap: { 'Ai Coach': 'alm.training.jobAid' },
  GetTranslation: jest.fn((key) => key),
  GetTranslationReplaced: jest.fn((key) => key),
  GetTranslationsReplaced: jest.fn((key) => key),
  ReplaceAccountTerminology: jest.fn((text) => text),
}));

jest.mock('../../../almLib/utils/price', () => ({
  getFormattedPrice: jest.fn((price) => `$${price}`),
}));

jest.mock('../../../almLib/utils/widgets/utils', () => ({
  downloadFile: jest.fn(),
}));

jest.mock('../../../almLib/utils/widgets/windowWrapper', () => ({
  GetPrimeObj: jest.fn(() => ({ _playerLaunchTimeStamp: Date.now() })),
}));

jest.mock('../../../almLib/utils/native-extensibility', () => ({
  InvocationType: { LEARNER_ENROLL: 'LEARNER_ENROLL' },
  getExtension: jest.fn(),
}));

jest.mock('../../../almLib/components/Common/ALMEffectivenessDialog', () => ({
  ALMEffectivenessDialog: () => <div>Effectiveness Dialog</div>,
}));

jest.mock('../../../almLib/components/SessionConflict/SessionConflictDialog', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@adobe/react-spectrum', () => ({
  ProgressBar: ({ value }: any) => <div data-testid="progress-bar">Progress: {value}%</div>,
}));

jest.mock('@spectrum-icons/workflow/MoreVertical', () => ({
  __esModule: true,
  default: () => <div>More</div>,
}));

jest.mock('../../../almLib/utils/inline_svg', () => {
  const React = require('react');
  return {
    ADDED_TICK_SVG: () => React.createElement('span', null, 'ADDED_TICK_SVG'),
    ADD_BUTTON_SVG: () => React.createElement('span', null, 'ADD_BUTTON_SVG'),
    BOOKMARK_ICON: () => React.createElement('span', null, 'BOOKMARK_ICON'),
    BOOKMARKED_ICON: () => React.createElement('span', null, 'BOOKMARKED_ICON'),
    ERROR_ICON_SVG: () => React.createElement('span', null, 'ERROR_ICON_SVG'),
    HEART_IN_CIRCLE: () => React.createElement('span', null, 'HEART_IN_CIRCLE'),
    SKILL_SVG: () => React.createElement('span', null, 'SKILL_SVG'),
    JOBAID_CARD_REMOVE: () => React.createElement('span', null, 'JOBAID_CARD_REMOVE'),
    JOBAID_ICON_REMOVE: () => React.createElement('span', null, 'JOBAID_ICON_REMOVE'),
    DOWNLOAD_ICON_ROUNDED: () => React.createElement('span', null, 'DOWNLOAD_ICON_ROUNDED'),
    STANDARD_COMPLETION_ICON: () => React.createElement('span', null, 'STANDARD_COMPLETION_ICON'),
    ALTERNATE_COMPLETION_ICON: () => React.createElement('span', null, 'ALTERNATE_COMPLETION_ICON'),
    DOT_SEPERATOR_ICON: () => React.createElement('span', null, 'DOT_SEPERATOR_ICON'),
    VIRTUAL_COACH_JOB_AID_ICON: () => React.createElement('span', null, 'VIRTUAL_COACH_JOB_AID_ICON'),
  };
});

import { useTrainingCard } from '../../../almLib/hooks/catalog/useTrainingCard';
import { useJobAids } from '../../../almLib/hooks/useJobAids';
import { useConfirmationAlert } from '../../../almLib/common/Alert/useConfirmationAlert';
import { useAlert } from '../../../almLib/common/Alert/useAlert';
import { getALMObject, getWidgetConfig, isAccAltCompletionEnabled } from '../../../almLib/utils/global';
import { getActiveInstances, splitStringIntoArray } from '../../../almLib/utils/catalog';
import { useRatingsTemplate, getConflictingSessions } from '../../../almLib/utils/hooks';
import { WidgetTypeNew } from '../../../almLib/utils/widgets/common';
import {
  canStart,
  hasSingleActiveInstance,
  isLinkedinLO,
  canShowPrice,
  isExtensionAllowed,
  getAuthorName,
  checkIfRecoOrCPENEWDiscoveryStrip,
  getActionTextForDisabledLinks,
} from '../../../almLib/components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper';

const mockUseTrainingCard = useTrainingCard as jest.Mock;
const mockUseJobAids = useJobAids as jest.Mock;
const mockUseConfirmationAlert = useConfirmationAlert as jest.Mock;
const mockUseAlert = useAlert as jest.Mock;
const mockGetALMObject = getALMObject as jest.Mock;
const mockGetWidgetConfig = getWidgetConfig as jest.Mock;
const mockIsAccAltCompletionEnabled = isAccAltCompletionEnabled as jest.Mock;
const mockGetActiveInstances = getActiveInstances as jest.Mock;
const mockSplitStringIntoArray = splitStringIntoArray as jest.Mock;
const mockUseRatingsTemplate = useRatingsTemplate as jest.Mock;
const mockGetConflictingSessions = getConflictingSessions as jest.Mock;
const mockCanStart = canStart as jest.Mock;
const mockHasSingleActiveInstance = hasSingleActiveInstance as jest.Mock;
const mockIsLinkedinLO = isLinkedinLO as jest.Mock;
const mockCanShowPrice = canShowPrice as jest.Mock;
const mockIsExtensionAllowed = isExtensionAllowed as jest.Mock;
const mockGetAuthorName = getAuthorName as jest.Mock;
const mockCheckIfRecoOrCPENEWDiscoveryStrip = checkIfRecoOrCPENEWDiscoveryStrip as jest.Mock;
const mockGetActionTextForDisabledLinks = getActionTextForDisabledLinks as jest.Mock;

const wrap = (ui: React.ReactElement) =>
  render(<IntlProvider locale="en" messages={{}}>{ui}</IntlProvider>);

// Base return value for useTrainingCard — override individual fields per test
const baseCardState = {
  format: 'selfPaced',
  type: 'course',
  skillNames: 'JavaScript, React',
  name: 'Test Course',
  description: 'Test Description',
  cardBgStyle: {},
  enrollment: null,
  overview: 'Overview',
};

describe('PrimeTrainingCardV2', () => {
  const mockTraining = {
    id: 'course:123',
    loType: 'course',
    name: 'Test Course',
    description: 'Test Description',
    duration: 3600,
    datePublished: '2024-01-01',
    isBookmarked: false,
    skills: [],
    products: [],
    roles: [],
  } as unknown as PrimeLearningObject;

  const mockAccount = {
    id: 'account:1',
    templatesConfig: '{}',
    extensions: [],
    recommendationAccountType: 'STANDARD',
    prlCriteria: { enabled: false },
  } as unknown as PrimeAccount;

  const mockUser = { id: 'user:1' } as unknown as PrimeUser;

  const defaultProps = {
    training: mockTraining,
    account: mockAccount,
    user: mockUser,
    handleLoEnrollment: jest.fn(),
    handleL1FeedbackLaunch: jest.fn(),
  };

  // Build an account with a specific loCardConfig override
  const accountWith = (loCardConfig: object) => ({
    ...mockAccount,
    templatesConfig: JSON.stringify({ loCardConfig }),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // resetMocks:true in jest config clears factory implementations — re-set them here
    const translationService = require('../../../almLib/utils/translationService');
    translationService.GetTranslation.mockImplementation((key: string) => key);
    translationService.GetTranslationReplaced.mockImplementation((key: string) => key);
    translationService.GetTranslationsReplaced.mockImplementation((key: string) => key);
    translationService.ReplaceAccountTerminology.mockImplementation((text: string) => text);

    const dateTimeUtils = require('../../../almLib/utils/dateTime');
    dateTimeUtils.convertSecondsToHourAndMinsText.mockReturnValue('1h');
    dateTimeUtils.modifyTimeDDMMYY.mockReturnValue('01/01/2024');

    const priceUtils = require('../../../almLib/utils/price');
    priceUtils.getFormattedPrice.mockImplementation((price: any) => `$${price}`);

    const loUtils = require('../../../almLib/utils/lo-utils');
    loUtils.getTrainingLink.mockReturnValue('#');

    mockUseTrainingCard.mockReturnValue(baseCardState);
    mockUseJobAids.mockReturnValue({ enroll: jest.fn(), unenroll: jest.fn(), isEnrolled: false });
    mockUseConfirmationAlert.mockReturnValue([jest.fn()]);
    mockUseAlert.mockReturnValue([jest.fn()]);
    mockGetALMObject.mockReturnValue({
      isPrimeUserLoggedIn: jest.fn().mockReturnValue(true),
      navigateToCatalogPage: jest.fn(),
    });
    mockGetWidgetConfig.mockReturnValue({ isLoadedInsideApp: false });
    mockIsAccAltCompletionEnabled.mockReturnValue(false);
    mockGetActiveInstances.mockReturnValue([]);
    mockSplitStringIntoArray.mockReturnValue(['JavaScript', 'React']);
    mockUseRatingsTemplate.mockReturnValue(<div>Rating</div>);
    mockGetConflictingSessions.mockResolvedValue([]);
    mockCanStart.mockReturnValue(true);
    mockHasSingleActiveInstance.mockReturnValue(true);
    mockCanShowPrice.mockReturnValue(false);
    mockIsLinkedinLO.mockReturnValue(false);
    mockIsExtensionAllowed.mockReturnValue(false);
    mockGetAuthorName.mockReturnValue('');
    mockCheckIfRecoOrCPENEWDiscoveryStrip.mockReturnValue(false);
    mockGetActionTextForDisabledLinks.mockReturnValue('');
  });

  describe('card title', () => {
    it('always renders the training name in the title link', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} />);
      const titleLink = document.querySelector('[data-automationid="Test Course-title"]');
      expect(titleLink?.textContent).toContain('Test Course');
    });

    it('renders the title as an anchor with an href for non-jobAid trainings', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} />);
      const title = document.querySelector('[data-automationid="Test Course-title"]');
      expect(title?.tagName).toBe('A');
      expect(title).toHaveAttribute('href', '#');
    });

    it('renders the title as a button (no href) for jobAid trainings so "open in new tab" is not offered', () => {
      const jobAidTraining = { ...mockTraining, loType: 'jobAid' };
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, format: 'jobAid', type: 'jobAid' });

      wrap(<PrimeTrainingCardV2 {...defaultProps} training={jobAidTraining} />);

      const title = document.querySelector('[data-automationid="Test Course-title"]');
      expect(title?.tagName).toBe('BUTTON');
      expect(title).toHaveAttribute('type', 'button');
      expect(title).not.toHaveAttribute('href');
    });

    it('sets tabIndex -1 on the jobAid title button when links are disabled via widget', () => {
      const jobAidTraining = { ...mockTraining, loType: 'jobAid' };
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, format: 'jobAid', type: 'jobAid' });

      wrap(
        <PrimeTrainingCardV2
          {...defaultProps}
          training={jobAidTraining}
          widget={{ attributes: { disableLinks: true } } as any}
        />
      );

      const title = document.querySelector('[data-automationid="Test Course-title"]');
      expect(title?.tagName).toBe('BUTTON');
      expect(title).toHaveAttribute('tabindex', '-1');
    });

    it('uses a javascript:void(0) href and tabIndex -1 on the anchor title when links are disabled', () => {
      wrap(
        <PrimeTrainingCardV2
          {...defaultProps}
          disableLinks={true}
          widget={{ attributes: { disableLinks: true } } as any}
        />
      );

      const title = document.querySelector('[data-automationid="Test Course-title"]');
      expect(title?.tagName).toBe('A');
      expect(title).toHaveAttribute('href', 'javascript:void(0)');
      expect(title).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('description', () => {
    it('shown when showDescriptionInfo is true', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showDescriptionInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-description"]')?.textContent).toBe('Test Description');
    });

    it('hidden when showDescriptionInfo is false', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showDescriptionInfo: false })} />);
      expect(document.querySelector('[data-automationid="Test Course-description"]')).toBeNull();
    });

    it('should show "View" button text for non-AI Coach jobAid', () => {
      const jobAidTraining = {
        ...mockTraining,
        loType: 'jobAid',
      };

      mockUseTrainingCard.mockReturnValue({
        format: 'jobAid',
        type: 'jobAid',
        skillNames: '',
        name: 'Test Course',
        description: 'Test Description',
        cardBgStyle: {},
        enrollment: null,
        overview: 'Overview',
      });

      wrap(<PrimeTrainingCardV2 {...defaultProps} training={jobAidTraining} />);

      expect(screen.getByRole('button', { name: 'alm.jobAid.view.button' })).toBeInTheDocument();
    });

    it('should show "Start" button text for AI Coach (roleplay/virtual coach) jobAid', () => {
      const jobAidTraining = {
        ...mockTraining,
        loType: 'jobAid',
      };

      mockUseTrainingCard.mockReturnValue({
        format: 'Ai Coach',
        type: 'jobAid',
        skillNames: '',
        name: 'Test Course',
        description: 'Test Description',
        cardBgStyle: {},
        enrollment: null,
        overview: 'Overview',
      });

      wrap(<PrimeTrainingCardV2 {...defaultProps} training={jobAidTraining} />);

      expect(screen.getByRole('button', { name: 'text.start' })).toBeInTheDocument();
    });
  });

  describe('format label', () => {
    it('shown when showFormatInfo is true and format is set', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showFormatInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-format"]')).not.toBeNull();
    });

    it('shows virtual coach icon alongside label for Ai Coach format', () => {
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, format: 'Ai Coach' });
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showFormatInfo: true })} />);
      const formatEl = document.querySelector('[data-automationid="Test Course-format"]');
      expect(formatEl?.textContent).toContain('VIRTUAL_COACH_JOB_AID_ICON');
      expect(formatEl?.textContent).toContain('alm.training.jobAid');
    });
  });

  describe('progress bar', () => {
    const enrollment = { progressPercent: 50, state: 'STARTED', loInstance: {} };

    it('shown with correct progress value when showProgressBar is true and enrollment exists', () => {
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, enrollment });
      wrap(<PrimeTrainingCardV2 {...defaultProps} showProgressBar={true} />);
      expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 50%');
    });

    it('hidden when showProgressBar is false', () => {
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, enrollment });
      wrap(<PrimeTrainingCardV2 {...defaultProps} showProgressBar={false} />);
      expect(screen.queryByTestId('progress-bar')).toBeNull();
    });
  });

  describe('enrolled tag', () => {
    it('shown when enrollment exists and showEnrollAction is false', () => {
      mockUseTrainingCard.mockReturnValue({
        ...baseCardState,
        enrollment: { progressPercent: 50, state: 'STARTED', loInstance: {} },
      });
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showEnrollAction: false })} />);
      const tag = document.querySelector('[data-automationid="Test Course-enrolledTag"]');
      expect(tag?.textContent).toBe('alm.catalog.filter.enrolled');
    });
  });

  describe('duration badge', () => {
    it('shown when showDurationInfo is true and duration is positive', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showDurationInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-duration"]')?.textContent).toBe('1h');
    });

    it('hidden when training duration is 0', () => {
      const noDurationTraining = { ...mockTraining, duration: 0 };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={noDurationTraining} account={accountWith({ showDurationInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-duration"]')).toBeNull();
    });
  });

  describe('date display', () => {
    it('shows due date id when enrollment has a completionDeadline', () => {
      mockUseTrainingCard.mockReturnValue({
        ...baseCardState,
        enrollment: { completionDeadline: '2024-12-31', loInstance: {} },
      });
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showPublishedDueDateInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-primelxp-dateDue"]')).not.toBeNull();
    });

    it('shows published date id when there is no completion deadline', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showPublishedDueDateInfo: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-primelxp-datePublished"]')).not.toBeNull();
    });
  });

  describe('price', () => {
    const pricedTraining = { ...mockTraining, price: 99.99 };

    it('shown with formatted value when showPrice is true', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={pricedTraining} showPrice={true} />);
      expect(document.querySelector('[data-automationid="Test Course-price"]')?.textContent).toBe('$99.99');
    });

    it('hidden when showPrice is false', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={pricedTraining} showPrice={false} />);
      expect(document.querySelector('[data-automationid="Test Course-price"]')).toBeNull();
    });
  });

  describe('completion status', () => {
    it('shows standard completion icon and text.completed when enrollment state is COMPLETED', () => {
      const completedTraining = {
        ...mockTraining,
        enrollment: { state: 'COMPLETED', progressPercent: 100 },
      } as unknown as PrimeLearningObject;
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={completedTraining} account={accountWith({ showCompletionStatusInfo: true })} />);
      expect(screen.queryByText('STANDARD_COMPLETION_ICON')).not.toBeNull();
      expect(screen.queryByText('text.completed')).not.toBeNull();
    });

    it('shows alternate completion icon when isAlternateComplete is true and feature is enabled', () => {
      mockIsAccAltCompletionEnabled.mockReturnValue(true);
      const altCompletedTraining = { ...mockTraining, isAlternateComplete: true };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={altCompletedTraining} account={accountWith({ showCompletionStatusInfo: true })} />);
      expect(screen.queryByText('ALTERNATE_COMPLETION_ICON')).not.toBeNull();
    });
  });

  describe('skills', () => {
    it('shows skill span when showSkills is true and skillNames is non-empty', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} showSkills={true} />);
      expect(document.querySelector('[data-automationid^="primelxp-skill-"]')).not.toBeNull();
    });

    it('no skill element when skillNames is empty', () => {
      mockUseTrainingCard.mockReturnValue({ ...baseCardState, skillNames: '' });
      mockSplitStringIntoArray.mockReturnValue([]);
      wrap(<PrimeTrainingCardV2 {...defaultProps} showSkills={true} />);
      expect(document.querySelector('[data-automationid^="primelxp-skill-"]')).toBeNull();
    });
  });

  describe('rating and effectiveness', () => {
    it('rating template shown when showRating and showRatingInfo are true', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showRatingInfo: true })} showRating={true} />);
      expect(screen.queryByText('Rating')).not.toBeNull();
    });

    it('effectiveness text shown when effectivenessIndex is positive', () => {
      const trainingWithEffectiveness = { ...mockTraining, effectivenessIndex: 50 };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={trainingWithEffectiveness} showEffectivenessIndex={true} />);
      expect(screen.queryByText('alm.lo.effectiveness')).not.toBeNull();
    });

    it('effectiveness not rendered when effectivenessIndex is 0', () => {
      const trainingNoEffectiveness = { ...mockTraining, effectivenessIndex: 0 };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={trainingNoEffectiveness} showEffectivenessIndex={true} />);
      expect(screen.queryByText('alm.lo.effectiveness')).toBeNull();
    });
  });

  describe('jobAid icons', () => {
    const jobAidTraining = { ...mockTraining, loType: 'jobAid' };

    it('shows add icon for unenrolled jobAid', () => {
      mockUseJobAids.mockReturnValue({ enroll: jest.fn(), unenroll: jest.fn(), isEnrolled: false });
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={jobAidTraining} />);
      expect(screen.queryByText('ADD_BUTTON_SVG')).not.toBeNull();
    });

    it('shows remove icon for enrolled jobAid', () => {
      mockUseJobAids.mockReturnValue({ enroll: jest.fn(), unenroll: jest.fn(), isEnrolled: true });
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={jobAidTraining} />);
      expect(screen.queryByText('JOBAID_CARD_REMOVE')).not.toBeNull();
    });
  });

  describe('bookmark', () => {
    it('save button rendered when training is not bookmarked and showSaveAction is true', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showSaveAction: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-save"]')?.tagName).toBe('BUTTON');
    });

    it('unsave button rendered when training is bookmarked and showSaveAction is true', () => {
      const bookmarkedTraining = { ...mockTraining, isBookmarked: true };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={bookmarkedTraining} account={accountWith({ showSaveAction: true })} />);
      expect(document.querySelector('[data-automationid="Test Course-unsave"]')?.tagName).toBe('BUTTON');
    });

    it('calls handleAddBookmark with training id when save is clicked', () => {
      const handleAddBookmark = jest.fn().mockResolvedValue({});
      wrap(<PrimeTrainingCardV2 {...defaultProps} account={accountWith({ showSaveAction: true })} handleAddBookmark={handleAddBookmark} />);
      userEvent.click(document.querySelector('[data-automationid="Test Course-save"]') as HTMLElement);
      expect(handleAddBookmark).toHaveBeenCalledWith('course:123');
    });

    it('calls handleRemoveBookmark with training id when unsave is clicked', () => {
      const handleRemoveBookmark = jest.fn().mockResolvedValue({});
      const bookmarkedTraining = { ...mockTraining, isBookmarked: true };
      wrap(
        <PrimeTrainingCardV2
          {...defaultProps}
          training={bookmarkedTraining}
          account={accountWith({ showSaveAction: true })}
          handleRemoveBookmark={handleRemoveBookmark}
        />
      );
      userEvent.click(document.querySelector('[data-automationid="Test Course-unsave"]') as HTMLElement);
      expect(handleRemoveBookmark).toHaveBeenCalledWith('course:123');
    });
  });

  describe('action button', () => {
    it('shows text.start text when unenrolled and canStart is true', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} showActionButton={true} />);
      const actionBtn = document.querySelector('[data-automationid="Test Course-view"]');
      expect(actionBtn?.textContent).toBe('text.start');
    });

    it('no action button rendered when showActionButton is false', () => {
      wrap(<PrimeTrainingCardV2 {...defaultProps} showActionButton={false} />);
      expect(document.querySelector('[data-automationid="Test Course-view"]')).toBeNull();
    });

    it('shows lo.strip.view text when widget type is PERSONALIZED_PATH_STRIP', () => {
      wrap(
        <PrimeTrainingCardV2
          {...defaultProps}
          showActionButton={true}
          widget={{ type: WidgetTypeNew.PERSONALIZED_PATH_STRIP } as any}
        />
      );
      const actionBtn = document.querySelector('[data-automationid="Test Course-view"]');
      expect(actionBtn?.textContent).toBe('lo.strip.view');
    });
  });

  describe('author info', () => {
    beforeEach(() => {
      mockGetAuthorName.mockReturnValue('John Doe');
    });

    it('shown when showAuthorInfo is true and isAuthorPage is false', () => {
      const trainingWithAuthor = { ...mockTraining, authorNames: ['John Doe'] };
      wrap(
        <PrimeTrainingCardV2
          {...defaultProps}
          training={trainingWithAuthor}
          account={accountWith({ showAuthorNameInfo: true })}
          showAuthorInfo={true}
          isAuthorPage={false}
        />
      );
      expect(document.querySelector('[data-automationid="primelxp-authorName-John Doe"]')).not.toBeNull();
    });

    it('hidden when isAuthorPage is true', () => {
      const trainingWithAuthor = { ...mockTraining, authorNames: ['John Doe'] };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={trainingWithAuthor} showAuthorInfo={true} isAuthorPage={true} />);
      expect(document.querySelector('[data-automationid="primelxp-authorName-John Doe"]')).toBeNull();
    });
  });

  describe('downloadable training', () => {
    it('extra options button shown for downloadable training', () => {
      const downloadableTraining = { ...mockTraining, downloadable: true };
      wrap(<PrimeTrainingCardV2 {...defaultProps} training={downloadableTraining} />);
      expect(document.querySelector('[data-automationid="Test Course-extraOptions"]')?.tagName).toBe('BUTTON');
    });
  });
});
