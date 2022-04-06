(function (window, document, Granite, $) {
  "use strict";

  const FOOTER_TOP_SCROLL_SEL = "#alm-footer-scrollTop";

  const CONFIG_META_TAG_NAME = "cp-config";

  const getALMConfig = () => {
    return window.ALM.ALMConfig;
  };

  const handleFooterScrollToTop = () => {
    $(FOOTER_TOP_SCROLL_SEL).on("click", () => window.scrollTo({
      top: 0,
      behavior: 'smooth',
    }));
  };
  
  $(document).ready(function () {
    handleFooterScrollToTop();
  });

})(window, document, Granite, jQuery);
