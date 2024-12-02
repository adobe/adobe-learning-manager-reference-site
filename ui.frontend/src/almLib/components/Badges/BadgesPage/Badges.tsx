/***
 *
 * Please Do not use this Component.
 */

import { useRef } from "react";
import styles from "./Badges.module.css";
import { useBadges } from "../../../hooks/badges";
import { useLoadMore } from "../../../hooks/loadMore";
import { ALMLoader } from "../../Common/ALMLoader";
import { BadgeList } from "../BadgeList";
import { useIntl } from "react-intl";
import { Provider, lightTheme } from "@adobe/react-spectrum";

const Badges = (props: any) => {
  const { badges, loadMoreBadge, isLoading, handleDownloadPdfClick, handleDownloadImgClick } =
    useBadges();
  const { formatMessage } = useIntl();
  const elementRef = useRef(null);
  useLoadMore({
    items: badges,
    callback: loadMoreBadge,
    containerId: "badges",
    elementRef,
  });

  return (
    <Provider theme={lightTheme} colorScheme="light">
      <div className={styles.dashboardcontainer} id="badges">
        <div className={styles.pagecontainer}>
          <div className={styles.headingContainer}>
            <h1 className={styles.heading}>{formatMessage({ id: "alm.text.badges.header" })}</h1>
            <div className={styles.text}>{formatMessage({ id: "alm.text.badges.summary" })}</div>
          </div>

          <div className={styles.badgebody}>
            <div className={styles.badgecontainer}>
              {isLoading ? (
                <ALMLoader classes={styles.loader} />
              ) : (
                <>
                  <BadgeList
                    badges={badges}
                    handleDownloadPdfClick={handleDownloadPdfClick}
                    handleDownloadImgClick={handleDownloadImgClick}
                  />
                </>
              )}
              <div ref={elementRef}></div>
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default Badges;
