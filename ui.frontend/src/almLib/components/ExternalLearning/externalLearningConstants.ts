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
import { getALMConfig } from '../../utils/global';

export type ExternalLearningStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export const STATUS_CONFIG: Record<ExternalLearningStatus, { labelKey: string }> = {
  APPROVED: { labelKey: 'text.externallearning.status.approved' },
  REJECTED: { labelKey: 'text.externallearning.status.rejected' },
  PENDING: { labelKey: 'text.externallearning.status.pending' },
};

export const STATUS_STYLE_KEY: Record<ExternalLearningStatus, string> = {
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
  PENDING: 'statusPending',
};

export type DurationPeriod = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

// Dropdown options for the duration field. The `key` is the enum sent in the
// payload (`duration.period`); `labelKey` is the i18n key for the visible label.
// Keys are uppercase because the API only accepts the caps enum values.
export const DURATION_PERIODS: ReadonlyArray<{ key: DurationPeriod; labelKey: string }> = [
  { key: 'MINUTES', labelKey: 'text.externallearning.minutes' },
  { key: 'HOURS', labelKey: 'text.externallearning.hours' },
  { key: 'DAYS', labelKey: 'text.externallearning.days' },
  { key: 'WEEKS', labelKey: 'text.externallearning.weeks' },
  { key: 'MONTHS', labelKey: 'text.externallearning.months' },
  { key: 'YEARS', labelKey: 'text.externallearning.years' },
];

export const DEFAULT_DURATION_PERIOD: DurationPeriod = 'MINUTES';

export const getDurationPeriodLabelKey = (period: string): string =>
  DURATION_PERIODS.find(p => p.key === period)?.labelKey ||
  `text.externallearning.${DEFAULT_DURATION_PERIOD.toLowerCase()}`;

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Attachments the browser can render natively inside the preview modal.
// doc/docx are intentionally excluded — there is no native renderer for Word
// binaries, so they are download-only (no View action).
const PREVIEWABLE_IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i;
const PREVIEWABLE_PDF_EXT = /\.pdf$/i;

export const isImageAttachment = (fileName: string): boolean =>
  PREVIEWABLE_IMAGE_EXT.test(fileName);

export const isPdfAttachment = (fileName: string): boolean => PREVIEWABLE_PDF_EXT.test(fileName);

export const isPreviewableAttachment = (fileName: string): boolean =>
  isImageAttachment(fileName) || isPdfAttachment(fileName);

export const safeGetFileName = (url: string): string => {
  try {
    return new URL(url).pathname.split('/').pop() || '';
  } catch {
    return url.split('/').pop() || '';
  }
};

export const getLocalizedRecord = (record: Record<string, string>): string => {
  const locale = getALMConfig().locale || 'en-US';
  if (record[locale]) return record[locale];
  const normalized = locale.replace('-', '_');
  const denormalized = locale.replace('_', '-');
  return (
    record[normalized] ||
    record[denormalized] ||
    record['en_US'] ||
    record['en-US'] ||
    Object.values(record)[0] ||
    ''
  );
};
