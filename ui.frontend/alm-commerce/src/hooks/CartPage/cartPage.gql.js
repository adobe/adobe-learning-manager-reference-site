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
          almloid
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
