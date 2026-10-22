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
import { parseDate } from '@internationalized/date';
import { Checkbox } from '@adobe/react-spectrum';
import { ToastQueue } from '@react-spectrum/toast';
import { modifyTimeDDMMYY } from '../../utils/dateTime';
import { GetTranslation } from '../../utils/translationService';
import { EnrichedField } from '../../hooks/externalLearning';
import { DateType } from '../../hooks/externalLearning/useExternalLearningForm';
import { DEFAULT_DURATION_PERIOD, getDurationPeriodLabelKey } from './externalLearningConstants';

export const isNullish = (v: any): boolean => v == null || v === 'null' || v === '';

export const isSafeUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

// Defensive parseDate wrapper — legacy submissions can carry malformed timestamps
// (missing T separator, non-ISO formats), and parseDate throws on those.
export const safeParseDate = (iso: string) => {
  try {
    return parseDate(iso.split('T')[0]);
  } catch {
    return null;
  }
};

export const getFieldLabel = (field: EnrichedField): string => {
  // The date core field is identified by id (its type is now JSON_OBJECT, was TIMESTAMP).
  if (field.type === 'TIMESTAMP' || field.id === 'date') {
    const { start_date, end_date } = field.rawValue || {};
    const hasStart = !isNullish(start_date);
    const hasEnd = !isNullish(end_date);
    if (hasStart && hasEnd) return field.label;
    if (hasStart) return GetTranslation('text.externallearning.startDate');
    if (hasEnd) return GetTranslation('text.externallearning.endDate');
    return field.label;
  }
  return field.label;
};

export const renderFieldValue = (field: EnrichedField, locale: string): React.ReactNode => {
  const { type, rawValue, id, options } = field;

  if (type === 'TIMESTAMP' || id === 'date') {
    const { start_date, end_date } = rawValue || {};
    const hasStart = !isNullish(start_date);
    const hasEnd = !isNullish(end_date);
    if (!hasStart && !hasEnd) return '-';
    const fmt = (d: string) => modifyTimeDDMMYY(d, locale);
    if (hasStart && hasEnd) return `${fmt(start_date)} - ${fmt(end_date)}`;
    return fmt(hasStart ? start_date : end_date);
  }

  if (id === 'score') {
    const achieved = rawValue?.achieved_score;
    const max = rawValue?.max_score;
    if (isNullish(achieved) || isNullish(max)) return '-';
    return `${achieved} ${GetTranslation('text.externallearning.outOf')} ${max}`;
  }

  if (id === 'duration') {
    const timeSpan = rawValue?.timeSpan;
    if (isNullish(timeSpan)) return '-';
    return `${timeSpan} ${GetTranslation(getDurationPeriodLabelKey(rawValue?.period))}`;
  }

  if (type === 'CHECKBOX') {
    const isChecked = rawValue === true || rawValue === 'true';
    return (
      <Checkbox isReadOnly isSelected={isChecked}>
        {field.description}
      </Checkbox>
    );
  }

  if (type === 'DROPDOWN') {
    if (!rawValue || !options) return rawValue || '-';
    const localeKey = locale.replace('-', '_');
    const option = options.find(o => o.option_id === rawValue);
    return option ? option.label[localeKey] || option.label['en_US'] || rawValue : rawValue || '-';
  }

  return rawValue != null && rawValue !== '' ? String(rawValue) : '-';
};

export const handleDownload = async (url: string, fileName: string) => {
  if (!isSafeUrl(url)) {
    ToastQueue.negative(GetTranslation('alm.text.externalLearning.downloadError'), {
      timeout: 3000,
    });
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    ToastQueue.negative(GetTranslation('alm.text.externalLearning.downloadError'), {
      timeout: 3000,
    });
  }
};

export const buildInitialFormState = (
  enrichedFields: EnrichedField[]
): { formValues: Record<string, any>; dateTypes: Record<string, DateType> } => {
  const formValues: Record<string, any> = {};
  const dateTypes: Record<string, DateType> = {};

  for (const f of enrichedFields) {
    const val = f.rawValue;
    if (val == null) continue;

    if (f.type === 'TIMESTAMP' || f.id === 'date') {
      const sd = val.start_date;
      const ed = val.end_date;
      const startDate = !isNullish(sd) ? safeParseDate(sd) : null;
      const endDate = !isNullish(ed) ? safeParseDate(ed) : null;
      if (startDate && endDate) {
        dateTypes[f.id] = 'both';
        formValues[f.id] = { range: { start: startDate, end: endDate } };
      } else if (startDate) {
        dateTypes[f.id] = 'startDate';
        formValues[f.id] = { startDate };
      } else if (endDate) {
        dateTypes[f.id] = 'endDate';
        formValues[f.id] = { endDate };
      }
    } else if (f.id === 'score') {
      formValues[f.id] = {
        achievedScore: isNullish(val.achieved_score) ? '' : String(val.achieved_score),
        maxScore: isNullish(val.max_score) ? '' : String(val.max_score),
      };
    } else if (f.id === 'duration') {
      formValues[f.id] = {
        timeSpan: isNullish(val.timeSpan) ? '' : String(val.timeSpan),
        period: val.period || DEFAULT_DURATION_PERIOD,
      };
    } else {
      formValues[f.id] = val;
    }
  }

  return { formValues, dateTypes };
};
