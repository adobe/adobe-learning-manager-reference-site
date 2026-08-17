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
import { defaultTheme, Provider as SpectrumProvider } from '@adobe/react-spectrum';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimeGradebookModuleTable } from '@components/TrainingOverview/PrimeGradebookModuleTable';
import {
  PrimeLearningObjectResource,
  PrimeLearningObjectResourceGrade,
} from '@models/PrimeModels';

const mockgetGradeFormLoResource = jest.fn<
  PrimeLearningObjectResourceGrade | undefined,
  any[]
>(() => undefined);
const mockGetModuleGradebookWeight = jest.fn<number | null, any[]>(() => null);
const mockGetModuleScorePercent = jest.fn<number | null, any[]>(() => null);
const mockGetWeightedContributionPercent = jest.fn<number | null, any[]>(() => null);
const mockFormatGradebookPercent = jest.fn<string, any[]>((v: number) => `${v}%`);

jest.mock('@utils/gradebookUtils', () => ({
  ...jest.requireActual('@utils/gradebookUtils'),
  formatGradebookPercent: (v: number) => mockFormatGradebookPercent(v),
  getGradeFormLoResource: (id: string, grades: any) => mockgetGradeFormLoResource(id, grades),
  getModuleGradebookWeight: (r: any) => mockGetModuleGradebookWeight(r),
  getModuleScorePercent: (grade: any, moduleScoring: any) =>
    mockGetModuleScorePercent(grade, moduleScoring),
  getWeightedContributionPercent: (w: any, s: any) => mockGetWeightedContributionPercent(w, s),
}));

const mockGetPreferredLocalizedMetadata = jest.fn<any, any[]>(() => ({ name: 'Module Name' }));

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  GetTranslationsReplaced: (key: string, params: Record<string, string | number>) => {
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return paramStr ? `${key}[${paramStr}]` : key;
  },
  getPreferredLocalizedMetadata: (data: any, locale: string) =>
    mockGetPreferredLocalizedMetadata(data, locale),
  formatMap: {
    Classroom: 'alm.catalog.card.classroom',
    Checklist: 'alm.catalog.card.checklistActivity',
  },
}));

jest.mock('@utils/constants', () => ({
  ...jest.requireActual('@utils/constants'),
}));

const mockUseUserContext = jest.fn<any, any[]>(() => ({ user: { contentLocale: 'en-US' } }));

jest.mock('@contextProviders/userContextProvider', () => ({
  useUserContext: () => mockUseUserContext(),
}));

jest.mock('@utils/inline_svg', () => ({
  ALM_TOOLTIP: () => <span data-testid="alm-tooltip-icon" />,
}));

(global as any).ResizeObserver =
  (global as any).ResizeObserver ||
  class ResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };

function setScrollMetrics(
  el: HTMLElement,
  { scrollWidth, clientWidth, scrollLeft }: { scrollWidth: number; clientWidth: number; scrollLeft: number }
) {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, value: scrollLeft, writable: true });
}

// A plain fireEvent.click never dispatches pointerdown, so it misses react-aria's
// TooltipTrigger press handling entirely (bound to onPointerDown/onKeyDown). Real
// touch taps and mouse clicks fire pointerdown before the click completes, so tests
// must too, or they won't catch bugs in how the press and hover state interact.
function press(el: HTMLElement, pointerType: 'mouse' | 'touch' = 'mouse') {
  fireEvent.pointerDown(el, { pointerType });
  fireEvent.pointerUp(el, { pointerType });
  fireEvent.click(el);
}

function renderWithSpectrum(ui: React.ReactElement) {
  return render(<SpectrumProvider theme={defaultTheme}>{ui}</SpectrumProvider>);
}

const makeResource = (
  id: string,
  overrides: Partial<PrimeLearningObjectResource> = {}
): PrimeLearningObjectResource =>
  ({ id, mandatory: false, localizedMetadata: [], ...overrides } as PrimeLearningObjectResource);

const makeGrade = (
  overrides: Partial<PrimeLearningObjectResourceGrade> = {}
): PrimeLearningObjectResourceGrade =>
  ({ id: 'grade-1', completed: false, hasPassed: false, dateStarted: '', ...overrides } as any as PrimeLearningObjectResourceGrade);

const defaultProps = {
  aggregateFormatted: '45%',
  enrollment: null,
  hasOptionalLoResources: false,
};

describe('PrimeGradebookModuleTable', () => {
  beforeEach(() => {
    mockgetGradeFormLoResource.mockReturnValue(undefined);
    mockGetModuleGradebookWeight.mockReturnValue(null);
    mockGetModuleScorePercent.mockReturnValue(null);
    mockGetWeightedContributionPercent.mockReturnValue(null);
    mockGetPreferredLocalizedMetadata.mockReturnValue({ name: 'Module Name' });
    mockUseUserContext.mockReturnValue({ user: { contentLocale: 'en-US' } });
  });

  describe('table structure', () => {
    it('renders the table with the correct automation id', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(container.querySelector('[data-automationid="prime-gradebook-module-list"]')).not.toBeNull();
    });

    it('renders a row for each loResource', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1'), makeResource('r2'), makeResource('r3')]}
        />
      );
      expect(container.querySelectorAll('[data-automationid^="gradebook-row-"]')).toHaveLength(3);
    });

    it('renders no data rows when loResources is empty', () => {
      const { container } = renderWithSpectrum(<PrimeGradebookModuleTable {...defaultProps} loResources={[]} />);
      expect(container.querySelectorAll('[data-automationid^="gradebook-row-"]')).toHaveLength(0);
    });

    it('renders the footer aggregate with the passed aggregateFormatted value', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const footer = container.querySelector('[data-automationid="gradebook-footer-aggregate"]');
      expect(footer?.textContent).toBe('45%');
    });

    it('renders column headers', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const headers = Array.from(container.querySelectorAll('th')).map(th => th.textContent);
      expect(headers).toContain('alm.text.module');
      expect(headers).toContain('alm.overview.gradebook.column.status');
      expect(headers).toContain('alm.overview.gradebook.column.weightage');
      expect(headers).toContain('alm.overview.gradebook.column.score');
      expect(headers).toContain('alm.overview.gradebook.column.contribution');
    });

    it('renders the footer aggregate label', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(container.textContent).toContain('alm.overview.gradebook.footer.aggregateScore');
    });
  });

  describe('module row — module type label', () => {
    it('shows the format label when resourceType maps in formatMap', () => {
      renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1', { resourceType: 'Classroom' })]}
        />
      );
      expect(screen.getByText('alm.catalog.card.classroom')).toBeTruthy();
    });

    it('uses the checklist format key when resourceSubType is Checklist', () => {
      renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              resourceType: 'Classroom',
              resourceSubType: 'CHECKLIST',
            }),
          ]}
        />
      );
      expect(screen.getByText('alm.catalog.card.checklistActivity')).toBeTruthy();
    });
  });

  describe('module row — module title', () => {
    it('renders the localized module name when metadata is available', () => {
      mockGetPreferredLocalizedMetadata.mockReturnValue({ name: 'My Module' });
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const titleEl = container.querySelector('[data-automationid="gradebook-row-r1"] [title]');
      expect(titleEl?.textContent).toBe('My Module');
    });

    it('falls back to an empty title when localized metadata has no name', () => {
      mockGetPreferredLocalizedMetadata.mockReturnValue({});
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const titleEl = container.querySelector('[data-automationid="gradebook-row-r1"] [title]');
      expect(titleEl?.textContent).toBe('');
      expect(titleEl?.getAttribute('title')).toBe('');
    });

    it('falls back to an empty title when localized metadata is undefined', () => {
      mockGetPreferredLocalizedMetadata.mockReturnValue(undefined);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const titleEl = container.querySelector('[data-automationid="gradebook-row-r1"] [title]');
      expect(titleEl?.textContent).toBe('');
    });
  });

  describe('module row — required/optional labels', () => {
    it('shows the required pill for mandatory resources', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1', { mandatory: true })]}
        />
      );
      expect(container.querySelector('[data-automationid="gradebook-required-r1"]')).not.toBeNull();
    });

    it('shows no required label for non-mandatory resources even when training has optional modules', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          hasOptionalLoResources
          loResources={[makeResource('r1', { mandatory: false })]}
        />
      );
      expect(container.querySelector('[data-automationid="gradebook-required-r1"]')).toBeNull();
      expect(container.querySelector('[data-automationid="gradebook-optional-r1"]')).toBeNull();
    });

    it('shows no required or optional label for non-mandatory resources when training has no optional modules', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1', { mandatory: false })]}
        />
      );
      expect(container.querySelector('[data-automationid="gradebook-required-r1"]')).toBeNull();
      expect(container.querySelector('[data-automationid="gradebook-optional-r1"]')).toBeNull();
    });
  });

  describe('module row — meta separators', () => {
    it('renders a separator dot between the type label and the required pill when both are present', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', { resourceType: 'Classroom', mandatory: true }),
          ]}
        />
      );
      const row = container.querySelector('[data-automationid="gradebook-row-r1"]')!;
      expect(row.querySelectorAll('.moduleMetaSep')).toHaveLength(1);
    });

    it('renders no separator when only the type label is present (no required pill, no scoring)', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1', { resourceType: 'Classroom', mandatory: false })]}
        />
      );
      const row = container.querySelector('[data-automationid="gradebook-row-r1"]')!;
      expect(row.querySelectorAll('.moduleMetaSep')).toHaveLength(0);
    });

    it('renders a separator dot between the required pill and the scoring label when both are present', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              mandatory: true,
              multipleAttemptEnabled: true,
              multipleAttempt: { moduleScoring: 'LATEST' } as any,
            }),
          ]}
        />
      );
      const row = container.querySelector('[data-automationid="gradebook-row-r1"]')!;
      expect(row.querySelectorAll('.moduleMetaSep')).toHaveLength(1);
    });

    it('renders two separator dots when type label, required pill, and scoring label are all present', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              resourceType: 'Classroom',
              mandatory: true,
              multipleAttemptEnabled: true,
              multipleAttempt: { moduleScoring: 'LATEST' } as any,
            }),
          ]}
        />
      );
      const row = container.querySelector('[data-automationid="gradebook-row-r1"]')!;
      expect(row.querySelectorAll('.moduleMetaSep')).toHaveLength(2);
    });

    it('renders no separator before scoring when neither type label nor required pill is present', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              mandatory: false,
              multipleAttemptEnabled: true,
              multipleAttempt: { moduleScoring: 'LATEST' } as any,
            }),
          ]}
        />
      );
      const row = container.querySelector('[data-automationid="gradebook-row-r1"]')!;
      expect(row.querySelectorAll('.moduleMetaSep')).toHaveLength(0);
    });
  });

  describe('module row — status pill', () => {
    it('shows passed when grade is completed and hasPassed', () => {
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ completed: true, hasPassed: true })
      );
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const pill = container.querySelector('[data-automationid="gradebook-status-r1"]');
      expect(pill?.textContent).toBe('alm.overview.gradebook.passed');
    });

    it('shows failed when grade is completed but not hasPassed', () => {
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ completed: true, hasPassed: false })
      );
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const pill = container.querySelector('[data-automationid="gradebook-status-r1"]');
      expect(pill?.textContent).toBe('alm.overview.gradebook.failed');
    });

    it('shows inProgress when dateStarted is set but not yet completed', () => {
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ completed: false, dateStarted: '2024-01-01T00:00:00Z' })
      );
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const pill = container.querySelector('[data-automationid="gradebook-status-r1"]');
      expect(pill?.textContent).toBe('alm.overview.gradebook.inProgress');
    });

    it('shows notStarted when no grade exists', () => {
      mockgetGradeFormLoResource.mockReturnValue(undefined);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const pill = container.querySelector('[data-automationid="gradebook-status-r1"]');
      expect(pill?.textContent).toBe('alm.overview.gradebook.notStarted');
    });

    it('shows notStarted when grade exists but not started and not completed', () => {
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ completed: false, dateStarted: '', hasPassed: false })
      );
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const pill = container.querySelector('[data-automationid="gradebook-status-r1"]');
      expect(pill?.textContent).toBe('alm.overview.gradebook.notStarted');
    });
  });

  describe('module row — multiple attempt scoring label', () => {
    it.each([
      ['HIGHEST', 'alm.overview.moduleScoring.highest'],
      ['LATEST',  'alm.overview.moduleScoring.latest'],
    ])('shows correct label when multipleAttemptEnabled and moduleScoring is %s', (moduleScoring, expectedKey) => {
      renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              multipleAttemptEnabled: true,
              multipleAttempt: { moduleScoring } as any,
            }),
          ]}
        />
      );
      const el = document.querySelector('[data-automationid="gradebook-scoring-r1"]');
      expect(el?.textContent).toBe(expectedKey);
    });

    it('hides scoring label when multipleAttemptEnabled is false even if moduleScoring is set', () => {
      renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              multipleAttemptEnabled: false,
              multipleAttempt: { moduleScoring: 'LATEST' } as any,
            }),
          ]}
        />
      );
      expect(document.querySelector('[data-automationid="gradebook-scoring-r1"]')).toBeNull();
    });
  });

  describe('module row — weight and contribution', () => {

    it('shows dash for contribution when getWeightedContributionPercent returns null', () => {
      mockGetWeightedContributionPercent.mockReturnValue(null);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const contrib = container.querySelector('[data-automationid="gradebook-contribution-r1"]');
      expect(contrib?.textContent).toBe('alm.overview.gradebook.scoreDash');
    });

    it('shows formatted contribution when getWeightedContributionPercent returns a value', () => {
      mockGetModuleGradebookWeight.mockReturnValue(40);
      mockGetModuleScorePercent.mockReturnValue(80);
      mockGetWeightedContributionPercent.mockReturnValue(32);
      mockFormatGradebookPercent.mockReturnValue('32%');
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1', { weight: 40 })]}
        />
      );
      const contrib = container.querySelector('[data-automationid="gradebook-contribution-r1"]');
      expect(contrib?.textContent).toBe('32%');
    });

    it('shows weight none when getModuleGradebookWeight returns null', () => {
      mockGetModuleGradebookWeight.mockReturnValue(null);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const weight = container.querySelector('[data-automationid="gradebook-weight-r1"]');
      expect(weight?.textContent).toBe('alm.overview.weightage.none');
    });

    it('shows weight none when getModuleGradebookWeight returns zero', () => {
      mockGetModuleGradebookWeight.mockReturnValue(0);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const weight = container.querySelector('[data-automationid="gradebook-weight-r1"]');
      expect(weight?.textContent).toBe('alm.overview.weightage.none');
    });

    it('shows weight percent line when getModuleGradebookWeight returns a positive value', () => {
      mockGetModuleGradebookWeight.mockReturnValue(40);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const weight = container.querySelector('[data-automationid="gradebook-weight-r1"]');
      expect(weight?.textContent).toBe('alm.overview.weightage.percentValue[percent:40]');
    });

    it.each([
      [11.5, 'alm.overview.weightage.percentValue[percent:11.5]'],
      [88.5, 'alm.overview.weightage.percentValue[percent:88.5]'],
    ])(
      'displays the raw BE weight %s without rounding',
      (weight, expected) => {
        mockGetModuleGradebookWeight.mockReturnValue(weight);
        const { container } = renderWithSpectrum(
          <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
        );
        const weightEl = container.querySelector('[data-automationid="gradebook-weight-r1"]');
        expect(weightEl?.textContent).toBe(expected);
        expect(weightEl?.textContent).not.toContain(`percent:${Math.round(weight)}`);
      }
    );

    it('displays fractional weights that sum to 100% without rounding up past 100%', () => {
      mockGetModuleGradebookWeight.mockImplementation((resource: { id: string }) => {
        if (resource.id === 'r1') return 11.5;
        if (resource.id === 'r2') return 88.5;
        return null;
      });
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1'), makeResource('r2')]}
        />
      );
      const weight1 = container.querySelector('[data-automationid="gradebook-weight-r1"]');
      const weight2 = container.querySelector('[data-automationid="gradebook-weight-r2"]');
      expect(weight1?.textContent).toBe('alm.overview.weightage.percentValue[percent:11.5]');
      expect(weight2?.textContent).toBe('alm.overview.weightage.percentValue[percent:88.5]');
    });
  });

  describe('module row — very long module name', () => {
    it('renders without error when the module name is extremely long', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(container.querySelector('[data-automationid="gradebook-row-r1"]')).not.toBeNull();
    });

    it('sets a title attribute on the module name element for browser overflow tooltip', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const titleEl = container.querySelector('[data-automationid="gradebook-row-r1"] [title]');
      expect(titleEl).not.toBeNull();
    });

    it('renders two modules with different long names without collision', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1'), makeResource('r2')]}
        />
      );
      expect(container.querySelectorAll('[data-automationid^="gradebook-row-"]')).toHaveLength(2);
    });
  });

  describe('table accessibility — screen reader support', () => {
    it('table element carries an aria-label for screen reader announcement', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const table = container.querySelector('[data-automationid="prime-gradebook-module-list"]');
      expect(table?.getAttribute('aria-label')).toBe('alm.text.gradebook');
    });

    it('all column headers have scope="col" for screen reader table navigation', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const headers = Array.from(container.querySelectorAll('th'));
      expect(headers.length).toBeGreaterThan(0);
      headers.forEach(th => {
        expect(th.getAttribute('scope')).toBe('col');
      });
    });

    it('every column header has a title attribute matching its label, for overflow tooltips', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const headers = Array.from(container.querySelectorAll('th'));
      expect(headers.length).toBeGreaterThan(0);
      headers.forEach(th => {
        if (th.querySelector('.contributionHeader')) {
          // Contribution header has mixed content (label + icon); the title lives
          // on the label span so it doesn't cover the icon's own aria-label.
          const label = th.querySelector('.contributionLabel');
          expect(label?.getAttribute('title')).toBe(label?.textContent);
        } else {
          expect(th.getAttribute('title')).toBe(th.textContent);
        }
      });
    });

    it('table has thead, tbody, and tfoot in the correct DOM order for logical reading', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const table = container.querySelector('table')!;
      const children = Array.from(table.children).map(c => c.tagName.toLowerCase());
      expect(children.indexOf('thead')).toBeLessThan(children.indexOf('tbody'));
      expect(children.indexOf('tbody')).toBeLessThan(children.indexOf('tfoot'));
    });

    it('each data row has a unique data-automationid attribute for test and AT targeting', () => {
      const resources = [makeResource('mod-a'), makeResource('mod-b'), makeResource('mod-c')];
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={resources} />
      );
      ['mod-a', 'mod-b', 'mod-c'].forEach(id => {
        expect(container.querySelector(`[data-automationid="gradebook-row-${id}"]`)).not.toBeNull();
      });
    });

    it('contribution header tooltip trigger has an aria-label for screen readers', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const tooltipTrigger = container.querySelector(
        '[data-automationid="gradebook-contribution-header-tooltip"] button'
      );
      expect(tooltipTrigger?.getAttribute('aria-label')).toBe('text.moreInformation');
    });

    it('keyboard tab — contribution tooltip trigger is reachable by keyboard focus', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const tooltipTrigger = container.querySelector(
        '[data-automationid="gradebook-contribution-header-tooltip"] button'
      ) as HTMLElement | null;
      expect(tooltipTrigger).not.toBeNull();
      // Buttons are natively focusable; tabIndex should not be -1 (which would exclude from tab order)
      expect(tooltipTrigger!.getAttribute('tabindex')).not.toBe('-1');
    });

    it('keyboard tab — all interactive table buttons accept keyboard focus', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[makeResource('r1'), makeResource('r2')]}
        />
      );
      const buttons = Array.from(container.querySelectorAll('button'));
      buttons.forEach(btn => {
        expect(btn.getAttribute('tabindex')).not.toBe('-1');
        fireEvent.focus(btn); // should not throw
      });
    });
  });

  describe('mobile scroll fade', () => {
    it('shows the scroll fade while there is more content to scroll to on the right', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const scrollEl = container.querySelector('.tableScroll') as HTMLDivElement;
      const wrapper = container.querySelector('.tableScrollWrapper') as HTMLDivElement;

      setScrollMetrics(scrollEl, { scrollWidth: 500, clientWidth: 300, scrollLeft: 0 });
      fireEvent.scroll(scrollEl);

      expect(wrapper.className).not.toContain('hideScrollFade');
    });

    it('hides the scroll fade once scrolled to the end, and re-shows it when scrolling back away from the end', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const scrollEl = container.querySelector('.tableScroll') as HTMLDivElement;
      const wrapper = container.querySelector('.tableScrollWrapper') as HTMLDivElement;

      // Not at the end yet — fade should be visible.
      setScrollMetrics(scrollEl, { scrollWidth: 500, clientWidth: 300, scrollLeft: 0 });
      fireEvent.scroll(scrollEl);
      expect(wrapper.className).not.toContain('hideScrollFade');

      // Scrolled all the way to the end — fade should be hidden.
      setScrollMetrics(scrollEl, { scrollWidth: 500, clientWidth: 300, scrollLeft: 200 });
      fireEvent.scroll(scrollEl);
      expect(wrapper.className).toContain('hideScrollFade');

      // Scrolled back away from the end — fade should reappear.
      setScrollMetrics(scrollEl, { scrollWidth: 500, clientWidth: 300, scrollLeft: 100 });
      fireEvent.scroll(scrollEl);
      expect(wrapper.className).not.toContain('hideScrollFade');
    });

    it('hides the scroll fade when the table does not overflow at all', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const scrollEl = container.querySelector('.tableScroll') as HTMLDivElement;
      const wrapper = container.querySelector('.tableScrollWrapper') as HTMLDivElement;

      setScrollMetrics(scrollEl, { scrollWidth: 300, clientWidth: 300, scrollLeft: 0 });
      fireEvent.scroll(scrollEl);

      expect(wrapper.className).toContain('hideScrollFade');
    });
  });

  describe('contribution column header tooltip', () => {
    it('renders an info trigger for the contribution column tooltip', () => {
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(
        container.querySelector('[data-automationid="gradebook-contribution-header-tooltip"]')
      ).not.toBeNull();
    });

    // TooltipTrigger's default hover/focus opening never fires on a tap: there's no
    // hover on touchscreens, and iOS Safari doesn't focus buttons on tap. The trigger
    // is toggled explicitly on press so it still opens on mobile.
    it.each([['touch'], ['mouse']] as const)(
      'toggles the tooltip open and closed on repeated %s presses, for devices without hover/focus-on-tap',
      pointerType => {
        const { container } = renderWithSpectrum(
          <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
        );
        const trigger = container.querySelector(
          '[data-automationid="gradebook-contribution-header-tooltip"] button'
        ) as HTMLElement;

        expect(screen.queryByText('alm.overview.gradebook.contribution.tooltip')).toBeNull();

        press(trigger, pointerType);
        expect(screen.getByText('alm.overview.gradebook.contribution.tooltip')).toBeTruthy();

        // Regression guard: react-aria's TooltipTrigger force-closes on every
        // pointerdown/keydown before onPress fires. Without shouldCloseOnPress={false}
        // on the trigger, that competing close makes every press converge back to
        // "open" instead of actually toggling closed.
        press(trigger, pointerType);
        expect(screen.queryByText('alm.overview.gradebook.contribution.tooltip')).toBeNull();

        press(trigger, pointerType);
        expect(screen.getByText('alm.overview.gradebook.contribution.tooltip')).toBeTruthy();
      }
    );
  });

  describe('content locale resolution', () => {
    it('uses the contentLocale from user context when set', () => {
      mockUseUserContext.mockReturnValue({ user: { contentLocale: 'fr-FR' } });
      renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(mockGetPreferredLocalizedMetadata).toHaveBeenCalledWith(expect.anything(), 'fr-FR');
    });

    it('falls back to the English locale when useUserContext returns a falsy value', () => {
      mockUseUserContext.mockReturnValue(undefined);
      renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(mockGetPreferredLocalizedMetadata).toHaveBeenCalledWith(expect.anything(), 'en-US');
    });

    it('falls back to the English locale when user has no contentLocale', () => {
      mockUseUserContext.mockReturnValue({ user: {} });
      renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(mockGetPreferredLocalizedMetadata).toHaveBeenCalledWith(expect.anything(), 'en-US');
    });
  });

  describe('module row — score column', () => {
    it('shows score dash when getModuleScorePercent returns null', () => {
      mockgetGradeFormLoResource.mockReturnValue(makeGrade());
      mockGetModuleScorePercent.mockReturnValue(null);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const score = container.querySelector('[data-automationid="gradebook-score-r1"]');
      expect(score?.textContent).toBe('alm.overview.gradebook.scoreDash');
    });

    it('shows score percent line when scorePercent is available even if maxScore is not positive', () => {
      mockgetGradeFormLoResource.mockReturnValue(makeGrade());
      mockGetModuleScorePercent.mockReturnValue(88.2);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      const score = container.querySelector('[data-automationid="gradebook-score-r1"]');
      expect(score?.textContent).toBe('alm.overview.gradebook.scorePercentLine[percent:88.2]');
    });

    it('shows score fraction line when grade has a positive maxScore', () => {
      mockgetGradeFormLoResource.mockReturnValue(makeGrade({ score: 7, maxScore: 10 }));
      mockGetModuleScorePercent.mockReturnValue(70);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(container.textContent).toContain('alm.overview.gradebook.scoreFraction[score:7,max:10]');
    });

    it('shows percent from highestScore and fraction from latest score when moduleScoring is HIGHEST', () => {
      mockGetModuleScorePercent.mockImplementation((grade, moduleScoring) =>
        jest
          .requireActual<typeof import('@utils/gradebookUtils')>('@utils/gradebookUtils')
          .getModuleScorePercent(grade, moduleScoring)
      );
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ score: 40, highestScore: 80, maxScore: 100 })
      );
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable
          {...defaultProps}
          loResources={[
            makeResource('r1', {
              multipleAttemptEnabled: true,
              multipleAttempt: { moduleScoring: 'HIGHEST' } as any,
            }),
          ]}
        />
      );
      expect(container.textContent).toContain('alm.overview.gradebook.scorePercentLine[percent:80]');
      expect(container.textContent).toContain('alm.overview.gradebook.scoreFraction[score:40,max:100]');
      expect(container.textContent).not.toContain('score:80,max:100');
    });

    it('rounds floating-point scores to two decimal places in the score fraction line', () => {
      mockgetGradeFormLoResource.mockReturnValue(
        makeGrade({ score: 66.66999816894531, maxScore: 100 })
      );
      mockGetModuleScorePercent.mockReturnValue(66.67);
      const { container } = renderWithSpectrum(
        <PrimeGradebookModuleTable {...defaultProps} loResources={[makeResource('r1')]} />
      );
      expect(container.textContent).toContain(
        'alm.overview.gradebook.scoreFraction[score:66.67,max:100]'
      );
      expect(container.textContent).not.toContain('66.66999816894531');
    });
  });
});
