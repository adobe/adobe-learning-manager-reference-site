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
import { useCallback, useEffect } from 'react';
import { PrimeEvent, Widget, WidgetTypeNew } from '../../../utils/widgets/common';
import React from 'react';
import { ALMPrimeStrip } from '../ALMPrimeStrip';
import { ALMPrimeRecommendations } from '../ALMPrimeRecommendations';

import { CalendarWidget } from '../../CalendarWidget';
import styles from './ALMSimpleRowLayoutEngine.module.css';
import { PrimeAccount, PrimeUser } from '../../../models';
import { ALMSocialLearning } from '../ALMSocialLearningWidget';
import { ALMLeaderboard } from '../ALMLeaderboard';
import { ALMCompliance } from '../ALMComplianceWidget';
import { ALMMasthead } from '../../Masthead';
import { sendSkipLinksEvent } from '../ALMPrimeStrip/ALMPrimeStrip.helper';
import { debounce } from '../../../utils/catalog';

const ALMSimpleRowLayoutEngine: React.FC<{
  config: any;
  doRefresh: boolean;
  aoiStripCount: any;
  account: PrimeAccount;
  user: PrimeUser;
  personalizedPathRefreshKey?: number;
}> = ({ config, doRefresh, aoiStripCount, account, user, personalizedPathRefreshKey = 0 }) => {
  // Define before useEffect so TypeScript knows the explicit signature
  const sendSkipLinksData = (event?: CustomEvent) => {
    const recommendationsStripList: Widget[] = event?.detail?.recommendationsStripList || [];
    sendSkipLinksEvent(config.widgets, recommendationsStripList);
  };

  useEffect(() => {
    const debouncedSendSkipLinksData = debounce(sendSkipLinksData, 5000);
    // Wrap in arrow function to properly type the event
    const handleWidgetsToRender = (e: Event) => debouncedSendSkipLinksData(e as CustomEvent);

    document.addEventListener(PrimeEvent.WIDGETS_TO_RENDER, handleWidgetsToRender);
    // Send skip links immediately on mount so Tab key works right after page load
    sendSkipLinksData();

    return () => {
      document.removeEventListener(PrimeEvent.WIDGETS_TO_RENDER, handleWidgetsToRender);
    };
  }, []);

  const getComponentTemplate = useCallback(
    (widget: Widget) => {
      switch (widget.type) {
        case WidgetTypeNew.MASTHEAD:
          return (
            <div className={`${styles.singleWidgetContainer} ${styles.mastheadContainer}`}>
              <ALMMasthead widget={widget}></ALMMasthead>
            </div>
          );

        case WidgetTypeNew.MYLEARNING:
        case WidgetTypeNew.RECOMMENDATIONS_STRIP:
        case WidgetTypeNew.ADMIN_RECO:
        case WidgetTypeNew.BOOKMARKS:
        case WidgetTypeNew.VIRTUAL_COACH:
        case WidgetTypeNew.TRENDING_RECO:
        case WidgetTypeNew.AOI_RECO:
        case WidgetTypeNew.DISCOVERY_RECO:
        case WidgetTypeNew.CATALOG:
          return (
            <ALMPrimeStrip
              widget={widget}
              doRefresh={doRefresh}
              aoiStripCount={aoiStripCount}
              account={account}
              user={user}
            />
          );

        case WidgetTypeNew.CALENDAR:
          return (
            <div className={styles.singleWidgetContainer}>
              <CalendarWidget widget={widget} doRefresh={doRefresh}></CalendarWidget>
            </div>
          );
        case WidgetTypeNew.GAMIFICATION:
          return (
            <div className={styles.singleWidgetContainer}>
              <ALMLeaderboard widget={widget} doRefresh={doRefresh} user={user}></ALMLeaderboard>
            </div>
          );
        case WidgetTypeNew.SOCIAL:
          return (
            <div className={styles.singleWidgetContainer}>
              <ALMSocialLearning widget={widget} />
            </div>
          );
        case WidgetTypeNew.COMPLIANCE:
          return (
            <div className={styles.singleWidgetContainer}>
              <ALMCompliance
                widget={widget}
                doRefresh={doRefresh}
                isComplianceLabelEnabled={account.showComplianceLabel}
                complianceLabelDefaultValueId={account.complianceLabelDefaultValueId}
              />
            </div>
          );
        case WidgetTypeNew.RECOMMENDATIONS: {
          return <ALMPrimeRecommendations widget={widget} doRefresh={doRefresh} />;
        }
        case WidgetTypeNew.FOOTER:
          return (
            <div className={styles.singleWidgetContainer}>{/* LOAD FOOTER COMPONENT HERE */}</div>
          );
        case WidgetTypeNew.CATALOG_BROWSER:
          return account.catalogsVisible ? (
            <ALMPrimeStrip
              widget={widget}
              doRefresh={doRefresh}
              aoiStripCount={aoiStripCount}
              account={account}
              user={user}
            />
          ) : null;
        case WidgetTypeNew.PERSONALIZED_PATH_STRIP:
          return (
            <ALMPrimeStrip
              key={`self-learning-paths-${personalizedPathRefreshKey}`}
              widget={widget}
              doRefresh={doRefresh}
              aoiStripCount={aoiStripCount}
              account={account}
              user={user}
            />
          );
        default:
          console.error('Widget not supported', widget.widgetRef);
          return null;
      }
    },
    [doRefresh, aoiStripCount, account, user, personalizedPathRefreshKey]
  );

  return config.widgets.map((widgetRow: any, index: number) => {
    return (
      <section
        className={styles.widgetsRow}
        key={widgetRow.id}
        style={{ width: widgetRow.parentContainerWidth }}
      >
        {widgetRow.widgets.map((widget: any, innerIndex: any) => {
          return (
            <div
              style={{
                width:
                  widgetRow.widgets.length > 1
                    ? widget.layoutAttributes?.width
                    : widgetRow.parentContainerWidth,
              }}
              key={widget?.layoutAttributes.id}
            >
              {getComponentTemplate(widget)}
            </div>
          );
        })}
      </section>
    );
  });
};

export default ALMSimpleRowLayoutEngine;
