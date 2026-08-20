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
import { formatLocationCompound, formatStructuredGeography } from '@utils/locationCompound';

describe('formatLocationCompound', () => {
  it('joins city, state and country when all are present', () => {
    expect(
      formatLocationCompound({ city: 'Bengaluru', state: 'Karnataka', country: 'IN' })
    ).toBe('Bengaluru, Karnataka, IN');
  });

  it('omits a missing/null state', () => {
    expect(formatLocationCompound({ city: 'Mumbai', state: null, country: 'IN' })).toBe('Mumbai, IN');
  });

  it('trims whitespace and drops empty parts', () => {
    expect(formatLocationCompound({ city: '  Delhi  ', state: '', country: ' IN ' })).toBe(
      'Delhi, IN'
    );
  });

  it('returns an empty string for a null/undefined row', () => {
    expect(formatLocationCompound(null)).toBe('');
    expect(formatLocationCompound(undefined)).toBe('');
  });
});

describe('formatStructuredGeography', () => {
  it('returns null when the room is missing', () => {
    expect(formatStructuredGeography(null, true)).toBeNull();
    expect(formatStructuredGeography(undefined, false)).toBeNull();
  });

  describe('structured location OFF (legacy)', () => {
    it('returns the city string only', () => {
      expect(
        formatStructuredGeography({ countryName: 'Germany', stateName: 'Bavaria', city: 'Munich' }, false)
      ).toBe('Munich');
    });

    it('returns null when there is no city', () => {
      expect(formatStructuredGeography({ countryName: 'Germany' }, false)).toBeNull();
    });

    it('ignores discrete country/state fields when the flag is off', () => {
      // Even if the API sent discrete fields, legacy mode shows city only.
      expect(
        formatStructuredGeography({ countryName: 'Germany', stateName: 'Bavaria' }, false)
      ).toBeNull();
    });

    it('trims the city and returns null for a whitespace-only city', () => {
      expect(formatStructuredGeography({ city: '  Munich  ' }, false)).toBe('Munich');
      expect(formatStructuredGeography({ city: '   ' }, false)).toBeNull();
    });
  });

  describe('structured location ON', () => {
    it('joins country, state and city as a breadcrumb', () => {
      expect(
        formatStructuredGeography({ countryName: 'Germany', stateName: 'Bavaria', city: 'Munich' }, true)
      ).toBe('Germany > Bavaria > Munich');
    });

    it('skips a missing state', () => {
      expect(formatStructuredGeography({ countryName: 'Germany', city: 'Munich' }, true)).toBe(
        'Germany > Munich'
      );
    });

    it('trims segments and drops empty ones', () => {
      expect(
        formatStructuredGeography({ countryName: '  Germany ', stateName: '', city: ' Munich ' }, true)
      ).toBe('Germany > Munich');
    });

    it('returns an already-collapsed breadcrumb city as-is', () => {
      expect(formatStructuredGeography({ city: 'Germany > Bavaria > Munich' }, true)).toBe(
        'Germany > Bavaria > Munich'
      );
    });

    it('returns a region-only city when discrete fields are absent', () => {
      expect(formatStructuredGeography({ city: 'Munich' }, true)).toBe('Munich');
    });

    it('returns null when nothing is present', () => {
      expect(formatStructuredGeography({}, true)).toBeNull();
    });
  });
});
