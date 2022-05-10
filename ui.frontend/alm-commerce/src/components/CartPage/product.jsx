import { Button } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import React from "react";
import { useProduct } from "../../hooks/CartPage/useProduct";
import { formatPrice } from "../../utils/price";
import CommerceLoader from "../Common/Loader";
import styles from "./product.module.css";

export default function Product(props) {
  const { name, almthumbnailurl, price_range } = props.training;
  let finalPrice = price_range?.maximum_price?.final_price;
  let priceLabel = formatPrice(finalPrice);

  const { error, removeItemFromCart, loading } = useProduct();

  const removeItemHandler = () => {
    removeItemFromCart(Number(props.itemId));
  };

  return (
    <div className={styles.itemContainer}>
      <img src={almthumbnailurl} alt="" className={styles.itemImage} />
      <div className={styles.detailsContainer}>
        <div className={styles.name}>{name}</div>
        <div>
          <div className={styles.priceLabel}>{priceLabel}</div>
          <Button
            variant="overBackground"
            type="button"
            onPress={removeItemHandler}
            UNSAFE_className={styles.removeItem}
          >
            {loading ? <CommerceLoader size="S" /> : <Delete> </Delete>}
          </Button>
        </div>
      </div>
    </div>
  );
}
