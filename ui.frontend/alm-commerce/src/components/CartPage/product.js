import React from 'react';
import { formatPrice } from "../../utils/price";
import styles from "./product.module.css";


export default function Product(props) {
  const { name, almthumbnailurl, price_range } = props.training;
  let finalPrice = price_range?.maximum_price?.final_price;
  let priceLabel = formatPrice(finalPrice);
  return (
    <div className={styles.itemContainer}>
      <img src={almthumbnailurl} alt="" className={styles.itemImage} />
      <div className={styles.detailsContainer}>
        <div>{name}</div>
        <div>
          <span>{priceLabel}</span>
        </div>
      </div>
    </div>
  )
}
