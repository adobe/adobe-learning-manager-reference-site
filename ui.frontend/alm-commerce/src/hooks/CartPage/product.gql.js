/**
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { gql } from "@apollo/client";

export const REMOVE_ITEM_FROM_CART = gql`
  mutation removeItem($cartId: String!, $cart_item_id: Int!) {
    removeItemFromCart(
      input: { cart_id: $cartId, cart_item_id: $cart_item_id }
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
