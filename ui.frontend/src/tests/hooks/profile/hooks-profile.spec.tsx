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
 * Unit tests for hooks/profile
 * Tests all profile-related React hooks
 */

// Mock dependencies BEFORE imports to prevent circular dependency issues
jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({
    primeApiURL: 'https://test.api.com/primeapi/v2',
    commerceURL: 'https://test.commerce.com',
    graphqlProxyPath: 'https://test.graphql.com',
    locale: 'en-US',
    accountId: 'test-account',
  })),
  getALMObject: jest.fn(() => ({
    storage: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() } as any,
    isPrimeUserLoggedIn: jest.fn(() => true),
  })),
  getALMUser: jest.fn(() => Promise.resolve({ user: { id: 'user:123' } })),
  getALMAttribute: jest.fn(),
  getQueryParamsFromUrl: jest.fn(() => ({})),
  updateALMUser: jest.fn(),
  updateUserProfileImage: jest.fn(),
  getAccountActiveFields: jest.fn(() => Promise.resolve([])),
  updateAccountActiveFieldsDetails: jest.fn(),
}));
jest.mock('@utils/restAdapter', () => ({
  RestAdapter: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } as any,
}));
jest.mock('@utils/jsonAPIAdapter', () => ({
  JsonApiParse: jest.fn(data => (typeof data === 'string' ? JSON.parse(data).data : data.data)),
}));
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn(key => key),
  GetTranslationReplaced: jest.fn(),
  getPreferredLocalizedMetadata: jest.fn(),
}));

jest.mock('@utils/uploadUtils', () => ({
  getUploadInfo: jest.fn(() => Promise.resolve({ uploadUrl: 'http://upload.com' })),
  uploadFile: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock('@common/Alert/useAlert', () => {
  return {
    __esModule: true,
    useAlert: () => [jest.fn()],
  };
});

jest.mock('@utils/widgets/base/EventHandlingBase', () => ({
  PrimeDispatchEvent: jest.fn(),
}));

jest.mock('@common/APIService', () => ({
  __esModule: true,
  default: {
    updateSkillInterest: jest.fn(() => Promise.resolve({})),
    loadMore: jest.fn(() => Promise.resolve({})),
  } as any,
}));

import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { useProfile } from '@hooks/profile';
import { useRecommendations } from '@hooks/profile/useRecommendations';
import { useSkills } from '@hooks/profile/useSkills';
import { useUserSkillInterest } from '@hooks/profile/useUserSkillInterest';
import * as globalUtils from '@utils/global';
import * as uploadUtils from '@utils/uploadUtils';
import * as restAdapterModule from '@utils/restAdapter';
import * as jsonAPIAdapter from '@utils/jsonAPIAdapter';
import * as translationService from '@utils/translationService';
import APIServiceInstance from '@common/APIService';
import { AlertType } from '@common/Alert/AlertDialog';
import { PrimeDispatchEvent } from '@utils/widgets/base/EventHandlingBase';
import { PrimeEvent } from '@utils/widgets/common';
import { RECOMMENDATION_PRODUCTS, INTERNAL } from '@utils/constants';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Import useAlert after mock is set up
const { useAlert } = require('@common/Alert/useAlert');

// Custom renderHook implementation for React Testing Library v9
function renderHook<T>(hookCallback: () => T, options?: { wrapper?: React.ComponentType<any> }) {
  const result: any = { current: null };
  let renderCount = 0;
  let resolveNextUpdate: (() => void) | null = null;

  function TestComponent() {
    result.current = hookCallback();
    if (renderCount > 0 && resolveNextUpdate) {
      const resolve = resolveNextUpdate;
      resolveNextUpdate = null;
      Promise.resolve().then(resolve);
    }
    renderCount++;
    return null;
  }

  const Wrapper = options?.wrapper || React.Fragment;
  const container = document.createElement('div');

  if (document.body) {
    document.body.appendChild(container);
  }

  const component = React.createElement(Wrapper, null, React.createElement(TestComponent));

  ReactDOM.render(component, container);

  return {
    result,
    rerender: () => {
      const newComponent = React.createElement(Wrapper, null, React.createElement(TestComponent));
      ReactDOM.render(newComponent, container);
    },
    unmount: () => {
      ReactDOM.unmountComponentAtNode(container);
      if (document.body && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    },
    waitForNextUpdate: () => {
      return new Promise<void>(resolve => {
        resolveNextUpdate = resolve;
        // Timeout to prevent hanging if no update occurs
        setTimeout(() => {
          if (resolveNextUpdate === resolve) {
            resolveNextUpdate = null;
            resolve();
          }
        }, 100);
      });
    },
  };
}

// Mock dependencies
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;
const mockGetALMUser = globalUtils.getALMUser as jest.MockedFunction<typeof globalUtils.getALMUser>;
const mockUpdateALMUser = globalUtils.updateALMUser as jest.MockedFunction<
  typeof globalUtils.updateALMUser
>;
const mockUpdateUserProfileImage = globalUtils.updateUserProfileImage as jest.MockedFunction<
  typeof globalUtils.updateUserProfileImage
>;
const mockGetAccountActiveFields = globalUtils.getAccountActiveFields as jest.MockedFunction<
  typeof globalUtils.getAccountActiveFields
>;
const mockUpdateAccountActiveFieldsDetails =
  globalUtils.updateAccountActiveFieldsDetails as jest.MockedFunction<
    typeof globalUtils.updateAccountActiveFieldsDetails
  >;
const mockGetUploadInfo = uploadUtils.getUploadInfo as jest.MockedFunction<
  typeof uploadUtils.getUploadInfo
>;
const mockUploadFile = uploadUtils.uploadFile as jest.MockedFunction<typeof uploadUtils.uploadFile>;
const mockRestAdapter = restAdapterModule.RestAdapter as jest.Mocked<
  typeof restAdapterModule.RestAdapter
>;
const mockJsonApiParse = jsonAPIAdapter.JsonApiParse as jest.MockedFunction<
  typeof jsonAPIAdapter.JsonApiParse
>;
const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<
  typeof translationService.GetTranslation
>;
const mockUseAlert = useAlert as jest.MockedFunction<typeof useAlert>;
const mockPrimeDispatchEvent = PrimeDispatchEvent as jest.MockedFunction<typeof PrimeDispatchEvent>;

// Mock Redux store
const createMockStore = (initialState: any) => {
  return createStore(() => initialState);
};

// Mock wrapper for Redux
const createWrapper = (store: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('hooks/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Create alert dialog element for useAlert
    if (!document.getElementById('alertDialog')) {
      const alertDiv = document.createElement('div');
      alertDiv.id = 'alertDialog';
      document.body.appendChild(alertDiv);
    }

    mockGetALMConfig.mockReturnValue({
      primeApiURL: 'https://test.api.com/',
    } as any);

    mockGetALMUser.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://test.com/avatar.jpg',
        fields: {} as any,
        uiLocale: 'en-US',
        contentLocale: 'en-US',
        timeZoneCode: 'America/New_York',
        enrollOnClick: false,
      } as any,
    } as any);

    mockGetAccountActiveFields.mockResolvedValue({} as any);
    mockGetTranslation.mockImplementation((key: string) => key);
    mockJsonApiParse.mockReturnValue({} as any);
  });

  // ==========================================
  // useProfile Hook
  // ==========================================

  describe('useProfile', () => {
    it('should initialize profile attributes on mount', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      expect(mockGetALMUser).toHaveBeenCalled();
      expect(mockGetAccountActiveFields).toHaveBeenCalled();
      expect(result.current.profileAttributes.user.id).toBe('user-123');
    });

    it('should handle error during profile setup', async () => {
      mockGetALMUser.mockRejectedValue({ status: 404 });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      expect(result.current.errorCode).toBe(404);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should update profile image successfully', async () => {
      mockGetUploadInfo.mockResolvedValue({} as any);
      mockUploadFile.mockResolvedValue('https://test.com/new-image.jpg');
      mockRestAdapter.post = jest.fn().mockResolvedValue({});
      mockUpdateALMUser.mockResolvedValue({
        user: { id: 'user-123', avatarUrl: 'https://test.com/new-image.jpg' } as any,
      } as any);
      mockUpdateUserProfileImage.mockResolvedValue({} as any);

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      let updatedUser: any;

      await act(async () => {
        updatedUser = await result.current.updateProfileImage('test.jpg', file);
      });

      expect(mockGetUploadInfo).toHaveBeenCalled();
      expect(mockUploadFile).toHaveBeenCalledWith('test.jpg', file);
      expect(mockRestAdapter.post).toHaveBeenCalledWith({
        url: 'https://test.api.com/avatar',
        method: 'POST',
        body: JSON.stringify({ imageUrl: 'https://test.com/new-image.jpg' }),
        headers: {
          'Content-Type': 'application/vnd.api+json;charset=UTF-8',
        } as any,
      });
      expect(updatedUser.avatarUrl).toBe('https://test.com/new-image.jpg');
    });

    it('should handle error during image upload', async () => {
      mockGetUploadInfo.mockRejectedValue({ status: 500 });

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      let updatedUser: any;

      await act(async () => {
        updatedUser = await result.current.updateProfileImage('test.jpg', file);
      });

      expect(updatedUser).toBeNull();
      expect(result.current.errorCode).toBe(500);
    });

    it('should delete profile image successfully', async () => {
      mockRestAdapter.delete = jest.fn().mockResolvedValue({});
      mockUpdateALMUser.mockResolvedValue({
        user: { id: 'user-123', avatarUrl: '' } as any,
      } as any);
      mockUpdateUserProfileImage.mockResolvedValue({} as any);

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      let updatedUser: any;

      await act(async () => {
        updatedUser = await result.current.deleteProfileImage();
      });

      expect(mockRestAdapter.delete).toHaveBeenCalledWith({
        url: 'https://test.api.com/avatar',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/vnd.api+json;charset=UTF-8',
        } as any,
      });
      expect(updatedUser.avatarUrl).toBe('');
    });

    it('should update account active fields', async () => {
      mockUpdateAccountActiveFieldsDetails.mockResolvedValue({} as any);

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateAccountActiveFields({ field1: 'value1' }, 'user-123');
      });

      expect(mockUpdateAccountActiveFieldsDetails).toHaveBeenCalledWith(
        { field1: 'value1' } as any,
        'user-123'
      );
      // Note: We can't assert on almAlert being called since it's a different mock instance each time
    });

    it('should handle error in account active fields update', async () => {
      mockUpdateAccountActiveFieldsDetails.mockRejectedValue(new Error('Update failed'));

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateAccountActiveFields({ field1: 'value1' }, 'user-123');
      });

      // The API was called despite rejection
      expect(mockUpdateAccountActiveFieldsDetails).toHaveBeenCalledWith(
        { field1: 'value1' } as any,
        'user-123'
      );
    });

    it('should update profile settings', async () => {
      mockRestAdapter.ajax = jest.fn().mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateProfileSettings({ shouldEnrollOnClick: true });
      });

      expect(mockRestAdapter.ajax).toHaveBeenCalled();
      expect(mockPrimeDispatchEvent).toHaveBeenCalledWith(
        document,
        PrimeEvent.ALM_USER_PROFILE_UPDATED
      );
    });

    it('should update bio', async () => {
      mockRestAdapter.ajax = jest.fn().mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateBio('user-123', { bio: 'New bio' });
      });

      expect(mockRestAdapter.ajax).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123',
        method: 'PATCH',
        body: JSON.stringify({
          data: {
            type: 'user',
            id: 'user-123',
            attributes: { bio: 'New bio' } as any,
          } as any,
        }),
        headers: { 'content-type': 'application/json' } as any,
      });
    });

    it('should update user preferences', async () => {
      mockRestAdapter.ajax = jest.fn().mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateUserPreferences('user-123', {
          uiLocale: 'fr-FR',
          contentLocale: 'fr-FR',
          timeZoneCode: 'Europe/Paris',
          enrollOnClick: true,
        });
      });

      expect(mockRestAdapter.ajax).toHaveBeenCalled();
    });

    it('should detect user preferences changes', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      const originalUser = {
        uiLocale: 'en-US',
        contentLocale: 'en-US',
        timeZoneCode: 'America/New_York',
        enrollOnClick: false,
      } as any;

      const updatedUser = {
        ...originalUser,
        uiLocale: 'fr-FR',
      } as any;

      const hasChanged = result.current.hasUserPreferencesChanged(originalUser, updatedUser);

      expect(hasChanged).toBe(true);
    });

    it('should return false for no preferences changes', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      const originalUser = {
        uiLocale: 'en-US',
        contentLocale: 'en-US',
        timeZoneCode: 'America/New_York',
        enrollOnClick: false,
      } as any;

      const hasChanged = result.current.hasUserPreferencesChanged(originalUser, originalUser);

      expect(hasChanged).toBe(false);
    });

    it('should return false for null users', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProfile());

      await waitForNextUpdate();

      const hasChanged = result.current.hasUserPreferencesChanged(null, null);

      expect(hasChanged).toBe(false);
    });
  });

  // ==========================================
  // useRecommendations Hook
  // ==========================================

  describe('useRecommendations', () => {
    const initialState = {
      userRecommendationPreference: {
        items: {} as any,
        next: '',
        products: { items: [], next: '' } as any,
        roles: { items: [], next: '' } as any,
        levels: { items: [], next: '' } as any,
      } as any,
    };

    it('should fetch user recommendation preferences', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        userRecommendationPreferences: { id: 'pref-1' } as any,
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.getUserRecommendationPreferences();
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/recommendationPreferences',
      });
    });

    it('should handle error in fetching recommendations', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockRejectedValue(new Error('API Error'));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.getUserRecommendationPreferences();
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should get recommendations for products', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        recommendationProductList: [{ id: 'product-1' } as any],
        links: { next: 'https://next.url' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.getRecommendationsForType(RECOMMENDATION_PRODUCTS);
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: `https://test.api.com//${RECOMMENDATION_PRODUCTS}?filter.showAllRecommendationCriteria=true`,
      });
    });

    it('should get recommendations for roles', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        recommendationRoleList: [{ id: 'role-1' } as any],
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.getRecommendationsForType('roles');
      });

      expect(mockRestAdapter.get).toHaveBeenCalled();
    });

    it('should get recommendation levels', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        data: [{ id: 'level-1' } as any] as any,
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.getRecommendationLevels();
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//data?filter.recommendationCriteria=level&filter.showAllRecommendationCriteria=true',
      });
    });

    it('should save user recommendations', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.post = jest.fn().mockResolvedValue({ success: true });
      mockRestAdapter.get = jest.fn().mockResolvedValue({});

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      const data = { preferences: ['product-1', 'role-2'] };
      let response: any;

      await act(async () => {
        response = await result.current.saveUserRecommedations(data);
      });

      expect(mockRestAdapter.post).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/recommendationPreferences',
        method: 'POST',
        body: JSON.stringify({ data }),
        headers: { 'content-type': 'application/json' } as any,
      });
      expect(response.success).toBe(true);
    });

    it('should refresh from the POST response without a second round-trip', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.post = jest.fn().mockResolvedValue({ data: { id: 'pref-1' } });
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        userRecommendationPreferences: { id: 'pref-1', products: [], roles: [] } as any,
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.saveUserRecommedations({ preferences: ['product-1'] });
      });

      expect(mockJsonApiParse).toHaveBeenCalledWith({ data: { id: 'pref-1' } });
      expect(mockRestAdapter.get).not.toHaveBeenCalled();
    });

    it('should fall back to a re-fetch when the POST returns no body (204)', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.post = jest.fn().mockResolvedValue('');
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        userRecommendationPreferences: { id: 'pref-1' } as any,
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.saveUserRecommedations({ preferences: [] });
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/recommendationPreferences',
      });
    });

    it('should throw error on save failure', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.post = jest.fn().mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      await expect(result.current.saveUserRecommedations({})).rejects.toThrow('ERROR IN API');
    });

    it('should return hasMoreItems correctly', () => {
      const stateWithNext = {
        userRecommendationPreference: {
          ...initialState.userRecommendationPreference,
          next: 'https://next.url',
        } as any,
      };

      const store = createMockStore(stateWithNext);

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.hasMoreItems).toBe(true);
    });
  });

  // ==========================================
  // useSkills Hook
  // ==========================================

  describe('useSkills', () => {
    const initialState = {
      skill: {
        items: [],
        next: '',
      } as any,
    };

    it('should fetch skills', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        skillList: [{ id: 'skill-1', name: 'JavaScript' } as any],
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useSkills(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.fetchSkills();
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//skills?',
        params: {
          sort: 'name',
          'page[offset]': '0',
          'page[limit]': '10',
          'filter.excludeSkillInterest': true,
          'filter.activeSkillsOnly': true,
        } as any,
      });
    });

    it('should search skills', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        skillList: [{ id: 'skill-2', name: 'React' } as any],
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useSkills(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.searchSkill('React');
      });

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//search?',
        params: expect.objectContaining({
          query: 'React',
          type: 'skill',
        }),
      });
    });

    it('should load more skills', async () => {
      const stateWithNext = {
        skill: {
          items: [{ id: 'skill-1' } as any],
          next: 'https://next.url',
        } as any,
      };

      const store = createMockStore(stateWithNext);
      (APIServiceInstance.loadMore as jest.Mock).mockResolvedValue({
        skillList: [{ id: 'skill-2' } as any],
        links: { next: '' } as any,
      });

      const { result } = renderHook(() => useSkills(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.loadMoreSkills();
      });

      expect(APIServiceInstance.loadMore).toHaveBeenCalledWith('https://next.url');
    });

    it('should not load more if no next URL', async () => {
      const store = createMockStore(initialState);

      const { result } = renderHook(() => useSkills(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.loadMoreSkills();
      });

      expect(APIServiceInstance.loadMore).not.toHaveBeenCalled();
    });

    it('should handle error in fetch skills', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockRejectedValue(new Error('API Error'));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useSkills(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.fetchSkills();
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });

  // ==========================================
  // useUserSkillInterest Hook
  // ==========================================

  describe('useUserSkillInterest', () => {
    const initialState = {
      userSkillInterest: {
        items: [],
        next: '',
      } as any,
    };

    it('should fetch user skill interests on mount', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockResolvedValue({});
      (mockJsonApiParse.mockReturnValue as any)({
        userSkillInterestList: [{ id: 'interest-1' } as any],
        links: { next: '' } as any,
      });

      const { waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      expect(mockRestAdapter.get).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/userSkillInterest?',
        params: {
          type: INTERNAL,
          'page[offset]': '0',
          'page[limit]': '10',
          include: 'skill,userSkills.skillLevel',
        } as any,
      });
    });

    it('should save user skill interest', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.ajax = jest.fn().mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      const skills = { skillIds: ['skill-1', 'skill-2'] };

      await act(async () => {
        await result.current.saveUserSkillInterest(skills);
      });

      expect(mockRestAdapter.ajax).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/userSkillInterest?',
        method: 'POST',
        body: JSON.stringify(skills),
        headers: { 'content-type': 'application/json' } as any,
      });
    });

    it('should remove user skill interest', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.ajax = jest.fn().mockResolvedValue({});

      const { result, waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.removeUserSkillInterest('skill-123');
      });

      expect(mockRestAdapter.ajax).toHaveBeenCalledWith({
        url: 'https://test.api.com//users/user-123/userSkillInterest/skill-123?',
        method: 'DELETE',
        headers: { 'content-type': 'application/json' } as any,
      });
    });

    it('should load more user skill interests', async () => {
      const stateWithNext = {
        userSkillInterest: {
          items: [{ id: 'interest-1' } as any],
          next: 'https://next.url',
        } as any,
      };

      const store = createMockStore(stateWithNext);
      (APIServiceInstance.loadMore as jest.Mock).mockResolvedValue({
        userSkillInterestList: [{ id: 'interest-2' } as any],
        links: { next: '' } as any,
      });

      const { result, waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.loadMoreUserSkillInterest();
      });

      expect(APIServiceInstance.loadMore).toHaveBeenCalledWith('https://next.url');
    });

    it('should handle error in fetch user skill interests', async () => {
      const store = createMockStore(initialState);
      mockRestAdapter.get = jest.fn().mockRejectedValue(new Error('API Error'));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const { waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should return hasMoreItems correctly', async () => {
      const stateWithNext = {
        userSkillInterest: {
          items: [],
          next: 'https://next.url',
        } as any,
      };

      const store = createMockStore(stateWithNext);

      const { result, waitForNextUpdate } = renderHook(() => useUserSkillInterest(), {
        wrapper: createWrapper(store),
      });

      await waitForNextUpdate();

      expect(result.current.hasMoreItems).toBe(true);
    });
  });
});
