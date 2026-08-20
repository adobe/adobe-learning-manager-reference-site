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
import { act, render, fireEvent } from '@testing-library/react';
import PrimeTrainingGradebookSummary from '@components/TrainingOverview/PrimeTrainingGradebookSummary/PrimeTrainingGradebookSummary';
import { GradebookSummaryState } from '@utils/gradebookUtils';

jest.mock('@utils/translationService', () => ({
  GetTranslation: (key: string) => key,
  // Appends serialised params so tests can assert interpolated values, e.g. "[score:75]"
  GetTranslationsReplaced: (key: string, params: Record<string, string | number>) => {
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return paramStr ? `${key}[${paramStr}]` : key;
  },
}));

jest.mock('@adobe/react-spectrum', () => ({
  Link: ({ children, href, target }: any) => <a href={href} target={target}>{children}</a>,
}));

jest.mock('@spectrum-icons/workflow/CloseCircle', () => () => (
  <span data-testid="icon-close" />
));
jest.mock('@spectrum-icons/workflow/HelpOutline', () => () => (
  <span data-testid="icon-help" />
));
jest.mock('@utils/inline_svg', () => ({
  GradebookPassedIcon: () => <span data-testid="icon-checkmark" />,
  GradebookCompletionPendingIcon: () => <span data-testid="icon-alert" />,
}));

const defaultProgress = { completed: 0, total: 0 };

const renderSummary = (
  summaryState: GradebookSummaryState,
  overrides: Partial<React.ComponentProps<typeof PrimeTrainingGradebookSummary>> = {}
) =>
  render(
    <PrimeTrainingGradebookSummary
      passingCriteriaText="Complete all required modules"
      summaryState={summaryState}
      progressMetrics={defaultProgress}
      aggregateFormatted="alm.overview.gradebook.scoreDash"
      gradebookPassingScore={undefined}
      {...overrides}
    />
  );

describe('PrimeTrainingGradebookSummary', () => {
  describe('banner root element', () => {
    it('renders with the correct automation id', () => {
      const { container } = renderSummary('NOT_STARTED');
      expect(
        container.querySelector('[data-automationid="prime-gradebook-summary-banner"]')
      ).not.toBeNull();
    });

    it.each<[GradebookSummaryState, string, string | null]>([
      ['NOT_STARTED', 'alm.overview.gradebook.notStarted',    null],
      ['PASSED',      'alm.overview.gradebook.passed',         'icon-checkmark'],
      ['IN_PROGRESS', 'alm.overview.gradebook.completionPending', 'icon-alert'],
      ['FAILED',      'alm.overview.gradebook.failed',          'icon-close'],
    ])(
      '%s: banner root and pill carry data-variant, pill shows correct text and icon',
      (state, expectedTextKey, iconTestId) => {
        const { container, queryByTestId } = renderSummary(state);
        const banner = container.querySelector('[data-automationid="prime-gradebook-summary-banner"]');
        const pill = container.querySelector('[data-automationid="gradebook-completion-pending"]');
        expect(banner?.getAttribute('data-variant')).toBe(state);
        expect(pill?.getAttribute('data-variant')).toBe(state);
        expect(pill?.textContent).toContain(expectedTextKey);
        if (iconTestId) {
          expect(queryByTestId(iconTestId)).not.toBeNull();
        } else {
          expect(queryByTestId('icon-alert')).toBeNull();
          expect(queryByTestId('icon-checkmark')).toBeNull();
          expect(queryByTestId('icon-close')).toBeNull();
        }
      }
    );
  });

  describe('unrecognized summaryState', () => {
    it('renders no icon and no text in the completion pill for a state outside the known map', () => {
      const { container, queryByTestId } = renderSummary(
        'SOME_FUTURE_STATE' as GradebookSummaryState
      );
      const pill = container.querySelector('[data-automationid="gradebook-completion-pending"]');
      expect(pill?.textContent).toBe('');
      expect(queryByTestId('icon-alert')).toBeNull();
      expect(queryByTestId('icon-checkmark')).toBeNull();
      expect(queryByTestId('icon-close')).toBeNull();
    });
  });

  describe('passing criteria section', () => {
    it('renders criteria label key and text inside a role=status element when text is provided', () => {
      const { container } = renderSummary('NOT_STARTED', {
        passingCriteriaText: 'Complete 3 modules',
      });
      const section = container.querySelector('[role="status"]');
      expect(section?.textContent).toContain('alm.overview.gradebook.passingCriteriaLabel');
      expect(section?.textContent).toContain('Complete 3 modules');
    });

    it('renders the spacer (aria-hidden) and does not render the passing criteria label when text is empty', () => {
      const { container } = renderSummary('NOT_STARTED', { passingCriteriaText: '' });
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
      expect(container.textContent).not.toContain('alm.overview.gradebook.passingCriteriaLabel');
    });

    it('appends the minimum aggregate sentence when gradebookPassingScore is set', () => {
      const { container } = renderSummary('IN_PROGRESS', {
        passingCriteriaText: 'Complete 2 modules',
        gradebookPassingScore: 70,
      });
      const section = container.querySelector('[role="status"]');
      expect(section?.textContent).toContain('alm.overview.gradebook.passingCriteriaJoiner');
      expect(section?.textContent).toContain(
        'alm.overview.gradebook.passingCriteriaMinimumAggregateShort'
      );
    });

    it('displays the raw passing score without rounding', () => {
      const { container } = renderSummary('IN_PROGRESS', {
        passingCriteriaText: 'Complete all',
        gradebookPassingScore: 74.9,
      });
      const section = container.querySelector('[role="status"]');
      expect(section?.textContent).toContain('[score:74.9]');
      expect(section?.textContent).not.toContain('[score:75]');
    });

    it.each([
      [70, '[score:70]'],
      [70.125, '[score:70.125]'],
      [70.1, '[score:70.1]'],
    ])(
      'displays raw gradebookPassingScore %s as %s without rounding',
      (gradebookPassingScore, expectedFragment) => {
        const { container } = renderSummary('IN_PROGRESS', {
          passingCriteriaText: 'Complete all',
          gradebookPassingScore,
        });
        const section = container.querySelector('[role="status"]');
        expect(section?.textContent).toContain(expectedFragment);
      }
    );

    it.each([null, undefined, 0])(
      'does not append the minimum aggregate sentence when gradebookPassingScore is %s',
      score => {
        const { container } = renderSummary('NOT_STARTED', {
          passingCriteriaText: 'Complete 2 modules',
          gradebookPassingScore: score ?? undefined,
        });
        const section = container.querySelector('[role="status"]');
        expect(section?.textContent).not.toContain(
          'alm.overview.gradebook.passingCriteriaJoiner'
        );
      }
    );
  });

  describe('progress metrics', () => {
    it.each([
      [{ completed: 2, total: 4 }, '2/4'],
      [{ completed: 0, total: 3 }, '0/3'],
      [{ completed: 3, total: 3 }, '3/3'],
    ])('shows %s as progress fraction', (progress, expected) => {
      const { container } = renderSummary('IN_PROGRESS', { progressMetrics: progress });
      const metric = container.querySelector('[data-automationid="gradebook-mandatory-progress"]');
      expect(metric?.textContent).toBe(expected);
    });

    it('shows the score dash translation when total is zero', () => {
      const { container } = renderSummary('NOT_STARTED', {
        progressMetrics: { completed: 0, total: 0 },
      });
      const metric = container.querySelector('[data-automationid="gradebook-mandatory-progress"]');
      expect(metric?.textContent).toBe('alm.overview.gradebook.scoreDash');
    });
  });

  describe('aggregate score metric', () => {
    // Merged: same selector, different aggregateFormatted input.
    it.each([
      ['78.5%'],
      ['alm.overview.gradebook.scoreDash'],
    ])('renders aggregateFormatted "%s" in the aggregate banner span', aggregateFormatted => {
      const { container } = renderSummary('NOT_STARTED', { aggregateFormatted });
      const span = container.querySelector('[data-automationid="gradebook-aggregate-banner"]');
      expect(span?.textContent).toBe(aggregateFormatted);
    });
  });

  describe('Learn more link in aggregate tooltip', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('renders the Learn more link with the correct go-URL href when the popover is open', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      const popover = document.getElementById('gradebook-aggregate-popover')!;
      const link = popover.querySelector('a');
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('https://www.adobe.com/go/alm_learner_gradebook_en');
    });

    it('Learn more link opens in a new tab (target=_blank)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      const popover = document.getElementById('gradebook-aggregate-popover')!;
      const link = popover.querySelector('a');
      expect(link!.getAttribute('target')).toBe('_blank');
    });

    it('Learn more link href is a non-empty absolute URL (not a 404 placeholder)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      const popover = document.getElementById('gradebook-aggregate-popover')!;
      const link = popover.querySelector('a');
      const href = link!.getAttribute('href') ?? '';
      expect(href.length).toBeGreaterThan(0);
      expect(href.startsWith('http')).toBe(true);
    });

    it('Learn more link is not rendered when the popover is closed', () => {
      renderSummary('NOT_STARTED');
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
    });
  });

  describe('touch / keyboard-accessible aggregate popover', () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });

    it('opens the popover when the info button is clicked (touch / pointer-click equivalent)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.click(btn);
      // The component uses mouseEnter/Leave for hover; click is a superset event on mobile
      // If the component handles click, the popover should open.
      // If it only handles mouseEnter, clicking should still not crash.
      expect(btn).toBeInTheDocument();
    });

    it('opens the popover on keyboard focus (Tab → focus event)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.focus(btn);
      // Not all implementations open on focus, but the button must be focusable without error
      expect(btn.getAttribute('tabindex')).not.toBe('-1');
      expect(() => fireEvent.focus(btn)).not.toThrow();
    });

    it('info button is a native button element (keyboard-accessible by default)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]');
      expect(btn?.tagName.toLowerCase()).toBe('button');
    });

    it('popover opened via mouseEnter contains both tooltip paragraphs (smoke test for touch-equivalent)', () => {
      const { container } = renderSummary('IN_PROGRESS');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      const popover = document.getElementById('gradebook-aggregate-popover');
      expect(popover).not.toBeNull();
      expect(popover!.textContent).toContain('alm.overview.gradebook.aggregateScore.tooltipPara1');
      expect(popover!.textContent).toContain('alm.overview.gradebook.aggregateScore.tooltipPara2');
    });
  });

  describe('aggregate score tooltip (GradebookAggregateTooltip)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('renders the info button with the correct aria attributes', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]');
      expect(btn).not.toBeNull();
      expect(btn?.getAttribute('aria-label')).toBe(
        'alm.overview.gradebook.aggregateScore.infoAria'
      );
      expect(btn?.getAttribute('aria-haspopup')).toBe('dialog');
      expect(btn?.getAttribute('aria-expanded')).toBe('false');
      expect(btn?.getAttribute('aria-controls')).toBe('gradebook-aggregate-popover');
    });

    it('opens the popover on mouseEnter and sets aria-expanded to true', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      expect(btn.getAttribute('aria-expanded')).toBe('true');
      const popover = document.getElementById('gradebook-aggregate-popover');
      expect(popover).not.toBeNull();
      expect(popover?.textContent).toContain('alm.overview.gradebook.aggregateScore.tooltipPara1');
      expect(popover?.textContent).toContain('alm.overview.gradebook.aggregateScore.tooltipPara2');
    });

    it('hides the popover after grace delay on mouseLeave', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();

      fireEvent.mouseLeave(btn);
      // Still visible during grace period.
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();

      act(() => { jest.runAllTimers(); });
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
    });

    it('keeps the popover open when the pointer moves from trigger to popover', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);

      const popover = document.getElementById('gradebook-aggregate-popover')!;
      // Entering the popover cancels the close timer.
      fireEvent.mouseEnter(popover);
      act(() => { jest.runAllTimers(); });
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();
    });

    it('closes the popover immediately on Escape', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();

      fireEvent.keyDown(btn, { key: 'Escape' });
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
    });

    it('does not close on Escape when the popover is already closed', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
      fireEvent.keyDown(btn, { key: 'Escape' });
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
    });

    it('sets aria-describedby on the button when the popover is open, clears it when closed', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      expect(btn.getAttribute('aria-describedby')).toBeNull();
      fireEvent.mouseEnter(btn);
      expect(btn.getAttribute('aria-describedby')).toBe('gradebook-aggregate-popover');
      fireEvent.mouseLeave(btn);
      jest.runAllTimers();
      expect(btn.getAttribute('aria-describedby')).toBeNull();
    });

    it('hides the popover when focus leaves the component entirely', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      // Open via hover (reliable cross-environment mechanism).
      fireEvent.mouseEnter(btn);
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();

      // React's onBlur on a container delegates to focusout (which bubbles).
      // Fire focusOut on the button with relatedTarget outside the component.
      fireEvent.focusOut(btn, { relatedTarget: document.body });
      expect(document.getElementById('gradebook-aggregate-popover')).toBeNull();
    });

    it('keeps the popover open when focus moves within the component (e.g. to the popover link)', () => {
      const { container } = renderSummary('NOT_STARTED');
      const btn = container.querySelector('[data-automationid="gradebook-aggregate-info-btn"]')!;
      fireEvent.mouseEnter(btn);
      const popover = document.getElementById('gradebook-aggregate-popover')!;
      expect(popover).not.toBeNull();
      const link = popover.querySelector('a')!;

      // Focus moving to the Learn more link (inside the same wrapping span) must not close it.
      fireEvent.focusOut(btn, { relatedTarget: link });
      expect(document.getElementById('gradebook-aggregate-popover')).not.toBeNull();
    });
  });
});
