import { gql } from "@apollo/client";

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const REQUEST_PASSWORD_RESET_EMAIL = gql`
  mutation RequestPasswordResetEmail($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation createAccount(
    $firstname: String!
    $lastname: String!
    $email: String!
    $password: String!
    $is_subscribed: Boolean
  ) {
    createCustomerV2(
      input: {
        firstname: $firstname
        lastname: $lastname
        email: $email
        password: $password
        is_subscribed: $is_subscribed
      }
    ) {
      customer {
        firstname
        lastname
        email
        is_subscribed
      }
    }
  }
`;

export const CREATE_CART = gql`
  query customerCart {
    customerCart {
      id
      items {
        id
        product {
          name
          sku
        }
        quantity
      }
      total_quantity
    }
  }
`;
