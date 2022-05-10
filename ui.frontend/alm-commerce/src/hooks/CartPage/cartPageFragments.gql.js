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
import { gql } from '@apollo/client';

import { GiftCardFragment } from './GiftCards/giftCardFragments.gql';
import { ProductListingFragment } from './ProductListing/productListingFragments.gql';
import { PriceSummaryFragment } from '@magento/peregrine/lib/talons/CartPage/PriceSummary/priceSummaryFragments.gql';
import { AppliedCouponsFragment } from './PriceAdjustments/CouponCode/couponCodeFragments.gql';

export const CartPageFragment = gql`
    fragment CartPageFragment on Cart {
        id
        total_quantity
        ...AppliedCouponsFragment
        ...GiftCardFragment
        ...ProductListingFragment
        ...PriceSummaryFragment
    }
    ${AppliedCouponsFragment}
    ${GiftCardFragment}
    ${ProductListingFragment}
    ${PriceSummaryFragment}
`;
