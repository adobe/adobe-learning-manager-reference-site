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
import {
  buildRecordingLaunchUrl,
  getVcProviderFromLocation,
  isALMVC,
  resolveVcConnectorId,
} from '@almLib/utils/almvc-recording-utils';

describe('almvc-recording-utils', () => {
  describe('isALMVC', () => {
    it('returns true for the ALM VC connector ID', () => {
      expect(isALMVC('20025')).toBe(true);
    });

    it('returns false for a different connector ID', () => {
      expect(isALMVC('12345')).toBe(false);
    });

    it('coerces numeric connector ID to string before comparing', () => {
      expect(isALMVC(20025 as any)).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(isALMVC('')).toBe(false);
    });
  });

  describe('getVcProviderFromLocation', () => {
    it('extracts vcProvider from a full URL', () => {
      expect(
        getVcProviderFromLocation('https://example.com/session?vcProvider=20025&other=x')
      ).toBe('20025');
    });

    it('returns undefined when vcProvider is absent', () => {
      expect(getVcProviderFromLocation('https://example.com/session?other=x')).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
      expect(getVcProviderFromLocation('')).toBeUndefined();
    });

    it('returns undefined for a null-ish value', () => {
      expect(getVcProviderFromLocation(null as any)).toBeUndefined();
    });

    it('handles a relative URL string that is not parseable by URL constructor', () => {
      expect(getVcProviderFromLocation('/session?vcProvider=abc')).toBe('abc');
    });

    it('decodes a percent-encoded vcProvider value', () => {
      expect(getVcProviderFromLocation('https://example.com/?vcProvider=value%2Bwith%2Bplus')).toBe(
        'value+with+plus'
      );
    });
  });

  describe('resolveVcConnectorId', () => {
    it('returns vcConnectorId when it is provided', () => {
      expect(resolveVcConnectorId('20025', 'https://example.com/?vcProvider=99999')).toBe('20025');
    });

    it('falls back to vcProvider from location when vcConnectorId is undefined', () => {
      expect(resolveVcConnectorId(undefined, 'https://example.com/?vcProvider=20025')).toBe(
        '20025'
      );
    });

    it('falls back to vcProvider from location when vcConnectorId is empty string', () => {
      expect(resolveVcConnectorId('', 'https://example.com/?vcProvider=20025')).toBe('20025');
    });

    it('returns undefined when both vcConnectorId and location lack a provider', () => {
      expect(resolveVcConnectorId(undefined, 'https://example.com/')).toBeUndefined();
    });
  });

  describe('buildRecordingLaunchUrl', () => {
    it('builds the correct launch URL', () => {
      const result = buildRecordingLaunchUrl(
        'https://recording.example.com/rec123',
        '20025',
        'https://alm.example.com'
      );
      expect(result).toBe(
        'https://alm.example.com/ctr/app/launchrecording?recordingUrl=https%3A%2F%2Frecording.example.com%2Frec123&vcProvider=20025'
      );
    });

    it('strips a trailing slash from serverApiEndpoint', () => {
      const result = buildRecordingLaunchUrl(
        'https://recording.example.com/rec123',
        '20025',
        'https://alm.example.com/'
      );
      expect(result).toBe(
        'https://alm.example.com/ctr/app/launchrecording?recordingUrl=https%3A%2F%2Frecording.example.com%2Frec123&vcProvider=20025'
      );
    });

    it('percent-encodes special characters in the recording URL', () => {
      const result = buildRecordingLaunchUrl(
        'https://example.com/rec?foo=bar&baz=qux',
        '20025',
        'https://alm.example.com'
      );
      expect(result).toContain(encodeURIComponent('https://example.com/rec?foo=bar&baz=qux'));
    });

    it('returns empty string as-is when recordingUrl is empty', () => {
      expect(buildRecordingLaunchUrl('', '20025', 'https://alm.example.com')).toBe('');
    });

    it('returns null as-is when recordingUrl is null', () => {
      expect(buildRecordingLaunchUrl(null as any, '20025', 'https://alm.example.com')).toBeNull();
    });
  });
});
