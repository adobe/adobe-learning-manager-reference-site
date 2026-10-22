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
import { useState, useEffect, useCallback, useRef } from 'react';
import { RestAdapter } from '../../utils/restAdapter';
import { getALMConfig } from '../../utils/global';

export interface PostStats {
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  postId: string | null;
}

/**
 * Module-level cache — survives hover-card unmount/remount cycles within the session.
 * Key: `${channelId}::${sourceKey || postId}` (unique per recording).
 */
const statsCache = new Map<string, PostStats>();

function makeCacheKey(channelId: string, sourceKey: string, postId: string): string {
  return `${channelId}::${sourceKey || postId}`;
}

/**
 * Fetches and manages like/stat state for a single EVC recording post.
 * Backed by a module-level cache so toggled state is preserved across
 * hover-card open/close cycles without re-fetching from the server.
 */
export function useRecordingSocial(
  channelId: string,
  boardId: number | null,
  postId: string,
  sourceKey: string,
  enabled: boolean = true,
  recordingId?: string
) {
  // Include recordingId (or fallback combo) to prevent cache collisions between
  // recordings that both have empty sourceKey and empty postId within the same channel.
  const cacheKey = recordingId
    ? `${channelId}::rec::${recordingId}`
    : makeCacheKey(channelId, sourceKey, postId);

  // Initialise from cache immediately so re-opens show correct state without a flash
  const [stats, setStatsRaw] = useState<PostStats | null>(() => statsCache.get(cacheKey) ?? null);
  const [isLiking, setIsLiking] = useState(false);

  // Wrapper that always keeps the module cache in sync
  const setStats = useCallback(
    (updater: PostStats | null | ((prev: PostStats | null) => PostStats | null)) => {
      setStatsRaw(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (next != null) {
          statsCache.set(cacheKey, next);
        }
        return next;
      });
    },
    [cacheKey]
  );

  // When the recording changes (cacheKey rotation), immediately show the cached
  // stats for the new recording rather than waiting for the fetch effect below.
  useEffect(() => {
    setStatsRaw(statsCache.get(cacheKey) ?? null);
  }, [cacheKey]);

  useEffect(() => {
    if (!enabled || !channelId || !boardId) {
      return;
    }

    async function loadStats() {
      const primeApiURL = getALMConfig().primeApiURL;
      const params = new URLSearchParams({ boardId: String(boardId) });
      if (postId) {
        params.set('postId', postId);
      }
      if (sourceKey) {
        params.set('sourceKey', sourceKey);
      }
      try {
        const res: any = await RestAdapter.get({
          url: `${primeApiURL}channels/${channelId}/postStats?${params.toString()}`,
        });
        const body = typeof res === 'string' ? JSON.parse(res) : res;
        const fresh: PostStats = {
          likeCount: body.meta?.likeCount ?? 0,
          viewCount: body.meta?.viewCount ?? 0,
          isLiked: body.meta?.isLiked ?? false,
          postId: body.meta?.postId ?? null,
        };
        const cached = statsCache.get(cacheKey);
        // If the user already toggled a like this session, keep the optimistic isLiked;
        // but always use the server's counts so they stay accurate.
        if (cached != null) {
          fresh.isLiked = cached.isLiked;
        }
        setStats(fresh);
      } catch {
        // Stats unavailable — don't clear cached state
      }
    }

    loadStats();
  }, [enabled, channelId, boardId, postId, sourceKey, cacheKey, setStats]);

  const toggleLike = useCallback(async () => {
    if (!stats || !boardId || isLiking) {
      return;
    }

    const resolvedPostId = stats.postId || postId;
    if (!resolvedPostId) {
      return;
    }

    const primeApiURL = getALMConfig().primeApiURL;
    const params = new URLSearchParams({
      boardId: String(boardId),
      postId: resolvedPostId,
    });

    const wasLiked = stats.isLiked;
    const optimistic: PostStats = {
      ...stats,
      isLiked: !wasLiked,
      likeCount: wasLiked ? Math.max(0, stats.likeCount - 1) : stats.likeCount + 1,
    };

    // Optimistic update (also writes to module cache via setStats wrapper)
    setStats(optimistic);
    setIsLiking(true);

    try {
      await RestAdapter.ajax({
        url: `${primeApiURL}channels/${channelId}/upvote?${params.toString()}`,
        method: wasLiked ? 'DELETE' : 'POST',
      });
      // Success — cache is already up to date
    } catch {
      // Rollback both component state and module cache
      const rolled: PostStats = {
        ...optimistic,
        isLiked: wasLiked,
        likeCount: stats.likeCount,
      };
      setStats(rolled);
    } finally {
      setIsLiking(false);
    }
  }, [stats, boardId, postId, channelId, isLiking, setStats]);

  const isRefetchingRef = useRef(false);

  // Re-fetch stats from server (e.g. after a view is tracked, to show updated viewCount)
  const refetchStats = useCallback(async () => {
    if (!channelId || !boardId || isRefetchingRef.current) {
      return;
    }
    isRefetchingRef.current = true;
    const primeApiURL = getALMConfig().primeApiURL;
    const params = new URLSearchParams({ boardId: String(boardId) });
    if (postId) {
      params.set('postId', postId);
    }
    if (sourceKey) {
      params.set('sourceKey', sourceKey);
    }
    try {
      const res: any = await RestAdapter.get({
        url: `${primeApiURL}channels/${channelId}/postStats?${params.toString()}`,
      });
      const body = typeof res === 'string' ? JSON.parse(res) : res;
      const fresh: PostStats = {
        likeCount: body.meta?.likeCount ?? 0,
        viewCount: body.meta?.viewCount ?? 0,
        isLiked: body.meta?.isLiked ?? false,
        postId: body.meta?.postId ?? null,
      };
      const cached = statsCache.get(cacheKey);
      if (cached != null) {
        fresh.isLiked = cached.isLiked; // preserve optimistic like state
      }
      setStats(fresh);
    } catch {
      // ignore — stale stats are fine
    } finally {
      isRefetchingRef.current = false;
    }
  }, [channelId, boardId, postId, sourceKey, cacheKey, setStats]);

  // canLike: stats loaded AND a boardId + postId are resolvable.
  // boardId is required by the upvote endpoint; postId may come from stats (sourceKey resolution).
  // If false the like button must be disabled — toggleLike would silently no-op otherwise.
  const canLike = Boolean(stats && boardId && (stats.postId || postId));

  return { stats, isLiking, toggleLike, refetchStats, canLike };
}
