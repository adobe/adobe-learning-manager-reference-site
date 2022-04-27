import React, { useMemo } from 'react'
import { useSearchParams } from "react-router-dom";
import { useOrdersPage } from "../../hooks/OrdersPage/useOrdersPage"

export default function OrdersPage() {
    const [searchParams] = useSearchParams();
    const orderId = useMemo(() => {
        return searchParams.get('orderId')
    }, [searchParams])
    // console.log("order id: ", orderId);
    const { orderDetails } = useOrdersPage({ orderId });
    console.log("order Details : ", orderDetails);
    if (!orderDetails) return ("Loading....")
    return (
        <div>{orderDetails?.customer?.orders?.items[0].order_number}, {orderDetails?.customer?.orders?.items[0].status}</div>
    )
}
