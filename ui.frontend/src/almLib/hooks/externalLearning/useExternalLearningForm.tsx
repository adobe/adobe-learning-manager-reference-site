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
import { Dispatch, SetStateAction, useState } from 'react';
import { getUploadInfo, uploadFile } from '../../utils/uploadUtils';
import { GetTranslation } from '../../utils/translationService';
import {
  ACCEPTED_FILE_TYPES,
  DEFAULT_DURATION_PERIOD,
} from '../../components/ExternalLearning/externalLearningConstants';
import { ExternalLearningField, ExternalLearningSettings } from './useExternalLearningSettings';

export type DateType = 'startDate' | 'endDate' | 'both';

export interface ExternalLearningFormState {
  formValues: Record<string, any>;
  dateTypes: Record<string, DateType>;
  setDateTypes: Dispatch<SetStateAction<Record<string, DateType>>>;
  fileNames: Record<string, string[]>;
  fileErrors: Record<string, string>;
  scoreError: string;
  setScoreError: Dispatch<SetStateAction<string>>;
  submissionUrl: string;
  isUploading: boolean;
  fieldErrors: Record<string, string>;
  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  isConfirmOpen: boolean;
  setIsConfirmOpen: Dispatch<SetStateAction<boolean>>;
  showToastBackdrop: boolean;
  setShowToastBackdrop: Dispatch<SetStateAction<boolean>>;
  setFieldValue: (id: string, value: any) => void;
  handleFiles: (id: string, files: File[]) => Promise<void>;
  buildPayload: () => object;
  validateForm: () => boolean;
}

export interface ExternalLearningFormOptions {
  initialValues?: Record<string, any>;
  initialDateTypes?: Record<string, DateType>;
  initialSubmissionUrl?: string;
  initialFileNames?: Record<string, string[]>;
}

const ALLOWED_MIME_TYPES = new Set(ACCEPTED_FILE_TYPES);

export const useExternalLearningForm = (
  form: ExternalLearningSettings | null,
  options: ExternalLearningFormOptions = {}
): ExternalLearningFormState => {
  const [formValues, setFormValuesState] = useState<Record<string, any>>(
    () => options.initialValues || {}
  );
  const [dateTypes, setDateTypes] = useState<Record<string, DateType>>(
    () => options.initialDateTypes || {}
  );
  const [fileNames, setFileNames] = useState<Record<string, string[]>>(
    () => options.initialFileNames || {}
  );
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [scoreError, setScoreError] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState(() => options.initialSubmissionUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showToastBackdrop, setShowToastBackdrop] = useState(false);

  const setFieldValue = (id: string, value: any) => {
    setFormValuesState(prev => ({ ...prev, [id]: value }));
    setFieldErrors(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleFiles = async (id: string, files: File[]) => {
    if (!files.length) return;
    if (files.length > 1) {
      setFileErrors(prev => ({
        ...prev,
        [id]: GetTranslation('text.externallearning.file.onlyOneAllowed'),
      }));
      return;
    }
    const file = files[0];
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setFileErrors(prev => ({
        ...prev,
        [id]: GetTranslation('text.externallearning.file.invalidType'),
      }));
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFileErrors(prev => ({
        ...prev,
        [id]: GetTranslation('text.externallearning.file.tooLarge'),
      }));
      return;
    }
    setFileErrors(prev => ({ ...prev, [id]: '' }));
    setFileNames(prev => ({ ...prev, [id]: [file.name] }));
    setFieldValue(id, [file]);
    setIsUploading(true);
    try {
      await getUploadInfo();
      const url = await uploadFile(file.name, file);
      if (url) {
        setSubmissionUrl(url);
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        throw new Error('upload failed');
      }
    } catch {
      setFileErrors(prev => ({
        ...prev,
        [id]: GetTranslation('text.externallearning.file.uploadFailed'),
      }));
      setFileNames(prev => ({ ...prev, [id]: [] }));
      setFieldValue(id, null);
      setSubmissionUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const buildPayload = (): object => {
    const fields: any[] = [];

    form?.coreFields?.forEach((field: ExternalLearningField) => {
      if (!field.enabled || field.id === 'attachments') return;
      const rawValue = formValues[field.id];
      let value: any;
      if (field.id === 'date') {
        const dt = dateTypes[field.id] || 'startDate';
        // Only include the keys that were actually selected — omit the rest entirely
        // (start only → start_date; end only → end_date; both → both keys).
        const dateValue: Record<string, string> = {};
        if (dt === 'startDate' && rawValue?.startDate) {
          dateValue.start_date = `${rawValue.startDate.toString()}T00:00:00Z`;
        } else if (dt === 'endDate' && rawValue?.endDate) {
          dateValue.end_date = `${rawValue.endDate.toString()}T00:00:00Z`;
        } else if (dt === 'both') {
          if (rawValue?.range?.start)
            dateValue.start_date = `${rawValue.range.start.toString()}T00:00:00Z`;
          if (rawValue?.range?.end)
            dateValue.end_date = `${rawValue.range.end.toString()}T00:00:00Z`;
        }
        value = Object.keys(dateValue).length ? dateValue : null;
      } else if (field.id === 'score') {
        value = {
          achieved_score: rawValue?.achievedScore ? Number(rawValue.achievedScore) : null,
          max_score: rawValue?.maxScore ? Number(rawValue.maxScore) : null,
        };
      } else if (field.id === 'duration') {
        value = rawValue?.timeSpan
          ? {
              timeSpan: Number(rawValue.timeSpan),
              // API only accepts the uppercase enum (MINUTES/HOURS/DAYS/WEEKS/MONTHS/YEARS).
              period: (rawValue.period || DEFAULT_DURATION_PERIOD).toUpperCase(),
            }
          : null;
      } else {
        value = rawValue || null;
      }
      fields.push({ id: field.id, type: field.type, value });
    });

    form?.customFields?.forEach((field: ExternalLearningField) => {
      if (!field.enabled) return;
      const rawValue = formValues[field.id];
      fields.push({
        id: field.id,
        type: field.type,
        value: field.type === 'CHECKBOX' ? (rawValue ?? false) : rawValue || null,
      });
    });

    return { data: { type: 'externalLearning', attributes: { submissionUrl, fields } } };
  };

  const validateForm = (): boolean => {
    const REQUIRED_ERROR = GetTranslation('alm.feedback.text.required');
    const errors: Record<string, string> = {};

    const checkTimestamp = (fieldId: string, rawValue: any) => {
      const dt = dateTypes[fieldId] || 'startDate';
      const ok =
        (dt === 'startDate' && rawValue?.startDate) ||
        (dt === 'endDate' && rawValue?.endDate) ||
        (dt === 'both' && rawValue?.range?.start && rawValue?.range?.end);
      if (!ok) errors[fieldId] = REQUIRED_ERROR;
    };

    form?.coreFields?.forEach((field: ExternalLearningField) => {
      if (!field.enabled || !field.mandatory) return;
      const rawValue = formValues[field.id];
      if (field.id === 'date') checkTimestamp(field.id, rawValue);
      else if (field.id === 'score') {
        if (!rawValue?.achievedScore || !rawValue?.maxScore) errors[field.id] = REQUIRED_ERROR;
      } else if (field.id === 'duration') {
        if (!rawValue?.timeSpan) errors[field.id] = REQUIRED_ERROR;
      } else if (field.type === 'FILE_UPLOAD') {
        if (!submissionUrl) errors[field.id] = REQUIRED_ERROR;
      } else if (field.type === 'TEXT') {
        if (!rawValue || !String(rawValue).trim()) errors[field.id] = REQUIRED_ERROR;
      }
    });

    form?.customFields?.forEach((field: ExternalLearningField) => {
      if (!field.enabled || !field.mandatory) return;
      const rawValue = formValues[field.id];
      if (field.type === 'TEXT' || field.type === 'NUMBER') {
        if (!rawValue || !String(rawValue).trim()) errors[field.id] = REQUIRED_ERROR;
      } else if (field.type === 'CHECKBOX') {
        if (rawValue !== true) errors[field.id] = REQUIRED_ERROR;
      } else if (field.type === 'DROPDOWN') {
        if (!rawValue) errors[field.id] = REQUIRED_ERROR;
      } else if (field.type === 'TIMESTAMP') checkTimestamp(field.id, rawValue);
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    formValues,
    dateTypes,
    setDateTypes,
    fileNames,
    fileErrors,
    scoreError,
    setScoreError,
    submissionUrl,
    isUploading,
    fieldErrors,
    isSubmitting,
    setIsSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    showToastBackdrop,
    setShowToastBackdrop,
    setFieldValue,
    handleFiles,
    buildPayload,
    validateForm,
  };
};
