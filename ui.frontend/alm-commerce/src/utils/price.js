export const formatPrice = (price, locale = "en-US") => {
    if (!price) return "";
    if (!price.value || !price.currency) return "";
    const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: price.currency,
    });

    return formatter.format(price.value);
}