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
import { useCallback, useRef } from 'react';
import { RestAdapter } from '../../utils/restAdapter';
import { getALMConfig } from '../../utils/global';

export function useRecordingView(
  channelId: string,
  boardId: number | null,
  resolvedPostId: string | null,
  onViewTracked: (() => void) | undefined,
  refetchStats: () => void
) {
  const viewTracked = useRef(false);

  const trackView = useCallback(async () => {
    if (viewTracked.current || !resolvedPostId || !boardId) {
      return;
    }
    viewTracked.current = true;
    const primeApiURL = getALMConfig().primeApiURL;
    const params = new URLSearchParams({
      boardId: String(boardId),
      postId: resolvedPostId,
    });
    try {
      await RestAdapter.ajax({
        url: `${primeApiURL}channels/${channelId}/view?${params.toString()}`,
        method: 'POST',
      });
      refetchStats();
      onViewTracked?.();
    } catch {
      viewTracked.current = false;
    }
  }, [channelId, boardId, resolvedPostId, onViewTracked, refetchStats]); // eslint-disable-line react-hooks/exhaustive-deps

  return { trackView };
}
