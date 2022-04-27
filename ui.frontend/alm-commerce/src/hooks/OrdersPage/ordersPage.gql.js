import { gql } from "@apollo/client";
export const GET_ORDERS = gql`
    query getOrders($orderId:String!) {
        customer {
        orders(filter: {number: {eq: $orderId}}) {
            items {
                order_number
                created_at
                grand_total
                status
                id
                items {
                    id
                    product_sku
                    product_name
                    selected_options {
                    label
                    value
                    }
                    eligible_for_return
                    product_type
                    status
                }
            }
        }
        }
    }
  

`;
