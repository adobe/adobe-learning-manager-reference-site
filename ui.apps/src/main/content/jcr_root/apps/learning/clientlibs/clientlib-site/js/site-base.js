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


  const navigateToBoardDetailsPage = (boardId) => {
    let { communityBoardDetailsPath } = getALMConfig();
    window.location = getUrl(communityBoardDetailsPath, { boardId: boardId });
  };

  const navigateToCatalogPage = (catalogIds) => {
    let { catalogPath } = getALMConfig();
    let catalogUrl = catalogPath + "?catalogs=" + catalogIds;
    window.location = catalogUrl;
  };

  const navigateToBoardsPage = (skillNames) => {
    let {communityBoardsPath} = getALMConfig();
    let boardsUrl = communityBoardsPath + "?skill=" + skillNames;
    window.location = boardsUrl;
  }

  const navigateToHomePage = () => {
    let {homePath} = getALMConfig();
    window.location = homePath;
  }

  const navigateToLearningPage = () => {
    let {learningPath} = getALMConfig();
    window.location = learningPath;
  }

  const navigateToCommunityPage = () => {
    let {communityPath} = getALMConfig();
    window.location = communityPath;
  }

  const navigateToSupportPage = () => {
    let {supportPath} = getALMConfig();
    window.location = supportPath;
  }

  const getUrl = (urlStr, params) => {
    for (const param in params) {
      urlStr = `${urlStr}/${param}/${params[param]}`;
    }
    return urlStr;
  };

  init();

  window.ALM.getALMConfig = getALMConfig;
  window.ALM.navigateToTrainingOverviewPage = navigateToTrainingOverviewPage;
  window.ALM.navigateToInstancePage = navigateToInstancePage;
  window.ALM.navigateToCatalogPage = navigateToCatalogPage;
  window.ALM.navigateToBoardDetailsPage = navigateToBoardDetailsPage;
  window.ALM.navigateToBoardsPage = navigateToBoardsPage;
  window.ALM.navigateToHomePage = navigateToHomePage;
  window.ALM.navigateToLearningPage = navigateToLearningPage;
  window.ALM.navigateToCommunityPage = navigateToCommunityPage;
  window.ALM.navigateToSupportPage = navigateToSupportPage;
})(window, document, Granite, jQuery);