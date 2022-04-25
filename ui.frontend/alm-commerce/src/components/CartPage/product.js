import React from 'react';
import { formatPrice } from "../../utils/price";


export default function Product(props) {
  const { name, almthumbnailurl, price_range } = props.training;
  let finalPrice = price_range?.maximum_price?.final_price;
  let priceLabel = formatPrice(finalPrice);
  return (
    <div>
      <img src={almthumbnailurl} alt="" />
      <div>{name}</div>
      <div>{priceLabel}</div>
    </div>
  )
}
