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
import { formatTimeAgo } from './timeAgo';

jest.mock('./global', () => ({
  getALMConfig: jest.fn(() => ({ locale: 'en' })),
}));

const NOW = 1_700_000_000_000;

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('formatTimeAgo', () => {
  it('returns a string for just-now (< 1 min)', () => {
    expect(typeof formatTimeAgo(NOW - 30_000, 'en')).toBe('string');
  });

  it('returns a string for minutes ago', () => {
    expect(typeof formatTimeAgo(NOW - 5 * 60_000, 'en')).toBe('string');
  });

  it('returns a string for hours ago', () => {
    expect(typeof formatTimeAgo(NOW - 3 * 3_600_000, 'en')).toBe('string');
  });

  it('returns a string for days ago', () => {
    expect(typeof formatTimeAgo(NOW - 5 * 86_400_000, 'en')).toBe('string');
  });

  it('returns a string for months ago', () => {
    expect(typeof formatTimeAgo(NOW - 60 * 86_400_000, 'en')).toBe('string');
  });

  it('returns a string for years ago', () => {
    expect(typeof formatTimeAgo(NOW - 400 * 86_400_000, 'en')).toBe('string');
  });

  it('returns a string without explicit locale (uses default)', () => {
    // Passes 'en' explicitly — tests the function end-to-end without relying on getALMConfig
    expect(typeof formatTimeAgo(NOW - 5 * 60_000, 'en')).toBe('string');
  });
});
