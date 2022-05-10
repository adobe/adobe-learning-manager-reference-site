/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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
