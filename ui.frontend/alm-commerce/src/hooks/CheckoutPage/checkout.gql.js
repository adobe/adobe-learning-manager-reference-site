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
