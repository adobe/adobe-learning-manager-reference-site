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

jest.mock('@utils/global', () => ({
  getALMConfig: jest.fn(() => ({ locale: 'en-US' })),
}));

import {
  DEFAULT_DURATION_PERIOD,
  DURATION_PERIODS,
  getDurationPeriodLabelKey,
  isImageAttachment,
  isPdfAttachment,
  isPreviewableAttachment,
} from '@components/ExternalLearning/externalLearningConstants';

describe('externalLearningConstants – attachment preview helpers', () => {
  describe('isImageAttachment', () => {
    it.each(['photo.png', 'PHOTO.PNG', 'a.jpg', 'a.jpeg', 'a.gif', 'a.webp', 'a.svg', 'a.bmp'])(
      'returns true for image file %s',
      name => expect(isImageAttachment(name)).toBe(true)
    );

    it.each(['report.pdf', 'notes.doc', 'notes.docx', 'archive.zip', 'noextension'])(
      'returns false for non-image file %s',
      name => expect(isImageAttachment(name)).toBe(false)
    );
  });

  describe('isPdfAttachment', () => {
    it('returns true for .pdf (case-insensitive)', () => {
      expect(isPdfAttachment('report.pdf')).toBe(true);
      expect(isPdfAttachment('REPORT.PDF')).toBe(true);
    });

    it('returns false for non-pdf files', () => {
      expect(isPdfAttachment('photo.png')).toBe(false);
      expect(isPdfAttachment('notes.docx')).toBe(false);
    });
  });

  describe('isPreviewableAttachment', () => {
    it.each(['photo.png', 'photo.jpeg', 'report.pdf'])('returns true for previewable %s', name =>
      expect(isPreviewableAttachment(name)).toBe(true)
    );

    it.each(['notes.doc', 'notes.docx', 'data.xlsx', 'archive.zip', ''])(
      'returns false for non-previewable %s (doc/docx are download-only)',
      name => expect(isPreviewableAttachment(name)).toBe(false)
    );
  });
});

describe('externalLearningConstants – duration periods', () => {
  describe('DURATION_PERIODS', () => {
    it('exposes the six supported periods in order, with uppercase enum keys', () => {
      expect(DURATION_PERIODS.map(p => p.key)).toEqual([
        'MINUTES',
        'HOURS',
        'DAYS',
        'WEEKS',
        'MONTHS',
        'YEARS',
      ]);
    });

    it('maps every period to its i18n label key', () => {
      expect(DURATION_PERIODS).toEqual(
        expect.arrayContaining([{ key: 'WEEKS', labelKey: 'text.externallearning.weeks' }])
      );
      DURATION_PERIODS.forEach(p =>
        expect(p.labelKey).toBe(`text.externallearning.${p.key.toLowerCase()}`)
      );
    });
  });

  describe('getDurationPeriodLabelKey', () => {
    it.each([
      ['MINUTES', 'text.externallearning.minutes'],
      ['HOURS', 'text.externallearning.hours'],
      ['DAYS', 'text.externallearning.days'],
      ['WEEKS', 'text.externallearning.weeks'],
      ['MONTHS', 'text.externallearning.months'],
      ['YEARS', 'text.externallearning.years'],
    ])('returns the label key for %s', (period, expected) => {
      expect(getDurationPeriodLabelKey(period)).toBe(expected);
    });

    it('falls back to the default period label for an unknown period', () => {
      expect(getDurationPeriodLabelKey('DECADES')).toBe(
        `text.externallearning.${DEFAULT_DURATION_PERIOD.toLowerCase()}`
      );
    });
  });
});
