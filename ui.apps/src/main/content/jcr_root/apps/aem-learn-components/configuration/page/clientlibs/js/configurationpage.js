(function (window, document, $, Coral) {
  "use strict";

  let nameCoralTextfieldComponent;
  let formElement;
  let redirectLocation;

  const USAGE_OPTIONS = ["aem-sites", "aem-es", "aem-magento"];
  const USAGE_TYPE_SELECTED_SEL = "coral-select[name='./usageType']";
  const USAGE_TYPE_INPUT_VALUE_SEL = "input[name='./usageType']";

  function hideUnselectedUsageOptions()
  {
    var selectedUsageOption = $(USAGE_TYPE_INPUT_VALUE_SEL)[0].value;
    USAGE_OPTIONS.forEach((usageOption) => {
      if (usageOption === selectedUsageOption)
      {
        $("."+usageOption).closest("div.coral-Form-fieldwrapper").removeAttr("hidden");
      }
      else
      {
        $("."+usageOption).closest("div.coral-Form-fieldwrapper").attr("hidden",'');
      }
    });
  }

  $(document).on("change", USAGE_TYPE_SELECTED_SEL, function(e) {
    hideUnselectedUsageOptions();
  });

  Coral.commons.ready(USAGE_TYPE_SELECTED_SEL, function(e) {
    hideUnselectedUsageOptions();
  });

})(window, document, jQuery, Coral);
