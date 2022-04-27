import { gql } from "@apollo/client";

export const CREATE_CART = gql`
    query createCart {
        customerCart {
            id
        }
    }
`;


export const GET_CART_DETAILS = gql`
    query getCartDetails($cardId: String!) {
        cart(cart_id: $cardId) {
            email
            items {
                uid
                product {
                    name
                    sku
                    options_container
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
            }
        }
    }
    
`;

export const ADD_PRODUCT_TO_CART = gql`
    mutation mutation_addProducts246($cardId: String!) {
        addProductsToCart(
        cartId: $cardId
        cartItems: [{quantity: 1, sku: "course:testgraphql"}]
        ) {
            cart {
                items {
                    uid
                    product {
                        name
                        sku
                    }
                    quantity
                }
            }
        }   
    }
    
`;

export const ADD_BILLING_ADDRESS_TO_CART = gql`
    mutation mutation_setBillingA59($cardId: String!) {
        setBillingAddressOnCart(
        input: {cart_id: $cardId, billing_address: {address: {firstname: "John", lastname: "Doe", company: "Company Name", street: ["64 Strawberry Dr", "Beverly Hills"], city: "Los Angeles", region: "CA", region_id: 12, postcode: "90210", country_code: "US", telephone: "123-456-0000", save_in_address_book: true}}}
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


export const GET_PAYMENT_METHODS = gql`
    query getPayments($cardId:String!) {
        cart(cart_id: $cardId) {
            available_payment_methods {
                code
                title
            }
        }
    }
    
`;


export const SET_PAYMENT_METHOD = gql`
    mutation setPaymentMethod($cardId:String!){
        setPaymentMethodOnCart(
        input: {cart_id: $cardId, payment_method: {code: "free"}}
        ) {
            cart {
                selected_payment_method {
                    code
                }
            }
        }
    }
`;

export const CREATE_ORDER = gql`
    mutation CreateOrder($cardId:String!) {
        placeOrder(input: { cart_id: $cardId }) {
            order {
                order_number
            }
        }
    }
`;


export const GET_ORDERS = gql`
query getOrders($orderId:String!) {
    customer {
      orders(filter: {number: {eq: $orderId}}) {
        items {
          total {
            base_grand_total {
              currency
              value
            }
          }
          id
          items {
            id
            product_sku
            product_name
            selected_options {
              label
              value
            }
            eligible_for_return
            product_type
            status
          }
        }
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  }
  

`;


export const SIGN_IN = gql`
    mutation signIn($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
            token
        }
    }
`;