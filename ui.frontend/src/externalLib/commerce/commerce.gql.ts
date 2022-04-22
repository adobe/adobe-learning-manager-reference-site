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
  ) {
    products(
      pageSize: $pageSize
      filter: $filter
      currentPage: $currentPage
      search: $search
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
