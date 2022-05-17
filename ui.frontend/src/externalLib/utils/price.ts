const fraction = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const getFormattedPrice = (price: number) => {
  return price % 1 === 0 ? fraction.format(price) : formatter.format(price);
};
