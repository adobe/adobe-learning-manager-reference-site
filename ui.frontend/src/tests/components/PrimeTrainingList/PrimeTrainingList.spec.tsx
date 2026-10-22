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
import { render, screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum';
import PrimeTrainingList from '@components/Catalog/PrimeTrainingList/PrimeTrainingList';
import { useTrainingCard } from '@hooks/catalog/useTrainingCard';
import { useJobAids } from '@hooks/useJobAids';
import { useAlert } from '@common/Alert/useAlert';
import { useRatingsTemplate } from '@utils/hooks';
import { useDeviceTypeContext } from '@contextProviders/DeviceContextProvider';
import {
  GetTranslation,
  GetTranslationReplaced,
  GetTranslationsReplaced,
} from '@utils/translationService';
import { canShowPrice } from '@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper';
import {
  getALMObject,
  isAccAltCompletionEnabled,
  redirectToLoginAndAbort,
} from '@utils/global';
import { canAddSnippet, getTrainingLink } from '@utils/lo-utils';
import { splitStringIntoArray } from '@utils/catalog';
import { modifyTimeDDMMYY } from '@utils/dateTime';
import { getFormattedPrice } from '@utils/price';
import { downloadFile } from '@utils/widgets/utils';
import { PrimeAccount, PrimeLearningObject } from '@models/PrimeModels';

// Factory mocks prevent transitive imports (e.g. ESCustomHooks) from executing at load time
jest.mock('@hooks/catalog/useTrainingCard', () => ({ useTrainingCard: jest.fn() }));
jest.mock('@hooks/useJobAids', () => ({ useJobAids: jest.fn() }));
jest.mock('@common/Alert/useAlert', () => ({ useAlert: jest.fn() }));
jest.mock('@utils/hooks', () => ({ useRatingsTemplate: jest.fn() }));
jest.mock('@contextProviders/DeviceContextProvider', () => ({ useDeviceTypeContext: jest.fn() }));
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(),
  GetTranslationReplaced: jest.fn(),
  GetTranslationsReplaced: jest.fn(),
  formatMap: { 'Self Paced': 'alm.format.self.paced' },
}));
jest.mock('@components/Catalog/PrimeTrainingCardV2/PrimeTrainingCardV2.helper', () => ({
  canShowPrice: jest.fn(),
}));
jest.mock('@utils/global', () => ({
  getALMObject: jest.fn(),
  getALMConfig: jest.fn(() => ({})),
  isAccAltCompletionEnabled: jest.fn(),
  navigateToLogin: jest.fn(),
  redirectToLoginAndAbort: jest.fn(),
}));
jest.mock('@utils/lo-utils', () => ({
  canAddSnippet: jest.fn(),
  getTrainingLink: jest.fn(),
}));
jest.mock('@utils/catalog', () => ({ splitStringIntoArray: jest.fn() }));
jest.mock('@utils/dateTime', () => ({ modifyTimeDDMMYY: jest.fn() }));
jest.mock('@utils/price', () => ({ getFormattedPrice: jest.fn() }));
jest.mock('@utils/widgets/utils', () => ({ downloadFile: jest.fn() }));
jest.mock('@utils/overview', () => ({
  storeActionInNonLoggedMode: jest.fn(),
  storeJobAidIdInNonLoggedMode: jest.fn(),
}));
jest.mock('@components/Common/ALMEffectivenessDialog', () => ({
  ALMEffectivenessDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="effectiveness-dialog">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));
jest.mock('@utils/inline_svg', () => ({
  ADD_ICON: () => <svg data-testid="add-icon" />,
  REMOVE_ICON: () => <svg data-testid="remove-icon" />,
  DOWNLOAD_ICON_WITHOUT_CIRCLE: () => <svg data-testid="download-icon" />,
  ALTERNATE_COMPLETION_ICON: () => <svg data-testid="alternate-completion-icon" />,
  STANDARD_COMPLETION_ICON: () => <svg data-testid="standard-completion-icon" />,
}));

const mockAccount: PrimeAccount = {
  id: 'account1',
  name: 'Test Account',
} as any;

const baseTraining: PrimeLearningObject = {
  id: 'training1',
  loType: 'course',
  localizedMetadata: [{ locale: 'en-US', name: 'Test Training', description: 'Test desc', overview: 'Test overview' }],
  instances: [{ id: 'instance1', state: 'ACTIVE' }],
  snippets: [],
  datePublished: '2024-01-01T00:00:00Z',
  price: 0,
  effectivenessIndex: 0,
} as any;

let mockCardClickHandler: jest.Mock;
let mockEnroll: jest.Mock;
let mockUnenroll: jest.Mock;
let mockHandleJobAidClick: jest.Mock;
let mockAlmAlert: jest.Mock;

// Default return for useTrainingCard — shared across all tests, overridden per-test as needed
const defaultTrainingCardReturn = () => ({
  format: 'Self Paced',
  type: 'course',
  skillNames: 'JavaScript, React',
  name: 'Test Training',
  description: 'Test desc',
  listThumbnailBgStyle: {},
  enrollment: null as any,
  cardClickHandler: mockCardClickHandler,
  overview: 'Test overview',
});

beforeEach(() => {
  mockCardClickHandler = jest.fn();
  mockEnroll = jest.fn().mockResolvedValue(undefined);
  mockUnenroll = jest.fn().mockResolvedValue(undefined);
  mockHandleJobAidClick = jest.fn();
  mockAlmAlert = jest.fn();

  (useTrainingCard as jest.Mock).mockReturnValue(defaultTrainingCardReturn());
  (useJobAids as jest.Mock).mockReturnValue({ enroll: mockEnroll, unenroll: mockUnenroll, handleJobAidClick: mockHandleJobAidClick });
  (useAlert as jest.Mock).mockReturnValue([mockAlmAlert]);
  (useRatingsTemplate as jest.Mock).mockReturnValue(null);
  (useDeviceTypeContext as jest.Mock).mockReturnValue({ isMobile: false, isTablet: false, isDesktop: true });
  (GetTranslation as jest.Mock).mockImplementation((key: string) => key);
  (GetTranslationReplaced as jest.Mock).mockImplementation((key: string) => key);
  (GetTranslationsReplaced as jest.Mock).mockImplementation((key: string) => key);
  (canShowPrice as jest.Mock).mockReturnValue(false);
  (isAccAltCompletionEnabled as jest.Mock).mockReturnValue(false);
  (getALMObject as jest.Mock).mockReturnValue({ getTrainingUrl: null });
  (canAddSnippet as jest.Mock).mockReturnValue(true);
  (getTrainingLink as jest.Mock).mockImplementation((id: string) => `/training/${id}`);
  (splitStringIntoArray as jest.Mock).mockImplementation((str: string) => str.split(', '));
  (modifyTimeDDMMYY as jest.Mock).mockReturnValue('01/01/2024');
  (getFormattedPrice as jest.Mock).mockImplementation((price: number) => `$${price}`);
});

const renderComponent = (
  trainingOverrides: Partial<PrimeLearningObject> = {},
  props: Record<string, any> = {}
) => {
  const training = { ...baseTraining, ...trainingOverrides } as PrimeLearningObject;
  return render(
    <SpectrumProvider theme={defaultTheme}>
      <IntlProvider locale="en" messages={{}}>
        <PrimeTrainingList
          training={training}
          account={mockAccount}
          guest={false}
          showRating={false}
          showEffectivenessIndex={false}
          handleLoEnrollment={jest.fn()}
          updateLearningObject={jest.fn()}
          removeTrainingFromListById={jest.fn()}
          {...props}
        />
      </IntlProvider>
    </SpectrumProvider>
  );
};

describe('PrimeTrainingList', () => {
  describe('Completion status icons', () => {
    it('completionStatus_standardCompleted_rendersStandardCompletionIcon', () => {
      renderComponent({ enrollment: { state: 'COMPLETED' } as any });
      expect(screen.getByTestId('standard-completion-icon')).toBeInTheDocument();
    });

    it('completionStatus_started_hidesCompletionIcon', () => {
      renderComponent({ enrollment: { state: 'STARTED' } as any });
      expect(screen.queryByTestId('standard-completion-icon')).not.toBeInTheDocument();
    });

    it('completionStatus_alternateCompleted_rendersAlternateCompletionIcon', () => {
      (isAccAltCompletionEnabled as jest.Mock).mockReturnValue(true);
      renderComponent({ isAlternateComplete: true } as any);
      expect(screen.getByTestId('alternate-completion-icon')).toBeInTheDocument();
    });

    it('completionStatus_jobAidLoType_hidesCompletionIconEvenWhenCompleted', () => {
      renderComponent({ loType: 'jobAid', enrollment: { state: 'COMPLETED' } as any });
      // The template gates completion icons on loType !== JOBAID
      expect(screen.queryByTestId('standard-completion-icon')).not.toBeInTheDocument();
    });
  });

  describe('Price display', () => {
    it('price_canShowPriceTrue_showsFormattedPrice', () => {
      (canShowPrice as jest.Mock).mockReturnValue(true);
      renderComponent({ price: 99.99 });
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('price_canShowPriceFalse_hidesPrice', () => {
      (canShowPrice as jest.Mock).mockReturnValue(false);
      renderComponent({ price: 99.99 });
      expect(screen.queryByText('$99.99')).not.toBeInTheDocument();
    });
  });

  describe('Rating and effectiveness index', () => {
    it('rating_showRatingTrue_rendersRatingTemplate', () => {
      (useRatingsTemplate as jest.Mock).mockReturnValue(
        <div data-testid="rating-template">Rating</div>
      );
      renderComponent({}, { showRating: true });
      expect(screen.getByTestId('rating-template')).toBeInTheDocument();
    });

    it('rating_showRatingFalse_hidesRatingTemplate', () => {
      (useRatingsTemplate as jest.Mock).mockReturnValue(
        <div data-testid="rating-template">Rating</div>
      );
      renderComponent({}, { showRating: false });
      expect(screen.queryByTestId('rating-template')).not.toBeInTheDocument();
    });

    it('effectivenessIndex_nonZeroWithEnabled_rendersEffectivenessLink', () => {
      (GetTranslationsReplaced as jest.Mock).mockReturnValue('effectiveness-label');
      renderComponent({ effectivenessIndex: 85 }, { showEffectivenessIndex: true });
      expect(screen.getByRole('link', { name: 'effectiveness-label' })).toBeInTheDocument();
    });

    it('effectivenessIndex_zeroValue_hidesEffectivenessLink', () => {
      renderComponent({ effectivenessIndex: 0 }, { showEffectivenessIndex: true });
      // getEffectivenessIndexTemplate returns null when effectivenessIndex === 0
      expect(screen.queryByRole('link', { name: /effectiveness/i })).not.toBeInTheDocument();
    });

    it('effectivenessDialog_clickLink_opensDialog_clickClose_closesDialog', () => {
      (GetTranslationsReplaced as jest.Mock).mockReturnValue('eff-label');
      renderComponent({ effectivenessIndex: 85 }, { showEffectivenessIndex: true });

      userEvent.click(screen.getByRole('link', { name: 'eff-label' }));
      expect(screen.getByTestId('effectiveness-dialog')).toBeInTheDocument();

      userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByTestId('effectiveness-dialog')).not.toBeInTheDocument();
    });
  });

  describe('State button label', () => {
    it('showStateButton_jobAid_rendersExploreButton', () => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
        enrollment: null,
      });
      renderComponent({ loType: 'jobAid' });
      expect(screen.getByRole('button', { name: 'alm.text.explore' })).toBeInTheDocument();
    });

    it('showStateButton_enrolledNonJobAid_rendersVisitButton', () => {
      const enrollment = { state: 'STARTED', progressPercent: 50, loInstance: { id: 'instance1' } };
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'course',
        enrollment,
      });
      renderComponent({ enrollment: enrollment as any });
      expect(screen.getByRole('button', { name: 'alm.text.visit' })).toBeInTheDocument();
    });
  });

  describe('Job aid metadata actions', () => {
    beforeEach(() => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
        enrollment: null,
      });
    });

    it('jobAidMetadata_guest_rendersNoAddOrRemoveActions', () => {
      renderComponent({ loType: 'jobAid' }, { guest: true });
      expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remove-icon')).not.toBeInTheDocument();
    });

    it('jobAidMetadata_notEnrolled_rendersAddIcon', () => {
      renderComponent({ loType: 'jobAid' });
      expect(screen.getAllByTestId('add-icon').length).toBeGreaterThan(0);
    });

    it('jobAidMetadata_enrolled_rendersRemoveIcon', () => {
      const enrollment = { state: 'STARTED', loInstance: { id: 'instance1' } };
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
        enrollment,
      });
      renderComponent({ loType: 'jobAid', enrollment: enrollment as any });
      expect(screen.getAllByTestId('remove-icon').length).toBeGreaterThan(0);
    });

    it('jobAidMetadata_downloadableContentType_rendersDownloadIcon', () => {
      renderComponent({
        loType: 'jobAid',
        instances: [{ id: 'instance1', loResources: [{ resources: [{ downloadUrl: 'https://example.com/file.pdf', contentType: 'PDF' }] }] }] as any,
      });
      expect(screen.getAllByTestId('download-icon').length).toBeGreaterThan(0);
    });

    it('jobAidMetadata_otherContentType_hidesDownloadIcon', () => {
      renderComponent({
        loType: 'jobAid',
        instances: [{ id: 'instance1', loResources: [{ resources: [{ downloadUrl: 'https://example.com/file', contentType: 'OTHER' }] }] }] as any,
      });
      expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
    });
  });

  describe('Job aid click handlers', () => {
    beforeEach(() => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
        enrollment: null,
      });
    });

    it('exploreClick_guest_callsRedirectToLoginAndAbort', async () => {
      renderComponent({ loType: 'jobAid' }, { guest: true });
      userEvent.click(screen.getByRole('button', { name: 'alm.text.explore' }));
      await waitFor(() => {
        expect(redirectToLoginAndAbort).toHaveBeenCalledWith(true);
      });
      expect(mockEnroll).not.toHaveBeenCalled();
    });

    it('exploreClick_notGuest_callsEnrollThenHandleJobAidClick', async () => {
      renderComponent({ loType: 'jobAid' }, { guest: false });
      userEvent.click(screen.getByRole('button', { name: 'alm.text.explore' }));
      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledTimes(1);
        expect(mockHandleJobAidClick).toHaveBeenCalledTimes(1);
      });
    });

    it('addToMyList_enrollSuccess_callsAlmAlertWithSuccessMessage', async () => {
      renderComponent({ loType: 'jobAid' }, { guest: false });
      const addButton = screen.getAllByTestId('add-icon')[0].closest('button')!;
      userEvent.click(addButton);
      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledTimes(1);
        expect(mockAlmAlert).toHaveBeenCalledWith(true, 'alm.jobaid.added', 'success');
      });
    });

    it('addToMyList_enrollError_callsAlmAlertWithErrorMessage', async () => {
      mockEnroll.mockRejectedValue(new Error('Enrollment failed'));
      renderComponent({ loType: 'jobAid' }, { guest: false });
      const addButton = screen.getAllByTestId('add-icon')[0].closest('button')!;
      userEvent.click(addButton);
      await waitFor(() => {
        expect(mockAlmAlert).toHaveBeenCalledWith(true, 'alm.enrollment.error', 'error');
      });
    });
  });

  describe('Progress bar for enrolled training', () => {
    it('progressBar_withEnrollment_rendersProgressPercent', () => {
      const enrollment = { state: 'STARTED', progressPercent: 50, loInstance: { id: 'instance1' } };
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        enrollment,
      });
      renderComponent({ enrollment: enrollment as any });
      // Component renders metadata in two containers (desktop + mobile), both show progress
      expect(screen.getAllByText('50% complete').length).toBeGreaterThan(0);
    });

    it('progressBar_noEnrollment_hidesProgressPercent', () => {
      renderComponent();
      expect(screen.queryByText(/% complete/)).not.toBeInTheDocument();
    });
  });

  describe('Snippets vs description', () => {
    it('snippets_withSnippets_rendersSnippetContent', () => {
      const snippets = [{ snippetType: 'courseName', snippet: 'Highlighted snippet text' }];
      renderComponent({ snippets: snippets as any });
      expect(screen.getByText('Highlighted snippet text')).toBeInTheDocument();
    });

    it('snippets_noSnippets_rendersDescription', () => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        description: 'Plain description text',
      });
      renderComponent({ snippets: [] });
      expect(screen.getByText('Plain description text')).toBeInTheDocument();
    });
  });

  describe('Published date', () => {
    it('publishedDate_learningProgram_usesDateUpdated_notDatePublished', () => {
      renderComponent({
        loType: 'learningProgram',
        dateUpdated: '2024-06-15T00:00:00Z',
        datePublished: '2024-01-01T00:00:00Z',
      } as any);
      expect(modifyTimeDDMMYY).toHaveBeenCalledWith('2024-06-15T00:00:00Z', expect.any(String));
      expect(modifyTimeDDMMYY).not.toHaveBeenCalledWith('2024-01-01T00:00:00Z', expect.any(String));
    });

    it('publishedDate_course_usesDatePublished', () => {
      renderComponent({ loType: 'course', datePublished: '2024-03-20T00:00:00Z' } as any);
      expect(modifyTimeDDMMYY).toHaveBeenCalledWith('2024-03-20T00:00:00Z', expect.any(String));
    });
  });

  describe('Title and thumbnail: anchor vs button', () => {
    it('nonJobAid_rendersTitleAndThumbnailAsAnchorsWithHref', () => {
      renderComponent({ loType: 'course' });

      const titleEl = screen.getByText('Test Training').closest('a, button');
      expect(titleEl?.tagName).toBe('A');
      expect(titleEl).toHaveAttribute('href', '/training/training1');

      const imageContainer = document.querySelector(`[data-automationid="Test Training-imageContainer"]`);
      expect(imageContainer?.tagName).toBe('A');
      expect(imageContainer).toHaveAttribute('href', '/training/training1');
    });

    it('jobAid_rendersTitleAndThumbnailAsButtonsWithoutHref', () => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
      });
      renderComponent({ loType: 'jobAid' });

      const titleEl = screen.getByText('Test Training').closest('a, button');
      expect(titleEl?.tagName).toBe('BUTTON');
      expect(titleEl).toHaveAttribute('type', 'button');
      expect(titleEl).not.toHaveAttribute('href');

      const imageContainer = document.querySelector(`[data-automationid="Test Training-imageContainer"]`);
      expect(imageContainer?.tagName).toBe('BUTTON');
      expect(imageContainer).toHaveAttribute('type', 'button');
      expect(imageContainer).not.toHaveAttribute('href');
    });

    it('jobAid_clickTitleButton_invokesEnrollAndHandleJobAidClickNotCardClickHandler', async () => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        type: 'jobAid',
      });
      renderComponent({ loType: 'jobAid' }, { guest: false });

      const titleEl = screen.getByText('Test Training').closest('button')!;
      userEvent.click(titleEl);

      await waitFor(() => {
        expect(mockEnroll).toHaveBeenCalledTimes(1);
        expect(mockHandleJobAidClick).toHaveBeenCalledTimes(1);
      });
      expect(mockCardClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Skills display', () => {
    it('skills_withSkillNames_rendersFirstSkillFromList', () => {
      (splitStringIntoArray as jest.Mock).mockReturnValue(['JavaScript', 'React']);
      renderComponent();
      // getAllByText since skills label appears in both desktop and mobile containers
      expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
    });

    it('skills_noSkillNames_rendersNotApplicableTranslation', () => {
      (useTrainingCard as jest.Mock).mockReturnValue({
        ...defaultTrainingCardReturn(),
        skillNames: null,
      });
      renderComponent();
      expect(screen.getAllByText('alm.not.applicable').length).toBeGreaterThan(0);
    });
  });
});
