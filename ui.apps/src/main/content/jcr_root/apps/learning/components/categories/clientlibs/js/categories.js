/*
 * Copyright 2021 Adobe. All rights reserved. This file is licensed to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in compliance with the License. You
 * may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (document, window, $) {
    "use strict";
    
    const CATEGORIES_LEFT_ARROW_SEL = ".categories-left-arrow";
    const CATEGORIES_RIGHT_ARROW_SEL = ".categories-right-arrow";
    const CATEGORIES_LIST_SEL = ".categories-list";
    const CATEGORIES_LINK_BTN_SEL = ".category-link-btn";

   $(document).ready(function (e) {
       $(CATEGORIES_LEFT_ARROW_SEL).on("click", function (e) {
            let leftPos = $(CATEGORIES_LIST_SEL).scrollLeft();
            $(CATEGORIES_LIST_SEL).animate({scrollLeft: leftPos - 360}, 400);
       });

       $(CATEGORIES_RIGHT_ARROW_SEL).on("click", function (e) {
            let leftPos = $(CATEGORIES_LIST_SEL).scrollLeft();
            $(CATEGORIES_LIST_SEL).animate({scrollLeft: leftPos + 360}, 400);
       });

       $(CATEGORIES_LINK_BTN_SEL).on("click", function (e) {
           let catalogsList = $(this).attr("data-catalogs");
           let tagsList = $(this).attr("data-tags");
           let productsList = $(this).attr("data-products");
           window.ALM.navigateToCatalogPageFromCategory(catalogsList, productsList, tagsList);
       });
    });

})(document, window, jQuery);
