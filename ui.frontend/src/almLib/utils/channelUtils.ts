/**
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Shared utility functions for the EVC (Enterprise Video Channels) feature.
 *
 * Presentation helpers (palette, thumbnail SVG, date/duration formatting)
 * are ported from EvcChannelNormalizer.java and must stay in sync with the
 * Java normalizer to ensure consistent server/client rendering.
 */

import { EVCChannel, EVCRecording } from '../models/ChannelModels';

// ── Constants ────────────────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ── Channel palette ──────────────────────────────────────────────────────────

// Palette ported from EvcChannelNormalizer.java (server-side channel card colors).
// Must stay in sync with the Java normalizer to ensure consistent server/client rendering.
// Hex values must stay in sync with --evc-palette-* and --evc-palette-*-title-bg in styles/variables.css
export const EVC_PALETTES = [
  { colorBase: '#1473e6', color: '#1473e6', titleBg: '#0d5bca', titleText: '#ffffff' },
  { colorBase: '#e34850', color: '#e34850', titleBg: '#b82025', titleText: '#ffffff' },
  { colorBase: '#2d9d78', color: '#2d9d78', titleBg: '#1a7a5a', titleText: '#ffffff' },
  { colorBase: '#d2691e', color: '#d2691e', titleBg: '#a84f15', titleText: '#ffffff' },
  { colorBase: '#7b61ff', color: '#7b61ff', titleBg: '#5b45d6', titleText: '#ffffff' },
  { colorBase: '#e68619', color: '#e68619', titleBg: '#b86b12', titleText: '#ffffff' },
  { colorBase: '#1da1f2', color: '#1da1f2', titleBg: '#1580c7', titleText: '#ffffff' },
  { colorBase: '#6e6e6e', color: '#6e6e6e', titleBg: '#4a4a4a', titleText: '#ffffff' },
];

export function computePaletteIndex(channelId: string | number): number {
  const id = typeof channelId === 'string' ? parseInt(channelId, 10) || 0 : channelId;
  return Math.abs(id % EVC_PALETTES.length);
}

// ── Recording thumbnail ──────────────────────────────────────────────────────

// djb2 XOR hash — stable pattern index per recording ID, independent of channel
export function patternIndexForId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 33) ^ id.charCodeAt(i)) >>> 0;
  }
  return h % 8;
}

/**
 * Generates a data-URI SVG thumbnail for a recording card.
 * Uses tiled patterns (stripes, dots, crosshatch, etc.) keyed by patternIndex.
 * Note: these are CSS background-image data URIs, not React components;
 * they are defined here rather than inline_svg.tsx for that reason.
 */
export function computeThumbSvg(color: string, patternIndex: number): string {
  const patterns: ((c: string) => string)[] = [
    // 0 — diagonal stripes
    c =>
      `<rect width="24" height="24" fill="${c}"/><path d="M0 24L24 0M-6 6L6-6M18 30L30 18" stroke="rgba(255,255,255,0.13)" stroke-width="2.5"/>`,
    // 1 — dots
    c =>
      `<rect width="20" height="20" fill="${c}"/><circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.18)"/>`,
    // 2 — crosshatch
    c =>
      `<rect width="20" height="20" fill="${c}"/><path d="M0 10H20M10 0V20" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>`,
    // 3 — chevron (two rows fill the 24x24 tile)
    c =>
      `<rect width="24" height="24" fill="${c}"/><polyline points="0,6 12,0 24,6" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><polyline points="0,18 12,12 24,18" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>`,
    // 4 — diamonds
    c =>
      `<rect width="24" height="24" fill="${c}"/><polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>`,
    // 5 — horizontal stripes (two bands fill the 20x20 tile)
    c =>
      `<rect width="20" height="20" fill="${c}"/><rect y="5" width="20" height="4" fill="rgba(255,255,255,0.15)"/><rect y="15" width="20" height="4" fill="rgba(255,255,255,0.15)"/>`,
    // 6 — wavy lines (one half-wave per 20x20 tile, tiles join seamlessly)
    c =>
      `<rect width="20" height="20" fill="${c}"/><path d="M0 10 Q5 5 10 10 Q15 15 20 10" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>`,
    // 7 — grid dots
    c =>
      `<rect width="16" height="16" fill="${c}"/><circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.18)"/><circle cx="8" cy="0" r="1.5" fill="rgba(255,255,255,0.18)"/><circle cx="0" cy="8" r="1.5" fill="rgba(255,255,255,0.18)"/><circle cx="8" cy="8" r="1.5" fill="rgba(255,255,255,0.18)"/>`,
  ];

  const tileSizes = [24, 20, 20, 24, 24, 20, 20, 16];
  const idx = ((patternIndex % patterns.length) + patterns.length) % patterns.length;
  const tileSize = tileSizes[idx];
  const inner = patterns[idx](color);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="90"><defs><pattern id="p" x="0" y="0" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">${inner}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ── Formatting ────────────────────────────────────────────────────────────────

/** Converts epoch milliseconds to a locale date string (e.g. "Jan 5, 2024"). */
export function epochMsToDateString(ms: number | null | undefined): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Formats an ISO/RFC date string for display in a comment thread. */
export function formatCommentDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/** Converts a duration in seconds to a human-readable string (e.g. "1:23:45" or "3:05"). */
export function secondsToDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

/**
 * Formats a stat count for compact display.
 * Counts >= 1000 are rendered as e.g. "1.2K".
 */
export function formatCount(n: number): string {
  if (n >= 1000) return (Math.round(n / 100) / 10).toFixed(1) + 'K';
  return String(n);
}

/** Extracts up to two initials from a speaker's display name. Falls back to "U". */
export function computeSpeakerInitials(speaker: string): string {
  if (!speaker || !speaker.trim()) return 'U';
  const parts = speaker.trim().split(/\s+/);
  return (
    parts
      .map(p => p.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U'
  );
}

// ── Recording sorting & newness ──────────────────────────────────────────────

/**
 * Preferred sort date for a recording.
 * Uses original publish date; falls back to channel-add date so that
 * within-channel ordering matches authoring order, not indexing order.
 */
function effectiveDateMs(r: EVCRecording): number {
  return r.publishedDateMs || r.createdDateMs || 0;
}

/** Sorts recordings newest-first; recordings with no date are placed last. */
export function sortByDateDesc(recs: EVCRecording[]): EVCRecording[] {
  return [...recs].sort((a, b) => effectiveDateMs(b) - effectiveDateMs(a));
}

/**
 * Marks recordings published or added within the last 7 days as `isNew`,
 * then sorts newest-first.
 */
function applyNewnessAndSort(recs: EVCRecording[]): EVCRecording[] {
  const now = Date.now();
  const sorted = sortByDateDesc(recs);
  return sorted.map(r => {
    const refMs = r.publishedDateMs || r.createdDateMs;
    return { ...r, isNew: !!refMs && now - refMs < SEVEN_DAYS_MS };
  });
}

/** Applies newness flags and date-sorts all recording lists on each channel. */
export function reshapeChannels(list: EVCChannel[]): EVCChannel[] {
  return (list || []).map(ch => ({
    ...ch,
    recordings: applyNewnessAndSort(ch.recordings || []),
    newRecordings: applyNewnessAndSort(ch.newRecordings || []),
    deletedRecordings: applyNewnessAndSort(ch.deletedRecordings || []),
  }));
}

// ── Search ────────────────────────────────────────────────────────────────────

/**
 * Fuzzy-match: returns true if every character in `query` appears in `text`
 * in order (case-insensitive). An exact substring match is also accepted.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  const normalizedText = (text || '').toLowerCase();
  if (normalizedText.indexOf(normalizedQuery) !== -1) return true;
  let queryIdx = 0;
  for (
    let textIdx = 0;
    textIdx < normalizedText.length && queryIdx < normalizedQuery.length;
    textIdx++
  ) {
    if (normalizedText[textIdx] === normalizedQuery[queryIdx]) queryIdx++;
  }
  return queryIdx === normalizedQuery.length;
}
