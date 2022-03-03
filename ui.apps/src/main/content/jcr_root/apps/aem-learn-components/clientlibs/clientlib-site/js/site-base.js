window.ALM = window.ALM || {};
window.ALM.primeConfigs = window.ALM.primeConfigs || {};

(function (window, document, Granite, $) {
  "use strict";

  const CONFIG_META_TAG_NAME = "cp-config";

  function setPrimeConfigs() {
    const cpConfigElmt = document.querySelector(
      'meta[name="' + CONFIG_META_TAG_NAME + '"]'
    );
    if (cpConfigElmt) {
      window.ALM.primeConfigs = JSON.parse(cpConfigElmt.content);
    }
  }

  function init() {
    setPrimeConfigs();
  }

  init();
})(window, document, Granite, jQuery);
