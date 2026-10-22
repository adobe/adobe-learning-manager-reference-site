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
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import styles from './ALMPrimeWidgets.module.css';
import { ToastContainer, ToastQueue } from '@react-spectrum/toast';
import {
  Widget,
  Dimensions,
  PrimeEvent,
  Attributes,
  WidgetType,
  WidgetTypeNew,
} from '../../../utils/widgets/common';
import {
  randomIdGenerator,
  GetJsonParsedIfNeeded,
  updateWidgetsForLayout,
  generateWidgetsForLayout,
  ApplyWidgetOverrides,
  fixWidgetAttributes,
  configureWidgetsForLayout,
} from '../../../utils/widgets/utils';
import { ALMSimpleRowLayoutEngine } from '../ALMSimpleRowLayoutEngine';
import { debounce } from '../../../utils/catalog';
import {
  getALMConfig,
  getALMUser,
  getWidgetConfig,
  getWindowObject,
  setHomePageLayoutConfig,
  GetPrimeEmitEventLinks,
} from '../../../utils/global';
import { SendMessageToParent } from '../../../utils/widgets/base/EventHandlingBase';
import { PrimeAccount, PrimeUser } from '../../../models';
import { Provider, lightTheme } from '@adobe/react-spectrum';
import { ALMErrorBoundary } from '../../Common/ALMErrorBoundary';

export const PRIME_WIDGETS_LAYOUT_NAME = 'prime-widgets';
const MYINTEREST_RECO_WIDGET_REF = 'com.adobe.captivateprime.lostrip.myinterest';
const AOI_VIEW_TYPE_INDIVIDUAL = 'individual';
export const MAX_AOI_STRIP_COUNT = 5;
export const BASE_AOI_STRIP_COUNT = 2;

const elementIdPrefix = 'layout-' + randomIdGenerator() + '-';
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
  const [personalizedPathRefreshKey, setPersonalizedPathRefreshKey] = useState(0);

  useEffect(() => {
    function handlePathCreatedMessage(event: MessageEvent) {
      if (event.data?.type === 'ALM_CHAT_PERSONALIZED_PATH_CREATED') {
        setPersonalizedPathRefreshKey(k => k + 1);
      }
    }
    window.addEventListener('message', handlePathCreatedMessage);
    return () => {
      window.removeEventListener('message', handlePathCreatedMessage);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('home-bg-class-transparent');
    return () => {
      document.body.classList.remove('home-bg-class-transparent');
    };
  }, []);
  useEffect(() => {
    // InitRootCssProps(this);
    const init = async () => {
      document.addEventListener('keydown', keydownShortcuts_lxpv);
      const response = await getALMUser();
      setAccount(response?.user?.account || ({} as PrimeAccount));
      setUser(response?.user || ({} as PrimeUser));
      configureWidgets_lxpv(response?.user);
      getWindowObject().addEventListener(
        'resize',
        debounce(() => {
          console.log('resize called');
          setTimeout(() => {
            updateLayoutConfig();
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
    document.addEventListener(PrimeEvent.ALM_RESIZE_STRIP, updateLayoutConfig);
    return () => {
      document.removeEventListener(PrimeEvent.LOAD_EXTRA_STRIPS, loadMoreStrips_lxpv);
      document.removeEventListener(PrimeEvent.HIDE_EXTRA_STRIPS, hideExtraStrips_lxpv);
      document.removeEventListener(PrimeEvent.ALM_RESIZE_STRIP, updateLayoutConfig);
    };
  }, [extraStripList_lxpv.length]);

  const doForceLayout = () => {
    setDoRefresh(value => !value);
  };
  const configureWidgets_lxpv = async (user: PrimeUser | undefined) => {
    const dummyWidget = JSON.parse(JSON.stringify(widget));
    let pageSetting = dummyWidget?.attributes!.layoutConfig;

    const layoutConfigObj: any = GetJsonParsedIfNeeded(pageSetting);

    let layoutWidgetConfig = layoutConfigObj['widgets'];
    layoutWidgetConfig = configureWidgetsForLayout(layoutWidgetConfig, user!);
    layoutConfigObj['widgets'] = layoutWidgetConfig;

    addVirtualCoachWidget_lxpv(layoutWidgetConfig, user?.account);
    addPersonalizedPathWidget_lxpv(layoutWidgetConfig, user?.account);
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
      layoutMode: '',
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
    setDoRefresh(value => !value);
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
    if (widget?.widgetRef == 'com.adobe.captivateprime.lostrip.myinterestLayout') {
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
      SendMessageToParent(
        JSON.parse(JSON.stringify({ type: PrimeEvent.KEYBOARD_SHORTCUTS, key: key })),
        GetPrimeEmitEventLinks()
      );
    }
  };

  const addBookmarkswidget_lxpv = (widgets: Array<Array<{ widgetRef: string }>>) => {
    const bookmarkWidgetIndex = widgets.findIndex(wl =>
      wl.find(w => w.widgetRef === 'com.adobe.captivateprime.lostrip.mybookmarks')
    );
    if (bookmarkWidgetIndex >= 0) {
      return;
    }
    // find mylearning widget
    const myLearningWidetIndex = widgets.findIndex(wl =>
      wl.find(w => w.widgetRef === 'com.adobe.captivateprime.lostrip.mylearning')
    );
    if (myLearningWidetIndex < 0) {
      return;
    }
    // find Social, calendar or gamification
    const rowWidgetsIndex = widgets.findIndex(wl =>
      wl.find(
        w =>
          w.widgetRef === 'com.adobe.captivateprime.calendar' ||
          w.widgetRef === 'com.adobe.captivateprime.leaderboard' ||
          w.widgetRef === 'com.adobe.captivateprime.social' ||
          w.widgetRef === 'com.adobe.captivateprime.compliance'
      )
    );
    if (rowWidgetsIndex >= 0) {
      widgets.splice(rowWidgetsIndex + 1, 0, [
        { widgetRef: 'com.adobe.captivateprime.lostrip.mybookmarks' },
      ]);
    } else {
      widgets.splice(myLearningWidetIndex + 1, 0, [
        { widgetRef: 'com.adobe.captivateprime.lostrip.mybookmarks' },
      ]);
    }
    return widgets;
  };
  const addVirtualCoachWidget_lxpv = (
    widgets: Array<Array<{ widgetRef: string; id: string }>>,
    account?: PrimeAccount
  ) => {
    const guest = getALMConfig().guest;
    if (!guest && account?.enableAiCoach) {
      const mastheadWidgetIndex = widgets.findIndex(wl =>
        wl.find(w => w.widgetRef === 'com.adobe.captivateprime.masthead')
      );
      if (mastheadWidgetIndex >= 0) {
        widgets.splice(mastheadWidgetIndex + 1, 0, [
          {
            id: 'alm.strip.virtualcoach',
            widgetRef: 'com.adobe.captivateprime.lostrip.virtualcoach',
          },
        ]);
      }
    }
  };

  const addPersonalizedPathWidget_lxpv = (
    widgets: Array<Array<{ widgetRef: string; id: string }>>,
    account?: PrimeAccount
  ) => {
    if (!account?.personalizedPathEnabled) {
      return;
    }
    const alreadyPresent = widgets.some(wl =>
      wl.find(w => w.widgetRef === WidgetType.PERSONALIZED_PATH_STRIP)
    );
    if (alreadyPresent) {
      return;
    }
    const myLearningIndex = widgets.findIndex(wl =>
      wl.find(w => w.widgetRef === WidgetType.MYLEARNING)
    );
    const insertAfter = myLearningIndex >= 0 ? myLearningIndex : widgets.length - 1;
    widgets.splice(insertAfter + 1, 0, [
      {
        id: 'alm.strip.personalizedpathstrip',
        widgetRef: WidgetType.PERSONALIZED_PATH_STRIP as string,
      },
    ]);
  };
  const { homePageLayoutConfig } = getALMConfig();
  return (
    <>
      <ALMErrorBoundary>
        <Provider theme={lightTheme} colorScheme={'light'}>
          {initDone_lxpv && (
            <div className={styles.container}>
              <ALMSimpleRowLayoutEngine
                config={homePageLayoutConfig}
                doRefresh={doRefresh}
                aoiStripCount={extraStripList_lxpv.length}
                account={account!}
                user={user!}
                personalizedPathRefreshKey={personalizedPathRefreshKey}
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
