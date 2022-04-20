import { gql } from "@apollo/client";


export const GET_PAYMENTS_MODE = gql`
    query getPayments($cardId: String!) {
        cart(cart_id: $cardId) {
            available_payment_methods {
                code
                title
            }
        }
    }
`;