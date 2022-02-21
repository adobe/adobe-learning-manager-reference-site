import { useNotifications } from "../../hooks";
import { PrimeNotificationList } from "../PrimeNotificationList";

import { useState } from "react";
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
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading) {
    return <span>loading notifications...</span>;
  }

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };
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
          loadMoreNotifications={loadMoreNotifications}
        />
      )}
    </div>
  );
};

export default PrimeNotificationContainer;
