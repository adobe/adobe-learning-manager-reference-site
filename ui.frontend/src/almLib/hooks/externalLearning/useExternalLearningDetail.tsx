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
import { useEffect, useState } from 'react';
import APIServiceInstance from '../../common/APIService';
import {
  fetchExternalLearningById,
  fetchExternalLearningSettings,
} from '../../utils/externalLearning';
import { GetTranslation } from '../../utils/translationService';
import { PrimeExternalLearningSubmission } from '../../models/PrimeModels';
import { getLocalizedRecord } from '../../components/ExternalLearning/externalLearningConstants';
import { ExternalLearningField, ExternalLearningSettings } from './useExternalLearningSettings';

export interface EnrichedField {
  id: string;
  label: string;
  description: string;
  rawValue: any;
  type: string;
  options?: Array<{ option_id: string; label: Record<string, string> }>;
}

const resolveLocaleString = (
  value: string | Record<string, string>,
  isDefault: boolean
): string => {
  if (!value) return '';
  if (isDefault) return GetTranslation(value as string, true);
  return getLocalizedRecord(value as Record<string, string>);
};

export const useExternalLearningDetail = (id: string) => {
  const [submission, setSubmission] = useState<PrimeExternalLearningSubmission | null>(null);
  const [enrichedFields, setEnrichedFields] = useState<EnrichedField[]>([]);
  const [settings, setSettings] = useState<ExternalLearningSettings | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const fetchAll = async () => {
      try {
        const [parsedSubmission, parsedSettings] = await Promise.all([
          fetchExternalLearningById(id),
          fetchExternalLearningSettings(),
        ]);

        const submissionData = parsedSubmission?.externalLearning || null;
        const settingsAttrs: ExternalLearningSettings | null =
          parsedSettings?.data?.attributes ?? null;

        // Kick off reviewer fetch immediately — independent of field enrichment
        const reviewerUserId = submissionData?.reviewerUserId?.id;
        const reviewerNamePromise = reviewerUserId
          ? APIServiceInstance.getUserById(reviewerUserId)
              .then(res => res?.user?.name || '')
              .catch(() => '')
          : Promise.resolve('');

        const allSettingsFields: ExternalLearningField[] = [
          ...(settingsAttrs?.coreFields || []),
          ...(settingsAttrs?.customFields || []),
        ];

        const submissionFields = submissionData?.fields || [];
        const enriched: EnrichedField[] = submissionFields.map(f => {
          const sf = allSettingsFields.find(s => s.id === f.id);
          return {
            id: f.id,
            label: sf ? resolveLocaleString(sf.label, sf.default) : f.id,
            description: sf ? resolveLocaleString(sf.description, sf.default) : '',
            rawValue: f.value,
            type: sf?.type || '',
            options: sf?.options,
          };
        });

        // Await reviewer name — runs in parallel with the sync enrichment above
        const resolvedReviewerName = await reviewerNamePromise;

        setSubmission(submissionData);
        setSettings(settingsAttrs);
        setEnrichedFields(enriched);
        setReviewerName(resolvedReviewerName);
        setErrorCode('');
      } catch (error: any) {
        setErrorCode(error?.status || 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  return { submission, enrichedFields, settings, reviewerName, isLoading, errorCode };
};
