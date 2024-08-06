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
import { SetStateAction, useCallback, useEffect, useState } from "react";
import styles from "./ALMPrimeWidgets.module.css";
import { ToastContainer, ToastQueue } from "@react-spectrum/toast";
import {
  Widget,
  Dimensions,
  PrimeEvent,
  Attributes,
  WidgetTypeNew,
} from "../../../utils/widgets/common";
import {
  randomIdGenerator,
  GetJsonParsedIfNeeded,
  updateWidgetsForLayout,
  generateWidgetsForLayout,
  ApplyWidgetOverrides,
  fixWidgetAttributes,
  configureWidgetsForLayout,
} from "../../../utils/widgets/utils";
import { ALMSimpleRowLayoutEngine } from "../ALMSimpleRowLayoutEngine";
import { debounce } from "../../../utils/catalog";
import {
  getALMConfig,
  getALMUser,
  getWidgetConfig,
  getWindowObject,
  setHomePageLayoutConfig,
} from "../../../utils/global";
import { PrimeAccount, PrimeUser } from "../../../models";
import { Provider, lightTheme } from "@adobe/react-spectrum";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";

export const PRIME_WIDGETS_LAYOUT_NAME = "prime-widgets";
const MYINTEREST_RECO_WIDGET_REF = "com.adobe.captivateprime.lostrip.myinterest";
const AOI_VIEW_TYPE_INDIVIDUAL = "individual";
export const MAX_AOI_STRIP_COUNT = 5;
export const BASE_AOI_STRIP_COUNT = 2;

const elementIdPrefix = "layout-" + randomIdGenerator() + "-";
const ALMPrimeWidgets: React.FC<{
  widgetConfig?: Widget;
}> = ({ widgetConfig }) => {
  const [widget, setWidgetConfig] = useState<Widget | undefined>(() => {
    if (widgetConfig) {
      return widgetConfig;
    }
    const config = getWidgetConfig();
    return config?.pageSetting;
  });
  const [user, setUser] = useState(null as PrimeUser | null);
  const [account, setAccount] = useState(null as PrimeAccount | null);
  const [doRefresh, setDoRefresh] = useState(false);

  const [extraStripList_lxpv, setExtraStripList_lxpv] = useState<Array<number>>([]);
  const [initDone_lxpv, setInitDone_lxpv] = useState(false);

  useEffect(() => {
    // InitRootCssProps(this);
    const init = async () => {
      document.addEventListener("keydown", keydownShortcuts_lxpv);
      const response = await getALMUser();
      setAccount(response?.user?.account || ({} as PrimeAccount));
      setUser(response?.user || ({} as PrimeUser));
      configureWidgets_lxpv(response?.user?.account);
      getWindowObject().addEventListener(
        "resize",
        debounce(() => {
          console.log("resize called");
          setTimeout(() => {
            updateLayoutConfig();
            setDoRefresh(value => !value);
          }, 100);
        }, 100)
      );
    };
    init();
  }, []);

  useEffect(() => {
    document.addEventListener(PrimeEvent.LOAD_EXTRA_STRIPS, loadMoreStrips_lxpv);
    document.addEventListener(PrimeEvent.HIDE_EXTRA_STRIPS, hideExtraStrips_lxpv);
    document.addEventListener(PrimeEvent.FORCE_RELAYOUT, doForceLayout);
    return () => {
      document.removeEventListener(PrimeEvent.LOAD_EXTRA_STRIPS, loadMoreStrips_lxpv);
      document.removeEventListener(PrimeEvent.HIDE_EXTRA_STRIPS, hideExtraStrips_lxpv);
    };
  }, [extraStripList_lxpv.length]);

  const doForceLayout = () => {
    setDoRefresh(value => !value);
  };
  const configureWidgets_lxpv = async (account: PrimeAccount | undefined) => {
    const dummyWidget = JSON.parse(JSON.stringify(widget));
    let pageSetting = dummyWidget?.attributes!.layoutConfig;

    const layoutConfigObj: any = GetJsonParsedIfNeeded(pageSetting);

    let layoutWidgetConfig = layoutConfigObj["widgets"];
    layoutWidgetConfig = configureWidgetsForLayout(layoutWidgetConfig, account!);
    layoutConfigObj["widgets"] = layoutWidgetConfig;

    const config = addBookmarkswidget_lxpv(layoutWidgetConfig);

    if (config && config.length > 0) {
      layoutWidgetConfig = config;
    }

    const widgetOverrides = dummyWidget?.attributes!.widgetOverrides || {};
    let currentWidgetCount = 0;

    for (let ii = 0; ii < layoutWidgetConfig.length; ++ii) {
      const rowWidgets = layoutWidgetConfig[ii];
      for (let jj = 0; jj < rowWidgets.length; ++jj) {
        rowWidgets[jj] = updateWidgetConfiguration_lxpv(
          elementIdPrefix,
          currentWidgetCount++,
          rowWidgets[jj],
          widgetOverrides
        );
        fixWidgetAttributes(rowWidgets[jj].attributes);
      }
    }
    const homePageLayoutConfig = {
      layoutMode: "",
      widgets: [],
    };
    setHomePageLayoutConfig(homePageLayoutConfig);
    generateWidgetsForLayout(layoutConfigObj, homePageLayoutConfig);
    dummyWidget.attributes!.layoutConfig = JSON.stringify(layoutConfigObj);
    setWidgetConfig(dummyWidget);
    setInitDone_lxpv(true);
    return onResizeInternal_lxpv();
  };

  const updateLayoutConfig = () => {
    const { homePageLayoutConfig } = getALMConfig();
    updateWidgetsForLayout(homePageLayoutConfig);
  };
  const updateWidgetConfiguration_lxpv = (
    elementIdPrefix: string,
    currentWidgetIndex: number,
    widget: Widget,
    widgetOverrides: Record<string, Attributes>
  ) => {
    ApplyWidgetOverrides(widget, widgetOverrides[widget.widgetRef]);
    widget.layoutAttributes = widget.layoutAttributes || {};
    const id = elementIdPrefix + currentWidgetIndex;
    widget.layoutAttributes!.id = id;
    return widget;
  };

  const updateDimensionsAndScroll_lxpv = () => {
    // SendDimensionsToParent(configureWidgets_lxpv());
    //this.shouldScrollPosition_lxpv = true;
    // setShouldScrollPosition_lxpv(true);
  };

  const loadMoreStrips_lxpv = (event: Event) => {
    const eventDetail = (event as CustomEvent).detail;
    if (!eventDetail || (eventDetail && !eventDetail.maxStripCount)) {
      return;
    }

    let maxStripCount = eventDetail.maxStripCount;
    if (maxStripCount > MAX_AOI_STRIP_COUNT) {
      maxStripCount = MAX_AOI_STRIP_COUNT;
    }
    let extraStripList: Widget[] = [];
    for (let i = BASE_AOI_STRIP_COUNT + 1; i <= maxStripCount; i++) {
      const widget: Widget = {
        widgetRef: MYINTEREST_RECO_WIDGET_REF,
        type: WidgetTypeNew.AOI_RECO,
        attributes: { view: AOI_VIEW_TYPE_INDIVIDUAL, stripNum: i },
        layoutAttributes: {
          id: `${elementIdPrefix}${AOI_VIEW_TYPE_INDIVIDUAL}-${i}`,
        },
      };
      extraStripList.push(widget);
    }
    const { homePageLayoutConfig } = getALMConfig();
    const extraStripListIndex: SetStateAction<number[]> = [];
    if (extraStripList.length > 0) {
      homePageLayoutConfig?.widgets.some((item: any, index: number) => {
        const returnVal = item.widgets.some((element: Widget) => {
          if (
            element.widgetRef === MYINTEREST_RECO_WIDGET_REF &&
            element.attributes?.view === AOI_VIEW_TYPE_INDIVIDUAL &&
            element.attributes?.stripNum === 2
          ) {
            extraStripList = extraStripList.map((strip: Widget) => {
              strip.layoutAttributes = {
                ...element.layoutAttributes,
                id: strip.layoutAttributes?.id,
              };
              return strip;
            });
            return true;
          }
        });
        if (returnVal) {
          const currenntWidget: any = homePageLayoutConfig.widgets[index];
          extraStripList.forEach((strip, innerIndex: number) => {
            const widget = {
              ...currenntWidget,
              widgets: [strip] as never[],
              id: randomIdGenerator(),
            };
            homePageLayoutConfig.widgets.splice(index + 1 + innerIndex, 0, widget as never);
            extraStripListIndex.push(index + 1 + innerIndex);
          });
          return true;
        }
      });
    }
    setDoRefresh(value => !value);
    setExtraStripList_lxpv(extraStripListIndex);
    updateDimensionsAndScroll_lxpv();
  };

  const hideExtraStrips_lxpv = useCallback(() => {
    const { homePageLayoutConfig } = getALMConfig();
    homePageLayoutConfig?.widgets.splice(extraStripList_lxpv[0], extraStripList_lxpv.length);
    setExtraStripList_lxpv([]);
    setDoRefresh(value => !value);
    // this.updateDimensionsAndScroll_lxpv();
    updateDimensionsAndScroll_lxpv();
  }, [extraStripList_lxpv]);

  const onResizeInternal_lxpv = (isForce?: boolean): Dimensions | undefined => {
    if (initDone_lxpv) {
      // const retval = this.onResize(isForce);
      const retval = onResize(isForce);
      // this.requestUpdate();
      return retval;
    }
    return undefined;
  };

  const onResize = (force?: boolean): Dimensions | undefined => {
    let addLeftPadding = true;
    if (widget?.widgetRef == "com.adobe.captivateprime.lostrip.myinterestLayout") {
      addLeftPadding = false;
    }
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (force) {
      window.scrollTo(scrollX, scrollY);
    }
    return;
  };

  const keydownShortcuts_lxpv = (event: any) => {
    const isAltPressed = event.altKey;
    const key = event.which || event.keyCode;
    if (isAltPressed && key > 48 && key < 53) {
      event.preventDefault();
      // SendMessageToParent(
      //   JSON.parse(JSON.stringify({type: PrimeEvent.KEYBOARD_SHORTCUTS, key: key})),
      //   GetPrimeEmitEventLinks()
      // );
    }
  };

  const addBookmarkswidget_lxpv = (widgets: Array<Array<{ widgetRef: string }>>) => {
    const bookmarkWidgetIndex = widgets.findIndex(wl =>
      wl.find(w => w.widgetRef === "com.adobe.captivateprime.lostrip.mybookmarks")
    );
    if (bookmarkWidgetIndex >= 0) {
      return;
    }
    // find mylearning widget
    const myLearningWidetIndex = widgets.findIndex(wl =>
      wl.find(w => w.widgetRef === "com.adobe.captivateprime.lostrip.mylearning")
    );
    if (myLearningWidetIndex < 0) {
      return;
    }
    // find Social, calendar or gamification
    const rowWidgetsIndex = widgets.findIndex(wl =>
      wl.find(
        w =>
          w.widgetRef === "com.adobe.captivateprime.calendar" ||
          w.widgetRef === "com.adobe.captivateprime.leaderboard" ||
          w.widgetRef === "com.adobe.captivateprime.social" ||
          w.widgetRef === "com.adobe.captivateprime.compliance"
      )
    );
    if (rowWidgetsIndex >= 0) {
      widgets.splice(rowWidgetsIndex + 1, 0, [
        { widgetRef: "com.adobe.captivateprime.lostrip.mybookmarks" },
      ]);
    } else {
      widgets.splice(myLearningWidetIndex + 1, 0, [
        { widgetRef: "com.adobe.captivateprime.lostrip.mybookmarks" },
      ]);
    }
    return widgets;
  };
  const { homePageLayoutConfig } = getALMConfig();
  return (
    <>
      <ALMErrorBoundary>
        <Provider theme={lightTheme} colorScheme={"light"}>
          {initDone_lxpv && (
            <div className={styles.container}>
              <ALMSimpleRowLayoutEngine
                config={homePageLayoutConfig}
                doRefresh={doRefresh}
                aoiStripCount={extraStripList_lxpv.length}
                account={account!}
                user={user!}
              />
            </div>
          )}
          <ToastContainer />
        </Provider>
      </ALMErrorBoundary>
    </>
  );
};

export default ALMPrimeWidgets;
