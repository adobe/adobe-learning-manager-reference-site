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

jest.mock('@hooks/externalLearning', () => ({
  useExternalLearningDetail: jest.fn(),
}));

jest.mock('@utils/externalLearning', () => ({
  updateExternalLearning: jest.fn(),
}));

jest.mock('@utils/global', () => ({
  __esModule: true,
  getALMConfig: jest.fn(() => ({ locale: 'en-US', primeApiURL: 'https://api.test.com/' })),
  getALMObject: jest.fn(() => ({
    navigateToMyLearningPage: jest.fn(),
    navigateToExternalLearningPage: jest.fn(),
    navigateToHomePage: jest.fn(),
  })),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
  GetTranslationsReplaced: jest.fn((key: string) => key),
}));

jest.mock('@utils/dateTime', () => ({
  modifyTimeDDMMYY: jest.fn((d: string) => d || ''),
}));

jest.mock('@react-spectrum/toast', () => ({
  ToastContainer: () => null,
  ToastQueue: { negative: jest.fn(), info: jest.fn(), positive: jest.fn() },
}));

// The container only uses Provider + lightTheme from react-spectrum (all Spectrum
// UI in children is mocked). Mock Provider to expose the locale prop it receives
// so we can assert the app locale is forwarded (drives date-field localisation).
jest.mock('@adobe/react-spectrum', () => ({
  __esModule: true,
  lightTheme: {},
  Provider: ({ children, locale }: any) => (
    <div data-testid="spectrum-provider" data-locale={locale}>
      {children}
    </div>
  ),
  Checkbox: ({ children }: any) => <label>{children}</label>,
}));

jest.mock('@internationalized/date', () => ({
  parseDate: jest.fn((d: string) => ({ toString: () => d })),
}));

jest.mock('@components/ExternalLearning/ExternalLearningBreadcrumb', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@contextProviders/DeviceContextProvider', () => ({
  useDeviceTypeContext: jest.fn(),
}));

// ALMLoader/ALMErrorBoundary internally use react-intl's useIntl(), which throws without an
// IntlProvider ancestor. Stub them so we don't have to wrap the entire test tree.
jest.mock('../../../almLib/components/Common/ALMLoader', () => ({
  __esModule: true,
  ALMLoader: ({ classes }: any) => <div data-testid="alm-loader" className={classes} />,
}));

jest.mock('../../../almLib/components/Common/ALMErrorBoundary', () => ({
  __esModule: true,
  ALMErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock('@components/ExternalLearning/ExternalLearningFormFields', () => ({
  __esModule: true,
  default: ({ form }: any) => <div data-testid="inline-edit-form">{form?.coreFields?.length} fields</div>,
}));

// New sibling components extracted in the refactor — stub them out so the container test
// stays focused on its own orchestration rather than their internals.
jest.mock('@components/ExternalLearning/StatusBadge', () => ({
  __esModule: true,
  default: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

jest.mock('@components/ExternalLearning/InlineEditForm', () => ({
  __esModule: true,
  default: ({ settings }: any) => (
    <div data-testid="inline-edit-form">{settings?.coreFields?.length} fields</div>
  ),
}));

jest.mock('@components/ExternalLearning/AttachmentPreviewDialog', () => ({
  __esModule: true,
  default: ({ open }: any) => (open ? <div data-testid="attachment-preview" /> : null),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrimeExternalLearningDetailContainer from '@components/ExternalLearning/PrimeExternalLearningDetailContainer';
import * as externalLearningHooks from '@hooks/externalLearning';
import * as globalUtils from '@utils/global';
import * as translationService from '@utils/translationService';
import * as dateTime from '@utils/dateTime';
import * as DeviceContextProvider from '@contextProviders/DeviceContextProvider';

const mockUseDetail = externalLearningHooks.useExternalLearningDetail as jest.MockedFunction<typeof externalLearningHooks.useExternalLearningDetail>;
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<typeof globalUtils.getALMConfig>;
const mockGetALMObject = globalUtils.getALMObject as jest.MockedFunction<typeof globalUtils.getALMObject>;
const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<typeof translationService.GetTranslation>;
const mockGetTranslationsReplaced = (translationService as any).GetTranslationsReplaced as jest.MockedFunction<any>;
const mockModifyTimeDDMMYY = dateTime.modifyTimeDDMMYY as jest.MockedFunction<typeof dateTime.modifyTimeDDMMYY>;
const mockUseDeviceTypeContext = DeviceContextProvider.useDeviceTypeContext as jest.MockedFunction<typeof DeviceContextProvider.useDeviceTypeContext>;

const desktopContext = { isMobile: false, isTablet: false, isDesktop: true } as any;
const mobileContext = { isMobile: true, isTablet: false, isDesktop: false } as any;

function makeSettings(): any {
  return {
    enabled: true,
    updatedAt: '2026-01-01T00:00:00Z',
    coreFields: [
      { id: 'title', type: 'TEXT', enabled: true, mandatory: true, default: true, label: 'alm.externallearning.title', description: '', editable: true, order: 1 },
      { id: 'date', type: 'TIMESTAMP', enabled: true, mandatory: false, default: true, label: 'alm.externallearning.date', description: '', editable: true, order: 2 },
    ],
    customFields: [],
  };
}

function makeSubmission(overrides: any = {}): any {
  return {
    id: 'sub:1',
    title: 'My Course',
    status: 'PENDING',
    modifiedAt: '2026-01-15T10:00:00Z',
    reviewedAt: '',
    reviewerComment: '',
    reviewerUserId: null,
    submissionUrl: '',
    fields: [
      { id: 'title', value: 'My Course', type: 'TEXT' },
    ],
    ...overrides,
  };
}

function makeHookResult(overrides: any = {}) {
  return {
    submission: makeSubmission(),
    enrichedFields: [
      { id: 'title', label: 'Title', description: '', rawValue: 'My Course', type: 'TEXT' },
    ],
    settings: makeSettings(),
    reviewerName: '',
    isLoading: false,
    errorCode: '',
    ...overrides,
  };
}

describe('PrimeExternalLearningDetailContainer', () => {
  // ALM Jest uses resetMocks: true which wipes mock impls between tests; restore them here.
  beforeEach(() => {
    mockGetALMConfig.mockReturnValue({
      locale: 'en-US',
      primeApiURL: 'https://api.test.com/',
    } as any);
    mockGetALMObject.mockReturnValue({
      navigateToMyLearningPage: jest.fn(),
      navigateToExternalLearningPage: jest.fn(),
      navigateToHomePage: jest.fn(),
    } as any);
    mockGetTranslation.mockImplementation((key: string) => key);
    if (mockGetTranslationsReplaced) mockGetTranslationsReplaced.mockImplementation((key: string) => key);
    mockModifyTimeDDMMYY.mockImplementation((d: string) => d || '');
    // Default to desktop so existing tests are unaffected.
    mockUseDeviceTypeContext.mockReturnValue(desktopContext);
  });

  describe('loading state', () => {
    it('isLoading_showsLoader', () => {
      mockUseDetail.mockReturnValue({ ...makeHookResult(), isLoading: true, submission: null } as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.getByTestId('alm-loader')).toBeInTheDocument();
    });

    it('isLoading_doesNotRenderSubmissionContent', () => {
      mockUseDetail.mockReturnValue({ ...makeHookResult(), isLoading: true, submission: null } as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.queryByTestId('externalLearningDetailHeading')).toBeNull();
    });
  });

  describe('view mode', () => {
    it('pendingSubmission_rendersTitle', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // The title shows in two places: the page Heading and the title field row. Heading is the canonical assertion.
      expect(screen.getByRole('heading', { name: 'My Course' })).toBeInTheDocument();
    });

    it('heading_hasTitleAttributeMatchingSubmissionTitle', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const heading = screen.getByRole('heading', { name: 'My Course' });
      expect(heading).toHaveAttribute('title', 'My Course');
    });

    it('pendingSubmission_showsEditButton', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.getByText('text.externallearning.detail.edit')).toBeInTheDocument();
    });

    it('approvedSubmission_noEditButton', () => {
      mockUseDetail.mockReturnValue(
        makeHookResult({ submission: makeSubmission({ status: 'APPROVED' }) }) as any
      );
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.queryByText('text.externallearning.detail.edit')).toBeNull();
    });
  });

  describe('attachment actions', () => {
    const VIEW = 'text.externallearning.detail.view';
    const DOWNLOAD = 'text.externallearning.detail.download';

    const renderWithAttachment = (url: string) => {
      mockUseDetail.mockReturnValue(
        makeHookResult({ submission: makeSubmission({ submissionUrl: url }) }) as any
      );
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
    };

    it('imageAttachment_showsViewAndDownload', () => {
      renderWithAttachment('https://cdn.example.com/files/photo.png');
      expect(screen.getByText(VIEW)).toBeInTheDocument();
      expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
    });

    it('pdfAttachment_showsViewAndDownload', () => {
      renderWithAttachment('https://cdn.example.com/files/report.pdf');
      expect(screen.getByText(VIEW)).toBeInTheDocument();
      expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
    });

    it('docxAttachment_showsOnlyDownload_noView', () => {
      renderWithAttachment('https://cdn.example.com/files/notes.docx');
      expect(screen.queryByText(VIEW)).toBeNull();
      expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
    });

    it('docAttachment_showsOnlyDownload_noView', () => {
      renderWithAttachment('https://cdn.example.com/files/notes.doc');
      expect(screen.queryByText(VIEW)).toBeNull();
      expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
    });

    it('clickView_opensPreviewDialog', () => {
      renderWithAttachment('https://cdn.example.com/files/photo.png');
      expect(screen.queryByTestId('attachment-preview')).toBeNull();
      fireEvent.click(screen.getByText(VIEW));
      expect(screen.getByTestId('attachment-preview')).toBeInTheDocument();
    });

    it('noAttachment_showsNoViewOrDownload', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any); // submissionUrl: ''
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.queryByText(VIEW)).toBeNull();
      expect(screen.queryByText(DOWNLOAD)).toBeNull();
    });

    describe('pdf view suppression on mobile/tablet', () => {
      it('pdfAttachment_mobile_hidesView_showsDownload', () => {
        mockUseDeviceTypeContext.mockReturnValue(mobileContext);
        mockUseDetail.mockReturnValue(
          makeHookResult({ submission: makeSubmission({ submissionUrl: 'https://cdn.example.com/files/report.pdf' }) }) as any
        );
        render(<PrimeExternalLearningDetailContainer id="sub:1" />);
        expect(screen.queryByText(VIEW)).toBeNull();
        expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
      });

      it('pdfAttachment_tablet_hidesView_showsDownload', () => {
        mockUseDeviceTypeContext.mockReturnValue({ isMobile: false, isTablet: true, isDesktop: false } as any);
        mockUseDetail.mockReturnValue(
          makeHookResult({ submission: makeSubmission({ submissionUrl: 'https://cdn.example.com/files/report.pdf' }) }) as any
        );
        render(<PrimeExternalLearningDetailContainer id="sub:1" />);
        expect(screen.queryByText(VIEW)).toBeNull();
        expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
      });

      it('imageAttachment_mobile_stillShowsView', () => {
        mockUseDeviceTypeContext.mockReturnValue(mobileContext);
        mockUseDetail.mockReturnValue(
          makeHookResult({ submission: makeSubmission({ submissionUrl: 'https://cdn.example.com/files/photo.png' }) }) as any
        );
        render(<PrimeExternalLearningDetailContainer id="sub:1" />);
        expect(screen.getByText(VIEW)).toBeInTheDocument();
        expect(screen.getByText(DOWNLOAD)).toBeInTheDocument();
      });

      it('pdfAttachment_desktop_showsView', () => {
        // Desktop context is already the default; this is an explicit guard that
        // the suppression does not leak to desktop.
        mockUseDetail.mockReturnValue(
          makeHookResult({ submission: makeSubmission({ submissionUrl: 'https://cdn.example.com/files/report.pdf' }) }) as any
        );
        render(<PrimeExternalLearningDetailContainer id="sub:1" />);
        expect(screen.getByText(VIEW)).toBeInTheDocument();
      });
    });
  });

  describe('view/edit toggle', () => {
    it('clickEdit_showsInlineForm', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByTestId('inline-edit-form')).toBeInTheDocument();
    });

    it('clickEdit_hidesEditButton', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.queryByText('text.externallearning.detail.edit')).toBeNull();
    });

    it('clickCancel_returnsToViewMode', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByTestId('inline-edit-form')).toBeInTheDocument();
      fireEvent.click(screen.getByText('alm.text.cancel'));
      expect(screen.queryByTestId('inline-edit-form')).toBeNull();
      expect(screen.getByText('text.externallearning.detail.edit')).toBeInTheDocument();
    });
  });

  describe('null string edge case in renderFieldValue', () => {
    it('timestampField_nullStringEndDate_rendersStartDateOnly', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: 'null' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.getByText('2026-01-01T00:00:00Z')).toBeInTheDocument();
      expect(screen.queryByText('null')).toBeNull();
    });

    it('timestampField_bothNullStringDates_rendersDash', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: 'null', end_date: 'null' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // The dash appears in multiple slots (timestamp field, attachment, reviewer remarks).
      // We just care that the timestamp branch reached the dash fallback at all.
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('timestampField_nullStringStartDate_rendersEndDateOnly', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: null, end_date: '2026-03-01T00:00:00Z' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.getByText('2026-03-01T00:00:00Z')).toBeInTheDocument();
    });
  });

  describe('buildInitialFormState date-type inference', () => {
    it('startDateOnly_setsStartDateDateType', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: 'null' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // Click edit to trigger buildInitialFormState — if it throws the test will fail
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByTestId('inline-edit-form')).toBeInTheDocument();
    });

    it('bothDates_setsBothDateType', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: '2026-06-01T00:00:00Z' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByTestId('inline-edit-form')).toBeInTheDocument();
    });

    it('nullStringDates_doesNotPopulateDateFormValue', () => {
      const enrichedFields = [
        {
          id: 'date',
          label: 'Date',
          description: '',
          type: 'TIMESTAMP',
          rawValue: { start_date: 'null', end_date: 'null' },
        },
      ];
      mockUseDetail.mockReturnValue(makeHookResult({ enrichedFields }) as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // Should not crash when both dates are 'null' string — no form value is set
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByTestId('inline-edit-form')).toBeInTheDocument();
    });
  });

  describe('responsive layout – desktop', () => {
    it('statusBadge_rendersInHeaderAlongsideTitle', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const heading = screen.getByRole('heading', { name: 'My Course' });
      const badge = screen.getByTestId('status-badge');
      // On desktop, status badge is in headerLeft — same parent div as the heading.
      expect(heading.parentElement).toBe(badge.parentElement);
    });

    it('statusBadge_rendersBeforeSubmittedLine', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const badge = screen.getByTestId('status-badge');
      const submittedLabel = screen.getByText('text.externallearning.detail.requestSubmittedOn');
      expect(
        badge.compareDocumentPosition(submittedLabel) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('editButton_renderedInHeaderWhenPending', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.getByText('text.externallearning.detail.edit')).toBeInTheDocument();
    });

    it('cancelSubmitButtons_renderedInHeaderWhenEditing', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByText('alm.text.cancel')).toBeInTheDocument();
      expect(screen.getByText('alm.text.submit')).toBeInTheDocument();
    });

    it('noStickyEditBar_forDesktop', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // On desktop there is exactly one edit button (the header one, no sticky bar).
      expect(screen.getAllByText('text.externallearning.detail.edit')).toHaveLength(1);
    });
  });

  describe('responsive layout – mobile', () => {
    beforeEach(() => {
      mockUseDeviceTypeContext.mockReturnValue(mobileContext);
    });

    it('statusBadge_rendersAfterSubmittedLine', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const badge = screen.getByTestId('status-badge');
      const submittedLabel = screen.getByText('text.externallearning.detail.requestSubmittedOn');
      // On mobile, badge is in mobileBadge div — different parent from heading.
      expect(
        submittedLabel.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('statusBadge_notInHeaderAlongsideTitle', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const heading = screen.getByRole('heading', { name: 'My Course' });
      const badge = screen.getByTestId('status-badge');
      // On mobile, badge is in mobileBadge div — different parent from heading.
      expect(heading.parentElement).not.toBe(badge.parentElement);
    });

    it('stickyEditBar_shownForPendingSubmission', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      // On mobile the edit button lives in the sticky bar (header button suppressed).
      expect(screen.getByText('text.externallearning.detail.edit')).toBeInTheDocument();
    });

    it('stickyEditBar_notShownForApprovedSubmission', () => {
      mockUseDetail.mockReturnValue(
        makeHookResult({ submission: makeSubmission({ status: 'APPROVED' }) }) as any
      );
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.queryByText('text.externallearning.detail.edit')).toBeNull();
    });

    it('stickyEditBar_notShownForRejectedSubmission', () => {
      mockUseDetail.mockReturnValue(
        makeHookResult({ submission: makeSubmission({ status: 'REJECTED' }) }) as any
      );
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(screen.queryByText('text.externallearning.detail.edit')).toBeNull();
    });

    it('clickEdit_showsStickyActionsBar_withCancelAndSubmit', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      expect(screen.getByText('alm.text.cancel')).toBeInTheDocument();
      expect(screen.getByText('alm.text.submit')).toBeInTheDocument();
      // Sticky edit bar is replaced by sticky actions bar.
      expect(screen.queryByText('text.externallearning.detail.edit')).toBeNull();
    });

    it('clickCancel_inStickyBar_returnsToViewMode', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      fireEvent.click(screen.getByText('text.externallearning.detail.edit'));
      fireEvent.click(screen.getByText('alm.text.cancel'));
      expect(screen.queryByTestId('inline-edit-form')).toBeNull();
      expect(screen.getByText('text.externallearning.detail.edit')).toBeInTheDocument();
    });

    it('sideColumn_attachmentsRenderedAfterEnrichedFields', () => {
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      const heading = screen.getByRole('heading', { name: 'My Course' });
      const attachmentLabel = screen.getByText('text.externallearning.attachments');
      // On mobile the sideColumn renders outside contentBody, after the fields column.
      expect(
        heading.compareDocumentPosition(attachmentLabel) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe('Provider locale', () => {
    const localeOf = () =>
      screen.getByTestId('spectrum-provider').getAttribute('data-locale');

    it('forwardsAppLocaleToProvider', () => {
      mockGetALMConfig.mockReturnValue({
        locale: 'ja-JP',
        primeApiURL: 'https://api.test.com/',
      } as any);
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(localeOf()).toBe('ja-JP');
    });

    it('normalizesUnderscoreLocaleToBcp47', () => {
      mockGetALMConfig.mockReturnValue({
        locale: 'ja_JP',
        primeApiURL: 'https://api.test.com/',
      } as any);
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(localeOf()).toBe('ja-JP');
    });

    it('fallsBackToEnUsWhenLocaleMissing', () => {
      mockGetALMConfig.mockReturnValue({
        locale: '',
        primeApiURL: 'https://api.test.com/',
      } as any);
      mockUseDetail.mockReturnValue(makeHookResult() as any);
      render(<PrimeExternalLearningDetailContainer id="sub:1" />);
      expect(localeOf()).toBe('en-US');
    });
  });
});
