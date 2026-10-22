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

export interface StructuredLocationRow {
  id?: string;
  country?: string;
  state?: string | null;
  city?: string;
}

/**
 * Default rendering for the catalog structured-location filter list:
 *   "Bengaluru, Karnataka, IN"   (all three present)
 *   "Mumbai, IN"                 (no state)
 * Most-specific first (city) → least-specific last (country) so the city the learner
 * scans for anchors the start of each row. Mirrors the Ember helper of the same name.
 */
export function formatLocationCompound(row?: StructuredLocationRow | null): string {
  if (!row) {
    return '';
  }
  return [row.city, row.state, row.country]
    .map(part => (part == null ? '' : String(part).trim()))
    .filter(Boolean)
    .join(', ');
}

/**
 * Geography line for a session/room location, shared across learner surfaces.
 * Renders least-specific → most-specific ("Germany > Bavaria > Munich") to match
 * the author Preview template.
 *
 *  - flag OFF                     → legacy `city` string only (or null)
 *  - flag ON, discrete fields set → join non-empty [country, state, city] with " > "
 *  - flag ON, only `city`         → returned as-is (covers the BL path where `city`
 *                                    is already a collapsed breadcrumb, and the
 *                                    partial region-only fallback)
 *  - nothing present              → null (caller hides the row)
 */
export function formatStructuredGeography(
  room: { countryName?: string; stateName?: string; city?: string } | null | undefined,
  structuredEnabled: boolean
): string | null {
  if (!room) {
    return null;
  }
  if (!structuredEnabled) {
    const city = room.city == null ? '' : String(room.city).trim();
    return city || null;
  }
  const parts = [room.countryName, room.stateName, room.city]
    .map(part => (part == null ? '' : String(part).trim()))
    .filter(Boolean);
  return parts.length ? parts.join(' > ') : null;
}
