import { gql } from "@apollo/client";

export const SIGN_IN = gql`
    mutation SignIn($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
            token
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
