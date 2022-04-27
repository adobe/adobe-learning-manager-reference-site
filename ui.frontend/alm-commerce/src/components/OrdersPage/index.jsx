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
            <h1>Order placed successfully.</h1>
            <Button variant="cta" type="button" onPress={proceedHandler} >Proceed</Button>
        </div>
    )
}
