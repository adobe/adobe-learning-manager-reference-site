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
import { useEffect, useRef } from 'react';
import { ToastQueue } from '@react-spectrum/toast';
import { ALMPopup, ALMPopupContent } from '../ALMPopup/ALMPopup';
import { GetTranslation } from '../../utils/translationService';
import { updateExternalLearning } from '../../utils/externalLearning';
import {
  useExternalLearningForm,
  ExternalLearningFormOptions,
} from '../../hooks/externalLearning/useExternalLearningForm';
import { ExternalLearningSettings } from '../../hooks/externalLearning/useExternalLearningSettings';
import ExternalLearningFormFields from './ExternalLearningFormFields';
import addFormStyles from './PrimeExternalLearningAddForm.module.css';

interface Props {
  submissionId: string;
  settings: ExternalLearningSettings;
  formOptions: ExternalLearningFormOptions;
  pendingSubmit: boolean;
  onClearPendingSubmit: () => void;
  onSuccess: () => void;
}

const InlineEditForm = ({
  submissionId,
  settings,
  formOptions,
  pendingSubmit,
  onClearPendingSubmit,
  onSuccess,
}: Props) => {
  const formState = useExternalLearningForm(settings, formOptions);
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
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeToastRef = useRef<(() => void) | null>(null);

  const dismissActiveToast = () => {
    closeToastRef.current?.();
    closeToastRef.current = null;
  };

  useEffect(() => {
    if (!pendingSubmit) return;
    onClearPendingSubmit();
    if (validateForm()) setIsConfirmOpen(true);
  }, [pendingSubmit, validateForm, onClearPendingSubmit, setIsConfirmOpen]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current !== null) clearTimeout(navTimerRef.current);
      dismissActiveToast();
    };
  }, []);

  const handleSubmitConfirm = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await updateExternalLearning(submissionId, buildPayload());
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
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error updating external learning', error);
      dismissActiveToast();
      closeToastRef.current = ToastQueue.negative(
        GetTranslation('alm.text.externalLearning.submitError'),
        { timeout: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ExternalLearningFormFields form={settings} state={formState} />

      {(showToastBackdrop || isConfirmOpen) && <div className={addFormStyles.confirmBackdrop} />}
      <ALMPopup
        id="external-learning-update-confirm"
        direction="center"
        borderRadius="all"
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        closeOnClickOutside={false}
        dialogClass={addFormStyles.confirmDialog}
      >
        <ALMPopupContent>
          <p className={addFormStyles.confirmHeader}>
            {GetTranslation('alm.text.submitExternalLearning')}
          </p>
          <p className={addFormStyles.confirmBody}>
            {GetTranslation('alm.text.submitExternalLearning.message')}
          </p>
          <p className={addFormStyles.confirmBody}>
            {GetTranslation('alm.text.doYouWantToContinue')}
          </p>
          <div className={addFormStyles.confirmActions}>
            <button
              className={`almButton ${addFormStyles.cancelButton}`}
              onClick={() => setIsConfirmOpen(false)}
            >
              {GetTranslation('alm.overview.unenrollment.confirmationNo')}
            </button>
            <button
              className="almButton primary"
              disabled={isSubmitting || isUploading}
              onClick={handleSubmitConfirm}
            >
              {GetTranslation('alm.overview.unenrollment.confirmationYes')}
            </button>
          </div>
        </ALMPopupContent>
      </ALMPopup>
    </>
  );
};

export default InlineEditForm;
