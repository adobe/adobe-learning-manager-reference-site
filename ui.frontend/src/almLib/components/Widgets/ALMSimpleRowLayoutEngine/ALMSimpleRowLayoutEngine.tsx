import { useCallback, useEffect } from "react";
import { PrimeEvent, Widget, WidgetTypeNew } from "../../../utils/widgets/common";
import React from "react";
import { ALMPrimeStrip } from "../ALMPrimeStrip";
import { ALMPrimeRecommendations } from "../ALMPrimeRecommendations";

import { CalendarWidget } from "../../CalendarWidget";
import styles from "./ALMSimpleRowLayoutEngine.module.css";
import { PrimeAccount, PrimeUser } from "../../../models";
import { ALMSocialLearning } from "../ALMSocialLearningWidget";
import { ALMLeaderboard } from "../ALMLeaderboard";
import { ALMCompliance } from "../ALMComplianceWidget";
import { ALMMasthead } from "../../Masthead";
import { sendSkipLinksEvent } from "../ALMPrimeStrip/ALMPrimeStrip.helper";
import { debounce } from "../../../utils/catalog";

const ALMSimpleRowLayoutEngine: React.FC<{
  config: any;
  doRefresh: boolean;
  aoiStripCount: any;
  account: PrimeAccount;
  user: PrimeUser;
}> = ({ config, doRefresh, aoiStripCount, account, user }) => {
  useEffect(() => {
    const debouncedSendSkipLinksData = debounce(sendSkipLinksData, 5000);
    document.addEventListener(PrimeEvent.WIDGETS_TO_RENDER, debouncedSendSkipLinksData);
    //emitting event for the first time to send the skip links data
    debouncedSendSkipLinksData();
    return () => {
      document.removeEventListener(PrimeEvent.WIDGETS_TO_RENDER, debouncedSendSkipLinksData);
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
        case WidgetTypeNew.TRENDING_RECO:
        case WidgetTypeNew.AOI_RECO:
        case WidgetTypeNew.DISCOVERY_RECO:
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

        default:
          console.error("Widget not supported", widget.widgetRef);
          return null;
      }
    },
    [doRefresh, aoiStripCount, account]
  );

  const sendSkipLinksData = () => {
    sendSkipLinksEvent(config.widgets);
  };

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
