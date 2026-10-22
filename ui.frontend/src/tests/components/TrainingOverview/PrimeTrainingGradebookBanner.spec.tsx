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
import { render, fireEvent } from '@testing-library/react';
import PrimeTrainingGradebookBanner from '@components/TrainingOverview/PrimeTrainingGradebookBanner/PrimeTrainingGradebookBanner';

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
}));

jest.mock('@adobe/react-spectrum', () => ({
  Link: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <button data-testid="gradebook-link" onClick={onPress}>
      {children}
    </button>
  ),
}));

jest.mock('@spectrum-icons/workflow/Info', () => () => <span data-testid="icon-info" />);

describe('PrimeTrainingGradebookBanner', () => {
  describe('structure', () => {
    it('renders with correct automation id, role=region, and aria-label', () => {
      const { container } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={jest.fn()} />
      );
      const banner = container.querySelector('[data-automationid="gradebook-modules-banner"]');
      expect(banner).not.toBeNull();
      expect(banner?.getAttribute('role')).toBe('region');
      expect(banner?.getAttribute('aria-label')).toBe(
        'alm.overview.gradebook.modulesBanner.ariaLabel'
      );
    });

    it('renders the Info icon', () => {
      const { getByTestId } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={jest.fn()} />
      );
      expect(getByTestId('icon-info')).not.toBeNull();
    });
  });

  describe('banner text', () => {
    it('renders the body translation key', () => {
      const { container } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={jest.fn()} />
      );
      expect(container.textContent).toContain('alm.overview.gradebook.modulesBanner.body');
    });

    it('renders the link text translation key', () => {
      const { getByTestId } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={jest.fn()} />
      );
      expect(getByTestId('gradebook-link').textContent).toBe(
        'alm.overview.gradebook.modulesBanner.link'
      );
    });
  });

  describe('link interaction', () => {
    it('calls onViewGradebook once when the link is pressed', () => {
      const onViewGradebook = jest.fn();
      const { getByTestId } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={onViewGradebook} />
      );
      fireEvent.click(getByTestId('gradebook-link'));
      expect(onViewGradebook).toHaveBeenCalledTimes(1);
    });


    it('calls onViewGradebook each time the link is pressed', () => {
      const onViewGradebook = jest.fn();
      const { getByTestId } = render(
        <PrimeTrainingGradebookBanner onViewGradebook={onViewGradebook} />
      );
      fireEvent.click(getByTestId('gradebook-link'));
      fireEvent.click(getByTestId('gradebook-link'));
      expect(onViewGradebook).toHaveBeenCalledTimes(2);
    });
  });
});
