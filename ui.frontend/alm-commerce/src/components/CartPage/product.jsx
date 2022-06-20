import { Button } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import React from "react";
import { useProduct } from "../../hooks/CartPage/useProduct";
import { formatPrice } from "../../utils/price";
import { useCardBackgroundStyle } from "../../hooks/common/product";
import CommerceLoader from "../Common/Loader";
import styles from "./product.module.css";

export default function Product(props) {
  const { name, price_range } = props.training;
  let finalPrice = price_range?.maximum_price?.final_price;
  let priceLabel = formatPrice(finalPrice);
  const refreshCartHandler = props.refreshCartHandler;
  const { removeItemFromCart, loading } = useProduct(refreshCartHandler);
  const cardBackgroundStyle = useCardBackgroundStyle(props.training);
  const removeItemHandler = () => {
    removeItemFromCart(Number(props.itemId));
  };

  return (
    <div className={styles.itemContainer}>
      <img style={cardBackgroundStyle} alt="" className={styles.itemImage} />
      <div className={styles.detailsContainer}>
        <div className={styles.name}>{name}</div>
        <div>
          <div className={styles.priceLabel}>{priceLabel}</div>
          {props.canDeleteProduct &&
            <Button
              variant="overBackground"
              type="button"
              onPress={removeItemHandler}
              UNSAFE_className={styles.removeItem}
            >
              {loading ? <CommerceLoader size="S" /> : <Delete> </Delete>}
            </Button>
          }
        </div>
      </div>
    </div>
  );
}
