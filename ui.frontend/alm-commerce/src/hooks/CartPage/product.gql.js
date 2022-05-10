import { gql } from "@apollo/client";

// export const GET_STORE_CONFIG = gql`
//     query getStoreConfigForCartPage {
//         # eslint-disable-next-line @graphql-eslint/require-id-when-available
//         storeConfig {
//             store_code
//             product_url_suffix
//             configurable_thumbnail_source
//         }
//     }
// `;

// export default {
//     getStoreConfigQuery: GET_STORE_CONFIG
// };

export const REMOVE_ITEM_FROM_CART = gql`
  mutation removeItem($cardId: String!, $cart_item_id: Int!) {
    removeItemFromCart(
      input: { cart_id: $cardId, cart_item_id: $cart_item_id }
    ) {
      cart {
        items {
          id
          product {
            name
          }
          quantity
        }
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`;
