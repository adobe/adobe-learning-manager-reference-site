(function (window, document, Granite, $) {
  "use strict";

  let nameCoralTextfieldComponent;
  let formElement;
  let redirectLocation;

  function init() {
    formElement = $("#cq-commerce-products-bindproducttree-form");
    nameCoralTextfieldComponent = $(
      "#cq-commerce-products-bindproducttree-name"
    ).get(0);
    redirectLocation = $("#cq-commerce-products-bindproducttree-form")
      .find("[data-foundation-wizard-control-action=cancel]")
      .attr("href");
  }

  function formSubmitHandler() {
    $.ajax({
      url: formElement.attr("action"),
      type: "POST",
      data: formElement.serialize(),
      success: () => {
        document.location.href = Granite.HTTP.externalize(redirectLocation);
      },
      error: () => {
        nameCoralTextfieldComponent.invalid = true;
      },
    });
    return false;
  }

  $(document).on("foundation-contentloaded", () => {
    init();
    formElement.on("submit", formSubmitHandler);
  });
})(window, document, Granite, Granite.$);
