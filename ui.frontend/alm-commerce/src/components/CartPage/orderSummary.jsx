import { Button } from '@adobe/react-spectrum';
import React from 'react'
import styles from "./orderSummary.module.css";
import { formatPrice } from "../../utils/price";

export default function OrderSummary(props) {

    const { buttonLabel, clickHandler, totalPrice } = props
    return (
        <div className={styles.summaryContainer}>
            <h2>Summary</h2>
            <hr />
            <div className={styles.orderTotal}>
                <span>Order Total</span>
                <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className={styles.actionContainer}>
                <Button variant="cta" type="button" onPress={clickHandler}>
                    {buttonLabel}
                </Button>
            </div>
        </div>
    )
}
