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
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import PrlPreferenceSection from '@components/PrlPreferenceSection/PrlPreferenceSection';
import { useRecommendations } from '@hooks/profile/useRecommendations';
import { getALMAccount, isEmptyJson } from '@utils/global';
import { GetTranslation } from '@utils/translationService';

jest.mock('@hooks/profile/useRecommendations', () => ({ useRecommendations: jest.fn() }));
jest.mock('@utils/global', () => ({ getALMAccount: jest.fn(), isEmptyJson: jest.fn() }));
jest.mock('@utils/translationService', () => ({ GetTranslation: jest.fn() }));
jest.mock('@components/Common/ALMLoader', () => ({
  ALMLoader: () => <div data-testid="loader" />,
}));
const mockOpenDialog = jest.fn();
const mockCloseDialog = jest.fn();
const mockIsOpen = jest.fn(() => false);

jest.mock('@contextProviders/ALMDialogContextProvider', () => ({
  useDialog: () => ({
    isOpen: mockIsOpen,
    openDialog: mockOpenDialog,
    closeDialog: mockCloseDialog,
  }),
}));
jest.mock('@components/ALMDialog', () => ({
  ALMDialog: ({ children }: any) => <div data-testid="alm-dialog">{children}</div>,
  ALMDialogHeader: ({ children }: any) => <div>{children}</div>,
  ALMDialogFooter: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@components/PrlPreferenceSection/PrlPreference/PrlPreference', () => ({
  __esModule: true,
  default: ({ heading, onSelectionChange, isEditMode }: any) => (
    <div data-testid="prl-preference">
      <span>{heading}</span>
      {isEditMode && (
        <button
          data-testid={`change-${heading}`}
          onClick={() => onSelectionChange([{ id: 'updated-1', name: 'Updated' }])}
        >
          Change
        </button>
      )}
    </div>
  ),
}));

const waitForAsync = async () => { await act(async () => {}); };

const PRODUCTS_HEADING = 'text.preferedProducts';
const ROLES_HEADING = 'text.preferedRoles';

const mockItems = {
  id: 'pref-123',
  type: 'userRecommendationPreferences',
  roles: [{ id: 'role-1', name: 'Developer' }],
  products: [{ id: 'prod-1', name: 'Product A' }],
};

const mockAccount = {
  prlCriteria: {
    enabled: true,
    products: { enabled: true, levelsEnabled: true },
    roles: { enabled: true, levelsEnabled: true },
  },
};

const mockGetUserRecommendationPreferences = jest.fn();
const mockGetRecommendationsForType = jest.fn();
const mockGetRecommendationLevels = jest.fn();
const mockSaveUserRecommedations = jest.fn();

beforeEach(() => {
  mockOpenDialog.mockClear();
  mockCloseDialog.mockClear();
  mockIsOpen.mockReturnValue(false);
  (isEmptyJson as jest.Mock).mockImplementation((obj: any) => obj && JSON.stringify(obj) === '{}');
  (GetTranslation as jest.Mock).mockImplementation((key: string) => key);
  (getALMAccount as jest.Mock).mockResolvedValue(mockAccount);

  mockGetUserRecommendationPreferences.mockResolvedValue(undefined);
  mockGetRecommendationsForType.mockResolvedValue(undefined);
  mockGetRecommendationLevels.mockResolvedValue(undefined);
  mockSaveUserRecommedations.mockResolvedValue(undefined);

  (useRecommendations as jest.Mock).mockReturnValue({
    items: { ...mockItems },
    products: [{ id: 'prod-1', name: 'Product A' }],
    roles: [{ id: 'role-1', name: 'Developer' }],
    levels: ['beginner', 'intermediate', 'advanced'],
    getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
    getRecommendationsForType: mockGetRecommendationsForType,
    getRecommendationLevels: mockGetRecommendationLevels,
    saveUserRecommedations: mockSaveUserRecommedations,
  });
});

describe('PrlPreferenceSection', () => {
  describe('Rendering', () => {
    it('rendering_prlEnabledBothCriteria_showsProductsAndRolesHeadingAndTwoPreferences', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('alm.text.productsAndRoles')).toBeInTheDocument();
      expect(screen.getAllByTestId('prl-preference')).toHaveLength(2);
    });

    it('rendering_prlDisabled_rendersNothing', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({ prlCriteria: { enabled: false } });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('rendering_nullAccount_rendersNothing', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue(null);
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('rendering_wrongItemType_rendersNothing', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { ...mockItems, type: 'differentType' },
        products: [],
        roles: [],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('rendering_productsOnlyEnabled_showsProductsHeadingAndOneProductsPreference', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: { enabled: true, products: { enabled: true }, roles: { enabled: false } },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.getByText('alm.prl.products.text')).toBeInTheDocument();
      expect(screen.getAllByTestId('prl-preference')).toHaveLength(1);
      expect(screen.getByText(PRODUCTS_HEADING)).toBeInTheDocument();
      expect(screen.queryByText(ROLES_HEADING)).not.toBeInTheDocument();
    });

    it('rendering_rolesOnlyEnabled_showsRolesHeadingAndOneRolesPreference', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: { enabled: true, products: { enabled: false }, roles: { enabled: true } },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.getByText('alm.prl.roles.text')).toBeInTheDocument();
      expect(screen.getAllByTestId('prl-preference')).toHaveLength(1);
      expect(screen.getByText(ROLES_HEADING)).toBeInTheDocument();
      expect(screen.queryByText(PRODUCTS_HEADING)).not.toBeInTheDocument();
    });

    it('rendering_nullProductsAndRoles_doesNotThrow', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { id: 'pref-123', type: 'userRecommendationPreferences', products: null, roles: null },
        products: [],
        roles: [],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      expect(() => render(<PrlPreferenceSection />)).not.toThrow();
      await waitForAsync();
    });
  });

  describe('getData on mount', () => {
    it('getData_mount_callsUserPreferencesAndBothTypeApisAndLevels', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(mockGetUserRecommendationPreferences).toHaveBeenCalledTimes(1);
      expect(mockGetRecommendationsForType).toHaveBeenCalledWith('recommendationProducts');
      expect(mockGetRecommendationsForType).toHaveBeenCalledWith('recommendationRoles');
      expect(mockGetRecommendationLevels).toHaveBeenCalledTimes(1);
    });

    it('getData_productsDisabled_skipsProductsApiCallButFetchesRoles', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: { enabled: true, products: { enabled: false }, roles: { enabled: true, levelsEnabled: false } },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(mockGetRecommendationsForType).not.toHaveBeenCalledWith('recommendationProducts');
      expect(mockGetRecommendationsForType).toHaveBeenCalledWith('recommendationRoles');
    });

    it('getData_rolesDisabled_skipsRolesApiCallButFetchesProducts', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: { enabled: true, products: { enabled: true, levelsEnabled: false }, roles: { enabled: false } },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(mockGetRecommendationsForType).not.toHaveBeenCalledWith('recommendationRoles');
      expect(mockGetRecommendationsForType).toHaveBeenCalledWith('recommendationProducts');
    });

    it('getData_noLevelsEnabled_skipsLevelsApiCall', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: {
          enabled: true,
          products: { enabled: true, levelsEnabled: false },
          roles: { enabled: true, levelsEnabled: false },
        },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(mockGetRecommendationLevels).not.toHaveBeenCalled();
    });
  });

  describe('Edit / Cancel flow', () => {
    it('viewMode_showsEditButtonNotSaveOrCancel', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      expect(screen.getByText('alm.text.edit')).toBeInTheDocument();
      expect(screen.queryByText('alm.text.save')).not.toBeInTheDocument();
      expect(screen.queryByText('alm.text.cancel')).not.toBeInTheDocument();
    });

    it('editMode_clickEdit_showsSaveAndCancelNotEdit', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      expect(screen.getByText('alm.text.save')).toBeInTheDocument();
      expect(screen.getByText('alm.text.cancel')).toBeInTheDocument();
      expect(screen.queryByText('alm.text.edit')).not.toBeInTheDocument();
    });

    it('cancel_returnsToViewMode', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.cancel'));
      expect(screen.getByText('alm.text.edit')).toBeInTheDocument();
      expect(screen.queryByText('alm.text.save')).not.toBeInTheDocument();
    });

    it('cancel_resetsSelectionsToSavedState', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      // change products
      fireEvent.click(screen.getByTestId(`change-${PRODUCTS_HEADING}`));
      // cancel should reset
      fireEvent.click(screen.getByText('alm.text.cancel'));
      // go back to edit mode and save — should still use original mockItems.products
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(mockSaveUserRecommedations).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            products: mockItems.products,
          }),
        })
      );
    });
  });

  describe('Save button enable/disable', () => {
    const enterEditMode = async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
    };

    it('saveButton_bothCriteriaHaveSelections_isEnabled', async () => {
      await enterEditMode();
      expect(screen.getByText('alm.text.save')).not.toBeDisabled();
    });

    it('saveButton_noProductsSelected_isDisabled', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { ...mockItems, products: [] },
        products: [],
        roles: [{ id: 'role-1', name: 'Developer' }],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      await enterEditMode();
      expect(screen.getByText('alm.text.save')).toBeDisabled();
    });

    it('saveButton_noRolesSelected_isDisabled', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { ...mockItems, roles: [] },
        products: [{ id: 'prod-1', name: 'Product A' }],
        roles: [],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      await enterEditMode();
      expect(screen.getByText('alm.text.save')).toBeDisabled();
    });

    it('saveButton_selectionChangeEnablesButton', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { ...mockItems, products: [] },
        products: [{ id: 'prod-1', name: 'Product A' }],
        roles: [{ id: 'role-1', name: 'Developer' }],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      expect(screen.getByText('alm.text.save')).toBeDisabled();
      fireEvent.click(screen.getByTestId(`change-${PRODUCTS_HEADING}`));
      expect(screen.getByText('alm.text.save')).not.toBeDisabled();
    });

    it('saveButton_productsOnlyEnabled_enabledWhenProductsSelected', async () => {
      (getALMAccount as jest.Mock).mockResolvedValue({
        prlCriteria: { enabled: true, products: { enabled: true }, roles: { enabled: false } },
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      expect(screen.getByText('alm.text.save')).not.toBeDisabled();
    });
  });

  describe('handleSave', () => {
    const enterEditAndSave = async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
    };

    it('handleSave_click_callsSaveWithBothProductsAndRoles', async () => {
      await enterEditAndSave();
      expect(mockSaveUserRecommedations).toHaveBeenCalledTimes(1);
      expect(mockSaveUserRecommedations).toHaveBeenCalledWith({
        id: 'pref-123',
        type: 'userRecommendationPreferences',
        attributes: {
          products: mockItems.products,
          roles: mockItems.roles,
        },
      });
    });

    it('handleSave_afterProductsChange_savesUpdatedProductsWithExistingRoles', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByTestId(`change-${PRODUCTS_HEADING}`));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(mockSaveUserRecommedations).toHaveBeenCalledWith({
        id: 'pref-123',
        type: 'userRecommendationPreferences',
        attributes: {
          products: [{ id: 'updated-1', name: 'Updated' }],
          roles: mockItems.roles,
        },
      });
    });

    it('handleSave_afterRolesChange_savesUpdatedRolesWithExistingProducts', async () => {
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByTestId(`change-${ROLES_HEADING}`));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(mockSaveUserRecommedations).toHaveBeenCalledWith({
        id: 'pref-123',
        type: 'userRecommendationPreferences',
        attributes: {
          products: mockItems.products,
          roles: [{ id: 'updated-1', name: 'Updated' }],
        },
      });
    });

    it('handleSave_missingId_doesNotCallSaveApi', async () => {
      (useRecommendations as jest.Mock).mockReturnValue({
        items: { type: 'userRecommendationPreferences', products: [{ id: 'p1', name: 'P1' }], roles: [{ id: 'r1', name: 'R1' }] },
        products: [{ id: 'p1', name: 'P1' }],
        roles: [{ id: 'r1', name: 'R1' }],
        levels: [],
        getUserRecommendationPreferences: mockGetUserRecommendationPreferences,
        getRecommendationsForType: mockGetRecommendationsForType,
        getRecommendationLevels: mockGetRecommendationLevels,
        saveUserRecommedations: mockSaveUserRecommedations,
      });
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(mockSaveUserRecommedations).not.toHaveBeenCalled();
    });

    it('handleSave_inProgress_loaderIsVisible', async () => {
      mockSaveUserRecommedations.mockReturnValue(new Promise(() => {}));
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('handleSave_saveCompletes_loaderIsHidden', async () => {
      await enterEditAndSave();
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('handleSave_saveSuccess_returnsToViewMode', async () => {
      await enterEditAndSave();
      expect(screen.getByText('alm.text.edit')).toBeInTheDocument();
      expect(screen.queryByText('alm.text.save')).not.toBeInTheDocument();
    });

    it('handleSave_saveError_staysInEditMode', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockSaveUserRecommedations.mockRejectedValue(new Error('Save failed'));
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(screen.getByText('alm.text.save')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('handleSave_saveError_logsErrorToConsole', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockSaveUserRecommedations.mockRejectedValue(new Error('Save failed'));
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      await waitForAsync();
      expect(consoleSpy).toHaveBeenCalledWith('Error while saving preference: ', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('handleSave_inProgress_saveButtonIsDisabled', async () => {
      mockSaveUserRecommedations.mockReturnValue(new Promise(() => {}));
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getByText('alm.text.save'));
      expect(screen.getByText('alm.text.save')).toBeDisabled();
    });
  });

  describe('Mobile dialog interaction', () => {
    const setMobileViewport = () =>
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
    const setDesktopViewport = () =>
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });

    afterEach(() => setDesktopViewport());

    it('mobile_clickEdit_callsOpenDialog', async () => {
      setMobileViewport();
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      expect(mockOpenDialog).toHaveBeenCalledWith('alm-prl-section-dialog');
    });

    it('mobile_clickCancel_callsCloseDialog', async () => {
      setMobileViewport();
      mockIsOpen.mockReturnValue(true);
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getAllByText('alm.text.cancel')[0]);
      expect(mockCloseDialog).toHaveBeenCalledWith('alm-prl-section-dialog');
    });

    it('mobile_saveSuccess_callsCloseDialog', async () => {
      setMobileViewport();
      mockIsOpen.mockReturnValue(true);
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      fireEvent.click(screen.getAllByText('alm.text.save')[0]);
      await waitForAsync();
      expect(mockCloseDialog).toHaveBeenCalledWith('alm-prl-section-dialog');
    });

    it('desktop_clickEdit_doesNotCallOpenDialog', async () => {
      setDesktopViewport();
      render(<PrlPreferenceSection />);
      await waitForAsync();
      fireEvent.click(screen.getByText('alm.text.edit'));
      expect(mockOpenDialog).not.toHaveBeenCalled();
    });
  });
});
