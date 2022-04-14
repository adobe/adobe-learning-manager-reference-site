(function (window, document, $, Coral) {
  "use strict";

  let usageTypeSelectElem;

  const USAGE_OPTIONS = ["aem-sites", "aem-es", "aem-commerce"];
  const USAGE_TYPE_INPUT_VALUE_SEL = "coral-select[name='./usageType'] coral-select-item[selected='']";
  const USAGE_TYPE_SELECT_ID_SEL = "#alm-usage-type-select";


  function hideUnselectedUsageOptions()
  {
    var selectedUsageOption = $(USAGE_TYPE_INPUT_VALUE_SEL).attr("value");
    USAGE_OPTIONS.forEach((usageOption) => {
      if (usageOption !== selectedUsageOption)
      {
        $("." + usageOption).closest("div.coral-Form-fieldwrapper").attr("hidden",'');
        $("coral-checkbox." + usageOption).attr("hidden",'');
      }
    });

    USAGE_OPTIONS.forEach((usageOption) => {
      if (usageOption === selectedUsageOption)
      {
        $("." + usageOption).closest("div.coral-Form-fieldwrapper").removeAttr("hidden");
        $("coral-checkbox." + usageOption).removeAttr("hidden");
      }
    });
  }

  $(document).on('foundation-contentloaded', () => {
    usageTypeSelectElem = $(USAGE_TYPE_SELECT_ID_SEL).get(0);

    Coral.commons.ready(usageTypeSelectElem, function() {
      hideUnselectedUsageOptions();
      usageTypeSelectElem.on('change', hideUnselectedUsageOptions);
    });
  });

})(window, document, jQuery, Coral);
