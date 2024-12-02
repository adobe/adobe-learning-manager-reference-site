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

// export const GET_COMMERCE_TRAININGS = gql`
//   query GetCommerceTrainings(
//     $pageSize: Int
//     $filter: ProductAttributeFilterInput
//     $currentPage: Int = 1
//     $search: String = ""
//   ) {
//     products(
//       pageSize: $pageSize
//       filter: $filter
//       currentPage: $currentPage
//       search: $search
//     ) {
//       page_info {
//         page_size
//         current_page
//         total_pages
//       }
//       total_count
//       items {
//         name
//         sku
//         almskill
//         almtags
//         almdeliverytype
//         almusecourserating
//         almratingscount
//         almavgrating
//         almstatus
//         almpublishdate
//         almlotype
//         almusecourseeffectiveness
//         almduration
//         almauthor
//         almthumbnailurl
//         description {
//           html
//         }
//         price_range {
//           minimum_price {
//             final_price {
//               value
//               currency
//             }
//           }
//           maximum_price {
//             final_price {
//               value
//               currency
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const GET_COMMERCE_TRAININGS = gql`
  query GetCommerceTrainings(
    $pageSize: Int
    $filter: ProductAttributeFilterInput
    $currentPage: Int = 1
    $search: String = ""
    $sort: ProductAttributeSortInput
  ) {
    products(
      pageSize: $pageSize
      filter: $filter
      currentPage: $currentPage
      search: $search
      sort: $sort
    ) {
      page_info {
        page_size
        current_page
        total_pages
      }
      total_count
      items {
        name
        sku
        almskill
        almtags
        almdeliverytype
        almusecourserating
        almratingscount
        almavgrating
        almstatus
        almpublishdate
        almlotype
        almusecourseeffectiveness
        almduration
        almauthor
        almthumbnailurl
        description {
          html
        }
        price_range {
          minimum_price {
            final_price {
              value
              currency
            }
          }
          maximum_price {
            final_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const GET_COMMERCE_FILTERS = gql`
  query getFilters {
    customAttributeMetadata(
      attributes: [
        { attribute_code: "almlotype", entity_type: "catalog_product" }
        { attribute_code: "almdeliverytype", entity_type: "catalog_product" }
        { attribute_code: "almduration", entity_type: "catalog_product" }
        { attribute_code: "almcatalog", entity_type: "catalog_product" }
        { attribute_code: "almtags", entity_type: "catalog_product" }
        { attribute_code: "almskill", entity_type: "catalog_product" }
        { attribute_code: "almskilllevel", entity_type: "catalog_product" }
      ]
    ) {
      items {
        attribute_code
        attribute_options {
          value
          label
        }
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART = gql`
  mutation addProductsToCart($cartId: String!, $sku: String!) {
    addProductsToCart(cartId: $cartId, cartItems: [{ quantity: 1, sku: $sku }]) {
      cart {
        items {
          product {
            name
            sku
          }
          quantity
        }
        total_quantity
      }
      user_errors {
        message
      }
    }
  }
`;
export const GET_MAX_PRICE = gql`
  query getMaxPrice {
    products(pageSize: 1, currentPage: 1, search: "", sort: { price: DESC }) {
      items {
        price_range {
          maximum_price {
            regular_price {
              currency
              value
            }
          }
        }
      }
    }
  }
`;
