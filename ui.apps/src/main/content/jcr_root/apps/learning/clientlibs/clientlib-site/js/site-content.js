(function (window, document, Granite, $) {
  "use strict";

  const FOOTER_TOP_SCROLL_SEL = "#alm-footer-scrollTop";
  const SIGNOUT_PAGE_LOGIN_BTN_SEL = "#signout-page-login-btn";
  const DIV_NEW_PAR_SEL = "div.new.newpar.section.aem-Grid-newComponent";

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
  });

})(window, document, Granite, jQuery);
