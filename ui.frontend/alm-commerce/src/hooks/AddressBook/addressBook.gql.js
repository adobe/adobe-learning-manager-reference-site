import { gql } from "@apollo/client";

export const GET_COUNTRIES = gql`
    query {
        countries {
            id
            two_letter_abbreviation
            full_name_english
        }
    }
`;
export const GET_COUNTRY_REGIONS = gql`
    query($code: String!) {
        country(id: $code) {
            available_regions {
                id
                code
                name
            }
        }
    }
`;


export const ADD_DEFAULT_BILLING_ADDRESS = gql`
    mutation mutation_add_billing_address(
        $region:Int!,
        $country_code:CountryCodeEnum!,
        $streetAddress:String!,
        $streetAddress2:String!,
        $telephone:String!,
        $postcode:String!,
        $city:String!,
        $firstName:String!,
        $lastName:String!,
        $middleName:String!
    ) {
    createCustomerAddress(
      input: {
        region: { region_id: $region }
        country_code: $country_code
        street: [$streetAddress, $streetAddress2]
        telephone: $telephone
        postcode: $postcode
        city: $city
        firstname: $firstName
        lastname: $lastName
        middlename : $middleName
        default_shipping: true
        default_billing: true
      }
    ) {
            id
            default_shipping
        }
    }
  
`;


export const GET_ADDRESSES = gql`
    query getAddresses {
    customer {
      addresses {
        id
        firstname
        lastname
        street
        city
        region {
          region_code
          region
          region_id
        }
        default_billing
        default_shipping
        postcode
        country_code
        telephone
        middlename
      }
    }
  } 
`;


export const SET_BILLING_ADDRESS = gql`
  mutation mutation_setBillingA59(
      $cardId: String!,
      $region:Int!,
      $country_code:String!,
      $streetAddress:String!,
      $streetAddress2:String!,
      $telephone:String!,
      $postcode:String!,
      $city:String!,
      $firstName:String!,
      $lastName:String!
    ) {
    setBillingAddressOnCart(
      input: {
        cart_id: $cardId
        billing_address: {
            address: {
                firstname: $firstName
                lastname: $lastName
                street: [$streetAddress, $streetAddress2]
                city: $city
                region_id: $region
                postcode: $postcode
                country_code: $country_code
                telephone: $telephone
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