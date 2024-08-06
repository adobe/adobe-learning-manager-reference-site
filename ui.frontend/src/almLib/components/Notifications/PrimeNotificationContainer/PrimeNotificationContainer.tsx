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
import Bell from "@spectrum-icons/workflow/Bell";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useNotifications } from "../../../hooks";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { PrimeNotificationList } from "../PrimeNotificationList";
import { PrimeAnnouncementContainer } from "../PrimeAnnoucementContainer";
import styles from "./PrimeNotificationContainer.module.css";
import { PrimeUserNotification } from "../../../models";

const POLLING_INTERVAL = 60000; //1 MIN
const PrimeNotificationContainer = () => {
  const wrapperRef = useRef<any>(null);
  const { formatMessage } = useIntl();
  const {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    loadMoreNotifications,
    markReadNotification,
    redirectOverviewPage,
    pollUnreadNotificationCount,
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [openAnnouncement, setAnnouncementOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState({} as PrimeUserNotification);
  const toggleShowNotifications = () => {
    setShowNotifications(prevState => !prevState);
  };

  const handleClickOutside = (event: any) => {
    let element = wrapperRef.current;
    if (element && !element.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  const redirectToLoPage = async (notif: any) => {
    await markReadNotification();
    redirectOverviewPage(notif);
  };

  useEffect(() => {
    let timer: any;
    document.addEventListener("click", handleClickOutside, false);

    if (showNotifications) {
      fetchNotifications();
    } else {
      markReadNotification();
      timer = setInterval(pollUnreadNotificationCount, POLLING_INTERVAL);
    }
    return () => {
      timer && clearInterval(timer);
      document.removeEventListener("click", handleClickOutside, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNotifications, pollUnreadNotificationCount, showNotifications]);

  return (
    <ALMErrorBoundary>
      <div ref={wrapperRef} className={styles.notificationDropdown}>
        <button
          type="button"
          className={styles.notificationBellIcon}
          title={formatMessage({
            id: "alm.notifications.icon",
            defaultMessage: "User Notifications",
          })}
          id="userNotificationIcon"
          onClick={toggleShowNotifications}
        >
          {<Bell />}
          {unreadCount > 0 && <div className={styles.notificationCountStyle}>{unreadCount}</div>}
        </button>
        {showNotifications && (
          <PrimeNotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            loadMoreNotifications={loadMoreNotifications}
            redirectOverviewPage={redirectToLoPage}
            setAnnouncementOpen={setAnnouncementOpen}
            setShowNotifications={setShowNotifications}
            setAnnouncementData={setAnnouncementData}
          />
        )}
      </div>
      {openAnnouncement && (
        <PrimeAnnouncementContainer
          setAnnouncementOpen={setAnnouncementOpen}
          notifications={announcementData}
        />
      )}
    </ALMErrorBoundary>
  );
};

export default PrimeNotificationContainer;
