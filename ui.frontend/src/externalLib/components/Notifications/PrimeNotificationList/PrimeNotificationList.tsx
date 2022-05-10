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
import { useRef } from "react";
import { PrimeNotificationItem } from "../PrimeNotificationItem";
import { useLoadMore } from "../../../hooks/loadMore";

import styles from "./PrimeNotificationList.module.css";

const PrimeNotificationsList = (props: any) => {
  const { notifications, loadMoreNotifications, redirectOverviewPage } = props;
  const elementRef = useRef(null);
  useLoadMore({
    items: notifications,
    callback: loadMoreNotifications,
    containerId: "notifications",
    elementRef,
  });
  return (
    <div>
      {/* <div className={styles.unreadCountItem}>
          <div className={styles.unreadCountText}>
            {unreadCount} New
          </div>
          <div className={styles.unreadCountNotificationText}>
            Notifications
          </div>
      </div> */}
      <div className={styles.notificationListBox} id="notifications">
        <ul className={styles.notificationList}>
          {notifications?.map((entry: any) => (
            <PrimeNotificationItem
              notification={entry}
              key={entry.id}
              redirectOverviewPage={redirectOverviewPage}
            ></PrimeNotificationItem>
          ))}
        </ul>
        <div ref={elementRef}></div>
      </div>
    </div>
  );
};

export default PrimeNotificationsList;
