(function (window, document, $, Coral) {
  "use strict";

  let usageTypeSelectElem;

  const USAGE_OPTIONS = ["aem-sites", "aem-es", "aem-commerce"];
  const USAGE_TYPE_INPUT_VALUE_SEL = "coral-select[name='./usageType'] coral-select-item[selected='']";
  const USAGE_TYPE_SELECT_ID_SEL = "#alm-usage-type-select";
  const NOMENCLATURE_BUTTON_SEL = "#fetch-nomenclature-button";
  const CONFIG_FORM_DONE_ACT_SEL = "#shell-propertiespage-doneactivator";
  const CONFIG_FORM_SAVE_ACT_SEL = "#shell-propertiespage-saveactivator";
  const CONFIG_FORM_CREATE_SEL = ".foundation-wizard-control";
  const DX_SKU_VALIDATION_ERROR_ID = "alm-dx-sku-validator";

  const SKU_URL = "{almURL}/primeapi/v2/account/{accountId}/connectorConfig?connectorName=aemReferenceSites";
  const NOMENCLAURE_URL = "{almURL}/primeapi/v2/account";

  let skuValidationSuccess = false;
  let validationInProgress = false;
  let nomenclatureFetchingInProgress = false;


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

  function handleSubmit(e)
  {
    if (!skuValidationSuccess)
      {
        e.preventDefault();
        e.stopPropagation();
        validateSKU();
      }
  }

  function validateSKU()
  {
    if (validationInProgress)
    {
      return;
    }

    validationInProgress = true;

    const almBaseURL = $("input[name='./almBaseURL']").val();
    const accountId = $("input[name='./accountId']").val();
    let skuURL = SKU_URL.replace("{almURL}", almBaseURL).replace("{accountId}", accountId);

    $.ajax({
      type: "GET",
      url: skuURL,
    })
    .done(function (response, textStatus, jqXHR) {
      validationInProgress = false;
      if (response.data && response.data.attributes)
      {
        let connectorConfig = response.data.attributes.connectorConfig;
        connectorConfig = JSON.parse(connectorConfig);
        if (connectorConfig.aemReferenceSites)
        {
          skuValidationSuccess = true;
          $(CONFIG_FORM_DONE_ACT_SEL).click();
          $(CONFIG_FORM_CREATE_SEL).filter("button[type='submit']").click();
        }
        else
        {
          showPopup("Error in SKU Validation.", "error", "Error");
        }
      }
    })
    .fail(function (jqxhr, settings, exception) {
      validationInProgress = false;
      showPopup("Error in SKU Validation.", "error", "Error");
    });
  }

  function fetchNomenclatureData()
  {
    if (nomenclatureFetchingInProgress)
    {
      return;
    }
    nomenclatureFetchingInProgress = true;
    const almBaseURL = $("input[name='./almBaseURL']").val();
    const refreshToken = $("input[name='./refreshToken']").val();
    let nomenclatureURL = NOMENCLAURE_URL.replace("{almURL}", almBaseURL);

    $.ajax({
      type: "GET",
      url: nomenclatureURL,
      headers: {
        "Authorization": "oauth " + refreshToken
      },
    })
    .done(function (response, textStatus, jqXHR) {
      if (response.data && response.data.attributes && response.data.attributes.accountTerminologies)
      {
        let accountTerminologies = response.data.attributes.accountTerminologies;
        $("input[name='./nomenclatureData']").val(JSON.stringify(accountTerminologies));
        showPopup("Nomenclature Data fetched successfully.", "success", "Success");
      }
      else
      {
        showPopup("Error in  fetching nomenclature data.", "error", "Error");
      }
      nomenclatureFetchingInProgress = false;
    })
    .fail(function (jqxhr, settings, exception) {
      showPopup("Error in  fetching nomenclature data.", "error", "Error");
      nomenclatureFetchingInProgress = false;
    });
  }

  function showPopup(errorMsg, variant, header) {
    let dialogElem = $("#" + DX_SKU_VALIDATION_ERROR_ID);
    let dialogModal;

    if(dialogElem.is(":visible"))
    {
      return;
    }

    dialogModal = new Coral.Dialog().set({
      id: DX_SKU_VALIDATION_ERROR_ID,
      variant: variant,
      closable: "on",
      header: {
        innerHTML: header
      },
      content: {
        innerHTML: errorMsg
      },
      footer: {
        innerHTML: '<button is="coral-button" variant="default" coral-close>OK</button>'
      }
    });

    dialogModal.on('coral-overlay:close', function (event) {
      $("#" + DX_SKU_VALIDATION_ERROR_ID).remove();
    });

    document.body.appendChild(dialogModal);
    dialogModal.show();
  }

  $(document).on('foundation-contentloaded', () => {
    usageTypeSelectElem = $(USAGE_TYPE_SELECT_ID_SEL).get(0);

    Coral.commons.ready(usageTypeSelectElem, function() {
      hideUnselectedUsageOptions();
      usageTypeSelectElem.on('change', hideUnselectedUsageOptions);
    });

    $(CONFIG_FORM_DONE_ACT_SEL).off("click", handleSubmit).on("click", handleSubmit);
    $(CONFIG_FORM_SAVE_ACT_SEL).off("click", handleSubmit).on("click", handleSubmit);
    $(CONFIG_FORM_CREATE_SEL).filter("button[type='submit']").off("click", handleSubmit).on("click", handleSubmit);
    $(NOMENCLATURE_BUTTON_SEL).on("click", () => fetchNomenclatureData());
  });



})(window, document, jQuery, Coral);
