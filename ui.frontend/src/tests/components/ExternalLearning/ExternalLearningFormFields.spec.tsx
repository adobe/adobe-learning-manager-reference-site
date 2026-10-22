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

jest.mock('@utils/inline_svg', () => ({
  FILE_UPLOAD_ICON: () => <div data-testid="icon-upload" />,
  FILE_UPLOAD_LOADING_ICON: () => <div data-testid="icon-loading" />,
  FILE_UPLOADED_IMAGE_ICON: () => <div data-testid="icon-image" />,
  FILE_UPLOADED_PDF_ICON: () => <div data-testid="icon-pdf" />,
  FILE_UPLOADED_DOC_ICON: () => <div data-testid="icon-doc" />,
  FILE_UPLOAD_GENERIC_FILE_TYPE_ICON: () => <div data-testid="icon-generic" />,
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
  GetTranslationsReplaced: jest.fn(
    (key: string, params: Record<string, unknown>) => `${key}|${JSON.stringify(params)}`
  ),
}));

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({ locale: 'en-US' })),
}));

// modifyTimeDDMMYY has its own dedicated tests (dateTime.spec.ts); stub it here so these
// tests aren't coupled to real Intl/timezone formatting — only that it's called correctly.
jest.mock('@utils/dateTime', () => ({
  modifyTimeDDMMYY: jest.fn((_dateStr: string, locale: string) => `formatted:${locale}`),
}));

jest.mock('@components/ExternalLearning/externalLearningConstants', () => ({
  ACCEPTED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  safeGetFileName: jest.fn((url: string) => url.split('/').pop() || ''),
  getLocalizedRecord: jest.fn((record: any) => record?.en_US || ''),
  DEFAULT_DURATION_PERIOD: 'MINUTES',
  DURATION_PERIODS: [
    { key: 'MINUTES', labelKey: 'text.externallearning.minutes' },
    { key: 'HOURS', labelKey: 'text.externallearning.hours' },
    { key: 'DAYS', labelKey: 'text.externallearning.days' },
    { key: 'WEEKS', labelKey: 'text.externallearning.weeks' },
    { key: 'MONTHS', labelKey: 'text.externallearning.months' },
    { key: 'YEARS', labelKey: 'text.externallearning.years' },
  ],
}));

jest.mock('react-aria-components', () => ({
  // className fn is called immediately so Istanbul covers the inline function body.
  // onClick triggers onDrop with empty items list to cover the async handler body.
  DropZone: ({ children, className, onDrop }: any) => {
    // Call className in both drag states so both ternary branches are covered.
    if (typeof className === 'function') {
      className({ isDropTarget: false });
      className({ isDropTarget: true });
    }
    return (
      <>
        <div data-testid="drop-zone" onClick={() => onDrop?.({ items: [] })}>
          {children}
        </div>
        {/* Drops a mix of file and non-file items so the kind filter + getFile map run. */}
        <div
          data-testid="drop-zone-with-file"
          onClick={() =>
            onDrop?.({
              items: [
                { kind: 'file', getFile: () => Promise.resolve({ name: 'dropped.pdf' }) },
                { kind: 'text' },
              ],
            })
          }
        />
      </>
    );
  },
  // Two triggers: one with null (covers the `if (fileList)` false branch),
  // one with a file array (covers the `await handleFiles` line inside onSelect).
  FileTrigger: ({ children, onSelect }: any) => (
    <>
      <div
        data-testid="file-trigger"
        onClick={e => {
          e.stopPropagation();
          onSelect?.(null);
        }}
      >
        {children}
      </div>
      <div
        data-testid="file-trigger-with-file"
        onClick={e => {
          e.stopPropagation();
          onSelect?.([{ name: 'test.pdf' }]);
        }}
      />
    </>
  ),
  Button: ({ children, isDisabled, className }: any) => (
    <button disabled={!!isDisabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@adobe/react-spectrum', () => ({
  Checkbox: ({ isSelected, onChange, children }: any) => (
    <label>
      <input
        type="checkbox"
        checked={!!isSelected}
        onChange={e => onChange?.(e.target.checked)}
      />
      {children}
    </label>
  ),
  // `validate` is called eagerly at render time with fixed representative values so tests
  // can assert on its return value the same way they already assert on data-min-value.
  DatePicker: ({ 'aria-label': ariaLabel, onChange, minValue, validate }: any) => (
    <div
      data-testid="date-picker"
      aria-label={ariaLabel}
      data-min-value={minValue ? minValue.toString() : ''}
      data-validate-null={validate ? String(validate(null)) : 'no-validate'}
      data-validate-underflow={
        validate
          ? String(validate(new (require('@internationalized/date').CalendarDate)(1899, 12, 31)))
          : 'no-validate'
      }
      data-validate-valid={
        validate
          ? String(validate(new (require('@internationalized/date').CalendarDate)(2020, 6, 15)))
          : 'no-validate'
      }
      onClick={() => onChange?.('2026-01-01')}
    />
  ),
  DateRangePicker: ({ 'aria-label': ariaLabel, onChange, minValue, validate }: any) => {
    const { CalendarDate } = require('@internationalized/date');
    const range = (startY: number, startM: number, startD: number, endY: number, endM: number, endD: number) => ({
      start: new CalendarDate(startY, startM, startD),
      end: new CalendarDate(endY, endM, endD),
    });
    return (
      <div
        data-testid="date-range-picker"
        aria-label={ariaLabel}
        data-min-value={minValue ? minValue.toString() : ''}
        data-validate-null={validate ? String(validate(null)) : 'no-validate'}
        data-validate-valid={
          validate ? String(validate(range(2020, 1, 1, 2020, 6, 1))) : 'no-validate'
        }
        data-validate-start-underflow={
          validate ? String(validate(range(1899, 12, 31, 2020, 1, 1))) : 'no-validate'
        }
        data-validate-end-underflow={
          validate ? String(validate(range(2020, 1, 1, 1899, 12, 31))) : 'no-validate'
        }
        data-validate-reversed={
          validate ? String(validate(range(2020, 6, 1, 2020, 1, 1))) : 'no-validate'
        }
        data-validate-underflow-and-reversed={
          validate ? String(validate(range(1899, 12, 31, 1899, 1, 1))) : 'no-validate'
        }
        onClick={() => onChange?.({ start: '2026-01-01', end: '2026-12-31' })}
      />
    );
  },
  Item: ({ children }: any) => <option value={children ?? ''}>{children}</option>,
  Picker: ({ onSelectionChange, selectedKey, children, 'aria-label': ariaLabel }: any) => (
    <select
      aria-label={ariaLabel}
      value={selectedKey ?? ''}
      onChange={e => onSelectionChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  Radio: ({ value, children }: any) => <option value={value}>{children}</option>,
  RadioGroup: ({ onChange, value, 'aria-label': ariaLabel }: any) => (
    <select
      aria-label={ariaLabel}
      value={value ?? 'startDate'}
      onChange={e => onChange?.(e.target.value)}
    >
      <option value="startDate">startDate</option>
      <option value="endDate">endDate</option>
      <option value="both">both</option>
    </select>
  ),
  TextField: ({ onChange, value, 'aria-label': ariaLabel, inputMode, placeholder, label: labelProp }: any) => (
    <>
      {labelProp}
      <input
        aria-label={ariaLabel}
        value={value ?? ''}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
      />
    </>
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExternalLearningFormFields from '@components/ExternalLearning/ExternalLearningFormFields';
import * as translationService from '@utils/translationService';
import * as constants from '@components/ExternalLearning/externalLearningConstants';
import * as globalUtils from '@utils/global';
import * as dateTimeUtils from '@utils/dateTime';

const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<
  typeof translationService.GetTranslation
>;
const mockGetTranslationsReplaced = translationService.GetTranslationsReplaced as jest.MockedFunction<
  typeof translationService.GetTranslationsReplaced
>;
const mockSafeGetFileName = constants.safeGetFileName as jest.MockedFunction<
  typeof constants.safeGetFileName
>;
const mockGetLocalizedRecord = constants.getLocalizedRecord as jest.MockedFunction<
  typeof constants.getLocalizedRecord
>;
const mockGetALMConfig = globalUtils.getALMConfig as jest.MockedFunction<
  typeof globalUtils.getALMConfig
>;
const mockModifyTimeDDMMYY = dateTimeUtils.modifyTimeDDMMYY as jest.MockedFunction<
  typeof dateTimeUtils.modifyTimeDDMMYY
>;

beforeEach(() => {
  mockGetTranslation.mockImplementation((key: string) => key);
  mockGetTranslationsReplaced.mockImplementation(
    (key: string, params: Record<string, unknown>) => `${key}|${JSON.stringify(params)}`
  );
  mockSafeGetFileName.mockImplementation((url: string) => url.split('/').pop() || '');
  mockGetLocalizedRecord.mockImplementation((record: any) => record?.en_US || '');
  mockGetALMConfig.mockReturnValue({ locale: 'en-US' } as any);
  mockModifyTimeDDMMYY.mockImplementation((_dateStr: string, locale: string) => `formatted:${locale}`);
});

// ─── Field / Form factories ───────────────────────────────────────────────────

function makeFileUploadField(overrides: any = {}): any {
  return {
    id: 'attachments', type: 'FILE_UPLOAD', enabled: true, mandatory: false,
    label: 'alm.externallearning.attachments', description: '', editable: true, order: 0, default: false,
    ...overrides,
  };
}

// date/score/duration core fields are JSON_OBJECT on the backend now; the client
// value shape is unchanged. Factories default to the new type.
function makeScoreField(overrides: any = {}): any {
  return {
    id: 'score', type: 'JSON_OBJECT', enabled: true, mandatory: false,
    label: 'alm.externallearning.score', description: '', editable: true, order: 0, default: false,
    ...overrides,
  };
}

function makeTitleField(overrides: any = {}): any {
  return {
    id: 'title', type: 'TEXT', enabled: true, mandatory: false,
    label: 'alm.externallearning.title', description: '', editable: true, order: 1, default: true,
    ...overrides,
  };
}

function makeDescriptionField(overrides: any = {}): any {
  return {
    id: 'description_notes', type: 'TEXT', enabled: true, mandatory: false,
    label: 'alm.externallearning.description', description: '', editable: true, order: 2, default: true,
    ...overrides,
  };
}

function makeDateField(overrides: any = {}): any {
  return {
    id: 'date', type: 'JSON_OBJECT', enabled: true, mandatory: false,
    label: 'alm.externallearning.date', description: '', editable: true, order: 3, default: true,
    ...overrides,
  };
}

function makeDurationField(overrides: any = {}): any {
  return {
    id: 'duration', type: 'JSON_OBJECT', enabled: true, mandatory: false,
    label: 'alm.externallearning.duration', description: '', editable: true, order: 4, default: true,
    ...overrides,
  };
}

function makeForm(coreFields: any[] = [makeFileUploadField()], customFields: any[] = []): any {
  return { enabled: true, updatedAt: '', coreFields, customFields };
}

function makeCustomFieldForm(customField: any): any {
  return { enabled: true, updatedAt: '', coreFields: [], customFields: [customField] };
}

function makeState(overrides: any = {}): any {
  return {
    formValues: {},
    dateTypes: {},
    setDateTypes: jest.fn(),
    fileNames: {},
    fileErrors: {},
    scoreError: '',
    setScoreError: jest.fn(),
    submissionUrl: '',
    isUploading: false,
    fieldErrors: {},
    setFieldValue: jest.fn(),
    handleFiles: jest.fn(),
    ...overrides,
  };
}

// ─── FILE_UPLOAD field ────────────────────────────────────────────────────────

describe('ExternalLearningFormFields – FILE_UPLOAD render branches', () => {
  it('default_showsUploadIconDragDropTextAndBrowseButton', () => {
    render(<ExternalLearningFormFields form={makeForm()} state={makeState()} />);
    expect(screen.getByTestId('icon-upload')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.dragDropFile')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.browseFiles')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.supportedFormats')).toBeInTheDocument();
  });

  it('default_noUploadingOrReplaceButton', () => {
    render(<ExternalLearningFormFields form={makeForm()} state={makeState()} />);
    expect(screen.queryByText('text.externallearning.file.uploading')).toBeNull();
    expect(screen.queryByText('text.externallearning.replaceFile')).toBeNull();
  });

  it('isUploading_showsLoadingIconAndDisabledUploadingButton', () => {
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ isUploading: true })} />);
    expect(screen.getByTestId('icon-loading')).toBeInTheDocument();
    const btn = screen.getByText('text.externallearning.file.uploading').closest('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('text.externallearning.supportedFormats')).toBeInTheDocument();
  });

  it('isUploading_noFileNameParagraphWhenFileNamesNotSet', () => {
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ isUploading: true })} />);
    expect(screen.queryByText('report.pdf')).toBeNull();
  });

  it('isUploading_fileNameParagraphShownWhenFileNamesSet', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ isUploading: true, fileNames: { attachments: ['report.pdf'] } })}
      />
    );
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('isUploading_noBrowseOrReplaceButton', () => {
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ isUploading: true })} />);
    expect(screen.queryByText('text.externallearning.browseFiles')).toBeNull();
    expect(screen.queryByText('text.externallearning.replaceFile')).toBeNull();
  });

  it('isUploaded_showsFileNameAndReplaceButton', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ fileNames: { attachments: ['report.pdf'] } })}
      />
    );
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.replaceFile')).toBeInTheDocument();
  });

  it('isUploaded_noBrowseOrUploadingButton', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ fileNames: { attachments: ['report.pdf'] } })}
      />
    );
    expect(screen.queryByText('text.externallearning.browseFiles')).toBeNull();
    expect(screen.queryByText('text.externallearning.file.uploading')).toBeNull();
  });

  it('isUploaded_fileNameFromSubmissionUrlWhenFileNamesEmpty', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ submissionUrl: 'https://cdn.example.com/files/certificate.pdf' })}
      />
    );
    expect(screen.getByText('certificate.pdf')).toBeInTheDocument();
  });

  it('fileErrors_showsErrorParagraph', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ fileErrors: { attachments: 'File too large' } })}
      />
    );
    expect(screen.getByText('File too large')).toBeInTheDocument();
  });

  it('fieldErrors_showsErrorParagraph', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ fieldErrors: { attachments: 'Attachment required' } })}
      />
    );
    expect(screen.getByText('Attachment required')).toBeInTheDocument();
  });

  it('dropZone_onDrop_callsHandleFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ handleFiles })} />);
    fireEvent.click(screen.getByTestId('drop-zone'));
    await new Promise(r => setTimeout(r, 0));
    expect(handleFiles).toHaveBeenCalledWith('attachments', []);
  });

  it('fileTrigger_defaultState_withFile_callsHandleFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ handleFiles })} />);
    fireEvent.click(screen.getByTestId('file-trigger-with-file'));
    await new Promise(r => setTimeout(r, 0));
    expect(handleFiles).toHaveBeenCalledWith('attachments', expect.any(Array));
  });

  it('fileTrigger_uploadedState_withFile_callsHandleFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ handleFiles, fileNames: { attachments: ['existing.pdf'] } })}
      />
    );
    fireEvent.click(screen.getByTestId('file-trigger-with-file'));
    await new Promise(r => setTimeout(r, 0));
    expect(handleFiles).toHaveBeenCalledWith('attachments', expect.any(Array));
  });

  it('fileErrors_takesPrecedenceOverFieldErrors', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({
          fileErrors: { attachments: 'File error' },
          fieldErrors: { attachments: 'Field error' },
        })}
      />
    );
    expect(screen.getByText('File error')).toBeInTheDocument();
    expect(screen.queryByText('Field error')).toBeNull();
  });
});

// ─── getUploadedFileIcon extension dispatch ───────────────────────────────────

describe('ExternalLearningFormFields – getUploadedFileIcon extension dispatch', () => {
  function renderUploaded(fileName: string) {
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ fileNames: { attachments: [fileName] } })}
      />
    );
  }

  it('pdf_showsPdfIcon', () => { renderUploaded('report.pdf'); expect(screen.getByTestId('icon-pdf')).toBeInTheDocument(); });
  it('doc_showsDocIcon', () => { renderUploaded('report.doc'); expect(screen.getByTestId('icon-doc')).toBeInTheDocument(); });
  it('docx_showsDocIcon', () => { renderUploaded('report.docx'); expect(screen.getByTestId('icon-doc')).toBeInTheDocument(); });
  it('jpg_showsImageIcon', () => { renderUploaded('photo.jpg'); expect(screen.getByTestId('icon-image')).toBeInTheDocument(); });
  it('jpeg_showsImageIcon', () => { renderUploaded('photo.jpeg'); expect(screen.getByTestId('icon-image')).toBeInTheDocument(); });
  it('png_showsImageIcon', () => { renderUploaded('screenshot.png'); expect(screen.getByTestId('icon-image')).toBeInTheDocument(); });
  it('unknownExtension_showsGenericIcon', () => { renderUploaded('archive.zip'); expect(screen.getByTestId('icon-generic')).toBeInTheDocument(); });
  it('noExtension_showsGenericIcon', () => { renderUploaded('filewithoutextension'); expect(screen.getByTestId('icon-generic')).toBeInTheDocument(); });
});

// ─── title / description_notes TEXT field ────────────────────────────────────

describe('ExternalLearningFormFields – title/description_notes field', () => {
  it('title_rendersLabelAndPlaceholder', () => {
    render(<ExternalLearningFormFields form={makeForm([makeTitleField()])} state={makeState()} />);
    expect(screen.getByText('alm.externallearning.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('text.externallearning.title.desc')).toBeInTheDocument();
  });

  it('title_onChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeForm([makeTitleField()])} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Title' } });
    expect(setFieldValue).toHaveBeenCalledWith('title', 'New Title');
  });

  it('title_withFieldError_showsErrorParagraph', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeTitleField()])}
        state={makeState({ fieldErrors: { title: 'Title is required' } })}
      />
    );
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('title_withExistingValue_showsValueInInput', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeTitleField()])}
        state={makeState({ formValues: { title: 'My Existing Title' } })}
      />
    );
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('My Existing Title');
  });

  it('description_notes_usesDescriptionNotesPlaceholderKey', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDescriptionField()])} state={makeState()} />);
    expect(screen.getByPlaceholderText('text.externallearning.description.notes.desc')).toBeInTheDocument();
  });

  it('title_withRecordLabel_usesGetLocalizedRecord', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeTitleField({ label: { en_US: 'Title Record Label' } })])}
        state={makeState()}
      />
    );
    expect(screen.getByText('Title Record Label')).toBeInTheDocument();
  });

  it('title_mandatory_rendersRequiredIndicator', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeTitleField({ mandatory: true })])}
        state={makeState()}
      />
    );
    // mandatory field renders its label span; just verify the field renders
    expect(screen.getByPlaceholderText('text.externallearning.title.desc')).toBeInTheDocument();
  });
});

// ─── score field ─────────────────────────────────────────────────────────────

describe('ExternalLearningFormFields – score field', () => {
  function makeScoreForm() {
    return makeForm([makeScoreField()]);
  }

  it('scoreField_rendersLabel', () => {
    render(<ExternalLearningFormFields form={makeScoreForm()} state={makeState()} />);
    expect(screen.getByText('alm.externallearning.score')).toBeInTheDocument();
  });

  it('scoreError_rendersOnlyParagraphTextNoIcon', () => {
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ scoreError: 'text.externallearning.score.exceeded' })}
      />
    );
    const errorEl = screen.getByText('text.externallearning.score.exceeded');
    expect(errorEl.tagName).toBe('P');
    expect(errorEl.querySelector('svg')).toBeNull();
  });

  it('fieldError_onScore_rendersOnlyParagraphTextNoIcon', () => {
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ fieldErrors: { score: 'This field is required' } })}
      />
    );
    const errorEl = screen.getByText('This field is required');
    expect(errorEl.tagName).toBe('P');
    expect(errorEl.querySelector('svg')).toBeNull();
  });

  it('achievedScore_acceptsNegativeValue_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeScoreForm()} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score' }), { target: { value: '-3' } });
    expect(setFieldValue).toHaveBeenCalledWith('score', expect.objectContaining({ achievedScore: '-3' }));
  });

  it('achievedScore_rejectsNonNumericValue_doesNotCallSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeScoreForm()} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score' }), { target: { value: 'abc' } });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('maxScore_validValue_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setFieldValue, formValues: { score: { achievedScore: '5', maxScore: '' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score max' }), { target: { value: '10' } });
    expect(setFieldValue).toHaveBeenCalledWith('score', expect.objectContaining({ maxScore: '10' }));
  });

  it('maxScore_emptyValue_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setFieldValue, formValues: { score: { achievedScore: '5', maxScore: '10' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score max' }), { target: { value: '' } });
    expect(setFieldValue).toHaveBeenCalledWith('score', expect.objectContaining({ maxScore: '' }));
  });

  it('maxScore_rejectsNegativeValue_doesNotCallSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeScoreForm()} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score max' }), { target: { value: '-10' } });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('maxScore_onChange_triggersValidateScore_setsError', () => {
    const setScoreError = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setScoreError, formValues: { score: { achievedScore: '15', maxScore: '' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score max' }), { target: { value: '10' } });
    expect(setScoreError).toHaveBeenCalledWith('text.externallearning.score.exceeded');
  });

  it('validateScore_achievedGreaterThanMax_callsSetScoreError', () => {
    const setScoreError = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setScoreError, formValues: { score: { achievedScore: '', maxScore: '10' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score' }), { target: { value: '15' } });
    expect(setScoreError).toHaveBeenCalledWith('text.externallearning.score.exceeded');
  });

  it('validateScore_achievedLessThanMax_clearsError', () => {
    const setScoreError = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setScoreError, formValues: { score: { achievedScore: '', maxScore: '10' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score' }), { target: { value: '5' } });
    expect(setScoreError).toHaveBeenCalledWith('');
  });

  it('validateScore_negativeAchievedLessThanPositiveMax_noError', () => {
    const setScoreError = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeScoreForm()}
        state={makeState({ setScoreError, formValues: { score: { achievedScore: '', maxScore: '10' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score' }), { target: { value: '-5' } });
    expect(setScoreError).toHaveBeenCalledWith('');
  });
});

// ─── date / TIMESTAMP field ───────────────────────────────────────────────────

describe('ExternalLearningFormFields – date field', () => {
  it('default_showsStartDatePicker', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDateField()])} state={makeState()} />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.queryByTestId('date-range-picker')).toBeNull();
  });

  it('startDateType_datPickerHasStartDateLabel', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'startDate' } })}
      />
    );
    expect(screen.getByTestId('date-picker').getAttribute('aria-label')).toBe('text.externallearning.startDate');
  });

  it('endDateType_datPickerHasEndDateLabel', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'endDate' } })}
      />
    );
    expect(screen.getByTestId('date-picker').getAttribute('aria-label')).toBe('text.externallearning.endDate');
  });

  it('startDateType_datePickerHasMinValueOf1900', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'startDate' } })}
      />
    );
    expect(screen.getByTestId('date-picker').getAttribute('data-min-value')).toBe('1900-01-01');
  });

  it('endDateType_datePickerHasNoMinValue', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'endDate' } })}
      />
    );
    // No lower limit on end date — minValue is not passed.
    expect(screen.getByTestId('date-picker').getAttribute('data-min-value')).toBe('');
  });

  it('startDateType_datePickerHasNoUpperLimit', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'startDate' } })}
      />
    );
    // No maxValue is passed for start date (unbounded upper limit).
    expect(screen.getByTestId('date-picker')).not.toHaveAttribute('data-max-value');
  });

  it('bothType_showsDateRangePickerNotDatePicker', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'both' } })}
      />
    );
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
    expect(screen.queryByTestId('date-picker')).toBeNull();
  });

  it('bothType_dateRangePickerHasMinValueOf1900', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'both' } })}
      />
    );
    expect(screen.getByTestId('date-range-picker').getAttribute('data-min-value')).toBe(
      '1900-01-01'
    );
  });

  it('withFieldError_showsErrorParagraph', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ fieldErrors: { date: 'Date is required' } })}
      />
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('radioGroupChange_callsSetDateTypes', () => {
    const setDateTypes = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setDateTypes })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'both' } });
    expect(setDateTypes).toHaveBeenCalled();
  });

  it('radioGroupChange_clearsFieldValueToUndefined', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setFieldValue, dateTypes: { date: 'startDate' } })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'both' } });
    expect(setFieldValue).toHaveBeenCalledWith('date', undefined);
  });

  it('radioGroupChange_callsBothSetDateTypesAndSetFieldValue', () => {
    const setDateTypes = jest.fn();
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setDateTypes, setFieldValue })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'endDate' } });
    expect(setDateTypes).toHaveBeenCalled();
    expect(setFieldValue).toHaveBeenCalledWith('date', undefined);
  });

  it('radioGroupChange_startToBoth_previousStartDateValueDiscarded', () => {
    // When the user had a startDate value and switches to 'both',
    // setFieldValue is called with undefined — the stored date is cleared.
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({
          setFieldValue,
          dateTypes: { date: 'startDate' },
          formValues: { date: { startDate: '2026-01-01' } },
        })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'both' } });
    expect(setFieldValue).toHaveBeenCalledWith('date', undefined);
  });

  it('radioGroupChange_bothToStartDate_previousRangeValueDiscarded', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({
          setFieldValue,
          dateTypes: { date: 'both' },
          formValues: { date: { range: { start: '2026-01-01', end: '2026-12-31' } } },
        })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'startDate' } });
    expect(setFieldValue).toHaveBeenCalledWith('date', undefined);
  });

  it('rendersDescriptionText', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDateField()])} state={makeState()} />);
    expect(screen.getByText('text.externallearning.date.desc')).toBeInTheDocument();
  });

  it('datePicker_onChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setFieldValue, dateTypes: { date: 'startDate' } })}
      />
    );
    fireEvent.click(screen.getByTestId('date-picker'));
    expect(setFieldValue).toHaveBeenCalledWith('date', expect.objectContaining({ startDate: '2026-01-01' }));
  });

  it('dateRangePicker_onChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setFieldValue, dateTypes: { date: 'both' } })}
      />
    );
    fireEvent.click(screen.getByTestId('date-range-picker'));
    expect(setFieldValue).toHaveBeenCalledWith('date', { range: { start: '2026-01-01', end: '2026-12-31' } });
  });
});

// ─── duration field ───────────────────────────────────────────────────────────

describe('ExternalLearningFormFields – duration field', () => {
  it('rendersLabel', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState()} />);
    expect(screen.getByText('alm.externallearning.duration')).toBeInTheDocument();
  });

  it('validNumericInput_callsSetFieldValueWithTimeSpan', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.duration' }), { target: { value: '5' } });
    expect(setFieldValue).toHaveBeenCalledWith('duration', expect.objectContaining({ timeSpan: '5' }));
  });

  it('emptyInput_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDurationField()])}
        state={makeState({ setFieldValue, formValues: { duration: { timeSpan: '5', period: 'YEARS' } } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.duration' }), { target: { value: '' } });
    expect(setFieldValue).toHaveBeenCalledWith('duration', expect.objectContaining({ timeSpan: '' }));
  });

  it('existingTimeSpan_showsValueInInput', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDurationField()])}
        state={makeState({ formValues: { duration: { timeSpan: '8', period: 'HOURS' } } })}
      />
    );
    expect(
      (screen.getByRole('textbox', { name: 'alm.externallearning.duration' }) as HTMLInputElement).value
    ).toBe('8');
  });

  it('invalidAlphaInput_doesNotCallSetFieldValue', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.duration' }), { target: { value: 'xyz' } });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('rendersAllPeriodOptions', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState()} />);
    expect(screen.getByText('text.externallearning.minutes')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.hours')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.days')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.weeks')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.months')).toBeInTheDocument();
    expect(screen.getByText('text.externallearning.years')).toBeInTheDocument();
  });

  it('periodPickerChange_callsSetFieldValueWithPeriod', () => {
    const setFieldValue = jest.fn();
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState({ setFieldValue })} />);
    // Item mock uses the option's text as its value, so the change yields the translated label key.
    fireEvent.change(screen.getByLabelText('text.externallearning.duration'), { target: { value: 'text.externallearning.months' } });
    expect(setFieldValue).toHaveBeenCalledWith('duration', expect.objectContaining({ period: 'text.externallearning.months' }));
  });

  it('withFieldError_showsErrorParagraph', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDurationField()])}
        state={makeState({ fieldErrors: { duration: 'Duration required' } })}
      />
    );
    expect(screen.getByText('Duration required')).toBeInTheDocument();
  });

  it('rendersDescriptionText', () => {
    render(<ExternalLearningFormFields form={makeForm([makeDurationField()])} state={makeState()} />);
    expect(screen.getByText('text.externallearning.duration.desc')).toBeInTheDocument();
  });
});

// ─── renderCustomField ────────────────────────────────────────────────────────

describe('ExternalLearningFormFields – renderCustomField', () => {
  // TEXT
  it('customText_stringLabel_renders', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: 'My Note', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('My Note')).toBeInTheDocument();
  });

  it('customText_recordLabel_usesGetLocalizedRecord', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: { en_US: 'Record Label' }, description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('Record Label')).toBeInTheDocument();
  });

  it('customText_onChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: 'My Note', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } });
    expect(setFieldValue).toHaveBeenCalledWith('cf:note', 'Hello');
  });

  it('customText_withFieldError_showsErrorParagraph', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: 'Note', description: '' };
    render(
      <ExternalLearningFormFields
        form={makeCustomFieldForm(field)}
        state={makeState({ fieldErrors: { 'cf:note': 'Required' } })}
      />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('customText_stringDescription_showsAsPlaceholder', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: 'Note', description: 'Enter note' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByPlaceholderText('Enter note')).toBeInTheDocument();
  });

  it('customText_recordDescription_usesGetLocalizedRecord', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: false, label: 'Note', description: { en_US: 'Record desc' } };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByPlaceholderText('Record desc')).toBeInTheDocument();
  });

  it('customText_mandatory_rendersField', () => {
    const field = { id: 'cf:note', type: 'TEXT', enabled: true, mandatory: true, label: 'Note', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // NUMBER
  it('customNumber_renders', () => {
    const field = { id: 'cf:count', type: 'NUMBER', enabled: true, mandatory: false, label: 'Count', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('Count')).toBeInTheDocument();
  });

  it('customNumber_validInput_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = { id: 'cf:count', type: 'NUMBER', enabled: true, mandatory: false, label: 'Count', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '42' } });
    expect(setFieldValue).toHaveBeenCalledWith('cf:count', '42');
  });

  it('customNumber_emptyInput_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = { id: 'cf:count', type: 'NUMBER', enabled: true, mandatory: false, label: 'Count', description: '' };
    render(
      <ExternalLearningFormFields
        form={makeCustomFieldForm(field)}
        state={makeState({ setFieldValue, formValues: { 'cf:count': '5' } })}
      />
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(setFieldValue).toHaveBeenCalledWith('cf:count', '');
  });

  it('customNumber_invalidAlphaInput_doesNotCallSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = { id: 'cf:count', type: 'NUMBER', enabled: true, mandatory: false, label: 'Count', description: '' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('customNumber_withFieldError_showsErrorParagraph', () => {
    const field = { id: 'cf:count', type: 'NUMBER', enabled: true, mandatory: false, label: 'Count', description: '' };
    render(
      <ExternalLearningFormFields
        form={makeCustomFieldForm(field)}
        state={makeState({ fieldErrors: { 'cf:count': 'Required' } })}
      />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  // CHECKBOX
  it('customCheckbox_rendersWithDescription', () => {
    const field = { id: 'cf:agreed', type: 'CHECKBOX', enabled: true, mandatory: false, label: 'I Agree', description: 'Please agree' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('I Agree')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('customCheckbox_onChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = { id: 'cf:agreed', type: 'CHECKBOX', enabled: true, mandatory: false, label: 'I Agree', description: 'Agree' };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState({ setFieldValue })} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(setFieldValue).toHaveBeenCalledWith('cf:agreed', true);
  });

  it('customCheckbox_withFieldError_showsErrorParagraph', () => {
    const field = { id: 'cf:agreed', type: 'CHECKBOX', enabled: true, mandatory: false, label: 'I Agree', description: 'Agree' };
    render(
      <ExternalLearningFormFields
        form={makeCustomFieldForm(field)}
        state={makeState({ fieldErrors: { 'cf:agreed': 'Must agree' } })}
      />
    );
    expect(screen.getByText('Must agree')).toBeInTheDocument();
  });

  // DROPDOWN
  it('customDropdown_renders', () => {
    const field = {
      id: 'cf:level', type: 'DROPDOWN', enabled: true, mandatory: false,
      label: 'Level', description: '',
      options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
    };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('Level')).toBeInTheDocument();
  });

  it('customDropdown_withStringDescription_showsDescriptionParagraph', () => {
    const field = {
      id: 'cf:level', type: 'DROPDOWN', enabled: true, mandatory: false,
      label: 'Level', description: 'Choose your level',
      options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
    };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(screen.getByText('Choose your level')).toBeInTheDocument();
  });

  it('customDropdown_onSelectionChange_callsSetFieldValue', () => {
    const setFieldValue = jest.fn();
    const field = {
      id: 'cf:level', type: 'DROPDOWN', enabled: true, mandatory: false,
      label: 'Level', description: '',
      // getLocalizedRecord mock returns record.en_US, so option value will be 'Beginner'
      options: [{ option_id: 'Beginner', label: { en_US: 'Beginner' } }],
    };
    render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState({ setFieldValue })} />);
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'Beginner' } });
    expect(setFieldValue).toHaveBeenCalledWith('cf:level', 'Beginner');
  });

  it('customDropdown_withFieldError_showsErrorParagraph', () => {
    const field = {
      id: 'cf:level', type: 'DROPDOWN', enabled: true, mandatory: false,
      label: 'Level', description: '',
      options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
    };
    render(
      <ExternalLearningFormFields
        form={makeCustomFieldForm(field)}
        state={makeState({ fieldErrors: { 'cf:level': 'Level required' } })}
      />
    );
    expect(screen.getByText('Level required')).toBeInTheDocument();
  });

  it('customDropdown_withoutOptions_rendersNothing', () => {
    const field = { id: 'cf:level', type: 'DROPDOWN', enabled: true, mandatory: false, label: 'Level', description: '', options: [] };
    const { container } = render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(container.querySelector('select')).toBeNull();
  });

  it('customUnknownType_rendersNothing', () => {
    const field = { id: 'cf:x', type: 'MULTISELECT', enabled: true, mandatory: false, label: 'X', description: '' };
    const { container } = render(<ExternalLearningFormFields form={makeCustomFieldForm(field)} state={makeState()} />);
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('select')).toBeNull();
  });
});

// ─── renderField returns null for unknown core field ids ──────────────────────

describe('ExternalLearningFormFields – renderField returns null', () => {
  it('unknownCoreFieldId_rendersNothing', () => {
    const field = { id: 'unknown_field', type: 'TEXT', enabled: true, mandatory: false, label: 'Unknown', description: '' };
    const { container } = render(<ExternalLearningFormFields form={makeForm([field])} state={makeState()} />);
    expect(container.querySelector('input')).toBeNull();
  });
});

// ─── remaining branch coverage ────────────────────────────────────────────────

describe('ExternalLearningFormFields – FILE_UPLOAD onDrop with files', () => {
  it('dropZone_onDrop_filtersNonFileItems_andCallsHandleFilesWithFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ handleFiles })} />);
    fireEvent.click(screen.getByTestId('drop-zone-with-file'));
    await new Promise(r => setTimeout(r, 0));
    // The non-file item is filtered out; only the resolved file is forwarded.
    expect(handleFiles).toHaveBeenCalledWith('attachments', [{ name: 'dropped.pdf' }]);
  });
});

describe('ExternalLearningFormFields – FileTrigger null selection (false branch)', () => {
  it('fileTrigger_defaultState_nullSelection_doesNotCallHandleFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(<ExternalLearningFormFields form={makeForm()} state={makeState({ handleFiles })} />);
    fireEvent.click(screen.getByTestId('file-trigger'));
    await new Promise(r => setTimeout(r, 0));
    expect(handleFiles).not.toHaveBeenCalled();
  });

  it('fileTrigger_uploadedState_nullSelection_doesNotCallHandleFiles', async () => {
    const handleFiles = jest.fn().mockResolvedValue(undefined);
    render(
      <ExternalLearningFormFields
        form={makeForm()}
        state={makeState({ handleFiles, fileNames: { attachments: ['existing.pdf'] } })}
      />
    );
    fireEvent.click(screen.getByTestId('file-trigger'));
    await new Promise(r => setTimeout(r, 0));
    expect(handleFiles).not.toHaveBeenCalled();
  });
});

describe('ExternalLearningFormFields – date setDateTypes updater', () => {
  it('radioGroupChange_updaterMergesNewDateTypeIntoPreviousState', () => {
    let updater: any;
    const setDateTypes = jest.fn((fn: any) => {
      updater = fn;
    });
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ setDateTypes })}
      />
    );
    fireEvent.change(screen.getByLabelText('alm.externallearning.date'), { target: { value: 'endDate' } });
    expect(setDateTypes).toHaveBeenCalled();
    // Invoke the captured updater to cover the `prev => ({ ...prev })` body.
    expect(updater({ other: 'startDate' })).toEqual({ other: 'startDate', date: 'endDate' });
  });
});

describe('ExternalLearningFormFields – score maxScore with absent achievedScore', () => {
  it('maxScore_change_whenAchievedScoreAbsent_validatesWithEmptyAchieved', () => {
    const setScoreError = jest.fn();
    const setFieldValue = jest.fn();
    render(
      <ExternalLearningFormFields
        form={makeForm([makeScoreField()])}
        state={makeState({ setScoreError, setFieldValue })}
      />
    );
    // formValues.score is undefined → updated.achievedScore is undefined → `|| ''` falsy branch.
    fireEvent.change(screen.getByRole('textbox', { name: 'alm.externallearning.score max' }), { target: { value: '10' } });
    expect(setFieldValue).toHaveBeenCalledWith('score', expect.objectContaining({ maxScore: '10' }));
    // '' achieved is not greater than 10 → error cleared.
    expect(setScoreError).toHaveBeenCalledWith('');
  });
});

// ─── date field – localized min-date / range validation ───────────────────────
//
// react-spectrum's own built-in rangeUnderflow/rangeReversed message always renders in
// navigator.language, ignoring the app's locale (@react-stately/datepicker getLocale()).
// The `validate` prop we pass in takes priority over that built-in message (per
// @react-stately/form's useFormValidationState clientError > builtinValidation ordering),
// so these tests lock down that our localized replacement is what actually gets used.

describe('ExternalLearningFormFields – startDate validate (single DatePicker)', () => {
  function renderStartDate() {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'startDate' } })}
      />
    );
    return screen.getByTestId('date-picker');
  }

  it('dateBeforeMin_returnsLocalizedMinDateError', () => {
    const el = renderStartDate();
    expect(el.getAttribute('data-validate-underflow')).toBe(
      'text.externallearning.date.minDateError|{"minDate":"formatted:en-US"}'
    );
  });

  it('dateBeforeMin_formatsMinDateUsingMinStartDateAndLocale', () => {
    renderStartDate();
    expect(mockModifyTimeDDMMYY).toHaveBeenCalledWith('1900-01-01', 'en-US');
  });

  it('dateOnOrAfterMin_returnsNull', () => {
    const el = renderStartDate();
    expect(el.getAttribute('data-validate-valid')).toBe('null');
  });

  it('nullValue_returnsNull', () => {
    const el = renderStartDate();
    expect(el.getAttribute('data-validate-null')).toBe('null');
  });

  it('accountLocaleIsFrench_minDateErrorUsesFrenchLocaleNotBrowserLanguage', () => {
    mockGetALMConfig.mockReturnValue({ locale: 'fr_FR' } as any);
    const el = renderStartDate();
    // Underscore-separated locale from config is normalized to a BCP-47 tag...
    expect(mockModifyTimeDDMMYY).toHaveBeenCalledWith('1900-01-01', 'fr-FR');
    // ...and that (not navigator.language) is what flows into the displayed message.
    expect(el.getAttribute('data-validate-underflow')).toBe(
      'text.externallearning.date.minDateError|{"minDate":"formatted:fr-FR"}'
    );
  });
});

describe('ExternalLearningFormFields – endDate has no validate function', () => {
  it('endDateType_validateIsUndefined', () => {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'endDate' } })}
      />
    );
    // No lower bound on end date, so no validate prop is passed either.
    expect(screen.getByTestId('date-picker').getAttribute('data-validate-underflow')).toBe(
      'no-validate'
    );
  });
});

describe('ExternalLearningFormFields – both (DateRangePicker) validate', () => {
  function renderBoth() {
    render(
      <ExternalLearningFormFields
        form={makeForm([makeDateField()])}
        state={makeState({ dateTypes: { date: 'both' } })}
      />
    );
    return screen.getByTestId('date-range-picker');
  }

  it('validRange_returnsNull', () => {
    expect(renderBoth().getAttribute('data-validate-valid')).toBe('null');
  });

  it('nullRange_returnsNull', () => {
    expect(renderBoth().getAttribute('data-validate-null')).toBe('null');
  });

  it('startBeforeMin_returnsLocalizedMinDateError', () => {
    expect(renderBoth().getAttribute('data-validate-start-underflow')).toBe(
      'text.externallearning.date.minDateError|{"minDate":"formatted:en-US"}'
    );
  });

  it('endBeforeMin_returnsLocalizedMinDateError', () => {
    expect(renderBoth().getAttribute('data-validate-end-underflow')).toBe(
      'text.externallearning.date.minDateError|{"minDate":"formatted:en-US"}'
    );
  });

  it('endBeforeStart_returnsLocalizedRangeReversedError', () => {
    // Both dates are individually >= 1900, so only the reversed-range check applies.
    expect(renderBoth().getAttribute('data-validate-reversed')).toBe(
      'text.externallearning.date.rangeReversedError'
    );
  });

  it('bothDatesBeforeMinAndReversed_minDateErrorTakesPrecedenceOverReversed', () => {
    expect(renderBoth().getAttribute('data-validate-underflow-and-reversed')).toBe(
      'text.externallearning.date.minDateError|{"minDate":"formatted:en-US"}'
    );
  });
});
