import { PrimeAccountTerminology } from "../models/PrimeModels";
interface AccountTerminology {
  name_lxpv: string;
  pluralName_lxpv: string;
}
let _translations: Record<string, string>;
const pluralRegex = /\|\|\|\s*(.*?)\s*\|\|\|/g;
const singularRegex = /\|\|\s*(.*?)\s*\|\|/g;
const pluralPrefix = /\|\|\|/g;
const singularPrefix = /\|\|/g;

const ENGLISH_LOCALE = "en-US";
let _userLocale: string | undefined = undefined;
let accountTerminologyMap: { [key: string]: AccountTerminology };

export function getPreferredLocalizedMetadata<T>(
  localizedMetadata: T[],
  locale: string
): T {
  if (!localizedMetadata) {
    //TO DO: need to hanlde this
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

export function interpolateTemplateAndMap(
  template: string,
  params: Record<string, string | number | boolean>
): any {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${template}\`;`)(...vals);
}

export function GetTranslationsReplaced(
  key: string,
  paramMap: Record<string, string | number | boolean>,
  replaceAccountTerminology = false
): string {
  let val = _translations[key];
  if (replaceAccountTerminology) {
    val = ReplaceAccountTerminology(val);
  }
  return interpolateTemplateAndMap(val, paramMap);
}

export function ReplaceAccountTerminology(translation: string): string {
  if (!accountTerminologyMap) {
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
  accountTerminologies: PrimeAccountTerminology[]
): void {
  if (accountTerminologies) {
    accountTerminologyMap = {};
    accountTerminologies.forEach((item) => {
      accountTerminologyMap[item.entityType] = {
        name_lxpv: item.name,
        pluralName_lxpv: item.pluralName,
      };
    });
  }
}
