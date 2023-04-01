/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import outputFileMap from "../.transient/outputFileMap.json";
import { ENGLISH_LOCALE } from "../almLib/utils/constants";
import { getALMConfig } from "../almLib/utils/global";
import { RestAdapter } from "../almLib/utils/restAdapter";
import {
  SetupTranslations,
  getBrowserLocale,
} from "../almLib/utils/translationService";

let MANIFEST: Record<string, string> = <any>outputFileMap;
const GetManifestFile = (key: string) => {
  return MANIFEST[key];
};

export const GetManifestResourcePath = (key: string): string | undefined => {
  const val = GetManifestFile(key);
  if (!val) {
    return undefined;
  }
  if ((window as any).isAlmLocalEnv) {
    return window.location.origin + "/" + val;
  }
  return window.location.origin + getALMConfig().frontendResourcesPath + "/" + val;
};

const computeUserLocale = (): string => {
  const almConfig = getALMConfig();
  let locale = "";
  if (almConfig) {
    locale = almConfig.locale;
  }
  return locale || getBrowserLocale() || ENGLISH_LOCALE;
};

const LoadTranslationsPromise = (locale?: string): Promise<any> => {
  locale = locale || ENGLISH_LOCALE;

  const translationLocaleKey = locale.replace("-", "_");
  const resourcePath = GetManifestResourcePath(`${translationLocaleKey}.json`);
  if (!resourcePath) {
    return LoadTranslationsPromise(ENGLISH_LOCALE);
  }
  return RestAdapter.get({
    url: `${resourcePath}`,
    withCredentials: false,
  });
};

export async function LoadTranslations(
  computedLocale: string,
  enTranslationsPromise: Promise<any> | null
): Promise<any> {
  if (computedLocale == ENGLISH_LOCALE && enTranslationsPromise) {
    return enTranslationsPromise;
  }
  return LoadTranslationsPromise(computedLocale);
}

export default async () => {
  const computedLocale = computeUserLocale();
  const enTranslationsPromise = LoadTranslationsPromise();

  let translations;
  try {
    translations = await LoadTranslations(
      computedLocale,
      enTranslationsPromise
    );
  } catch (err) {
    translations = await LoadTranslations(computedLocale, null);
  }
  SetupTranslations(translations);
  return { locale: computedLocale, messages: JSON.parse(translations) };
};
