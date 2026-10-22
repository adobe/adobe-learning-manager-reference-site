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
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ActionButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import {
  PrimeLearningObjectInstanceEnrollment,
  PrimeLearningObjectResource,
} from '../../../models/PrimeModels';
import { ENGLISH_LOCALE } from '../../../utils/constants';
import { useUserContext } from '../../../contextProviders/userContextProvider';
import { ALM_TOOLTIP } from '../../../utils/inline_svg';
import { GetTranslation } from '../../../utils/translationService';
import styles from './PrimeGradebookModuleTable.module.css';
import PrimeGradebookModuleRow from './PrimeGradebookModuleRow';

export type PrimeGradebookModuleTableProps = {
  loResources: PrimeLearningObjectResource[];
  aggregateFormatted: string;
  enrollment: PrimeLearningObjectInstanceEnrollment | null | undefined;
  hasOptionalLoResources: boolean;
};

const PrimeGradebookModuleTable: React.FC<PrimeGradebookModuleTableProps> = ({
  loResources,
  aggregateFormatted,
  enrollment,
  hasOptionalLoResources,
}) => {
  const { user } = useUserContext() || {};
  const contentLocale = user?.contentLocale || ENGLISH_LOCALE;

  // Column headers are ellipsis-truncated when a translation doesn't fit the fixed
  // column width (see .table th). `title` surfaces the full label on hover/long-press
  // and via assistive tech so the truncation doesn't hide information from anyone.
  const moduleColumnLabel = GetTranslation('alm.text.module', true);
  const statusColumnLabel = GetTranslation('alm.overview.gradebook.column.status', true);
  const weightageColumnLabel = GetTranslation('alm.overview.gradebook.column.weightage', true);
  const scoreColumnLabel = GetTranslation('alm.overview.gradebook.column.score', true);
  const contributionColumnLabel = GetTranslation(
    'alm.overview.gradebook.column.contribution',
    true
  );

  // On mobile, .tableScrollWrapper::after paints a white fade over the right edge
  // of the table to hint that it scrolls horizontally. The Contribution column is
  // last, so the fade sits on top of its info icon unless we know we've reached
  // the scroll end. `hideScrollFade` drives the `hideScrollFade` CSS modifier that
  // suppresses that fade.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hideScrollFade, setHideScrollFade] = useState(false);

  // TooltipTrigger's default hover/focus opening never fires on touch: there's no
  // hover on touchscreens, and iOS Safari doesn't give buttons focus on tap. Making
  // the tooltip a controlled component and toggling it from the button's onPress
  // (which fires for both mouse and touch) lets it open on mobile tap too, while
  // desktop hover/focus keep working as before via onOpenChange.
  // shouldCloseOnPress={false} on the TooltipTrigger below is required for the toggle
  // to work at all: react-aria's default press handling force-closes the tooltip on
  // every pointerdown/keydown before onPress fires, which would otherwise race with
  // this toggle and make every press converge to "open" (the close never sticks).
  const [isContributionTooltipOpen, setIsContributionTooltipOpen] = useState(false);

  const updateScrollFade = useCallback(() => {
    const el = scrollRef.current;
    // scrollRef is always attached to the unconditionally-rendered .tableScroll
    // div by the time this runs; this only satisfies the nullable ref typing.
    /* istanbul ignore if */
    if (!el) {
      return;
    }
    // "- 1" tolerates the sub-pixel rounding some browsers introduce between
    // scrollLeft/clientWidth/scrollWidth, which would otherwise never satisfy `>=`.
    const isAtScrollEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setHideScrollFade(isAtScrollEnd);
  }, []);

  // useLayoutEffect (not useEffect) so the initial measurement happens before the
  // browser paints — otherwise a table that doesn't overflow would flash the fade
  // on for one frame before this corrects it.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    // Same as above: unreachable in practice, kept only for the ref's nullable type.
    /* istanbul ignore if */
    if (!el) {
      return;
    }
    updateScrollFade();
    el.addEventListener('scroll', updateScrollFade, { passive: true });
    // Re-measure on size changes too: content/orientation changes can flip the
    // overflow state without firing a 'scroll' event.
    const resizeObserver = new ResizeObserver(updateScrollFade);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollFade);
      resizeObserver.disconnect();
    };
    // loResources.length (not loResources) so this doesn't tear down/re-attach the
    // listeners on every parent re-render that passes a new array with the same rows.
  }, [updateScrollFade, loResources.length]);

  return (
    <div
      className={`${styles.tableScrollWrapper}${hideScrollFade ? ` ${styles.hideScrollFade}` : ''}`}
    >
      <div className={styles.tableScroll} ref={scrollRef}>
        <table
          className={styles.table}
          data-automationid="prime-gradebook-module-list"
          aria-label={GetTranslation('alm.text.gradebook', true)}
        >
          <thead>
            <tr>
              <th scope="col" className={styles.thModule} title={moduleColumnLabel}>
                {moduleColumnLabel}
              </th>
              <th scope="col" className={styles.thStatus} title={statusColumnLabel}>
                {statusColumnLabel}
              </th>
              <th
                scope="col"
                className={`${styles.thNumeric} ${styles.cellWeight}`}
                title={weightageColumnLabel}
              >
                {weightageColumnLabel}
              </th>
              <th
                scope="col"
                className={`${styles.thScore} ${styles.cellScore}`}
                title={scoreColumnLabel}
              >
                {scoreColumnLabel}
              </th>
              <th scope="col" className={`${styles.cellContribution} ${styles.thContribution}`}>
                <div className={styles.contributionHeader}>
                  <span className={styles.contributionLabel} title={contributionColumnLabel}>
                    {contributionColumnLabel}
                  </span>
                  <span
                    className={styles.contributionTooltipWrap}
                    data-automationid="gradebook-contribution-header-tooltip"
                  >
                    <TooltipTrigger
                      placement="bottom"
                      delay={300}
                      trigger="hover"
                      isOpen={isContributionTooltipOpen}
                      onOpenChange={setIsContributionTooltipOpen}
                      shouldCloseOnPress={false}
                    >
                      <ActionButton
                        isQuiet
                        UNSAFE_className={styles.contributionTooltipTrigger}
                        aria-label={GetTranslation('text.moreInformation', true)}
                        onPress={() => setIsContributionTooltipOpen(isOpen => !isOpen)}
                      >
                        {ALM_TOOLTIP()}
                      </ActionButton>
                      <Tooltip>
                        {GetTranslation('alm.overview.gradebook.contribution.tooltip', true)}
                      </Tooltip>
                    </TooltipTrigger>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loResources.map(loResource => (
              <PrimeGradebookModuleRow
                key={`gradebook-${loResource.id}`}
                loResource={loResource}
                contentLocale={contentLocale}
                enrollment={enrollment}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              <td colSpan={4} className={styles.footerLabel}>
                {GetTranslation('alm.overview.gradebook.footer.aggregateScore', true)}
              </td>
              <td
                className={`${styles.cellContribution} ${styles.cellNumeric} ${styles.footerAggregate}`}
              >
                <span data-automationid="gradebook-footer-aggregate">{aggregateFormatted}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PrimeGradebookModuleTable;
