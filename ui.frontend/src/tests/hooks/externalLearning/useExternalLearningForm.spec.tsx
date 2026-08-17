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

jest.mock('@utils/uploadUtils', () => ({
  getUploadInfo: jest.fn(),
  uploadFile: jest.fn(),
}));

jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
}));

import { act } from '@testing-library/react';
import { useExternalLearningForm, ExternalLearningFormOptions } from '@hooks/externalLearning/useExternalLearningForm';
import * as uploadUtils from '@utils/uploadUtils';
import * as translationService from '@utils/translationService';
import { ExternalLearningSettings } from '@hooks/externalLearning/useExternalLearningSettings';
import { createRenderHook } from '../../util/renderHook';

const mockGetUploadInfo = uploadUtils.getUploadInfo as jest.MockedFunction<typeof uploadUtils.getUploadInfo>;
const mockUploadFile = uploadUtils.uploadFile as jest.MockedFunction<typeof uploadUtils.uploadFile>;
const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<typeof translationService.GetTranslation>;

function makeField(overrides: any = {}): any {
  return {
    id: 'title',
    type: 'TEXT',
    enabled: true,
    mandatory: false,
    editable: true,
    default: true,
    order: 1,
    label: 'alm.title',
    description: '',
    ...overrides,
  };
}

function makeSettings(coreFieldOverrides: any[] = [], customFieldOverrides: any[] = []): ExternalLearningSettings {
  return {
    enabled: true,
    updatedAt: '2026-01-01T00:00:00Z',
    coreFields: [
      makeField({ id: 'title', type: 'TEXT' }),
      // date/score/duration are JSON_OBJECT on the backend now (client value shape unchanged).
      makeField({ id: 'date', type: 'JSON_OBJECT' }),
      makeField({ id: 'score', type: 'JSON_OBJECT' }),
      makeField({ id: 'duration', type: 'JSON_OBJECT', label: 'alm.duration' }),
      makeField({ id: 'attachments', type: 'FILE_UPLOAD' }),
      ...coreFieldOverrides,
    ],
    customFields: customFieldOverrides,
  };
}

const renderHook = (settings: ExternalLearningSettings | null, options: ExternalLearningFormOptions = {}) =>
  createRenderHook(() => useExternalLearningForm(settings, options));

describe('useExternalLearningForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // resetMocks:true resets all jest.fn() implementations — restore translation key passthrough
    mockGetTranslation.mockImplementation((key: string) => key);
  });

  describe('initial state', () => {
    it('noOptions_startsWithEmptyState', () => {
      const { result } = renderHook(makeSettings());

      expect(result.current.formValues).toEqual({});
      expect(result.current.dateTypes).toEqual({});
      expect(result.current.fileNames).toEqual({});
      expect(result.current.fileErrors).toEqual({});
      expect(result.current.fieldErrors).toEqual({});
      expect(result.current.submissionUrl).toBe('');
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isConfirmOpen).toBe(false);
      expect(result.current.showToastBackdrop).toBe(false);
    });

    it('withInitialOptions_prefillsState', () => {
      const options: ExternalLearningFormOptions = {
        initialValues: { title: 'My Course' },
        initialDateTypes: { date: 'startDate' },
        initialSubmissionUrl: 'https://cdn.example.com/doc.pdf',
        initialFileNames: { attachments: ['doc.pdf'] },
      };
      const { result } = renderHook(makeSettings(), options);

      expect(result.current.formValues.title).toBe('My Course');
      expect(result.current.dateTypes.date).toBe('startDate');
      expect(result.current.submissionUrl).toBe('https://cdn.example.com/doc.pdf');
      expect(result.current.fileNames.attachments).toEqual(['doc.pdf']);
    });
  });

  describe('setFieldValue', () => {
    it('setFieldValue_updatesFormValues', () => {
      const { result } = renderHook(makeSettings());

      act(() => { result.current.setFieldValue('title', 'Test Title'); });

      expect(result.current.formValues.title).toBe('Test Title');
    });

    it('setFieldValue_clearsExistingFieldError', () => {
      const settings: ExternalLearningSettings = {
        enabled: true, updatedAt: '', customFields: [],
        coreFields: [makeField({ id: 'title', type: 'TEXT', mandatory: true })],
      };
      const { result } = renderHook(settings);

      act(() => { result.current.validateForm(); });
      expect(result.current.fieldErrors.title).toBeDefined();

      act(() => { result.current.setFieldValue('title', 'Some Value'); });
      expect(result.current.fieldErrors.title).toBeUndefined();
    });

    it('setFieldValue_noExistingError_doesNotMutateErrors', () => {
      const { result } = renderHook(makeSettings());
      const errorsBefore = result.current.fieldErrors;

      act(() => { result.current.setFieldValue('title', 'x'); });

      expect(result.current.fieldErrors).toBe(errorsBefore);
    });
  });

  describe('handleFiles', () => {
    it('handleFiles_emptyArray_doesNothing', async () => {
      const { result } = renderHook(makeSettings());
      await act(async () => { await result.current.handleFiles('attachments', []); });
      expect(mockGetUploadInfo).not.toHaveBeenCalled();
    });

    it('handleFiles_invalidMimeType_setsFileError', async () => {
      const { result } = renderHook(makeSettings());
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.fileErrors.attachments).toBe('text.externallearning.file.invalidType');
      expect(mockGetUploadInfo).not.toHaveBeenCalled();
    });

    it('handleFiles_fileTooLarge_setsFileError', async () => {
      const { result } = renderHook(makeSettings());
      const bigContent = new Uint8Array(51 * 1024 * 1024);
      const file = new File([bigContent], 'large.pdf', { type: 'application/pdf' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.fileErrors.attachments).toBe('text.externallearning.file.tooLarge');
    });

    it('handleFiles_validFile_uploadSucceeds_setsSubmissionUrl', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockResolvedValue('https://cdn.example.com/uploaded.pdf');

      const { result } = renderHook(makeSettings());
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.submissionUrl).toBe('https://cdn.example.com/uploaded.pdf');
      expect(result.current.fileNames.attachments).toEqual(['test.pdf']);
      expect(result.current.isUploading).toBe(false);
    });

    it('handleFiles_uploadReturnsNull_setsUploadError', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockResolvedValue(null as any);

      const { result } = renderHook(makeSettings());
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.fileErrors.attachments).toBe('text.externallearning.file.uploadFailed');
      expect(result.current.submissionUrl).toBe('');
      expect(result.current.fileNames.attachments).toEqual([]);
    });

    it('handleFiles_uploadThrows_setsUploadError', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(makeSettings());
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.fileErrors.attachments).toBe('text.externallearning.file.uploadFailed');
      expect(result.current.isUploading).toBe(false);
    });

    it('handleFiles_validImageFile_isAccepted', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockResolvedValue('https://cdn.example.com/image.png');

      const { result } = renderHook(makeSettings());
      const file = new File(['img'], 'photo.png', { type: 'image/png' });

      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      expect(result.current.submissionUrl).toBe('https://cdn.example.com/image.png');
    });
  });

  describe('buildPayload', () => {
    it('buildPayload_textField_includesValueInFields', () => {
      const { result } = renderHook(makeSettings());
      act(() => { result.current.setFieldValue('title', 'My Course'); });

      const payload: any = result.current.buildPayload();

      const titleField = payload.data.attributes.fields.find((f: any) => f.id === 'title');
      expect(titleField.value).toBe('My Course');
      expect(titleField.type).toBe('TEXT');
    });

    it('buildPayload_emptyTextField_setsValueNull', () => {
      const { result } = renderHook(makeSettings());

      const payload: any = result.current.buildPayload();

      const titleField = payload.data.attributes.fields.find((f: any) => f.id === 'title');
      expect(titleField.value).toBeNull();
    });

    it('buildPayload_dateFieldStartDate_buildsCorrectDateObject', () => {
      const { result } = renderHook(makeSettings());
      const mockDate = { toString: () => '2026-03-15' };

      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'startDate' }));
        result.current.setFieldValue('date', { startDate: mockDate });
      });

      const payload: any = result.current.buildPayload();
      const dateField = payload.data.attributes.fields.find((f: any) => f.id === 'date');
      expect(dateField.value.start_date).toBe('2026-03-15T00:00:00Z');
      // Only the selected date is sent — end_date key is omitted entirely.
      expect('end_date' in dateField.value).toBe(false);
    });

    it('buildPayload_dateFieldBoth_buildsBothDates', () => {
      const { result } = renderHook(makeSettings());
      const startMock = { toString: () => '2026-01-01' };
      const endMock = { toString: () => '2026-12-31' };

      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'both' }));
        result.current.setFieldValue('date', { range: { start: startMock, end: endMock } });
      });

      const payload: any = result.current.buildPayload();
      const dateField = payload.data.attributes.fields.find((f: any) => f.id === 'date');
      expect(dateField.value.start_date).toBe('2026-01-01T00:00:00Z');
      expect(dateField.value.end_date).toBe('2026-12-31T00:00:00Z');
    });

    it('buildPayload_scoreField_buildsAchievedAndMaxScore', () => {
      const { result } = renderHook(makeSettings());
      act(() => { result.current.setFieldValue('score', { achievedScore: '85', maxScore: '100' }); });

      const payload: any = result.current.buildPayload();
      const scoreField = payload.data.attributes.fields.find((f: any) => f.id === 'score');
      expect(scoreField.value.achieved_score).toBe(85);
      expect(scoreField.value.max_score).toBe(100);
    });

    it('buildPayload_emptyScore_setsNullScores', () => {
      const { result } = renderHook(makeSettings());

      const payload: any = result.current.buildPayload();
      const scoreField = payload.data.attributes.fields.find((f: any) => f.id === 'score');
      expect(scoreField.value.achieved_score).toBeNull();
      expect(scoreField.value.max_score).toBeNull();
    });

    it('buildPayload_durationField_buildsTimeSpanPeriodObject', () => {
      const { result } = renderHook(makeSettings());
      // Dropdown emits the period enum (MINUTES/HOURS/DAYS/WEEKS/MONTHS/YEARS); timeSpan is numeric.
      act(() => { result.current.setFieldValue('duration', { timeSpan: '3', period: 'MONTHS' }); });

      const payload: any = result.current.buildPayload();
      const durationField = payload.data.attributes.fields.find((f: any) => f.id === 'duration');
      expect(durationField.value).toEqual({ timeSpan: 3, period: 'MONTHS' });
    });

    it('buildPayload_durationField_supportsWeeksPeriod', () => {
      const { result } = renderHook(makeSettings());
      act(() => { result.current.setFieldValue('duration', { timeSpan: '2', period: 'WEEKS' }); });

      const payload: any = result.current.buildPayload();
      const durationField = payload.data.attributes.fields.find((f: any) => f.id === 'duration');
      expect(durationField.value).toEqual({ timeSpan: 2, period: 'WEEKS' });
    });

    it('buildPayload_durationField_uppercasesPeriodForApi', () => {
      const { result } = renderHook(makeSettings());
      // Even if a lowercase period somehow reaches state, the payload must send caps.
      act(() => { result.current.setFieldValue('duration', { timeSpan: '4', period: 'weeks' }); });

      const payload: any = result.current.buildPayload();
      const durationField = payload.data.attributes.fields.find((f: any) => f.id === 'duration');
      expect(durationField.value).toEqual({ timeSpan: 4, period: 'WEEKS' });
    });

    it('buildPayload_durationField_defaultsToMinutesWhenPeriodMissing', () => {
      const { result } = renderHook(makeSettings());
      act(() => { result.current.setFieldValue('duration', { timeSpan: '5' }); });

      const payload: any = result.current.buildPayload();
      const durationField = payload.data.attributes.fields.find((f: any) => f.id === 'duration');
      expect(durationField.value).toEqual({ timeSpan: 5, period: 'MINUTES' });
    });

    it('buildPayload_durationField_emptyTimeSpan_isNull', () => {
      const { result } = renderHook(makeSettings());
      act(() => { result.current.setFieldValue('duration', { timeSpan: '', period: 'MONTHS' }); });

      const payload: any = result.current.buildPayload();
      const durationField = payload.data.attributes.fields.find((f: any) => f.id === 'duration');
      expect(durationField.value).toBeNull();
    });

    it('buildPayload_dateFieldEndDateOnly_buildsEndDateOnly', () => {
      const { result } = renderHook(makeSettings());
      const mockDate = { toString: () => '2026-06-30' };

      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'endDate' }));
        result.current.setFieldValue('date', { endDate: mockDate });
      });

      const payload: any = result.current.buildPayload();
      const dateField = payload.data.attributes.fields.find((f: any) => f.id === 'date');
      // Only the selected date is sent — start_date key is omitted entirely.
      expect('start_date' in dateField.value).toBe(false);
      expect(dateField.value.end_date).toBe('2026-06-30T00:00:00Z');
    });

    it('buildPayload_dateFieldBothMissingEnd_omitsEndDate', () => {
      const { result } = renderHook(makeSettings());
      const startMock = { toString: () => '2026-01-01' };

      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'both' }));
        result.current.setFieldValue('date', { range: { start: startMock } });
      });

      const payload: any = result.current.buildPayload();
      const dateField = payload.data.attributes.fields.find((f: any) => f.id === 'date');
      expect(dateField.value.start_date).toBe('2026-01-01T00:00:00Z');
      expect('end_date' in dateField.value).toBe(false);
    });

    it('buildPayload_dateFieldNoSelection_isNull', () => {
      const { result } = renderHook(makeSettings());

      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'startDate' }));
      });

      const payload: any = result.current.buildPayload();
      const dateField = payload.data.attributes.fields.find((f: any) => f.id === 'date');
      expect(dateField.value).toBeNull();
    });

    it('buildPayload_customDropdownField_includesOptionId', () => {
      const settings = makeSettings([], [makeField({
        id: 'cf:level',
        type: 'DROPDOWN',
        enabled: true,
        options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
      })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('cf:level', 'beginner'); });

      const payload: any = result.current.buildPayload();
      const dropdownField = payload.data.attributes.fields.find((f: any) => f.id === 'cf:level');
      expect(dropdownField.value).toBe('beginner');
    });

    it('buildPayload_disabledCustomField_isExcluded', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:hidden', type: 'TEXT', enabled: false })]);
      const { result } = renderHook(settings);

      const payload: any = result.current.buildPayload();
      const hiddenField = payload.data.attributes.fields.find((f: any) => f.id === 'cf:hidden');
      expect(hiddenField).toBeUndefined();
    });

    it('buildPayload_topLevelShape_isJsonApiCompliant', () => {
      const { result } = renderHook(makeSettings());
      const payload: any = result.current.buildPayload();

      expect(payload).toHaveProperty('data');
      expect(payload.data.type).toBe('externalLearning');
      expect(payload.data.attributes).toHaveProperty('submissionUrl');
      expect(Array.isArray(payload.data.attributes.fields)).toBe(true);
    });

    it('buildPayload_attachmentsField_isExcluded', () => {
      const { result } = renderHook(makeSettings());

      const payload: any = result.current.buildPayload();
      const attachmentsField = payload.data.attributes.fields.find((f: any) => f.id === 'attachments');
      expect(attachmentsField).toBeUndefined();
    });

    it('buildPayload_includesSubmissionUrl', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockResolvedValue('https://cdn.example.com/doc.pdf');

      const { result } = renderHook(makeSettings());
      const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      const payload: any = result.current.buildPayload();
      expect(payload.data.attributes.submissionUrl).toBe('https://cdn.example.com/doc.pdf');
    });

    it('buildPayload_customCheckboxField_includesBooleanValue', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:agree', type: 'CHECKBOX', enabled: true })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('cf:agree', true); });

      const payload: any = result.current.buildPayload();
      const checkboxField = payload.data.attributes.fields.find((f: any) => f.id === 'cf:agree');
      expect(checkboxField.value).toBe(true);
    });

    it('buildPayload_customCheckboxUnchecked_defaultsFalse', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:agree', type: 'CHECKBOX', enabled: true })]);
      const { result } = renderHook(settings);

      const payload: any = result.current.buildPayload();
      const checkboxField = payload.data.attributes.fields.find((f: any) => f.id === 'cf:agree');
      expect(checkboxField.value).toBe(false);
    });

    it('buildPayload_disabledCoreField_isExcluded', () => {
      const settings = makeSettings([makeField({ id: 'extra', type: 'TEXT', enabled: false })]);
      const { result } = renderHook(settings);

      const payload: any = result.current.buildPayload();
      const extraField = payload.data.attributes.fields.find((f: any) => f.id === 'extra');
      expect(extraField).toBeUndefined();
    });

    it('buildPayload_nullSettings_returnsEmptyFieldsPayload', () => {
      const { result } = renderHook(null);
      const payload: any = result.current.buildPayload();
      expect(payload.data.attributes.fields).toEqual([]);
    });
  });

  describe('validateForm', () => {
    it('validate_allRequiredFilled_returnsTrue', () => {
      const settings = makeSettings([makeField({ id: 'title', type: 'TEXT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('title', 'My Course'); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
      expect(result.current.fieldErrors).toEqual({});
    });

    it('validate_missingRequiredTextField_setsError', () => {
      const settings = makeSettings([makeField({ id: 'title', type: 'TEXT', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.title).toBe('alm.feedback.text.required');
    });

    it('validate_requiredDateMissing_setsError', () => {
      const settings = makeSettings([makeField({ id: 'date', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.date).toBe('alm.feedback.text.required');
    });

    it('validate_requiredDateStartDateFilled_returnsTrue', () => {
      const settings = makeSettings([makeField({ id: 'date', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'startDate' }));
        result.current.setFieldValue('date', { startDate: { toString: () => '2026-01-01' } });
      });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_requiredScoreMissingAchieved_setsError', () => {
      const settings = makeSettings([makeField({ id: 'score', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.score).toBe('alm.feedback.text.required');
    });

    it('validate_requiredScoreMissingMax_setsError', () => {
      const settings = makeSettings([makeField({ id: 'score', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('score', { achievedScore: '80', maxScore: '' }); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.score).toBe('alm.feedback.text.required');
    });

    it('validate_requiredDurationMissing_setsError', () => {
      const settings = makeSettings([makeField({ id: 'duration', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.duration).toBe('alm.feedback.text.required');
    });

    it('validate_requiredFileUploadMissing_setsError', () => {
      const settings = makeSettings([makeField({ id: 'attachments', type: 'FILE_UPLOAD', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.attachments).toBe('alm.feedback.text.required');
    });

    it('validate_requiredFileUploadPresent_returnsTrue', async () => {
      mockGetUploadInfo.mockResolvedValue(undefined as any);
      mockUploadFile.mockResolvedValue('https://cdn.example.com/doc.pdf');

      const settings = makeSettings([makeField({ id: 'attachments', type: 'FILE_UPLOAD', mandatory: true })]);
      const { result } = renderHook(settings);
      const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      await act(async () => { await result.current.handleFiles('attachments', [file]); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_customRequiredTextMissing_setsError', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:1', type: 'TEXT', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors['cf:1']).toBe('alm.feedback.text.required');
    });

    it('validate_customRequiredCheckboxUnchecked_setsError', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:agree', type: 'CHECKBOX', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors['cf:agree']).toBe('alm.feedback.text.required');
    });

    it('validate_customRequiredCheckboxChecked_returnsTrue', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:agree', type: 'CHECKBOX', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('cf:agree', true); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_customRequiredDropdownEmpty_setsError', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:level', type: 'DROPDOWN', mandatory: true, options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }] })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
    });

    it('validate_optionalFieldEmpty_noError', () => {
      const settings = makeSettings([makeField({ id: 'title', type: 'TEXT', mandatory: false })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
      expect(result.current.fieldErrors.title).toBeUndefined();
    });

    it('validate_disabledRequiredField_isSkipped', () => {
      const settings = makeSettings([makeField({ id: 'title', type: 'TEXT', mandatory: true, enabled: false })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_nullSettings_returnsTrue', () => {
      const { result } = renderHook(null);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_requiredDateEndDateFilled_returnsTrue', () => {
      const settings = makeSettings([makeField({ id: 'date', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'endDate' }));
        result.current.setFieldValue('date', { endDate: { toString: () => '2026-06-30' } });
      });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_requiredDateBothFilled_returnsTrue', () => {
      const settings = makeSettings([makeField({ id: 'date', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'both' }));
        result.current.setFieldValue('date', {
          range: {
            start: { toString: () => '2026-01-01' },
            end: { toString: () => '2026-12-31' },
          },
        });
      });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_requiredDateBothMissingEnd_setsError', () => {
      const settings = makeSettings([makeField({ id: 'date', type: 'JSON_OBJECT', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => {
        result.current.setDateTypes((prev: any) => ({ ...prev, date: 'both' }));
        result.current.setFieldValue('date', { range: { start: { toString: () => '2026-01-01' } } });
      });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors.date).toBe('alm.feedback.text.required');
    });

    it('validate_customRequiredNumberMissing_setsError', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:hours', type: 'NUMBER', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors['cf:hours']).toBe('alm.feedback.text.required');
    });

    it('validate_customRequiredNumberFilled_returnsTrue', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:hours', type: 'NUMBER', mandatory: true })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('cf:hours', '42'); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_customRequiredDropdownFilled_returnsTrue', () => {
      const settings = makeSettings([], [makeField({
        id: 'cf:level',
        type: 'DROPDOWN',
        mandatory: true,
        options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
      })]);
      const { result } = renderHook(settings);
      act(() => { result.current.setFieldValue('cf:level', 'beginner'); });

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(true);
    });

    it('validate_customRequiredTimestampMissing_setsError', () => {
      const settings = makeSettings([], [makeField({ id: 'cf:milestone', type: 'TIMESTAMP', mandatory: true })]);
      const { result } = renderHook(settings);

      let valid: boolean;
      act(() => { valid = result.current.validateForm(); });

      expect(valid!).toBe(false);
      expect(result.current.fieldErrors['cf:milestone']).toBe('alm.feedback.text.required');
    });
  });
});
