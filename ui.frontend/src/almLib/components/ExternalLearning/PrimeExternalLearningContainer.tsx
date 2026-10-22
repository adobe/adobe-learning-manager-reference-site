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
import { memo, useCallback, useRef } from 'react';
import useLoadMore from '../../hooks/loadMore/useLoadMore';
import { Heading, lightTheme, Provider } from '@adobe/react-spectrum';
import { ALMErrorBoundary } from '../Common/ALMErrorBoundary';
import { ALMLoader } from '../Common/ALMLoader';
import { canAddExternalLearning, getALMConfig, getALMObject } from '../../utils/global';
import { GetTranslation } from '../../utils/translationService';
import { modifyTimeDDMMYY } from '../../utils/dateTime';
import { EXTERNAL_LEARNING_EMPTY_STATE_ICON, INFO_ICON, PLUS_ICON } from '../../utils/inline_svg';
import { useExternalLearning } from '../../hooks/externalLearning';
import { useUserContext } from '../../contextProviders/userContextProvider';
import { useDeviceTypeContext } from '../../contextProviders/DeviceContextProvider';
import { PrimeAccount, PrimeExternalLearningSubmission } from '../../models/PrimeModels';
import {
  STATUS_CONFIG,
  STATUS_STYLE_KEY,
  ExternalLearningStatus,
} from './externalLearningConstants';
import ExternalLearningBreadcrumb from './ExternalLearningBreadcrumb';
import { StickyActionBar } from '../Common/StickyActionBar';
import styles from './PrimeExternalLearningContainer.module.css';

const getTitleValue = (submission: PrimeExternalLearningSubmission): string => {
  const titleField = submission.fields?.find(f => f.id === 'title');
  return titleField?.value || '';
};

const StatusCell = ({ status }: { status: string }) => {
  const key = (
    STATUS_CONFIG[status as ExternalLearningStatus] ? status : 'PENDING'
  ) as ExternalLearningStatus;
  const config = STATUS_CONFIG[key];
  return (
    <div className={`${styles.statusCell} ${styles[STATUS_STYLE_KEY[key]]}`}>
      <span className={styles.statusDot} aria-hidden="true" />
      <span className={styles.statusText}>{GetTranslation(config.labelKey)}</span>
    </div>
  );
};

const SubmissionsTable = ({
  submissions,
  locale,
}: {
  submissions: PrimeExternalLearningSubmission[];
  locale: string;
}) => {
  return (
    <div
      role="table"
      aria-label={GetTranslation('alm.text.externalLearning', true)}
      className={styles.table}
    >
      <div role="rowgroup">
        <div role="row" className={styles.tableHeader}>
          <div role="columnheader" className={styles.colTitle}>
            {GetTranslation('text.externallearning.title')}
          </div>
          <div role="columnheader" className={styles.colMeta}>
            {GetTranslation('text.externallearning.table.submittedOn')}
          </div>
          <div role="columnheader" className={styles.colMeta}>
            {GetTranslation('text.externallearning.table.reviewStatus')}
          </div>
        </div>
      </div>
      <div role="rowgroup">
        {submissions.map(submission => (
          <div key={submission.id}>
            <div role="row" className={styles.tableRow}>
              <div role="cell" className={styles.colTitle}>
                <button
                  className={styles.titleLink}
                  title={getTitleValue(submission)}
                  onClick={() => getALMObject().navigateToExternalLearningDetailPage(submission.id)}
                >
                  {getTitleValue(submission)}
                </button>
              </div>
              <div role="cell" className={styles.colMeta}>
                {modifyTimeDDMMYY(submission.modifiedAt, locale)}
              </div>
              <div role="cell" className={styles.colMeta}>
                <StatusCell status={submission.status} />
              </div>
            </div>
            <div className={styles.rowSeparator} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SubmissionsCardList = ({
  submissions,
  locale,
}: {
  submissions: PrimeExternalLearningSubmission[];
  locale: string;
}) => {
  return (
    <div className={styles.cardList}>
      {submissions.map(submission => (
        <div key={submission.id}>
          <div className={styles.card}>
            <button
              className={styles.titleLink}
              title={getTitleValue(submission)}
              onClick={() => getALMObject().navigateToExternalLearningDetailPage(submission.id)}
            >
              {getTitleValue(submission)}
            </button>
            <div className={styles.cardMeta}>
              <span className={styles.cardMetaLabel}>
                {GetTranslation('text.externallearning.table.submittedOn')}:
              </span>
              <span className={styles.cardMetaValue}>
                {modifyTimeDDMMYY(submission.modifiedAt, locale)}
              </span>
            </div>
            <div className={styles.cardMeta}>
              <span className={styles.cardMetaLabel}>
                {GetTranslation('text.externallearning.table.reviewStatus')}:
              </span>
              <span className={styles.cardMetaValue}>
                <StatusCell status={submission.status} />
              </span>
            </div>
          </div>
          <div className={styles.rowSeparator} />
        </div>
      ))}
    </div>
  );
};

const ExternalLearningEmptyState = memo(({ canAdd }: { canAdd: boolean }) => (
  <div className={styles.emptyContainer}>
    <div className={styles.emptyIcon}>{EXTERNAL_LEARNING_EMPTY_STATE_ICON()}</div>
    <p className={styles.emptyTitle}>
      {GetTranslation('alm.text.externalLearning.emptyState.title', true)}
    </p>
    <p className={styles.emptyDescription}>
      {GetTranslation('alm.text.externalLearning.emptyState.description', true)}
    </p>
    {canAdd && (
      <button
        className={`almButton primary ${styles.addButton}`}
        onClick={() => getALMObject().navigateToAddExternalLearningPage()}
      >
        {PLUS_ICON()}
        {GetTranslation('alm.text.externalLearning.addButton', true)}
      </button>
    )}
  </div>
));

ExternalLearningEmptyState.displayName = 'ExternalLearningEmptyState';

const NoNewRequestsBanner = () => (
  <div className={styles.infoBanner}>
    <div className={styles.infoBannerContent}>
      <p className={styles.infoBannerTitle}>
        {GetTranslation('text.externallearning.noNewRequests.title')}
      </p>
      <p className={styles.infoBannerDescription}>
        {GetTranslation('text.externallearning.noNewRequests.description')}
      </p>
    </div>
    <span className={styles.infoBannerIcon}>{INFO_ICON()}</span>
  </div>
);

const PrimeExternalLearningContainer = () => {
  const { submissions, isLoading, isLoadingMore, hasMore, loadMore } = useExternalLearning();
  const { user } = useUserContext() || {};
  const account = user?.account as PrimeAccount;
  const canAdd = canAddExternalLearning(account);
  const locale = getALMConfig().locale || 'en-US';
  const deviceContext = useDeviceTypeContext();
  const isMobileOrTablet = deviceContext.isMobile || deviceContext.isTablet;
  const showStickyAddBar = isMobileOrTablet && !isLoading && submissions.length > 0 && canAdd;
  const sentinelRef = useRef(null);
  useLoadMore({ items: submissions, callback: loadMore, elementRef: sentinelRef });

  const handleNavigateToMyLearning = useCallback(
    () => getALMObject().navigateToMyLearningPage(),
    []
  );

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={'light'}>
        <div
          className={`${styles.pageContainer}${showStickyAddBar ? ` ${styles.pageContainerStickyOffset}` : ''}`}
        >
          <div className={styles.headerContainer}>
            <ExternalLearningBreadcrumb onMyLearningClick={handleNavigateToMyLearning} />
            <div className={styles.header}>
              <Heading
                level={1}
                UNSAFE_className={styles.label}
                data-automationid="externalLearningHeading"
              >
                {GetTranslation('alm.text.externalLearning', true)}
              </Heading>
              {!isMobileOrTablet && !isLoading && submissions.length > 0 && canAdd && (
                <button
                  className={`almButton primary ${styles.addButton}`}
                  onClick={() => getALMObject().navigateToAddExternalLearningPage()}
                >
                  {PLUS_ICON()}
                  {GetTranslation('alm.text.externalLearning.addButton', true)}
                </button>
              )}
            </div>
            <p className={styles.description}>
              {GetTranslation('alm.text.externalLearning.summary', true)}
            </p>
          </div>
          {isLoading && <ALMLoader classes={styles.loader} />}
          {!isLoading && !submissions.length && <ExternalLearningEmptyState canAdd={canAdd} />}
          {!isLoading && submissions.length > 0 && (
            <>
              {!canAdd && <NoNewRequestsBanner />}
              {isMobileOrTablet ? (
                <SubmissionsCardList submissions={submissions} locale={locale} />
              ) : (
                <SubmissionsTable submissions={submissions} locale={locale} />
              )}
            </>
          )}
          <div ref={sentinelRef} id="load-more-external-learnings">
            {isLoadingMore && <ALMLoader classes={styles.loadMoreLoader} />}
          </div>
        </div>

        {showStickyAddBar && (
          <StickyActionBar>
            <button
              className={`almButton primary ${styles.stickyAddButton}`}
              onClick={() => getALMObject().navigateToAddExternalLearningPage()}
            >
              {PLUS_ICON()}
              {GetTranslation('alm.text.externalLearning.addButton', true)}
            </button>
          </StickyActionBar>
        )}
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeExternalLearningContainer;
