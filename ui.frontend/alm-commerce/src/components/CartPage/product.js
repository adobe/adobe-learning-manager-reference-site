import React from 'react'

export default function Product(props) {
  const { name, almthumbnailurl, price_range } = props.training;
  let finalPrice = price_range?.maximum_price?.final_price;
  let priceLabel = "";
  if (finalPrice) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: finalPrice.currency,
    });

    priceLabel = formatter.format(finalPrice.value);
  }
  return (
    <div>
      <img src={almthumbnailurl} alt="" />
      <div>{name}</div>
      <div>{priceLabel}</div>
    </div>
  )
}
