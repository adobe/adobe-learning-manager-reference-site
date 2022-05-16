import { ADOBE_COMMERCE } from "../utils/constants";
import { getALMConfig } from "./global";

const currency = "USD";
const locale = "en-US";

const fraction = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: currency,
  minimumFractionDigits: 2,
});

export const getFormattedPrice = (price: number) => {
  return price % 1 === 0 ? fraction.format(price) : formatter.format(price);
};

export const isCommerceEnabled = async () => {
  // const isCommerceEnabled = await isCommerceEnabledOnAccount();
  return getALMConfig().usageType === ADOBE_COMMERCE; //&& isCommerceEnabled;
};
