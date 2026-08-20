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
jest.mock('@utils/translationService', () => ({
  GetTranslation: jest.fn((key: string) => key),
}));

jest.mock('@utils/dateTime', () => ({
  modifyTimeDDMMYY: jest.fn((d: string) => d || ''),
}));

jest.mock('@react-spectrum/toast', () => ({
  ToastQueue: {
    negative: jest.fn(),
    info: jest.fn(),
    positive: jest.fn(),
  },
}));

import { ToastQueue } from '@react-spectrum/toast';
import * as translationService from '@utils/translationService';
import * as dateTime from '@utils/dateTime';
import {
  isNullish,
  isSafeUrl,
  safeParseDate,
  getFieldLabel,
  renderFieldValue,
  buildInitialFormState,
  handleDownload,
} from '@components/ExternalLearning/externalLearningDetailUtils';
import { EnrichedField } from '@hooks/externalLearning';

const mockGetTranslation = translationService.GetTranslation as jest.MockedFunction<
  typeof translationService.GetTranslation
>;
const mockModifyTimeDDMMYY = dateTime.modifyTimeDDMMYY as jest.MockedFunction<
  typeof dateTime.modifyTimeDDMMYY
>;

describe('externalLearningDetailUtils', () => {
  // ALM Jest is configured with resetMocks: true, which wipes mock implementations between
  // tests. These helpers depend on GetTranslation and modifyTimeDDMMYY returning sensible
  // values, so we re-establish their pass-through impls before each test.
  beforeEach(() => {
    mockGetTranslation.mockImplementation((key: string) => key);
    mockModifyTimeDDMMYY.mockImplementation((d: string) => d || '');
    (ToastQueue.negative as jest.MockedFunction<typeof ToastQueue.negative>).mockImplementation(
      () => () => {}
    );
  });
  describe('isNullish', () => {
    it.each([
      [null, true],
      [undefined, true],
      ['', true],
      ['null', true],
      ['0', false],
      [0, false],
      [false, false],
      ['value', false],
      [{}, false],
    ])('isNullish(%p) returns %p', (input, expected) => {
      expect(isNullish(input)).toBe(expected);
    });
  });

  describe('isSafeUrl', () => {
    it('returns true for https URLs', () => {
      expect(isSafeUrl('https://example.com/file.pdf')).toBe(true);
    });
    it('returns false for http URLs', () => {
      expect(isSafeUrl('http://example.com/file.pdf')).toBe(false);
    });
    it('returns false for javascript: URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });
    it('returns false for malformed input', () => {
      expect(isSafeUrl('not-a-url')).toBe(false);
    });
    it('returns false for empty string', () => {
      expect(isSafeUrl('')).toBe(false);
    });
  });

  describe('safeParseDate', () => {
    it('parses a valid ISO timestamp by stripping the time portion', () => {
      const result = safeParseDate('2026-03-15T00:00:00Z');
      expect(result).not.toBeNull();
      expect(result?.toString()).toBe('2026-03-15');
    });

    it('parses a date-only string', () => {
      const result = safeParseDate('2026-12-31');
      expect(result?.toString()).toBe('2026-12-31');
    });

    it('returns null for malformed input (no throw)', () => {
      expect(safeParseDate('garbage')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(safeParseDate('')).toBeNull();
    });
  });

  describe('getFieldLabel', () => {
    const makeField = (overrides: Partial<EnrichedField> = {}): EnrichedField => ({
      id: 'date',
      label: 'Submission Date',
      description: '',
      rawValue: null,
      type: 'TIMESTAMP',
      ...overrides,
    });

    it('returns base label for non-timestamp fields', () => {
      expect(getFieldLabel(makeField({ type: 'TEXT', label: 'Title' }))).toBe('Title');
    });

    it('returns base label when timestamp has both start and end', () => {
      const field = makeField({ rawValue: { start_date: '2026-01-01', end_date: '2026-12-31' } });
      expect(getFieldLabel(field)).toBe('Submission Date');
    });

    it('returns startDate translation key when only start is present', () => {
      const field = makeField({ rawValue: { start_date: '2026-01-01', end_date: null } });
      expect(getFieldLabel(field)).toBe('text.externallearning.startDate');
    });

    it('returns endDate translation key when only end is present', () => {
      const field = makeField({ rawValue: { start_date: null, end_date: '2026-12-31' } });
      expect(getFieldLabel(field)).toBe('text.externallearning.endDate');
    });

    it('returns base label when both dates are nullish (incl. string "null")', () => {
      const field = makeField({ rawValue: { start_date: 'null', end_date: '' } });
      expect(getFieldLabel(field)).toBe('Submission Date');
    });

    it('treats the JSON_OBJECT date field like a timestamp (start only)', () => {
      const field = makeField({ type: 'JSON_OBJECT', rawValue: { start_date: '2026-01-01' } });
      expect(getFieldLabel(field)).toBe('text.externallearning.startDate');
    });
  });

  describe('renderFieldValue', () => {
    const makeField = (overrides: Partial<EnrichedField> = {}): EnrichedField => ({
      id: 'title',
      label: 'Title',
      description: '',
      rawValue: null,
      type: 'TEXT',
      ...overrides,
    });

    it('returns dash for empty timestamp', () => {
      expect(
        renderFieldValue(
          makeField({ type: 'TIMESTAMP', rawValue: { start_date: null, end_date: null } }),
          'en-US'
        )
      ).toBe('-');
    });

    it('formats timestamp range when both dates present', () => {
      expect(
        renderFieldValue(
          makeField({
            type: 'TIMESTAMP',
            rawValue: { start_date: '2026-01-01', end_date: '2026-12-31' },
          }),
          'en-US'
        )
      ).toBe('2026-01-01 - 2026-12-31');
    });

    it('formats the JSON_OBJECT date field range like a timestamp', () => {
      expect(
        renderFieldValue(
          makeField({
            id: 'date',
            type: 'JSON_OBJECT',
            rawValue: { start_date: '2026-01-01', end_date: '2026-12-31' },
          }),
          'en-US'
        )
      ).toBe('2026-01-01 - 2026-12-31');
    });

    it('returns score expression when both values present', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'score', rawValue: { achieved_score: 85, max_score: 100 } }),
          'en-US'
        )
      ).toBe('85 text.externallearning.outOf 100');
    });

    it('returns dash when score has nullish values (incl. string "null")', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'score', rawValue: { achieved_score: 'null', max_score: 100 } }),
          'en-US'
        )
      ).toBe('-');
    });

    it('formats duration as timeSpan + translated period label', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: 8, period: 'HOURS' } }),
          'en-US'
        )
      ).toBe('8 text.externallearning.hours');
    });

    it('formats duration with WEEKS period', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: 2, period: 'WEEKS' } }),
          'en-US'
        )
      ).toBe('2 text.externallearning.weeks');
    });

    it('falls back to minutes label for an unknown duration period', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: 2, period: 'DECADES' } }),
          'en-US'
        )
      ).toBe('2 text.externallearning.minutes');
    });

    it('returns dash when duration timeSpan is nullish', () => {
      expect(
        renderFieldValue(
          makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: null, period: 'HOURS' } }),
          'en-US'
        )
      ).toBe('-');
    });

    it('resolves dropdown to localized label for matching option', () => {
      const field = makeField({
        id: 'cf:level',
        type: 'DROPDOWN',
        rawValue: 'beginner',
        options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
      });
      expect(renderFieldValue(field, 'en-US')).toBe('Beginner');
    });

    it('falls back to en_US label when locale option missing', () => {
      const field = makeField({
        id: 'cf:level',
        type: 'DROPDOWN',
        rawValue: 'beginner',
        options: [{ option_id: 'beginner', label: { en_US: 'Beginner' } }],
      });
      expect(renderFieldValue(field, 'fr-FR')).toBe('Beginner');
    });

    it('returns raw value for unrecognised types', () => {
      const field = makeField({ rawValue: 'My Title' });
      expect(renderFieldValue(field, 'en-US')).toBe('My Title');
    });

    it('returns dash when raw value is null', () => {
      const field = makeField({ rawValue: null });
      expect(renderFieldValue(field, 'en-US')).toBe('-');
    });
  });

  describe('buildInitialFormState', () => {
    const makeField = (overrides: Partial<EnrichedField> = {}): EnrichedField => ({
      id: 'title',
      label: 'Title',
      description: '',
      rawValue: null,
      type: 'TEXT',
      ...overrides,
    });

    it('skips fields with null rawValue', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({ id: 'title', rawValue: null }),
      ]);
      expect(formValues).toEqual({});
      expect(dateTypes).toEqual({});
    });

    it('produces both-range when start and end dates are valid', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: '2026-12-31T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('both');
      expect(formValues.date.range.start.toString()).toBe('2026-01-01');
      expect(formValues.date.range.end.toString()).toBe('2026-12-31');
    });

    it('reads the JSON_OBJECT date field into a both-range', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'JSON_OBJECT',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: '2026-12-31T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('both');
      expect(formValues.date.range.start.toString()).toBe('2026-01-01');
      expect(formValues.date.range.end.toString()).toBe('2026-12-31');
    });

    it('produces startDate-only when end is missing', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z', end_date: null },
        }),
      ]);
      expect(dateTypes.date).toBe('startDate');
      expect(formValues.date.startDate.toString()).toBe('2026-01-01');
    });

    it('produces endDate-only when start is missing', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: null, end_date: '2026-06-30T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('endDate');
      expect(formValues.date.endDate.toString()).toBe('2026-06-30');
    });

    it('produces startDate-only when end_date key is absent (new API shape)', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: '2026-01-01T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('startDate');
      expect(formValues.date.startDate.toString()).toBe('2026-01-01');
    });

    it('produces endDate-only when start_date key is absent (new API shape)', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { end_date: '2026-06-30T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('endDate');
      expect(formValues.date.endDate.toString()).toBe('2026-06-30');
    });

    it('survives malformed legacy date strings without throwing', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: 'garbage', end_date: 'also-garbage' },
        }),
      ]);
      // Both parseDate calls fail → field is omitted entirely (no crash, no entry).
      expect(formValues.date).toBeUndefined();
      expect(dateTypes.date).toBeUndefined();
    });

    it('keeps endDate when only start is malformed', () => {
      const { formValues, dateTypes } = buildInitialFormState([
        makeField({
          id: 'date',
          type: 'TIMESTAMP',
          rawValue: { start_date: 'garbage', end_date: '2026-06-30T00:00:00Z' },
        }),
      ]);
      expect(dateTypes.date).toBe('endDate');
      expect(formValues.date.endDate.toString()).toBe('2026-06-30');
    });

    it('converts score values to strings, replacing nullish with empty string', () => {
      const { formValues } = buildInitialFormState([
        makeField({
          id: 'score',
          type: 'NUMBER',
          rawValue: { achieved_score: 85, max_score: null },
        }),
      ]);
      expect(formValues.score).toEqual({ achievedScore: '85', maxScore: '' });
    });

    it('treats the string "null" as nullish in score values', () => {
      const { formValues } = buildInitialFormState([
        makeField({
          id: 'score',
          type: 'NUMBER',
          rawValue: { achieved_score: 'null', max_score: 'null' },
        }),
      ]);
      expect(formValues.score).toEqual({ achievedScore: '', maxScore: '' });
    });

    it('reads duration timeSpan (as string) and period from object value', () => {
      const { formValues } = buildInitialFormState([
        makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: 5, period: 'HOURS' } }),
      ]);
      expect(formValues.duration).toEqual({ timeSpan: '5', period: 'HOURS' });
    });

    it('defaults duration period to MINUTES when missing', () => {
      const { formValues } = buildInitialFormState([
        makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: 5 } }),
      ]);
      expect(formValues.duration.period).toBe('MINUTES');
    });

    it('reads duration with empty timeSpan when nullish', () => {
      const { formValues } = buildInitialFormState([
        makeField({ id: 'duration', type: 'TEXT', rawValue: { timeSpan: null, period: 'DAYS' } }),
      ]);
      expect(formValues.duration).toEqual({ timeSpan: '', period: 'DAYS' });
    });

    it('passes other field values through unchanged', () => {
      const { formValues } = buildInitialFormState([
        makeField({ id: 'title', type: 'TEXT', rawValue: 'My Course' }),
      ]);
      expect(formValues.title).toBe('My Course');
    });
  });

  describe('handleDownload', () => {
    const mockNegativeToast = ToastQueue.negative as jest.MockedFunction<
      typeof ToastQueue.negative
    >;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('shows downloadError toast and skips fetch for non-https URLs', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      await handleDownload('http://example.com/file.pdf', 'file.pdf');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mockNegativeToast).toHaveBeenCalledWith(
        'alm.text.externalLearning.downloadError',
        expect.objectContaining({ timeout: 3000 })
      );
      fetchSpy.mockRestore();
    });

    it('shows downloadError toast on non-ok response', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: false, status: 401 } as any);

      await handleDownload('https://example.com/file.pdf', 'file.pdf');

      expect(mockNegativeToast).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('creates and revokes an object URL on successful fetch', async () => {
      const blob = new Blob(['x'], { type: 'application/pdf' });
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: true, blob: async () => blob } as any);

      // jsdom doesn't implement URL.createObjectURL — stub it.
      const createObjectURL = jest.fn(() => 'blob:test-url');
      const revokeObjectURL = jest.fn();
      // @ts-ignore
      global.URL.createObjectURL = createObjectURL;
      // @ts-ignore
      global.URL.revokeObjectURL = revokeObjectURL;

      await handleDownload('https://example.com/file.pdf', 'file.pdf');

      expect(fetchSpy).toHaveBeenCalledWith('https://example.com/file.pdf');
      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });
});
