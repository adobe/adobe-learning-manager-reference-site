import { useNotifications } from "../../hooks";
import { PrimeNotificationList } from "../PrimeNotificationList";

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./PrimeNotificationContainer.module.css";

import Bell from "@spectrum-icons/workflow/Bell";

const PrimeNotificationContainer = () => {
  const { formatMessage } = useIntl();
  const {
    notifications,
    isLoading,
    unreadCount,
    loadMoreNotifications,
    markReadNotification, 
    redirectLoPage,
    pollNotifications
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };
  
  useEffect(() => {
    let timer: any ;

    if (showNotifications) {
      markReadNotification();  
    } else {
      timer = setInterval(pollNotifications, 10*1000);
    }
    return () => timer && clearInterval(timer);
    
  },[markReadNotification, showNotifications]);

  if (isLoading) {
    return <span>loading notifications...</span>;
  }

  return (
    <div className={styles.notificationDropdown}>
      <button
        type="button"
        className={styles.notificationBellIcon}
        title={formatMessage({
          id: "prime.notifications.icon",
          defaultMessage: "User Notifications",
        })}
        id="userNotificationIcon"
        onClick={toggleShowNotifications}
      >
        {<Bell />}
            {unreadCount > 0 && 
            <div className={styles.notificationCountStyle}>
              {unreadCount}
            </div>
            } 
      </button>
      {showNotifications && (
        <PrimeNotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          loadMoreNotifications={loadMoreNotifications}
          redirectLoPage={redirectLoPage}
        />
      )}
    </div>
  );
};

export default PrimeNotificationContainer;
