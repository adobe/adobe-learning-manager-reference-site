import { useNotifications } from "../../hooks";
import { PrimeNotificationList } from "../PrimeNotificationList";

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./PrimeNotificationContainer.module.css";

import { GEN_NOTIFICATION_SVG } from "../../utils/inline_svg";

const PrimeNotificationContainer = () => {
  const { formatMessage } = useIntl();
  const {
    notifications,
    isLoading,
    unreadCount,
    loadMoreNotifications,
    markReadNotification
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);

  

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };

  useEffect(() => {
    if (showNotifications)
      markReadNotification();
  },[notifications, showNotifications]);

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
        {GEN_NOTIFICATION_SVG()}
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
        />
      )}
    </div>
  );
};

export default PrimeNotificationContainer;
