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
import { useEffect, useState } from 'react';
import { fetchExternalLearningSettings } from '../../utils/externalLearning';

export interface ExternalLearningField {
  id: string;
  label: string | Record<string, string>;
  description: string | Record<string, string>;
  type: string;
  enabled: boolean;
  mandatory: boolean;
  editable: boolean;
  default: boolean;
  order: number;
  options?: Array<{ option_id: string; label: Record<string, string> }>;
}

export interface ExternalLearningSettings {
  enabled: boolean;
  updatedAt: string;
  coreFields: ExternalLearningField[];
  customFields: ExternalLearningField[];
}

export const useExternalLearningSettings = () => {
  const [settings, setSettings] = useState<ExternalLearningSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const parsed = await fetchExternalLearningSettings();
        setSettings(parsed?.data?.attributes ?? null);
        setErrorCode('');
      } catch (error: any) {
        setErrorCode(error?.status || 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, isLoading, errorCode };
};
