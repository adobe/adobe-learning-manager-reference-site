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
// `;
export const GET_COMMERCE_TRAININGS = gql`
  query GetCommerceTrainings {
    products(filter: {}, pageSize : ${DEFAULT_PAGE_LIMIT}) {
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
      }
    }
  }
`;
