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
  mutation mutation_add_billing_address($address: CustomerAddressInput!) {
    createCustomerAddress(input: $address) {
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
  mutation mutation_setBilling($request: SetBillingAddressOnCartInput!) {
    setBillingAddressOnCart(input: $request) {
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
