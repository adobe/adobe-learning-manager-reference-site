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
import { useCallback, useEffect, useState } from 'react';
import { PrimeExternalLearningSubmission } from '../../models/PrimeModels';
import { fetchExternalLearnings, fetchExternalLearningsByUrl } from '../../utils/externalLearning';

const EXTERNAL_LEARNINGS_PAGE_LIMIT = '10';

export const useExternalLearning = () => {
  const [submissions, setSubmissions] = useState<PrimeExternalLearningSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [nextLink, setNextLink] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const parsed = await fetchExternalLearnings({
          'page[offset]': '0',
          'page[limit]': EXTERNAL_LEARNINGS_PAGE_LIMIT,
        });
        setSubmissions(parsed?.externalLearningList || []);
        setNextLink(parsed?.links?.next || '');
        setErrorCode('');
      } catch (error: any) {
        setErrorCode(error?.status || 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextLink) return;
    setIsLoadingMore(true);
    try {
      const parsed = await fetchExternalLearningsByUrl(nextLink);
      setSubmissions(prev => [...prev, ...(parsed?.externalLearningList || [])]);
      setNextLink(parsed?.links?.next || '');
    } catch (error: any) {
      console.error('Error loading more external learnings', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextLink]);

  return {
    submissions,
    isLoading,
    isLoadingMore,
    errorCode,
    loadMore,
    hasMore: Boolean(nextLink),
  };
};
