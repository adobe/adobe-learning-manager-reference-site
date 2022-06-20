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
  query getPayments($cardId: String!) {
    cart(cart_id: $cardId) {
      available_payment_methods {
        code
        title
      }
    }
  }
`;

export const SET_PAYMENT_MODE = gql`
  mutation setPaymentMethod($cardId: String!, $code: String!) {
    setPaymentMethodOnCart(
      input: { cart_id: $cardId, payment_method: { code: $code } }
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
  mutation CreateOrder($cardId: String!) {
    placeOrder(input: { cart_id: $cardId }) {
      order {
        order_number
      }
    }
  }
`;

export const SET_BILLING_ADDRESS = gql`
  mutation mutation_setBillingA59($cardId: String!) {
    setBillingAddressOnCart(
      input: {
        cart_id: $cardId
        billing_address: {
          address: {
            firstname: "John"
            lastname: "Doe"
            company: "Company Name"
            street: ["64 Strawberry Dr", "Beverly Hills"]
            city: "Los Angeles"
            region: "CA"
            region_id: 12
            postcode: "90210"
            country_code: "US"
            telephone: "123-456-0000"
            save_in_address_book: true
          }
        }
      }
    ) {
      cart {
        billing_address {
          firstname
          lastname
          company
          street
          city
          region {
            code
            label
          }
          postcode
          telephone
          country {
            code
            label
          }
        }
      }
    }
  }
`;
