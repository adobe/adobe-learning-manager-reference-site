import { gql } from "@apollo/client";
import { DEFAULT_PAGE_LIMIT } from "../common/ALMCustomHooks";
// export const GET_COMMERCE_TRAININGS = gql`
//   query GetCommerceTrainings {
//     products(filter: {}) {
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
//             discount {
//               percent_off
//               amount_off
//             }
//             final_price {
//               value
//               currency
//             }
//             regular_price {
//               value
//             }
//           }
//         }
//       }
//     }
//   }

export const GET_COMMERCE_TRAININGS = gql`
  query GetCommerceTrainings($pageSize:Int, $filter:ProductAttributeFilterInput, $currentPage:Int = 1, $search:String = "") {
    products(pageSize : $pageSize, filter: $filter, currentPage:$currentPage,search:$search) {
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
            final_price{
              value
              currency
            } 
          }
          maximum_price {
            final_price{
              value
              currency
            } 
          }
        }
      }
    }
  }
`;
