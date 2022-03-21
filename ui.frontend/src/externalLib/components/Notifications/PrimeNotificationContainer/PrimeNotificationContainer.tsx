import Bell from "@spectrum-icons/workflow/Bell";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useNotifications } from "../../../hooks";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import { PrimeNotificationList } from "../PrimeNotificationList";
import styles from "./PrimeNotificationContainer.module.css";

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

  const toggleShowNotifications = () => {
    setShowNotifications((prevState) => !prevState);
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
  }, [
    fetchNotifications,
    // markReadNotification,
    pollUnreadNotificationCount,
    showNotifications,
  ]);

  if (isLoading) {
    return <span></span>;
  }

  const handleClickOutside = (event: any) => {
    let t = wrapperRef.current;
    if (t && !t.contains(event.target)) {
      setShowNotifications(false);
    }
  };

  return (
    <ALMErrorBoundary>
      <div ref={wrapperRef} className={styles.notificationDropdown}>
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
          {unreadCount > 0 && (
            <div className={styles.notificationCountStyle}>{unreadCount}</div>
          )}
        </button>
        {showNotifications && (
          <PrimeNotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            loadMoreNotifications={loadMoreNotifications}
            redirectOverviewPage={redirectOverviewPage}
          />
        )}
      </div>
    </ALMErrorBoundary>
  );
};

export default PrimeNotificationContainer;
