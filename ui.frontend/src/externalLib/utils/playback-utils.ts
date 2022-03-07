import { getALMConfig, getWindowObject } from "./global";
// let currenttrainingId = "";

export function LaunchPlayer(props: any) {
  const ClosePlayer = (event: MessageEvent) => {
    if (event.data === "status:close") {
      handlePlayerClose(props.trainingId);
      props.callBackFn &&
        typeof props.callBackFn == "function" &&
        props.callBackFn();
    }
  };
  getWindowObject().addEventListener("message", ClosePlayer, false);
  const playeURL: string = GetPlayerURl(props.trainingId, props.moduleId);
  cleanUp();
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
  iframe.width = "70%";
  iframe.height = "70%";
  iframe.style.margin = "auto";
  iframe.style.border = "none";
  overlay.appendChild(iframe);
  //   const msg = {
  //     type: "endpointmsg",
  //     data: {
  //       accessToken: getALMConfig().accessToken,
  //     },
  //   };
  // iframe["contentWindow"]?.postMessage(JSON.stringify(msg), "*");

  // currenttrainingId = trainingId;
  //   GetPrimeObj()._playerLaunchTimeStamp = Date.now();
}

function cleanUp() {
  const overlay = <HTMLElement>document.getElementById("primePlayerOverlay");
  const iframe = <HTMLIFrameElement>document.getElementById("pplayer_iframe");
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

export function GetPlayerURl(trainingId = "", moduleId = ""): string {
  const primeConfig = getALMConfig();
  const hostName = primeConfig.almBaseURL;
  const playerEndPoint = "/app/player?";
  const key = `lo_id=${trainingId}`;
  const accessToken = primeConfig.accessToken;
  const authKey = `access_token=${accessToken}`;
  //to-do handle preview/guest
  let url = `${hostName}${playerEndPoint}${key}&${authKey}&hostname=${hostName}&trapfocus=true`;
  if (moduleId) {
    url += `&module_id=${moduleId}`;
  }
  return url;
}
