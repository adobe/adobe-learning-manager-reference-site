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
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import PrlPreference from '@components/PrlPreferenceSection/PrlPreference/PrlPreference';
import { ADVANCED } from '@utils/widgets/common';

jest.mock('@components/PrlPreferenceSection/PrlChips', () => ({
  PrlChips: ({ onAdd, onRemove }: any) => (
    <div data-testid="prl-chips">
      <button data-testid="add-chip-btn" onClick={() => onAdd({ id: 'new-1', name: 'New Skill' })}>
        Add
      </button>
      <button data-testid="remove-chip-btn" onClick={() => onRemove({ id: 'skill-1', name: 'Skill 1' })}>
        Remove
      </button>
    </div>
  ),
}));

jest.mock('@components/PrlPreferenceSection/PrlLevelSelector', () => ({
  PrlLevelSelector: ({ onChangeHandler }: any) => (
    <div data-testid="prl-level-selector">
      <button
        data-testid="change-level-btn"
        onClick={() =>
          onChangeHandler({ detail: { item: { id: 'skill-1', name: 'Skill 1', levels: ['intermediate'] } } })
        }
      >
        Change Level
      </button>
      <button
        data-testid="change-level-no-id-btn"
        onClick={() => onChangeHandler({ detail: { item: {} } })}
      >
        Bad Level
      </button>
    </div>
  ),
}));

const mockSelectedCriteria = [
  { id: 'skill-1', name: 'Skill 1', levels: ['advanced'] },
  { id: 'skill-2', name: 'Skill 2', levels: ['intermediate'] },
];
const mockAllCriteria = [
  { id: 'skill-1', name: 'Skill 1' },
  { id: 'skill-2', name: 'Skill 2' },
  { id: 'skill-3', name: 'Skill 3' },
];
const mockLevels = ['beginner', 'intermediate', 'advanced'];

const defaultProps = {
  selectedCriteria: mockSelectedCriteria,
  allCriteria: mockAllCriteria,
  isLevelsEnabled: false,
  levels: mockLevels,
  onSelectionChange: jest.fn(),
  heading: 'Skills',
  isEditMode: false,
};

const renderPreference = (overrides: Record<string, any> = {}) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <PrlPreference {...defaultProps} {...overrides} />
    </IntlProvider>
  );

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
  defaultProps.onSelectionChange = jest.fn();
});

describe('PrlPreference', () => {
  describe('View mode (isEditMode=false)', () => {
    it('viewMode_showsHeadingAndFormattedCriteria', () => {
      renderPreference();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Skill 1, Skill 2')).toBeInTheDocument();
    });

    it('viewMode_noChipsOrLevelSelector', () => {
      renderPreference();
      expect(screen.queryByTestId('prl-chips')).not.toBeInTheDocument();
      expect(screen.queryByTestId('prl-level-selector')).not.toBeInTheDocument();
    });

    it('viewMode_nullCriteria_rendersEmptyText', () => {
      renderPreference({ selectedCriteria: null });
      expect(screen.queryByText('Skill 1, Skill 2')).not.toBeInTheDocument();
    });

    it('viewMode_emptyCriteria_rendersEmptyText', () => {
      renderPreference({ selectedCriteria: [] });
      const container = screen.getByText('Skills').closest('div')!;
      expect(container).toBeInTheDocument();
    });

    it('viewMode_propsUpdate_displaysNewCriteriaNames', () => {
      const { rerender } = renderPreference();
      rerender(
        <IntlProvider locale="en" messages={{}}>
          <PrlPreference
            {...defaultProps}
            selectedCriteria={[{ id: 'skill-3', name: 'React', levels: [] }]}
          />
        </IntlProvider>
      );
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  describe('Edit mode (isEditMode=true)', () => {
    it('editMode_showsChipsNotFormattedText', () => {
      renderPreference({ isEditMode: true });
      expect(screen.getByTestId('prl-chips')).toBeInTheDocument();
      expect(screen.queryByText('Skill 1, Skill 2')).not.toBeInTheDocument();
    });

    it('editMode_levelsEnabled_showsBothChipsAndLevelSelector', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      expect(screen.getByTestId('prl-chips')).toBeInTheDocument();
      expect(screen.getByTestId('prl-level-selector')).toBeInTheDocument();
    });

    it('editMode_levelsDisabled_showsChipsNoLevelSelector', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: false });
      expect(screen.getByTestId('prl-chips')).toBeInTheDocument();
      expect(screen.queryByTestId('prl-level-selector')).not.toBeInTheDocument();
    });

    it('editMode_switchToViewMode_resetsLevelsScreen', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      const { rerender } = renderPreference({ isEditMode: true, isLevelsEnabled: true });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Back')).toBeInTheDocument();
      // switch to view mode
      rerender(
        <IntlProvider locale="en" messages={{}}>
          <PrlPreference {...defaultProps} isEditMode={false} isLevelsEnabled={true} />
        </IntlProvider>
      );
      // back to view mode — no Next/Back
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('Criteria add', () => {
    it('addSelected_callsOnSelectionChangeWithNewItem', () => {
      const onSelectionChange = jest.fn();
      renderPreference({ isEditMode: true, onSelectionChange });
      fireEvent.click(screen.getByTestId('add-chip-btn'));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'new-1', name: 'New Skill' })])
      );
    });

    it('addSelected_levelsEnabled_newItemHasAdvancedLevel', () => {
      const onSelectionChange = jest.fn();
      renderPreference({ isEditMode: true, isLevelsEnabled: true, onSelectionChange });
      fireEvent.click(screen.getByTestId('add-chip-btn'));
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'new-1', levels: [ADVANCED] })])
      );
    });

    it('addSelected_levelsDisabled_newItemHasUndefinedLevels', () => {
      const onSelectionChange = jest.fn();
      renderPreference({ isEditMode: true, isLevelsEnabled: false, onSelectionChange });
      fireEvent.click(screen.getByTestId('add-chip-btn'));
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'new-1', levels: undefined })])
      );
    });
  });

  describe('Criteria remove', () => {
    it('removeSelected_callsOnSelectionChangeWithoutRemovedItem', () => {
      const onSelectionChange = jest.fn();
      renderPreference({ isEditMode: true, onSelectionChange });
      fireEvent.click(screen.getByTestId('remove-chip-btn')); // removes skill-1
      const passed = onSelectionChange.mock.calls[0][0];
      expect(passed.find((c: any) => c.id === 'skill-1')).toBeUndefined();
      expect(passed.find((c: any) => c.id === 'skill-2')).toEqual(
        expect.objectContaining({ id: 'skill-2' })
      );
    });
  });

  describe('Level update', () => {
    it('updateLevel_validItem_callsOnSelectionChangeWithUpdatedLevel', () => {
      const onSelectionChange = jest.fn();
      renderPreference({ isEditMode: true, isLevelsEnabled: true, onSelectionChange });
      fireEvent.click(screen.getByTestId('change-level-btn'));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const passed = onSelectionChange.mock.calls[0][0];
      expect(passed.find((c: any) => c.id === 'skill-1').levels).toEqual(['intermediate']);
    });

    it('updateLevel_missingItemId_callsConsoleError', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      fireEvent.click(screen.getByTestId('change-level-no-id-btn'));
      expect(errorSpy).toHaveBeenCalledWith('NO data in custom event : ', expect.any(String));
      errorSpy.mockRestore();
    });
  });

  describe('Mobile levels navigation', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    });

    it('mobile_levelsDisabled_noNextOrBackButtons', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: false });
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('mobile_levelsEnabled_showsNextButtonAndChipsNotLevelSelector', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByTestId('prl-chips')).toBeInTheDocument();
      expect(screen.queryByTestId('prl-level-selector')).not.toBeInTheDocument();
    });

    it('mobile_levelsEnabled_nextButtonDisabledWhenNoCriteriaSelected', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: true, selectedCriteria: [] });
      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('mobile_levelsEnabled_nextClick_transitionsToLevelsScreenWithBackAndLevelSelector', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByTestId('prl-chips')).not.toBeInTheDocument();
      expect(screen.getByTestId('prl-level-selector')).toBeInTheDocument();
    });

    it('mobile_levelsEnabled_backClick_returnsToChipsScreen', () => {
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Back'));
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByTestId('prl-chips')).toBeInTheDocument();
      expect(screen.queryByTestId('prl-level-selector')).not.toBeInTheDocument();
    });

    it('mobile_viewMode_noMobileNavigation', () => {
      renderPreference({ isEditMode: false, isLevelsEnabled: true });
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('desktop_noNextOrBackEvenWhenLevelsEnabled', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
      renderPreference({ isEditMode: true, isLevelsEnabled: true });
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });
});
