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
import React, { useMemo } from 'react'
import { useSearchParams } from "react-router-dom";
import { useOrdersPage } from "../../hooks/OrdersPage/useOrdersPage";
import { getALMConfig, getALMObject } from '../../utils/global';
import CommerceLoader from '../Common/Loader';
import { Button } from '@adobe/react-spectrum';


export default function OrdersPage() {
    const [searchParams] = useSearchParams();
    const orderId = useMemo(() => {
        return searchParams.get('orderId')
    }, [searchParams])
    // console.log("order id: ", orderId);
    const { orderedSKUS } = useOrdersPage({ orderId });
    console.log("order Details : ", orderedSKUS);
    if (!orderedSKUS) return (<CommerceLoader size="L"></CommerceLoader>);

    const proceedHandler = () => {
        if (orderedSKUS?.length === 1) {
            // redirect to course overview
            //course:1963145:2212878
            let orderedSKU = orderedSKUS[0];
            let data = orderedSKU?.split(":");
            if (data.length === 3) {
                const trainingId = `${data[0]}:${data[1]}`;
                const trainingInstanceId = `${trainingId}_${data[2]}`
                getALMObject().navigateToTrainingOverviewPage(trainingId, trainingInstanceId);
            } else {
                getALMObject().navigateToTrainingOverviewPage(orderedSKU);
            }
        }
        else {
            window.location.href = getALMConfig().catalogPath;
        }
    }
    return (
        <div>
            <h1>Thank you for your purchase.</h1>
            <Button variant="cta" type="button" onPress={proceedHandler} >Proceed to Learning site</Button>
        </div>
    )
}
