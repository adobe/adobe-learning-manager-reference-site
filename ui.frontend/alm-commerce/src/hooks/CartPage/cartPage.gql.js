import { gql } from "@apollo/client";

export const GET_CART = gql`
  query getCustomerCart {
    customerCart {
      id
      items {
        id
        product {
          name
          sku
          almthumbnailurl
        }
        quantity
      }
    }
  }
`;

export const GET_CART_DETAILS = gql`
  query GetCartDetails($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      total_quantity
      items {
        id
        product {
          name
          sku
          almthumbnailurl
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
            }
          }
        }
        quantity
      }
      prices {
        grand_total {
          value
          currency
        }
        applied_taxes {
          amount {
            currency
            value
          }
        }
        subtotal_excluding_tax {
          currency
          value
        }
        subtotal_including_tax {
          currency
          value
        }
      }
    }
  }
`;
