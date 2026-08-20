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
/**
 * Unit tests for useTrainingPage.tsx hook
 * Focused on the getTraining error-handling path: when fetching a training
 * fails, the hook should surface an alert and navigate away, routing
 * PERSONALIZED_PATH errors to the home page and everything else to the catalog.
 *
 * Note: jest.config.js sets `resetMocks: true`, which wipes mock implementations
 * (including ones set via the jest.mock() factory below) before every test.
 * All default return values are therefore (re-)established in beforeEach.
 */

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(),
  getALMAccount: jest.fn(),
  getALMObject: jest.fn(),
  getALMUser: jest.fn(),
  getPageAttributes: jest.fn(),
  isAccAltCompletionEnabled: jest.fn(),
}));

jest.mock('@utils/lo-utils', () => ({
  determineLoType: jest.fn(),
  fetchCourseInstanceMapping: jest.fn(),
  getErrorMessage: jest.fn(),
  getTraining: jest.fn(),
  getTrainingFromOfflineCache: jest.fn(),
}));

jest.mock('@utils/hooks', () => ({
  filterTrainingInstance: jest.fn(),
  getLocale: jest.fn(),
  useBadge: jest.fn(),
  useCardIcon: jest.fn(),
  useLocalizedMetaData: jest.fn(),
  useTrainingSkills: jest.fn(),
}));

jest.mock('@utils/catalog', () => ({
  getJobaidUrl: jest.fn(),
  isJobaidContentTypeUrl: jest.fn(),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(),
  getPreferredLocalizedMetadata: jest.fn(),
}));

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('@common/Alert/useAlert', () => ({
  useAlert: jest.fn(),
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    getTraining: jest.fn(),
    getTrainingInstanceSummary: jest.fn(),
  },
}));

jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(),
}));

jest.mock('@utils/playback-utils', () => ({
  LaunchPlayer: jest.fn(),
}));

jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { ajax: jest.fn() },
}));

jest.mock('@common/ALMCustomHooks', () => ({
  DEFUALT_LO_INCLUDE: '',
}));

jest.mock('@hooks/catalog/useTrainingPageHelper', () => ({
  findPrimaryEnrolledInstance: jest.fn(),
}));

jest.mock('@utils/breadcrumbUtils', () => ({
  clearBreadcrumbPathDetails: jest.fn(),
  getBreadcrumbPath: jest.fn(),
  popFromBreadcrumbPath: jest.fn(),
  restorePreviousBreadcrumbPath: jest.fn(),
}));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useTrainingPage } from '@hooks/catalog/useTrainingPage';
import APIServiceInstance from '@common/APIService';
import * as loUtils from '@utils/lo-utils';
import * as hooksUtils from '@utils/hooks';
import * as globalUtils from '@utils/global';
import { useAlert } from '@common/Alert/useAlert';
import { useUserContext } from '@contextProviders/userContextProvider';
import { PERSONALIZED_PATH, COURSE } from '@utils/constants';

const mockGetTraining = APIServiceInstance.getTraining as jest.MockedFunction<
  typeof APIServiceInstance.getTraining
>;
const mockGetTrainingInstanceSummary =
  APIServiceInstance.getTrainingInstanceSummary as jest.MockedFunction<
    typeof APIServiceInstance.getTrainingInstanceSummary
  >;
const mockDetermineLoType = loUtils.determineLoType as jest.MockedFunction<
  typeof loUtils.determineLoType
>;
const mockGetErrorMessage = loUtils.getErrorMessage as jest.MockedFunction<
  typeof loUtils.getErrorMessage
>;
const mockGetTrainingFromOfflineCache = loUtils.getTrainingFromOfflineCache as jest.MockedFunction<
  typeof loUtils.getTrainingFromOfflineCache
>;
const mockFilterTrainingInstance = hooksUtils.filterTrainingInstance as jest.MockedFunction<
  typeof hooksUtils.filterTrainingInstance
>;
const mockGetLocale = hooksUtils.getLocale as jest.MockedFunction<typeof hooksUtils.getLocale>;
const mockUseBadge = hooksUtils.useBadge as jest.MockedFunction<typeof hooksUtils.useBadge>;
const mockUseCardIcon = hooksUtils.useCardIcon as jest.MockedFunction<typeof hooksUtils.useCardIcon>;
const mockUseLocalizedMetaData = hooksUtils.useLocalizedMetaData as jest.MockedFunction<
  typeof hooksUtils.useLocalizedMetaData
>;
const mockUseTrainingSkills = hooksUtils.useTrainingSkills as jest.MockedFunction<
  typeof hooksUtils.useTrainingSkills
>;
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;
const mockGetALMAccount = globalUtils.getALMAccount as jest.MockedFunction<
  typeof globalUtils.getALMAccount
>;
const mockGetALMObject = globalUtils.getALMObject as jest.MockedFunction<
  typeof globalUtils.getALMObject
>;
const mockGetPageAttributes = globalUtils.getPageAttributes as jest.MockedFunction<
  typeof globalUtils.getPageAttributes
>;
const mockIsAccAltCompletionEnabled =
  globalUtils.isAccAltCompletionEnabled as jest.MockedFunction<
    typeof globalUtils.isAccAltCompletionEnabled
  >;
const mockUseAlert = useAlert as jest.MockedFunction<typeof useAlert>;
const mockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;

function createStoreWithState() {
  return createStore(() => ({
    appState: { isOnline: true },
    catalog: { offlineTrainings: [] },
  }));
}

function renderTrainingPageHook(trainingId: string) {
  const result: any = { current: null };
  const store = createStoreWithState();
  const container = document.createElement('div');
  document.body.appendChild(container);

  function TestComponent() {
    result.current = useTrainingPage(trainingId);
    return null;
  }

  act(() => {
    ReactDOM.render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={{}}>
          <TestComponent />
        </IntlProvider>
      </Provider>,
      container
    );
  });

  return {
    result,
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    },
  };
}

describe('useTrainingPage', () => {
  const mockAlmAlert = jest.fn();
  let almObject: {
    isPrimeUserLoggedIn: jest.Mock;
    navigateToCatalogPage: jest.Mock;
    navigateToHomePage: jest.Mock;
  };

  beforeEach(() => {
    almObject = {
      isPrimeUserLoggedIn: jest.fn(() => true),
      navigateToCatalogPage: jest.fn(),
      navigateToHomePage: jest.fn(),
    };

    mockGetALMConfig.mockReturnValue({ primeApiURL: 'https://test.api.com/primeapi/v2' } as any);
    mockGetALMAccount.mockResolvedValue({} as any);
    mockGetALMObject.mockReturnValue(almObject as any);
    mockGetPageAttributes.mockReturnValue({} as any);
    mockIsAccAltCompletionEnabled.mockReturnValue(false);

    mockGetTrainingFromOfflineCache.mockReturnValue(null as any);
    mockGetErrorMessage.mockReturnValue('Something went wrong');

    mockFilterTrainingInstance.mockImplementation(
      (response: any) => ({ learningObject: response } as any)
    );
    mockGetLocale.mockReturnValue('');
    mockUseBadge.mockReturnValue(undefined as any);
    mockUseCardIcon.mockReturnValue({
      cardIconUrl: '',
      color: '',
      bannerUrl: '',
      cardBgStyle: {},
    } as any);
    mockUseLocalizedMetaData.mockReturnValue({} as any);
    mockUseTrainingSkills.mockReturnValue([] as any);

    mockUseAlert.mockReturnValue([mockAlmAlert] as any);
    mockUseUserContext.mockReturnValue({
      user: { account: {}, contentLocale: 'en-US' },
    } as any);

    mockGetTrainingInstanceSummary.mockResolvedValue(null as any);
  });

  describe('getTraining error handling', () => {
    it('navigates to the home page when a PERSONALIZED_PATH training fails to load', async () => {
      jest.useFakeTimers();
      mockDetermineLoType.mockReturnValue(PERSONALIZED_PATH as any);
      mockGetTraining.mockRejectedValue({ status: 500 });

      const { unmount } = renderTrainingPageHook('personalizedPath:123');

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(mockAlmAlert).toHaveBeenCalledWith(true, 'Something went wrong', 'error');
      expect(almObject.navigateToHomePage).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(almObject.navigateToHomePage).toHaveBeenCalled();
      expect(almObject.navigateToCatalogPage).not.toHaveBeenCalled();

      jest.useRealTimers();
      unmount();
    });

    it('navigates to the catalog page when a non-PERSONALIZED_PATH training fails to load', async () => {
      mockDetermineLoType.mockReturnValue(COURSE as any);
      mockGetTraining.mockRejectedValue({ status: 500 });

      const { unmount } = renderTrainingPageHook('course:123');

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(mockAlmAlert).toHaveBeenCalledWith(true, 'Something went wrong', 'error');
      expect(almObject.navigateToCatalogPage).toHaveBeenCalledWith({ timeOut: 300 });
      expect(almObject.navigateToHomePage).not.toHaveBeenCalled();

      unmount();
    });

    it('does not navigate away when getErrorMessage returns an empty message', async () => {
      mockDetermineLoType.mockReturnValue(PERSONALIZED_PATH as any);
      mockGetErrorMessage.mockReturnValue('');
      mockGetTraining.mockRejectedValue({ status: 500 });

      const { unmount } = renderTrainingPageHook('personalizedPath:123');

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(mockAlmAlert).not.toHaveBeenCalled();
      expect(almObject.navigateToHomePage).not.toHaveBeenCalled();
      expect(almObject.navigateToCatalogPage).not.toHaveBeenCalled();

      unmount();
    });
  });
});
