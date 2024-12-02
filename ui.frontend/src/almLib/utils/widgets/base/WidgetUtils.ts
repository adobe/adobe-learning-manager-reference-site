// import {setupWidgets} from '../utils/init';
// import {
//   GetPrimeWindow,
//   GetCustomElement,
//   GetRootAppCdnPath as GetInitialRootAppCdnPath,
//   GetPrimeHostName,
// } from '../windowWrapper';
// import {Widget, PrimeEvent} from '../common';
// import {render} from 'lit-html';
// import {
//   randomIdGenerator,
//   GetEmptyPromise,
//   LoadScript,
//   CalcualteIfMobile,
//   GetQueryParam,
//   URLDecodeString,
//   GetWinLocation,
// } from '../utils/utils';
// import {PrimeComponentBase} from './PrimeComponentBase';
// import {SetUpLinkHooks, SendDimensionsToParent, PrimeLogInit} from './EventHandlingBase';
// import {PrimeWidgets} from '../layout/prime-widgets';
// const _fontLoading = require('./FontLoading');

// _fontLoading;

// let rootAppCdnPath = GetInitialRootAppCdnPath();
// const currentScript: HTMLScriptElement = document.currentScript as HTMLScriptElement;
// if (!rootAppCdnPath) {
//   //mostly dev mode
//   const currentScriptPath: string = (currentScript as any).src;
//   rootAppCdnPath = new URL('../', new URL(currentScriptPath)).href;
// }
// // console.log("widgets folder path", rootAppCdnPath);
// let configFromDataAttr: any = URLDecodeString(GetQueryParam(GetWinLocation(window), 'primeconfig'));
// let parentWindow: Window = window;
// let iframeEmbedding = false;
// let rootEl: PrimeComponentBase | PrimeWidgets | null;
// // console.log("configFromDataAttr script", configFromDataAttr);

// async function startSetup(_elementName: string, devConfigToUse?: string) {
//   devConfigToUse = devConfigToUse || configFromDataAttr;
//   if (!devConfigToUse) {
//     throw new Error('Config is not sent.');
//   }

//   return setupWidgets(rootAppCdnPath!, devConfigToUse).then((widgetConfig: Widget) => {
//     if ((<any>widgetConfig).isDummy) {
//       return;
//     }
//     // if(addBrightcove) {
//     //     var brightCoveScript = document.createElement("script");
//     //     brightCoveScript.src = `//players.brightcove.net/${GetBrightCoveAccountId()}/default_default/index.min.js`;
//     //     //console.log(GetBrightCoveAccountId);
//     //     //brightCoveScript.src = `//players.brightcove.net/2890187661001/default_default/index.min.js`;
//     //     document.body.appendChild(brightCoveScript);
//     // }
//     LoadScript(
//       document.head || document.body,
//       GetPrimeHostName() + '/app/primeworkers?name=lepclientlog&redirect=true',
//       true
//     ).then(function () {
//       PrimeLogInit();
//     });

//     const customEl = GetCustomElement(widgetConfig.widgetRef);
//     let widgetParentEl: Element | undefined = undefined;
//     if (widgetConfig.querySelector) {
//       const parentEl = document.querySelector(widgetConfig.querySelector);
//       if (parentEl) {
//         widgetParentEl = parentEl;
//       }
//     }
//     if (widgetParentEl == undefined) {
//       const containerEl = document.createElement('div');
//       // containerEl.className = "prime-auto-container";
//       document.body.appendChild(containerEl);
//       widgetParentEl = containerEl;
//     }
//     SetUpLinkHooks(parentWindow, widgetParentEl);
//     const rootIdToUse = 'root-' + randomIdGenerator();
//     widgetConfig.layoutAttributes = widgetConfig.layoutAttributes || {};
//     widgetConfig.layoutAttributes.id = rootIdToUse;
//     widgetConfig.layoutAttributes.isRoot = true;

//     function updateRootElement() {
//       if (!rootEl) {
//         rootEl = <PrimeComponentBase>document.getElementById(rootIdToUse);

//         rootEl.addEventListener(PrimeEvent.FORCE_RELAYOUT, () => {
//           if (rootEl && rootEl.onResize) {
//             SendDimensionsToParent(rootEl.onResize(true));
//           }
//         });
//       }
//     }

//     GetPrimeWindow().addEventListener('resize', () => {
//       // console.log("resize called");
//       setTimeout(() => {
//         updateRootElement();
//         if (rootEl && rootEl.onResize) {
//           CalcualteIfMobile();
//           SendDimensionsToParent(rootEl.onResize());
//         }
//       }, 100);
//     });
//     render(customEl.getHTML(widgetConfig), widgetParentEl);
//     updateRootElement();
//     rootEl!.widget = widgetConfig;
//     return rootEl!;
//   });
// }

// //export function InitWidget(elementName: string, addBrightcove?: boolean) {
// export async function InitWidget(_elementName: string, devConfigToUse?: string) {
//   const retval = GetEmptyPromise();
//   if (!configFromDataAttr) {
//     // console.log("Running in iframe possibly");
//     iframeEmbedding = true;
//     parentWindow = window.parent; //assuming iframe
//     if (!devConfigToUse) {
//       if (parentWindow == window) {
//         //dev Mode
//         throw 'config not provided';
//       }
//     }
//     function onMessageHandler(evt: MessageEvent) {
//       console.log('Prime Widget: Got message', evt.data);
//       if (evt.data) {
//         try {
//           let evtDataObj = evt.data;
//           let evtDataStr = evt.data;
//           if (typeof evt.data === 'string') {
//             evtDataObj = JSON.parse(evt.data);
//           } else {
//             evtDataStr = JSON.stringify(evt.data);
//           }
//           if ('acapConfig' == evtDataObj['type']) {
//             configFromDataAttr = evtDataStr;
//             console.log('configFromDataAttr iframe', configFromDataAttr);
//             evt.preventDefault();
//           } else if ('acapSkipLinkClicked' == evtDataObj['type']) {
//             if (rootEl) {
//               rootEl.focusFirstFocusableElement(evtDataObj.widgetRef);
//               evt.preventDefault();
//             }
//           } else {
//             console.log(`Ignoring msg event in widgetUtil. Evt type -> ${evtDataObj['type']}`);
//           }
//         } catch (ex) {
//           console.log(`${evt.data} unknown type ${ex}`);
//         }
//       }
//     }
//     window.addEventListener('message', onMessageHandler, false);
//   }

//   function onLoad() {
//     let counter = 0;
//     const interval = setInterval(function () {
//       if (configFromDataAttr || devConfigToUse || counter >= 1000) {
//         //20 seconds timeout
//         parentWindow.postMessage({type: PrimeEvent.CONFIG_LOADED}, '*');
//         clearInterval(interval);
//         (function () {
//           startSetup(_elementName, configFromDataAttr || devConfigToUse)
//             .then(rootEl => {
//               retval.resolve(rootEl);
//             })
//             .catch(ex => {
//               retval.reject(ex);
//             });
//         })();
//       } else if (iframeEmbedding) {
//         //send message to parent
//         counter++;
//         parentWindow.postMessage({type: 'acapSendConfig'}, '*');
//       }
//     }, 20);
//   }

//   if (iframeEmbedding) {
//     GetPrimeWindow().onload = onLoad;
//   } else {
//     onLoad();
//   }
//   return retval;
// }
export {};
