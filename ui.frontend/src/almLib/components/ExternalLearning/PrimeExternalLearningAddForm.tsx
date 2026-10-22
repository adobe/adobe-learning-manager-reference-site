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
import { useCallback, useEffect, useRef } from 'react';
import { ToastContainer, ToastQueue } from '@react-spectrum/toast';
import { Heading, lightTheme, Provider } from '@adobe/react-spectrum';
import { ALMErrorBoundary } from '../Common/ALMErrorBoundary';
import { ALMLoader } from '../Common/ALMLoader';
import { ALMPopup, ALMPopupContent } from '../ALMPopup/ALMPopup';
import { canAddExternalLearning, getALMConfig, getALMObject } from '../../utils/global';
import { GetTranslation } from '../../utils/translationService';
import { useUserContext } from '../../contextProviders/userContextProvider';
import { useDeviceTypeContext } from '../../contextProviders/DeviceContextProvider';
import { useExternalLearningAddForm } from '../../hooks/externalLearning';
import { useExternalLearningForm } from '../../hooks/externalLearning/useExternalLearningForm';
import { PrimeAccount } from '../../models/PrimeModels';
import ExternalLearningFormFields from './ExternalLearningFormFields';
import ExternalLearningBreadcrumb from './ExternalLearningBreadcrumb';
import { StickyActionBar } from '../Common/StickyActionBar';
import styles from './PrimeExternalLearningAddForm.module.css';

// Inner component owns the data hooks (useExternalLearningAddForm fires the settings API on mount).
// Splitting it out from the outer gate means the API call does NOT fire when access is denied.
const AddFormContent = () => {
  const { externalLearningForm, isLoading, submitExternalLearning } = useExternalLearningAddForm();
  const formState = useExternalLearningForm(externalLearningForm);
  const deviceContext = useDeviceTypeContext();
  const isMobileOrTablet = deviceContext.isMobile || deviceContext.isTablet;
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeToastRef = useRef<(() => void) | null>(null);

  const dismissActiveToast = () => {
    closeToastRef.current?.();
    closeToastRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (navTimerRef.current !== null) clearTimeout(navTimerRef.current);
      dismissActiveToast();
    };
  }, []);

  const {
    isUploading,
    isSubmitting,
    setIsSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    showToastBackdrop,
    setShowToastBackdrop,
    buildPayload,
    validateForm,
  } = formState;

  const handleNavigateToMyLearning = useCallback(
    () => getALMObject().navigateToMyLearningPage(),
    []
  );
  const handleCancel = useCallback(() => getALMObject().navigateToExternalLearningPage(), []);

  const handleSubmitConfirm = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await submitExternalLearning(buildPayload());
      setShowToastBackdrop(true);
      dismissActiveToast();
      closeToastRef.current = ToastQueue.info(
        GetTranslation('alm.text.externalLearning.submittedForReview'),
        { timeout: 2000 }
      );
      navTimerRef.current = setTimeout(() => {
        navTimerRef.current = null;
        dismissActiveToast();
        setShowToastBackdrop(false);
        getALMObject().navigateToExternalLearningPage();
      }, 2000);
    } catch (error) {
      console.error('Error submitting external learning', error);
      dismissActiveToast();
      closeToastRef.current = ToastQueue.negative(
        GetTranslation('alm.text.externalLearning.submitError'),
        { timeout: 2000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ALMErrorBoundary>
      <Provider
        theme={lightTheme}
        colorScheme={'light'}
        locale={(getALMConfig().locale || 'en-US').replace('_', '-')}
      >
        <div
          className={`${styles.pageContainer}${isMobileOrTablet ? ` ${styles.pageContainerStickyOffset}` : ''}`}
        >
          <div className={styles.headerContainer}>
            <ExternalLearningBreadcrumb
              onMyLearningClick={handleNavigateToMyLearning}
              onExternalLearningClick={handleCancel}
            />

            <div className={styles.header}>
              <Heading
                level={1}
                UNSAFE_className={styles.label}
                data-automationid="addExternalLearningHeading"
              >
                {GetTranslation('alm.text.addExternalLearning', true)}
              </Heading>
              {!isMobileOrTablet && (
                <div className={styles.actions}>
                  <button className={`almButton ${styles.cancelButton}`} onClick={handleCancel}>
                    {GetTranslation('alm.text.cancel', true)}
                  </button>
                  <button
                    className="almButton primary"
                    type="button"
                    disabled={isUploading || isSubmitting}
                    onClick={() => {
                      if (validateForm()) setIsConfirmOpen(true);
                    }}
                  >
                    {GetTranslation('alm.text.submit', true)}
                  </button>
                </div>
              )}
            </div>

            <p className={styles.description}>
              {GetTranslation('alm.text.addExternalLearning.description', true)}
            </p>
          </div>

          {isLoading && <ALMLoader classes={styles.loader} />}

          {!isLoading && externalLearningForm && (
            <ExternalLearningFormFields form={externalLearningForm} state={formState} />
          )}

          {(showToastBackdrop || isConfirmOpen) && <div className={styles.confirmBackdrop} />}
          <ALMPopup
            id="external-learning-submit-confirm"
            direction="center"
            borderRadius="all"
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            closeOnClickOutside={false}
            dialogClass={styles.confirmDialog}
          >
            <ALMPopupContent>
              <p className={styles.confirmHeader}>
                {GetTranslation('alm.text.submitExternalLearning')}
              </p>
              <p className={styles.confirmBody}>
                {GetTranslation('alm.text.submitExternalLearning.message')}
              </p>
              <p className={styles.confirmBody}>{GetTranslation('alm.text.doYouWantToContinue')}</p>
              <div className={styles.confirmActions}>
                <button
                  className={`almButton ${styles.cancelButton}`}
                  onClick={() => setIsConfirmOpen(false)}
                >
                  {GetTranslation('alm.overview.unenrollment.confirmationNo')}
                </button>
                <button className="almButton primary" onClick={handleSubmitConfirm}>
                  {GetTranslation('alm.overview.unenrollment.confirmationYes')}
                </button>
              </div>
            </ALMPopupContent>
          </ALMPopup>
        </div>

        {isMobileOrTablet && (
          <StickyActionBar>
            <button
              className={`almButton ${styles.cancelButton} ${styles.stickyActionButton}`}
              onClick={handleCancel}
            >
              {GetTranslation('alm.text.cancel', true)}
            </button>
            <button
              className={`almButton primary ${styles.stickyActionButton}`}
              type="button"
              disabled={isUploading || isSubmitting}
              onClick={() => {
                if (validateForm()) setIsConfirmOpen(true);
              }}
            >
              {GetTranslation('alm.text.submit', true)}
            </button>
          </StickyActionBar>
        )}
        <ToastContainer />
      </Provider>
    </ALMErrorBoundary>
  );
};

const PrimeExternalLearningAddForm = () => {
  const { user } = useUserContext() || {};
  const account = user?.account as PrimeAccount | undefined;
  // The add page requires canAdd specifically — the route-level gate only checks (canShow || canAdd),
  // so we defend here against direct deep-link entry when the account flag is off.
  const accessDenied = !!account && !canAddExternalLearning(account);

  useEffect(() => {
    if (accessDenied) getALMObject().navigateToHomePage();
  }, [accessDenied]);

  // Render nothing while the user context is loading or when access is denied.
  // AddFormContent is only mounted when access is confirmed, so its data hooks
  // (and the resulting API calls) never fire for unauthorized users.
  if (!account || accessDenied) return null;

  return <AddFormContent />;
};

export default PrimeExternalLearningAddForm;
