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

export const GET_PAYMENTS_MODE = gql`
  query getPayments($cartId: String!) {
    cart(cart_id: $cartId) {
      available_payment_methods {
        code
        title
      }
    }
  }
`;

export const SET_PAYMENT_MODE = gql`
  mutation setPaymentMethod($cartId: String!, $code: String!) {
    setPaymentMethodOnCart(
      input: { cart_id: $cartId, payment_method: { code: $code } }
    ) {
      cart {
        selected_payment_method {
          code
        }
      }
    }
  }
`;

export const SET_PAYMENT_ON_CART = gql`
  mutation mutation_setPayment($cartId: String!, $nonce: String!) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: "braintree"
          braintree: {
            payment_method_nonce: $nonce
            is_active_payment_token_enabler: false
          }
        }
      }
    ) {
      cart {
        selected_payment_method {
          code
        }
      }
    }
  }
`;

export const PROCESS_ORDER = gql`
  mutation CreateOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`;

export const CREATE_TOKEN = gql`
  mutation mutation_createBrainToken {
    createBraintreeClientToken
  }
`;

export const BRAINTREE_PAYMENT = gql`
  mutation mutation_setPayment {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: "braintree"
          braintree: {
            payment_method_nonce: "fake-nonce"
            is_active_payment_token_enabler: false
          }
        }
      }
    ) {
      cart {
        selected_payment_method {
          code
        }
      }
    }
  }
`;
