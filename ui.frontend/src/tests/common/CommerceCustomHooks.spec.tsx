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
 * Unit Tests for CommerceCustomHooks
 *
 * NOTE: This is a complex class (527 lines) with extensive dependencies:
 * - Apollo Client (GraphQL)
 * - Multiple custom hooks instances
 * - Storage utilities
 * - Filter transformations
 *
 * This lean test suite focuses on:
 * - Core business logic (filter transformations, SKU conversion)
 * - Login delegation patterns
 * - Cart operations
 *
 * Recommend integration tests for complete Apollo/GraphQL flows.
 */

import CommerceCustomHooksInstance from '../../almLib/common/CommerceCustomHooks';
import { getIndividualFiltersForCommerce } from '../../almLib/utils/catalog';

// Mock dependencies
const mockGetALMConfig = jest.fn();
const mockIsUserLoggedIn = jest.fn();
const mockRedirectToLoginAndAbort = jest.fn();
const mockGetItemFromStorage = jest.fn();
const mockSetItemToStorage = jest.fn();
const mockGetQueryParamsFromUrl = jest.fn();

const mockApolloClient = {
  query: jest.fn(),
  mutate: jest.fn(),
};

const mockALMCustomHooks = {
  getTrainings: jest.fn(),
  loadMoreTrainings: jest.fn(),
  getTrainingsForAuthor: jest.fn(),
  loadMore: jest.fn(),
  getTrainingInstanceSummary: jest.fn(),
  enrollToTraining: jest.fn(),
  unenrollFromTraining: jest.fn(),
  getFilters: jest.fn(),
  getUsersBadges: jest.fn(),
  loadMoreBadges: jest.fn(),
  getAllDiscussions: jest.fn(),
  loadMoreDiscussion: jest.fn(),
  postDiscussion: jest.fn(),
  deleteDiscussion: jest.fn(),
  getCatalogsByIds: jest.fn(),
  fetchCourseInstanceMapping: jest.fn(),
  getCoursePathWidgetTrainings: jest.fn(),
  getCategoryWidgetData: jest.fn(),
};

const mockAkamaiCustomHooks = {
  getTraining: jest.fn(),
};

jest.mock('../../almLib/utils/global', () => ({
  getALMConfig: () => mockGetALMConfig(),
  isUserLoggedIn: () => mockIsUserLoggedIn(),
  redirectToLoginAndAbort: () => mockRedirectToLoginAndAbort(),
  getItemFromStorage: key => mockGetItemFromStorage(key),
  setItemToStorage: (key, value) => mockSetItemToStorage(key, value),
  getQueryParamsFromUrl: () => mockGetQueryParamsFromUrl(),
}));

jest.mock('../../almLib/contextProviders', () => ({
  apolloClient: mockApolloClient,
}));

jest.mock('../../almLib/common/ALMCustomHooks', () => ({
  __esModule: true,
  default: mockALMCustomHooks,
  DEFAULT_PAGE_LIMIT: 9,
}));

jest.mock('../../almLib/common/AkamaiCustomHooks', () => ({
  __esModule: true,
  default: mockAkamaiCustomHooks,
}));

jest.mock('../../almLib/utils/catalog', () => ({
  getIndividualFiltersForCommerce: jest.fn((options, state, key) => []),
  sortList: jest.fn(list => list),
}));

jest.mock('../../almLib/utils/filters', () => ({
  getDefaultFiltersState: jest.fn(() => ({
    loTypes: { list: [] },
    loFormat: { list: [] },
    duration: { list: [] },
    learnerState: { list: [] },
    skillName: { list: [] },
    tagName: { list: [] },
    catalogs: { list: [] },
    price: { list: [], maxPrice: 0 },
    skillLevel: { list: [] },
  })),
  updateFilterList: jest.fn(list => list),
}));

jest.mock('../../almLib/utils/jsonAPIAdapter', () => ({
  parseCommerceResponse: jest.fn(items => items || []),
}));

jest.mock('../../almLib/utils/lo-utils', () => ({
  defaultCartValues: { redirectionUrl: '', error: [''] },
}));

jest.mock('../../almLib/common/APIService', () => ({
  __esModule: true,
  default: {
    registerServiceInstance: jest.fn(),
  },
}));

describe('CommerceCustomHooks', () => {
  const mockConfig = {
    primeCdnTrainingBaseEndpoint: 'https://cdn.example.com/training',
    esBaseUrl: 'https://es.example.com',
    almCdnBaseUrl: 'https://cdn.alm.example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetALMConfig.mockReturnValue(mockConfig);
    mockIsUserLoggedIn.mockReturnValue(false);
    mockRedirectToLoginAndAbort.mockReturnValue(false);
    mockGetItemFromStorage.mockReturnValue(null);
    mockGetQueryParamsFromUrl.mockReturnValue({});
    mockApolloClient.query.mockResolvedValue({ data: { products: { items: [], page_info: {} } } });
    mockApolloClient.mutate.mockResolvedValue({ data: {} });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(typeof CommerceCustomHooksInstance).toBe('object');
    });

    it('should have config properties', () => {
      expect(CommerceCustomHooksInstance.primeCdnTrainingBaseEndpoint).toBe('https://cdn.example.com/training');
      expect(CommerceCustomHooksInstance.esBaseUrl).toBe('https://es.example.com');
      expect(CommerceCustomHooksInstance.almCdnBaseUrl).toBe('https://cdn.alm.example.com');
    });
  });

  describe('getTraining', () => {
    it('should delegate to AkamaiCustomHooksInstance', async () => {
      const trainingId = 'course:123';
      const params = { include: 'instances' };
      mockAkamaiCustomHooks.getTraining.mockResolvedValue({ id: trainingId });

      await CommerceCustomHooksInstance.getTraining(trainingId, params);

      expect(mockAkamaiCustomHooks.getTraining).toHaveBeenCalledWith(trainingId, params);
    });

    it('should always use Akamai regardless of login status', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);

      await CommerceCustomHooksInstance.getTraining('course:123', {});

      expect(mockAkamaiCustomHooks.getTraining).toHaveBeenCalled();
    });
  });

  describe('Login Delegation Pattern', () => {
    describe('when user is logged in', () => {
      beforeEach(() => {
        mockIsUserLoggedIn.mockReturnValue(true);
      });

      it('should delegate getTrainings to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.getTrainings({} as any, 'name', '', false);

        expect(mockALMCustomHooks.getTrainings).toHaveBeenCalled();
        expect(mockApolloClient.query).not.toHaveBeenCalled();
      });

      it('should delegate loadMoreTrainings to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.loadMoreTrainings({} as any, 'name', '', '1', false);

        expect(mockALMCustomHooks.loadMoreTrainings).toHaveBeenCalled();
      });

      it('should delegate getTrainingsForAuthor to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.getTrainingsForAuthor('author123', 'internal', 'name');

        expect(mockALMCustomHooks.getTrainingsForAuthor).toHaveBeenCalled();
      });

      it('should delegate getFilters to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.getFilters();

        expect(mockALMCustomHooks.getFilters).toHaveBeenCalled();
        expect(mockApolloClient.query).not.toHaveBeenCalled();
      });

      it('should delegate getUsersBadges to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.getUsersBadges('user123', {});

        expect(mockALMCustomHooks.getUsersBadges).toHaveBeenCalled();
      });

      it('should delegate getCatalogsByIds to ALMCustomHooks', async () => {
        await CommerceCustomHooksInstance.getCatalogsByIds(['cat1']);

        expect(mockALMCustomHooks.getCatalogsByIds).toHaveBeenCalled();
      });
    });

    describe('when user is not logged in', () => {
      beforeEach(() => {
        mockIsUserLoggedIn.mockReturnValue(false);
      });

      it('should return undefined for getTrainingsForAuthor', async () => {
        const result = await CommerceCustomHooksInstance.getTrainingsForAuthor(
          'author123',
          'internal',
          'name'
        );

        expect(result).toBeUndefined();
        expect(mockALMCustomHooks.getTrainingsForAuthor).not.toHaveBeenCalled();
      });

      it('should return null for getTrainingInstanceSummary', async () => {
        const result = await CommerceCustomHooksInstance.getTrainingInstanceSummary(
          'course:123',
          'inst456'
        );

        expect(result).toBeNull();
      });

      it('should return null for getCatalogsByIds', async () => {
        const result = await CommerceCustomHooksInstance.getCatalogsByIds(['cat1']);

        expect(result).toBeNull();
      });
    });
  });

  describe('getTrainings filter transform (guest)', () => {
    const mockGetIndividualFilters = getIndividualFiltersForCommerce as jest.Mock;

    beforeEach(() => {
      mockIsUserLoggedIn.mockReturnValue(false);
      // Cached commerce filters so getTransformedFilter resolves without an Apollo round-trip
      // (and the skillName/tagName boolean maps don't break the internal .forEach).
      mockGetItemFromStorage.mockReturnValue([]);
      mockGetIndividualFilters.mockReturnValue([]);
      mockApolloClient.query.mockResolvedValue({
        data: { products: { items: [], page_info: { current_page: 1, total_pages: 1 } } },
      });
    });

    it('omits skill/tag filters when nothing is selected (empty boolean map)', async () => {
      await CommerceCustomHooksInstance.getTrainings(
        { skillName: {}, tagName: {} } as any,
        'name',
        '',
        false
      );

      const { variables } = mockApolloClient.query.mock.calls[0][0];
      expect(variables.filter).not.toHaveProperty('almskill');
      expect(variables.filter).not.toHaveProperty('almtags');
    });

    it('includes the skill filter when a skill is selected', async () => {
      mockGetIndividualFilters.mockReturnValueOnce(['java_val']);

      await CommerceCustomHooksInstance.getTrainings(
        { skillName: { Java: true } } as any,
        'name',
        '',
        false
      );

      const { variables } = mockApolloClient.query.mock.calls[0][0];
      expect(variables.filter.almskill).toEqual({ in: ['java_val'] });
    });
  });

  describe('Login + Redirect Pattern', () => {
    it('should check redirect for loadMore', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await CommerceCustomHooksInstance.loadMore('https://api.example.com/next');

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should check redirect for enrollToTraining', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await CommerceCustomHooksInstance.enrollToTraining();

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should check redirect for unenrollFromTraining', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await CommerceCustomHooksInstance.unenrollFromTraining('enroll123');

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should check redirect for loadMoreBadges', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await CommerceCustomHooksInstance.loadMoreBadges('url');

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should check redirect for discussion operations', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      await CommerceCustomHooksInstance.getAllDiscussions({}, 'course:123');
      await CommerceCustomHooksInstance.loadMoreDiscussion('url');
      await CommerceCustomHooksInstance.postDiscussion('course:123', {});
      await CommerceCustomHooksInstance.deleteDiscussion('course:123', 'post456');

      expect(mockRedirectToLoginAndAbort).toHaveBeenCalledTimes(4);
    });
  });

  describe('addProductToCart - SKU Conversion', () => {
    it('should convert SKU format from underscore to colon', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(false);
      mockGetItemFromStorage.mockReturnValue('cart123');
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          addProductsToCart: {
            cart: { items: [], total_quantity: 0 },
            user_errors: null,
          },
        },
      });

      // SKU format: course:1234_12345 → should convert to course:1234:12345
      await CommerceCustomHooksInstance.addProductToCart('course:1234_12345');

      expect(mockApolloClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            sku: 'course:1234:12345',
          }),
        })
      );
    });

    it('should return error when redirect is required', async () => {
      mockRedirectToLoginAndAbort.mockReturnValue(true);

      const result = await CommerceCustomHooksInstance.addProductToCart('sku123');

      expect(result.error).toBe(true);
      expect(result.items).toEqual([]);
      expect(mockApolloClient.mutate).not.toHaveBeenCalled();
    });

    it('should use cartId from storage', async () => {
      const cartId = 'cart-xyz-123';
      mockGetItemFromStorage.mockReturnValue(cartId);
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          addProductsToCart: {
            cart: { items: [], total_quantity: 1 },
            user_errors: null,
          },
        },
      });

      await CommerceCustomHooksInstance.addProductToCart('course:123_456');

      expect(mockGetItemFromStorage).toHaveBeenCalledWith('CART_ID');
      expect(mockApolloClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            cartId,
          }),
        })
      );
    });

    it('should handle Apollo mutation errors', async () => {
      mockGetItemFromStorage.mockReturnValue('cart123');
      mockApolloClient.mutate.mockRejectedValue(new Error('Network error'));

      const result = await CommerceCustomHooksInstance.addProductToCart('course:123_456');

      expect(result.error).toEqual(['Network error']);
      expect(result.items).toEqual([]);
      expect(result.totalQuantity).toBe(0);
    });

    it('should return cart data on success', async () => {
      mockGetItemFromStorage.mockReturnValue('cart123');
      const mockCart = {
        items: [{ sku: 'course:123:456', quantity: 1 }],
        total_quantity: 1,
      };
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          addProductsToCart: {
            cart: mockCart,
            user_errors: null,
          },
        },
      });

      const result = await CommerceCustomHooksInstance.addProductToCart('course:123_456');

      expect(result.items).toEqual(mockCart.items);
      expect(result.totalQuantity).toBe(1);
      expect(result.error).toBeNull();
    });
  });

  describe('Native Cart Operations', () => {
    it('should return default cart values for addProductToCartNative', async () => {
      const result = await CommerceCustomHooksInstance.addProductToCartNative('course:123_inst456');

      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });

    it('should return default cart values for buyNowNative', async () => {
      const result = await CommerceCustomHooksInstance.buyNowNative('course:123_inst456');

      expect(result.redirectionUrl).toBe('');
      expect(result.error).toEqual(['']);
    });
  });

  describe('Widget Methods', () => {
    beforeEach(() => {
      mockIsUserLoggedIn.mockReturnValue(false);
    });

    it('should return null for getCoursePathWidgetTrainings when not logged in', async () => {
      const result = await CommerceCustomHooksInstance.getCoursePathWidgetTrainings({}, {});

      expect(result).toBeNull();
    });

    it('should return null for getCategoryWidgetData when not logged in', async () => {
      const result = await CommerceCustomHooksInstance.getCategoryWidgetData({}, {});

      expect(result).toBeNull();
    });

    it('should delegate getCoursePathWidgetTrainings when logged in', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const filters = { loIds: ['course:1'] };
      const pagination = { pageLimit: 10 };

      await CommerceCustomHooksInstance.getCoursePathWidgetTrainings(filters, pagination);

      expect(mockALMCustomHooks.getCoursePathWidgetTrainings).toHaveBeenCalledWith(
        filters,
        pagination
      );
    });

    it('should delegate getCategoryWidgetData when logged in', async () => {
      mockIsUserLoggedIn.mockReturnValue(true);
      const filters = { sourceIds: ['cat1'] };
      const pagination = { pageLimit: 10 };

      await CommerceCustomHooksInstance.getCategoryWidgetData(filters, pagination);

      expect(mockALMCustomHooks.getCategoryWidgetData).toHaveBeenCalledWith(filters, pagination);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SKU in addProductToCart', async () => {
      mockGetItemFromStorage.mockReturnValue('cart123');
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          addProductsToCart: {
            cart: { items: [], total_quantity: 0 },
            user_errors: null,
          },
        },
      });

      await CommerceCustomHooksInstance.addProductToCart('');

      expect(mockApolloClient.mutate).toHaveBeenCalled();
    });

    it('should handle null cartId in addProductToCart', async () => {
      mockGetItemFromStorage.mockReturnValue(null);
      mockApolloClient.mutate.mockResolvedValue({
        data: {
          addProductsToCart: {
            cart: { items: [], total_quantity: 0 },
            user_errors: null,
          },
        },
      });

      await CommerceCustomHooksInstance.addProductToCart('course:123_456');

      // Should still call mutation even without cartId
      expect(mockApolloClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            cartId: null,
          }),
        })
      );
    });
  });
});
