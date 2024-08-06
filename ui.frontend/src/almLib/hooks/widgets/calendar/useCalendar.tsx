/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Widget } from "../../../utils/widgets/common";
import { URLDecodeString, GetQueryParam, GetWinLocation } from "../../../utils/widgets/utils";
import { RestAdapter } from "../../../utils/restAdapter";
import { getALMConfig } from "../../../utils/global";
export function useCalendar() {
  const [config, setConfig] = useState(null);

  // useEffect(() => {
  //   let configFromDataAttr: any = {
  //     widgetConfig: { widgetRef: "com.adobe.captivateprime.calendar" },
  //     auth: { accessToken: "5bb22a03d90a07cfde7b4eb29621c5d5" },
  //     commonConfig: {
  //       captivateHostName: "https://learningmanagerstage1.adobe.com",
  //       primeapiPrefix: "/primeapi/v2",
  //       ignoreHigherOrderLOEnrollment: false,
  //       sessionUid: "m7hpal6h0k",
  //       emitPlayerLaunchEvent: true,
  //       emitPageLinkEvents: true,
  //       _contentsHostName: "https://localhost:8080",
  //     },
  //     theme: {
  //       primaryColor: "#2676ff",
  //       secondaryColor: "#0091ff",
  //       background: "#efefef",
  //       darkMode: false,
  //     },
  //     type: "acapConfig",
  //   };
  //   const primeconfig = GetQueryParam(GetWinLocation(window), "primeconfig");

  //   URLDecodeString(GetQueryParam(GetWinLocation(window), "primeconfig"));
  //   let parentWindow: Window = window;
  //   let iframeEmbedding = false;
  // if (!configFromDataAttr) {
  //   // console.log("Running in iframe possibly");
  //   iframeEmbedding = true;
  //   parentWindow = window.parent; //assuming iframe
  // //   if (!devConfigToUse) {
  // //     if (parentWindow == window) {
  // //       //dev Mode
  // //       throw "config not provided";
  // //     }
  // //   }
  //   function onMessageHandler(evt: MessageEvent) {
  //     console.log("Prime Widget: Got message", evt.data);
  //     if (evt.data) {
  //       try {
  //         let evtDataObj = evt.data;
  //         let evtDataStr = evt.data;
  //         if (typeof evt.data === "string") {
  //           evtDataObj = JSON.parse(evt.data);
  //         } else {
  //           evtDataStr = JSON.stringify(evt.data);
  //         }
  //         if ("acapConfig" == evtDataObj["type"]) {
  //           configFromDataAttr = evtDataStr;
  //           console.log("configFromDataAttr iframe", configFromDataAttr);
  //           evt.preventDefault();
  //         } else if ("acapSkipLinkClicked" == evtDataObj["type"]) {
  //           if (rootEl) {
  //             rootEl.focusFirstFocusableElement(evtDataObj.widgetRef);
  //             evt.preventDefault();
  //           }
  //         } else {
  //           console.log(
  //             `Ignoring msg event in widgetUtil. Evt type -> ${evtDataObj["type"]}`
  //           );
  //         }
  //       } catch (ex) {
  //         console.log(`${evt.data} unknown type ${ex}`);
  //       }
  //     }
  //   }
  //   window.addEventListener("message", onMessageHandler, false);
  // }
  //   setConfig(configFromDataAttr);
  // }, []);

  const getCPrimeCalendarData = async (userId: string) => {
    const baseApiUrl = getALMConfig().primeApiURL;
    let response: any = await RestAdapter.get({
      url: `${baseApiUrl}/users/${userId}/calendar`,
      params: {
        include: "course,containerLO,course.enrollment,course.instances,room",
        "filter.allSessions": true,
        omitDeprecated: true,
      },
    });
    const parsedResponse = JSON.parse(response);
    return parsedResponse;
  };
  const getCities = async () => {
    const baseApiUrl = getALMConfig().primeApiURL;
    const response: any = await RestAdapter.get({
      url: `${baseApiUrl}/data`,
      params: { "filter.cityName": true },
    });
    const citiesResponse = JSON.parse(response);

    return citiesResponse.data.attributes.names || [];
  };
  return {
    config,
    getCPrimeCalendarData,
    getCities,
  };
}
