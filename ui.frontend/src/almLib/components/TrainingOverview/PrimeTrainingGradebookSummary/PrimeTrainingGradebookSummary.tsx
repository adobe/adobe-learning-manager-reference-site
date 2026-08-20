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
import { Link } from '@adobe/react-spectrum';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import CloseCircle from '@spectrum-icons/workflow/CloseCircle';
import React from 'react';
import { PrimeLearningObject } from '../../../models/PrimeModels';
import { GRADEBOOK_LEARN_MORE_GO_URL } from '../../../utils/constants';
import { GradebookSummaryState } from '../../../utils/gradebookUtils';
import { GetTranslation, GetTranslationsReplaced } from '../../../utils/translationService';
import { GradebookPassedIcon, GradebookCompletionPendingIcon } from '../../../utils/inline_svg';
import styles from './PrimeTrainingGradebookSummary.module.css';

export type PrimeGradebookProgressMetrics = {
  completed: number;
  total: number;
};

export type PrimeTrainingGradebookSummaryProps = {
  passingCriteriaText: string;
  summaryState: GradebookSummaryState;
  progressMetrics: PrimeGradebookProgressMetrics;
  aggregateFormatted: string;
  gradebookPassingScore?: PrimeLearningObject['gradebookPassingScore'];
};

const VARIANT_ICON_MAP: Partial<Record<GradebookSummaryState, React.ReactElement>> = {
  PASSED: <GradebookPassedIcon />,
  IN_PROGRESS: <GradebookCompletionPendingIcon />,
  FAILED: <CloseCircle />,
};

const VARIANT_TEXT_KEY_MAP: Partial<Record<GradebookSummaryState, string>> = {
  PASSED: 'alm.overview.gradebook.passed',
  NOT_STARTED: 'alm.overview.gradebook.notStarted',
  IN_PROGRESS: 'alm.overview.gradebook.completionPending',
  FAILED: 'alm.overview.gradebook.failed',
};

const getIcon = (variant: GradebookSummaryState) => VARIANT_ICON_MAP[variant] ?? null;

const getText = (variant: GradebookSummaryState) => {
  const key = VARIANT_TEXT_KEY_MAP[variant];
  return key ? GetTranslation(key, true) : null;
};

// Vertical gap (px) between the trigger button bottom edge and the popover top.
const POPOVER_OFFSET_PX = 6;
// Grace period (ms) before the popover hides after the pointer leaves, so the
// user can move from the trigger to the popover without it disappearing.
const CLOSE_DELAY_MS = 150;
const POPOVER_ID = 'gradebook-aggregate-popover';
// Must match max-width in .aggregatePopoverSurface. Used to clamp left so the
// popover doesn't overflow the right edge of the viewport.
const POPOVER_MAX_WIDTH_PX = 300;
const POPOVER_VIEWPORT_MARGIN_PX = 8;

/*
 * ContextualHelp renders a Spectrum Dialog in a portal; theme CSS is sometimes incomplete
 * in embedded shells (e.g. AEM), leaving a transparent panel. This hand-rolled popover
 * always renders with an explicit opaque background and stays within the iframe stacking
 * context, avoiding the transparency issue.
 */
const GradebookAggregateTooltip: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const computePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const left = Math.max(
      POPOVER_VIEWPORT_MARGIN_PX,
      Math.min(rect.left, window.innerWidth - POPOVER_MAX_WIDTH_PX - POPOVER_VIEWPORT_MARGIN_PX)
    );
    setPopoverStyle({ top: rect.bottom + POPOVER_OFFSET_PX, left });
  };

  const show = () => {
    cancelClose();
    computePosition();
    setOpen(true);
  };

  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      cancelClose();
      setOpen(false);
    }
  };

  // Re-position on scroll or resize so the popover tracks the trigger button.
  React.useEffect(() => {
    if (!open) return;
    const update = () => computePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  // Clear any pending close timer on unmount.
  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <span
      className={styles.aggregateTooltipWrap}
      onBlur={e => {
        // Hide when focus leaves the entire component (button + popover).
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          cancelClose();
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onKeyDown={handleKeyDown}
        aria-label={GetTranslation('alm.overview.gradebook.aggregateScore.infoAria', true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={POPOVER_ID}
        aria-describedby={open ? POPOVER_ID : undefined}
        data-automationid="gradebook-aggregate-info-btn"
        className={styles.aggregateInfoBtn}
      >
        <HelpOutline />
      </button>
      {open && (
        <div
          id={POPOVER_ID}
          className={styles.aggregatePopoverSurface}
          style={popoverStyle}
          onMouseEnter={cancelClose}
          onMouseLeave={hide}
        >
          <p className={styles.aggregateTooltipPara}>
            {GetTranslation('alm.overview.gradebook.aggregateScore.tooltipPara1', true)}
          </p>
          <p className={styles.aggregateTooltipPara}>
            {GetTranslation('alm.overview.gradebook.aggregateScore.tooltipPara2', true)}
          </p>
          <Link href={GRADEBOOK_LEARN_MORE_GO_URL} target="_blank" rel="noopener noreferrer">
            {GetTranslation('alm.text.learnMore', true)}
          </Link>
        </div>
      )}
    </span>
  );
};

const PrimeTrainingGradebookSummary: React.FC<PrimeTrainingGradebookSummaryProps> = ({
  passingCriteriaText,
  summaryState,
  progressMetrics,
  aggregateFormatted,
  gradebookPassingScore,
}) => {
  return (
    <div
      className={styles.summaryBanner}
      data-variant={summaryState}
      data-automationid="prime-gradebook-summary-banner"
    >
      <div className={styles.summaryTop}>
        {passingCriteriaText ? (
          <div className={styles.passingCriteria} role="status">
            <span className={styles.passingCriteriaLabel}>
              {GetTranslation('alm.overview.gradebook.passingCriteriaLabel', true)}
            </span>
            {passingCriteriaText}
            {gradebookPassingScore != null && gradebookPassingScore > 0 ? (
              <React.Fragment>
                {GetTranslation('alm.overview.gradebook.passingCriteriaJoiner', true)}
                {GetTranslationsReplaced(
                  'alm.overview.gradebook.passingCriteriaMinimumAggregateShort',
                  { score: gradebookPassingScore },
                  true
                )}
              </React.Fragment>
            ) : null}
          </div>
        ) : (
          <div className={styles.passingCriteriaSpacer} aria-hidden="true" />
        )}
        <div
          className={styles.completionPendingPill}
          data-automationid="gradebook-completion-pending"
          data-variant={summaryState}
          role="status"
        >
          <span className={styles.completionPendingIconWrap} aria-hidden="true">
            {getIcon(summaryState)}
          </span>
          <span>{getText(summaryState)}</span>
        </div>
      </div>
      <div className={styles.summaryMetrics}>
        <div className={styles.metricBlock}>
          <div className={styles.metricValue} data-automationid="gradebook-mandatory-progress">
            {progressMetrics.total > 0
              ? `${progressMetrics.completed}/${progressMetrics.total}`
              : GetTranslation('alm.overview.gradebook.scoreDash', true)}
          </div>
          <div className={styles.metricSub}>
            {GetTranslation('alm.overview.gradebook.requiredModulesProgress', true)}
          </div>
        </div>
        <div className={styles.metricDivider} aria-hidden="true" />
        <div className={styles.metricBlock}>
          <div className={styles.metricValueWithInfo}>
            <span data-automationid="gradebook-aggregate-banner">{aggregateFormatted}</span>
          </div>
          <div className={styles.metricSub}>
            {GetTranslation('alm.overview.gradebook.footer.aggregateScore', true)}
            <GradebookAggregateTooltip />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeTrainingGradebookSummary;
