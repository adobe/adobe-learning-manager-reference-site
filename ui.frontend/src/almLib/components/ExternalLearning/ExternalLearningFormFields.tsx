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
import {
  Checkbox,
  DatePicker,
  DateRangePicker,
  Item,
  Picker,
  Radio,
  RadioGroup,
  TextField,
} from '@adobe/react-spectrum';
import { Button as AriaButton, DropZone, FileTrigger } from 'react-aria-components';
import { CalendarDate } from '@internationalized/date';
import { DateValue } from '@react-types/datepicker';
import { RangeValue } from '@react-types/shared';
import {
  FILE_UPLOAD_ICON,
  FILE_UPLOAD_LOADING_ICON,
  FILE_UPLOADED_IMAGE_ICON,
  FILE_UPLOADED_PDF_ICON,
  FILE_UPLOADED_DOC_ICON,
  FILE_UPLOAD_GENERIC_FILE_TYPE_ICON,
} from '../../utils/inline_svg';
import { GetTranslation, GetTranslationsReplaced } from '../../utils/translationService';
import { getALMConfig } from '../../utils/global';
import { modifyTimeDDMMYY } from '../../utils/dateTime';
import {
  ExternalLearningField,
  ExternalLearningSettings,
} from '../../hooks/externalLearning/useExternalLearningSettings';
import { ExternalLearningFormState } from '../../hooks/externalLearning/useExternalLearningForm';
import {
  ACCEPTED_FILE_TYPES,
  DEFAULT_DURATION_PERIOD,
  DURATION_PERIODS,
  getLocalizedRecord,
  safeGetFileName,
} from './externalLearningConstants';
import styles from './PrimeExternalLearningAddForm.module.css';

// Lower bound for the start date — users may back-date external learning to 1 Jan 1900.
// There is no upper bound.
const MIN_START_DATE = new CalendarDate(1900, 1, 1);

// react-spectrum's built-in DatePicker/DateRangePicker min-date validation message always
// renders in the browser's UI language (navigator.language), ignoring our Provider's locale
// (see @react-stately/datepicker's getLocale()). Supplying our own `validate` takes priority
// over that built-in message, so we can render it in the account's locale instead.
const getMinDateError = () => {
  const locale = (getALMConfig().locale || 'en-US').replace('_', '-');
  const minDate = modifyTimeDDMMYY(MIN_START_DATE.toString(), locale);
  return GetTranslationsReplaced('text.externallearning.date.minDateError', { minDate });
};

const validateMinDate = (value: DateValue | null) =>
  value && value.compare(MIN_START_DATE) < 0 ? getMinDateError() : null;

const validateDateRange = (value: RangeValue<DateValue> | null) => {
  if (!value) {
    return null;
  }
  if (
    (value.start && value.start.compare(MIN_START_DATE) < 0) ||
    (value.end && value.end.compare(MIN_START_DATE) < 0)
  ) {
    return getMinDateError();
  }
  if (value.start && value.end && value.end.compare(value.start) < 0) {
    return GetTranslation('text.externallearning.date.rangeReversedError');
  }
  return null;
};

const getUploadedFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return FILE_UPLOADED_PDF_ICON();
    case 'doc':
    case 'docx':
      return FILE_UPLOADED_DOC_ICON();
    case 'jpg':
    case 'jpeg':
    case 'png':
      return FILE_UPLOADED_IMAGE_ICON();
    default:
      return FILE_UPLOAD_GENERIC_FILE_TYPE_ICON();
  }
};

const getLabel = (label: string | Record<string, string>): string => {
  if (typeof label === 'string') return GetTranslation(label);
  return getLocalizedRecord(label);
};

const getCustomFieldValue = (value: string | Record<string, string>): string => {
  if (typeof value === 'string') return value;
  return getLocalizedRecord(value);
};

interface Props {
  form: ExternalLearningSettings;
  state: ExternalLearningFormState;
}

const ExternalLearningFormFields = ({ form, state }: Props) => {
  const {
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
    setFieldValue,
    handleFiles,
  } = state;

  const renderError = (message: string) => <p className={styles.errorText}>{message}</p>;

  const renderField = (field: ExternalLearningField) => {
    const label = getLabel(field.label);
    const dateType = dateTypes[field.id] || 'startDate';
    const labelClass = `${styles.fieldLabel}${field.mandatory ? ` ${styles.fieldLabelRequired}` : ''}`;

    if ((field.id === 'title' || field.id === 'description_notes') && field.type === 'TEXT') {
      const descKey =
        field.id === 'title'
          ? 'text.externallearning.title.desc'
          : 'text.externallearning.description.notes.desc';
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <TextField
            label={<span className={labelClass}>{label}</span>}
            labelPosition="top"
            placeholder={GetTranslation(descKey)}
            value={formValues[field.id] || ''}
            onChange={val => setFieldValue(field.id, val)}
            maxLength={2048}
            width="100%"
            UNSAFE_className={styles.fieldInput}
            validationState={fieldErrors[field.id] ? 'invalid' : undefined}
          />
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
        </div>
      );
    }

    if (field.id === 'score') {
      const validateScore = (achieved: string, max: string) => {
        if (achieved && max && Number(achieved) > Number(max)) {
          setScoreError(GetTranslation('text.externallearning.score.exceeded'));
        } else {
          setScoreError('');
        }
      };
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <span className={labelClass}>{label}</span>
          <div className={styles.scoreRow}>
            <TextField
              aria-label={label}
              inputMode="text"
              value={formValues[field.id]?.achievedScore || ''}
              onChange={val => {
                if (val === '' || /^-?\d*$/.test(val)) {
                  const updated = { ...formValues[field.id], achievedScore: val };
                  setFieldValue(field.id, updated);
                  validateScore(val, updated.maxScore || '');
                }
              }}
              UNSAFE_className={styles.scoreInput}
              validationState={fieldErrors[field.id] ? 'invalid' : undefined}
            />
            <span className={styles.scoreText}>
              {GetTranslation('text.externallearning.outOf')}
            </span>
            <TextField
              aria-label={`${label} max`}
              inputMode="numeric"
              value={formValues[field.id]?.maxScore || ''}
              onChange={val => {
                if (val === '' || /^\d*$/.test(val)) {
                  const updated = { ...formValues[field.id], maxScore: val };
                  setFieldValue(field.id, updated);
                  validateScore(updated.achievedScore || '', val);
                }
              }}
              UNSAFE_className={styles.scoreInput}
              validationState={fieldErrors[field.id] ? 'invalid' : undefined}
            />
            <span className={styles.scoreText}>
              {GetTranslation('text.externallearning.marks')}
            </span>
          </div>
          {scoreError && renderError(scoreError)}
          {!scoreError && fieldErrors[field.id] && renderError(fieldErrors[field.id])}
          <p className={styles.fieldDescription}>
            {GetTranslation('text.externallearning.score.desc')}
          </p>
        </div>
      );
    }

    if (field.id === 'date') {
      return (
        <div key={field.id} className={styles.timestampContainer}>
          <span className={labelClass}>{label}</span>
          <RadioGroup
            aria-label={label}
            value={dateType}
            onChange={val => {
              setDateTypes(prev => ({ ...prev, [field.id]: val as any }));
              setFieldValue(field.id, undefined);
            }}
          >
            <Radio value="startDate">{GetTranslation('text.externallearning.startDate')}</Radio>
            <Radio value="endDate">{GetTranslation('text.externallearning.endDate')}</Radio>
            <Radio value="both">{GetTranslation('text.externallearning.bothStartEndDate')}</Radio>
          </RadioGroup>
          {(dateType === 'startDate' || dateType === 'endDate') && (
            <DatePicker
              aria-label={
                dateType === 'startDate'
                  ? GetTranslation('text.externallearning.startDate')
                  : GetTranslation('text.externallearning.endDate')
              }
              value={formValues[field.id]?.[dateType] ?? null}
              onChange={val =>
                setFieldValue(field.id, { ...formValues[field.id], [dateType]: val })
              }
              minValue={dateType === 'startDate' ? MIN_START_DATE : undefined}
              validate={dateType === 'startDate' ? validateMinDate : undefined}
              UNSAFE_className={styles.datePicker}
            />
          )}
          {dateType === 'both' && (
            <DateRangePicker
              aria-label="Date Range"
              value={formValues[field.id]?.range ?? null}
              onChange={val => setFieldValue(field.id, { range: val })}
              minValue={MIN_START_DATE}
              validate={validateDateRange}
              UNSAFE_className={styles.dateRangePicker}
            />
          )}
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
          <p className={styles.dateFieldDescription}>
            {GetTranslation('text.externallearning.date.desc')}
          </p>
        </div>
      );
    }

    if (field.id === 'duration') {
      return (
        <div key={field.id} className={styles.durationContainer}>
          <span className={labelClass}>{label}</span>
          <div className={styles.durationInputRow}>
            <TextField
              aria-label={label}
              inputMode="numeric"
              value={formValues[field.id]?.timeSpan || ''}
              onChange={val => {
                if (val === '' || /^\d*$/.test(val))
                  setFieldValue(field.id, { ...formValues[field.id], timeSpan: val });
              }}
              UNSAFE_className={styles.durationValueInput}
              validationState={fieldErrors[field.id] ? 'invalid' : undefined}
            />
            <Picker
              aria-label={GetTranslation('text.externallearning.duration')}
              selectedKey={formValues[field.id]?.period || DEFAULT_DURATION_PERIOD}
              onSelectionChange={key =>
                setFieldValue(field.id, { ...formValues[field.id], period: key })
              }
              UNSAFE_className={styles.durationPicker}
            >
              {DURATION_PERIODS.map(p => (
                <Item key={p.key}>{GetTranslation(p.labelKey)}</Item>
              ))}
            </Picker>
          </div>
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
          <p className={styles.fieldDescription}>
            {GetTranslation('text.externallearning.duration.desc')}
          </p>
        </div>
      );
    }

    if (field.id === 'attachments' && field.type === 'FILE_UPLOAD') {
      const uploadedFileName =
        fileNames[field.id]?.[0] ||
        (!isUploading && submissionUrl ? safeGetFileName(submissionUrl) : '');
      const isUploaded = !isUploading && !!uploadedFileName;

      return (
        <div key={field.id} className={styles.fieldContainer}>
          <span className={labelClass}>{label}</span>
          <DropZone
            className={({ isDropTarget }) =>
              `${styles.fileUploadZone}${isDropTarget ? ` ${styles.fileUploadDragOver}` : ''}${fieldErrors[field.id] ? ` ${styles.fileUploadZoneError}` : ''}`
            }
            onDrop={async e => {
              const items = e.items.filter(item => item.kind === 'file');
              const files = await Promise.all(items.map((item: any) => item.getFile()));
              await handleFiles(field.id, files);
            }}
          >
            {isUploading ? (
              <>
                <div className={styles.loadingIconWrapper}>{FILE_UPLOAD_LOADING_ICON()}</div>
                {fileNames[field.id]?.[0] && (
                  <p className={styles.fileName}>{fileNames[field.id]?.[0]}</p>
                )}
                <AriaButton className={styles.uploadingButton} isDisabled>
                  {GetTranslation('text.externallearning.file.uploading')}
                </AriaButton>
              </>
            ) : isUploaded ? (
              <>
                {getUploadedFileIcon(uploadedFileName)}
                <p className={styles.fileName}>{uploadedFileName}</p>
                <FileTrigger
                  acceptedFileTypes={ACCEPTED_FILE_TYPES}
                  onSelect={async fileList => {
                    if (fileList) await handleFiles(field.id, Array.from(fileList));
                  }}
                >
                  <AriaButton className={styles.browseFilesButton}>
                    {GetTranslation('text.externallearning.replaceFile')}
                  </AriaButton>
                </FileTrigger>
              </>
            ) : (
              <>
                {FILE_UPLOAD_ICON()}
                <p className={styles.fileUploadText}>
                  {GetTranslation('text.externallearning.dragDropFile')}
                </p>
                <div className={styles.fileUploadTextBlock}>
                  <p className={styles.fileUploadOrText}>
                    {GetTranslation('text.externallearning.orSelectFile')}
                  </p>
                </div>
                <FileTrigger
                  acceptedFileTypes={ACCEPTED_FILE_TYPES}
                  onSelect={async fileList => {
                    if (fileList) await handleFiles(field.id, Array.from(fileList));
                  }}
                >
                  <AriaButton className={styles.browseFilesButton}>
                    {GetTranslation('text.externallearning.browseFiles')}
                  </AriaButton>
                </FileTrigger>
              </>
            )}
            <p className={styles.fileUploadFormats}>
              {GetTranslation('text.externallearning.supportedFormats')}
            </p>
          </DropZone>
          {(fileErrors[field.id] || fieldErrors[field.id]) &&
            renderError(fileErrors[field.id] || fieldErrors[field.id])}
        </div>
      );
    }

    return null;
  };

  const renderCustomField = (field: ExternalLearningField) => {
    const label = getCustomFieldValue(field.label);
    const description = field.description ? getCustomFieldValue(field.description) : '';
    const labelClass = `${styles.fieldLabel}${field.mandatory ? ` ${styles.fieldLabelRequired}` : ''}`;

    if (field.type === 'TEXT') {
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <TextField
            label={<span className={labelClass}>{label}</span>}
            labelPosition="top"
            placeholder={description || undefined}
            value={formValues[field.id] || ''}
            onChange={val => setFieldValue(field.id, val)}
            width="100%"
            UNSAFE_className={styles.fieldInput}
            validationState={fieldErrors[field.id] ? 'invalid' : undefined}
          />
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
        </div>
      );
    }

    if (field.type === 'NUMBER') {
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <TextField
            label={<span className={labelClass}>{label}</span>}
            labelPosition="top"
            inputMode="numeric"
            placeholder={description || undefined}
            value={formValues[field.id] || ''}
            onChange={val => {
              if (val === '' || /^\d*$/.test(val)) setFieldValue(field.id, val);
            }}
            width="100%"
            UNSAFE_className={styles.fieldInput}
            validationState={fieldErrors[field.id] ? 'invalid' : undefined}
          />
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
        </div>
      );
    }

    if (field.type === 'CHECKBOX') {
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <span className={labelClass}>{label}</span>
          <Checkbox
            isSelected={formValues[field.id] || false}
            onChange={val => setFieldValue(field.id, val)}
          >
            {description}
          </Checkbox>
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
        </div>
      );
    }

    if (field.type === 'DROPDOWN' && field.options?.length) {
      return (
        <div key={field.id} className={styles.fieldContainer}>
          <span className={labelClass}>{label}</span>
          <Picker
            aria-label={label}
            selectedKey={formValues[field.id] ?? null}
            onSelectionChange={key => setFieldValue(field.id, key)}
            width="100%"
            UNSAFE_className={`${styles.fieldInput} ${styles.customFieldDropdown}`}
            isInvalid={!!fieldErrors[field.id]}
          >
            {field.options.map(opt => (
              <Item key={opt.option_id}>{getLocalizedRecord(opt.label)}</Item>
            ))}
          </Picker>
          {description && <p className={styles.fieldDescription}>{description}</p>}
          {fieldErrors[field.id] && renderError(fieldErrors[field.id])}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.fieldsColumn}>
        {form.coreFields.filter(f => f.enabled && f.id !== 'attachments').map(renderField)}
        {form.customFields?.filter(f => f.enabled).map(renderCustomField)}
      </div>
      <div className={styles.attachmentsColumn}>
        {form.coreFields.filter(f => f.enabled && f.id === 'attachments').map(renderField)}
      </div>
    </div>
  );
};

export default ExternalLearningFormFields;
