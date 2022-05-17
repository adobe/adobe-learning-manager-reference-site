/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

(function (window, document, Granite, $) {
  "use strict";

  const FOOTER_TOP_SCROLL_SEL = "#alm-footer-scrollTop";
  const SIGNOUT_PAGE_LOGIN_BTN_SEL = "#signout-page-login-btn";
  const DIV_NEW_PAR_SEL = "div.new.newpar.section.aem-Grid-newComponent";
  const PAGE_BODY_SEL = "#learning-body";

  const adjustFooterLayout = () => {
    const curWindowHeight = $(window).height();
    const pageBodyHeight = $(PAGE_BODY_SEL).height();
    if (pageBodyHeight < curWindowHeight) {
      const minHeight = curWindowHeight + "px";
      $(PAGE_BODY_SEL).css({'min-height' : minHeight, 'bottom': 0});
    }
  };

  const handleFooterScrollToTop = () => {
    $(FOOTER_TOP_SCROLL_SEL).on("click", () => window.scrollTo({
      top: 0,
      behavior: 'smooth',
    }));
  };
  
  $(document).ready(function () {
    handleFooterScrollToTop();
    $(SIGNOUT_PAGE_LOGIN_BTN_SEL).on("click", () => window.ALM.navigateToHomePage());

    if (!window.ALM.ALMConfig.authorMode) {
      // Extra div is added after each component causing extra space.
      $(DIV_NEW_PAR_SEL).remove();
    }

    adjustFooterLayout();
  });

})(window, document, Granite, jQuery);
