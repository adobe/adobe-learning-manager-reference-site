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

(function (document, $) {
  "use strict";

  const ALM = window.ALM || {};

  const LEARNER_PREFIX =
    "/app/learner?accountId=${accountId}&i_qp_user_id=${userId}";
  const ALM_LINKS_MAP = new Map()
    .set("coursePageLink", ["loOverview", "course", new RegExp(/course\/(\d+)\/overview/i)])
    .set("certPageLink", ["loOverview", "certification", new RegExp(/certification\/(\d+)\/overview/i)])
    .set("lpPageLink", ["loOverview", "learningProgram", new RegExp(/learningProgram\/(\d+)\/overview/i)])
    .set("ciPageLink", ["loInstance", "course", new RegExp(/courseInstance\/(\d+)/i)])
    .set("lpiPageLink", ["loInstance", "learningProgram", new RegExp(/lpInstance\/(\d+)/i)])
    .set("catalogOverviewPageLink", ["catalogOverview", "catalog", new RegExp(/selectedListableCatalogIds=(\d+)/i)])
    .set("courseInstancePreviewPageLink", ["loInstancePreview", "course", new RegExp(/course\/(\d+)\/instance\/(\d+)\/preview\??(.*)/i)])
    .set("courseInstancePreviewPageShowLink", ["loInstancePreview", "course", new RegExp(/course\/(\d+)\/instance\/(\d+)\/preview\??(.*)/i)])
    .set("catalogPageLink", ["catalogPage"])
    .set("myLearningPageLink", ["myLearningPage"])
    .set("postsLink", ["boardsPage"])
    .set("allboardsPageLink", ["boardsPage"]);

  const WIDET_CONFIG_DATA = "data-cp-widget-configs",
    WIDGET_REF_DATA = "cp-widget-ref",
    DATA_RUN_MODE = "cp-runmode",
    WIDGET_WRAPPER_DIV = ".cpWidgetWrapperDiv",
    WIDGET_COMMUNICATOR_URL = "cp-widget-communicator-url",
    AOI_WIDGET_REF = "com.adobe.captivateprime.lostrip.myinterestLayout";

  let scriptLoaded = false;

  $(document).ready(function () {
    loadWidgetCommunicatorScript().then(function (data) {
      $(WIDGET_WRAPPER_DIV).each(function (e) {
        let rendered = $(this).attr("rendered");

        if (rendered === "true") {
          return true;
        }

        $(this).attr("rendered", true);
        let configsDivWrapper = $(this).find("div").first();
        let widgetConfigObj = {};
        let widgetConfigs = configsDivWrapper.attr(WIDET_CONFIG_DATA);
        if (widgetConfigs) {
          widgetConfigObj = JSON.parse(widgetConfigs);
        }

        if ((AOI_WIDGET_REF !== widgetConfigObj.widgetRefSelected) && (widgetConfigObj.widgetConfig)
            && (widgetConfigObj.widgetConfig.attributes)) {
          delete widgetConfigObj.widgetConfig.attributes.layoutConfig;
        }

        widgetConfigObj.auth.accessToken = ALM.getAccessToken();
        let containerObj = $(this).get(0);
        let ref = configsDivWrapper.data(WIDGET_REF_DATA);

        let isAuthorMode =
          configsDivWrapper.data(DATA_RUN_MODE) === "author" ? true : false;

        let primeWidget = window.primecommunicator.createWidget({
          previewMode: isAuthorMode,
          host: "aem",
          ref: ref,
          config: widgetConfigObj,
          container: containerObj,
          initialWidth: 300,
          initialHeight: 200,
          autoFitWidth: false,
          autoFitHeight: true,
          sendPrimeLinksThroughCallback: true,
          callbackFn: handleEvents,
        });
      });
    });
  });

  function handleEvents(e) {
    if (e.changeType === "primelink") {
      let almLinksMapObj = ALM_LINKS_MAP.get(e.path);
      let pageType = almLinksMapObj[0];
      let loType, loId;

      switch (pageType) {
        case "loOverview":
          loType = almLinksMapObj[1];
          loId = e.route.match(almLinksMapObj[2])[1];
          window.ALM.navigateToTrainingOverviewPage(loType + ":" + loId);
          break;

        case "loInstance":
          loType = almLinksMapObj[1];
          loId = e.route.match(almLinksMapObj[2])[1];
          window.ALM.navigateToInstancePage(loType + ":" + loId);
          break;

        case "loInstancePreview":
          loType = almLinksMapObj[1];
          const match = e.route.match(almLinksMapObj[2]);
          loId = match[1];
          const instanceId = match[2];
          const queryParams = match[3];
          window.ALM.navigateToTrainingOverviewPage(loType + ":" + loId, loType + ":" + loId + "_" + instanceId, queryParams);
          break;

        case "catalogOverview":
          let catalogIds = e.route.match(almLinksMapObj[2])[1];
          window.ALM.navigateToCatalogPage(catalogIds);
          break;

        case "catalogPage":
          window.ALM.navigateToExplorePage();
          break;

        case "myLearningPage":
          window.ALM.navigateToCatalogPageForStates("enrolled");
          break;

        case "boardsPage":
          window.ALM.navigateToBoardsPage();
          break;
          
        default:
          break;
      }
    }
  }

  function loadWidgetCommunicatorScript() {
    if (!scriptLoaded) {
      let configsDivWrapper = $(WIDGET_WRAPPER_DIV).first().find("div").first();
      let url = configsDivWrapper.data(WIDGET_COMMUNICATOR_URL);
      return $.ajax({
        url: url,
        async: false,
        dataType: "script",
      })
        .done(function (data, textStatus, jqXHR) {
          scriptLoaded = true;
        })
        .fail(function (jqxhr, settings, exception) {
          if (typeof console !== "undefined" && console.error) {
            console.error("error in loading widget communicator script");
          }
        });
    }
  }
})(document, jQuery);
