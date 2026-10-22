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
import { useState, useCallback, useEffect, useRef } from 'react';
import { RestAdapter } from '../../utils/restAdapter';
import { getALMConfig } from '../../utils/global';
import { GetTranslation } from '../../utils/translationService';

export interface RecordingComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  initials: string;
  dateCreated: string;
}

/**
 * Manages the discussion thread for a single EVC recording post.
 * Auto-fetches when a resolved postId becomes available.
 */
export function useRecordingComments(
  channelId: string,
  boardId: number | null,
  postId: string | null
) {
  const [comments, setComments] = useState<RecordingComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchComments = useCallback(
    async (signal?: AbortSignal) => {
      if (!boardId || !postId || !channelId) return;
      const primeApiURL = getALMConfig().primeApiURL;
      const params = new URLSearchParams({ boardId: String(boardId), postId });
      setIsLoading(true);
      setCommentError(null);
      try {
        const res: any = await RestAdapter.get({
          url: `${primeApiURL}channels/${channelId}/comments?${params.toString()}`,
        });
        if (signal?.aborted) return;
        const body = typeof res === 'string' ? JSON.parse(res) : res;
        const mapped: RecordingComment[] = (body.data || []).map((item: any) => {
          const attrs = item.attributes || {};
          return {
            id: item.id || '',
            text: attrs.text || '',
            userId: attrs.userId || '',
            userName: attrs.userName || '',
            initials: attrs.initials || '',
            dateCreated: attrs.dateCreated || '',
          };
        });
        setComments(mapped);
      } catch {
        if (signal?.aborted) return;
        setCommentError(GetTranslation('evc.learner.comments.error.load'));
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [channelId, boardId, postId]
  );

  // Auto-fetch when boardId/postId become available or change.
  // AbortController cancels any in-flight fetch when deps change or on unmount,
  // preventing stale responses from overwriting state for a different recording.
  useEffect(() => {
    if (!boardId || !postId) return;
    const controller = new AbortController();
    fetchComments(controller.signal);
    return () => controller.abort();
  }, [boardId, postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text || !boardId || !postId || !channelId || isPosting) return;

    const primeApiURL = getALMConfig().primeApiURL;
    const params = new URLSearchParams({ boardId: String(boardId), postId });
    setIsPosting(true);
    setCommentError(null);
    try {
      await RestAdapter.ajax({
        url: `${primeApiURL}channels/${channelId}/comments?${params.toString()}`,
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (isMountedRef.current) setCommentText('');
      await fetchComments();
    } catch {
      if (isMountedRef.current) setCommentError(GetTranslation('evc.learner.comments.error.post'));
    } finally {
      if (isMountedRef.current) setIsPosting(false);
    }
  }, [commentText, channelId, boardId, postId, isPosting, fetchComments]);

  return {
    comments,
    isLoading,
    commentError,
    commentText,
    setCommentText,
    submitComment,
    isPosting,
  };
}
