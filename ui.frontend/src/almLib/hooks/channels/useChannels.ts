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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GetTranslation, GetTranslationsReplaced } from '../../utils/translationService';
import { EVCChannel, EVCRecording } from '../../models/ChannelModels';
import {
  loadChannels,
  setChannelsTab,
  setChannelsSearch,
  setChannelsLoading,
  setChannelsError,
  updateChannelSubscription,
  setLikedChannel,
  setViewedPosts,
} from '../../store/actions/channels';
import { State } from '../../store/state';
import {
  fetchChannels as fetchChannelsApi,
  toggleSubscription as toggleSubscriptionApi,
  fetchLikedPostIds,
  fetchViewedPosts,
} from './useChannelsApi';
import { sortByDateDesc, reshapeChannels, fuzzyMatch } from '../../utils/channelUtils';
import { CHANNEL_TAB, ChannelTab } from '../../utils/constants';
import { getQueryParamsFromUrl, getWindowObject } from '../../utils/global';

// Tabs that can be deep-linked via ?tab= on the Channels list view. 'new' is derived
// state, not directly addressable, so it is intentionally excluded.
const DEEP_LINKABLE_TABS: ReadonlySet<string> = new Set([
  CHANNEL_TAB.ALL,
  CHANNEL_TAB.SUBSCRIBED,
  CHANNEL_TAB.LIKED,
]);

// Read a valid deep-linked tab from the current URL (?tab=), or null if absent/invalid.
// The dashboard runs under a HashRouter, so its route query lives in the hash
// (e.g. #/channels?tab=liked) and getQueryParamsFromUrl (which reads location.search)
// returns nothing; the AEM portal serves real search params. Check the search params
// first, then fall back to the hash query, so the deep link resolves in either context.
const getDeepLinkedTab = (): ChannelTab | null => {
  let tab: string | undefined = getQueryParamsFromUrl().tab;
  if (!tab) {
    const hash = getWindowObject().location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      tab = new URLSearchParams(hash.slice(queryIndex + 1)).get('tab') || undefined;
    }
  }
  return tab && DEEP_LINKABLE_TABS.has(tab) ? (tab as ChannelTab) : null;
};

export const useChannels = () => {
  const dispatch = useDispatch();
  const { channels, likedChannel, selectedTab, searchQuery, isLoading, error, viewedByPostId } =
    useSelector((state: State) => state.channels);

  const initializedRef = useRef(false);

  useEffect(() => {
    refreshChannels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build liked pseudo-channel from likedPostIds ────────────────────────────
  const buildLikedChannel = useCallback(
    (allChannels: EVCChannel[], likedPostIds: Set<string>) => {
      if (likedPostIds.size === 0) {
        dispatch(setLikedChannel(null));
        return;
      }
      const seenPostIds = new Set<string>();
      const likedRecs: EVCRecording[] = [];
      for (const ch of allChannels) {
        for (const rec of ch.recordings || []) {
          const pid = String(rec.postId);
          if (rec.postId && likedPostIds.has(pid) && !seenPostIds.has(pid)) {
            seenPostIds.add(pid);
            likedRecs.push(rec);
          }
        }
      }
      dispatch(
        setLikedChannel(
          likedRecs.length > 0
            ? {
                id: 'liked',
                name: GetTranslation('evc.learner.liked.channel.name'),
                description: GetTranslation('evc.learner.strip.liked'),
                boardId: null,
                isSubscribed: false,
                enabled: true,
                state: 'PSEUDO',
                recordingCount: likedRecs.length,
                paletteIndex: 0,
                colorBase: 'var(--prime-channels-liked-color)',
                newCount: 0,
                deletedCount: 0,
                recordings: sortByDateDesc(likedRecs),
                newRecordings: [],
                deletedRecordings: [],
                isPseudo: true,
              }
            : null
        )
      );
    },
    [dispatch]
  );

  const refreshChannels = useCallback(async () => {
    dispatch(setChannelsLoading(true));
    try {
      const [result, likedPostIds, viewed] = await Promise.all([
        fetchChannelsApi(),
        fetchLikedPostIds(),
        fetchViewedPosts(),
      ]);
      const reshaped = reshapeChannels(result.channels);
      dispatch(loadChannels(reshaped));
      dispatch(setViewedPosts(viewed));
      buildLikedChannel(reshaped, likedPostIds);
      // Select tab only on first load; subsequent refreshes preserve user's choice.
      // A deep-linked ?tab= wins over the auto-select so the correct tab is set from
      // the initial render — otherwise the auto-select default paints first and the
      // consumer has to re-assert the deep link afterward, causing a visible flicker.
      if (!initializedRef.current) {
        initializedRef.current = true;
        const deepLinkedTab = getDeepLinkedTab();
        if (deepLinkedTab) {
          dispatch(setChannelsTab(deepLinkedTab));
        } else {
          const hasSubscribed = reshaped.some((ch: EVCChannel) => ch.isSubscribed);
          dispatch(setChannelsTab(hasSubscribed ? CHANNEL_TAB.SUBSCRIBED : CHANNEL_TAB.ALL));
        }
      }
    } catch (e: any) {
      dispatch(setChannelsError(e.message || 'Failed to load channels'));
    }
  }, [dispatch, buildLikedChannel]);

  // Re-fetch liked post IDs and rebuild the Liked strip (called after like/unlike)
  const refreshLiked = useCallback(async () => {
    try {
      const likedPostIds = await fetchLikedPostIds();
      buildLikedChannel(channels || [], likedPostIds);
    } catch {
      // non-fatal
    }
  }, [channels, buildLikedChannel]);

  // Re-fetch viewed timestamps (called after a view is tracked)
  const refreshViewed = useCallback(async () => {
    try {
      const viewed = await fetchViewedPosts();
      dispatch(setViewedPosts(viewed));
    } catch {
      // non-fatal
    }
  }, [dispatch]);

  // ── Computed ────────────────────────────────────────────────────────────────

  const displayChannels: EVCChannel[] = useMemo(() => {
    let filtered = channels || [];
    if (searchQuery) {
      filtered = filtered.filter((ch: EVCChannel) => fuzzyMatch(searchQuery, ch.name || ''));
    }
    if (selectedTab === CHANNEL_TAB.SUBSCRIBED) {
      return filtered.filter((ch: EVCChannel) => ch.isSubscribed);
    }
    if (selectedTab === CHANNEL_TAB.NEW) {
      return filtered.filter(
        (ch: EVCChannel) =>
          ch.isSubscribed &&
          ((ch.newRecordings || []).length > 0 || (ch.deletedRecordings || []).length > 0)
      );
    }
    if (selectedTab === CHANNEL_TAB.LIKED) {
      // likedChannel is a pseudo-channel rendered separately from state;
      // the regular channel grid is intentionally empty on this tab.
      return [];
    }
    return filtered.filter((ch: EVCChannel) => (ch.recordings || []).length > 0);
  }, [channels, selectedTab, searchQuery]);

  const subscribedCount = useMemo(
    () => (channels || []).filter((ch: EVCChannel) => ch.isSubscribed).length,
    [channels]
  );

  const newCount = useMemo(
    () =>
      (channels || []).filter(
        (ch: EVCChannel) =>
          ch.isSubscribed &&
          ((ch.newRecordings || []).length > 0 || (ch.deletedRecordings || []).length > 0)
      ).length,
    [channels]
  );

  // ── Actions ─────────────────────────────────────────────────────────────────

  const setTab = useCallback(
    (tab: (typeof CHANNEL_TAB)[keyof typeof CHANNEL_TAB]) => {
      dispatch(setChannelsTab(tab));
    },
    [dispatch]
  );

  const setSearch = useCallback(
    (query: string) => {
      dispatch(setChannelsSearch(query));
    },
    [dispatch]
  );

  const toggleSubscription = useCallback(
    async (channelId: string, subscribe: boolean) => {
      try {
        await toggleSubscriptionApi(channelId, subscribe);
        dispatch(updateChannelSubscription(channelId, subscribe));
      } catch (e: any) {
        throw e;
      }
    },
    [dispatch]
  );

  return {
    channels,
    likedChannel,
    displayChannels,
    subscribedCount,
    newCount,
    selectedTab,
    searchQuery,
    isLoading,
    error,
    viewedByPostId,
    setTab,
    setSearch,
    toggleSubscription,
    refreshChannels,
    refreshLiked,
    refreshViewed,
  };
};
