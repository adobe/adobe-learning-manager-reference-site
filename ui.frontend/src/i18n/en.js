import primeMessages from "../externalLib/i18n/en-us.json";
import localizedMessages from "./en-US.json";

export const messages = { ...primeMessages, ...localizedMessages };
export const locale = 'en';
