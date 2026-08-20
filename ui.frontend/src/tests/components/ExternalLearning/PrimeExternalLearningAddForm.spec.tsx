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

// NOTE: ALM Jest runs with resetMocks:true, which wipes jest.fn() implementations
// before each test. Mocks whose return value must survive are declared as plain
// functions here (not jest.fn); getALMConfig varies per test so it's a jest.fn
// whose implementation is (re)set in beforeEach.

// Provider is mocked to expose the locale prop it receives, so we can assert the
// app locale is forwarded to React Spectrum (which drives DatePicker/DateRangePicker
// localisation).
jest.mock('@adobe/react-spectrum', () => ({
  __esModule: true,
  lightTheme: {},
  Provider: ({ children, locale }: any) => (
    <div data-testid="spectrum-provider" data-locale={locale}>
      {children}
    </div>
  ),
  Heading: ({ children }: any) => <h1>{children}</h1>,
}));

jest.mock('@react-spectrum/toast', () => ({
  ToastContainer: () => null,
  ToastQueue: { negative: () => {}, info: () => {}, positive: () => {} },
}));

jest.mock('@utils/global', () => ({
  __esModule: true,
  getALMConfig: jest.fn(() => ({ locale: 'en-US' })),
  getALMObject: () => ({
    navigateToMyLearningPage: () => {},
    navigateToExternalLearningPage: () => {},
    navigateToHomePage: () => {},
  }),
  canAddExternalLearning: () => true,
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
}));

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => ({ user: { account: { externalLearning: true } } }),
}));

jest.mock('@contextProviders/DeviceContextProvider', () => ({
  useDeviceTypeContext: () => ({ isMobile: false, isTablet: false, isDesktop: true }),
}));

jest.mock('@hooks/externalLearning', () => ({
  useExternalLearningAddForm: () => ({
    externalLearningForm: { coreFields: [], customFields: [] },
    isLoading: false,
    submitExternalLearning: () => Promise.resolve(),
  }),
}));

jest.mock('@hooks/externalLearning/useExternalLearningForm', () => ({
  useExternalLearningForm: () => ({
    isUploading: false,
    isSubmitting: false,
    setIsSubmitting: () => {},
    isConfirmOpen: false,
    setIsConfirmOpen: () => {},
    showToastBackdrop: false,
    setShowToastBackdrop: () => {},
    buildPayload: () => ({}),
    validateForm: () => true,
  }),
}));

jest.mock('@components/ExternalLearning/ExternalLearningFormFields', () => ({
  __esModule: true,
  default: () => <div data-testid="form-fields" />,
}));

jest.mock('@components/ExternalLearning/ExternalLearningBreadcrumb', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../almLib/components/Common/StickyActionBar', () => ({
  __esModule: true,
  StickyActionBar: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../../../almLib/components/Common/ALMErrorBoundary', () => ({
  __esModule: true,
  ALMErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../../almLib/components/Common/ALMLoader', () => ({
  __esModule: true,
  ALMLoader: () => <div data-testid="alm-loader" />,
}));

jest.mock('../../../almLib/components/ALMPopup/ALMPopup', () => ({
  __esModule: true,
  ALMPopup: ({ children }: any) => <div>{children}</div>,
  ALMPopupContent: ({ children }: any) => <div>{children}</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrimeExternalLearningAddForm from '@components/ExternalLearning/PrimeExternalLearningAddForm';
import * as globalUtils from '@utils/global';

const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;

const getProviderLocale = () =>
  screen.getByTestId('spectrum-provider').getAttribute('data-locale');

beforeEach(() => {
  // resetMocks:true wipes the jest.fn impl between tests — restore a default.
  mockGetALMConfig.mockReturnValue({ locale: 'en-US' } as any);
});

describe('PrimeExternalLearningAddForm – Provider locale', () => {
  it('forwardsHyphenatedAppLocaleToProvider', () => {
    mockGetALMConfig.mockReturnValue({ locale: 'ja-JP' } as any);
    render(<PrimeExternalLearningAddForm />);
    expect(getProviderLocale()).toBe('ja-JP');
  });

  it('normalizesUnderscoreLocaleToBcp47', () => {
    mockGetALMConfig.mockReturnValue({ locale: 'ja_JP' } as any);
    render(<PrimeExternalLearningAddForm />);
    expect(getProviderLocale()).toBe('ja-JP');
  });

  it('fallsBackToEnUsWhenLocaleMissing', () => {
    mockGetALMConfig.mockReturnValue({ locale: '' } as any);
    render(<PrimeExternalLearningAddForm />);
    expect(getProviderLocale()).toBe('en-US');
  });

  it('fallsBackToEnUsWhenLocaleUndefined', () => {
    mockGetALMConfig.mockReturnValue({} as any);
    render(<PrimeExternalLearningAddForm />);
    expect(getProviderLocale()).toBe('en-US');
  });

  it('forwardsFrenchLocaleUnchanged', () => {
    mockGetALMConfig.mockReturnValue({ locale: 'fr-FR' } as any);
    render(<PrimeExternalLearningAddForm />);
    expect(getProviderLocale()).toBe('fr-FR');
  });
});
