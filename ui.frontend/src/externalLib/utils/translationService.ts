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
import primeMessages from "../i18n/en-us.json";
import { PrimeAccountTerminology } from "../models/PrimeModels";
interface AccountTerminology {
  name_lxpv: string;
  pluralName_lxpv: string;
}
let _translations: Record<string, string> = primeMessages;
const pluralRegex = /\|\|\|\s*(.*?)\s*\|\|\|/g;
const singularRegex = /\|\|\s*(.*?)\s*\|\|/g;
const pluralPrefix = /\|\|\|/g;
const singularPrefix = /\|\|/g;

const ENGLISH_LOCALE = "en-US";
//let _userLocale: string | undefined = undefined;
let accountTerminologyMap: { [key: string]: AccountTerminology };

export function getPreferredLocalizedMetadata<T>(
  localizedMetadata: T[],
  locale: string
): T {
  if (!localizedMetadata) {
    return {} as T;
  }
  let data = localizedMetadata.find((item: any) => item.locale === locale);

  return (
    data ||
    localizedMetadata.find((item: any) => item.locale === ENGLISH_LOCALE)! ||
    localizedMetadata[0]
  );
}

export function GetTranslation(
  key: string,
  replaceAccountTerminology = false
): string {
  let val = _translations[key];
  if (replaceAccountTerminology) {
    val = ReplaceAccountTerminology(val);
  }
  return val;
}
export function GetTranslationReplaced(
  key: string,
  repVal: string,
  replaceAccountTerminology = false
): string {
  let val = _translations[key];
  if (replaceAccountTerminology) {
    val = ReplaceAccountTerminology(val);
  }
  return val.replace(/\{{(.+)\}}/g, repVal);
}

// export function interpolateTemplateAndMap(
//   template: string,
//   params: Record<string, string | number | boolean>
// ): any {
//   const names = Object.keys(params);
//   const vals = Object.values(params);
//   return new Function(...names, `return \`${template}\`;`)(...vals);
// }

// export function GetTranslationsReplaced(
//   key: string,
//   paramMap: Record<string, string | number | boolean>,
//   replaceAccountTerminology = false
// ): string {
//   let val = _translations[key];
//   if (replaceAccountTerminology) {
//     val = ReplaceAccountTerminology(val);
//   }
//   return interpolateTemplateAndMap(val, paramMap);
// }

export function ReplaceAccountTerminology(translation: string): string {
  if (!accountTerminologyMap || !translation) {
    return translation;
  }
  const pluralTokens = translation.match(pluralRegex);
  if (pluralTokens) {
    pluralTokens.forEach(function (token) {
      translation = translation.replace(
        token,
        accountTerminologyMap[token.replace(pluralPrefix, "")]?.pluralName_lxpv
      );
    });
  }
  const singularTokens = translation.match(singularRegex);
  if (singularTokens) {
    singularTokens.forEach(function (token) {
      translation = translation.replace(
        token,
        accountTerminologyMap[token.replace(singularPrefix, "")]?.name_lxpv
      );
    });
  }
  return translation;
}

export function SetupAccountTerminologies(
  accountTerminologies: PrimeAccountTerminology[] = defaultAccountTerminologies
): void {
  accountTerminologyMap = {};
  accountTerminologies.forEach((item) => {
    accountTerminologyMap[item.entityType] = {
      name_lxpv: item.name,
      pluralName_lxpv: item.pluralName,
    };
  });
}

const defaultAccountTerminologies = [
  {
    entityType: "MODULE",
    locale: "en-US",
    name: "Module",
    pluralName: "Modules",
  },
  {
    entityType: "COURSE",
    locale: "en-US",
    name: "Course",
    pluralName: "Courses",
  },
  {
    entityType: "LEARNING_PATH",
    locale: "en-US",
    name: "Learning Path",
    pluralName: "Learning Paths",
  },
  {
    entityType: "CERTIFICATION",
    locale: "en-US",
    name: "Certification",
    pluralName: "Certifications",
  },
  {
    entityType: "LEARNING_PLAN",
    locale: "en-US",
    name: "Learning Plan",
    pluralName: "Learning Plans",
  },
  {
    entityType: "JOB_AID",
    locale: "en-US",
    name: "Job Aid",
    pluralName: "Job Aids",
  },
  {
    entityType: "CATALOG",
    locale: "en-US",
    name: "Catalog",
    pluralName: "Catalogs",
  },
  {
    entityType: "SKILL",
    locale: "en-US",
    name: "Skill",
    pluralName: "Skills",
  },
  {
    entityType: "BADGE",
    locale: "en-US",
    name: "Badge",
    pluralName: "Badges",
  },
  {
    entityType: "ANNOUNCEMENT",
    locale: "en-US",
    name: "Announcement",
    pluralName: "Announcements",
  },
  {
    entityType: "MY_LEARNING",
    locale: "en-US",
    name: "My Learning",
    pluralName: "My Learning",
  },
  {
    entityType: "LEADERBOARD",
    locale: "en-US",
    name: "Leaderboard",
    pluralName: "Leaderboard",
  },
  {
    entityType: "EFFECTIVENESS",
    locale: "en-US",
    name: "Effectiveness",
    pluralName: "Effectiveness",
  },
  {
    entityType: "PREREQUISITE",
    locale: "en-US",
    name: "Prerequisite",
    pluralName: "Prerequisites",
  },
  {
    entityType: "PREWORK",
    locale: "en-US",
    name: "Prework",
    pluralName: "Prework",
  },
  {
    entityType: "CORE_CONTENT",
    locale: "en-US",
    name: "Core Content",
    pluralName: "Core Content",
  },
  {
    entityType: "TESTOUT",
    locale: "en-US",
    name: "Testout",
    pluralName: "Testout",
  },
  {
    entityType: "SELF_PACED",
    locale: "en-US",
    name: "Self Paced",
    pluralName: "Self Paced",
  },
  {
    entityType: "BLENDED",
    locale: "en-US",
    name: "Blended",
    pluralName: "Blended",
  },
  {
    entityType: "CLASSROOM",
    locale: "en-US",
    name: "Classroom",
    pluralName: "Classrooms",
  },
  {
    entityType: "VIRTUAL_CLASSROOM",
    locale: "en-US",
    name: "Virtual Classroom",
    pluralName: "Virtual Classroom",
  },
  {
    entityType: "ACTIVITY",
    locale: "en-US",
    name: "Activity",
    pluralName: "Activities",
  },
  {
    entityType: "PATH",
    locale: "en-US",
    name: "Path",
    pluralName: "Paths",
  },
  {
    entityType: "SKILL_LEVEL",
    locale: "en-US",
    name: "Skill Level",
    pluralName: "Skill Levels",
  },
  {
    entityType: "SOCIAL_LEARNING",
    locale: "en-US",
    name: "Social Learning",
    pluralName: "Social Learning",
  },
  {
    entityType: "SOCIAL",
    locale: "en-US",
    name: "Social",
    pluralName: "Social",
  },
] as PrimeAccountTerminology[];
