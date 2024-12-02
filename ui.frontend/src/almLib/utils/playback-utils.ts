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
let playerIframe: HTMLIFrameElement | null = null;
const dispatchEvent = (eventDetail: any, event: PrimeEvent) => {
  PrimeDispatchEvent(document, event, false, eventDetail);
};

export function LaunchPlayer(props: any) {
  sendEvent(ALM_PLAYER_LAUNCH);
  if (redirectToLoginAndAbort()) {
    return;
  }
  const playerEventsHandler = (event: MessageEvent) => {
    if (event.data === "status:close" || event.data.type === ALM_PLAYER_CLOSE_FROM_PARENT) {
      getWindowObject().removeEventListener("message", playerEventsHandler);
      handlePlayerClose(props.trainingId);
      props.callBackFn && typeof props.callBackFn === "function" && props.callBackFn();
      sendEvent(ALM_PLAYER_CLOSE);
      dispatchEvent({ loId: props.trainingId }, PrimeEvent.PLAYER_CLOSE);
    } else if (event.data === "status:requiredAuth") {
      const almObject = getALMObject();
      if (!almObject.isPrimeUserLoggedIn()) {
        return;
      }

      const almConfig = getALMConfig();
      const playerAuth: { value?: string; type?: string } = {};
      playerAuth.value = almConfig.csrfToken || almObject.getAccessToken();
      playerAuth.type = almConfig.csrfToken ? "authType:csrfToken" : "authType:accessToken";
      playerIframe?.contentWindow?.postMessage(playerAuth, "*");
    }
  };

  getWindowObject().addEventListener("message", playerEventsHandler, false);

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
  playerIframe = document.createElement("iframe");
  playerIframe.style.display = "flex";
  playerIframe.src = playeURL;
  playerIframe.id = "pplayer_iframe";
  playerIframe.name = "pfplayer_frame";
  playerIframe.setAttribute("allowtransparency", "true");
  playerIframe.setAttribute("webkitallowfullscreen", "true");
  playerIframe.setAttribute("mozallowfullscreen", "true");
  playerIframe.setAttribute("msallowfullscreen", "true");
  playerIframe.setAttribute("allowfullscreen", "true");
  playerIframe.width = iframeDimension;
  playerIframe.height = iframeDimension;
  playerIframe.style.margin = "auto";
  playerIframe.style.border = "none";
  overlay.appendChild(playerIframe);

  SendMessageToParent(
    { type: PrimeEvent.PLAYER_LAUNCH, loId: props.trainingId },
    GetPrimeEmitEventLinks()
  );
  getALMObject().playerLaunchTimeStamp = Date.now();
}

function cleanUp() {
  const overlay = document.getElementById("primePlayerOverlay") as HTMLElement;
  if (playerIframe) {
    playerIframe.src = "about:blank";
    playerIframe.remove();
    playerIframe = null;
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
  let parsedHostName;
  try {
    if (typeof hostName === "string" && hostName.startsWith("http")) {
      const hostUrl = new URL(hostName);
      parsedHostName = hostUrl.hostname;
    }
  } catch (error) {
    //do nothing, hostname=hostname
  }
  parsedHostName = parsedHostName || hostName;
  const playerEndPoint = "/app/player?";
  const key = `lo_id=${trainingId}`;
  //to-do handle preview/guest
  let url = `${hostName}${playerEndPoint}${key}&hostname=${parsedHostName}&trapfocus=true&is_native=true&reset_attempt=${isResetRequired}`;
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
  if (getWindowObject().sendAuthInHeaders) {
    url = `${url}&send_auth_in_headers=true`;
  } else {
    const authKey = getAuthKey();
    url = `${url}&${authKey}`;
  }

  return url;
}
