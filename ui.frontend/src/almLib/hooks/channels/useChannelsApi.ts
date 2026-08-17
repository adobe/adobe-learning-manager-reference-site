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
// Channels is an EVC feature exclusive to the Prime ('aem-sites') backend.
// The /primeapi/v2/channels* endpoints do not exist in Commerce ('aem-commerce')
// or ES ('aem-es') deployments, so this module intentionally calls RestAdapter
// directly rather than routing through the three-adapter APIService pattern.
//
// All exported functions guard on usageType and return safe empty values for
// non-Prime modes, preventing silent failures if the component tree ever mounts
// in the wrong context.
import { RestAdapter } from '../../utils/restAdapter';
import { getALMConfig } from '../../utils/global';
import { EVCChannel, EVCRecording } from '../../models/ChannelModels';
import {
  EVC_PALETTES,
  computePaletteIndex,
  patternIndexForId,
  computeThumbSvg,
  epochMsToDateString,
  secondsToDuration,
  computeSpeakerInitials,
} from '../../utils/channelUtils';
import { EVC_ACTIVITY_TYPE } from '../../utils/constants';

const getPrimeApiURL = () => getALMConfig().primeApiURL;
const isPrimeDeployment = () => getALMConfig().usageType === 'aem-sites';

export interface ChannelsApiResponse {
  channels: EVCChannel[];
}

/**
 * Fetch all channels with recordings from /primeapi/v2/channels.
 * The backend aggregates EVC channels + activity + recordings and returns JSON:API.
 */
export async function fetchChannels(): Promise<ChannelsApiResponse> {
  if (!isPrimeDeployment()) return { channels: [] };
  const response = await RestAdapter.get({
    url: `${getPrimeApiURL()}channels`,
  });

  const parsed = typeof response === 'string' ? JSON.parse(response) : response;
  return buildChannelViewModel(parsed);
}

/**
 * Subscribe or unsubscribe from a channel.
 */
export async function toggleSubscription(channelId: string, subscribe: boolean): Promise<void> {
  if (!isPrimeDeployment()) return;
  await RestAdapter.ajax({
    url: `${getPrimeApiURL()}channels/${channelId}/subscription`,
    method: subscribe ? 'POST' : 'DELETE',
  });
}

/**
 * Fetch the set of social post IDs the current user has liked (upvoted).
 * Queries entity_action table — same data as the ❤ like button.
 * Used to build the "Liked Videos" pseudo-strip.
 */
export async function fetchLikedPostIds(): Promise<Set<string>> {
  if (!isPrimeDeployment()) return new Set<string>();
  try {
    const response = await RestAdapter.get({
      url: `${getPrimeApiURL()}channels/liked`,
    });
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    return new Set<string>((parsed.meta?.likedPostIds || []).map(String));
  } catch {
    return new Set<string>();
  }
}

/**
 * Fetch a map of postId → viewedAt epoch ms for recordings the user has watched.
 * Queries entity_action table for VIEW actions.
 * Used to render "Watched N days ago" badges on recording cards.
 */
export async function fetchViewedPosts(): Promise<Record<string, number>> {
  if (!isPrimeDeployment()) return {};
  try {
    const response = await RestAdapter.get({
      url: `${getPrimeApiURL()}channels/viewed`,
    });
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
    const result: Record<string, number> = {};
    for (const item of parsed.meta?.viewedPosts || []) {
      if (item && item.postId != null && item.viewedAtMs != null) {
        result[String(item.postId)] = Number(item.viewedAtMs);
      }
    }
    return result;
  } catch {
    return {};
  }
}

// ── Transform JSON:API response to channel view model ────────────────────────

function buildChannelViewModel(jsonApiResponse: any): ChannelsApiResponse {
  const dataItems = jsonApiResponse.data || [];
  const includedItems = jsonApiResponse.included || [];

  // Separate buckets per channel
  const recordingsByChannelId: Record<string, EVCRecording[]> = {};
  const newRecordingsByChannelId: Record<string, EVCRecording[]> = {};
  const deletedRecordingsByChannelId: Record<string, EVCRecording[]> = {};

  for (const item of includedItems) {
    if (item.type === 'channelRecording') {
      const attrs = item.attributes || {};
      const channelId: number = attrs.channelId || 0;
      const paletteIndex = computePaletteIndex(channelId);
      const palette = EVC_PALETTES[paletteIndex];
      const publishedDateMs: number | null = attrs.publishedDateMs || null;
      const createdDateMs: number | null = attrs.createdDateMs || null;
      const durationSeconds: number | null = attrs.durationSeconds || null;
      const speaker: string = attrs.speaker || '';
      const rec: EVCRecording = {
        id: item.id,
        title: attrs.title || '',
        speaker,
        date: epochMsToDateString(publishedDateMs || createdDateMs),
        tag: attrs.tag || '',
        duration: secondsToDuration(durationSeconds),
        durationSeconds,
        url: attrs.url || '',
        sourceKey: attrs.sourceKey || '',
        postId: attrs.postId || '',
        recordingId: attrs.recordingId || null,
        status: attrs.status || 'ACTIVE',
        isDeleted: attrs.isDeleted || false,
        isNew: attrs.isNew || false,
        publishedDateMs,
        createdDateMs,
        activityType: attrs.activityType || 'ACTIVE',
        channelId,
        channelName: attrs.channelName || '',
        boardId: attrs.boardId || null,
        thumbUrl: computeThumbSvg(palette.color, patternIndexForId(item.id)),
        color: `var(--evc-palette-${paletteIndex})`,
        titleBg: `var(--evc-palette-${paletteIndex}-title-bg)`,
        titleText: 'var(--evc-palette-title-text)',
        dateTxt: '',
        badgeColor: '',
        speakerInitials: computeSpeakerInitials(speaker),
      };

      const chId = String(rec.channelId);
      const actType = rec.activityType;

      // Skip RECENTLY_ADDED items — the "Recently Added" strip was removed.
      // Newness is now computed client-side from createdDateMs.
      if (actType === EVC_ACTIVITY_TYPE.RECENTLY_ADDED) {
        continue;
      }

      if (actType === EVC_ACTIVITY_TYPE.DELETED) {
        if (!deletedRecordingsByChannelId[chId]) deletedRecordingsByChannelId[chId] = [];
        deletedRecordingsByChannelId[chId].push(rec);
      } else if (actType === EVC_ACTIVITY_TYPE.NEW) {
        if (!newRecordingsByChannelId[chId]) newRecordingsByChannelId[chId] = [];
        newRecordingsByChannelId[chId].push(rec);
      } else {
        if (!recordingsByChannelId[chId]) recordingsByChannelId[chId] = [];
        recordingsByChannelId[chId].push(rec);
      }
    }
  }

  const channels: EVCChannel[] = [];

  for (const item of dataItems) {
    const attrs = item.attributes || {};
    const chId = item.id;

    // Ignore PSEUDO (Recently Added) channels — feature removed
    if (attrs.state === 'PSEUDO') continue;

    const paletteIndex = computePaletteIndex(chId);
    const palette = EVC_PALETTES[paletteIndex];
    const adminColor = attrs.color && attrs.color.trim() ? attrs.color.trim() : null;

    channels.push({
      id: chId,
      name: attrs.name || '',
      description: attrs.description || '',
      boardId: attrs.boardId || null,
      isSubscribed: attrs.isSubscribed || false,
      enabled: attrs.enabled || false,
      state: attrs.state || '',
      recordingCount: attrs.recordingCount || 0,
      paletteIndex,
      colorBase: adminColor || `var(--evc-palette-${paletteIndex})`,
      newCount: attrs.newCount || 0,
      deletedCount: attrs.deletedCount || 0,
      recordings: recordingsByChannelId[chId] || [],
      newRecordings: newRecordingsByChannelId[chId] || [],
      deletedRecordings: deletedRecordingsByChannelId[chId] || [],
    });
  }

  // Backfill recording tile colors AND the thumbnail pattern from the channel's
  // admin-set color. Recordings are built before channels, so titleBg/color/
  // thumbUrl are palette-derived at that point. Override them here when the
  // channel has an explicit hex color so every view (strip, grid, detail hero)
  // renders the admin color instead of the --evc-palette fallback.
  for (const channel of channels) {
    const hexColor = channel.colorBase.startsWith('#') ? channel.colorBase : null;
    if (!hexColor) continue;
    for (const rec of [
      ...channel.recordings,
      ...channel.newRecordings,
      ...channel.deletedRecordings,
    ]) {
      rec.titleBg = hexColor;
      rec.color = hexColor;
      rec.thumbUrl = computeThumbSvg(hexColor, patternIndexForId(rec.id));
    }
  }

  return { channels };
}
