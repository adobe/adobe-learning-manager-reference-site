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
import { useCallback, useState } from 'react';
import { ToastContainer } from '@react-spectrum/toast';
import { lightTheme, Provider } from '@adobe/react-spectrum';
import { ALMErrorBoundary } from '../Common/ALMErrorBoundary';
import { ALMLoader } from '../Common/ALMLoader';
import { getALMConfig, getALMObject } from '../../utils/global';
import { GetTranslation, GetTranslationsReplaced } from '../../utils/translationService';
import { modifyTimeDDMMYY } from '../../utils/dateTime';
import { useExternalLearningDetail } from '../../hooks/externalLearning';
import { ExternalLearningFormOptions } from '../../hooks/externalLearning/useExternalLearningForm';
import { useDeviceTypeContext } from '../../contextProviders/DeviceContextProvider';
import ExternalLearningBreadcrumb from './ExternalLearningBreadcrumb';
import { StickyActionBar } from '../Common/StickyActionBar';
import StatusBadge from './StatusBadge';
import InlineEditForm from './InlineEditForm';
import AttachmentPreviewDialog from './AttachmentPreviewDialog';
import {
  buildInitialFormState,
  getFieldLabel,
  handleDownload,
  renderFieldValue,
} from './externalLearningDetailUtils';
import {
  isPreviewableAttachment,
  isPdfAttachment,
  safeGetFileName,
} from './externalLearningConstants';
import styles from './PrimeExternalLearningDetailContainer.module.css';

interface Props {
  id: string;
}

const PrimeExternalLearningDetailContainer = ({ id }: Props) => {
  const { submission, enrichedFields, settings, reviewerName, isLoading, errorCode } =
    useExternalLearningDetail(id);
  const locale = getALMConfig().locale || 'en-US';
  const deviceContext = useDeviceTypeContext();
  const isMobileOrTablet = deviceContext.isMobile || deviceContext.isTablet;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [editFormOptions, setEditFormOptions] = useState<ExternalLearningFormOptions>({});

  const handleNavigateToMyLearning = useCallback(
    () => getALMObject().navigateToMyLearningPage(),
    []
  );
  const handleNavigateToExternalLearning = useCallback(
    () => getALMObject().navigateToExternalLearningPage(),
    []
  );

  const title = submission?.title || '';
  const status = submission?.status || 'PENDING';
  const modifiedAt = submission?.modifiedAt;
  const submissionUrl: string = submission?.submissionUrl || '';
  const reviewerRemarks: string = submission?.reviewerComment || '';
  const attachmentFileName = submissionUrl ? safeGetFileName(submissionUrl) : '';
  // Only images/PDFs render in the preview modal; doc/docx are download-only.
  const canPreviewAttachment = isPreviewableAttachment(attachmentFileName);

  const handleStartEdit = () => {
    const { formValues, dateTypes } = buildInitialFormState(enrichedFields);
    setEditFormOptions({
      initialValues: formValues,
      initialDateTypes: dateTypes,
      initialSubmissionUrl: submissionUrl,
      initialFileNames: attachmentFileName ? { attachments: [attachmentFileName] } : {},
    });
    setEditKey(k => k + 1);
    setIsEditing(true);
  };

  // Load-error state: fetch finished (isLoading=false) but no submission came back.
  // Without this branch the page would render blank, which looks like an infinite loader.
  const hasLoadError = !isLoading && !submission && (errorCode || !id);

  const sideColumnJSX = submission ? (
    <div className={`${styles.sideColumn}${isMobileOrTablet ? ` ${styles.mobileSideColumn}` : ''}`}>
      <div className={styles.fieldItem}>
        <span className={styles.fieldLabel}>
          {GetTranslation('text.externallearning.attachments')}
        </span>
        {submissionUrl ? (
          <div className={styles.attachmentRow}>
            <span className={styles.attachmentName}>{attachmentFileName}</span>
            <div className={styles.attachmentActions}>
              {canPreviewAttachment &&
                !(isMobileOrTablet && isPdfAttachment(attachmentFileName)) && (
                  <button className={styles.attachmentAction} onClick={() => setPreviewOpen(true)}>
                    {GetTranslation('text.externallearning.detail.view')}
                  </button>
                )}
              <button
                className={styles.attachmentAction}
                onClick={() => handleDownload(submissionUrl, attachmentFileName)}
              >
                {GetTranslation('text.externallearning.detail.download')}
              </button>
            </div>
          </div>
        ) : (
          <span className={styles.fieldValue}>-</span>
        )}
      </div>

      {isMobileOrTablet && <div className={`${styles.divider} ${styles.mobileReviewerDivider}`} />}
      <div className={styles.fieldItem}>
        <span className={styles.fieldLabel}>
          {GetTranslation('text.externallearning.detail.reviewerRemarks')}
        </span>
        <span className={styles.fieldValue}>{reviewerRemarks || '-'}</span>
        {(reviewerName || submission?.reviewedAt) && (
          <span className={styles.reviewedByLine}>
            {GetTranslationsReplaced('alm.externalLearning.reviewedByOn', {
              name: reviewerName,
              date: modifyTimeDDMMYY(submission?.reviewedAt || '', locale),
            })}
          </span>
        )}
      </div>
    </div>
  ) : null;

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={'light'} locale={locale.replace('_', '-')}>
        <div
          className={`${styles.pageContainer}${isMobileOrTablet && submission && status === 'PENDING' ? ` ${styles.pageContainerStickyOffset}` : ''}`}
        >
          <div className={styles.headerContainer}>
            <ExternalLearningBreadcrumb
              onMyLearningClick={handleNavigateToMyLearning}
              onExternalLearningClick={handleNavigateToExternalLearning}
              currentLabel={title}
            />
          </div>

          {isLoading && <ALMLoader classes={styles.loader} />}

          {hasLoadError && (
            <div className={styles.loadErrorContainer} role="alert">
              {GetTranslation('alm.error.message')}
            </div>
          )}

          {!isLoading && submission && (
            <>
              {/* Header: title + status (desktop only) on left, action buttons on right */}
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <h1
                    className={styles.label}
                    data-automationid="externalLearningDetailHeading"
                    title={title}
                  >
                    {title}
                  </h1>
                  {!isMobileOrTablet && <StatusBadge status={status} />}
                </div>

                {!isMobileOrTablet && status === 'PENDING' && !isEditing && (
                  <button
                    className={`almButton primary ${styles.editButton}`}
                    onClick={handleStartEdit}
                  >
                    {GetTranslation('text.externallearning.detail.edit')}
                  </button>
                )}

                {isEditing && !isMobileOrTablet && (
                  <div className={styles.editActions}>
                    <button
                      className={`almButton ${styles.cancelButton}`}
                      onClick={() => setIsEditing(false)}
                    >
                      {GetTranslation('alm.text.cancel', true)}
                    </button>
                    <button className="almButton primary" onClick={() => setPendingSubmit(true)}>
                      {GetTranslation('alm.text.submit', true)}
                    </button>
                  </div>
                )}
              </div>

              {modifiedAt && (
                <p className={styles.submittedLine}>
                  <span className={styles.submittedLabel}>
                    {GetTranslation('text.externallearning.detail.requestSubmittedOn')}
                  </span>{' '}
                  <span className={styles.submittedDate}>
                    {modifyTimeDDMMYY(modifiedAt, locale)}
                  </span>
                </p>
              )}
              {/* On mobile/tablet: status badge appears below the submitted-on line */}
              {isMobileOrTablet && (
                <div className={styles.mobileBadge}>
                  <StatusBadge status={status} />
                </div>
              )}

              {!isMobileOrTablet && <div className={styles.divider} />}

              {/* Edit mode: inline form */}
              {isEditing && settings && (
                <InlineEditForm
                  key={editKey}
                  submissionId={id}
                  settings={settings}
                  formOptions={editFormOptions}
                  pendingSubmit={pendingSubmit}
                  onClearPendingSubmit={() => setPendingSubmit(false)}
                  onSuccess={() => getALMObject().navigateToExternalLearningPage()}
                />
              )}

              {/* View mode: desktop = two-column, mobile = fields then side */}
              {!isEditing && (
                <>
                  <div className={styles.contentBody}>
                    <div className={styles.fieldsColumn}>
                      {enrichedFields.map(field => (
                        <div key={field.id} className={styles.fieldItem}>
                          <span className={styles.fieldLabel}>{getFieldLabel(field)}</span>
                          <span className={styles.fieldValue}>
                            {renderFieldValue(field, locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!isMobileOrTablet && sideColumnJSX}
                  </div>
                  {isMobileOrTablet && sideColumnJSX}
                </>
              )}
            </>
          )}
        </div>

        {isMobileOrTablet && submission && status === 'PENDING' && !isEditing && (
          <StickyActionBar>
            <button
              className={`almButton primary ${styles.stickyEditButton}`}
              onClick={handleStartEdit}
            >
              {GetTranslation('text.externallearning.detail.edit')}
            </button>
          </StickyActionBar>
        )}

        {isMobileOrTablet && submission && isEditing && (
          <StickyActionBar>
            <button
              className={`almButton ${styles.cancelButton} ${styles.stickyActionButton}`}
              onClick={() => setIsEditing(false)}
            >
              {GetTranslation('alm.text.cancel', true)}
            </button>
            <button
              className={`almButton primary ${styles.stickyActionButton}`}
              onClick={() => setPendingSubmit(true)}
            >
              {GetTranslation('alm.text.submit', true)}
            </button>
          </StickyActionBar>
        )}

        {!isEditing && (
          <AttachmentPreviewDialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            url={submissionUrl}
            fileName={attachmentFileName}
          />
        )}
        <ToastContainer />
      </Provider>
    </ALMErrorBoundary>
  );
};

export default PrimeExternalLearningDetailContainer;
