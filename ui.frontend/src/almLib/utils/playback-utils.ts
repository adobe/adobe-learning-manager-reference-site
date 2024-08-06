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
import { ALM_PLAYER_CLOSE, ALM_PLAYER_CLOSE_FROM_PARENT, ALM_PLAYER_LAUNCH } from "./constants";
import {
  getALMConfig,
  getALMObject,
  getAuthKey,
  GetPrimeEmitEventLinks,
  getWindowObject,
  redirectToLoginAndAbort,
  sendEvent,
} from "./global";
import { getLocale } from "./translationService";
import { PrimeDispatchEvent, SendMessageToParent } from "./widgets/base/EventHandlingBase";
import { PrimeEvent } from "./widgets/common";
// let currenttrainingId = "";

const dispatchEvent = (eventDetail: any, event: PrimeEvent) => {
  PrimeDispatchEvent(document, event, false, eventDetail);
};

export function LaunchPlayer(props: any) {
  sendEvent(ALM_PLAYER_LAUNCH);
  if (redirectToLoginAndAbort()) {
    return;
  }
  const ClosePlayer = (event: MessageEvent) => {
    if (event.data === "status:close" || event.data.type === ALM_PLAYER_CLOSE_FROM_PARENT) {
      getWindowObject().removeEventListener("message", ClosePlayer);
      handlePlayerClose(props.trainingId);
      props.callBackFn && typeof props.callBackFn === "function" && props.callBackFn();
      sendEvent(ALM_PLAYER_CLOSE);
      dispatchEvent({ loId: props.trainingId }, PrimeEvent.PLAYER_CLOSE);
    }
  };

  getWindowObject().addEventListener("message", ClosePlayer, false);

  const playeURL: string = GetPlayerURl(
    props.trainingId,
    props.moduleId,
    props.instanceId,
    props.isMultienrolled,
    props.note_id,
    props.note_position,
    props.isResetRequired
  );
  cleanUp();
  const iframeDimension = props?.playerDimension || "100%";
  const overlay = document.createElement("div");
  overlay.id = "primePlayerOverlay";
  overlay.style.display = "grid";
  overlay.style.position = "fixed";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "0";
  overlay.style.backgroundColor = "rgba(0,0,0,0.95)";
  overlay.style.zIndex = "100";
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  const iframe = document.createElement("iframe");
  iframe.style.display = "flex";
  iframe.src = playeURL;
  iframe.id = "pplayer_iframe";
  iframe.name = "pfplayer_frame";
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("webkitallowfullscreen", "true");
  iframe.setAttribute("mozallowfullscreen", "true");
  iframe.setAttribute("msallowfullscreen", "true");
  iframe.setAttribute("allowfullscreen", "true");
  iframe.width = iframeDimension;
  iframe.height = iframeDimension;
  iframe.style.margin = "auto";
  iframe.style.border = "none";
  overlay.appendChild(iframe);

  SendMessageToParent(
    { type: PrimeEvent.PLAYER_LAUNCH, loId: props.trainingId },
    GetPrimeEmitEventLinks()
  );
  getALMObject().playerLaunchTimeStamp = Date.now();
}

function cleanUp() {
  const overlay = document.getElementById("primePlayerOverlay") as HTMLElement;
  const iframe = document.getElementById("pplayer_iframe") as HTMLIFrameElement;
  if (iframe) {
    iframe.src = "about:blank";
    iframe.remove();
  }
  if (overlay) {
    overlay.style.display = "none";
    overlay.remove();
  }
  document.body.style.overflow = "hidden scroll";
}

function handlePlayerClose(trainingId: string) {
  if (!trainingId) {
    return;
  }
  cleanUp();
}

export function GetPlayerURl(
  trainingId = "",
  moduleId = "",
  instanceId = "",
  isMultienrolled: boolean,
  note_id: "",
  note_position: "",
  isResetRequired = false
): string {
  const primeConfig = getALMConfig();
  const hostName = primeConfig.almBaseURL;
  const playerEndPoint = "/app/player?";
  const key = `lo_id=${trainingId}`;
  const authKey = getAuthKey();
  //to-do handle preview/guest
  let url = `${hostName}${playerEndPoint}${key}&${authKey}&hostname=${hostName}&trapfocus=true&is_native=true&reset_attempt=${isResetRequired}`;
  if (moduleId) {
    url = `${url}&module_id=${moduleId}`;
  }
  const locale = getLocale(primeConfig.pageLocale);
  if (locale) {
    url = `${url}&locale=${locale}`;
  }
  if (instanceId) {
    url = `${url}&instance_id=${instanceId}`;
    if (isMultienrolled) {
      url = `${url}&is_multienrolled=true`;
    }
  }
  if (note_id && note_position) {
    url = `${url}&note_position=${note_position}&note_id=${note_id}`;
  }
  return url;
}
