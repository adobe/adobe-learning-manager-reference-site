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

(function (window, document, $) {
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
  const SITE_MAP_SEL = "coral-checkbox[name='./siteMap']";
  const SITE_MAP_TRAINING_PATH_SEL = "foundation-autocomplete[name='./sitemapTrainingPath']";
  const CONFIG_HELP_BTN_SEL = ".config-help-btn";

  const SKU_URL = "{almURL}/primeapi/v2/account/{accountId}/connectorConfig?connectorName=aemReferenceSites";
  const NOMENCLAURE_URL = "{almURL}/primeapi/v2/account";
  const CP_ACCESS_TOKEN_URL = "{almURL}/oauth/token/refresh";

  let skuValidationSuccess = false;
  let validationInProgress = false;
  let nomenclatureFetchingInProgress = false;

  function hideUnselectedUsageOptions()
  {
    const selectedUsageOption = $(USAGE_TYPE_INPUT_VALUE_SEL).attr("value");
    USAGE_OPTIONS.forEach((usageOption) => {
      if (usageOption !== selectedUsageOption)
      {
        $("." + usageOption).closest("div.coral-Form-fieldwrapper").attr("hidden",'');
        $("." + usageOption).attr("disabled", "");
        $("coral-checkbox." + usageOption).attr("hidden",'');
        $("button." + usageOption).attr("hidden",'');
        $("foundation-autocomplete." + usageOption).attr("hidden",'');
      }
    });

    USAGE_OPTIONS.forEach((usageOption) => {
      if (usageOption === selectedUsageOption)
      {
        $("." + usageOption).closest("div.coral-Form-fieldwrapper").removeAttr("hidden");
        $("." + usageOption).removeAttr("disabled");
        $("coral-checkbox." + usageOption).removeAttr("hidden");
        $("button." + usageOption).removeAttr("hidden");
        $("foundation-autocomplete." + usageOption).removeAttr("hidden");
      }
    });

    renderSitemapTrainingPath();
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
      } else {
        showPopup("Error in SKU Validation.", "error", "Error");
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
    const clientId = $("input[name='./clientId']").val();
    const clientSecret = $("input[name='./clientSecret']").val();
    let nomenclatureURL = NOMENCLAURE_URL.replace("{almURL}", almBaseURL);

    let accessTokenURL = CP_ACCESS_TOKEN_URL.replace("{almURL}", almBaseURL);

    $.ajax({
      url: accessTokenURL,
      type: "POST",
      async: false,
      data: {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      },
      success: (response, textStatus, jqXHR) => {
        if (textStatus === "success" || jqXHR.status === 200)
        {
          $.ajax({
            type: "GET",
            url: nomenclatureURL,
            headers: {
              "Authorization": "oauth " + response.access_token
            },
          })
          .done(function (response, textStatus, jqXHR) {
            if (response.data && response.data.attributes && response.data.attributes.accountTerminologies)
            {
              let accountData = response.data.attributes;
              delete accountData.uiLocales;
              delete accountData.timeZones;
              delete accountData.learnerHelpLinks;
              $("input[name='./accountData']").val(JSON.stringify(response));
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
      },
      error: (jqxhr, settings, exception) => {
        showPopup("Error in  fetching nomenclature data.", "error", "Error");
        nomenclatureFetchingInProgress = false;
      },
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

  function renderSitemapTrainingPath() {
      if ($(SITE_MAP_SEL).attr("checked") === 'checked') {
        $(SITE_MAP_TRAINING_PATH_SEL).find("input[is='coral-textfield']").removeAttr("disabled","");
        $(SITE_MAP_TRAINING_PATH_SEL).removeAttr("disabled","");
      } else {
        $(SITE_MAP_TRAINING_PATH_SEL).find("input[is='coral-textfield']").attr("disabled","");
        $(SITE_MAP_TRAINING_PATH_SEL).attr("disabled","");
      }
  }
  
  function openHelpxPage() {
    const helpxURL = $("input[name='./configHelpURL']").val();
    if (helpxURL) {
      const newWindow = window.open(helpxURL, "_blank");
      window.focus();
    }
  }

  $(document).on('foundation-contentloaded', () => {
    usageTypeSelectElem = $(USAGE_TYPE_SELECT_ID_SEL).get(0);

    Coral.commons.ready(usageTypeSelectElem, function() {
      hideUnselectedUsageOptions();
      usageTypeSelectElem.on('change', hideUnselectedUsageOptions);
    });

    let siteMapCheckboxElem = $(SITE_MAP_SEL).get(0);
    if (siteMapCheckboxElem) {
      Coral.commons.ready(siteMapCheckboxElem, function() {
        renderSitemapTrainingPath();
        siteMapCheckboxElem.on('change', renderSitemapTrainingPath);
      });
    }


    $(CONFIG_FORM_DONE_ACT_SEL).off("click", handleSubmit).on("click", handleSubmit);
    $(CONFIG_FORM_SAVE_ACT_SEL).off("click", handleSubmit).on("click", handleSubmit);
    $(CONFIG_FORM_CREATE_SEL).filter("button[type='submit']").off("click", handleSubmit).on("click", handleSubmit);
    $(NOMENCLATURE_BUTTON_SEL).on("click", () => fetchNomenclatureData());
    $(CONFIG_HELP_BTN_SEL).on("click", () => openHelpxPage());
  });

})(window, document, jQuery);
