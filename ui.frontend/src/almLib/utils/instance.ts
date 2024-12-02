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
import { Key } from "@adobe/react-spectrum";
import {
  PrimeLearningObjectInstance,
  PrimeLearningObjectResource,
  PrimeLocalizationMetadata,
  PrimeResource,
} from "../models/PrimeModels";
import { GetTranslation } from "./translationService";

export const checkIfEnrollmentDeadlineNotPassed = (instance: PrimeLearningObjectInstance) => {
  const enrollmentDeadlineStr = instance.enrollmentDeadline;
  return enrollmentDeadlineStr && new Date(enrollmentDeadlineStr) < new Date() ? false : true;
};

export const checkIfCompletionDeadlineNotPassed = (instance: PrimeLearningObjectInstance) => {
  const completionDeadlineStr = instance.completionDeadline;
  return completionDeadlineStr && new Date(completionDeadlineStr) < new Date() ? false : true;
};

export const checkIfUnenrollmentDeadlinePassed = (instance: PrimeLearningObjectInstance) => {
  const unenrollmentDeadlineStr = instance.unenrollmentDeadline;
  return unenrollmentDeadlineStr && new Date(unenrollmentDeadlineStr) >= new Date() ? false : true;
};

export const getResourceBasedOnLocale = (
  loResource: PrimeLearningObjectResource,
  locale: string
): PrimeResource => {
  if (!loResource || !loResource.resources) {
    return {} as PrimeResource;
  }
  return (
    loResource.resources.filter(item => item.locale === locale)[0] ||
    loResource.resources.filter(item => item.locale === "en-US")[0] ||
    loResource.resources[0]
  );
};

export const filterInstanceList = (listArray: any[], selectedLanguage: Key): any[] =>
  getInstancesByLocale(listArray, selectedLanguage.toString());

export const getLoInstanceLocales = (
  instances: PrimeLearningObjectInstance[]
): Set<string | undefined | null> => {
  const loInstanceLocales: Set<string | undefined | null> = new Set();
  instances?.forEach(instance => {
    loInstanceLocales.add(instance.locale);
  });
  return loInstanceLocales;
};

export const getLanguageDropdownObject = (
  contentLocales: PrimeLocalizationMetadata[],
  loInstanceLocales: Set<string | undefined | null>
): { [key: string]: string } => {
  const languageDropdownObject: { [key: string]: string } = {};
  languageDropdownObject["all"] = GetTranslation("alm.instance.all");
  contentLocales?.forEach((contentLocale: { locale: string; name: string }) => {
    if (loInstanceLocales.has(contentLocale.locale)) {
      languageDropdownObject[contentLocale.locale] = contentLocale.name;
    }
  });
  if (loInstanceLocales.has(undefined) || loInstanceLocales.has(null)) {
    languageDropdownObject["notAssigned"] = GetTranslation("alm.instance.notAssigned");
  }
  return languageDropdownObject;
};

const getInstancesByLocale = (arr: any, locale: string) => {
  return arr.filter((item: any) => {
    if (locale === "all") {
      return item;
    } else if (locale === "notAssigned") {
      return !item.locale;
    } else if (item.locale === locale) {
      return item;
    }
  });
};
