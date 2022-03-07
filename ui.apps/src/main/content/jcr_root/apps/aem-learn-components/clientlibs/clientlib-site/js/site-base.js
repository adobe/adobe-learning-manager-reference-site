window.ALM = window.ALM || {};
window.ALM.ALMConfig = window.ALM.ALMConfig || {};

(function (window, document, Granite, $) {
  "use strict";

  const CONFIG_META_TAG_NAME = "cp-config";

  const setALMConfig = () => {
    const cpConfigElmt = document.querySelector(
      'meta[name="' + CONFIG_META_TAG_NAME + '"]'
    );
    if (cpConfigElmt) {
      window.ALM.ALMConfig = JSON.parse(cpConfigElmt.content);
      const primeBaseURL = window.ALM.ALMConfig["almBaseURL"];
      const primeApiURL = `${primeBaseURL}/primeapi/v2/`;
      window.ALM.ALMConfig["primeApiURL"] = primeApiURL;
    }
  };

  const init = () => {
    setALMConfig();
  };

  const getALMConfig = () => {
    return window.ALM.ALMConfig;
  };

  const navigateToTrainingOverviewPage = (
    trainingId,
    trainingInstanceId = ""
  ) => {
    let { trainingOverviewPath } = getALMConfig();
    trainingOverviewPath = getUrl(trainingOverviewPath, {
      trainingId: trainingId,
    });
    window.location = trainingInstanceId
      ? getUrl(trainingOverviewPath, { trainingInstanceId: trainingInstanceId })
      : trainingOverviewPath;
  };

  const navigateToInstancePage = (trainingId) => {
    let { instancePath } = getALMConfig();
    window.location = getUrl(instancePath, { trainingId: trainingId });
  };

  const getUrl = (urlStr, params) => {
    const url = new URL(urlStr);
    for (const param in params) {
      url.searchParams.append(param, params[param].toString());
    }
    return url.toString();
  };

  init();

  var jsElm = document.createElement("script");
  jsElm.type = "application/javascript";
  jsElm.src = "https://cdnjs.cloudflare.com/ajax/libs/evaporate/2.1.4/evaporate.min.js";
  jsElm.async = true;
  // finally insert the element to the body element in order to load the script
  document.head.appendChild(jsElm);

  window.ALM.getALMConfig = getALMConfig;
  window.ALM.navigateToTrainingOverviewPage = navigateToTrainingOverviewPage;
  window.ALM.navigateToInstancePage = navigateToInstancePage;
})(window, document, Granite, jQuery);
